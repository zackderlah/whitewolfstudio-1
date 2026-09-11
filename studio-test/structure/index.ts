import {CogIcon} from '@sanity/icons/Cog'
import {HomeIcon} from '@sanity/icons/Home'
import {ImagesIcon} from '@sanity/icons/Images'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'

const HIDDEN_FROM_LIST = ['siteSettings', 'homepage', 'galleryImage']

function singletonListItem(
  S: StructureBuilder,
  typeName: string,
  title: string,
  icon?: React.ComponentType,
) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(typeName).documentId(typeName).title(title))
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('White Wolf Studio')
    .items([
      singletonListItem(S, 'homepage', 'Homepage', HomeIcon),
      singletonListItem(S, 'siteSettings', 'Site settings', CogIcon),

      S.divider(),

      S.listItem()
        .title('Gallery')
        .icon(ImagesIcon)
        .child(
          S.documentTypeList('galleryImage')
            .title('Gallery images')
            .defaultOrdering([{field: 'sortOrder', direction: 'asc'}]),
        ),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) => !HIDDEN_FROM_LIST.includes(listItem.getId() as string),
      ),
    ])
