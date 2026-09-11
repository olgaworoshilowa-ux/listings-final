import { AGENT_PHOTO, LISTING_PHOTOS, THUMB } from './images'
import { photosFromUrls } from './photos'
import type { AgentContacts, KeyFact, Listing, ListingSummary, Section } from '../types'
import { DEFAULT_PUBLISH_SETTINGS } from '../types'

export function createDefaultSections(): Section[] {
  return [
    {
      id: 'photos',
      type: 'photos',
      title: 'Photos',
      order: 0,
      enabled: true,
      required: true,
      hasContent: false,
      locked: false,
      status: 'pending',
    },
    {
      id: 'keyFacts',
      type: 'keyFacts',
      title: 'Key facts',
      order: 1,
      enabled: true,
      required: false,
      hasContent: false,
      locked: false,
      status: 'pending',
    },
    {
      id: 'floorPlan',
      type: 'floorPlan',
      title: 'Floor plan',
      order: 2,
      enabled: true,
      required: false,
      hasContent: false,
      locked: false,
      status: 'pending',
    },
    {
      id: 'tour3d',
      type: 'tour3d',
      title: 'Tour & 3D',
      order: 3,
      enabled: true,
      required: false,
      hasContent: false,
      locked: false,
      status: 'pending',
    },
    {
      id: 'homeFeatures',
      type: 'homeFeatures',
      title: 'Home features',
      order: 4,
      enabled: true,
      required: false,
      hasContent: false,
      locked: false,
      status: 'pending',
    },
    {
      id: 'agentContacts',
      type: 'agentContacts',
      title: 'Agent contacts',
      order: 5,
      enabled: true,
      required: true,
      hasContent: false,
      locked: false,
      status: 'pending',
    },
  ]
}

export const SAMPLE_LISTINGS: ListingSummary[] = [
  {
    id: 'draft-1',
    address: '13 Abbey road, Dublin',
    price: '$4,000',
    dealType: 'For rent',
    status: 'draft',
    thumbnail: THUMB,
  },
  {
    id: 'draft-2',
    address: '13 Abbey road, Dublin',
    price: '$4,000,000',
    dealType: 'For sale',
    status: 'draft',
    thumbnail: THUMB,
  },
  {
    id: 'pub-1',
    address: '13 Abbey road, Dublin',
    price: '$4,000',
    dealType: 'For rent',
    status: 'published',
    thumbnail: THUMB,
  },
  {
    id: 'closed-1',
    address: '13 Abbey road, Dublin',
    price: '$4,000',
    dealType: 'For rent',
    status: 'closed',
    thumbnail: THUMB,
  },
]

export const DEMO_KEY_FACTS: KeyFact[] = [
  { label: 'Bedrooms', value: '4' },
  { label: 'Bathrooms', value: '3' },
  { label: 'Floor area', value: '186 m²' },
  { label: 'Year built', value: '2019' },
  { label: 'BER', value: 'B2' },
  { label: 'Parking', value: '2 spaces' },
]

export const DEMO_FEATURES = [
  'South-facing garden',
  'Underfloor heating',
  'Smart home wiring',
  'Dual aspect living room',
  'Fitted kitchen',
  'Walk-in wardrobe',
  'EV charger',
  'Alarm system',
]

export const DEMO_AGENT: AgentContacts = {
  name: 'Sarah O’Connell',
  role: 'Senior negotiator',
  phone: '+353 1 234 5678',
  email: 'sarah@planner5d.ie',
  photo: AGENT_PHOTO,
}

export const DEMO_DESCRIPTION =
  'A quiet, light-filled home — four bedrooms, a south garden, and a kitchen that actually gets used. The living room opens straight onto the terrace, so summer evenings don’t need a plan. Built in 2019, BER B2, and finished with the kind of detail you don’t have to explain to a buyer.'

export function improvePropertyDetails(listing: Listing) {
  const street = (listing.title.split('—')[0] || listing.address.split(',')[0]).trim()
  const beds = listing.keyFacts.find((f) => /bed/i.test(f.label))?.value
  const baths = listing.keyFacts.find((f) => /bath/i.test(f.label))?.value
  const area = listing.keyFacts.find((f) => /area/i.test(f.label))?.value
  const year = listing.keyFacts.find((f) => /year/i.test(f.label))?.value
  const ber = listing.keyFacts.find((f) => /ber/i.test(f.label))?.value

  const variants = [
    {
      title: street,
      description: `Light first, then the garden. ${beds ? `${beds} bedrooms` : 'A family layout'}${baths ? `, ${baths} bathrooms` : ''}${area ? `, ${area}` : ''}. The living room opens onto the terrace, so you don’t have to invent a lifestyle for the photos. ${year ? `Built ${year}` : 'Recently finished'}${ber ? `, BER ${ber}` : ''}. ${listing.dealType} at ${listing.price}.`,
    },
    {
      title: `${street}`,
      description: `A home that feels bigger than the floorplan: quiet street, south garden, kitchen people actually cook in. ${beds ? `${beds} beds` : 'Several bedrooms'}, dual-aspect living, and the kind of finish you don’t have to explain. ${listing.price} · ${listing.dealType.toLowerCase()}.`,
    },
    {
      title: street,
      description: `Walk in on a weekday morning and the light is already doing the work. ${area ? `${area}, ` : ''}${beds ? `${beds} bedrooms, ` : ''}a terrace off the living room, and rooms that don’t need staging. ${year ? `${year} build` : 'Modern build'}${ber ? `, ${ber} BER` : ''}. Ready for a buyer who cares about how it lives, not the brochure.`,
    },
  ]

  const current = listing.description.trim()
  const next = variants.find((item) => item.description !== current) ?? variants[0]
  return next
}

