import {defineArrayMember, defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'
import {homepageInitialValue} from '../defaults/homepageDefaults'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  initialValue: homepageInitialValue,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'gallery', title: 'Gallery'},
    {name: 'booking', title: 'Booking'},
    {name: 'visit', title: 'Visit'},
    {name: 'policies', title: 'Policies'},
    {name: 'footer', title: 'Footer'},
  ],
  fields: [
    defineField({
      name: 'heroTitleStart',
      title: 'Hero title (first line)',
      type: 'string',
      group: 'hero',
      initialValue: 'Quality over',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroTitleEnd',
      title: 'Hero title (second line)',
      type: 'string',
      group: 'hero',
      initialValue: 'Quantity.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroIntro',
      title: 'Hero intro',
      type: 'text',
      rows: 4,
      group: 'hero',
      description:
        'The paragraph between the two hero title lines. The live site may show fallback HTML until this is filled and published here.',
      initialValue: homepageInitialValue.heroIntro,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      group: 'hero',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          initialValue: "Barber cutting a client's hair at White Wolf Studio",
          validation: (rule) =>
            rule.custom((alt, context) => {
              const parent = context.parent as {asset?: {_ref?: string}}
              if (parent?.asset?._ref && !alt) {
                return 'Alt text is required when an image is uploaded'
              }
              return true
            }),
        }),
      ],
    }),

    defineField({
      name: 'galleryLabel',
      title: 'Section label',
      type: 'string',
      group: 'gallery',
      initialValue: 'Our gallery',
    }),
    defineField({
      name: 'galleryHeading',
      title: 'Section heading',
      type: 'string',
      group: 'gallery',
      initialValue: 'A showcase of our barbering.',
    }),
    defineField({
      name: 'galleryLinkLabel',
      title: 'Instagram link label',
      type: 'string',
      group: 'gallery',
      initialValue: 'View all on Instagram',
    }),

    defineField({
      name: 'bookingLabel',
      title: 'Section label',
      type: 'string',
      group: 'booking',
      initialValue: 'Our services',
    }),
    defineField({
      name: 'bookingHeading',
      title: 'Section heading',
      type: 'string',
      group: 'booking',
      initialValue: 'Schedule your service.',
    }),
    defineField({
      name: 'bookingLinkLabel',
      title: 'External booking link label',
      type: 'string',
      group: 'booking',
      initialValue: 'Open in a new tab',
    }),
    defineField({
      name: 'bookingNote',
      title: 'Booking embed note',
      type: 'text',
      rows: 3,
      group: 'booking',
    }),

    defineField({
      name: 'visitLabel',
      title: 'Section label',
      type: 'string',
      group: 'visit',
      initialValue: 'The studio',
    }),
    defineField({
      name: 'visitHeading',
      title: 'Section heading',
      type: 'string',
      group: 'visit',
      initialValue: 'How to find us',
    }),
    defineField({
      name: 'visitPlace',
      title: 'Place name',
      type: 'string',
      group: 'visit',
      initialValue: 'Newstead',
    }),
    defineField({
      name: 'visitInfoCards',
      title: 'Visit info cards',
      type: 'array',
      group: 'visit',
      of: [defineArrayMember({type: 'infoCard'})],
    }),
    defineField({
      name: 'directionsLinkLabel',
      title: 'Directions link label',
      type: 'string',
      group: 'visit',
      initialValue: 'Get directions',
    }),

    defineField({
      name: 'policiesKicker',
      title: 'Banner kicker',
      type: 'string',
      group: 'policies',
      initialValue: 'House rules',
    }),
    defineField({
      name: 'policiesHeading',
      title: 'Banner heading',
      type: 'string',
      group: 'policies',
      initialValue: 'How we keep the chair on time.',
    }),
    defineField({
      name: 'policiesBannerImage',
      title: 'Banner image',
      type: 'image',
      group: 'policies',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'policies',
      title: 'Policies',
      type: 'array',
      group: 'policies',
      of: [defineArrayMember({type: 'policyItem'})],
    }),

    defineField({
      name: 'footerLabel',
      title: 'Section label',
      type: 'string',
      group: 'footer',
      initialValue: 'Get in touch',
    }),
    defineField({
      name: 'footerHeading',
      title: 'Section heading',
      type: 'string',
      group: 'footer',
      initialValue: 'Come as you are.',
    }),
    defineField({
      name: 'footerCtaHeading',
      title: 'Footer CTA heading',
      type: 'string',
      group: 'footer',
      initialValue: 'Your neighbourhood barbershop awaits.',
    }),
    defineField({
      name: 'footerCtaButton',
      title: 'Footer CTA button label',
      type: 'string',
      group: 'footer',
      initialValue: 'Stay booked',
    }),
    defineField({
      name: 'footerLegalPrimary',
      title: 'Footer legal line (primary)',
      type: 'string',
      group: 'footer',
      initialValue: 'White Wolf Studio · ABN 8392 566 36 30',
    }),
    defineField({
      name: 'footerLegalSecondary',
      title: 'Footer legal line (secondary)',
      type: 'string',
      group: 'footer',
      initialValue: 'Contemporary barbering, Newstead.',
    }),
  ],
})
