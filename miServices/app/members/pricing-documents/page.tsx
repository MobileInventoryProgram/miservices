import { redirect } from 'next/navigation';

/** Leaflets now live with each price list, under Pricing */
export default function PricingDocumentsPage() {
  redirect('/members/pricing');
}
