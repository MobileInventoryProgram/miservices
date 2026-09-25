import { defineArrayMember, defineField, defineType } from 'sanity';

const panel = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'eyebrow', title: 'Small heading', type: 'string' }),
      defineField({ name: 'heading', title: 'Heading', type: 'string' }),
      defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
      defineField({ name: 'button', title: 'Button', type: 'link' }),
    ],
  });

const menuGroups = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'object',
        name: 'menuGroup',
        fields: [
          defineField({ name: 'title', title: 'Column heading', type: 'string' }),
          defineField({ name: 'numbered', title: 'Show as numbered steps', type: 'boolean', initialValue: false }),
          defineField({ name: 'links', title: 'Links', type: 'array', of: [{ type: 'menuLink' }] }),
        ],
        preview: { select: { title: 'title', links: 'links' }, prepare: ({ title, links }) => ({ title, subtitle: `${links?.length || 0} links` }) },
      }),
    ],
  });

/** Singleton: details used across the whole website */
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'company', title: 'Company & contact', default: true },
    { name: 'header', title: 'Header menu' },
    { name: 'footer', title: 'Footer' },
    { name: 'seo', title: 'Default SEO' },
  ],
  fields: [
    defineField({ name: 'siteName', title: 'Site name', type: 'string', group: 'company', validation: (Rule) => Rule.required() }),
    defineField({ name: 'legalName', title: 'Registered company name', type: 'string', group: 'company' }),
    defineField({ name: 'companyNumber', title: 'Company number', type: 'string', group: 'company' }),
    defineField({ name: 'phone', title: 'Main phone number', type: 'string', group: 'company' }),
    defineField({ name: 'email', title: 'Main email address', type: 'string', group: 'company' }),
    defineField({
      name: 'address',
      title: 'Head Office address',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'One line per row, postcode last',
      group: 'company',
    }),
    defineField({
      name: 'social',
      title: 'Social media',
      type: 'object',
      group: 'company',
      fields: ['linkedin', 'facebook', 'instagram', 'x', 'youtube'].map((name) =>
        defineField({ name, title: { linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram', x: 'X (Twitter)', youtube: 'YouTube' }[name], type: 'url' })
      ),
    }),

    defineField({
      name: 'discoveryCall',
      title: 'Discovery call booking',
      type: 'object',
      group: 'company',
      description: 'The calendar that opens from "Book a Discovery Call" buttons',
      fields: [
        defineField({ name: 'title', title: 'Pop-up heading', type: 'string' }),
        defineField({ name: 'calendarUrl', title: 'Google Calendar booking page (embed link)', type: 'url' }),
      ],
    }),

    defineField({ name: 'servicesMenuLabel', title: '"Services" menu name', type: 'string', group: 'header' }),
    menuGroups('servicesMenu', 'Services menu columns'),
    defineField({ name: 'networkMenuLabel', title: '"Our Network" menu name', type: 'string', group: 'header' }),
    { ...panel('networkLocal', 'Our Network menu: find an operative panel'), group: 'header' },
    { ...panel('networkFranchise', 'Our Network menu: franchise panel'), group: 'header' },
    defineField({ name: 'moreMenuLabel', title: '"More" menu name', type: 'string', group: 'header' }),
    menuGroups('moreMenu', 'More menu columns'),
    defineField({ name: 'headerButtons', title: 'Header buttons', type: 'array', of: [{ type: 'link' }], group: 'header', validation: (Rule) => Rule.max(2) }),

    defineField({ name: 'footerTagline', title: 'Text under the logo', type: 'text', rows: 3, group: 'footer' }),
    defineField({
      name: 'footerColumns',
      title: 'Link columns',
      type: 'array',
      group: 'footer',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerColumn',
          fields: [
            defineField({ name: 'title', title: 'Heading', type: 'string' }),
            defineField({ name: 'links', title: 'Links', type: 'array', of: [{ type: 'link' }] }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),
    defineField({ name: 'footerContactHeading', title: 'Contact column heading', type: 'string', group: 'footer' }),
    defineField({ name: 'footerCoverageLink', title: 'Coverage link', type: 'link', group: 'footer' }),
    defineField({ name: 'footerContactButton', title: 'Contact button', type: 'link', group: 'footer' }),
    defineField({ name: 'footerLocationsHeading', title: 'Locations heading', type: 'string', group: 'footer' }),
    defineField({
      name: 'footerLocations',
      title: 'Locations',
      type: 'array',
      group: 'footer',
      description: 'Franchise areas linked from the footer',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerLocation',
          fields: [
            defineField({ name: 'label', title: 'Name shown', type: 'string' }),
            defineField({ name: 'franchisee', title: 'Franchise', type: 'reference', to: [{ type: 'franchisee' }], validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'franchisee.companyName' } },
        }),
      ],
    }),
    defineField({ name: 'copyright', title: 'Copyright line', type: 'string', description: '"© <year>" is added in front automatically', group: 'footer' }),
    defineField({ name: 'legalLinks', title: 'Bottom links', type: 'array', of: [{ type: 'link' }], group: 'footer' }),

    defineField({ name: 'defaultTitle', title: 'Default page title', type: 'string', group: 'seo' }),
    defineField({ name: 'titleSuffix', title: 'Added to page titles', type: 'string', description: 'e.g. " | miServices"', group: 'seo' }),
    defineField({ name: 'defaultDescription', title: 'Default description', type: 'text', rows: 3, group: 'seo' }),
    defineField({ name: 'defaultKeywords', title: 'Default keywords', type: 'string', group: 'seo' }),
    defineField({ name: 'defaultShareImage', title: 'Default share image', type: 'image', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
});
