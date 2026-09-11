import {createClient} from '@sanity/client'
import {homepageDefaults, siteSettingsDefaults} from './sanity-defaults.mjs'

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

const isEmpty = (value) => {
  if (value == null || value === '') {
    return true
  }
  if (Array.isArray(value)) {
    return value.length === 0
  }
  return false
}

const missingFields = (doc, defaults) => {
  const patch = {}
  for (const [key, value] of Object.entries(defaults)) {
    if (isEmpty(doc?.[key])) {
      patch[key] = value
    }
  }
  return patch
}

const patchDocument = async (id, type, defaults) => {
  const doc = await client.getDocument(id).catch(() => null)
  if (!doc) {
    await client.createOrReplace({_id: id, _type: type, ...defaults})
    console.log(`Created ${id} with default content.`)
    return
  }

  const patch = missingFields(doc, defaults)
  const keys = Object.keys(patch)
  if (!keys.length) {
    console.log(`${id} already has content — no changes needed.`)
    return
  }

  await client.patch(id).set(patch).commit()
  console.log(`Updated ${id}: ${keys.join(', ')}`)
}

await patchDocument('homepage', 'homepage', homepageDefaults)
await patchDocument('siteSettings', 'siteSettings', siteSettingsDefaults)
console.log('Patch complete. Refresh Sanity Studio to see the filled fields.')
