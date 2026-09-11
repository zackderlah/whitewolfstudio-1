import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Timely booking URL',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'facebookUrl',
      title: 'Facebook URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'mapsUrl',
      title: 'Google Maps URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'addressLine1',
      title: 'Address line 1',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'addressLine2',
      title: 'Address line 2',
      type: 'string',
    }),
    defineField({
      name: 'addressLine3',
      title: 'Address line 3',
      type: 'string',
    }),
    defineField({
      name: 'suburb',
      title: 'Suburb / place name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hoursSummary',
      title: 'Opening hours',
      type: 'text',
      rows: 2,
      description: 'Use line breaks for multiple lines.',
    }),
    defineField({
      name: 'abn',
      title: 'ABN',
      type: 'string',
    }),
  ],
})
