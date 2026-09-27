import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { FiArrowRight, FiChevronDown, FiEyeOff } from 'react-icons/fi';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { getHelpContact } from '@/lib/cms/members';
import { getHelpForSession } from '@/lib/help/access';
import { getDocumentIndex } from '@/lib/help/search';
import { helpTopic } from '@/lib/help/topics';
import AnswerBody from '../../AnswerBody';
import HelpAdminBar from '../../HelpAdminBar';
import StillStuck from '../../StillStuck';

export async function generateMetadata({ params }: { params: { topic: string } }): Promise<Metadata> {
  return { title: `${helpTopic(params.topic)?.title || 'Help'} | Help Centre | Members Area | miServices` };
}

export default async function HelpTopicPage({ params }: { params: { topic: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');

  const topic = helpTopic(params.topic);
  if (!topic) notFound();

  const { isAdmin, articles } = await getHelpForSession(session);
  const [contact, index] = await Promise.all([getHelpContact(), isAdmin ? getDocumentIndex() : Promise.resolve(null)]);
  const inTopic = articles.filter((a) => a.topic === topic.value);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={topic.title}
        intro={topic.description}
        breadcrumbs={[{ label: 'Help Centre', href: '/members/help' }, { label: topic.title }]}
        width="5xl"
      />

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {isAdmin && index && <HelpAdminBar outlines={index.outlines} defaultTopic={topic.value} />}

        {inTopic.length ? (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
            {inTopic.map((a) => (
              <li key={a._id}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                    <span className="font-medium text-gray-900">
                      {a.question}
                      {!a.isPublished && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-600">
                          <FiEyeOff className="h-3 w-3" /> Hidden
                        </span>
                      )}
                    </span>
                    <FiChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5">
                    <AnswerBody answer={a.answer} className="text-sm" />
                    <Link href={`/members/help/${a.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm text-brand-light-blue hover:text-brand-dark-blue">
                      {a.sources.length ? 'Sources and related questions' : 'Open answer'} <FiArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">No questions in this topic yet.</p>
        )}

        <StillStuck phone={contact.phone} email={contact.email} />
      </div>
    </div>
  );
}
