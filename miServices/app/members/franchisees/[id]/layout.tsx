import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { franchiseStatus, HEAD_OFFICE_SLUG } from '@/lib/franchisees/admin';
import { sanityWriteClient } from '@/lib/sanity';
import FranchiseStatusBadge from '../StatusBadge';
import Tabs from '../Tabs';

/** One franchise for Head Office: its name and status, then Details | Compliance | Contract */
export default async function FranchiseLayout({ params, children }: { params: { id: string }; children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members');

  const f = await sanityWriteClient.fetch<{ name: string; companyName: string; slug: string; isActive?: boolean; showOnNetwork?: boolean } | null>(
    `*[_type == "franchisee" && _id == $id][0] { "name": coalesce(territory, companyName, "Franchise"), "companyName": coalesce(companyName, ""), "slug": slug.current, isActive, showOnNetwork }`,
    { id: params.id }
  );
  if (!f) notFound();

  const base = `/members/franchisees/${params.id}`;
  const isHeadOffice = f.slug === HEAD_OFFICE_SLUG;
  const tabs = [
    { href: base, label: 'Details' },
    ...(isHeadOffice ? [] : [{ href: `${base}/compliance`, label: 'Compliance' }, { href: `${base}/contract`, label: 'Contract' }]),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {f.name}
            <FranchiseStatusBadge status={franchiseStatus(f)} />
          </span>
        }
        intro={f.companyName && f.companyName !== f.name ? f.companyName : undefined}
        breadcrumbs={[{ label: 'Franchisees', href: '/members/franchisees' }, { label: f.name }]}
        width="5xl"
      >
        {tabs.length > 1 && <Tabs tabs={tabs} label={`${f.name} sections`} />}
      </PageHeader>
      {children}
    </div>
  );
}
