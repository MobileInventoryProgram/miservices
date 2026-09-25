import { defineField, defineType } from 'sanity';

/** "Who we work with" pages: Landlords, Lettings Agents, Property Managers (same layout) */
export default defineType({
  name: 'audiencePage',
  title: 'Audience page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Name (for Studio)', type: 'string', group: 'content', readOnly: true }),
    defineField({ name: 'path', title: 'Web address', type: 'string', group: 'content', readOnly: true }),
    defineField({ name: 'hero', title: 'Page header', type: 'hero', group: 'content' }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'object',
      group: 'content',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'text', title: 'Text', type: 'text', rows: 4 }),
        defineField({ name: 'points', title: 'Key points (ticked list)', type: 'array', of: [{ type: 'string' }] }),
      ],
    }),
    defineField({ name: 'servicesHeading', title: 'Services heading', type: 'string', group: 'content' }),
    defineField({ name: 'services', title: 'Service cards', type: 'array', of: [{ type: 'featureItem' }], group: 'content', description: 'Title, description and the page it links to' }),
    defineField({ name: 'benefitsHeading', title: 'Benefits heading', type: 'string', group: 'content' }),
    defineField({ name: 'benefits', title: 'Benefits', type: 'array', of: [{ type: 'featureItem' }], group: 'content' }),
    defineField({ name: 'processHeading', title: '"How it works" heading', type: 'string', group: 'content' }),
    defineField({ name: 'processSteps', title: 'How it works: steps (optional)', type: 'array', of: [{ type: 'step' }], group: 'content' }),
    defineField({ name: 'cta', title: 'Call to action (bottom of page)', type: 'cta', group: 'content' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: { select: { title: 'title', subtitle: 'path' } },
});
