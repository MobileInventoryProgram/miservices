import { defineField, defineType } from 'sanity';
import { ICON_OPTIONS } from '../../lib/cms/icon-names';
import { DEFAULT_SECTION_COLOUR, SECTION_COLOURS } from '../../lib/documents/sections';

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
      options: { list: SECTION_COLOURS },
      initialValue: DEFAULT_SECTION_COLOUR,
    }),
    defineField({ name: 'order', title: 'Position', type: 'number' }),
  ],
  orderings: [{ title: 'Position', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'description' } },
});
