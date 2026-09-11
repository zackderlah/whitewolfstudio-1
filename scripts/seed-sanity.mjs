import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {
  heroImageAltDefault,
  homepageDefaults,
  siteSettingsDefaults,
} from './sanity-defaults.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const token = process.env.SANITY_API_TOKEN
if (!token) {
  console.error('Missing SANITY_API_TOKEN. Create a token with Editor access at sanity.io/manage.')
  process.exit(1)
}

const client = createClient({
  projectId: 'ap45bjk4',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const uploadImage = async (relativePath) => {
  const filePath = path.join(root, relativePath)
  const buffer = await readFile(filePath)
  const filename = path.basename(filePath)
  const asset = await client.assets.upload('image', buffer, {filename})
  return {
    _type: 'image',
    asset: {_type: 'reference', _ref: asset._id},
  }
}

const homepage = {
  _id: 'homepage',
  _type: 'homepage',
  ...homepageDefaults,
}

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  ...siteSettingsDefaults,
}

const galleryItems = [
  {
    title: 'Textured crop fade',
    file: 'assets/images/opt/work-08.jpg',
    alt: 'Textured crop with a clean low fade',
  },
  {
    title: 'Mid skin fade',
    file: 'assets/images/opt/work-09.jpg',
    alt: 'Mid skin fade with natural texture on top',
  },
  {
    title: 'French crop',
    file: 'assets/images/opt/work-12.jpg',
    alt: 'French crop with a blunt fringe and fade',
  },
  {
    title: 'Modern mullet',
    file: 'assets/images/opt/work-04.jpg',
    alt: 'Salt-and-pepper modern mullet with a skin fade',
  },
  {
    title: 'Burst fade crop',
    file: 'assets/images/work-02.jpg',
    alt: 'High burst fade with a straight crop fringe',
  },
  {
    title: 'Taper fade',
    file: 'assets/images/work-05.jpg',
    alt: 'Taper fade with defined texture on top',
  },
  {
    title: 'Skin fade beard',
    file: 'assets/images/work-06.jpg',
    alt: 'High skin fade and a clean beard line-up',
  },
  {
    title: 'Studio finish',
    file: 'assets/images/opt/work-11.jpg',
    alt: 'Finished cut photographed in studio light',
  },
]

console.log('Uploading homepage images...')
homepage.heroImage = {
  ...(await uploadImage('assets/images/opt/work-hero.jpg')),
  alt: heroImageAltDefault,
}
homepage.policiesBannerImage = {
  ...(await uploadImage('assets/images/opt/work-policies.jpg')),
  alt: '',
}

console.log('Creating homepage and site settings...')
await client.createOrReplace(homepage)
await client.createOrReplace(siteSettings)

console.log('Uploading gallery images...')
for (const [index, item] of galleryItems.entries()) {
  const image = await uploadImage(item.file)
  const docId = `galleryImage-${index + 1}`
  await client.createOrReplace({
    _id: docId,
    _type: 'galleryImage',
    title: item.title,
    alt: item.alt,
    sortOrder: index,
    image,
  })
  console.log(`  ${docId}`)
}

console.log('Seed complete.')