function sprinkleEmojis(text: string) {
  if (/[\u{1F300}-\u{1FAFF}]/u.test(text)) return text
  let next = text
  next = next.replace(/\blight-filled\b/i, 'light-filled ✨')
  next = next.replace(/\bfour bedrooms\b/i, 'four bedrooms 🛏️')
  next = next.replace(/\bsouth garden\b/i, 'south garden 🌿')
  next = next.replace(/\bkitchen\b/i, 'kitchen 🍳')
  next = next.replace(/\bliving room\b/i, 'living room 🛋️')
  next = next.replace(/\bterrace\b/i, 'terrace ☀️')
  next = next.replace(/\bsummer evenings\b/i, 'summer evenings 🌇')
  if (next === text) next = `🏡 ${text}`
  return next
}

export function applyChatFollowUp(listing: Listing, prompt: string) {
  const wantsEmoji = /emoji|эмодз|смайл/i.test(prompt)
  const wantsTitle = /title|заголов|headline/i.test(prompt)
  const wantsPrice = /price|цен[аыуе]|cheaper|дорож|дешев/i.test(prompt)
  const wantsDescription =
    /descript|описан|copy|текст|перепиш|rewrite|shorter|longer|короче|длинн|improve/i.test(
      prompt,
    )
  const priceMatch = prompt.match(/(?:\$|€|£)\s*[\d,.]+|[\d,.]+(?:\s*(?:k|m|тыс))?/i)

  if (wantsEmoji || (wantsDescription && wantsEmoji)) {
    return {
      patch: { description: sprinkleEmojis(listing.description) },
      reply: 'Updated the description with emojis. Check the listing preview.',
      label: 'Rewriting description',
    }
  }

  if (wantsPrice && priceMatch) {
    const raw = priceMatch[0].replace(/\s/g, '')
    const price = raw.startsWith('$') || raw.startsWith('€') || raw.startsWith('£') ? raw : `$${raw}`
    return {
      patch: { price },
      reply: `Price is now ${price}.`,
      label: 'Updating price',
    }
  }

  if (wantsTitle) {
    const improved = improvePropertyDetails(listing)
    return {
      patch: { title: improved.title },
      reply: `Title is now “${improved.title}”.`,
      label: 'Rewriting title',
    }
  }

  const improved = improvePropertyDetails(listing)
  const patch = wantsDescription
    ? { description: improved.description }
    : { title: improved.title, description: improved.description }

  return {
    patch,
    reply: wantsDescription
      ? 'Rewrote the description. Have a look on the page.'
      : 'I updated the listing copy from your note.',
    label: wantsDescription ? 'Rewriting description' : 'Updating listing',
  }
}

export function buildGeneratedContent(prompt: string) {
  const looksLikeTelegram = /telegram|recreate the listing/i.test(prompt)
  const addressMatch = prompt.match(
    /\d+\s+[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*(?:\s+(?:Street|Road|Avenue|Lane|Drive))?/i,
  )

  const address = looksLikeTelegram
    ? '23 Ann Politkovskaya Street, Dublin'
    : addressMatch
      ? `${addressMatch[0]}, Dublin`
      : '23 Ann Politkovskaya Street, Dublin'

  const title = address.replace(', Dublin', '')
  const forRent = /rent/i.test(prompt)
  const dealType = forRent ? ('For rent' as const) : ('For sale' as const)
  const price = forRent ? '$4,000' : '$1,250,000'

  return {
    address,
    title,
    description: DEMO_DESCRIPTION,
    price,
    dealType,
    photos: LISTING_PHOTOS.slice(0, 8),
    keyFacts: DEMO_KEY_FACTS,
    homeFeatures: DEMO_FEATURES,
    agent: DEMO_AGENT,
    tourUrl: 'https://planner5d.com/tour/demo',
    floorPlanUrl: 'auto',
    thumbnail: LISTING_PHOTOS[0],
  }
}

export function hydrateSampleListing(summary: ListingSummary): Listing {
  const generated = buildGeneratedContent(
    `${summary.address} ${summary.dealType} ${summary.price}`,
  )
  const now = Date.now()
  return {
    id: summary.id,
    address: summary.address,
    title: summary.address.replace(', Dublin', ''),
    description: generated.description,
    price: summary.price,
    dealType: summary.dealType,
    status: summary.status,
    thumbnail: summary.thumbnail,
    photos: photosFromUrls(generated.photos, true),
    sections: createDefaultSections().map((section) => ({
      ...section,
      hasContent: true,
      status: 'ready',
      source:
        section.type === 'photos'
          ? 'From your camera roll'
          : section.type === 'keyFacts'
            ? 'From developer PDF'
            : section.type === 'floorPlan'
              ? 'Generated floor plan'
              : undefined,
    })),
    keyFacts: generated.keyFacts,
    homeFeatures: generated.homeFeatures,
    agent: generated.agent,
    tourUrl: generated.tourUrl,
    floorPlanUrl: generated.floorPlanUrl,
    layout: 'classic',
    brandingKind: 'planner',
    brandingRemoved: false,
    agencyBrandingUnlocked: false,
    publishSettings: { ...DEFAULT_PUBLISH_SETTINGS },
    createdAt: now - 1000 * 60 * 40,
    updatedAt: now - 7000,
  }
}
