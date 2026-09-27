import { defineField, defineType } from 'sanity';

/**
 * Singleton: marketing wording printed on every A5 price flyer
 * (Members Area → Pricing leaflets). Empty fields fall back to the
 * wording from the original leaflet (DEFAULT_FLYER_SETTINGS in lib/flyer/data.ts).
 */
export default defineType({
  name: 'flyerSettings',
  title: 'Flyer Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'showOffer',
      title: 'Show Offer',
      type: 'boolean',
      description: 'Show the offer (e.g. "First Inventory FREE") at the top of the flyer.',
      initialValue: true,
    }),
    defineField({ name: 'offerEyebrow', title: 'Offer Eyebrow', type: 'string', description: 'e.g. TRY US OUT TODAY' }),
    defineField({ name: 'offerHeadline', title: 'Offer Headline', type: 'string', description: 'e.g. First Inventory FREE*' }),
    defineField({ name: 'offerSmallPrint', title: 'Offer Small Print', type: 'string', description: 'e.g. *terms apply' }),
    defineField({
      name: 'introText',
      title: 'Intro Text',
      type: 'text',
      rows: 4,
      description: 'Shown beside the headline price. "miServices" is printed in bold.',
    }),
    defineField({
      name: 'sellingPoints',
      title: 'Selling Points',
      type: 'array',
      description: 'Tick list on the front of the flyer (7 fit comfortably).',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'prefix', title: 'Small text before (optional)', type: 'string' }),
            defineField({ name: 'highlight', title: 'Highlight', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'detail', title: 'Small text after (optional)', type: 'string' }),
          ],
          preview: {
            select: { prefix: 'prefix', highlight: 'highlight', detail: 'detail' },
            prepare: ({ prefix, highlight, detail }) => ({
              title: [prefix, highlight, detail].filter(Boolean).join(' '),
            }),
          },
        },
      ],
    }),
    defineField({ name: 'bookingPhone', title: 'Booking Phone', type: 'string' }),
    defineField({ name: 'bookingEmail', title: 'Booking Email', type: 'string' }),
    defineField({ name: 'bookingUrl', title: 'Booking Web Address', type: 'string' }),
    defineField({ name: 'websiteNote', title: 'Website Note', type: 'string', description: 'Small line near the bottom of the price table side.' }),
    defineField({ name: 'vatNote', title: 'VAT Note', type: 'string' }),
  ],
  preview: {
    prepare: () => ({ title: 'Flyer Settings' }),
  },
});
