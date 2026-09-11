import { withBase } from '../lib/baseUrl'

export const HERO_PHOTOS = {
  left: withBase('/photos/pool.jpg'),
  center: withBase('/photos/villa.jpg'),
  right: withBase('/photos/living.jpg'),
}

export const LISTING_PHOTOS = [
  withBase('/photos/villa.jpg'),
  withBase('/photos/facade.jpg'),
  withBase('/photos/kitchen.jpg'),
  withBase('/photos/bedroom.jpg'),
  withBase('/photos/lounge.jpg'),
  withBase('/photos/interior.jpg'),
  withBase('/photos/pool.jpg'),
  withBase('/photos/night.jpg'),
]

export const THUMB = withBase('/photos/pool.jpg')

export const AGENT_PHOTO = withBase('/photos/agent.jpg')
