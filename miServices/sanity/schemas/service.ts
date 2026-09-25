import { defineField, defineType } from 'sanity';

/**
 * A service page (/services/<slug>). Every section of the page is edited
 * here; a section with no content is simply not shown. New services can be
 * added from Studio.
 */
export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'intro', title: 'Introduction' },
    { name: 'sections', title: 'Page sections' },
    { name: 'cta', title: 'Call to action' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'main', validation: (Rule) => Rule.required(), description: 'e.g. "Pre-Tenancy", "Check-Ins"' }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'main',
      options: { source: 'title', maxLength: 96, slugify: (input: string) => input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
      validation: (Rule) =>
        Rule.required().custom((slug) => (slug?.current && slug.current !== slug.current.toLowerCase() ? 'Use lower case letters only' : true)),
      description: 'The page lives at /services/<this>. Lower case, words separated by dashes.',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Header text',
      type: 'text',
      rows: 4,
      group: 'main',
      validation: (Rule) => Rule.required(),
      description: 'Shown in the blue header at the top of the page, and on the Services page',
    }),
    defineField({ name: 'order', title: 'Position on the Services page', type: 'number', group: 'main', description: 'Lower numbers first; blank sorts alphabetically' }),

    defineField({ name: 'bodyHeading', title: 'Heading', type: 'string', group: 'intro' }),
    defineField({ name: 'bodyIntro', title: 'Introduction', type: 'text', rows: 3, group: 'intro' }),
    defineField({ name: 'bodySubheading', title: 'Subheading', type: 'string', group: 'intro' }),
    defineField({ name: 'bodyText', title: 'Text', type: 'richText', group: 'intro' }),
    defineField({ name: 'bodyImage', title: 'Image', type: 'imageWithAlt', group: 'intro' }),

    defineField({ name: 'featuresHeading', title: 'Features heading', type: 'string', group: 'sections' }),
    defineField({ name: 'features', title: 'Features', type: 'array', of: [{ type: 'featureItem' }], group: 'sections', description: 'Icon and title only' }),
    defineField({ name: 'processHeading', title: '"How it works" heading', type: 'string', group: 'sections' }),
    defineField({ name: 'processSteps', title: 'How it works: steps', type: 'array', of: [{ type: 'step' }], group: 'sections' }),
    defineField({ name: 'benefitsHeading', title: 'Benefits heading', type: 'string', group: 'sections' }),
    defineField({ name: 'benefits', title: 'Benefits', type: 'array', of: [{ type: 'featureItem' }], group: 'sections' }),
    defineField({ name: 'faqHeading', title: 'FAQ heading', type: 'string', group: 'sections' }),
    defineField({ name: 'faqs', title: 'Frequently asked questions', type: 'array', of: [{ type: 'faq' }], group: 'sections' }),
    defineField({ name: 'whoUsesHeading', title: '"Who uses this" heading', type: 'string', group: 'sections' }),
    defineField({ name: 'whoUsesThis', title: 'Who uses this service', type: 'array', of: [{ type: 'featureItem' }], group: 'sections', description: 'Title, description and the page it links to' }),
    defineField({ name: 'relatedHeading', title: 'Related services heading', type: 'string', group: 'sections' }),
    defineField({ name: 'relatedServices', title: 'Related services', type: 'array', of: [{ type: 'featureItem' }], group: 'sections', description: 'Title, description and the page it links to' }),

    defineField({ name: 'cta', title: 'Call to action (bottom of page)', type: 'cta', group: 'cta' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  orderings: [
    { title: 'Position', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }, { field: 'title', direction: 'asc' }] },
    { title: 'Title', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', slug: 'slug.current' }, prepare: ({ title, slug }) => ({ title, subtitle: `/services/${slug || ''}` }) },
});
