import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';

/** Old address: Compliance is now a tab of Franchisees (franchisees have Actions) */
export default async function OldCompliancePage() {
  const session = await getServerSession(authOptions);
  redirect(session?.user?.role === 'admin' ? '/members/franchisees/compliance/review' : '/members/actions');
}
