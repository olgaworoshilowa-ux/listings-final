import type { Listing } from '../types'

const keyFor = (id: string) => `listings-final-preview:${id}`

export function savePreviewSnapshot(listing: Listing) {
  localStorage.setItem(keyFor(listing.id), JSON.stringify(listing))
}

export function readPreviewSnapshot(id: string): Listing | null {
  try {
    const raw = localStorage.getItem(keyFor(id))
    return raw ? (JSON.parse(raw) as Listing) : null
  } catch {
    return null
  }
}
