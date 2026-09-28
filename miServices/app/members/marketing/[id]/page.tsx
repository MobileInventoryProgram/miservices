import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { companyDetails, getCampaign, listOptions } from '@/lib/marketing/campaigns';
import { LISTS } from '@/lib/marketing/lists';
import { broadcastClickedLinks, broadcastRecipients, type RecipientType } from '@/lib/marketing/resend';
import { Empty, num, Panel, pct, Stat, StatGrid, tableHead, tableWrap, td, th } from '../../servicem8/ui';
import CampaignStatus from '../CampaignStatus';
import Composer from '../Composer';
import { when } from '../format';
import { adminOnly } from '../guard';
import { MARKETING_BASE } from '../tabs';
import CancelSchedule from './CancelSchedule';

export const dynamic = 'force-dynamic';

const COUNTED: RecipientType[] = ['delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed'];

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const session = await adminOnly();
  const campaign = await getCampaign(params.id);
  if (!campaign) notFound();

  // Drafts open in the composer
  if (campaign.status === 'draft' && !campaign.external) {
    const [company, lists] = await Promise.all([companyDetails(), listOptions()]);
    return (
      <Composer
        initial={{ id: campaign.id, name: campaign.name, list: campaign.list, subject: campaign.subject, previewText: campaign.previewText, blocks: campaign.blocks }}
        company={company}
        lists={lists}
        adminFirstName={(session.user.name || '').split(' ')[0] || 'there'}
        adminEmail={session.user.email || ''}
      />
    );
  }

  const sent = campaign.status === 'sent' || campaign.status === 'sending' || campaign.status === 'queued';
  let results: { counts: Record<string, number>; more: Record<string, boolean>; links: { url: string; clicks: number; unique_clicks: number }[]; bounced: { email: string; bounce_type?: string }[] } | null =
    null;
  if (sent) {
    try {
      const [lists, links] = await Promise.all([Promise.all(COUNTED.map((t) => broadcastRecipients(campaign.id, t, 1000))), broadcastClickedLinks(campaign.id)]);
      results = {
        counts: Object.fromEntries(COUNTED.map((t, i) => [t, lists[i].recipients.length])),
        more: Object.fromEntries(COUNTED.map((t, i) => [t, lists[i].more])),
        links,
        bounced: lists[COUNTED.indexOf('bounced')].recipients.slice(0, 50),
      };
    } catch (error) {
      console.error('Campaign results failed:', error);
    }
  }
  const delivered = results?.counts.delivered || 0;
  const plus = (t: string) => (results?.more[t] ? '+' : '');

  return (
    <>
      <Link href={MARKETING_BASE} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <FiArrowLeft className="h-4 w-4" /> All campaigns
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900 font-helvetica">{campaign.name || 'Untitled campaign'}</h2>
        <CampaignStatus status={campaign.status} />
      </div>
      <p className="text-sm text-gray-600">
        <strong>{campaign.subject}</strong> to the {LISTS[campaign.list].name} list.{' '}
        {campaign.status === 'scheduled' ? `Scheduled for ${when(campaign.scheduledAt)}.` : campaign.sentAt ? `Sent ${when(campaign.sentAt)}.` : ''}
      </p>

      {campaign.status === 'scheduled' && <CancelSchedule id={campaign.id} />}
      {campaign.status === 'draft' && campaign.external && <p className="text-sm text-gray-600">This draft was made in Resend’s own editor, so edit and send it there.</p>}

      {sent &&
        (results ? (
          <>
            <StatGrid>
              <Stat label="Delivered" value={`${num(delivered)}${plus('delivered')}`} detail={`${num(results.counts.bounced)}${plus('bounced')} bounced`} />
              <Stat label="Opened" value={pct(delivered ? results.counts.opened / delivered : null)} detail={`${num(results.counts.opened)}${plus('opened')} people. Some email apps hide opens.`} />
              <Stat label="Clicked" value={pct(delivered ? results.counts.clicked / delivered : null)} detail={`${num(results.counts.clicked)}${plus('clicked')} people`} />
              <Stat
                label="Unsubscribed"
                value={num(results.counts.unsubscribed)}
                detail={`${num(results.counts.complained)} marked it as spam`}
                tone={results.counts.complained ? 'red' : results.counts.unsubscribed ? 'amber' : 'default'}
              />
            </StatGrid>

            <Panel title="Links clicked">
              <div className={tableWrap}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={tableHead}>
                      <th scope="col" className={th}>Link</th>
                      <th scope="col" className={`${th} text-right`}>People</th>
                      <th scope="col" className={`${th} text-right`}>Clicks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.links.map((l) => (
                      <tr key={l.url}>
                        <td className={`${td} max-w-md break-all`}>{l.url}</td>
                        <td className={`${td} text-right`}>{num(l.unique_clicks)}</td>
                        <td className={`${td} text-right`}>{num(l.clicks)}</td>
                      </tr>
                    ))}
                    {results.links.length === 0 && <Empty colSpan={3}>No clicks yet.</Empty>}
                  </tbody>
                </table>
              </div>
            </Panel>

            {results.bounced.length > 0 && (
              <Panel title="Bounced" intro="These addresses couldn’t be delivered to. Check them in Contacts.">
                <ul className="rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm">
                  {results.bounced.map((b) => (
                    <li key={b.email} className="py-0.5">
                      {b.email} <span className="text-gray-500">{b.bounce_type ? `(${b.bounce_type})` : ''}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
            <p className="text-xs text-gray-500">Figures come from Resend and can be up to 15 minutes behind.</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Results aren’t available from Resend right now. Try again in a few minutes.</p>
        ))}

      <Panel title="The email">
        <iframe title="Campaign email" srcDoc={campaign.html} sandbox="" className="h-[60vh] min-h-[420px] w-full rounded-lg border border-gray-200 bg-white shadow-sm" />
      </Panel>
    </>
  );
}
