export type SectionType =
  | 'photos'
  | 'floorPlan'
  | 'tour3d'
  | 'keyFacts'
  | 'homeFeatures'
  | 'agentContacts'
  | 'custom'

export type SectionStatus = 'pending' | 'generating' | 'ready'
export type DealType = 'For sale' | 'For rent'
export type ListingStatus = 'draft' | 'published' | 'closed'
export type CopilotMode = 'Lite' | 'Standard' | 'Pro'
export type FloorPlanMode = 'auto' | 'upload' | 'none'
export type FloorPlanView = '2d' | '3d'

export const FLOOR_PLAN_ROOMS = [
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'living', label: 'Living room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'bath', label: 'Bathroom' },
  { id: 'garden', label: 'Garden' },
] as const

export type FloorPlanRoomId = (typeof FLOOR_PLAN_ROOMS)[number]['id']
export type BrandingMode = 'auto' | 'custom'
export type ListingBrandingKind = 'planner' | 'agency' | 'none'
export type ListingLayout = 'classic' | 'gallery' | 'split'
export type PublishVisibility = 'public' | 'unlisted'
export type AttachmentKind = 'image' | 'pdf' | 'audio' | 'text' | 'link'

export interface Section {
  id: string
  type: SectionType
  title: string
  order: number
  enabled: boolean
  required: boolean
  hasContent: boolean
  locked: boolean
  source?: string
  body?: string
  status: SectionStatus
}

export interface KeyFact {
  label: string
  value: string
}

export interface AgentContacts {
  name: string
  role: string
  phone: string
  email: string
  photo: string
}

export interface ListingPhoto {
  id: string
  url: string
  originalUrl: string
  room: RoomLabel | ''
  cleaned: boolean
  cleaning: boolean
}

export const ROOM_LABELS = [
  'Exterior',
  'Living room',
  'Kitchen',
  'Bedroom',
  'Bathroom',
  'Dining',
  'Garden',
  'Hallway',
  'Other',
] as const

export type RoomLabel = (typeof ROOM_LABELS)[number]

export interface Listing {
  id: string
  address: string
  title: string
  description: string
  price: string
  dealType: DealType
  status: ListingStatus
  thumbnail: string
  photos: ListingPhoto[]
  sections: Section[]
  keyFacts: KeyFact[]
  homeFeatures: string[]
  agent: AgentContacts
  tourUrl?: string
  floorPlanUrl?: string
  floorPlanView?: FloorPlanView
  hiddenFloorRooms?: FloorPlanRoomId[]
  layout: ListingLayout
  brandingKind?: ListingBrandingKind
  brandingRemoved: boolean
  agencyName?: string
  agencyLogoUrl?: string
  agencyBrandingUnlocked?: boolean
  publishSettings?: PublishSettings
  createdAt: number
  updatedAt: number
}

export interface ListingSummary {
  id: string
  address: string
  price: string
  dealType: DealType
  status: ListingStatus
  thumbnail: string
}

export interface PublishSettings {
  visibility: PublishVisibility
  showPrice: boolean
  showExactAddress: boolean
  listOnWebsite: boolean
  listOnPortals: boolean
}

export const DEFAULT_PUBLISH_SETTINGS: PublishSettings = {
  visibility: 'public',
  showPrice: true,
  showExactAddress: true,
  listOnWebsite: true,
  listOnPortals: false,
}

export interface Attachment {
  id: string
  name: string
  kind: AttachmentKind
  url?: string
}

export interface ComposerSettings {
  photoCount: number
  photoMax: number
  attachments: Attachment[]
  floorPlan: FloorPlanMode
  branding: BrandingMode
  deal: DealType
  space: string
  mode: CopilotMode
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments: Attachment[]
}

export interface GenerationStep {
  id: string
  label: string
  status: 'done' | 'active' | 'pending' | 'cancelled'
}

export interface GenerationState {
  running: boolean
  cancelled: boolean
  startedAt: number | null
  elapsedMs: number
  currentLabel: string
  steps: GenerationStep[]
  canContinue: boolean
}

export interface HistorySnapshot {
  sections: Section[]
  message: string
}

export interface ToastState {
  id: string
  message: string
  actionLabel?: string
}
