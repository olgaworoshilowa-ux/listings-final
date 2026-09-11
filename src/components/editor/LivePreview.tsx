import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Box, MapPin, Maximize2, Minimize2, Settings } from 'lucide-react'
import { useListingStore } from '../../store/useListingStore'
import { FloorPlanViewer, FloorPlanViewToggle } from './FloorPlanGraphic'
import { isUploadedFloorPlan } from './SectionEditor'
import { LayoutSwitch } from './EditorTopBar'
import { Popover, PopoverItem } from '../ui/Overlay'
import type {
  FloorPlanRoomId,
  FloorPlanView,
  Listing,
  ListingBrandingKind,
  ListingPhoto,
  Section,
} from '../../types'

export function LivePreview() {
  const listing = useListingStore((s) => s.currentListing)
  const hovered = useListingStore((s) => s.hoveredSectionId)
  const expandSection = useListingStore((s) => s.expandSection)
  const previewScrollTo = useListingStore((s) => s.previewScrollTo)
  const clearPreviewScroll = useListingStore((s) => s.clearPreviewScroll)
  const editorOption = useListingStore((s) => s.editorOption)
  const refs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    if (!previewScrollTo) return
    refs.current[previewScrollTo]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    clearPreviewScroll()
  }, [previewScrollTo, clearPreviewScroll])

  if (!listing) return null

  const bind = (id: string) => (node: HTMLElement | null) => {
    refs.current[id] = node
  }

  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#f2f3f5] p-4 md:p-6">
      <div className="mx-auto w-full max-w-[880px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <EditorOptionSwitch />
          {editorOption === 'option2' && (
            <LayoutSwitch
              layout={listing.layout ?? 'classic'}
              className="bg-white shadow-sm ring-1 ring-black/[0.08]"
            />
          )}
        </div>
        <ListingPage
          listing={listing}
          hovered={hovered}
          expandSection={expandSection}
          bind={bind}
        />
      </div>
    </div>
  )
}

function EditorOptionSwitch() {
  const option = useListingStore((s) => s.editorOption)
  const setEditorOption = useListingStore((s) => s.setEditorOption)
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Editor layout options"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 items-center gap-2 rounded-full bg-white px-3 text-[13px] font-medium text-ink shadow-sm ring-1 ring-black/[0.08] hover:bg-canvas"
      >
        <Settings className="h-4 w-4" />
        {option === 'option1' ? 'Option 1' : 'Option 2'}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} className="left-0">
        <PopoverItem
          active={option === 'option1'}
          onClick={() => {
            setEditorOption('option1')
            setOpen(false)
          }}
        >
          Option 1
        </PopoverItem>
        <PopoverItem
          active={option === 'option2'}
          onClick={() => {
            setEditorOption('option2')
            setOpen(false)
          }}
        >
          Option 2
        </PopoverItem>
      </Popover>
    </div>
  )
}

