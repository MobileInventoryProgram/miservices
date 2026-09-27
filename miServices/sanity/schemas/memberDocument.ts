import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'memberDocument',
  title: 'Member Document',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Documents', value: 'documents' },
          { title: 'Pricing', value: 'pricing' },
          { title: 'Assets', value: 'assets' },
          { title: 'Contacts', value: 'contacts' },
          { title: 'Quoting', value: 'quoting' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'reference',
      to: [{ type: 'documentSection' }],
      hidden: ({ parent }) => parent?.category !== 'documents',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { category?: string };
          return parent?.category === 'documents' && !value ? 'Choose the section this document belongs in' : true;
        }),
    }),
    defineField({
      // Previous way of storing the section; kept in step by Members Area and used if Section is empty
      name: 'subcategory',
      title: 'Section (legacy)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      description: 'Upload a PDF or other document file',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          // The member document standard (lib/documents/standard.ts): two heading levels, simple lists and marks
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Section', value: 'h2' },
            { title: 'Subsection', value: 'h3' },
          ],
          lists: [
            { title: 'Bullets', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'Web address', validation: (Rule) => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }) }],
              },
            ],
          },
        },
        {
          name: 'table',
          title: 'Table',
          type: 'object',
          fields: [
            { name: 'headerRow', title: 'First row is a header', type: 'boolean', initialValue: true },
            {
              name: 'rows',
              title: 'Rows',
              type: 'array',
              of: [
                {
                  name: 'tableRow',
                  title: 'Row',
                  type: 'object',
                  fields: [{ name: 'cells', title: 'Cells', type: 'array', of: [{ type: 'string' }] }],
                  preview: {
                    select: { cells: 'cells' },
                    prepare: ({ cells }) => ({ title: (cells || []).join(' | ') }),
                  },
                },
              ],
            },
          ],
          preview: {
            select: { rows: 'rows' },
            prepare: ({ rows }) => ({ title: 'Table', subtitle: `${rows?.length || 0} rows` }),
          },
        },
        {
          name: 'contacts',
          title: 'Contact cards',
          type: 'object',
          fields: [
            {
              name: 'people',
              title: 'People',
              type: 'array',
              of: [
                {
                  name: 'contactPerson',
                  title: 'Person',
                  type: 'object',
                  fields: [
                    { name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() },
                    { name: 'role', title: 'Role', type: 'string' },
                    { name: 'phone', title: 'Phone', type: 'string' },
                    { name: 'email', title: 'Email', type: 'string' },
                    { name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } },
                  ],
                  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
                },
              ],
            },
          ],
          preview: {
            select: { people: 'people' },
            prepare: ({ people }) => ({ title: 'Contact cards', subtitle: (people || []).map((p: { name?: string }) => p.name).join(', ') }),
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alternative text', type: 'string', description: 'Describe the image for screen readers' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
      ],
      description:
        'The document content, shown to logged-in members only (it cannot be downloaded). Edit and publish here — changes appear in Members Area immediately.',
    }),
    defineField({
      name: 'numberHeadings',
      title: 'Number headings',
      type: 'boolean',
      description: 'Show section numbers (1, 1.1, 1.2…) worked out from the headings. Never type numbers into headings.',
      initialValue: false,
    }),
    defineField({
      name: 'targetFranchisees',
      title: 'Assign to Franchisees',
      description: 'Leave empty to show to all members. Select specific franchisees to restrict access.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'franchisee' }] }],
    }),
    defineField({
      name: 'targetMembers',
      title: 'Assign to Members',
      description: 'Leave empty to show to all members. Select specific member accounts to restrict access.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'member' }] }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Published Date',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      subcategory: 'section.title',
      isPublished: 'isPublished',
      targetFranchisees: 'targetFranchisees',
      targetMembers: 'targetMembers',
    },
    prepare({ title, category, subcategory, isPublished, targetFranchisees, targetMembers }) {
      const categoryLabels: Record<string, string> = {
        documents: 'Documents',
        pricing: 'Pricing',
        assets: 'Assets',
        contacts: 'Contacts',
        quoting: 'Quoting',
      };
      const catLabel = categoryLabels[category] || category;
      const subLabel = subcategory ? ` → ${subcategory}` : '';
      const isTargeted =
        (targetFranchisees && targetFranchisees.length > 0) ||
        (targetMembers && targetMembers.length > 0);
      return {
        title: isTargeted ? `🔒 ${title}` : title,
        subtitle: `${catLabel}${subLabel}${isPublished === false ? ' (Draft)' : ''}${isTargeted ? ' (Targeted)' : ''}`,
      };
    },
  },
});
