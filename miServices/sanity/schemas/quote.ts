import { defineField, defineType } from 'sanity';
import { JOB_TYPES } from '../../lib/job-types';

/**
 * A bespoke quote sent to a contact. Belongs to a franchise; built from the
 * Quote Template. Once sent, its sections and price snapshot are frozen.
 * Created in Members Area → Quotes.
 */
export default defineType({
  name: 'quote',
  title: 'Quote',
  type: 'document',
  fields: [
    defineField({ name: 'reference', title: 'Reference', type: 'string', readOnly: true }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['draft', 'sent', 'viewed', 'accepted', 'declined'].map((value) => ({
          value,
          title: value.charAt(0).toUpperCase() + value.slice(1),
        })),
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'franchise',
      title: 'Franchise',
      type: 'reference',
      to: [{ type: 'franchisee' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'owner', title: 'Owner', type: 'reference', to: [{ type: 'member' }], weak: true }),
    defineField({ name: 'contact', title: 'Contact', type: 'reference', to: [{ type: 'contact' }], weak: true }),
    defineField({ name: 'priceList', title: 'Price List', type: 'reference', to: [{ type: 'priceList' }], weak: true }),
    defineField({
      name: 'priceSnapshot',
      title: 'Price snapshot (JSON)',
      type: 'text',
      readOnly: true,
      description: 'The price list as it was when the quote was sent.',
    }),
    defineField({
      name: 'templateSnapshot',
      title: 'Template snapshot (JSON)',
      type: 'text',
      readOnly: true,
      description: 'Cover and miProgram prices as they were when the quote was sent.',
    }),
    defineField({ name: 'propertyCount', title: 'Number of Properties', type: 'number' }),
    defineField({
      name: 'jobTypes',
      title: 'Job Types',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: JOB_TYPES.map(({ value, label }) => ({ value, title: label })) },
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'key', type: 'string' }),
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'mode', type: 'string' }),
            defineField({ name: 'text', type: 'text' }),
          ],
          preview: { select: { title: 'title', subtitle: 'mode' } },
        },
      ],
    }),
    defineField({ name: 'emailSubject', title: 'Email subject', type: 'string' }),
    defineField({ name: 'emailMessage', title: 'Email message', type: 'text' }),
    defineField({ name: 'validUntil', title: 'Valid until', type: 'date' }),
    defineField({ name: 'shareToken', title: 'Share token', type: 'string', readOnly: true }),
    defineField({ name: 'sentTo', title: 'Sent to', type: 'string', readOnly: true }),
    defineField({ name: 'createdAt', title: 'Created', type: 'datetime', readOnly: true }),
    defineField({ name: 'updatedAt', title: 'Updated', type: 'datetime', readOnly: true }),
    defineField({ name: 'sentAt', title: 'Sent', type: 'datetime', readOnly: true }),
    defineField({ name: 'viewedAt', title: 'First viewed', type: 'datetime', readOnly: true }),
    defineField({ name: 'respondedAt', title: 'Accepted / declined', type: 'datetime', readOnly: true }),
    defineField({ name: 'respondedByName', title: 'Accepted / declined by', type: 'string', readOnly: true }),
    defineField({ name: 'declineReason', title: 'Decline reason', type: 'text', readOnly: true }),
  ],
  preview: {
    select: {
      reference: 'reference',
      status: 'status',
      company: 'contact.companyName',
      firstName: 'contact.firstName',
      lastName: 'contact.lastName',
      franchise: 'franchise.companyName',
    },
    prepare: ({ reference, status, company, firstName, lastName, franchise }) => ({
      title: `${reference || 'Quote'} — ${company || [firstName, lastName].filter(Boolean).join(' ') || 'No client'}`,
      subtitle: [status, franchise].filter(Boolean).join(' · '),
    }),
  },
  orderings: [{ title: 'Newest', name: 'createdDesc', by: [{ field: 'createdAt', direction: 'desc' }] }],
});
