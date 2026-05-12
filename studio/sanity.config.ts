import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'la-vida-studio',
  title: 'La Vida Landscapes — Journal',

  // Filled in by Marty during setup. See SETUP.md.
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'REPLACE_ME',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Journal posts')
              .child(
                S.documentTypeList('journalPost')
                  .title('Journal posts')
                  .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
