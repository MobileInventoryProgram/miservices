import Link from 'next/link';
import { listOptions } from '@/lib/marketing/campaigns';
import { LISTS, type ListKey } from '@/lib/marketing/lists';
import { isMarketingConfigured, segmentContacts, type ResendContact } from '@/lib/marketing/resend';
import { sanityWriteClient } from '@/lib/sanity';
import { Empty, ErrorBox, num, Panel, tableHead, tableWrap, td, th } from '../../servicem8/ui';
import { when } from '../format';
import { adminOnly } from '../guard';
import SyncButton from './SyncButton';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;
type SearchParams = Record<string, string | string[] | undefined>;
const param = (sp: SearchParams, key: string) => {
  const v = sp[key];
  return (Array.isArray(v) ? v[0] : v) || '';
};

export default async function ListsPage({ searchParams }: { searchParams: SearchParams }) {
  await adminOnly();
  const chosen = (param(searchParams, 'list') in LISTS ? param(searchParams, 'list') : 'customers') as ListKey;
  const after = param(searchParams, 'after') || undefined;

  if (!isMarketingConfigured()) return <p className="text-sm text-gray-600">The lists appear here once Resend is connected.</p>;

  let lists: Awaited<ReturnType<typeof listOptions>> = [];
  let page: { contacts: ResendContact[]; hasMore: boolean } | null = null;
  let crm = new Map<string, string>();
  let error: string | null = null;
  try {
    lists = await listOptions();
    const id = lists.find((l) => l.key === chosen)?.id;
    if (id) {
      page = await segmentContacts(id, { limit: PAGE_SIZE, after });
      // People who are also CRM contacts link to them
      const emails = page.contacts.map((c) => c.email.toLowerCase());
      const found = await sanityWriteClient.fetch<{ _id: string; email: string }[]>(`*[_type == "contact" && lower(email) in $emails && !(_id in path("drafts.**"))]{ _id, "email": lower(email) }`, {
        emails,
      });
      crm = new Map(found.map((f) => [f.email, f._id]));
    }
  } catch (err) {
    console.error('Loading lists failed:', err);
    error = 'Could not load the lists from Resend. Try again in a minute.';
  }
  if (error) return <ErrorBox message={error} />;
  const current = lists.find((l) => l.key === chosen);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {lists.map((l) => (
          <Link
            key={l.key}
            href={`/members/marketing/lists?list=${l.key}`}
            aria-current={l.key === chosen ? 'true' : undefined}
            className={`rounded-lg border bg-white p-4 shadow-sm transition-colors hover:border-brand-light-blue ${l.key === chosen ? 'border-brand-dark-blue ring-1 ring-brand-dark-blue' : 'border-gray-200'}`}
          >
            <p className="font-medium text-gray-900">{l.name}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 font-helvetica">{l.subscribers === null ? '—' : num(l.subscribers)}</p>
            <p className="text-xs text-gray-500">
              {l.id ? `subscribed${l.unsubscribed ? `, ${num(l.unsubscribed)} unsubscribed` : ''}` : 'Not set up in Resend yet'}
            </p>
            <p className="mt-2 text-xs text-gray-500">{LISTS[l.key].description}</p>
          </Link>
        ))}
      </div>

      <Panel
        title={current?.name || 'List'}
        intro={
          chosen === 'customers'
            ? 'CRM contacts join when “Happy to receive marketing emails” is ticked; website visitors join when they tick marketing on a form.'
            : chosen === 'network'
              ? 'Kept in step with franchise owners and active franchisee logins. It also updates itself before each campaign to this list.'
              : 'People who asked for the franchise prospectus and ticked marketing.'
        }
        actions={
          chosen === 'network' ? (
            <SyncButton list="network" label="Sync the network now" />
          ) : chosen === 'customers' ? (
            <SyncButton list="contacts" label="Re-sync CRM contacts" />
          ) : undefined
        }
      >
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Email</th>
                <th scope="col" className={th}>Name</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(page?.contacts || []).map((c) => {
                const crmId = crm.get(c.email.toLowerCase());
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className={`${td} break-all`}>
                      {crmId ? (
                        <Link href={`/members/contacts/${crmId}`} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                          {c.email}
                        </Link>
                      ) : (
                        c.email
                      )}
                    </td>
                    <td className={td}>{[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}</td>
                    <td className={td}>{c.unsubscribed ? <span className="text-gray-500">Unsubscribed</span> : <span className="text-green-700">Subscribed</span>}</td>
                    <td className={`${td} whitespace-nowrap text-gray-500`}>{when(c.created_at)}</td>
                  </tr>
                );
              })}
              {!page?.contacts.length && <Empty colSpan={4}>Nobody on this list yet.</Empty>}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 text-sm">
          {after && (
            <Link href={`/members/marketing/lists?list=${chosen}`} className="text-brand-light-blue hover:text-brand-dark-blue">
              ← Back to the start
            </Link>
          )}
          {page?.hasMore && (
            <Link
              href={`/members/marketing/lists?list=${chosen}&after=${encodeURIComponent(page.contacts[page.contacts.length - 1].id)}`}
              className="ml-auto text-brand-light-blue hover:text-brand-dark-blue"
            >
              Next {PAGE_SIZE} →
            </Link>
          )}
        </div>
      </Panel>
      <p className="text-xs text-gray-500">Counts come from Resend and can be up to 15 minutes behind. Unsubscribes are handled by Resend’s own link in every email.</p>
    </>
  );
}
