import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { resolveEditableFranchisee, revalidateNetwork } from '@/lib/franchisee-access';
import { sanityWriteClient } from '@/lib/sanity';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      territory,
      locationDescription,
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerPhone,
      ownerProfilePicture,
      areaImageAssetId,
      areaImageAlt,
      townsCities,
      testimonials,
      qualifications,
      teamMembers,
      highlightedServices,
    } = body;

    // The member's own franchise; Head Office may name any franchise
    const resolved = await resolveEditableFranchisee<Record<string, unknown> & { _id: string }>(
      session,
      body.franchiseeId,
      '{ ..., "slugCurrent": slug.current }'
    );
    if (resolved.response) return resolved.response;
    const franchisee = resolved.franchisee;

    // If territory was sent in the body, verify it matches the resolved franchisee
    if (!resolved.asAdmin && territory && territory !== franchisee.territory) {
      return NextResponse.json(
        { error: 'You can only edit your own territory' },
        { status: 403 }
      );
    }

    // Build the patch
    const patch: Record<string, unknown> = {};

    if (locationDescription !== undefined) {
      patch.locationDescription = locationDescription;
    }

    if (townsCities !== undefined) {
      patch.townsCities = townsCities;
    }

    // Update first owner's details
    if (
      ownerFirstName !== undefined ||
      ownerLastName !== undefined ||
      ownerEmail !== undefined ||
      ownerPhone !== undefined ||
      ownerProfilePicture !== undefined
    ) {
      const existingOwners = (franchisee.owners as Record<string, unknown>[]) || [];
      const updatedOwners = [...existingOwners];
      const firstOwner = updatedOwners[0] || {};

      updatedOwners[0] = {
        ...firstOwner,
        _type: 'object',
        _key: (firstOwner as Record<string, unknown>)._key || 'owner-0',
        ...(ownerFirstName !== undefined && { firstName: ownerFirstName }),
        ...(ownerLastName !== undefined && { lastName: ownerLastName }),
        ...(ownerEmail !== undefined && { email: ownerEmail }),
        ...(ownerPhone !== undefined && { phone: ownerPhone }),
        ...(ownerProfilePicture !== undefined && {
          profilePicture: ownerProfilePicture
            ? {
                _type: 'image',
                asset: { _type: 'reference', _ref: ownerProfilePicture },
              }
            : undefined,
        }),
      };

      patch.owners = updatedOwners;
    }

    // Area photo: a new upload replaces the photo (and its old crop); otherwise only the description changes
    const alt = typeof areaImageAlt === 'string' ? areaImageAlt.trim().slice(0, 200) : undefined;
    if (typeof areaImageAssetId === 'string' && areaImageAssetId) {
      patch.areaImage = {
        _type: 'image',
        asset: { _type: 'reference', _ref: areaImageAssetId },
        ...(alt ? { alt } : {}),
      };
    } else if (alt !== undefined && franchisee.areaImage) {
      patch['areaImage.alt'] = alt;
    }

    // Testimonials
    if (testimonials !== undefined) {
      if (!Array.isArray(testimonials) || testimonials.length > 10) {
        return NextResponse.json(
          { error: 'Testimonials must be an array of max 10 items' },
          { status: 400 }
        );
      }
      for (const t of testimonials) {
        if (!t.clientName || !t.quote) {
          return NextResponse.json(
            { error: 'Each testimonial needs clientName and quote' },
            { status: 400 }
          );
        }
        if (t.quote.length > 500) {
          return NextResponse.json(
            { error: 'Testimonial quote must be 500 characters or less' },
            { status: 400 }
          );
        }
        if (t.rating !== undefined && (t.rating < 1 || t.rating > 5)) {
          return NextResponse.json(
            { error: 'Rating must be between 1 and 5' },
            { status: 400 }
          );
        }
      }
      patch.testimonials = testimonials.map(
        (t: Record<string, unknown>, i: number) => ({
          _type: 'object',
          _key: (t._key as string) || `testimonial-${i}`,
          clientName: t.clientName,
          clientRole: t.clientRole || '',
          quote: t.quote,
          rating: t.rating ?? 5,
        })
      );
    }

    // Qualifications
    if (qualifications !== undefined) {
      const q = qualifications;
      if (
        q.yearsExperience !== undefined &&
        q.yearsExperience !== null &&
        (q.yearsExperience < 0 || q.yearsExperience > 50)
      ) {
        return NextResponse.json(
          { error: 'Years of experience must be between 0 and 50' },
          { status: 400 }
        );
      }
      patch.qualifications = {
        _type: 'object',
        yearsExperience: q.yearsExperience ?? undefined,
        dbsChecked: q.dbsChecked ?? false,
        certifications: q.certifications || [],
        additionalInfo: q.additionalInfo || '',
      };
    }

    // Team Members
    if (teamMembers !== undefined) {
      if (!Array.isArray(teamMembers) || teamMembers.length > 10) {
        return NextResponse.json(
          { error: 'Team members must be an array of max 10 items' },
          { status: 400 }
        );
      }
      for (const tm of teamMembers) {
        if (!tm.name) {
          return NextResponse.json(
            { error: 'Each team member needs a name' },
            { status: 400 }
          );
        }
      }
      patch.teamMembers = teamMembers.map(
        (tm: Record<string, unknown>, i: number) => ({
          _type: 'object',
          _key: (tm._key as string) || `team-${i}`,
          name: tm.name,
          role: tm.role || '',
          bio: tm.bio || '',
          ...(tm.photoAssetId
            ? {
                photo: {
                  _type: 'image',
                  asset: { _type: 'reference', _ref: tm.photoAssetId },
                },
              }
            : {}),
        })
      );
    }

    // Highlighted Services
    if (highlightedServices !== undefined) {
      if (!Array.isArray(highlightedServices) || highlightedServices.length > 8) {
        return NextResponse.json(
          { error: 'Highlighted services must be an array of max 8 items' },
          { status: 400 }
        );
      }
      patch.highlightedServices = highlightedServices.map(
        (hs: Record<string, unknown>, i: number) => ({
          _type: 'object',
          _key: (hs._key as string) || `service-${i}`,
          serviceSlug: hs.serviceSlug || '',
          customServiceName: hs.customServiceName || '',
          description: hs.description || '',
        })
      );
    }

    await sanityWriteClient
      .patch(franchisee._id as string)
      .set(patch)
      .commit();

    // Refresh the public profile page and the listing page
    revalidateNetwork(franchisee.slugCurrent as string | undefined);

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
