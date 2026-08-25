'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiArrowLeft,
  FiSave,
  FiCheck,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiStar,
  FiUser,
  FiCamera,
} from 'react-icons/fi';

// ─── Types ───────────────────────────────────────────────────────

interface Testimonial {
  _key: string;
  clientName: string;
  clientRole: string;
  quote: string;
  rating: number;
}

interface Qualifications {
  yearsExperience: number | null;
  dbsChecked: boolean;
  certifications: string[];
  additionalInfo: string;
}

interface TeamMember {
  _key: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  photoAssetId: string | null;
}

interface HighlightedService {
  _key: string;
  serviceSlug: string;
  customServiceName: string;
  description: string;
}

interface EditProfileFormProps {
  territory: string;
  initialData: {
    locationDescription: unknown[];
    ownerFirstName: string;
    ownerLastName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerProfilePictureUrl: string | null;
    townsCities: string;
    testimonials: Testimonial[];
    qualifications: Qualifications;
    teamMembers: TeamMember[];
    highlightedServices: HighlightedService[];
    franchiseeId: string;
  };
}

const STANDARD_SERVICES = [
  { slug: 'inventory-reports', label: 'Inventory Reports' },
  { slug: 'check-ins', label: 'Check-Ins' },
  { slug: 'check-outs', label: 'Check-Outs' },
  { slug: 'mid-tenancy', label: 'Mid-Tenancy Inspections' },
  { slug: 'property-visits', label: 'Property Visits' },
  { slug: 'block-management', label: 'Block Management' },
];

