import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News & Updates | miServices',
  description: 'Stay up to date with the latest news, insights, and updates from miServices. Read about property inspection trends, franchise success stories, and industry developments.',
  openGraph: {
    title: 'News & Updates | miServices',
    description: 'Stay up to date with the latest news, insights, and updates from miServices. Read about property inspection trends, franchise success stories, and industry developments.',
    type: 'website',
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
