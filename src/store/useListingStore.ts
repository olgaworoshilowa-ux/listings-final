import { create } from 'zustand'
import {
  buildGeneratedContent,
  createDefaultSections,
  hydrateSampleListing,
  improvePropertyDetails,
  applyChatFollowUp,
  SAMPLE_LISTINGS,
} from '../data/mock'
import { createPhoto, guessRoom, photosFromUrls } from '../data/photos'
import type {
  AgentContacts,
  Attachment,
  ChatMessage,
  ComposerSettings,
  CopilotMode,
  DealType,
  FloorPlanRoomId,
  FloorPlanView,
  GenerationState,
  HistorySnapshot,
  KeyFact,
  Listing,
  ListingLayout,
  ListingPhoto,
  ListingBrandingKind,
  ListingStatus,
  ListingSummary,
  PublishSettings,
  RoomLabel,
  Section,
  ToastState,
} from '../types'
import { DEFAULT_PUBLISH_SETTINGS } from '../types'

const PHOTO_MAX = 20
export const BRANDING_CREDIT_COST = 12
export const AGENCY_BRANDING_CREDIT_COST = 40

const defaultSettings = (): ComposerSettings => ({
  photoCount: 0,
  photoMax: PHOTO_MAX,
  attachments: [],
  floorPlan: 'auto',
  branding: 'auto',
  deal: 'For sale',
  space: 'My home',
  mode: 'Lite',
})

const idleGeneration = (): GenerationState => ({
  running: false,
  cancelled: false,
  startedAt: null,
  elapsedMs: 0,
  currentLabel: '',
  steps: [],
  canContinue: false,
})

let timers: number[] = []
let tickTimer: number | null = null

function clearTimers() {
  timers.forEach((id) => window.clearTimeout(id))
  timers = []
  if (tickTimer != null) {
    window.clearInterval(tickTimer)
    tickTimer = null
  }
}

function later(fn: () => void, ms: number) {
  const id = window.setTimeout(fn, ms)
  timers.push(id)
}

export interface AppState {
  sidebarCollapsed: boolean
  listings: ListingSummary[]
  currentListing: Listing | null
  settings: ComposerSettings
  composerText: string
  messages: ChatMessage[]
  generation: GenerationState
  chatExpanded: boolean
  contentExpanded: boolean
  expandedSectionId: string | null
  hoveredSectionId: string | null
  selectedSectionId: string | null
  previewScrollTo: string | null
  toast: ToastState | null
  dropActive: boolean
  lastSavedAt: number | null
  dirty: boolean
  history: HistorySnapshot[]
  generatedPayload: ReturnType<typeof buildGeneratedContent> | null
  detailsStatus: 'ready' | 'generating'
  detailsLocked: boolean
  credits: number
  editorOption: 'option1' | 'option2'
  option2Panel: 'chat' | 'content'

  toggleSidebar: () => void
  setComposerText: (text: string) => void
  setMode: (mode: CopilotMode) => void
  setDeal: (deal: DealType) => void
  setFloorPlan: (mode: ComposerSettings['floorPlan']) => void
  setBranding: (mode: ComposerSettings['branding']) => void
  setSpace: (space: string) => void
  addAttachments: (files: Attachment[]) => void
  removeAttachment: (id: string) => void
  setDropActive: (active: boolean) => void
  setHoveredSection: (id: string | null) => void
  setSelectedSection: (id: string | null) => void
  toggleChat: (expanded?: boolean) => void
  toggleContent: (expanded?: boolean) => void
  setEditorOption: (option: 'option1' | 'option2') => void
  setOption2Panel: (panel: 'chat' | 'content') => void
  expandSection: (id: string | null, scrollPreview?: boolean) => void
  clearPreviewScroll: () => void
  dismissToast: () => void
  undo: () => void
  pushHistory: (message: string) => void
  reorderSections: (activeId: string, overId: string) => void
  moveSelected: (direction: -1 | 1) => void
  toggleSection: (id: string) => void
  updateTitle: (title: string) => void
  updateDescription: (description: string) => void
  updateAddress: (address: string) => void
  updatePrice: (price: string) => void
  updatePhotos: (photos: ListingPhoto[]) => void
  addPhotos: (urls: string[]) => void
  removePhoto: (id: string) => void
  movePhoto: (from: number, to: number) => void
  setPhotoRoom: (id: string, room: RoomLabel | '') => void
  cleanPhoto: (id: string) => void
  cleanAllPhotos: () => void
  restorePhoto: (id: string) => void
  labelPhotosWithCopilot: () => void
  updateKeyFact: (index: number, patch: Partial<KeyFact>) => void
  addKeyFact: () => void
  removeKeyFact: (index: number) => void
  updateHomeFeature: (index: number, value: string) => void
  addHomeFeature: (value?: string) => void
  removeHomeFeature: (index: number) => void
  updateAgent: (patch: Partial<AgentContacts>) => void
  updateTourUrl: (url: string) => void
  updateFloorPlan: (url: string) => void
  setFloorPlanView: (view: FloorPlanView) => void
  toggleFloorRoom: (id: FloorPlanRoomId) => void
  addCustomBlock: () => void
  updateCustomBlock: (id: string, patch: { title?: string; body?: string }) => void
  removeCustomBlock: (id: string) => void
  lockSection: (id: string, locked: boolean) => void
  rewriteSection: (id: string) => void
  rewritePropertyDetails: () => void
  lockPropertyDetails: (locked: boolean) => void
  setListingLayout: (layout: ListingLayout) => void
  setAgencyBranding: (patch: { name?: string; logoUrl?: string }) => boolean
  unlockAgencyBranding: () => boolean
  setBrandingKind: (kind: ListingBrandingKind) => void
  usePlannerBranding: () => void
  removeBranding: () => void
  generateSectionContent: (id: string) => void
  markSaved: () => void
  createDraftAndStart: (prompt: string) => string
  sendFollowUp: (prompt: string) => void
  openListing: (id: string) => void
  duplicateListing: (id: string) => string | null
  setListingStatus: (id: string, status: ListingStatus) => void
  deleteListing: (id: string) => void
  closeListing: () => void
  stopGeneration: () => void
  continueGeneration: () => void
  updatePublishSettings: (patch: Partial<PublishSettings>) => void
  publish: () => void
}

