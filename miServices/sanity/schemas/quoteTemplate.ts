import { defineField, defineType } from 'sanity';

/**
 * Singleton: the Head Office quote template (Members Area → Quote Template).
 * Empty fields fall back to DEFAULT_QUOTE_TEMPLATE in lib/quote/template.ts.
 */
export default defineType({
  name: 'quoteTemplate',
  title: 'Quote Template',
  type: 'document',
  fields: [
    defineField({
      name: 'cover',
      title: 'Cover page',
      type: 'object',
      fields: [
        defineField({ name: 'headline', title: 'Headline', type: 'string', description: 'e.g. Proposal for {companyName}' }),
        defineField({ name: 'intro', title: 'Intro line', type: 'string' }),
      ],
    }),
    defineField({
      name: 'booking',
      title: 'Head Office booking contacts',
      type: 'object',
      fields: [
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'url', title: 'Online booking address', type: 'string' }),
      ],
    }),
    defineField({
      name: 'miProgram',
      title: 'miProgram licence pricing',
      type: 'object',
      fields: [
        defineField({ name: 'discountPercent', title: 'miServices client discount (%)', type: 'number' }),
        defineField({
          name: 'tiers',
          title: 'Tiers',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'upTo', title: 'Up to (properties)', type: 'number' }),
                defineField({ name: 'monthly', title: 'Monthly (£ ex VAT)', type: 'number' }),
                defineField({ name: 'annual', title: 'Annual (£ ex VAT)', type: 'number' }),
              ],
              preview: {
                select: { upTo: 'upTo', monthly: 'monthly', annual: 'annual' },
                prepare: ({ upTo, monthly, annual }) => ({ title: `Up to ${upTo}: £${monthly}/month, £${annual}/year` }),
              },
            },
          ],
        }),
        defineField({ name: 'note', title: 'Small print', type: 'text', rows: 3 }),
        defineField({ name: 'url', title: 'Pricing web address', type: 'string' }),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      description:
        'In order. Locked sections are Head Office wording only; editable ones are a starting point franchisees can rewrite; the pricing section shows the chosen price list. Blank lines separate paragraphs, lines starting "- " become bullet points, and {placeholders} such as {clientFirstName}, {companyName}, {franchiseName}, {territory}, {ownerNames}, {senderName}, {propertyCount}, {jobTypes} and {validUntil} are filled in.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'key',
              title: 'Key',
              type: 'string',
              description: 'Stable ID, e.g. "about". Do not change once quotes use it.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'mode',
              title: 'Mode',
              type: 'string',
              options: {
                list: [
                  { value: 'locked', title: 'Locked — Head Office wording' },
                  { value: 'editable', title: 'Editable by franchisee' },
                  { value: 'pricing', title: 'Pricing (price list table)' },
                  { value: 'miprogram', title: 'miProgram pricing (tier table)' },
                ],
                layout: 'radio',
              },
              initialValue: 'locked',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 8 }),
            defineField({ name: 'hint', title: 'Hint for franchisees', type: 'string' }),
          ],
          preview: {
            select: { title: 'title', mode: 'mode' },
            prepare: ({ title, mode }) => ({ title, subtitle: mode }),
          },
        },
      ],
    }),
    defineField({ name: 'validityDays', title: 'Default validity (days)', type: 'number', initialValue: 30 }),
    defineField({ name: 'emailSubject', title: 'Email subject', type: 'string' }),
    defineField({ name: 'emailMessage', title: 'Default email message', type: 'text', rows: 8 }),
  ],
  preview: { prepare: () => ({ title: 'Quote Template' }) },
});
