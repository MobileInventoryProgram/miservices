import { defineArrayMember, defineField, defineType } from 'sanity';
import { RECORD_STATUSES } from '../../lib/compliance/options';

/** A franchise's submission (or Head Office's decision) for one requirement and period */
export default defineType({
  name: 'complianceRecord',
  title: 'Compliance record',
  type: 'document',
  fields: [
    defineField({ name: 'franchise', title: 'Franchise', type: 'reference', to: [{ type: 'franchisee' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'requirement', title: 'Requirement', type: 'reference', to: [{ type: 'complianceRequirement' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'period', title: 'Period', type: 'string', description: 'once, 2026, 2026-09, 2026-W40 or the expiry cycle' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: RECORD_STATUSES.map((s) => ({ title: s.title, value: s.value })) },
    }),
    defineField({
      name: 'files',
      title: 'Files',
      type: 'array',
      of: [defineArrayMember({ type: 'file', name: 'complianceFile', fields: [defineField({ name: 'name', type: 'string', title: 'File name' })] })],
    }),
    defineField({ name: 'expiresOn', title: 'Expires on', type: 'date' }),
    defineField({ name: 'note', title: "Franchisee's note", type: 'text', rows: 2 }),
    defineField({ name: 'submittedBy', title: 'Submitted by', type: 'string' }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime' }),
    defineField({ name: 'reviewedBy', title: 'Reviewed by', type: 'string' }),
    defineField({ name: 'reviewedAt', title: 'Reviewed at', type: 'datetime' }),
    defineField({ name: 'reviewNote', title: "Head Office's note", type: 'text', rows: 2 }),
    defineField({
      name: 'history',
      title: 'History',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'complianceEvent',
          fields: [
            defineField({ name: 'action', type: 'string' }),
            defineField({ name: 'by', type: 'string' }),
            defineField({ name: 'at', type: 'datetime' }),
            defineField({ name: 'note', type: 'text' }),
          ],
          preview: { select: { title: 'action', subtitle: 'at' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'requirement.title', subtitle: 'franchise.territory', period: 'period' } },
});