function sortSections(sections: Section[]) {
  return [...sections].sort((a, b) => a.order - b.order)
}

function withOrder(sections: Section[]) {
  return sections.map((section, index) => ({ ...section, order: index }))
}

export const useListingStore = create<AppState>((set, get) => ({
  sidebarCollapsed: false,
  listings: SAMPLE_LISTINGS,
  currentListing: null,
  settings: defaultSettings(),
  composerText: '',
  messages: [],
  generation: idleGeneration(),
  chatExpanded: true,
  contentExpanded: false,
  expandedSectionId: 'property-details',
  hoveredSectionId: null,
  selectedSectionId: null,
  previewScrollTo: null,
  toast: null,
  dropActive: false,
  lastSavedAt: null,
  dirty: false,
  history: [],
  generatedPayload: null,
  detailsStatus: 'ready',
  detailsLocked: false,
  credits: 80,
  editorOption: 'option1',
  option2Panel: 'chat',

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setComposerText: (text) => set({ composerText: text }),
  setMode: (mode) => set((s) => ({ settings: { ...s.settings, mode } })),
  setDeal: (deal) =>
    set((s) => ({
      settings: { ...s.settings, deal },
      currentListing: s.currentListing
        ? { ...s.currentListing, dealType: deal, updatedAt: Date.now() }
        : null,
      dirty: Boolean(s.currentListing),
    })),
  setFloorPlan: (floorPlan) =>
    set((s) => ({
      settings: { ...s.settings, floorPlan },
      currentListing: s.currentListing
        ? {
            ...s.currentListing,
            sections: s.currentListing.sections.map((section) =>
              section.type === 'floorPlan'
                ? { ...section, enabled: floorPlan !== 'none' }
                : section,
            ),
            updatedAt: Date.now(),
          }
        : null,
      dirty: Boolean(s.currentListing),
    })),
  setBranding: (branding) =>
    set((s) => ({ settings: { ...s.settings, branding } })),
  setSpace: (space) => set((s) => ({ settings: { ...s.settings, space } })),

  addAttachments: (files) =>
    set((s) => {
      const images = files.filter((f) => f.kind === 'image')
      const nextCount = Math.min(
        s.settings.photoMax,
        s.settings.photoCount + images.length,
      )
      return {
        settings: {
          ...s.settings,
          attachments: [...s.settings.attachments, ...files],
          photoCount: nextCount,
        },
      }
    }),

  removeAttachment: (id) =>
    set((s) => {
      const removed = s.settings.attachments.find((a) => a.id === id)
      return {
        settings: {
          ...s.settings,
          attachments: s.settings.attachments.filter((a) => a.id !== id),
          photoCount: Math.max(
            0,
            s.settings.photoCount - (removed?.kind === 'image' ? 1 : 0),
          ),
        },
      }
    }),

  setDropActive: (active) => set({ dropActive: active }),
  setHoveredSection: (id) => set({ hoveredSectionId: id }),
  setSelectedSection: (id) => set({ selectedSectionId: id }),
  toggleChat: (expanded) =>
    set((s) => ({
      chatExpanded: expanded ?? !s.chatExpanded,
    })),
  toggleContent: (expanded) =>
    set((s) => ({
      contentExpanded: expanded ?? !s.contentExpanded,
    })),
  setEditorOption: (option) => set({ editorOption: option }),
  setOption2Panel: (panel) => set({ option2Panel: panel }),

  expandSection: (id, scrollPreview = true) =>
    set({
      expandedSectionId: id,
      selectedSectionId: id,
      previewScrollTo: scrollPreview ? id : null,
    }),

  clearPreviewScroll: () => set({ previewScrollTo: null }),
  dismissToast: () => set({ toast: null }),

  pushHistory: (message) => {
    const listing = get().currentListing
    if (!listing) return
    set((s) => ({
      history: [
        ...s.history.slice(-19),
        { sections: listing.sections.map((sec) => ({ ...sec })), message },
      ],
    }))
  },

  undo: () => {
    const { history } = get()
    const snapshot = history[history.length - 1]
    if (!snapshot || !get().currentListing) return
    set((s) => ({
      currentListing: s.currentListing
        ? { ...s.currentListing, sections: snapshot.sections, updatedAt: Date.now() }
        : null,
      history: s.history.slice(0, -1),
      toast: null,
      dirty: true,
    }))
  },

  reorderSections: (activeId, overId) => {
    const listing = get().currentListing
    if (!listing || activeId === overId) return
    get().pushHistory('Moved')
    const ordered = sortSections(listing.sections)
    const oldIndex = ordered.findIndex((s) => s.id === activeId)
    const newIndex = ordered.findIndex((s) => s.id === overId)
    if (oldIndex < 0 || newIndex < 0) return
    const next = [...ordered]
    const [moved] = next.splice(oldIndex, 1)
    next.splice(newIndex, 0, moved)
    set({
      currentListing: {
        ...listing,
        sections: withOrder(next),
        updatedAt: Date.now(),
      },
      toast: { id: crypto.randomUUID(), message: 'Moved', actionLabel: 'Undo' },
      dirty: true,
      selectedSectionId: activeId,
    })
  },

  moveSelected: (direction) => {
    const { currentListing, selectedSectionId } = get()
    if (!currentListing || !selectedSectionId) return
    const ordered = sortSections(currentListing.sections)
    const index = ordered.findIndex((s) => s.id === selectedSectionId)
    const target = ordered[index + direction]
    if (!target) return
    get().reorderSections(selectedSectionId, target.id)
  },

  toggleSection: (id) => {
    const listing = get().currentListing
    if (!listing) return
    const section = listing.sections.find((s) => s.id === id)
    if (!section || section.required || !section.hasContent) return
    get().pushHistory(section.enabled ? 'Hidden' : 'Shown')
    set({
      currentListing: {
        ...listing,
        sections: listing.sections.map((s) =>
          s.id === id ? { ...s, enabled: !s.enabled } : s,
        ),
        updatedAt: Date.now(),
      },
      toast: {
        id: crypto.randomUUID(),
        message: section.enabled ? 'Hidden' : 'Shown',
        actionLabel: 'Undo',
      },
      dirty: true,
    })
  },

  updateTitle: (title) => {
    const listing = get().currentListing
    if (!listing) return
    set({
      currentListing: { ...listing, title, updatedAt: Date.now() },
      dirty: true,
    })
  },

  updateDescription: (description) => {
    const listing = get().currentListing
    if (!listing) return
    set({
      currentListing: { ...listing, description, updatedAt: Date.now() },
      dirty: true,
    })
  },

  updateAddress: (address) => {
    const listing = get().currentListing
    if (!listing) return
    set({
      currentListing: { ...listing, address, updatedAt: Date.now() },
      dirty: true,
    })
  },

  updatePrice: (price) => {
    const listing = get().currentListing
    if (!listing) return
    set({
      currentListing: { ...listing, price, updatedAt: Date.now() },
      dirty: true,
    })
  },

  updatePhotos: (photos) => editSection(get, set, 'photos', { photos }),
  addPhotos: (urls) =>
    editSection(get, set, 'photos', (listing) => ({
      photos: [...listing.photos, ...urls.map((url) => createPhoto(url))].slice(0, 20),
    })),
  removePhoto: (id) =>
    editSection(get, set, 'photos', (listing) => ({
      photos: listing.photos.filter((photo) => photo.id !== id),
    })),
  movePhoto: (from, to) =>
    editSection(get, set, 'photos', (listing) => {
      if (from === to || from < 0 || to < 0) return {}
      const photos = [...listing.photos]
      const [moved] = photos.splice(from, 1)
      photos.splice(to, 0, moved)
      return { photos }
    }),
  setPhotoRoom: (id, room) =>
    editSection(get, set, 'photos', (listing) => ({
      photos: listing.photos.map((photo) => (photo.id === id ? { ...photo, room } : photo)),
    })),
  cleanPhoto: (id) => {
    const listing = get().currentListing
    if (!listing) return
    editSection(get, set, 'photos', {
      photos: listing.photos.map((photo) =>
        photo.id === id ? { ...photo, cleaning: true } : photo,
      ),
    })
    later(() => {
      const current = get().currentListing
      if (!current) return
      editSection(get, set, 'photos', {
        photos: current.photos.map((photo) =>
          photo.id === id ? { ...photo, cleaning: false, cleaned: true } : photo,
        ),
      })
    }, 900)
  },
  cleanAllPhotos: () => {
    const listing = get().currentListing
    if (!listing) return
    const dirty = listing.photos.filter((photo) => !photo.cleaned)
    if (!dirty.length) return
    editSection(get, set, 'photos', {
      photos: listing.photos.map((photo) =>
        photo.cleaned ? photo : { ...photo, cleaning: true },
      ),
    })
    later(() => {
      const current = get().currentListing
      if (!current) return
      editSection(get, set, 'photos', {
        photos: current.photos.map((photo) => ({
          ...photo,
          cleaning: false,
          cleaned: true,
        })),
      })
    }, 1100)
  },
  restorePhoto: (id) =>
    editSection(get, set, 'photos', (listing) => ({
      photos: listing.photos.map((photo) =>
        photo.id === id ? { ...photo, cleaned: false, cleaning: false } : photo,
      ),
    })),
  labelPhotosWithCopilot: () =>
    editSection(get, set, 'photos', (listing) => ({
      photos: listing.photos.map((photo) => ({
        ...photo,
        room: photo.room || guessRoom(photo.originalUrl || photo.url),
      })),
    })),

  updateKeyFact: (index, patch) =>
    editSection(get, set, 'keyFacts', (listing) => ({
      keyFacts: listing.keyFacts.map((fact, i) => (i === index ? { ...fact, ...patch } : fact)),
    })),
  addKeyFact: () =>
    editSection(get, set, 'keyFacts', (listing) => ({
      keyFacts: [...listing.keyFacts, { label: 'New fact', value: '' }],
    })),
  removeKeyFact: (index) =>
    editSection(get, set, 'keyFacts', (listing) => ({
      keyFacts: listing.keyFacts.filter((_, i) => i !== index),
    })),

  updateHomeFeature: (index, value) =>
    editSection(get, set, 'homeFeatures', (listing) => ({
      homeFeatures: listing.homeFeatures.map((feature, i) => (i === index ? value : feature)),
    })),
  addHomeFeature: (value = '') =>
    editSection(get, set, 'homeFeatures', (listing) => ({
      homeFeatures: [...listing.homeFeatures, value || 'New feature'],
    })),
  removeHomeFeature: (index) =>
    editSection(get, set, 'homeFeatures', (listing) => ({
      homeFeatures: listing.homeFeatures.filter((_, i) => i !== index),
    })),

  updateAgent: (patch) =>
    editSection(get, set, 'agentContacts', (listing) => ({
      agent: { ...listing.agent, ...patch },
    })),

  updateTourUrl: (url) => editSection(get, set, 'tour3d', { tourUrl: url }),
  updateFloorPlan: (url) => editSection(get, set, 'floorPlan', { floorPlanUrl: url }),
  setFloorPlanView: (view) => {
    const listing = get().currentListing
    if (!listing) return
    set({ currentListing: { ...listing, floorPlanView: view, updatedAt: Date.now() } })
  },
  toggleFloorRoom: (id) => {
    const listing = get().currentListing
    if (!listing) return
    const hidden = listing.hiddenFloorRooms ?? []
    const next = hidden.includes(id) ? hidden.filter((room) => room !== id) : [...hidden, id]
    set({
      currentListing: { ...listing, hiddenFloorRooms: next, updatedAt: Date.now() },
      dirty: true,
    })
  },

  addCustomBlock: () => {
    const listing = get().currentListing
    if (!listing) return
    const count = listing.sections.filter((section) => section.type === 'custom').length
    const section: Section = {
      id: `custom-${crypto.randomUUID()}`,
      type: 'custom',
      title: count ? `Custom block ${count + 1}` : 'Custom block',
      order: listing.sections.length,
      enabled: true,
      required: false,
      hasContent: true,
      locked: true,
      status: 'ready',
      body: '',
      source: 'Added manually',
    }
    set({
      currentListing: {
        ...listing,
        sections: [...listing.sections, section],
        updatedAt: Date.now(),
      },
      expandedSectionId: section.id,
      selectedSectionId: section.id,
      contentExpanded: true,
      dirty: true,
    })
  },

  updateCustomBlock: (id, patch) => {
    const listing = get().currentListing
    if (!listing) return
    set({
      currentListing: {
        ...listing,
        sections: listing.sections.map((section) =>
          section.id === id && section.type === 'custom'
            ? { ...section, ...patch, locked: true }
            : section,
        ),
        updatedAt: Date.now(),
      },
      dirty: true,
    })
  },

  removeCustomBlock: (id) => {
    const listing = get().currentListing
    if (!listing) return
    const section = listing.sections.find((item) => item.id === id)
    if (!section || section.type !== 'custom') return
    const nextId = get().expandedSectionId === id ? 'property-details' : get().expandedSectionId
    set({
      currentListing: {
        ...listing,
        sections: withOrder(listing.sections.filter((item) => item.id !== id)),
        updatedAt: Date.now(),
      },
      expandedSectionId: nextId,
      selectedSectionId: get().selectedSectionId === id ? nextId : get().selectedSectionId,
      dirty: true,
    })
  },

  lockSection: (id, locked) => {
    const listing = get().currentListing
    if (!listing) return
    set({
      currentListing: {
        ...listing,
        sections: listing.sections.map((s) => (s.id === id ? { ...s, locked } : s)),
        updatedAt: Date.now(),
      },
      dirty: true,
    })
  },

  rewriteSection: (id) => {
    const listing = get().currentListing
    if (!listing) return
    const section = listing.sections.find((s) => s.id === id)
    if (!section || section.locked) return
    set({
      currentListing: {
        ...listing,
        sections: listing.sections.map((s) =>
          s.id === id ? { ...s, status: 'generating' } : s,
        ),
      },
    })
    later(() => {
      const current = get().currentListing
      if (!current) return
      set({
        currentListing: {
          ...current,
          sections: current.sections.map((s) =>
            s.id === id ? { ...s, status: 'ready', source: 'Rewritten with Copilot' } : s,
          ),
          updatedAt: Date.now(),
        },
        dirty: true,
      })
    }, 1100)
  },

  rewritePropertyDetails: () => {
    const listing = get().currentListing
    if (!listing || get().detailsLocked || get().detailsStatus === 'generating') return
    set({ detailsStatus: 'generating' })
    later(() => {
      const current = get().currentListing
      if (!current) return
      const improved = improvePropertyDetails(current)
      set({
        currentListing: {
          ...current,
          title: improved.title,
          description: improved.description,
          updatedAt: Date.now(),
        },
        detailsStatus: 'ready',
        dirty: true,
      })
    }, 1100)
  },

  lockPropertyDetails: (locked) => set({ detailsLocked: locked, dirty: true }),

  setListingLayout: (layout) => {
    const listing = get().currentListing
    if (!listing || listing.layout === layout) return
    set({
      currentListing: { ...listing, layout, updatedAt: Date.now() },
      dirty: true,
    })
  },

  setAgencyBranding: (patch) => {
    const listing = get().currentListing
    if (!listing) return false
    if (!listing.agencyBrandingUnlocked) {
      set({
        toast: {
          id: crypto.randomUUID(),
          message: 'Unlock branding in Content first',
        },
      })
      return false
    }
    set({
      currentListing: {
        ...listing,
        brandingKind: 'agency',
        brandingRemoved: false,
        agencyName: patch.name ?? listing.agencyName ?? '',
        agencyLogoUrl: patch.logoUrl ?? listing.agencyLogoUrl,
        updatedAt: Date.now(),
      },
      dirty: true,
    })
    return true
  },

  unlockAgencyBranding: () => {
    const listing = get().currentListing
    if (!listing) return false
    if (listing.agencyBrandingUnlocked) return true
    if (get().credits < AGENCY_BRANDING_CREDIT_COST) {
      set({
        toast: {
          id: crypto.randomUUID(),
          message: `Need ${AGENCY_BRANDING_CREDIT_COST} credits to unlock branding`,
        },
      })
      return false
    }
    set({
      currentListing: {
        ...listing,
        agencyBrandingUnlocked: true,
        brandingKind: 'agency',
        brandingRemoved: false,
        agencyName: listing.agencyName || 'My agency',
        updatedAt: Date.now(),
      },
      credits: get().credits - AGENCY_BRANDING_CREDIT_COST,
      expandedSectionId: 'branding',
      selectedSectionId: 'branding',
      contentExpanded: true,
      toast: {
        id: crypto.randomUUID(),
        message: 'Branding unlocked',
      },
      dirty: true,
    })
    return true
  },

  setBrandingKind: (kind) => {
    const listing = get().currentListing
    if (!listing) return
    if (!listing.agencyBrandingUnlocked) {
      set({
        toast: {
          id: crypto.randomUUID(),
          message: 'Unlock branding in Content first',
        },
      })
      return
    }
    if (kind === 'planner') return
    set({
      currentListing: {
        ...listing,
        brandingKind: kind,
        brandingRemoved: kind === 'none',
        updatedAt: Date.now(),
      },
      dirty: true,
    })
  },

  usePlannerBranding: () => get().setBrandingKind('planner'),

  removeBranding: () => get().setBrandingKind('none'),

  generateSectionContent: (id) => {
    const listing = get().currentListing
    if (!listing) return
    set({
      currentListing: {
        ...listing,
        sections: listing.sections.map((s) =>
          s.id === id ? { ...s, status: 'generating' } : s,
        ),
      },
    })
    later(() => {
      applySectionReady(get, set, id)
    }, 1200)
  },

  markSaved: () =>
    set({
      lastSavedAt: Date.now(),
      dirty: false,
    }),

  createDraftAndStart: (prompt) => {
    clearTimers()
    const payload = buildGeneratedContent(prompt)
    const now = Date.now()
    const listing: Listing = {
      id: crypto.randomUUID(),
      address: payload.address,
      title: payload.title,
      description: '',
      price: payload.price,
      dealType: get().settings.deal,
      status: 'draft',
      thumbnail: payload.thumbnail,
      photos: [],
      sections: createDefaultSections(),
      keyFacts: [],
      homeFeatures: [],
      agent: payload.agent,
      layout: 'classic',
      brandingKind: 'planner',
      brandingRemoved: false,
      agencyBrandingUnlocked: false,
      publishSettings: { ...DEFAULT_PUBLISH_SETTINGS },
      createdAt: now,
      updatedAt: now,
    }

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt.trim() || 'Create a listing from the files I dropped',
      attachments: get().settings.attachments,
    }

    set((s) => ({
      listings: [
        {
          id: listing.id,
          address: listing.address,
          price: listing.price,
          dealType: listing.dealType,
          status: 'draft',
          thumbnail: listing.thumbnail,
        },
        ...s.listings,
      ],
      currentListing: listing,
      messages: [message],
      composerText: '',
      settings: { ...s.settings, attachments: [], photoCount: 0 },
      generatedPayload: payload,
      chatExpanded: true,
      expandedSectionId: 'property-details',
      lastSavedAt: now,
      dirty: false,
      history: [],
      toast: null,
      detailsStatus: 'ready',
      detailsLocked: false,
    }))

    startPipeline(get, set, false)
    return listing.id
  },

  sendFollowUp: (prompt) => {
    const listing = get().currentListing
    if (!listing) return
    const text = prompt.trim()
    if (!text) return
    if (get().generation.running) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      attachments: get().settings.attachments,
    }
    const result = applyChatFollowUp(listing, text)

    set((s) => ({
      messages: [...s.messages, userMessage],
      composerText: '',
      settings: {
        ...s.settings,
        attachments: [],
        photoCount: s.settings.attachments.filter((a) => a.kind === 'image').length
          ? 0
          : s.settings.photoCount,
      },
      chatExpanded: true,
      detailsStatus: 'description' in result.patch ? 'generating' : s.detailsStatus,
      generation: {
        running: true,
        cancelled: false,
        startedAt: Date.now(),
        elapsedMs: 0,
        currentLabel: result.label,
        steps: [{ id: 'follow-up', label: result.label, status: 'active' }],
        canContinue: false,
      },
    }))

    later(() => {
      const current = get().currentListing
      if (!current || !get().generation.running) return
      set({
        currentListing: { ...current, ...result.patch, updatedAt: Date.now() },
        detailsStatus: 'ready',
        messages: [
          ...get().messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: result.reply,
            attachments: [],
          },
        ],
        generation: {
          ...get().generation,
          running: false,
          currentLabel: 'Done',
          steps: [{ id: 'follow-up', label: result.label, status: 'done' }],
        },
        dirty: true,
      })
    }, 900)
  },

  openListing: (id) => {
    clearTimers()
    const summary = get().listings.find((l) => l.id === id)
    const existing = get().currentListing
    if (existing?.id === id) return
    const listing = summary ? hydrateSampleListing(summary) : existing
    if (!listing) return
    set({
      currentListing: listing,
      messages: [
        {
          id: 'seed',
          role: 'user',
          content: `Open ${listing.address}`,
          attachments: [],
        },
      ],
      generation: idleGeneration(),
      chatExpanded: true,
      expandedSectionId: 'property-details',
      lastSavedAt: listing.updatedAt,
      dirty: false,
      history: [],
      generatedPayload: null,
      detailsStatus: 'ready',
      detailsLocked: false,
    })
  },

  duplicateListing: (id) => {
    const item = get().listings.find((listing) => listing.id === id)
    if (!item) return null
    const copyId = crypto.randomUUID()
    set((s) => ({
      listings: [
        {
          ...item,
          id: copyId,
          status: 'draft',
          address: item.address,
        },
        ...s.listings,
      ],
      toast: { id: crypto.randomUUID(), message: 'Duplicated to drafts' },
    }))
    return copyId
  },

  setListingStatus: (id, status) => {
    const item = get().listings.find((listing) => listing.id === id)
    if (!item || item.status === status) return
    const label =
      status === 'published' ? 'Moved to published' : status === 'closed' ? 'Moved to closed' : 'Moved to drafts'
    set((s) => ({
      listings: s.listings.map((listing) => (listing.id === id ? { ...listing, status } : listing)),
      currentListing:
        s.currentListing?.id === id ? { ...s.currentListing, status } : s.currentListing,
      toast: { id: crypto.randomUUID(), message: label },
    }))
  },

  deleteListing: (id) => {
    const current = get().currentListing
    set((s) => ({
      listings: s.listings.filter((listing) => listing.id !== id),
      currentListing: current?.id === id ? null : s.currentListing,
      toast: { id: crypto.randomUUID(), message: 'Listing deleted' },
    }))
  },

  closeListing: () => {
    clearTimers()
    set({
      currentListing: null,
      messages: [],
      generation: idleGeneration(),
      composerText: '',
      chatExpanded: true,
    })
  },

  stopGeneration: () => {
    clearTimers()
    const listing = get().currentListing
    if (!listing) return
    set({
      generation: {
        ...get().generation,
        running: false,
        cancelled: true,
        canContinue: listing.sections.some((s) => s.status !== 'ready'),
        currentLabel: 'Stopped',
        steps: get().generation.steps.map((step) =>
          step.status === 'active' ? { ...step, status: 'cancelled' } : step,
        ),
      },
      currentListing: {
        ...listing,
        sections: listing.sections.map((s) =>
          s.status === 'generating' ? { ...s, status: 'pending' } : s,
        ),
      },
    })
  },

  continueGeneration: () => {
    if (!get().currentListing) return
    startPipeline(get, set, true)
  },

  updatePublishSettings: (patch) => {
    const listing = get().currentListing
    if (!listing) return
    set({
      currentListing: {
        ...listing,
        publishSettings: {
          ...DEFAULT_PUBLISH_SETTINGS,
          ...listing.publishSettings,
          ...patch,
        },
        updatedAt: Date.now(),
      },
      dirty: true,
    })
  },

  publish: () => {
    const listing = get().currentListing
    if (!listing) return
    const missing = listing.sections.find((s) => s.required && (!s.hasContent || !s.enabled))
    if (missing) {
      set({
        toast: {
          id: crypto.randomUUID(),
          message: `Can't publish without ${missing.title.toLowerCase()}`,
        },
        expandedSectionId: missing.id,
        contentExpanded: true,
      })
      return
    }
    const settings = { ...DEFAULT_PUBLISH_SETTINGS, ...listing.publishSettings }
    const where =
      settings.visibility === 'unlisted'
        ? 'Unlisted link ready'
        : settings.listOnPortals
          ? 'Live on your page and portals'
          : 'Live on your public page'
    set({
      currentListing: { ...listing, status: 'published', updatedAt: Date.now() },
      listings: get().listings.map((item) =>
        item.id === listing.id ? { ...item, status: 'published' } : item,
      ),
      toast: { id: crypto.randomUUID(), message: `Published · ${where}` },
      dirty: true,
    })
  },
}))

