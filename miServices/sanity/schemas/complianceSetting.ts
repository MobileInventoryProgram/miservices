import { defineField, defineType } from 'sanity';

/** One franchise's exception to a requirement: not applicable, or extra time */
export default defineType({
  name: 'complianceSetting',
  title: 'Compliance setting',
  type: 'document',
  fields: [
    defineField({ name: 'franchise', title: 'Franchise', type: 'reference', to: [{ type: 'franchisee' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'requirement', title: 'Requirement', type: 'reference', to: [{ type: 'complianceRequirement' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'notApplicable', title: 'Not applicable to this franchise', type: 'boolean' }),
    defineField({ name: 'extraDays', title: 'Extra days to complete', type: 'number' }),
    defineField({ name: 'note', title: 'Note', type: 'string' }),
  ],
  preview: { select: { title: 'requirement.title', subtitle: 'franchise.territory' } },
});
