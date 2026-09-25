import { defineArrayMember, defineField, defineType, type FieldDefinition } from 'sanity';
import { ICON_OPTIONS } from '../../../lib/cms/icon-names';

const ICON_LIST = ICON_OPTIONS.map((o) => ({ title: o.title, value: o.value }));

/**
 * Website page singletons. Each page has fixed fields for its own layout,
 * plus a header (hero) and SEO. One document per page, fixed IDs.
 */
const group = (name: string, title: string, isDefault = false) => ({ name, title, ...(isDefault ? { default: true } : {}) });

function page(name: string, title: string, path: string, fields: FieldDefinition[], groups: { name: string; title: string }[] = []) {
  return defineType({
    name,
    title,
    type: 'document',
    groups: [group('content', 'Content', true), ...groups, group('seo', 'SEO')],
    fields: [
      ...fields.map((f) => ({ group: 'content', ...f })),
      defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
    ] as FieldDefinition[],
    preview: { prepare: () => ({ title, subtitle: path }) },
  });
}

const hero = defineField({ name: 'hero', title: 'Page header', type: 'hero' });
const cta = (name = 'cta', title = 'Call to action (bottom of page)') => defineField({ name, title, type: 'cta' });
const str = (name: string, title: string, extra: Record<string, unknown> = {}) => defineField({ name, title, type: 'string', ...extra });
const txt = (name: string, title: string, rows = 3) => defineField({ name, title, type: 'text', rows });
const rich = (name: string, title: string) => defineField({ name, title, type: 'richText' });
const image = (name: string, title: string) => defineField({ name, title, type: 'imageWithAlt' });
const list = (name: string, title: string, of: string, extra: Record<string, unknown> = {}) =>
  defineField({ name, title, type: 'array', of: [{ type: of }], ...extra });
const strings = (name: string, title: string) => defineField({ name, title, type: 'array', of: [{ type: 'string' }] });
const section = (name: string, title: string, fields: FieldDefinition[]) =>
  defineField({ name, title, type: 'object', options: { collapsible: true, collapsed: false }, fields });

export const servicesPage = page('servicesPage', 'Services page', '/services', [
  hero,
  cta(),
]);

const locationItem = defineArrayMember({
  type: 'object',
  name: 'locationLink',
  fields: [
    defineField({ name: 'label', title: 'Name shown', type: 'string' }),
    defineField({ name: 'franchisee', title: 'Franchise', type: 'reference', to: [{ type: 'franchisee' }], validation: (Rule) => Rule.required() }),
  ],
  preview: { select: { title: 'label', subtitle: 'franchisee.companyName' } },
});

export const homePage = page(
  'homePage',
  'Home page',
  '/',
  [
    hero,
    section('statsSection', 'Our numbers', [str('heading', 'Heading'), list('stats', 'Statistics', 'stat')]),
    section('whySection', 'Why choose us', [str('heading', 'Heading'), list('items', 'Reasons', 'featureItem')]),
    section('servicesSection', 'Our services', [str('heading', 'Heading'), list('cards', 'Service cards', 'featureItem')]),
    section('clientsSection', 'Client logos', [
      str('heading', 'Heading'),
      txt('text', 'Text', 2),
      defineField({ name: 'logos', title: 'Logos', type: 'array', of: [{ type: 'imageWithAlt' }], description: 'Use the company name as the image description' }),
    ]),
    section('audiencesSection', 'Who we work with', [str('heading', 'Heading'), list('cards', 'Cards', 'featureItem')]),
    section('locationsSection', 'Find your local clerk', [
      str('heading', 'Heading'),
      txt('text', 'Text', 2),
      defineField({ name: 'locations', title: 'Locations', type: 'array', of: [locationItem] }),
      defineField({ name: 'allLink', title: '"View all" link', type: 'link' }),
    ]),
    section('franchiseSection', 'Franchise band', [str('heading', 'Heading'), txt('text', 'Text'), list('stats', 'Statistics', 'stat')]),
    cta(),
  ]
);

const milestone = defineArrayMember({
  type: 'object',
  name: 'milestone',
  fields: [str('year', 'Year (optional)'), str('title', 'Title'), txt('description', 'Description', 2)],
  preview: { select: { title: 'title', subtitle: 'year' } },
});
const promoCard = defineArrayMember({
  type: 'object',
  name: 'promoCard',
  fields: [str('heading', 'Heading'), txt('text', 'Text'), defineField({ name: 'button', title: 'Button', type: 'link' })],
  preview: { select: { title: 'heading' } },
});