type Get = () => AppState
type Set = (
  partial: Partial<AppState> | ((state: AppState) => Partial<AppState>),
) => void

function editSection(
  get: Get,
  set: Set,
  sectionId: string,
  patch: Partial<Listing> | ((listing: Listing) => Partial<Listing>),
) {
  const listing = get().currentListing
  if (!listing) return
  const nextPatch = typeof patch === 'function' ? patch(listing) : patch
  const merged = { ...listing, ...nextPatch }
  const hasContent: Record<string, boolean> = {
    photos: merged.photos.length > 0,
    keyFacts: merged.keyFacts.length > 0,
    homeFeatures: merged.homeFeatures.some((item) => item.trim().length > 0),
    tour3d: Boolean(merged.tourUrl?.trim()),
    floorPlan: Boolean(merged.floorPlanUrl?.trim()),
    agentContacts: Boolean(
      merged.agent.name.trim() || merged.agent.phone.trim() || merged.agent.email.trim(),
    ),
  }
  set({
    currentListing: {
      ...merged,
      sections: listing.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              locked: true,
              status: 'ready',
              hasContent: hasContent[section.id] ?? section.hasContent,
              source: section.source ?? 'Edited manually',
            }
          : section,
      ),
      updatedAt: Date.now(),
    },
    dirty: true,
  })
}

