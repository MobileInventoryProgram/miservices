import 'server-only';
import { randomInt } from 'crypto';
import { hashPassword } from '@/lib/auth';
import { slugify } from '@/lib/documents/validate';
import { getNetworkGeo } from '@/lib/network/geo';
import { sanityWriteClient } from '@/lib/sanity';

/** Where a franchise stands: on the public site, set up but hidden, or left */
export type FranchiseStatus = 'live' | 'hidden' | 'inactive';

export function franchiseStatus(f: { isActive?: boolean | null; showOnNetwork?: boolean | null }): FranchiseStatus {
  if (f.isActive === false) return 'inactive';
  return f.showOnNetwork === false ? 'hidden' : 'live';
}

export const HEAD_OFFICE_SLUG = 'head-office';

export interface FranchiseRow {
  _id: string;
  companyName: string;
  slug: string;
  territory: string;
  townsCities: string;
  ownerName: string;
  ownerEmail: string;
  status: FranchiseStatus;
  logins: number;
  activeLogins: number;
  isHeadOffice: boolean;
}

/** Every franchise, for Head Office's list */
export async function listFranchisees(): Promise<FranchiseRow[]> {
  const rows = await sanityWriteClient.fetch<(Omit<FranchiseRow, 'status' | 'isHeadOffice'> & { isActive?: boolean; showOnNetwork?: boolean })[]>(
    `*[_type == "franchisee" && !(_id in path("drafts.**"))] | order(lower(coalesce(territory, companyName)) asc) {
      _id, "companyName": coalesce(companyName, ""), "slug": coalesce(slug.current, ""), "territory": coalesce(territory, ""),
      "townsCities": coalesce(townsCities, ""), isActive, showOnNetwork,
      "ownerName": coalesce(owners[0].firstName + " " + owners[0].lastName, ""), "ownerEmail": coalesce(owners[0].email, ""),
      "logins": count(*[_type == "member" && franchisee._ref == ^._id]),
      "activeLogins": count(*[_type == "member" && franchisee._ref == ^._id && isActive == true])
    }`
  );
  return rows.map(({ isActive, showOnNetwork, ...r }) => ({
    ...r,
    status: franchiseStatus({ isActive, showOnNetwork }),
    isHeadOffice: r.slug === HEAD_OFFICE_SLUG,
  }));
}

export interface FranchiseLogin {
  _id: string;
  name: string;
  email: string;
  role: 'franchisee' | 'admin';
  isActive: boolean;
}

export interface FranchiseAdminDetail {
  status: FranchiseStatus;
  logins: FranchiseLogin[];
  /** Kept when the franchise is deactivated */
  records: { contacts: number; quotes: number; priceLists: number };
}

export async function getFranchiseAdminDetail(id: string): Promise<FranchiseAdminDetail | null> {
  const doc = await sanityWriteClient.fetch<{
    isActive?: boolean;
    showOnNetwork?: boolean;
    logins: FranchiseLogin[];
    contacts: number;
    quotes: number;
    priceLists: number;
  } | null>(
    `*[_type == "franchisee" && _id == $id][0] {
      isActive, showOnNetwork,
      "logins": *[_type == "member" && franchisee._ref == ^._id] | order(name asc) {
        _id, "name": coalesce(name, ""), email, role, "isActive": isActive == true
      },
      "contacts": count(*[_type == "contact" && franchise._ref == ^._id]),
      "quotes": count(*[_type == "quote" && franchise._ref == ^._id]),
      "priceLists": count(*[_type == "priceList" && owner._ref == ^._id])
    }`,
    { id }
  );
  if (!doc) return null;
  return {
    status: franchiseStatus(doc),
    logins: doc.logins,
    records: { contacts: doc.contacts, quotes: doc.quotes, priceLists: doc.priceLists },
  };
}

