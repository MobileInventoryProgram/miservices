const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export const isEmail = (value: string) => EMAIL.test(value);

export interface NewFranchiseInput {
  companyName: string;
  territory: string;
  postCodes: string;
  townsCities: string;
  owner: { firstName: string; lastName: string; email: string; phone: string };
  createLogin: boolean;
}

/** A new franchise from Head Office's form, or what's missing */
export function readNewFranchise(body: Record<string, unknown>): { input: NewFranchiseInput } | { error: string } {
  const owner = (body.owner && typeof body.owner === 'object' ? body.owner : {}) as Record<string, unknown>;
  const input: NewFranchiseInput = {
    companyName: text(body.companyName, 120),
    territory: text(body.territory, 80),
    postCodes: text(body.postCodes, 2000),
    townsCities: text(body.townsCities, 2000),
    owner: {
      firstName: text(owner.firstName, 60),
      lastName: text(owner.lastName, 60),
      email: text(owner.email, 120),
      phone: text(owner.phone, 40),
    },
    createLogin: body.createLogin !== false,
  };
  if (!input.companyName) return { error: 'Please give the company name.' };
  if (!input.territory) return { error: 'Please give the territory name.' };
  if (!input.owner.firstName || !input.owner.lastName) return { error: "Please give the owner's first and last name." };
  if (!isEmail(input.owner.email)) return { error: "Please give the owner's email address." };
  return { input };
}

export interface FranchiseDetailsInput {
  companyName: string;
  territory: string;
  postCodes: string;
  townsCities: string;
  mapTown: string;
  tags: string[];
  slug?: string;
}

/** Head Office's franchise details form, or what's wrong */
export function readFranchiseDetails(body: Record<string, unknown>): { input: FranchiseDetailsInput } | { error: string } {
  const input: FranchiseDetailsInput = {
    companyName: text(body.companyName, 120),
    territory: text(body.territory, 80),
    postCodes: text(body.postCodes, 2000),
    townsCities: text(body.townsCities, 2000),
    mapTown: text(body.mapTown, 80),
    tags: Array.isArray(body.tags)
      ? Array.from(new Set(body.tags.filter((t): t is string => typeof t === 'string').map((t) => t.trim().slice(0, 40)).filter(Boolean))).slice(0, 30)
      : [],
  };
  if (typeof body.slug === 'string' && body.slug.trim()) {
    const slug = body.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 96) {
      return { error: 'The web address can only use lower-case letters, numbers and single hyphens.' };
    }
    input.slug = slug;
  }
  if (!input.companyName) return { error: 'Please give the company name.' };
  if (!input.territory) return { error: 'Please give the territory name.' };
  return { input };
}
