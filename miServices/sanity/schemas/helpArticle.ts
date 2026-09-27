import { defineArrayMember, defineField, defineType } from 'sanity';
import { HELP_TOPICS } from '../../lib/help/topics';

/**
 * A Help Centre answer: a common question with a short answer, linking to the
 * document sections it comes from. Managed by Head Office in the Members Area.
 */
export default defineType({
  name: 'helpArticle',
  title: 'Help answer',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (Rule) => Rule.required().max(200) }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      description: 'Keep it short: the linked document has the detail.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          lists: [{ title: 'Bullets', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }],
            annotations: [
              defineArrayMember({
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [defineField({ name: 'href', type: 'string', title: 'Address' })],
              }),
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'string',
      options: { list: HELP_TOPICS.map((t) => ({ title: t.title, value: t.value })) },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sources',
      title: 'Where the answer comes from',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'helpSource',
          fields: [
            defineField({ name: 'document', title: 'Document', type: 'reference', to: [{ type: 'memberDocument' }], validation: (Rule) => Rule.required() }),
            defineField({ name: 'headingKey', title: 'Section (heading key)', type: 'string', description: 'Set from Members Area → Help' }),
            defineField({ name: 'headingText', title: 'Section name', type: 'string' }),
          ],
          preview: { select: { title: 'document.title', subtitle: 'headingText' } },
        }),
      ],
    }),
    defineField({ name: 'keywords', title: 'Search words', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'order', title: 'Position in topic', type: 'number' }),
    defineField({ name: 'isPublished', title: 'Visible to members', type: 'boolean', initialValue: true }),
  ],
  orderings: [{ title: 'Topic', name: 'topicAsc', by: [{ field: 'topic', direction: 'asc' }, { field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'question', subtitle: 'topic' } },
});
