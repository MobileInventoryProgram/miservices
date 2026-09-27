import { link } from './helpers';

const t = (title: string, description: string) => ({ title, description });

/** Copied from the previous hardcoded Members Area pages; document sections from the old hardcoded list */
export default [
  {
    _id: 'membersArea',
    _type: 'membersArea',
    login: {
      heading: 'Members Area',
      intro: 'Sign in to access your documents',
      forgotText: 'Forgot your password? Contact your franchisor to have it reset.',
      needAccessText: 'Need access?',
      needAccessLink: link('Contact us', '/contact'),
    },
    dashboard: {
      documents: t('Documents', 'General documents, operating procedures, personnel & training'),
      pricingQuoting: t('Pricing & Quoting', 'Your pricing, pricing documents and quoting guides'),
      assets: t('Assets', 'Brand assets and social post templates'),
      contacts: t('Contacts', 'Your clients and prospects, ready to quote'),
    },
    documents: { heading: 'Documents', intro: 'Browse documents by subcategory', empty: 'No documents in this subcategory yet.' },
    documentNotice: 'Internal miServices document — for viewing in Members Area only. Please do not share or copy.',
    pricingQuoting: {
      heading: 'Pricing & Quoting',
      intro: 'Your pricing, pricing documents and quoting guides',
      myPricing: t('My Pricing', 'Adjust your territory pricing and overrides'),
      pricingDocuments: t('Pricing Documents', 'Print-ready PDF leaflets and shareable links for your price lists'),
      quoting: t('Quoting', 'Build and send bespoke quotes to your clients'),
      standardPriceLists: t('Standard Price Lists', 'Create and edit Head Office price lists, and view every franchise’s pricing'),
      quoteTemplate: t('Quote Template', 'Edit the standard wording, booking details and miProgram pricing in every quote'),
    },
    myPricing: { heading: 'My Pricing', empty: "You don't have any price lists yet. Duplicate a shared template to get started." },
    pricingDocuments: {
      heading: 'Pricing Documents',
      intro: 'Print-ready PDF leaflets and shareable links for your price lists',
      empty: "You don't have any price lists yet. Create one in My Pricing.",
    },
    quotes: { heading: 'Quotes', intro: 'Bespoke quotes for your clients', introAdmin: 'Quotes across all franchises', empty: 'No quotes yet.' },
    contacts: { heading: 'Contacts', intro: 'Your clients and prospects', introAdmin: 'All franchise contacts', empty: 'No contacts yet.' },
    assets: {
      heading: 'Assets',
      intro: 'Brand assets and social post templates',
      brand: t('Brand Assets', 'On-brand banners and covers for LinkedIn, Facebook, X, email and your profile picture — ready to download.'),
      social: t('Social Post Creator', 'Ready-made post templates: reviews, quotes, announcements, milestones, events and tips. Just add your words and a photo.'),
      brandIntro: 'Banners, covers and profile pictures, sized for each channel',
      socialIntro: 'Pick a template, add your words and a photo, and download an on-brand post.',
    },
  },
  ...[
    ['general', 'General', 'General documents and information', 'fileText', 'bg-blue-500'],
    ['operating-procedures', 'Operating Procedures', 'Standard operating procedures and guidelines', 'settings', 'bg-indigo-500'],
    ['personnel', 'Personnel', 'Personnel-related documents and forms', 'users', 'bg-teal-500'],
    ['training', 'Training', 'Training materials and resources', 'bookOpen', 'bg-orange-500'],
  ].map(([slug, title, description, icon, colour], i) => ({
    _id: `docSection-${slug}`,
    _type: 'documentSection',
    title,
    slug: { _type: 'slug', current: slug },
    description,
    icon,
    colour,
    order: i + 1,
  })),
];
