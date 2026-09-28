import { redirect } from 'next/navigation';

/** Old address: a franchise's compliance is now a tab on its Franchisees page */
export default function OldFranchiseCompliancePage({ params }: { params: { id: string } }) {
  redirect(`/members/franchisees/${params.id}/compliance`);
}
