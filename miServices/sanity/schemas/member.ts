import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'member',
  title: 'Member',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'hashedPassword',
      title: 'Hashed Password',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Franchisee', value: 'franchisee' },
          { title: 'Admin', value: 'admin' },
        ],
      },
      initialValue: 'franchisee',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'franchisee',
      title: 'Franchisee',
      type: 'reference',
      to: [{ type: 'franchisee' }],
      description: 'Link to the franchisee document. Takes priority over the territory string for resolution.',
    }),
    defineField({
      name: 'territory',
      title: 'Territory',
      type: 'string',
      description: 'Legacy fallback — used only if the franchisee reference is not set',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      role: 'role',
    },
    prepare({ title, subtitle, role }) {
      return {
        title: title || subtitle,
        subtitle: `${role || 'franchisee'} ${subtitle ? `- ${subtitle}` : ''}`,
      };
    },
  },
});
