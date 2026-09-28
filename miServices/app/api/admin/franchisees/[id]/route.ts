import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { HEAD_OFFICE_SLUG, slugTaken } from '@/lib/franchisees/admin';
import { isEmail, readFranchiseDetails } from '@/lib/franchisees/input';
import { revalidateNetwork } from '@/lib/franchisee-access';
import { sanityWriteClient } from '@/lib/sanity';

type Current = {
  _id: string;
  slug?: string;
  isActive?: boolean;
  ownerName?: string;
  ownerEmail?: string;
  postCodes?: string;
  townsCities?: string;
  mapTown?: string;
};

/**
 * PATCH — Head Office changes to a franchise. One of:
 *   { details: {...} }            company name, territory, areas, map town, tags, web address
 *   { showOnNetwork: boolean }    go live on Our Network, or hide (needs owner email and areas)
 *   { isActive: boolean }         deactivate (switches its logins off) or reactivate (switches them back on)
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const current = await sanityWriteClient.fetch<Current | null>(
      `*[_type == "franchisee" && _id == $id][0] {
        _id, "slug": slug.current, isActive, postCodes, townsCities, mapTown,
        "ownerName": owners[0].firstName, "ownerEmail": owners[0].email
      }`,
      { id: params.id }
    );
    if (!current) return NextResponse.json({ error: 'Franchise not found.' }, { status: 404 });
    const isHeadOffice = current.slug === HEAD_OFFICE_SLUG;

    // Franchise details
    if (body.details && typeof body.details === 'object') {
      const result = readFranchiseDetails(body.details as Record<string, unknown>);
      if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
      const { slug, ...fields } = result.input;
      const set: Record<string, unknown> = { ...fields };
      if (slug && slug !== current.slug) {
        if (isHeadOffice) return NextResponse.json({ error: "Head Office's web address can't be changed." }, { status: 400 });
        if (await slugTaken(slug, current._id)) return NextResponse.json({ error: `Another franchise already uses /our-network/${slug}.` }, { status: 409 });
        set.slug = { _type: 'slug', current: slug };
      }
      await sanityWriteClient.patch(current._id).set(set).commit();
      revalidateNetwork(current.slug);
      if (slug && slug !== current.slug) revalidateNetwork(slug);
      return NextResponse.json({ ok: true, slug: slug || current.slug });
    }

    // Show on / hide from Our Network
    if (typeof body.showOnNetwork === 'boolean') {
      if (body.showOnNetwork) {
        const missing = [
          !current.isActive && 'the franchise is deactivated',
          !current.ownerName && "the owner's name",
          !(current.ownerEmail && isEmail(current.ownerEmail)) && "the owner's email",
          !(current.postCodes?.trim() || current.townsCities?.trim() || current.mapTown?.trim()) && 'the postcodes or towns covered',
        ].filter(Boolean);
        if (missing.length) return NextResponse.json({ error: `Can't go live yet: ${missing.join(', ')}.` }, { status: 400 });
      }
      await sanityWriteClient.patch(current._id).set({ showOnNetwork: body.showOnNetwork }).commit();
      revalidateNetwork(current.slug);
      return NextResponse.json({ ok: true });
    }

    // Deactivate / reactivate, with its logins
    if (typeof body.isActive === 'boolean') {
      if (isHeadOffice && !body.isActive) return NextResponse.json({ error: "Head Office can't be deactivated." }, { status: 400 });
      // Coming back, it stays hidden until Head Office shows it on Our Network again
      const tx = sanityWriteClient
        .transaction()
        .patch(current._id, (p) => p.set(body.isActive ? { isActive: true, showOnNetwork: false } : { isActive: false }));
      if (body.isActive) {
        const toRestore = await sanityWriteClient.fetch<string[]>(
          `*[_type == "member" && franchisee._ref == $id && deactivatedWithFranchise == true]._id`,
          { id: current._id }
        );
        toRestore.forEach((id) => tx.patch(id, (p) => p.set({ isActive: true }).unset(['deactivatedWithFranchise'])));
      } else {
        const toSwitchOff = await sanityWriteClient.fetch<string[]>(`*[_type == "member" && franchisee._ref == $id && isActive == true]._id`, {
          id: current._id,
        });
        toSwitchOff.forEach((id) => tx.patch(id, (p) => p.set({ isActive: false, deactivatedWithFranchise: true })));
      }
      await tx.commit();
      revalidateNetwork(current.slug);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 });
  } catch (error) {
    console.error('Error updating franchise:', error);
    return NextResponse.json({ error: 'Failed to save the franchise' }, { status: 500 });
  }
}
