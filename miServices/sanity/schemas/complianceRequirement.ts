import { defineArrayMember, defineField, defineType } from 'sanity';
import { COMPLIANCE_CATEGORIES, COMPLIANCE_EVIDENCE, COMPLIANCE_FREQUENCIES, WEEKDAYS } from '../../lib/compliance/options';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** One thing every franchise must comply with (Members Area → Compliance → Requirements) */
export default defineType({
  name: 'complianceRequirement',
  title: 'Compliance requirement',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required().max(120) }),
    defineField({ name: 'description', title: 'What is needed', type: 'text', rows: 3 }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: COMPLIANCE_CATEGORIES.map((c) => ({ title: c.title, value: c.value })) },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'frequency',
      title: 'How often',
      type: 'string',
      options: { list: COMPLIANCE_FREQUENCIES.map((f) => ({ title: f.title, value: f.value })) },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'evidence',
      title: 'How it is completed',
      type: 'string',
      options: { list: COMPLIANCE_EVIDENCE.map((e) => ({ title: e.title, value: e.value })) },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'askExpiry', title: 'Ask for an expiry date', type: 'boolean', description: 'Uploads only. Due again on that date (e.g. insurance).' }),
    defineField({ name: 'dueWithinDays', title: 'Due within (days of joining)', type: 'number', description: 'One-off items. Empty = no deadline.' }),
    defineField({ name: 'monthlyDay', title: 'Due on day of month', type: 'number', description: '1–28, or 0 for the last day of the month.' }),
    defineField({ name: 'monthOffset', title: 'Due in the month after', type: 'boolean', description: 'e.g. invoices for September due in October.' }),
    defineField({ name: 'weeklyDay', title: 'Due on', type: 'number', options: { list: WEEKDAYS.map((d, i) => ({ title: d, value: i + 1 })) } }),
    defineField({ name: 'annualMonth', title: 'Due each year in', type: 'number', options: { list: MONTHS.map((m, i) => ({ title: m, value: i + 1 })) } }),
    defineField({ name: 'annualDay', title: 'Due each year on day', type: 'number' }),
    defineField({ name: 'remindBefore', title: 'Remind this many days before', type: 'number', initialValue: 7 }),
    defineField({ name: 'remindEvery', title: 'While overdue, remind every (days)', type: 'number', initialValue: 7 }),
    defineField({ name: 'startsOn', title: 'Tracked from', type: 'date', description: 'Periods before this date are not asked for.' }),
    defineField({
      name: 'sources',
      title: 'Where this comes from',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'complianceSource',
          fields: [
            defineField({ name: 'document', title: 'Document', type: 'reference', to: [{ type: 'memberDocument' }], validation: (Rule) => Rule.required() }),
            defineField({ name: 'headingKey', title: 'Section (heading key)', type: 'string' }),
            defineField({ name: 'headingText', title: 'Section name', type: 'string' }),
          ],
          preview: { select: { title: 'document.title', subtitle: 'headingText' } },
        }),
      ],
    }),
    defineField({ name: 'order', title: 'Position', type: 'number' }),
    defineField({ name: 'isActive', title: 'In use', type: 'boolean', initialValue: true }),
  ],
  orderings: [{ title: 'Category', name: 'categoryAsc', by: [{ field: 'category', direction: 'asc' }, { field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'frequency' } },
});