export function ListingPage({
  listing,
  publicView = false,
  hovered = null,
  expandSection = () => undefined,
  bind = () => () => undefined,
}: {
  listing: Listing
  publicView?: boolean
  hovered?: string | null
  expandSection?: (id: string) => void
  bind?: (id: string) => (node: HTMLElement | null) => void
}) {
  const ordered = [...listing.sections].sort((a, b) => a.order - b.order)
  const visible = ordered.filter((s) => s.enabled)
  const layout = listing.layout ?? 'classic'
  const titleReady = listing.title.length > 0
  const descReady = listing.description.length > 0

  const header = (
    <div
      ref={bind('property-details')}
      onClick={publicView ? undefined : () => expandSection('property-details')}
      onMouseEnter={
        publicView ? undefined : () => useListingStore.getState().setHoveredSection('property-details')
      }
      onMouseLeave={
        publicView ? undefined : () => useListingStore.getState().setHoveredSection(null)
      }
      className={`scroll-mt-4 ${publicView ? '' : outline(hovered === 'property-details')}`}
    >
      {titleReady ? (
        <header className="fade-in px-8 pt-6 pb-2">
          <p className="text-[13px] font-medium text-publish">{listing.dealType}</p>
          <h2 className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-ink">{listing.title}</h2>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {listing.address}
            </span>
            <span className="font-semibold text-ink">{listing.price}</span>
          </div>
          {descReady ? (
            <p className="mt-5 max-w-[62ch] text-[15px] leading-7 text-ink/80">{listing.description}</p>
          ) : publicView ? null : (
            <WritingLine />
          )}
        </header>
      ) : publicView ? null : (
        <div className="px-8 pt-8">
          <WritingLine />
          <div className="mt-3 h-8 w-2/3 rounded-lg skeleton" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded skeleton" />
            <div className="h-3 w-5/6 rounded skeleton" />
          </div>
        </div>
      )}
    </div>
  )

  const renderSection = (
    section: Section,
    photoVariant: 'grid' | 'hero' | 'stack' = 'grid',
    bare = false,
  ) => (
    <PreviewBlock
      key={section.id}
      section={section}
      listing={listing}
      photoVariant={photoVariant}
      hovered={!publicView && hovered === section.id}
      onEnter={
        publicView ? undefined : () => useListingStore.getState().setHoveredSection(section.id)
      }
      onLeave={publicView ? undefined : () => useListingStore.getState().setHoveredSection(null)}
      onClick={publicView ? undefined : () => expandSection(section.id)}
      bindRef={bind(section.id)}
      bare={bare}
      publicView={publicView}
    />
  )

  const photos = visible.find((s) => s.type === 'photos')
  const tour = visible.find((s) => s.type === 'tour3d')
  const floor = visible.find((s) => s.type === 'floorPlan')
  const keyFacts = visible.find((s) => s.type === 'keyFacts')
  const features = visible.find((s) => s.type === 'homeFeatures')
  const agent = visible.find((s) => s.type === 'agentContacts')
  const rest = visible.filter(
    (s) =>
      !['photos', 'floorPlan', 'tour3d', 'keyFacts', 'homeFeatures', 'agentContacts'].includes(
        s.type,
      ),
  )

  const pageBody = (photoVariant: 'grid' | 'hero' | 'stack', includePhotos: boolean) => (
    <div className="flex flex-col gap-1 px-4 pb-4 pt-4">
      {includePhotos && photos && renderSection(photos, photoVariant)}
      {keyFacts && renderSection(keyFacts)}
      <PlanTourTabs
        tour={tour}
        floor={floor}
        renderSection={renderSection}
        publicView={publicView}
      />
      {features && renderSection(features)}
      {rest.map((section) => renderSection(section))}
      {agent && renderSection(agent)}
    </div>
  )

  const articleRef = useRef<HTMLElement | null>(null)

  return (
    <article
      ref={articleRef}
      className="overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(17,17,17,0.06)]"
    >
      <BrandingFooter listing={listing} publicView={publicView} fullscreenTarget={articleRef} />

      {layout === 'gallery' && (
        <>
          {photos && renderSection(photos, 'hero')}
          {header}
          {pageBody('hero', false)}
        </>
      )}

      {layout !== 'gallery' && (
        <>
          {header}
          {pageBody(layout === 'split' ? 'stack' : 'grid', true)}
        </>
      )}
    </article>
  )
}

function PlanTourTabs({
  tour,
  floor,
  renderSection,
  publicView = false,
}: {
  tour?: Section
  floor?: Section
  publicView?: boolean
  renderSection: (
    section: Section,
    photoVariant?: 'grid' | 'hero' | 'stack',
    bare?: boolean,
  ) => ReactNode
}) {
  const expandSection = useListingStore((s) => s.expandSection)
  const tabs = [
    tour && tour.status !== 'pending' ? { id: tour.id, label: '3D tour', section: tour } : null,
    floor && floor.status !== 'pending'
      ? { id: floor.id, label: 'Floor plan', section: floor }
      : null,
  ].filter((tab): tab is { id: string; label: string; section: Section } => Boolean(tab))

  const [active, setActive] = useState(tabs[0]?.id ?? '')

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === active)) {
      setActive(tabs[0]?.id ?? '')
    }
  }, [tour?.id, tour?.status, floor?.id, floor?.status, active])

  if (!tabs.length) return null

  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]

  if (tabs.length === 1) {
    return <>{renderSection(tabs[0].section)}</>
  }

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-black/[0.05]">
      <div className="flex justify-start px-3 pt-3" onClick={(event) => event.stopPropagation()}>
        <div className="flex rounded-full bg-canvas p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActive(tab.id)
                if (publicView) return
                expandSection(tab.id)
                useListingStore.getState().setHoveredSection(tab.id)
              }}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                tab.id === current.id ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {current && renderSection(current.section, 'grid', true)}
    </div>
  )
}