export const aboutPage = page('aboutPage', 'About page', '/about', [
  hero,
  section('intro', 'Introduction', [str('heading', 'Heading'), rich('text', 'Text'), image('image', 'Image')]),
  txt('quote', 'Highlighted quote', 3),
  section('story', 'Our story', [str('heading', 'Heading'), txt('text', 'Text'), defineField({ name: 'milestones', title: 'Milestones', type: 'array', of: [milestone] })]),
  section('team', 'Our team in numbers', [str('heading', 'Heading'), txt('text', 'Text', 2), list('stats', 'Statistics', 'stat'), txt('footnote', 'Text under the numbers', 2)]),
  section('whatWeDo', 'What we do', [str('heading', 'Heading'), txt('text', 'Text'), list('items', 'Services', 'featureItem')]),
  defineField({ name: 'promoCards', title: 'Promo cards', type: 'array', of: [promoCard] }),
  section('network', 'Franchise network', [
    str('heading', 'Heading'),
    rich('text', 'Text'),
    image('image', 'Image'),
    defineField({ name: 'primaryButton', title: 'Main button', type: 'link' }),
    defineField({ name: 'secondaryButton', title: 'Second button', type: 'link' }),
  ]),
  section('lookingAhead', 'Looking ahead', [str('heading', 'Heading'), str('lead', 'Lead-in'), txt('mission', 'Mission statement', 2), txt('text', 'Text')]),
  cta(),
]);

const territory = defineArrayMember({
  type: 'object',
  name: 'territory',
  fields: [str('name', 'Area'), str('postcodes', 'Postcodes'), str('price', 'Price'), txt('description', 'Description (featured only)'), str('badge', 'Badge (featured only)', { description: 'e.g. Going Concern' })],
  preview: { select: { title: 'name', subtitle: 'price' } },
});

export const franchisePage = page(
  'franchisePage',
  'Franchise page',
  '/franchise',
  [
    defineField({ ...hero, group: 'top' }),
    { ...txt('heroText', 'Header: extra paragraph'), group: 'top' },
    { ...str('callButtonLabel', 'Header: "Book a call" button text'), group: 'top' },
    { ...section('video', 'Video', [str('heading', 'Heading'), str('url', 'YouTube link', { description: 'e.g. https://www.youtube.com/watch?v=… (the section is hidden until a link is added)' })]), group: 'top' },
    section('why', 'Why join', [str('heading', 'Heading'), rich('text', 'Text'), str('benefitsHeading', 'Benefits heading'), list('benefits', 'Benefits', 'featureItem')]),
    section('clients', 'Who you will work with', [str('heading', 'Heading'), txt('text', 'Text', 2), strings('items', 'Client types'), txt('footnote', 'Text underneath', 2)]),
    section('investment', 'Investment', [
      str('heading', 'Heading'),
      str('priceFrom', 'Price from'),
      str('priceTo', 'Price to (e.g. "to £19,995")'),
      str('priceNote', 'Price note'),
      str('includesHeading', '"Your investment includes" heading'),
      txt('includesText', '"Your investment includes" text', 2),
      str('includedHeading', 'List heading'),
      strings('included', "What's included"),
      str('callout', 'Highlighted note'),
    ]),
    defineField({
      ...section('territories', 'Available territories', [
        str('heading', 'Heading'),
        txt('text', 'Text', 2),
        str('featuredHeading', 'Featured heading'),
        defineField({ name: 'featured', title: 'Featured territories', type: 'array', of: [territory] }),
        str('featuredButtonLabel', 'Featured: button text'),
        str('newHeading', 'New territories heading'),
        defineField({ name: 'available', title: 'New territories', type: 'array', of: [territory] }),
        str('customBefore', 'Custom area: text before link'),
        str('customLinkLabel', 'Custom area: link text'),
        str('customAfter', 'Custom area: text after link'),
      ]),
      group: 'territories',
    }),
    section('prospectus', 'Prospectus', [str('heading', 'Heading'), txt('text', 'Text')]),
    section('testimonials', 'Testimonials', [str('heading', 'Heading'), list('items', 'Testimonials', 'testimonial')]),
    section('journey', 'Steps to join', [str('heading', 'Heading'), str('text', 'Text'), list('steps', 'Steps', 'step'), str('buttonLabel', 'Button text')]),
    section('faq', 'Questions', [str('heading', 'Heading'), list('items', 'Questions', 'faq')]),
    section('cta', 'Call to action (bottom of page)', [str('heading', 'Heading'), txt('text', 'Text', 2), str('prospectusButtonLabel', 'Prospectus button text'), str('callButtonLabel', 'Call button text')]),
  ],
  [group('top', 'Header & video'), group('territories', 'Territories')]
);

