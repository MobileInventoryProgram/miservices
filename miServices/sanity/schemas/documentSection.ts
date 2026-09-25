import { defineField, defineType } from 'sanity';
import { ICON_OPTIONS } from '../../lib/cms/icon-names';

/** A section of Franchise Login → Documents (General, Operating Procedures…) */
export default defineType({
  name: 'documentSection',
  title: 'Document section',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      options: { source: 'title', maxLength: 60 },
      validation: (Rule) => Rule.required(),
      description: '/members/documents/<this>. Avoid changing it once documents are in the section.',
    }),
    defineField({ name: 'description', title: 'Description', type: 'string' }),
    defineField({ name: 'icon', title: 'Icon', type: 'string', options: { list: ICON_OPTIONS.map((o) => ({ title: o.title, value: o.value })) } }),
    defineField({
      name: 'colour',
      title: 'Tile colour',
      type: 'string',
      options: {
        list: [
          { title: 'Blue', value: 'bg-blue-500' },
          { title: 'Indigo', value: 'bg-indigo-500' },
          { title: 'Teal', value: 'bg-teal-500' },
          { title: 'Orange', value: 'bg-orange-500' },
          { title: 'Green', value: 'bg-green-500' },
          { title: 'Red', value: 'bg-red-500' },
          { title: 'Purple', value: 'bg-purple-500' },
        ],
      },
      initialValue: 'bg-blue-500',
    }),
    defineField({ name: 'order', title: 'Position', type: 'number' }),
  ],
  orderings: [{ title: 'Position', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'description' } },
});