/** A web address no other franchise uses */
export async function uniqueFranchiseSlug(name: string, exceptId?: string): Promise<string> {
  const base = slugify(name).slice(0, 80) || 'franchise';
  const taken = new Set(
    await sanityWriteClient.fetch<string[]>(`*[_type == "franchisee" && _id != $exceptId].slug.current`, { exceptId: exceptId || '' })
  );
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export async function slugTaken(slug: string, exceptId: string): Promise<boolean> {
  return sanityWriteClient.fetch<boolean>(`count(*[_type == "franchisee" && slug.current == $slug && _id != $exceptId]) > 0`, { slug, exceptId });
}

/** Where the map pin lands, or null if the postcodes/towns don't give one */
export async function mapPinFor(f: { slug: string; postCodes?: string; townsCities?: string; mapTown?: string }): Promise<string | null> {
  if (!f.postCodes?.trim() && !f.townsCities?.trim() && !f.mapTown?.trim()) return null;
  const geo = await getNetworkGeo([{ slug: f.slug || 'new', postCodes: f.postCodes, townsCities: f.townsCities, mapTown: f.mapTown }]);
  const found = geo[f.slug || 'new'];
  return found ? found.town || found.region || 'the area covered' : null;
}

// ─── Logins ─────────────────────────────────────────────────────

/** Easy to read out or type: no 0/O, 1/l/I */
const PASSWORD_CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function temporaryPassword(length = 12): string {
  return Array.from({ length }, () => PASSWORD_CHARS[randomInt(PASSWORD_CHARS.length)]).join('');
}

export const normaliseEmail = (email: string) => email.trim().toLowerCase();

export async function emailInUse(email: string, exceptMemberId?: string): Promise<boolean> {
  return sanityWriteClient.fetch<boolean>(`count(*[_type == "member" && lower(email) == $email && _id != $except]) > 0`, {
    email: normaliseEmail(email),
    except: exceptMemberId || '',
  });
}

/** A new franchise login; returns its temporary password (shown once, never stored in plain text) */
export async function createFranchiseLogin(franchise: { _id: string; territory?: string }, name: string, email: string) {
  return createLogin({ name, email, role: 'franchisee', franchise });
}

/**
 * A new login. Franchise users belong to a franchise; Head Office admins
 * don't (they see every franchise). Returns the temporary password, once.
 */
export async function createLogin({
  name,
  email,
  role,
  franchise,
}: {
  name: string;
  email: string;
  role: 'franchisee' | 'admin';
  franchise?: { _id: string; territory?: string } | null;
}) {
  const password = temporaryPassword();
  const doc = await sanityWriteClient.create({
    _type: 'member',
    name: name.trim(),
    email: normaliseEmail(email),
    hashedPassword: await hashPassword(password),
    role,
    ...(role === 'franchisee' && franchise
      ? { franchisee: { _type: 'reference', _ref: franchise._id }, territory: franchise.territory || '' }
      : {}),
    isActive: true,
  });
  return { memberId: doc._id, password };
}

export interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: 'franchisee' | 'admin';
  isActive: boolean;
  franchiseId: string | null;
  franchiseName: string | null;
  /** The franchise is deactivated, so this login can't be switched on by itself */
  franchiseInactive: boolean;
}

/** Every Members Area login, for Head Office */
export async function listUsers(): Promise<UserRow[]> {
  return sanityWriteClient.fetch<UserRow[]>(
    `*[_type == "member" && !(_id in path("drafts.**"))] | order(role asc, lower(coalesce(name, email)) asc) {
      _id, "name": coalesce(name, ""), "email": coalesce(email, ""), "role": coalesce(role, "franchisee"),
      "isActive": isActive == true,
      "franchiseId": franchisee._ref,
      "franchiseName": coalesce(franchisee->territory, franchisee->companyName, territory),
      "franchiseInactive": defined(franchisee) && franchisee->isActive != true
    }`
  );
}

/** Whether switching this login off would leave no Head Office admin able to sign in */
export async function isLastActiveAdmin(memberId: string): Promise<boolean> {
  return sanityWriteClient.fetch<boolean>(
    `*[_id == $id][0].role == "admin" && count(*[_type == "member" && role == "admin" && isActive == true && _id != $id]) == 0`,
    { id: memberId }
  );
}
