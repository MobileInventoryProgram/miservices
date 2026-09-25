import { defineField, defineType } from 'sanity';

const tile = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [defineField({ name: 'title', title: 'Title', type: 'string' }), defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 })],
  });
const heading = (name: string, title: string, extra: string[] = []) =>
  defineField({
    name,
    title,
    type: 'object',
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({ name: 'heading', title: 'Heading', type: 'string' }),
      defineField({ name: 'intro', title: 'Intro', type: 'string' }),
      ...extra.map((f) => defineField({ name: f, title: { introAdmin: 'Intro (Head Office)', empty: 'Shown when there is nothing yet', emptyLink: 'Empty: button text' }[f] || f, type: 'string' })),
    ],
  });

/** Singleton: the wording of the Franchise Login area (buttons and form labels stay in code) */
export default defineType({
  name: 'membersArea',
  title: 'Franchise Login text',
  type: 'document',
  groups: [
    { name: 'login', title: 'Login & dashboard', default: true },
    { name: 'sections', title: 'Sections' },
  ],
  fields: [
    defineField({
      name: 'login',
      title: 'Login page',
      type: 'object',
      group: 'login',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'intro', title: 'Text under the heading', type: 'string' }),
        defineField({ name: 'forgotText', title: 'Forgotten password text', type: 'string' }),
        defineField({ name: 'needAccessText', title: '"Need access?" text', type: 'string' }),
        defineField({ name: 'needAccessLink', title: '"Need access?" link', type: 'link' }),
      ],
    }),
    defineField({
      name: 'dashboard',
      title: 'Dashboard tiles',
      type: 'object',
      group: 'login',
      fields: [tile('documents', 'Documents'), tile('pricingQuoting', 'Pricing & Quoting'), tile('assets', 'Assets'), tile('contacts', 'Contacts')],
    }),
    { ...heading('documents', 'Documents', ['empty']), group: 'sections' },
    defineField({ name: 'documentNotice', title: 'Notice under each document', type: 'string', group: 'sections' }),
    {
      ...defineField({
        name: 'pricingQuoting',
        title: 'Pricing & Quoting',
        type: 'object',
        options: { collapsible: true, collapsed: true },
        fields: [
          defineField({ name: 'heading', title: 'Heading', type: 'string' }),
          defineField({ name: 'intro', title: 'Intro', type: 'string' }),
          tile('myPricing', 'Tile: My Pricing'),
          tile('pricingDocuments', 'Tile: Pricing Documents'),
          tile('quoting', 'Tile: Quoting'),
          tile('standardPriceLists', 'Tile: Standard Price Lists (Head Office)'),
          tile('quoteTemplate', 'Tile: Quote Template (Head Office)'),
        ],
      }),
      group: 'sections',
    },
    { ...heading('myPricing', 'My Pricing', ['empty']), group: 'sections' },
    { ...heading('pricingDocuments', 'Pricing Documents', ['empty']), group: 'sections' },
    { ...heading('quotes', 'Quotes', ['introAdmin', 'empty']), group: 'sections' },
    { ...heading('contacts', 'Contacts', ['introAdmin', 'empty']), group: 'sections' },
    {
      ...defineField({
        name: 'assets',
        title: 'Assets',
        type: 'object',
        options: { collapsible: true, collapsed: true },
        fields: [
          defineField({ name: 'heading', title: 'Heading', type: 'string' }),
          defineField({ name: 'intro', title: 'Intro', type: 'string' }),
          tile('brand', 'Tile: Brand Assets'),
          tile('social', 'Tile: Social Post Creator'),
          defineField({ name: 'brandIntro', title: 'Brand Assets page intro', type: 'string' }),
          defineField({ name: 'socialIntro', title: 'Social Post Creator page intro', type: 'string' }),
        ],
      }),
      group: 'sections',
    },
  ],
  preview: { prepare: () => ({ title: 'Franchise Login text' }) },
});
