import { defineField, defineType } from 'sanity';
import { ICON_OPTIONS } from '../../../lib/cms/icon-names';

/**
 * Reusable building blocks for website pages. Every page uses these so the
 * same kind of content (a call to action, a feature card, an FAQ…) is edited
 * the same way everywhere.
 */

const iconField = defineField({
  name: 'icon',
  title: 'Icon',
  type: 'string',
  options: { list: ICON_OPTIONS.map((o) => ({ title: o.title, value: o.value })) },
});

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  description: 'How this page appears in Google and when shared. Leave blank to use the defaults from Site Settings.',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: 'metaTitle', title: 'Page title (browser tab & Google)', type: 'string', validation: (Rule) => Rule.max(70).warning('Keep it under 70 characters') }),
    defineField({ name: 'metaDescription', title: 'Description (Google)', type: 'text', rows: 3, validation: (Rule) => Rule.max(170).warning('Keep it under 170 characters') }),
    defineField({ name: 'keywords', title: 'Keywords', type: 'string' }),
    defineField({ name: 'ogImage', title: 'Share image', type: 'image', description: 'Shown when the page is shared on social media (1200 × 630)' }),
    defineField({ name: 'noIndex', title: 'Hide from Google', type: 'boolean', initialValue: false }),
  ],
});

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'href', title: 'Goes to', type: 'string', description: 'A page on this site (e.g. /contact) or a full web address', validation: (Rule) => Rule.required() }),
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
});

export const menuLink = defineType({
  name: 'menuLink',
  title: 'Menu link',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'description', title: 'Short description', type: 'string' }),
    defineField({ name: 'href', title: 'Goes to', type: 'string', validation: (Rule) => Rule.required() }),
    iconField,
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
});

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [defineField({ name: 'alt', title: 'Description (for screen readers and Google)', type: 'string' })],
});

export const hero = defineType({
  name: 'hero',
  title: 'Page header',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'subheading', title: 'Text under the heading', type: 'text', rows: 3 }),
    defineField({ name: 'primaryButton', title: 'Main button', type: 'link' }),
    defineField({ name: 'secondaryButton', title: 'Second button', type: 'link' }),
    defineField({ name: 'image', title: 'Image', type: 'imageWithAlt' }),
  ],
});

export const cta = defineType({
  name: 'cta',
  title: 'Call to action',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
    defineField({ name: 'primaryButton', title: 'Main button', type: 'link' }),
    defineField({ name: 'secondaryButton', title: 'Second button', type: 'link' }),
  ],
});

export const featureItem = defineType({
  name: 'featureItem',
  title: 'Feature',
  type: 'object',
  fields: [
    iconField,
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'href', title: 'Links to (optional)', type: 'string' }),
  ],
  preview: { select: { title: 'title', subtitle: 'description' } },
});

export const stat = defineType({
  name: 'stat',
  title: 'Statistic',
  type: 'object',
  fields: [
    defineField({ name: 'value', title: 'Number', type: 'string', description: 'e.g. 15+, 150k+, 700+', validation: (Rule) => Rule.required() }),
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
    iconField,
  ],
  preview: { select: { title: 'value', subtitle: 'label' } },
});

export const faq = defineType({
  name: 'faq',
  title: 'Question',
  type: 'object',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
  ],
  preview: { select: { title: 'question', subtitle: 'answer' } },
});

export const step = defineType({
  name: 'step',
  title: 'Step',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
  ],
  preview: { select: { title: 'title', subtitle: 'description' } },
});

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'object',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'role', title: 'Role / location', type: 'string' }),
  ],
  preview: { select: { title: 'name', subtitle: 'quote' } },
});

/** Rich text for page body copy: paragraphs, subheadings, lists, bold/italic, links */
export const richText = defineType({
  name: 'richText',
  title: 'Text',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Subheading', value: 'h3' },
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
        annotations: [{ name: 'link', type: 'object', title: 'Link', fields: [{ name: 'href', type: 'string', title: 'Goes to' }] }],
      },
    },
  ],
});

export const objectTypes = [seo, link, menuLink, imageWithAlt, hero, cta, featureItem, stat, faq, step, testimonial, richText];
