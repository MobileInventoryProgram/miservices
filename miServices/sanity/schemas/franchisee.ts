import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'franchisee',
  title: 'Franchisee',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'companyName',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'territory',
      title: 'Territory',
      type: 'string',
    }),
    defineField({
      name: 'owners',
      title: 'Owners',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'firstName',
              title: 'First Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'lastName',
              title: 'Last Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'email',
              title: 'Email',
              type: 'string',
            }),
            defineField({
              name: 'phone',
              title: 'Phone',
              type: 'string',
            }),
            defineField({
              name: 'profilePicture',
              title: 'Profile Picture',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
          ],
          preview: {
            select: {
              firstName: 'firstName',
              lastName: 'lastName',
              media: 'profilePicture',
            },
            prepare({ firstName, lastName, media }) {
              return {
                title: `${firstName || ''} ${lastName || ''}`.trim(),
                media,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'mapTown',
      title: 'Map pin town',
      type: 'string',
      description: 'The town the franchise’s pin marks on the Our Network map. Leave empty to use the first town in “Towns & cities”.',
    }),
    defineField({
      name: 'areaImage',
      title: 'Area photo',
      type: 'image',
      options: { hotspot: true },
      description: 'A well-known landmark or view of the area, shown behind the header of the franchise’s page. Use photos that need no credit (e.g. Unsplash, Pexels, public domain).',
      fields: [
        defineField({ name: 'alt', title: 'Description', type: 'string', description: 'What the photo shows, e.g. "Clifton Suspension Bridge, Bristol"' }),
        defineField({ name: 'source', title: 'Where the photo came from', type: 'url' }),
        defineField({ name: 'licence', title: 'Licence', type: 'string', description: 'e.g. Unsplash licence, Pexels licence, Public domain' }),
      ],
    }),
    defineField({
      name: 'postCodes',
      title: 'Post Codes',
      description: 'Comma-separated list of post codes',
      type: 'text',
    }),
    defineField({
      name: 'townsCities',
      title: 'Towns & Cities',
      description: 'Comma-separated list of towns and cities',
      type: 'text',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'locationDescription',
      title: 'Location Page Description',
      description: 'Rich text description for the SEO location page (e.g. /our-network/leeds). Unique content per territory helps with search rankings.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'clientName',
              title: 'Client Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'clientRole',
              title: 'Client Role',
              type: 'string',
            }),
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              validation: (Rule) => Rule.required().max(500),
            }),
            defineField({
              name: 'rating',
              title: 'Rating',
              type: 'number',
              initialValue: 5,
              validation: (Rule) => Rule.min(1).max(5).integer(),
            }),
          ],
          preview: {
            select: {
              title: 'clientName',
              subtitle: 'quote',
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: 'qualifications',
      title: 'Qualifications',
      type: 'object',
      fields: [
        defineField({
          name: 'yearsExperience',
          title: 'Years of Experience',
          type: 'number',
          validation: (Rule) => Rule.min(0).max(50).integer(),
        }),
        defineField({
          name: 'dbsChecked',
          title: 'DBS Checked',
          type: 'boolean',
        }),
        defineField({
          name: 'certifications',
          title: 'Certifications',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            layout: 'tags',
          },
        }),
        defineField({
          name: 'additionalInfo',
          title: 'Additional Info',
          type: 'text',
        }),
      ],
    }),
    defineField({
      name: 'teamMembers',
      title: 'Team Members',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
            }),
            defineField({
              name: 'bio',
              title: 'Bio',
              type: 'text',
              validation: (Rule) => Rule.max(300),
            }),
            defineField({
              name: 'photo',
              title: 'Photo',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'role',
              media: 'photo',
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: 'highlightedServices',
      title: 'Highlighted Services',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'serviceSlug',
              title: 'Service',
              type: 'string',
              options: {
                list: [
                  { title: 'Inventory Reports', value: 'inventory-reports' },
                  { title: 'Check-Ins', value: 'check-ins' },
                  { title: 'Check-Outs', value: 'check-outs' },
                  { title: 'Mid-Tenancy Inspections', value: 'mid-tenancy' },
                  { title: 'Property Visits', value: 'property-visits' },
                  { title: 'Block Management', value: 'block-management' },
                ],
              },
            }),
            defineField({
              name: 'customServiceName',
              title: 'Custom Service Name',
              description: 'Use this for non-standard services',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              validation: (Rule) => Rule.max(200),
            }),
          ],
          preview: {
            select: {
              service: 'serviceSlug',
              custom: 'customServiceName',
            },
            prepare({ service, custom }) {
              return {
                title: custom || service || 'Unnamed service',
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Off when the franchise has left: hidden everywhere and its logins switched off.',
    }),
    defineField({
      name: 'contract',
      title: 'Contract (Head Office only)',
      type: 'object',
      description: 'Managed in Members Area → Franchisees → Contract. Never shown to the franchise.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'startDate', title: 'Start date', type: 'date' }),
        defineField({ name: 'termYears', title: 'Term (years)', type: 'number' }),
        defineField({ name: 'expiryDate', title: 'Expiry date', type: 'date' }),
        defineField({ name: 'renewalNoticeMonths', title: 'Renewal due (months before expiry)', type: 'number', initialValue: 6 }),
        defineField({
          name: 'feeType',
          title: 'Fee',
          type: 'string',
          options: { list: [{ title: 'Percentage of turnover', value: 'percentage' }, { title: 'Fixed monthly fee', value: 'fixed' }], layout: 'radio' },
        }),
        defineField({ name: 'feePercent', title: 'Percentage', type: 'number', initialValue: 10 }),
        defineField({ name: 'feeMonthly', title: 'Monthly fee (£)', type: 'number' }),
        defineField({ name: 'notes', title: 'Notes', type: 'text', rows: 3 }),
      ],
    }),
    defineField({
      name: 'showOnNetwork',
      title: 'Show on Our Network',
      type: 'boolean',
      initialValue: true,
      description: 'Switch off to hide the franchise from the public site while it is being set up.',
    }),
  ],
  preview: {
    select: {
      title: 'companyName',
      subtitle: 'territory',
    },
  },
});
