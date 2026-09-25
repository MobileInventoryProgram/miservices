import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getAllPriceLists } from '@/lib/sanity';
import AdminPricingView from './AdminPricingView';

export const metadata: Metadata = {
  title: 'Standard Price Lists | Franchise Login | miServices',
};

export default async function AdminPricingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/members');
  }

  const priceLists = await getAllPriceLists();

  const templates = priceLists.filter((pl) => pl.isTemplate);
  const franchiseeLists = priceLists.filter((pl) => !pl.isTemplate);

  return (
    <AdminPricingView
      templates={templates}
      franchiseeLists={franchiseeLists}
    />
  );
}
