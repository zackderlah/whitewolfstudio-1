import {sanityQueryUrl} from './sanity-config.js'

const SITE_QUERY = `{
  "homepage": *[_id == "homepage"][0]{
    heroTitleStart,
    heroTitleEnd,
    heroIntro,
    heroImage{
      alt,
      "url": asset->url
    },
    galleryLabel,
    galleryHeading,
    galleryLinkLabel,
    bookingLabel,
    bookingHeading,
    bookingLinkLabel,
    bookingNote,
    visitLabel,
    visitHeading,
    visitPlace,
    visitInfoCards[]{_key, title, body},
    directionsLinkLabel,
    policiesKicker,
    policiesHeading,
    policiesBannerImage{
      alt,
      "url": asset->url
    },
    policies[]{_key, title, body},
    footerLabel,
    footerHeading,
    footerCtaHeading,
    footerCtaButton,
    footerLegalPrimary,
    footerLegalSecondary
  },
  "settings": *[_id == "siteSettings"][0]{
    seo{
      title,
      description,
      ogImage{
        "url": asset->url
      }
    },
    contactEmail,
    bookingUrl,
    instagramUrl,
    facebookUrl,
    mapsUrl,
    addressLine1,
    addressLine2,
    addressLine3,
    suburb,
    hoursSummary,
    abn
  },
  "gallery": *[_type == "galleryImage"] | order(sortOrder asc, _createdAt asc){
    _key,
    alt,
    "url": image.asset->url
  }
}`

const getPath = (data, path) =>
  path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), data)

const setText = (element, value) => {
  if (value == null || value === '') {
    return
  }
  element.textContent = value
}

const setHtml = (element, value) => {
  if (value == null || value === '') {
    return
  }
  element.innerHTML = value
}

const setHref = (element, value) => {
  if (!value) {
    return
  }
  if (element.tagName === 'IFRAME') {
    element.src = value
    return
  }
  element.href = value
}

const setSrc = (element, value) => {
  if (!value) {
    return
  }
  element.src = value
}

const setAlt = (element, value) => {
  if (!value) {
    return
  }
  element.alt = value
}

const linesToHtml = (value) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('<br />')

const formatAddress = (settings) =>
  [settings.addressLine1, settings.addressLine2, settings.addressLine3].filter(Boolean).join('<br />')