export const careersPage = page('careersPage', 'Careers page', '/careers', [
  hero,
  section('why', 'Why work with us', [str('heading', 'Heading'), txt('text', 'Text', 4), defineField({ name: 'cards', title: 'Opportunity cards', type: 'array', of: [promoCard] })]),
  cta(),
]);

const teamGroup = defineArrayMember({
  type: 'object',
  name: 'teamGroup',
  fields: [
    str('title', 'Department'),
    defineField({ name: 'icon', title: 'Icon', type: 'string', options: { list: ICON_LIST } }),
    defineField({
      name: 'members',
      title: 'People',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'teamMember',
          fields: [str('name', 'Name'), str('role', 'Role'), image('photo', 'Photo'), str('initials', 'Initials (shown when there is no photo)')],
          preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'title', members: 'members' }, prepare: ({ title, members }) => ({ title, subtitle: `${members?.length || 0} people` }) },
});

export const ourTeamPage = page('ourTeamPage', 'Our Team page', '/our-team', [
  hero,
  section('intro', 'Introduction', [str('heading', 'Heading'), txt('text', 'Text', 4)]),
  defineField({ name: 'groups', title: 'Departments', type: 'array', of: [teamGroup] }),
  section('join', 'Join our team', [str('heading', 'Heading'), txt('text', 'Text'), defineField({ name: 'button', title: 'Button', type: 'link' })]),
]);

const faqCategory = defineArrayMember({
  type: 'object',
  name: 'faqCategory',
  fields: [str('title', 'Category'), list('faqs', 'Questions', 'faq')],
  preview: { select: { title: 'title', faqs: 'faqs' }, prepare: ({ title, faqs }) => ({ title, subtitle: `${faqs?.length || 0} questions` }) },
});

export const faqPage = page('faqPage', 'FAQ page', '/faq', [
  hero,
  defineField({ name: 'categories', title: 'Question categories', type: 'array', of: [faqCategory] }),
  cta('cta', 'Still have a question?'),
]);

export const contactPage = page('contactPage', 'Contact page', '/contact', [
  hero,
  str('detailsHeading', 'Contact details heading', { description: 'Phone, address and company number come from Site Settings' }),
  txt('formNote', 'Note under the contact details', 2),
  defineField({ name: 'bookingCard', title: 'Booking card', type: 'object', fields: [str('heading', 'Heading'), txt('text', 'Text', 2), defineField({ name: 'button', title: 'Button', type: 'link' })] }),
  defineField({
    name: 'bookingPrompt',
    title: 'Booking pop-up',
    type: 'object',
    description: 'Opens a second after the page loads, to steer bookings to the booking form',
    fields: [
      defineField({ name: 'enabled', title: 'Show the pop-up', type: 'boolean', initialValue: true }),
      str('heading', 'Heading'),
      txt('text', 'Text', 2),
      defineField({ name: 'button', title: 'Button', type: 'link' }),
      rich('note', 'Small print'),
    ],
  }),
]);

export const bookingPage = page('bookingPage', 'Booking page', '/booking', [hero]);

export const pricingPage = page('pricingPage', 'Pricing page', '/pricing', [
  defineField({ ...hero, description: 'The main button scrolls to the pricing form' }),
  str('callButtonLabel', 'Header: "Book a call" button text'),
  section('why', 'Why prices are not shown', [
    str('heading', 'Heading'),
    txt('text', 'Opening text', 2),
    str('factorsHeading', 'Factors heading'),
    strings('factors', 'Factors'),
    rich('closing', 'Closing text'),
  ]),
  section('form', 'Pricing request form', [str('heading', 'Heading'), txt('text', 'Text', 2), str('note', 'Small note')]),
  section('networkCta', 'Find your local office', [str('heading', 'Heading'), txt('text', 'Text', 2), defineField({ name: 'button', title: 'Button', type: 'link' })]),
]);

const sampleDocument = defineArrayMember({
  type: 'object',
  name: 'sampleDocument',
  fields: [
    str('name', 'Report type', { description: 'e.g. Inventory, Check-Out — used in the download form', validation: (Rule: { required: () => unknown }) => Rule.required() }),
    str('title', 'Card title'),
    txt('description', 'Card text'),
    defineField({ name: 'file', title: 'Sample PDF', type: 'file', options: { accept: 'application/pdf' }, description: 'Given to visitors after they fill in the form' }),
  ],
  preview: { select: { title: 'title', file: 'file.asset.originalFilename' }, prepare: ({ title, file }) => ({ title, subtitle: file || 'No PDF uploaded yet' }) },
});

export const sampleDocumentsPage = page('sampleDocumentsPage', 'Sample Documents page', '/sample-documents', [
  hero,
  defineField({ name: 'documents', title: 'Sample reports', type: 'array', of: [sampleDocument] }),
  cta(),
]);

export const newsPage = page('newsPage', 'News page', '/news', [
  hero,
  str('emptyText', 'Shown when there are no posts'),
  section('postCta', 'Box under each news post', [str('heading', 'Heading'), str('text', 'Text'), defineField({ name: 'button', title: 'Button', type: 'link' })]),
]);

const territoryHint = { description: 'Use {territory} for the franchise area name' };

export const ourNetworkPage = page(
  'ourNetworkPage',
  'Our Network page',
  '/our-network',
  [
    hero,
    str('searchPlaceholder', 'Search box text'),
    section('noResults', 'No results', [str('heading', 'Heading'), txt('text', 'Text (use {search} for what was searched)', 2)]),
    section('headOffice', 'Head Office card (shown when nothing is found)', [
      str('initials', 'Initials'),
      str('name', 'Name'),
      str('tagline', 'Tagline'),
      str('basedIn', 'Based in'),
      defineField({ name: 'button', title: 'Link', type: 'link' }),
    ]),
    { ...section('profileHero', 'Profile page header', [str('heading', 'Heading', territoryHint), txt('subheading', 'Text', 2), defineField({ name: 'primaryButton', title: 'Main button', type: 'link' }), defineField({ name: 'secondaryButton', title: 'Second button', type: 'link' })]), group: 'profile' },
    { ...section('profileIntro', 'Profile: introduction', [str('heading', 'Heading', territoryHint), defineField({ name: 'defaultText', title: 'Text (when the franchise has not written its own)', type: 'richText', ...territoryHint })]), group: 'profile' },
    { ...section('profileServices', 'Profile: services', [str('heading', 'Heading', territoryHint), list('items', 'Services', 'featureItem')]), group: 'profile' },
    { ...section('profileAreas', 'Profile: areas and postcodes', [str('areasHeading', 'Areas heading', territoryHint), str('areasText', 'Areas text'), str('postcodesHeading', 'Postcodes heading', territoryHint), str('postcodesText', 'Postcodes text')]), group: 'profile' },
    { ...section('profileWhy', 'Profile: why choose us', [str('heading', 'Heading', territoryHint), list('items', 'Reasons', 'featureItem')]), group: 'profile' },
    { ...section('profileCta', 'Profile: call to action', [str('heading', 'Heading', territoryHint), txt('text', 'Text', 2), defineField({ name: 'primaryButton', title: 'Main button', type: 'link' }), defineField({ name: 'secondaryButton', title: 'Second button', type: 'link' })]), group: 'profile' },
    { ...section('profileSeo', 'Profile: SEO', [str('title', 'Page title', territoryHint), txt('description', 'Description (use {territory} and {towns})', 2)]), group: 'profile' },
  ],
  [group('profile', 'Franchise profile pages')]
);

export const pageTypes = [servicesPage, homePage, aboutPage, franchisePage, careersPage, ourTeamPage, faqPage, contactPage, bookingPage, pricingPage, sampleDocumentsPage, newsPage, ourNetworkPage];
export const PAGE_SINGLETONS = [
  { id: 'homePage', title: 'Home page' },
  { id: 'servicesPage', title: 'Services page' },
  { id: 'aboutPage', title: 'About page' },
  { id: 'franchisePage', title: 'Franchise page' },
  { id: 'careersPage', title: 'Careers page' },
  { id: 'ourTeamPage', title: 'Our Team page' },
  { id: 'faqPage', title: 'FAQ page' },
  { id: 'contactPage', title: 'Contact page' },
  { id: 'bookingPage', title: 'Booking page' },
  { id: 'pricingPage', title: 'Pricing page' },
  { id: 'sampleDocumentsPage', title: 'Sample Documents page' },
  { id: 'newsPage', title: 'News page' },
  { id: 'ourNetworkPage', title: 'Our Network page' },
];
export { page, hero, cta, str, txt, rich, image, list, strings, section, defineArrayMember };
