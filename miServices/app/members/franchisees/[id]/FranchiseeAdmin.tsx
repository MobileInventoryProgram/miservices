'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiKey,
  FiPlus,
  FiPower,
  FiSave,
  FiUserX,
} from 'react-icons/fi';
import type { FranchiseLogin, FranchiseStatus } from '@/lib/franchisees/admin';
import { newLoginKey } from '../loginNotice';
import PasswordNotice from '../PasswordNotice';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700';
const smallButton = 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50';

interface Franchise {
  id: string;
  slug: string;
  companyName: string;
  territory: string;
  postCodes: string;
  townsCities: string;
  mapTown: string;
  tags: string[];
  isHeadOffice: boolean;
}

interface Checklist {
  ownerName: boolean;
  ownerEmail: boolean;
  areas: boolean;
  /** Where the map pin lands, or null */
  mapPin: string | null;
  photo: boolean;
  bio: boolean;
}

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

function Card({ title, children, tone = 'default' }: { title: string; children: React.ReactNode; tone?: 'default' | 'danger' }) {
  return (
    <section className={`rounded-lg border bg-white p-6 shadow-sm ${tone === 'danger' ? 'border-red-200' : 'border-gray-200'}`}>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 font-helvetica">{title}</h2>
      {children}
    </section>
  );
}

// ─── Status and setup checklist ─────────────────────────────────

function StatusCard({ franchise, status, checklist }: { franchise: Franchise; status: FranchiseStatus; checklist: Checklist }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const required = [
    { ok: checklist.ownerName, label: "Owner's name" },
    { ok: checklist.ownerEmail, label: "Owner's email (shown on their page)" },
    { ok: checklist.areas, label: 'Postcodes or towns covered' },
  ];
  const recommended = [
    { ok: !!checklist.mapPin, label: checklist.mapPin ? `Map pin found: ${checklist.mapPin}` : 'Map pin (check the postcodes and first town)' },
    { ok: checklist.photo, label: 'Owner or area photo' },
    { ok: checklist.bio, label: 'About the franchise (Public profile below)' },
  ];
  const ready = required.every((r) => r.ok);

  const setLive = async (show: boolean) => {
    setBusy(true);
    setError('');
    try {
      await send(`/api/admin/franchisees/${franchise.id}`, 'PATCH', { showOnNetwork: show });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const Item = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className="flex items-center gap-2 text-sm">
      {ok ? <FiCheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" /> : <FiCircle className="h-4 w-4 flex-shrink-0 text-gray-300" />}
      <span className={ok ? 'text-gray-700' : 'text-gray-500'}>{label}</span>
    </li>
  );

  return (
    <Card title="Our Network">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-gray-600">
          {status === 'live' && (
            <>
              Live at <strong>/our-network/{franchise.slug}</strong>.
            </>
          )}
          {status === 'hidden' && 'Hidden from the public site while you set it up. The owner can already log in and edit their profile.'}
          {status === 'inactive' && 'This franchise is deactivated, so it is hidden from the public site and its logins are off.'}
        </p>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <a
            href={`/api/admin/franchisees/${franchise.id}/preview`}
            target="_blank"
            rel="noopener"
            className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
          >
            <FiEye className="h-4 w-4" /> Preview page
          </a>
          {status === 'live' && (
            <>
              <a href={`/our-network/${franchise.slug}`} target="_blank" rel="noopener" className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
                <FiExternalLink className="h-4 w-4" /> View live page
              </a>
              {!franchise.isHeadOffice && (
                <button type="button" disabled={busy} onClick={() => setLive(false)} className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
                  <FiEyeOff className="h-4 w-4" /> Hide from Our Network
                </button>
              )}
            </>
          )}
          {status === 'hidden' && (
            <button
              type="button"
              disabled={busy || !ready}
              onClick={() => setLive(true)}
              title={ready ? undefined : 'Finish the required items first'}
              className={`${smallButton} bg-green-600 text-white hover:bg-green-700`}
            >
              <FiEye className="h-4 w-4" /> {busy ? 'Saving…' : 'Show on Our Network'}
            </button>
          )}
        </div>
      </div>

      {status !== 'inactive' && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Needed to go live</p>
            <ul className="space-y-1.5">{required.map((r) => <Item key={r.label} {...r} />)}</ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Recommended</p>
            <ul className="space-y-1.5">{recommended.map((r) => <Item key={r.label} {...r} />)}</ul>
          </div>
        </div>
      )}
      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-red-700" role="alert">
          <FiAlertCircle /> {error}
        </p>
      )}
    </Card>
  );
}

// ─── Franchise details ──────────────────────────────────────────

