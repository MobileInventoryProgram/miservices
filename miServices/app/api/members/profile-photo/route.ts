import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth-options';
import { sanityWriteClient } from '@/lib/sanity';

const ASSET_ID = /^image-[A-Za-z0-9]+-\d+x\d+-[a-z]+$/;
const KEY = /^[A-Za-z0-9_-]{1,60}$/;

/**
 * Saves a profile photo as soon as it's uploaded, so it can't be lost by
 * leaving the page without pressing Save. Only the photo changes.
 * target: 'owner' | 'area' | 'team' (team needs the member's key).
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session.user.franchiseeId && !session.user.territory) {
      return NextResponse.json({ error: 'No franchisee linked to your account' }, { status: 403 });
    }

    const { target, assetId, key } = await request.json();
    if (!['owner', 'area', 'team'].includes(target) || typeof assetId !== 'string' || !ASSET_ID.test(assetId)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Resolve the franchisee from the session — reference first, territory fallback
    const query = `{ _id, "slug": slug.current, "ownerCount": count(owners), "teamKeys": teamMembers[]._key }`;
    let franchisee: { _id: string; slug?: string; ownerCount?: number; teamKeys?: string[] } | null = null;
    if (session.user.franchiseeId) {
      franchisee = await sanityWriteClient.fetch(`*[_type == "franchisee" && _id == $id && isActive == true][0] ${query}`, {
        id: session.user.franchiseeId,
      });
    }
    if (!franchisee && session.user.territory) {
      franchisee = await sanityWriteClient.fetch(`*[_type == "franchisee" && territory == $territory && isActive == true][0] ${query}`, {
        territory: session.user.territory,
      });
    }
    if (!franchisee) return NextResponse.json({ error: 'Franchisee document not found' }, { status: 404 });

    const image = { _type: 'image', asset: { _type: 'reference', _ref: assetId } };
    const patch = sanityWriteClient.patch(franchisee._id);

    if (target === 'area') {
      // A new photo drops the old one's crop, and keeps its description
      patch.setIfMissing({ areaImage: { _type: 'image' } }).set({ 'areaImage.asset': image.asset }).unset(['areaImage.crop', 'areaImage.hotspot']);
    } else if (target === 'owner') {
      if (!franchisee.ownerCount) return NextResponse.json({ saved: false });
      patch.set({ 'owners[0].profilePicture': image });
    } else {
      // A team member that hasn't been saved yet gets its photo when the form is saved
      if (typeof key !== 'string' || !KEY.test(key) || !(franchisee.teamKeys || []).includes(key)) {
        return NextResponse.json({ saved: false });
      }
      patch.set({ [`teamMembers[_key=="${key}"].photo`]: image });
    }
    await patch.commit();

    if (franchisee.slug) revalidatePath(`/our-network/${franchisee.slug}`);
    revalidatePath('/our-network');
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('Profile photo error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