function brandingKindOf(listing: Listing): ListingBrandingKind {
  if (listing.agencyBrandingUnlocked && listing.brandingKind === 'planner') return 'agency'
  if (listing.brandingKind) return listing.brandingKind
  return listing.brandingRemoved ? 'none' : 'planner'
}

function BrandingFooter({
  listing,
  publicView = false,
  fullscreenTarget,
}: {
  listing: Listing
  publicView?: boolean
  fullscreenTarget: RefObject<HTMLElement | null>
}) {
  const kind = brandingKindOf(listing)
  const hovered = useListingStore((s) => s.hoveredSectionId) === 'branding'
  const expandSection = useListingStore((s) => s.expandSection)
  const toggleContent = useListingStore((s) => s.toggleContent)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => {
      setFullscreen(document.fullscreenElement === fullscreenTarget.current)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [fullscreenTarget])

  const toggleFullscreen = (event: { stopPropagation: () => void }) => {
    event.stopPropagation()
    const node = fullscreenTarget.current
    if (!node) return
    if (document.fullscreenElement === node) {
      void document.exitFullscreen()
      return
    }
    void node.requestFullscreen()
  }

  const showBrand = kind !== 'none'

  return (
    <div
      className={`flex items-center justify-between gap-3 border-b border-line px-6 py-3 ${
        publicView || !showBrand ? '' : outline(hovered)
      }`}
      onClick={(event) => {
        event.stopPropagation()
        if (publicView || !showBrand) return
        const store = useListingStore.getState()
        if (store.editorOption === 'option2') {
          store.setOption2Panel('content')
        } else {
          toggleContent(true)
        }
        expandSection('branding')
      }}
      onMouseEnter={
        publicView || !showBrand
          ? undefined
          : () => useListingStore.getState().setHoveredSection('branding')
      }
      onMouseLeave={
        publicView || !showBrand
          ? undefined
          : () => useListingStore.getState().setHoveredSection(null)
      }
    >
      {showBrand ? <BrandingMark listing={listing} kind={kind} /> : <span />}
      <button
        type="button"
        aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        onClick={toggleFullscreen}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
      >
        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  )
}