// ─── Accordion Section ──────────────────────────────────────────

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <h2 className="text-lg font-semibold text-gray-900 font-helvetica">{title}</h2>
        {open ? (
          <FiChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <FiChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Star Rating ────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <FiStar
            className={`w-5 h-5 ${
              star <= value
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Image Upload Button ────────────────────────────────────────

function ImageUploadButton({
  onUploaded,
  label,
}: {
  onUploaded: (assetId: string, url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/members/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Upload failed');
      } else {
        onUploaded(data.assetId, data.url);
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        <FiUpload className="w-4 h-4" />
        {uploading ? 'Uploading...' : label || 'Upload Photo'}
      </button>
      {uploadError && (
        <p className="text-xs text-red-600 mt-1">{uploadError}</p>
      )}
    </div>
  );
}

// ─── Main Form ──────────────────────────────────────────────────

export default function EditProfileForm({
  territory,
  initialData,
}: EditProfileFormProps) {
  // Owner details
  const [ownerFirstName, setOwnerFirstName] = useState(initialData.ownerFirstName);
  const [ownerLastName, setOwnerLastName] = useState(initialData.ownerLastName);
  const [ownerEmail, setOwnerEmail] = useState(initialData.ownerEmail);
  const [ownerPhone, setOwnerPhone] = useState(initialData.ownerPhone);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(
    initialData.ownerProfilePictureUrl
  );
  const [profilePicAssetId, setProfilePicAssetId] = useState<string | null>(null);

  // Bio (locationDescription as plain text for simple editing)
  const [bio, setBio] = useState(() => {
    const blocks = initialData.locationDescription || [];
    const extracted = blocks
      .filter((b: any) => b._type === 'block')
      .map((b: any) =>
        b.children?.map((c: any) => c.text).join('') || ''
      )
      .join('\n\n');

    if (extracted.trim()) return extracted;

    // Default template so the field is never empty
    return `Looking for a reliable property inventory clerk in ${territory}? miServices provides professional property reporting services to letting agents, landlords and property managers across ${territory} and the surrounding areas.

Our locally based team delivers comprehensive inventory reports, check-in and check-out inspections, mid-tenancy visits and block management reporting. Every report is produced using our proprietary miProgram software, ensuring consistent, high-quality documentation with detailed photography.

Whether you manage a single property or a large portfolio in ${territory}, miServices provides the reliable, professional inspection service you need to protect your investment and meet compliance requirements.`;
  });

  // Towns
  const [townsCities, setTownsCities] = useState(initialData.townsCities);

  // Qualifications
  const [qualifications, setQualifications] = useState<Qualifications>(
    initialData.qualifications
  );
  const [certInput, setCertInput] = useState('');

  // Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    initialData.testimonials
  );

  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    initialData.teamMembers
  );

  // Highlighted services
  const [highlightedServices, setHighlightedServices] = useState<HighlightedService[]>(
    initialData.highlightedServices
  );

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // ─── Handlers ─────────────────────────────────────────────────

  const addTestimonial = () => {
    if (testimonials.length >= 10) return;
    setTestimonials([
      ...testimonials,
      {
        _key: `testimonial-${Date.now()}`,
        clientName: '',
        clientRole: '',
        quote: '',
        rating: 5,
      },
    ]);
  };

  const removeTestimonial = (key: string) => {
    setTestimonials(testimonials.filter((t) => t._key !== key));
  };

  const updateTestimonial = (key: string, field: keyof Testimonial, value: unknown) => {
    setTestimonials(
      testimonials.map((t) => (t._key === key ? { ...t, [field]: value } : t))
    );
  };

  const addTeamMember = () => {
    if (teamMembers.length >= 10) return;
    setTeamMembers([
      ...teamMembers,
      {
        _key: `team-${Date.now()}`,
        name: '',
        role: '',
        bio: '',
        photoUrl: null,
        photoAssetId: null,
      },
    ]);
  };

  const removeTeamMember = (key: string) => {
    setTeamMembers(teamMembers.filter((tm) => tm._key !== key));
  };

  const updateTeamMember = (key: string, field: keyof TeamMember, value: unknown) => {
    setTeamMembers(
      teamMembers.map((tm) => (tm._key === key ? { ...tm, [field]: value } : tm))
    );
  };

  const addHighlightedService = () => {
    if (highlightedServices.length >= 8) return;
    setHighlightedServices([
      ...highlightedServices,
      {
        _key: `service-${Date.now()}`,
        serviceSlug: '',
        customServiceName: '',
        description: '',
      },
    ]);
  };

  const removeHighlightedService = (key: string) => {
    setHighlightedServices(highlightedServices.filter((s) => s._key !== key));
  };

  const updateHighlightedService = (
    key: string,
    field: keyof HighlightedService,
    value: string
  ) => {
    setHighlightedServices(
      highlightedServices.map((s) =>
        s._key === key ? { ...s, [field]: value } : s
      )
    );
  };

  const addCertification = () => {
    const trimmed = certInput.trim();
    if (!trimmed) return;
    if (qualifications.certifications.includes(trimmed)) return;
    setQualifications({
      ...qualifications,
      certifications: [...qualifications.certifications, trimmed],
    });
    setCertInput('');
  };

  const removeCertification = (cert: string) => {
    setQualifications({
      ...qualifications,
      certifications: qualifications.certifications.filter((c) => c !== cert),
    });
  };

  // ─── Submit ───────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Convert bio text back to Portable Text blocks
    const locationDescription = bio.trim()
      ? bio
          .split('\n\n')
          .filter(Boolean)
          .map((paragraph, i) => ({
            _type: 'block',
            _key: `block-${i}`,
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                _key: `span-${i}`,
                text: paragraph.trim(),
                marks: [],
              },
            ],
          }))
      : [];

    try {
      const res = await fetch('/api/members/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          territory,
          ownerFirstName,
          ownerLastName,
          ownerEmail,
          ownerPhone,
          ...(profilePicAssetId !== null && {
            ownerProfilePicture: profilePicAssetId,
          }),
          locationDescription,
          townsCities,
          testimonials: testimonials.map((t) => ({
            _key: t._key,
            clientName: t.clientName,
            clientRole: t.clientRole,
            quote: t.quote,
            rating: t.rating,
          })),
          qualifications: {
            yearsExperience: qualifications.yearsExperience,
            dbsChecked: qualifications.dbsChecked,
            certifications: qualifications.certifications,
            additionalInfo: qualifications.additionalInfo,
          },
          teamMembers: teamMembers.map((tm) => ({
            _key: tm._key,
            name: tm.name,
            role: tm.role,
            bio: tm.bio,
            ...(tm.photoAssetId ? { photoAssetId: tm.photoAssetId } : {}),
          })),
          highlightedServices: highlightedServices.map((hs) => ({
            _key: hs._key,
            serviceSlug: hs.serviceSlug,
            customServiceName: hs.customServiceName,
            description: hs.description,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Input class helper ───────────────────────────────────────

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">
            Edit Profile
          </h1>
          <p className="mt-1 text-blue-200">
            Update your details for the {territory} territory page
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
              <FiAlertCircle className="flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
              <FiCheck className="flex-shrink-0" />
              <span className="text-sm">Profile updated successfully.</span>
            </div>
          )}

          {/* 1. Owner Details */}
          <Section title="Owner Details" defaultOpen>
            <div className="flex items-center gap-4 mb-4">
              {profilePicUrl ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={profilePicUrl}
                    alt="Profile picture"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-dark-blue to-brand-light-blue flex items-center justify-center flex-shrink-0">
                  <FiCamera className="w-8 h-8 text-white" />
                </div>
              )}
              <ImageUploadButton
                label="Upload Profile Picture"
                onUploaded={(assetId, url) => {
                  setProfilePicAssetId(assetId);
                  setProfilePicUrl(url);
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ownerFirstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  id="ownerFirstName"
                  type="text"
                  value={ownerFirstName}
                  onChange={(e) => setOwnerFirstName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="ownerLastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  id="ownerLastName"
                  type="text"
                  value={ownerLastName}
                  onChange={(e) => setOwnerLastName(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ownerEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="ownerEmail"
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="ownerPhone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone
                </label>
                <input
                  id="ownerPhone"
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </Section>

          {/* 2. Bio */}
          <Section title="Bio / Location Description">
            <p className="text-sm text-gray-500 mb-2">
              This appears on your public profile page. Write a few paragraphs
              about your territory and services. Separate paragraphs with a
              blank line.
            </p>
            <textarea
              rows={6}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell potential clients about your services in this area..."
              className={inputClass}
            />
          </Section>

          {/* 3. Towns & Cities */}
          <Section title="Towns & Cities">
            <label
              htmlFor="townsCities"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Towns & Cities Covered
            </label>
            <textarea
              id="townsCities"
              rows={3}
              value={townsCities}
              onChange={(e) => setTownsCities(e.target.value)}
              placeholder="Comma-separated list of towns and cities"
              className={inputClass}
            />
          </Section>

          {/* 4. Qualifications & Experience */}
          <Section title="Qualifications & Experience">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={qualifications.yearsExperience ?? ''}
                  onChange={(e) =>
                    setQualifications({
                      ...qualifications,
                      yearsExperience: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qualifications.dbsChecked}
                    onChange={(e) =>
                      setQualifications({
                        ...qualifications,
                        dbsChecked: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-brand-light-blue border-gray-300 rounded focus:ring-brand-light-blue"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    DBS Checked
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certifications
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCertification();
                    }
                  }}
                  placeholder="Type a certification and press Enter"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-3 py-2 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue text-sm"
                >
                  Add
                </button>
              </div>
              {qualifications.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {qualifications.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCertification(cert)}
                        className="hover:text-red-600"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Info
              </label>
              <textarea
                rows={3}
                value={qualifications.additionalInfo}
                onChange={(e) =>
                  setQualifications({
                    ...qualifications,
                    additionalInfo: e.target.value,
                  })
                }
                placeholder="Any other relevant qualifications or experience..."
                className={inputClass}
              />
            </div>
          </Section>

          {/* 5. Testimonials */}
          <Section title="Testimonials">
            <p className="text-sm text-gray-500 mb-2">
              Add up to 10 client testimonials to display on your public
              profile.
            </p>
            {testimonials.map((t) => (
              <div
                key={t._key}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <StarRating
                    value={t.rating}
                    onChange={(v) => updateTestimonial(t._key, 'rating', v)}
                  />
                  <button
                    type="button"
                    onClick={() => removeTestimonial(t._key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Client name *"
                    value={t.clientName}
                    onChange={(e) =>
                      updateTestimonial(t._key, 'clientName', e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Letting Agent)"
                    value={t.clientRole}
                    onChange={(e) =>
                      updateTestimonial(t._key, 'clientRole', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Testimonial quote * (max 500 characters)"
                  value={t.quote}
                  maxLength={500}
                  onChange={(e) =>
                    updateTestimonial(t._key, 'quote', e.target.value)
                  }
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 text-right">
                  {t.quote.length}/500
                </p>
              </div>
            ))}
            {testimonials.length < 10 && (
              <button
                type="button"
                onClick={addTestimonial}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
              >
                <FiPlus className="w-4 h-4" />
                Add Testimonial
              </button>
            )}
          </Section>

          {/* 6. Team Members */}
          <Section title="Team Members">
            <p className="text-sm text-gray-500 mb-2">
              Add up to 10 team members to show on your public profile.
            </p>
            {teamMembers.map((tm) => (
              <div
                key={tm._key}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {tm.photoUrl ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={tm.photoUrl}
                          alt={tm.name || 'Team member'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <FiUser className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <ImageUploadButton
                      label="Photo"
                      onUploaded={(assetId, url) => {
                        updateTeamMember(tm._key, 'photoAssetId', assetId);
                        updateTeamMember(tm._key, 'photoUrl', url);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(tm._key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={tm.name}
                    onChange={(e) =>
                      updateTeamMember(tm._key, 'name', e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Inventory Clerk)"
                    value={tm.role}
                    onChange={(e) =>
                      updateTeamMember(tm._key, 'role', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Short bio (max 300 characters)"
                  value={tm.bio}
                  maxLength={300}
                  onChange={(e) =>
                    updateTeamMember(tm._key, 'bio', e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            ))}
            {teamMembers.length < 10 && (
              <button
                type="button"
                onClick={addTeamMember}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
              >
                <FiPlus className="w-4 h-4" />
                Add Team Member
              </button>
            )}
          </Section>

          {/* 7. Highlighted Services */}
          <Section title="Highlighted Services">
            <p className="text-sm text-gray-500 mb-2">
              Choose up to 8 services to highlight on your profile. These
              appear with a &quot;Specialist&quot; badge. The remaining standard
              services are still shown.
            </p>
            {highlightedServices.map((hs) => (
              <div
                key={hs._key}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <select
                    value={hs.serviceSlug}
                    onChange={(e) =>
                      updateHighlightedService(
                        hs._key,
                        'serviceSlug',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">Select a standard service...</option>
                    {STANDARD_SERVICES.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeHighlightedService(hs._key)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Or enter a custom service name"
                  value={hs.customServiceName}
                  onChange={(e) =>
                    updateHighlightedService(
                      hs._key,
                      'customServiceName',
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
                <textarea
                  rows={2}
                  placeholder="Short description (max 200 characters)"
                  value={hs.description}
                  maxLength={200}
                  onChange={(e) =>
                    updateHighlightedService(
                      hs._key,
                      'description',
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>
            ))}
            {highlightedServices.length < 8 && (
              <button
                type="button"
                onClick={addHighlightedService}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
              >
                <FiPlus className="w-4 h-4" />
                Add Service
              </button>
            )}
          </Section>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-helvetica"
            >
              <FiSave className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
