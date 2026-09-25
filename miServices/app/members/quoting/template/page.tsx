import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getFlyerImageInfo } from '@/lib/flyer/assets';
import { getQuoteTemplate } from '@/lib/quote/quotes';
import TemplateEditor from './TemplateEditor';

export const metadata: Metadata = {
  title: 'Quote Template | Franchise Login | miServices',
};

export const dynamic = 'force-dynamic';

export default async function QuoteTemplatePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }
  if (session.user.role !== 'admin') {
    redirect('/members/quoting');
  }

  const template = await getQuoteTemplate();

  return <TemplateEditor initialTemplate={template} logoSrc={getFlyerImageInfo().logo?.src} />;
}
