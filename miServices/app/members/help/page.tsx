import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { CmsIcon } from '@/lib/cms/icons';
import { getHelpContact } from '@/lib/cms/members';
import { getHelpForSession } from '@/lib/help/access';
import { getDocumentIndex, searchHelp } from '@/lib/help/search';
import { HELP_TOPICS } from '@/lib/help/topics';
import HelpAdminBar from './HelpAdminBar';
import HelpHome from './HelpHome';
import StillStuck from './StillStuck';

export const metadata: Metadata = {
  title: 'Help Centre | Members Area | miServices',
};

export default async function HelpCentrePage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');

  const q = (searchParams.q || '').trim().slice(0, 200);
  const { isAdmin, articles, visibleDocIds } = await getHelpForSession(session);
  const [contact, initial, index] = await Promise.all([
    getHelpContact(),
    q ? searchHelp(q, articles, visibleDocIds) : Promise.resolve(null),
    isAdmin ? getDocumentIndex() : Promise.resolve(null),
  ]);

  const counts = new Map<string, number>();
  for (const a of articles) counts.set(a.topic, (counts.get(a.topic) || 0) + 1);
  const topics = HELP_TOPICS.filter((t) => counts.get(t.value) || isAdmin);
  // The first question from each topic, as a starting point
  const common = HELP_TOPICS.flatMap((t) => articles.find((a) => a.topic === t.value && a.isPublished) || []).slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Help Centre" intro="Quick answers from the Members Area documents, with links to the full details." width="5xl" />

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {isAdmin && index && <HelpAdminBar outlines={index.outlines} />}

        <HelpHome initial={initial} noResults={<StillStuck phone={contact.phone} email={contact.email} query={q} />}>
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 font-semibold text-gray-900 font-helvetica">Browse by topic</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topics.map((t) => (
                  <Link
                    key={t.value}
                    href={`/members/help/topic/${t.value}`}
                    className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                  >
                    <span className="rounded-lg bg-blue-50 p-2.5 text-brand-dark-blue">
                      <CmsIcon name={t.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-gray-900 group-hover:text-brand-dark-blue">{t.title}</span>
                      <span className="block text-sm text-gray-500">{t.description}</span>
                      <span className="mt-1 block text-xs text-gray-400">
                        {counts.get(t.value) || 0} question{counts.get(t.value) === 1 ? '' : 's'}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {common.length > 0 && (
              <section>
                <h2 className="mb-3 font-semibold text-gray-900 font-helvetica">Common questions</h2>
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
                  {common.map((a) => (
                    <li key={a._id}>
                      <Link href={`/members/help/${a.slug}`} className="group flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50">
                        <span className="text-gray-800 group-hover:text-brand-dark-blue">{a.question}</span>
                        <FiArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-brand-dark-blue" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <StillStuck phone={contact.phone} email={contact.email} />
          </div>
        </HelpHome>
      </div>
    </div>
  );
}