const PIPELINE: { id: string; label: string; sectionId?: string; fillDetails?: boolean }[] = [
  { id: 'read', label: 'Reading your room' },
  { id: 'photos', label: 'Sorting photos', sectionId: 'photos' },
  { id: 'floor', label: 'Drawing the floor plan', sectionId: 'floorPlan' },
  { id: 'numbers', label: 'Pulling out the numbers', sectionId: 'keyFacts' },
  { id: 'write', label: 'Writing the page', fillDetails: true },
  { id: 'tour', label: 'Building the tour', sectionId: 'tour3d' },
  { id: 'features', label: 'Listing home features', sectionId: 'homeFeatures' },
  { id: 'agent', label: 'Adding agent contacts', sectionId: 'agentContacts' },
]

function applySectionReady(
  get: Get,
  set: Set,
  sectionId: string,
  extra?: Partial<Listing>,
) {
  const listing = get().currentListing
  const payload = get().generatedPayload
  if (!listing) return

  const currentSection = listing.sections.find((s) => s.id === sectionId)
  if (currentSection?.locked) {
    set({
      currentListing: {
        ...listing,
        sections: listing.sections.map((s) =>
          s.id === sectionId ? { ...s, status: 'ready' } : s,
        ),
      },
    })
    return
  }

  const sourceByType: Record<string, string | undefined> = {
    photos: 'From your camera roll',
    floorPlan: 'Generated floor plan',
    keyFacts: 'From developer PDF',
    tour3d: 'From the 3D tour',
    homeFeatures: 'From listing notes',
    agentContacts: get().settings.space,
  }

  const patch: Partial<Listing> = { ...extra }
  if (payload) {
    if (sectionId === 'photos') patch.photos = photosFromUrls(payload.photos, true)
    if (sectionId === 'keyFacts') patch.keyFacts = payload.keyFacts
    if (sectionId === 'homeFeatures') patch.homeFeatures = payload.homeFeatures
    if (sectionId === 'tour3d') patch.tourUrl = payload.tourUrl
    if (sectionId === 'floorPlan') {
      patch.floorPlanUrl = payload?.floorPlanUrl ?? listing.floorPlanUrl ?? 'auto'
    }
    if (sectionId === 'agentContacts') patch.agent = payload.agent
  }

  set({
    currentListing: {
      ...listing,
      ...patch,
      sections: listing.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              status: 'ready',
              hasContent: true,
              enabled: true,
              source: s.source ?? sourceByType[s.type],
            }
          : s,
      ),
      updatedAt: Date.now(),
    },
    dirty: true,
  })
}

