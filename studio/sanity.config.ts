import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Schema types
const post = {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', title: 'Alt Text', type: 'string'}],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'tag'}]}],
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {type: 'block'},
        {type: 'image', options: {hotspot: true}, fields: [{name: 'alt', title: 'Alt', type: 'string'}, {name: 'caption', title: 'Caption', type: 'string'}]},
      ],
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
    },
  ],
}

const page = {
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', title: 'Alt Text', type: 'string'}],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'tag'}]}],
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {type: 'block'},
        {type: 'image', options: {hotspot: true}, fields: [{name: 'alt', title: 'Alt', type: 'string'}, {name: 'caption', title: 'Caption', type: 'string'}]},
      ],
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
  ],
}

const author = {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {name: 'name', title: 'Name', type: 'string', validation: (Rule: any) => Rule.required()},
    {name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name', maxLength: 96}},
    {name: 'image', title: 'Image', type: 'image', options: {hotspot: true}},
    {name: 'bio', title: 'Bio', type: 'text', rows: 4},
  ],
}

const tag = {
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [
    {name: 'name', title: 'Name', type: 'string', validation: (Rule: any) => Rule.required()},
    {name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name', maxLength: 96}, validation: (Rule: any) => Rule.required()},
    {name: 'description', title: 'Description', type: 'text', rows: 2},
  ],
}

const service = {
  name: 'service',
  title: 'Service',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero Section'},
    {name: 'body', title: 'Body Content'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
      description: 'e.g., "Pre-Tenancy", "Check-Ins"',
      group: 'hero',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule: any) => Rule.required(),
      description: 'URL path - e.g., "pre-tenancy", "check-ins"',
      group: 'hero',
    },
    {
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      rows: 4,
      validation: (Rule: any) => Rule.required(),
      description: 'The main description shown in the blue hero banner',
      group: 'hero',
    },
    {
      name: 'bodyHeading',
      title: 'Body Section Heading',
      type: 'string',
      description: 'e.g., "What Is an Inventory Report?"',
      group: 'body',
    },
    {
      name: 'bodyIntro',
      title: 'Body Intro Text',
      type: 'text',
      rows: 3,
      description: 'The intro paragraph below the heading',
      group: 'body',
    },
    {
      name: 'bodySubheading',
      title: 'Body Subheading',
      type: 'string',
      description: 'e.g., "Professional Documentation"',
      group: 'body',
    },
    {
      name: 'bodyText',
      title: 'Body Text',
      type: 'array',
      of: [{type: 'block'}],
      description: 'The main body paragraphs (rich text)',
      group: 'body',
    },
    {
      name: 'bodyImage',
      title: 'Body Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', title: 'Alt Text', type: 'string'}],
      description: 'The image shown alongside the body text',
      group: 'body',
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        {name: 'metaTitle', title: 'Meta Title', type: 'string', description: 'Overrides the default title for search engines'},
        {name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2, description: 'Description shown in search results'},
        {name: 'keywords', title: 'Keywords', type: 'string', description: 'Comma-separated keywords'},
      ],
    },
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare({title, slug}: {title: string, slug: string}) {
      return {title, subtitle: `/services/${slug}`}
    },
  },
}

export default defineConfig({
  name: 'default',
  title: 'miServices',
  projectId: 'a4q9j3x1',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [post, page, author, tag, service],
  },
})
