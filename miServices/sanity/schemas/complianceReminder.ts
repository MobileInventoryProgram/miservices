import { defineArrayMember, defineField, defineType } from 'sanity';

/** A reminder email sent to a franchise about outstanding compliance items */
export default defineType({
  name: 'complianceReminder',
  title: 'Compliance reminder',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'franchise', title: 'Franchise', type: 'reference', to: [{ type: 'franchisee' }], weak: true }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'complianceReminderItem',
          fields: [
            defineField({ name: 'requirement', type: 'reference', to: [{ type: 'complianceRequirement' }], weak: true }),
            defineField({ name: 'period', type: 'string' }),
            defineField({ name: 'state', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({ name: 'sentTo', title: 'Sent to', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'sentAt', title: 'Sent at', type: 'datetime' }),
    defineField({ name: 'kind', title: 'Automatic or manual', type: 'string' }),
    defineField({ name: 'sentBy', title: 'Sent by', type: 'string' }),
  ],
  preview: { select: { title: 'franchise.territory', subtitle: 'sentAt' } },
});
