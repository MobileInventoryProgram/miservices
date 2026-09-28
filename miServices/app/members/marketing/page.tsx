import Link from 'next/link';
import { FiPlus, FiSend } from 'react-icons/fi';
import { listCampaigns, type CampaignSummary } from '@/lib/marketing/campaigns';
import { LISTS } from '@/lib/marketing/lists';
import { isMarketingConfigured } from '@/lib/marketing/resend';
import { Empty, ErrorBox, tableHead, tableWrap, td, th } from '../servicem8/ui';
import CampaignStatus from './CampaignStatus';
import { when } from './format';
import { adminOnly } from './guard';
import { MARKETING_BASE } from './tabs';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  await adminOnly();
  let campaigns: CampaignSummary[] = [];
  let error: string | null = null;
  if (isMarketingConfigured()) {
    try {
      campaigns = await listCampaigns();
    } catch (err) {
      console.error('Listing campaigns failed:', err);
      error = 'Could not load campaigns from Resend. Try again in a minute.';
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Write a campaign, send yourself a test, then send it or schedule it. Resend keeps drafts and does the sending.</p>
        <Link
          href={`${MARKETING_BASE}/new`}
          className="inline-flex items-center gap-2 rounded-md bg-brand-dark-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-light-blue"
        >
          <FiPlus className="h-4 w-4" /> New campaign
        </Link>
      </div>

      {error ? (
        <ErrorBox message={error} />
      ) : (
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Campaign</th>
                <th scope="col" className={th}>List</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Sent or scheduled</th>
                <th scope="col" className={th}>Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className={td}>
                    <Link href={`${MARKETING_BASE}/${c.id}`} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                      {c.name}
                    </Link>
                  </td>
                  <td className={td}>{c.list ? LISTS[c.list].name : 'Other list'}</td>
                  <td className={td}>
                    <CampaignStatus status={c.status} />
                  </td>
                  <td className={`${td} whitespace-nowrap`}>{when(c.sentAt || c.scheduledAt)}</td>
                  <td className={`${td} whitespace-nowrap text-gray-500`}>{when(c.createdAt)}</td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <Empty colSpan={5}>
                  <span className="inline-flex items-center gap-2">
                    <FiSend className="h-4 w-4" /> No campaigns yet.
                  </span>
                </Empty>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
