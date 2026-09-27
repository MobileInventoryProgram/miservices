import { redirect } from 'next/navigation';

/** The old Pricing & Quoting hub: its sections are in the side menu now */
export default function PricingQuotingPage() {
  redirect('/members');
}
