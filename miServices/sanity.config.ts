import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import type { StructureBuilder } from 'sanity/structure';
import { schemaTypes } from './sanity/schemas';
import { PAGE_SINGLETONS } from './sanity/schemas/site/pages';

/** One-off documents: a fixed ID each, and they can't be duplicated or deleted */
const SINGLETONS: { id: string; type: string; title: string }[] = [
  { id: 'siteSettings', type: 'siteSettings', title: 'Site Settings' },
  ...PAGE_SINGLETONS.map((p) => ({ id: p.id, type: p.id, title: p.title })),
  { id: 'membersArea', type: 'membersArea', title: 'Members Area text' },
  { id: 'quoteTemplate', type: 'quoteTemplate', title: 'Quote Template' },
  { id: 'flyerSettings', type: 'flyerSettings', title: 'Flyer Settings' },
];
const SINGLETON_TYPES = new Set(SINGLETONS.map((s) => s.type));

const singleton = (S: StructureBuilder, id: string) => {
  const s = SINGLETONS.find((x) => x.id === id)!;
  return S.listItem().title(s.title).id(s.id).schemaType(s.type).child(S.document().schemaType(s.type).documentId(s.id).title(s.title));
};
const list = (S: StructureBuilder, type: string, title: string) => S.listItem().title(title).schemaType(type).child(S.documentTypeList(type).title(title));

const customStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Website')
        .child(
          S.list()
            .title('Website')
            .items([
              singleton(S, 'siteSettings'),
              S.divider(),
              S.listItem()
                .title('Pages')
                .child(S.list().title('Pages').items(PAGE_SINGLETONS.map((p) => singleton(S, p.id)))),
              list(S, 'service', 'Services'),
              list(S, 'audiencePage', 'Who we work with'),
              list(S, 'page', 'Legal pages'),
              S.divider(),
              list(S, 'post', 'News posts'),
              list(S, 'author', 'News authors'),
              list(S, 'tag', 'News tags'),
            ])
        ),
      S.listItem()
        .title('Members Area')
        .child(
          S.list()
            .title('Members Area')
            .items([
              singleton(S, 'membersArea'),
              S.divider(),
              list(S, 'memberDocument', 'Documents'),
              list(S, 'documentSection', 'Document sections'),
              list(S, 'helpArticle', 'Help answers'),
              S.divider(),
              list(S, 'franchisee', 'Franchisees'),
              list(S, 'member', 'Members'),
              S.divider(),
              list(S, 'complianceRequirement', 'Compliance requirements'),
              list(S, 'complianceRecord', 'Compliance records'),
              list(S, 'complianceSetting', 'Compliance settings'),
              list(S, 'complianceReminder', 'Compliance reminders'),
              S.divider(),
              list(S, 'priceList', 'Price Lists'),
              singleton(S, 'flyerSettings'),
              list(S, 'contact', 'Contacts'),
              list(S, 'quote', 'Quotes'),
              singleton(S, 'quoteTemplate'),
            ])
        ),
    ]);

export default defineConfig({
  name: 'miservices-studio',
  title: 'miServices',
  projectId: 'a4q9j3x1',
  dataset: 'production',
  basePath: '/studio',
  plugins: [structureTool({ structure: customStructure })],
  schema: {
    types: schemaTypes,
    // Singletons can't be created again from the "Create" menu
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    // …nor duplicated, deleted or unpublished
    actions: (actions, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType) ? actions.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action)) : actions,
  },
});
