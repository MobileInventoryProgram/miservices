import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { resolveEditableFranchisee, revalidateNetwork } from '@/lib/franchisee-access';
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
    const { target, assetId, key, franchiseeId } = await request.json();
    if (!['owner', 'area', 'team'].includes(target) || typeof assetId !== 'string' || !ASSET_ID.test(assetId)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // The member's own franchise; Head Office may name any franchise
    const resolved = await resolveEditableFranchisee<{ _id: string; slug?: string; ownerCount?: number; teamKeys?: string[] }>(
      session,
      franchiseeId,
      `{ _id, "slug": slug.current, "ownerCount": count(owners), "teamKeys": teamMembers[]._key }`
    );
    if (resolved.response) return resolved.response;
    const franchisee = resolved.franchisee;

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

    revalidateNetwork(franchisee.slug);
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('Profile photo error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