function BrandingMark({ listing, kind }: { listing: Listing; kind: ListingBrandingKind }) {
  if (kind === 'agency') {
    const name = listing.agencyName?.trim() || 'My agency'
    return (
      <div className="flex min-w-0 items-center gap-2">
        {listing.agencyLogoUrl ? (
          <img
            src={listing.agencyLogoUrl}
            alt=""
            className="h-7 w-7 rounded-md object-cover ring-1 ring-black/[0.06]"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-canvas text-[11px] font-semibold text-ink">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <p className="truncate text-[12px] font-semibold text-ink">{name}</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#e7f8ed]">
        <svg viewBox="0 0 32 32" className="h-5 w-5">
          <path d="M6 15.4 16 7l10 8.4V25a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V15.4Z" fill="#22c55e" />
        </svg>
      </span>
      <p className="text-[12px] font-semibold text-ink">Made with Planner 5d</p>
    </div>
  )
}

function PreviewBlock({
  section,
  listing,
  hovered,
  onEnter,
  onLeave,
  onClick,
  bindRef,
  photoVariant,
  bare,
  publicView = false,
}: {
  section: Section
  listing: Listing
  hovered: boolean
  onEnter?: () => void
  onLeave?: () => void
  onClick?: () => void
  bindRef: (node: HTMLElement | null) => void
  photoVariant: 'grid' | 'hero' | 'stack'
  bare?: boolean
  publicView?: boolean
}) {
  return (
    <section
      ref={bindRef}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`scroll-mt-6 overflow-hidden rounded-2xl transition-all duration-300 ${
        publicView ? '' : outline(hovered)
      } ${section.status === 'pending' ? 'max-h-0 py-0 opacity-0' : 'max-h-[900px] opacity-100'}`}
    >
      <div className={photoVariant === 'hero' ? 'px-0 pt-0 pb-0' : bare ? 'px-3 pb-3 pt-2' : 'px-4 py-4'}>
        {section.status === 'generating' && <BlockSkeleton type={section.type} />}
        {section.status === 'ready' && (
          <div className="fade-in">
            {section.type === 'photos' && (
              <PhotosBlock photos={listing.photos} variant={photoVariant} />
            )}
            {section.type === 'floorPlan' && (
              <FloorPlanBlock
                url={listing.floorPlanUrl}
                view={listing.floorPlanView}
                hiddenRooms={listing.hiddenFloorRooms}
                hideTitle={bare}
                publicView={publicView}
              />
            )}
            {section.type === 'tour3d' && (
              <TourBlock url={listing.tourUrl} compact={bare} publicView={publicView} />
            )}
            {section.type === 'keyFacts' && <FactsBlock facts={listing.keyFacts} />}
            {section.type === 'homeFeatures' && <FeaturesBlock features={listing.homeFeatures} />}
            {section.type === 'agentContacts' && <AgentBlock listing={listing} />}
            {section.type === 'custom' && (
              <CustomBlock heading={section.title} body={section.body} />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function PhotosBlock({
  photos,
  variant,
}: {
  photos: ListingPhoto[]
  variant: 'grid' | 'hero' | 'stack'
}) {
  if (!photos.length) return null

  const frame = (
    photo: ListingPhoto,
    className: string,
  ) => (
    <div key={photo.id} className={`relative overflow-hidden ${className}`}>
      <img
        src={photo.url}
        alt={photo.room || ''}
        className={`h-full w-full object-cover ${photo.cleaned ? 'photo-cleaned' : ''}`}
      />
      {photo.room && (
        <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          {photo.room}
        </span>
      )}
    </div>
  )

  if (variant === 'hero') {
    return (
      <div>
        {frame(photos[0], 'h-[320px] w-full')}
        {photos.length > 1 && (
          <div className="grid grid-cols-4 gap-1">
            {photos.slice(1, 5).map((photo) => frame(photo, 'h-[88px] w-full'))}
          </div>
        )}
      </div>
    )
  }
  if (variant === 'stack') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {photos.slice(0, 4).map((photo) => frame(photo, 'h-[120px] w-full rounded-2xl'))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-4 gap-2">
      {frame(photos[0], 'col-span-2 row-span-2 h-[280px] w-full rounded-2xl')}
      {photos.slice(1, 5).map((photo) => frame(photo, 'h-[136px] w-full rounded-2xl'))}
    </div>
  )
}

function FloorPlanBlock({
  url,
  view,
  hiddenRooms,
  hideTitle,
  publicView = false,
}: {
  url?: string
  view?: FloorPlanView
  hiddenRooms?: FloorPlanRoomId[]
  hideTitle?: boolean
  publicView?: boolean
}) {
  const setFloorPlanView = useListingStore((s) => s.setFloorPlanView)
  const [previewView, setPreviewView] = useState<FloorPlanView>(view ?? '2d')
  const uploaded = isUploadedFloorPlan(url)
  const fromSpace = url?.startsWith('space:') ? url.slice('space:'.length) : null
  const mode = publicView ? previewView : (view ?? '2d')

  return (
    <div>
      <div className={`flex items-center gap-3 ${hideTitle ? 'mb-2' : 'mb-3'}`}>
        {!hideTitle && <h3 className="text-sm font-semibold text-ink">Floor plan</h3>}
        <FloorPlanViewToggle
          mode={mode}
          onChange={publicView ? setPreviewView : setFloorPlanView}
        />
      </div>
      <div className="overflow-hidden rounded-2xl ring-1 ring-black/[0.06]">
        <FloorPlanViewer uploaded={uploaded} url={url} mode={mode} hiddenRooms={hiddenRooms} />
      </div>
      {fromSpace && <p className="mt-2 text-[12px] text-muted">{fromSpace}</p>}
    </div>
  )
}

function TourBlock({
  url,
  compact,
  publicView = false,
}: {
  url?: string
  compact?: boolean
  publicView?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#eef2ff] to-[#f8fafc] ring-1 ring-black/[0.04] ${
        compact ? 'h-[280px]' : 'h-[180px]'
      }`}
    >
      <div className="text-center">
        <Box className="mx-auto h-8 w-8 text-ai" />
        <p className="mt-2 text-sm font-medium text-ink">{url ? '3D tour ready' : 'Add a 3D tour'}</p>
        <p className="mx-auto mt-1 max-w-[260px] truncate text-xs text-muted">
          {url || (publicView ? 'Tour coming soon' : 'Paste a link in the Content panel')}
        </p>
      </div>
    </div>
  )
}

function FactsBlock({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">Key facts</h3>
      <div className="grid grid-cols-3 gap-3">
        {facts.map((fact, index) => (
          <div key={index} className="rounded-2xl bg-canvas px-4 py-3">
            <div className="text-[12px] text-muted">{fact.label}</div>
            <div className="mt-1 text-[16px] font-semibold">{fact.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeaturesBlock({ features }: { features: string[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">Home features</h3>
      <div className="flex flex-wrap gap-2">
        {features.map((feature, index) => (
          <span key={index} className="rounded-full bg-canvas px-3 py-1.5 text-[13px] text-ink">
            {feature}
          </span>
        ))}
      </div>
    </div>
  )
}

function CustomBlock({ heading, body }: { heading: string; body?: string }) {
  if (!heading.trim() && !body?.trim()) return null
  return (
    <div>
      {heading.trim() ? <h3 className="mb-2 text-sm font-semibold text-ink">{heading}</h3> : null}
      {body?.trim() ? (
        <p className="text-[15px] leading-7 text-ink/80 whitespace-pre-wrap">{body}</p>
      ) : null}
    </div>
  )
}

function AgentBlock({ listing }: { listing: Listing }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-4">
      <div className="flex items-center gap-3">
        <img src={listing.agent.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
        <div>
          <div className="text-sm font-semibold">{listing.agent.name}</div>
          <div className="text-xs text-muted">{listing.agent.role}</div>
        </div>
      </div>
      <div className="text-right text-[13px] text-ink">
        <div>{listing.agent.phone}</div>
        <div className="text-muted">{listing.agent.email}</div>
      </div>
    </div>
  )
}

function BlockSkeleton({ type }: { type: Section['type'] }) {
  if (type === 'photos') {
    return (
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-2 row-span-2 h-[280px] rounded-2xl skeleton" />
        <div className="h-[136px] rounded-2xl skeleton" />
        <div className="h-[136px] rounded-2xl skeleton" />
        <div className="h-[136px] rounded-2xl skeleton" />
        <div className="h-[136px] rounded-2xl skeleton" />
      </div>
    )
  }
  if (type === 'keyFacts') {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl skeleton" />
        ))}
      </div>
    )
  }
  return <div className="h-28 rounded-2xl skeleton" />
}

function WritingLine() {
  return (
    <div className="flex items-center gap-2 text-[13px] text-muted">
      <span className="h-2 w-2 animate-pulse rounded-full bg-ai" />
      Copilot is writing…
    </div>
  )
}

function outline(active: boolean) {
  return active ? 'ring-2 ring-ai/40 ring-offset-2 ring-offset-white' : 'ring-0'
}
