import 'server-only';
import { urlFor, type SanityFranchisee } from '@/lib/sanity';

/** A franchise's saved profile, shaped for the profile form (the member's own page and Head Office's) */
export function profileFormData(franchisee: SanityFranchisee) {
  const firstOwner = franchisee.owners?.[0];
  const ownerProfilePictureUrl = firstOwner?.profilePicture?.asset?.url || null;
  return {
    locationDescription: franchisee.locationDescription || [],
    ownerFirstName: firstOwner?.firstName || '',
    ownerLastName: firstOwner?.lastName || '',
    ownerEmail: firstOwner?.email || '',
    ownerPhone: firstOwner?.phone || '',
    ownerProfilePictureUrl,
    areaImageUrl: franchisee.areaImage?.asset?._ref
      ? urlFor(franchisee.areaImage).width(1200).height(540).fit('crop').auto('format').url()
      : null,
    areaImageAlt: franchisee.areaImage?.alt || '',
    townsCities: franchisee.townsCities || '',
    testimonials: (franchisee.testimonials || []).map((t, i) => ({
      _key: t._key || `testimonial-${i}`,
      clientName: t.clientName || '',
      clientRole: t.clientRole || '',
      quote: t.quote || '',
      rating: t.rating ?? 5,
    })),
    qualifications: {
      yearsExperience: franchisee.qualifications?.yearsExperience ?? null,
      dbsChecked: franchisee.qualifications?.dbsChecked ?? false,
      certifications: franchisee.qualifications?.certifications || [],
      additionalInfo: franchisee.qualifications?.additionalInfo || '',
    },
    teamMembers: (franchisee.teamMembers || []).map((tm, i) => ({
      _key: tm._key || `team-${i}`,
      name: tm.name || '',
      role: tm.role || '',
      bio: tm.bio || '',
      photoUrl: tm.photo?.asset?.url || null,
      // Keep the saved photo when the profile is saved again
      photoAssetId: tm.photo?.asset?._id || null,
    })),
    highlightedServices: (franchisee.highlightedServices || []).map((hs, i) => ({
      _key: hs._key || `service-${i}`,
      serviceSlug: hs.serviceSlug || '',
      customServiceName: hs.customServiceName || '',
      description: hs.description || '',
    })),
    franchiseeId: franchisee._id,
  };
}
