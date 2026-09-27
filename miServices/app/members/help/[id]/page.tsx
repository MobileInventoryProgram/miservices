import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { FiAlertTriangle, FiArrowRight, FiBookOpen, FiEyeOff } from 'react-icons/fi';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { getHelpContact } from '@/lib/cms/members';
import { getHelpForSession } from '@/lib/help/access';
import { blocksToAnswer } from '@/lib/help/markup';
import { getDocumentIndex } from '@/lib/help/search';
import { helpTopic } from '@/lib/help/topics';
import AnswerBody from '../AnswerBody';
import HelpAdminBar from '../HelpAdminBar';
import StillStuck from '../StillStuck';

export const metadata: Metadata = {
  title: 'Help Centre | Members Area | miServices',
};

export default async function HelpAnswerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');

  const { isAdmin, articles } = await getHelpForSession(session);
  const article = articles.find((a) => a.slug === params.id);
  if (!article) notFound();

  const topic = helpTopic(article.topic);
  const related = articles.filter((a) => a.topic === article.topic && a._id !== article._id && a.isPublished).slice(0, 5);
  const [contact, index] = await Promise.all([getHelpContact(), isAdmin ? getDocumentIndex() : Promise.resolve(null)]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={article.question}
        breadcrumbs={[
          { label: 'Help Centre', href: '/members/help' },
          ...(topic ? [{ label: topic.title, href: `/members/help/topic/${topic.value}` }] : []),
          { label: 'Answer' },
        ]}
        width="4xl"
      >
        {!article.isPublished && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
            <FiEyeOff className="h-4 w-4" /> Hidden from members
          </p>
        )}
      </PageHeader>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {isAdmin && index && (
          <HelpAdminBar
            outlines={index.outlines}
            article={{
              slug: article.slug,
              question: article.question,
              answer: blocksToAnswer(article.answer),
              topic: article.topic,
              keywords: article.keywords,
              isPublished: article.isPublished,
              sources: article.sources.flatMap((s) => (s.documentId ? [{ documentId: s.documentId, headingKey: s.headingKey, headingText: s.headingText }] : [])),
            }}
          />
        )}

        <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <AnswerBody answer={article.answer} />
        </article>

        {article.sources.length > 0 && (
          <section>
            <h2 className="mb-2 font-semibold text-gray-900 font-helvetica">Where this comes from</h2>
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
              {article.sources.map((s) => (
                <li key={s._key}>
                  {s.href && !s.broken ? (
                    <Link href={s.href} className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                      <FiBookOpen className="h-4 w-4 flex-shrink-0 text-brand-light-blue" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-gray-500">{s.documentTitle}</span>
                        <span className="block font-medium text-gray-900 group-hover:text-brand-dark-blue">{s.headingText || 'Whole document'}</span>
                      </span>
                      <span className="hidden items-center gap-1 text-sm text-brand-light-blue group-hover:text-brand-dark-blue sm:inline-flex">
                        Open section <FiArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  ) : (
                    <p className="flex items-center gap-3 px-5 py-3 text-sm text-amber-700">
                      <FiAlertTriangle className="h-4 w-4 flex-shrink-0" />
                      {s.documentTitle || 'A document'}
                      {s.headingText ? ` › ${s.headingText}` : ''}: this link no longer works (the document or section was removed or unpublished).
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section>
            <h2 className="mb-2 font-semibold text-gray-900 font-helvetica">Related questions</h2>
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
              {related.map((a) => (
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

        <StillStuck phone={contact.phone} email={contact.email} query={article.question} />
      </div>
    </div>
  );
}
