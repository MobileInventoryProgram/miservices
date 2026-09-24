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
      name: 'subcategory',
      title: 'Subcategory',
      type: 'string',
      options: {
        list: [
          { title: 'General', value: 'general' },
          { title: 'Operating Procedures', value: 'operating-procedures' },
          { title: 'Personnel', value: 'personnel' },
          { title: 'Training', value: 'training' },
        ],
      },
      hidden: ({ parent }) => parent?.category !== 'documents',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { category?: string };
          if (parent?.category === 'documents' && !value) {
            return 'Subcategory is required when category is Documents';
          }
          return true;
        }),
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
        { type: 'block' },
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
        'The document content, shown to logged-in members only (it cannot be downloaded). Edit and publish here — changes appear in Franchise Login immediately.',
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
      subcategory: 'subcategory',
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
      const subcategoryLabels: Record<string, string> = {
        general: 'General',
        'operating-procedures': 'Operating Procedures',
        personnel: 'Personnel',
        training: 'Training',
      };
      const catLabel = categoryLabels[category] || category;
      const subLabel = subcategory ? ` → ${subcategoryLabels[subcategory] || subcategory}` : '';
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