function startPipeline(get: Get, set: Set, resume: boolean) {
  clearTimers()
  const listing = get().currentListing
  if (!listing) return

  const remaining = PIPELINE.filter((step) => {
    if (step.sectionId === 'floorPlan' && get().settings.floorPlan === 'none') return false
    if (step.sectionId) {
      const section = listing.sections.find((s) => s.id === step.sectionId)
      return section?.status !== 'ready'
    }
    if (step.fillDetails) return !listing.description
    return resume ? false : true
  })

  const steps = remaining.map((step, index) => ({
    id: step.id,
    label: step.label,
    status: index === 0 ? ('active' as const) : ('pending' as const),
  }))

  set({
    generation: {
      running: true,
      cancelled: false,
      startedAt: Date.now(),
      elapsedMs: 0,
      currentLabel: remaining[0]?.label ?? 'Done',
      steps,
      canContinue: false,
    },
    chatExpanded: true,
  })

  tickTimer = window.setInterval(() => {
    const gen = get().generation
    if (!gen.running || !gen.startedAt) return
    set({
      generation: { ...gen, elapsedMs: Date.now() - gen.startedAt },
    })
  }, 250)

  const STEP_MS = 1400
  remaining.forEach((step, index) => {
    later(() => {
      const current = get().currentListing
      if (!current || !get().generation.running) return

      if (step.sectionId) {
        set({
          currentListing: {
            ...current,
            sections: current.sections.map((s) =>
              s.id === step.sectionId ? { ...s, status: 'generating' } : s,
            ),
          },
        })
      }

      set({
        generation: {
          ...get().generation,
          currentLabel: step.label,
          steps: get().generation.steps.map((item) =>
            item.id === step.id
              ? { ...item, status: 'active' }
              : remaining.slice(0, index).some((r) => r.id === item.id)
                ? { ...item, status: 'done' }
                : item,
          ),
        },
      })
    }, index * STEP_MS)

    later(() => {
      const current = get().currentListing
      if (!current || !get().generation.running) return

      if (step.fillDetails) {
        const payload = get().generatedPayload
        set({
          currentListing: {
            ...current,
            title: payload?.title ?? current.title,
            description: payload?.description ?? current.description,
            price: payload?.price ?? current.price,
            address: payload?.address ?? current.address,
            updatedAt: Date.now(),
          },
          dirty: true,
        })
      }

      if (step.sectionId) {
        applySectionReady(get, set, step.sectionId)
      }

      const isLast = index === remaining.length - 1
      set({
        generation: {
          ...get().generation,
          currentLabel: isLast ? 'Done' : get().generation.currentLabel,
          running: !isLast,
          steps: get().generation.steps.map((item) =>
            remaining.slice(0, index + 1).some((r) => r.id === item.id)
              ? { ...item, status: 'done' }
              : item,
          ),
        },
      })

      if (isLast) {
        if (tickTimer != null) {
          window.clearInterval(tickTimer)
          tickTimer = null
        }
      }
    }, index * STEP_MS + STEP_MS - 80)
  })
}