function DetailsCard({ franchise, status }: { franchise: Franchise; status: FranchiseStatus }) {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: franchise.companyName,
    territory: franchise.territory,
    postCodes: franchise.postCodes,
    townsCities: franchise.townsCities,
    mapTown: franchise.mapTown,
    tags: franchise.tags.join(', '),
    slug: franchise.slug,
  });
  const [editSlug, setEditSlug] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await send(`/api/admin/franchisees/${franchise.id}`, 'PATCH', {
        details: { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean), slug: editSlug ? form.slug : undefined },
      });
      setSaved(true);
      setEditSlug(false);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Franchise details">
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fd-company" className={labelClass}>
              Company name
            </label>
            <input id="fd-company" required maxLength={120} value={form.companyName} onChange={set('companyName')} className={inputClass} />
          </div>
          <div>
            <label htmlFor="fd-territory" className={labelClass}>
              Territory
            </label>
            <input id="fd-territory" required maxLength={80} value={form.territory} onChange={set('territory')} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="fd-postcodes" className={labelClass}>
            Postcodes covered
          </label>
          <textarea id="fd-postcodes" rows={2} value={form.postCodes} onChange={set('postCodes')} className={inputClass} />
          <p className="mt-1 text-xs text-gray-500">Separate with commas. Ranges like CH1-4 and whole areas like BA are fine. Used for the map and postcode search.</p>
        </div>
        <div>
          <label htmlFor="fd-towns" className={labelClass}>
            Towns and cities
          </label>
          <textarea id="fd-towns" rows={2} value={form.townsCities} onChange={set('townsCities')} className={inputClass} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fd-maptown" className={labelClass}>
              Map pin town <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input id="fd-maptown" maxLength={80} value={form.mapTown} onChange={set('mapTown')} placeholder="Defaults to the first town" className={inputClass} />
          </div>
          <div>
            <label htmlFor="fd-tags" className={labelClass}>
              Search tags <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input id="fd-tags" value={form.tags} onChange={set('tags')} placeholder="Separate with commas" className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="fd-slug" className={labelClass}>
            Web address
          </label>
          {editSlug ? (
            <>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                /our-network/
                <input id="fd-slug" required maxLength={96} value={form.slug} onChange={set('slug')} className={inputClass} />
              </div>
              {status === 'live' && <p className="mt-1 text-xs text-amber-700">This page is live: links to the old address will stop working.</p>}
            </>
          ) : (
            <p className="text-sm text-gray-700">
              /our-network/{franchise.slug}
              {!franchise.isHeadOffice && (
                <button type="button" onClick={() => setEditSlug(true)} className="ml-2 text-brand-light-blue hover:text-brand-dark-blue">
                  Change
                </button>
              )}
            </p>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-2 text-sm text-red-700" role="alert">
            <FiAlertCircle /> {error}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={busy} className={`${smallButton} bg-brand-light-blue px-4 py-2 text-white hover:bg-brand-dark-blue`}>
            <FiSave className="h-4 w-4" /> {busy ? 'Saving…' : 'Save details'}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-700">
              <FiCheck className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}

// ─── Logins ─────────────────────────────────────────────────────

function LoginsCard({ franchise, logins, currentMemberId }: { franchise: Franchise; logins: FranchiseLogin[]; currentMemberId: string }) {
  const router = useRouter();
  const [notice, setNotice] = useState<{ email: string; password: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  // A login made with the franchise: its temporary password, shown once
  useEffect(() => {
    try {
      const key = newLoginKey(franchise.id);
      const saved = sessionStorage.getItem(key);
      if (saved) {
        setNotice(JSON.parse(saved));
        sessionStorage.removeItem(key);
      }
    } catch {
      // Storage blocked: Reset password gives a new one
    }
  }, [franchise.id]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    run('add', async () => {
      const data = await send(`/api/admin/franchisees/${franchise.id}/members`, 'POST', { name, email });
      setNotice({ email: data.email, password: data.password });
      setAdding(false);
      setName('');
      setEmail('');
      router.refresh();
    });
  };

  const act = (login: FranchiseLogin, action: 'reset-password' | 'switch-off' | 'switch-on') =>
    run(`${login._id}-${action}`, async () => {
      const data = await send(`/api/admin/franchisees/${franchise.id}/members/${login._id}`, 'PATCH', { action });
      if (action === 'reset-password') setNotice({ email: login.email, password: data.password });
      router.refresh();
    });

  return (
    <Card title="Users">
      <div className="space-y-4">
        {notice && <PasswordNotice {...notice} onClose={() => setNotice(null)} />}

        {logins.length ? (
          <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
            {logins.map((login) => (
              <li key={login._id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className={`font-medium ${login.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {login.name || login.email}
                    {login.role === 'admin' && <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-brand-dark-blue">Head Office admin</span>}
                    {!login.isActive && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">Off</span>}
                  </p>
                  <p className="truncate text-sm text-gray-500">{login.email}</p>
                </div>
                <div className="flex flex-shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => act(login, 'reset-password')}
                    className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
                  >
                    <FiKey className="h-4 w-4" /> {busy === `${login._id}-reset-password` ? 'Resetting…' : 'Reset password'}
                  </button>
                  {login.isActive ? (
                    login._id !== currentMemberId && (
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() => act(login, 'switch-off')}
                        className={`${smallButton} border border-gray-300 bg-white text-red-600 hover:bg-red-50`}
                      >
                        <FiUserX className="h-4 w-4" /> Switch off
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => act(login, 'switch-on')}
                      className={`${smallButton} border border-gray-300 bg-white text-green-700 hover:bg-green-50`}
                    >
                      <FiPower className="h-4 w-4" /> Switch on
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No users yet. Add one so the owner can use the Members Area.</p>
        )}

        <p className="text-xs text-gray-500">
          Head Office admins and everyone else are on the{' '}
          <a href="/members/users" className="text-brand-light-blue hover:text-brand-dark-blue">
            Users
          </a>{' '}
          page.
        </p>

        {adding ? (
          <form onSubmit={add} className="grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label htmlFor="login-name" className={labelClass}>
                Name
              </label>
              <input id="login-name" required autoFocus maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="login-email" className={labelClass}>
                Email
              </label>
              <input id="login-email" type="email" required maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={busy === 'add'} className={`${smallButton} bg-brand-light-blue px-4 py-2 text-white hover:bg-brand-dark-blue`}>
                {busy === 'add' ? 'Adding…' : 'Add user'}
              </button>
              <button type="button" onClick={() => setAdding(false)} className="px-2 py-2 text-sm text-gray-600 hover:text-gray-900">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 text-sm text-brand-light-blue hover:text-brand-dark-blue">
            <FiPlus className="h-4 w-4" /> Add a user
          </button>
        )}

        {error && (
          <p className="flex items-center gap-2 text-sm text-red-700" role="alert">
            <FiAlertCircle /> {error}
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Deactivate / reactivate ────────────────────────────────────

function ActiveCard({
  franchise,
  status,
  records,
}: {
  franchise: Franchise;
  status: FranchiseStatus;
  records: { contacts: number; quotes: number; priceLists: number };
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (franchise.isHeadOffice) return null;

  const setActive = async (isActive: boolean) => {
    setBusy(true);
    setError('');
    try {
      await send(`/api/admin/franchisees/${franchise.id}`, 'PATCH', { isActive });
      setConfirming(false);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const kept = `${records.quotes} quote${records.quotes === 1 ? '' : 's'}, ${records.contacts} contact${records.contacts === 1 ? '' : 's'} and ${records.priceLists} price list${records.priceLists === 1 ? '' : 's'}`;

  return status === 'inactive' ? (
    <Card title="Reactivate franchise">
      <p className="text-sm text-gray-600">Reactivating switches its logins back on. It stays hidden from Our Network until you show it again.</p>
      <button type="button" disabled={busy} onClick={() => setActive(true)} className={`${smallButton} mt-4 bg-green-600 text-white hover:bg-green-700`}>
        <FiPower className="h-4 w-4" /> {busy ? 'Reactivating…' : 'Reactivate'}
      </button>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </Card>
  ) : (
    <Card title="Franchise leaving?" tone="danger">
      <p className="text-sm text-gray-600">
        Deactivating hides it from Our Network and switches off all its logins. Its {kept} are kept, and you can reactivate it later.
      </p>
      {confirming ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-700">Deactivate {franchise.territory || franchise.companyName}?</span>
          <button type="button" disabled={busy} onClick={() => setActive(false)} className={`${smallButton} bg-red-600 text-white hover:bg-red-700`}>
            {busy ? 'Deactivating…' : 'Yes, deactivate'}
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className={`${smallButton} mt-4 border border-red-200 bg-white text-red-600 hover:bg-red-50`}>
          <FiPower className="h-4 w-4" /> Deactivate franchise
        </button>
      )}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </Card>
  );
}

/** Head Office's controls for one franchise (the public profile form sits below) */
export default function FranchiseeAdmin({
  franchise,
  status,
  checklist,
  logins,
  records,
  currentMemberId,
}: {
  franchise: Franchise;
  status: FranchiseStatus;
  checklist: Checklist;
  logins: FranchiseLogin[];
  records: { contacts: number; quotes: number; priceLists: number };
  currentMemberId: string;
}) {
  return (
    <div className="space-y-6">
      <StatusCard franchise={franchise} status={status} checklist={checklist} />
      <LoginsCard franchise={franchise} logins={logins} currentMemberId={currentMemberId} />
      <DetailsCard franchise={franchise} status={status} />
      <ActiveCard franchise={franchise} status={status} records={records} />
    </div>
  );
}
