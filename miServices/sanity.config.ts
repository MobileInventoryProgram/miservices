import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import type { StructureBuilder } from 'sanity/structure';
import { schemaTypes } from './sanity/schemas';

const customStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Franchise Login')
        .child(
          S.list()
            .title('Franchise Login')
            .items([
              S.listItem()
                .title('Members')
                .schemaType('member')
                .child(S.documentTypeList('member').title('Members')),
              S.listItem()
                .title('Documents')
                .schemaType('memberDocument')
                .child(S.documentTypeList('memberDocument').title('Documents')),
              S.listItem()
                .title('Flyer Settings')
                .schemaType('flyerSettings')
                .child(S.document().schemaType('flyerSettings').documentId('flyerSettings')),
            ])
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !['member', 'memberDocument', 'flyerSettings'].includes(item.getId() ?? '')
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
  },
});
