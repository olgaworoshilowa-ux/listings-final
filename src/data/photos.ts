import type { ListingPhoto, RoomLabel } from '../types'
import { ROOM_LABELS } from '../types'

export function guessRoom(url: string): RoomLabel {
  const value = url.toLowerCase()
  if (value.includes('kitchen')) return 'Kitchen'
  if (value.includes('bed')) return 'Bedroom'
  if (value.includes('bath')) return 'Bathroom'
  if (value.includes('living') || value.includes('lounge')) return 'Living room'
  if (value.includes('pool') || value.includes('garden')) return 'Garden'
  if (value.includes('dining')) return 'Dining'
  if (value.includes('hall')) return 'Hallway'
  if (
    value.includes('facade') ||
    value.includes('villa') ||
    value.includes('night') ||
    value.includes('exterior')
  ) {
    return 'Exterior'
  }
  if (value.includes('interior')) return 'Living room'
  return 'Other'
}

export function createPhoto(url: string, room: RoomLabel | '' = ''): ListingPhoto {
  return {
    id: crypto.randomUUID(),
    url,
    originalUrl: url,
    room,
    cleaned: false,
    cleaning: false,
  }
}

export function photosFromUrls(urls: string[], autoLabel = false): ListingPhoto[] {
  return urls.map((url) => createPhoto(url, autoLabel ? guessRoom(url) : ''))
}

export { ROOM_LABELS }
