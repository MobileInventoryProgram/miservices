import { redirect } from 'next/navigation';

/** Old leaflet address: the leaflet is now part of its price list */
export default async function OldLeafletPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ layout?: string }>;
}) {
  const { id } = await params;
  const { layout } = await searchParams;
  redirect(`/members/pricing/${id}/leaflet${layout === 'single' ? '?layout=single' : ''}`);
}