const instagramHandle = (url) => {
  if (!url) {
    return ''
  }
  const match = url.match(/instagram\.com\/([^/?#]+)/i)
  return match ? `@${match[1]}` : 'Instagram'
}

const updateMeta = (data) => {
  const seo = data.settings?.seo
  if (!seo) {
    return
  }

  if (seo.title) {
    document.title = seo.title
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', seo.title)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', seo.title)
  }

  if (seo.description) {
    document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', seo.description)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', seo.description)
  }

  if (seo.ogImage?.url) {
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', seo.ogImage.url)
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', seo.ogImage.url)
  }
}

const updateStructuredData = (data) => {
  const script = document.querySelector('script[type="application/ld+json"]')
  const settings = data.settings
  if (!script || !settings) {
    return
  }

  try {
    const json = JSON.parse(script.textContent)
    if (settings.contactEmail) {
      json.email = settings.contactEmail
    }
    if (settings.bookingUrl) {
      json.potentialAction = {
        '@type': 'ReserveAction',
        name: 'Book an appointment',
        target: settings.bookingUrl,
      }
    }
    if (settings.mapsUrl) {
      json.hasMap = settings.mapsUrl
    }
    if (settings.instagramUrl) {
      json.sameAs = [settings.instagramUrl]
      if (settings.facebookUrl) {
        json.sameAs.push(settings.facebookUrl)
      }
    }
    if (settings.addressLine1) {
      json.address = {
        '@type': 'PostalAddress',
        streetAddress: [settings.addressLine1, settings.addressLine2].filter(Boolean).join(', '),
        addressLocality: settings.suburb || 'Newstead',
        addressRegion: 'QLD',
        postalCode: '4006',
        addressCountry: 'AU',
      }
    }
    script.textContent = JSON.stringify(json, null, 2)
  } catch {
    // Keep the static JSON-LD fallback if parsing fails.
  }
}

const renderGallery = (track, items) => {
  if (!track || !items?.length) {
    return
  }

  track.innerHTML = items
    .filter((item) => item.url)
    .map(
      (item) =>
        `<figure><img src="${item.url}" alt="${item.alt || ''}" loading="lazy" decoding="async" /></figure>`,
    )
    .join('')
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const renderCards = (container, items, tagName = 'article') => {
  if (!container || !items?.length) {
    return
  }

  container.innerHTML = items
    .map(
      (item) =>
        `<${tagName}><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></${tagName}>`,
    )
    .join('')
}

const updateDerivedFields = (data) => {
  const {homepage, settings} = data
  if (!settings) {
    return
  }

  document.querySelectorAll('[data-cms-address]').forEach((element) => {
    setHtml(element, formatAddress(settings))
  })

  document.querySelectorAll('[data-cms-hours]').forEach((element) => {
    if (settings.hoursSummary) {
      setHtml(element, linesToHtml(settings.hoursSummary))
    }
  })

  document.querySelectorAll('[data-cms-email]').forEach((element) => {
    if (settings.contactEmail) {
      element.href = `mailto:${settings.contactEmail}`
      setText(element, settings.contactEmail)
    }
  })

  document.querySelectorAll('[data-cms-instagram]').forEach((element) => {
    if (settings.instagramUrl) {
      element.href = settings.instagramUrl
      if (element.dataset.cmsInstagram === 'handle') {
        setText(element, instagramHandle(settings.instagramUrl))
      }
    }
  })

  document.querySelectorAll('[data-cms-facebook]').forEach((element) => {
    if (settings.facebookUrl) {
      element.href = settings.facebookUrl
    }
  })

  document.querySelectorAll('[data-cms-maps]').forEach((element) => {
    if (settings.mapsUrl) {
      element.href = settings.mapsUrl
    }
  })

  document.querySelectorAll('[data-cms-suburb]').forEach((element) => {
    setText(element, settings.suburb)
  })

  const bookingNote = document.querySelector('[data-cms-booking-note]')
  if (bookingNote && homepage?.bookingNote && settings.bookingUrl) {
    const linkLabel = homepage.bookingLinkLabel || 'open Timely in a new tab'
    bookingNote.innerHTML = `${homepage.bookingNote} <a href="${settings.bookingUrl}" target="_blank" rel="noreferrer">${linkLabel}</a>.`
  }

  const menuAddress = document.querySelector('[data-cms-menu-address]')
  if (menuAddress && settings.addressLine1) {
    const line2 = [settings.addressLine2, settings.suburb ? `${settings.suburb} 4006` : '']
      .filter(Boolean)
      .join(', ')
    menuAddress.innerHTML = `${settings.addressLine1}<br />${line2}`
  }
}

export async function fetchSanityQuery(query) {
  const url = sanityQueryUrl()

  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query}),
  })

  if (!response.ok) {
    throw new Error(`Sanity request failed (${response.status})`)
  }

  return response.json()
}

export async function hydrateFromSanity() {
  try {
    const {result: data} = await fetchSanityQuery(SITE_QUERY)
    if (!data?.homepage && !data?.settings && !data?.gallery?.length) {
      return
    }

    document.querySelectorAll('[data-cms-text]').forEach((element) => {
      setText(element, getPath(data, element.dataset.cmsText))
    })

    document.querySelectorAll('[data-cms-html]').forEach((element) => {
      const value = getPath(data, element.dataset.cmsHtml)
      if (typeof value === 'string') {
        setHtml(element, linesToHtml(value))
      }
    })

    document.querySelectorAll('[data-cms-href]').forEach((element) => {
      setHref(element, getPath(data, element.dataset.cmsHref))
    })

    document.querySelectorAll('[data-cms-src]').forEach((element) => {
      setSrc(element, getPath(data, element.dataset.cmsSrc))
    })

    document.querySelectorAll('[data-cms-alt]').forEach((element) => {
      setAlt(element, getPath(data, element.dataset.cmsAlt))
    })

    renderGallery(document.querySelector('[data-cms-gallery]'), data.gallery)
    renderCards(document.querySelector('[data-cms-visit-cards]'), data.homepage?.visitInfoCards)
    renderCards(document.querySelector('[data-cms-policies]'), data.homepage?.policies)

    updateDerivedFields(data)
    updateMeta(data)
    updateStructuredData(data)

    document.documentElement.classList.add('cms-ready')
  } catch (error) {
    console.warn('Sanity content unavailable, using static fallback.', error)
    if (typeof window !== 'undefined') {
      const host = window.location.hostname
      const isLocal = host === 'localhost' || host === '127.0.0.1'
      if (isLocal) {
        console.warn(
          'Local tip: run "npm run dev" so Sanity requests go through /api/sanity/query instead of being blocked by CORS.',
        )
      } else {
        console.warn(
          'Production tip: add this site URL to Sanity CORS origins at sanity.io/manage → API → CORS origins.',
        )
      }
    }
  }
}
