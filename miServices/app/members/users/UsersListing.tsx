'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiKey, FiPlus, FiPower, FiSearch, FiUserX, FiX } from 'react-icons/fi';
import PageHeader, { headerPrimaryButton } from '@/components/members/PageHeader';
import Pagination from '@/components/members/Pagination';
import { usePagedList } from '@/components/members/usePagedList';
import type { UserRow } from '@/lib/franchisees/admin';
import { TABLE_PAGE_SIZE } from '@/lib/pagination';
import PasswordNotice from '../franchisees/PasswordNotice';

const selectClass =
  'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700';
const smallButton = 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50';

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

/** Add a franchise user or a Head Office admin */
function AddUserForm({
  franchises,
  initialFranchise,
  onAdded,
  onClose,
}: {
  franchises: { id: string; name: string }[];
  initialFranchise: string;
  onAdded: (login: { email: string; password: string }) => void;
  onClose: () => void;
}) {
  const [role, setRole] = useState<'franchisee' | 'admin'>('franchisee');
  const [franchiseeId, setFranchiseeId] = useState(initialFranchise);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await send('/api/admin/users', 'POST', { name, email, role, franchiseeId: role === 'franchisee' ? franchiseeId : undefined });
      onAdded({ email: data.email, password: data.password });
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4 rounded-lg border border-brand-light-blue/40 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 font-helvetica">Add user</h2>
        <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Close">
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <fieldset>
        <legend className={labelClass}>Type of user</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { value: 'franchisee' as const, title: 'Franchise user', text: 'An owner or member of staff. Sees their own franchise only.' },
            { value: 'admin' as const, title: 'Head Office admin', text: 'Sees and manages every franchise, and all of the Head Office pages.' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer gap-3 rounded-md border p-3 text-sm ${
                role === option.value ? 'border-brand-dark-blue bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                className="mt-0.5 h-4 w-4 border-gray-300 text-brand-dark-blue focus:ring-brand-light-blue"
              />
              <span>
                <span className="block font-medium text-gray-900">{option.title}</span>
                <span className="block text-gray-500">{option.text}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        {role === 'franchisee' && (
          <div>
            <label htmlFor="user-franchise" className={labelClass}>
              Franchise
            </label>
            <select id="user-franchise" required value={franchiseeId} onChange={(e) => setFranchiseeId(e.target.value)} className={`${inputClass} bg-white`}>
              <option value="">Choose a franchise</option>
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="user-name" className={labelClass}>
            Name
          </label>
          <input id="user-name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="user-email" className={labelClass}>
            Email
          </label>
          <input id="user-email" type="email" required maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
      </div>

      {role === 'admin' && (
        <p className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          <FiAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          Admins can see every franchise&apos;s quotes, contacts and staff timesheets, and add or switch off other users. Only add people at Head Office.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-2 text-sm text-red-700" role="alert">
          <FiAlertCircle /> {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={`${smallButton} bg-brand-light-blue px-4 py-2 text-white hover:bg-brand-dark-blue`}>
          <FiPlus className="h-4 w-4" /> {busy ? 'Adding…' : role === 'admin' ? 'Add admin' : 'Add user'}
        </button>
        <span className="text-xs text-gray-500">A temporary password is shown once for you to pass on.</span>
      </div>
    </form>
  );
}

/** Head Office: every Members Area login */
export default function UsersListing({
  users,
  franchises,
  currentMemberId,
  initialFranchise,
}: {
  users: UserRow[];
  franchises: { id: string; name: string }[];
  currentMemberId: string;
  initialFranchise: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('active');
  const [adding, setAdding] = useState(!!initialFranchise);
  const [notice, setNotice] = useState<{ email: string; password: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!role || u.role === role) &&
        (!status || (status === 'active' ? u.isActive : !u.isActive)) &&
        (!q || [u.name, u.email, u.franchiseName || ''].some((v) => v.toLowerCase().includes(q)))
    );
  }, [users, query, role, status]);
  const page = usePagedList(filtered, TABLE_PAGE_SIZE);
  const admins = users.filter((u) => u.role === 'admin' && u.isActive).length;

  const act = async (user: UserRow, action: 'reset-password' | 'switch-off' | 'switch-on') => {
    setBusy(`${user._id}-${action}`);
    setError('');
    try {
      const data = await send(`/api/admin/users/${user._id}`, 'PATCH', { action });
      if (action === 'reset-password') setNotice({ email: user.email, password: data.password });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Users"
        intro={`Everyone who can sign in to the Members Area · ${admins} Head Office admin${admins === 1 ? '' : 's'}`}
        actions={
          !adding && (
            <button type="button" onClick={() => setAdding(true)} className={headerPrimaryButton}>
              <FiPlus className="h-4 w-4" /> Add user
            </button>
          )
        }
      />

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        {notice && <PasswordNotice {...notice} onClose={() => setNotice(null)} />}
        {adding && (
          <AddUserForm
            franchises={franchises}
            initialFranchise={initialFranchise}
            onClose={() => setAdding(false)}
            onAdded={(login) => {
              setNotice(login);
              setAdding(false);
              router.refresh();
            }}
          />
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <label htmlFor="user-search" className="sr-only">
              Search users
            </label>
            <input
              id="user-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or franchise"
              className={`${selectClass} w-full pl-9`}
            />
          </div>
          <label htmlFor="user-role" className="sr-only">
            Type
          </label>
          <select id="user-role" value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
            <option value="">All users</option>
            <option value="admin">Head Office admins</option>
            <option value="franchisee">Franchise users</option>
          </select>
          <label htmlFor="user-status" className="sr-only">
            Status
          </label>
          <select id="user-status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="active">Switched on</option>
            <option value="off">Switched off</option>
            <option value="">On and off</option>
          </select>
        </div>

        {error && (
          <p className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <FiAlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </p>
        )}

        <div ref={page.topRef} className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <th scope="col" className="px-4 py-3 font-semibold">User</th>
                <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                <th scope="col" className="px-4 py-3 font-semibold">Franchise</th>
                <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {page.items.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className={`font-medium ${u.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {u.name || u.email}
                      {u._id === currentMemberId && <span className="ml-2 text-xs font-normal text-gray-500">(you)</span>}
                      {!u.isActive && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-normal text-gray-600">Off</span>}
                    </p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-brand-dark-blue">Head Office admin</span>
                    ) : (
                      <span className="text-gray-700">Franchise user</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {u.franchiseId ? (
                      <Link href={`/members/franchisees/${u.franchiseId}`} className="text-brand-dark-blue hover:text-brand-light-blue">
                        {u.franchiseName || 'Franchise'}
                      </Link>
                    ) : (
                      u.franchiseName || '—'
                    )}
                    {u.franchiseInactive && <span className="ml-1.5 text-xs text-gray-400">(deactivated)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() => act(u, 'reset-password')}
                        className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
                      >
                        <FiKey className="h-4 w-4" /> {busy === `${u._id}-reset-password` ? 'Resetting…' : 'Reset password'}
                      </button>
                      {u.isActive
                        ? u._id !== currentMemberId && (
                            <button
                              type="button"
                              disabled={!!busy}
                              onClick={() => act(u, 'switch-off')}
                              className={`${smallButton} border border-gray-300 bg-white text-red-600 hover:bg-red-50`}
                            >
                              <FiUserX className="h-4 w-4" /> Switch off
                            </button>
                          )
                        : !u.franchiseInactive && (
                            <button
                              type="button"
                              disabled={!!busy}
                              onClick={() => act(u, 'switch-on')}
                              className={`${smallButton} border border-gray-300 bg-white text-green-700 hover:bg-green-50`}
                            >
                              <FiPower className="h-4 w-4" /> Switch on
                            </button>
                          )}
                    </div>
                  </td>
                </tr>
              ))}
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No users match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination {...page} noun={page.total === 1 ? 'user' : 'users'} onPageChange={page.setPage} />
      </div>
    </div>
  );
}
