import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronsRight, GripVertical, ImagePlus, Layers, LoaderCircle, Lock, Plus, Sparkles } from 'lucide-react'
import { AGENCY_BRANDING_CREDIT_COST, useListingStore } from '../../store/useListingStore'
import { Toggle } from '../ui/Toggle'
import { Tooltip } from '../ui/Overlay'
import { Field, SectionEditor } from './SectionEditor'
import type { ListingBrandingKind, Section } from '../../types'

export function ContentPanel({ docked = false }: { docked?: boolean }) {
  const listing = useListingStore((s) => s.currentListing)
  const expanded = useListingStore((s) => s.contentExpanded)
  const toggleContent = useListingStore((s) => s.toggleContent)
  const reorderSections = useListingStore((s) => s.reorderSections)
  const addCustomBlock = useListingStore((s) => s.addCustomBlock)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  if (!listing) return null
  const items = [...listing.sections].sort((a, b) => a.order - b.order)

  const onDragEnd = (event: DragEndEvent) => {
    if (!event.over) return
    reorderSections(String(event.active.id), String(event.over.id))
  }

  if (!docked && !expanded) {
    return (
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={() => toggleContent(true)}
          className="flex h-10 items-center gap-2 rounded-full bg-white px-3.5 text-[13px] font-medium text-ink shadow-sm ring-1 ring-black/[0.08] hover:bg-canvas"
        >
          <Layers className="h-4 w-4" />
          Content
        </button>
      </div>
    )
  }

  return (
    <aside className="flex w-[340px] shrink-0 flex-col overflow-y-auto bg-white px-5 py-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-ink">Content</h2>
        {!docked && (
          <button
            type="button"
            aria-label="Collapse content"
            onClick={() => toggleContent(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <PropertyDetailsCard />
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {items.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </SortableContext>
        </DndContext>
        <button
          type="button"
          onClick={addCustomBlock}
          className="flex items-center justify-center gap-1.5 rounded-[22px] py-3 text-[13px] font-medium text-ai ring-1 ring-dashed ring-black/[0.12] hover:bg-canvas"
        >
          <Plus className="h-4 w-4" />
          Add custom block
        </button>
        <BrandingCard />
      </div>
    </aside>
  )
}

function PropertyDetailsCard() {
  const listing = useListingStore((s) => s.currentListing)
  const expanded = useListingStore((s) => s.expandedSectionId) === 'property-details'
  const selected = useListingStore((s) => s.selectedSectionId) === 'property-details'
  const expandSection = useListingStore((s) => s.expandSection)
  const updateTitle = useListingStore((s) => s.updateTitle)
  const updateDescription = useListingStore((s) => s.updateDescription)
  const updateAddress = useListingStore((s) => s.updateAddress)
  const updatePrice = useListingStore((s) => s.updatePrice)
  const rewritePropertyDetails = useListingStore((s) => s.rewritePropertyDetails)
  const lockPropertyDetails = useListingStore((s) => s.lockPropertyDetails)
  const detailsStatus = useListingStore((s) => s.detailsStatus)
  const detailsLocked = useListingStore((s) => s.detailsLocked)

  if (!listing) return null

  return (
    <div
      onMouseEnter={() => useListingStore.getState().setHoveredSection('property-details')}
      onMouseLeave={() => useListingStore.getState().setHoveredSection(null)}
      className={`rounded-[22px] bg-white shadow-[0_6px_18px_rgba(17,17,17,0.04)] ring-1 ${
        selected ? 'ring-ai/30' : 'ring-black/[0.05]'
      }`}
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => expandSection(expanded ? null : 'property-details')}
          className="flex min-w-0 flex-1 items-center gap-1 py-3.5 pr-4 pl-4 text-left"
        >
          <span className="truncate text-[15px] font-medium text-ink">Property details</span>
          {detailsStatus === 'generating' && (
            <LoaderCircle className="ml-2 h-3.5 w-3.5 animate-spin text-ai" />
          )}
          {detailsLocked && <Lock className="ml-2 h-3.5 w-3.5 text-subtle" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-line px-4 pt-3 pb-3">
          <div className="space-y-3">
            {detailsStatus === 'generating' ? (
              <div className="space-y-3">
                <div className="h-12 rounded-[16px] skeleton" />
                <div className="h-24 rounded-[16px] skeleton" />
              </div>
            ) : (
              <>
                <Field
                  label="Listing title"
                  value={listing.title}
                  placeholder="Full name on the card"
                  onChange={updateTitle}
                />
                <Field
                  label="Description"
                  value={listing.description}
                  placeholder="What it feels like to walk in — light, layout, the quiet bits"
                  onChange={updateDescription}
                  multiline
                />
                <Field
                  label="Address"
                  value={listing.address}
                  placeholder="Street, city"
                  onChange={updateAddress}
                />
                <Field
                  label="Price"
                  value={listing.price}
                  placeholder="$0"
                  onChange={updatePrice}
                />
              </>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-[12px] text-muted">
            <span>Copilot</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={detailsLocked || detailsStatus === 'generating'}
                onClick={rewritePropertyDetails}
                className="flex items-center gap-1 font-medium text-ink disabled:opacity-40"
              >
                <Sparkles className="h-3 w-3 text-ai" />
                Improve with Copilot
              </button>
              <button
                type="button"
                aria-label={detailsLocked ? 'Unlock' : 'Lock'}
                onClick={() => lockPropertyDetails(!detailsLocked)}
                className={detailsLocked ? 'text-ai' : 'text-subtle'}
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BrandingCard() {
  const listing = useListingStore((s) => s.currentListing)
  const expanded = useListingStore((s) => s.expandedSectionId) === 'branding'
  const selected = useListingStore((s) => s.selectedSectionId) === 'branding'
  const expandSection = useListingStore((s) => s.expandSection)
  const unlockAgencyBranding = useListingStore((s) => s.unlockAgencyBranding)
  const setAgencyBranding = useListingStore((s) => s.setAgencyBranding)
  const setBrandingKind = useListingStore((s) => s.setBrandingKind)

  if (!listing) return null

  const unlocked = Boolean(listing.agencyBrandingUnlocked)
  const kind: ListingBrandingKind = unlocked && listing.brandingKind === 'planner'
    ? 'agency'
    : listing.brandingKind
      ? listing.brandingKind
      : listing.brandingRemoved
        ? 'none'
        : 'planner'

  const pickLogo = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        setAgencyBranding({
          name: listing.agencyName || 'My agency',
          logoUrl: String(reader.result ?? ''),
        })
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <div
      onMouseEnter={() => useListingStore.getState().setHoveredSection('branding')}
      onMouseLeave={() => useListingStore.getState().setHoveredSection(null)}
      className={`rounded-[22px] bg-white shadow-[0_6px_18px_rgba(17,17,17,0.04)] ring-1 ${
        selected ? 'ring-ai/30' : 'ring-black/[0.05]'
      }`}
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => expandSection(expanded ? null : 'branding')}
          className="flex min-w-0 flex-1 items-center gap-1 py-3.5 pr-2 pl-4 text-left"
        >
          <span className="truncate text-[15px] font-medium text-ink">Branding</span>
          {!unlocked && <Lock className="ml-2 h-3.5 w-3.5 text-subtle" />}
        </button>
        {!unlocked && (
          <div className="pr-3">
            <button
              type="button"
              onClick={() => unlockAgencyBranding()}
              className="flex items-center gap-1 rounded-full bg-ink px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-black"
            >
              Unlock
              <span className="flex items-center gap-0.5 text-white/80">
                <Sparkles className="h-3 w-3 fill-white" />
                {AGENCY_BRANDING_CREDIT_COST}
              </span>
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-line px-4 pt-3 pb-3">
          {!unlocked ? (
            <div className="rounded-2xl bg-canvas px-3 py-3">
              <p className="text-[13px] text-muted">
                Locked until you pay. Unlock to use your agency logo, or hide Planner 5d.
              </p>
              <button
                type="button"
                onClick={() => unlockAgencyBranding()}
                className="mt-2 flex items-center gap-1 text-[13px] font-medium text-ai"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Unlock for {AGENCY_BRANDING_CREDIT_COST} credits
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex rounded-full bg-canvas p-0.5">
                {(
                  [
                    { id: 'agency', label: 'My agency' },
                    { id: 'none', label: 'None' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBrandingKind(item.id)}
                    className={`flex-1 rounded-full px-2 py-1.5 text-[11px] font-medium ${
                      kind === item.id ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {kind === 'agency' && (
                <>
                  <button
                    type="button"
                    onClick={pickLogo}
                    className="flex w-full items-center gap-3 rounded-2xl bg-canvas px-3 py-2.5 text-left"
                  >
                    {listing.agencyLogoUrl ? (
                      <img
                        src={listing.agencyLogoUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-muted">
                        <ImagePlus className="h-4 w-4" />
                      </span>
                    )}
                    <span className="text-[13px] font-medium text-ink">
                      {listing.agencyLogoUrl ? 'Change logo' : 'Add logo'}
                    </span>
                  </button>
                  <Field
                    label="Agency name"
                    value={listing.agencyName ?? ''}
                    placeholder="Your agency"
                    onChange={(name) => setAgencyBranding({ name })}
                  />
                </>
              )}
              {kind === 'none' && (
                <p className="text-[12px] text-muted">No badge on the public listing page.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionCard({ section }: { section: Section }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })
  const expanded = useListingStore((s) => s.expandedSectionId) === section.id
  const selected = useListingStore((s) => s.selectedSectionId) === section.id
  const expandSection = useListingStore((s) => s.expandSection)
  const toggleSection = useListingStore((s) => s.toggleSection)
  const lockSection = useListingStore((s) => s.lockSection)
  const rewriteSection = useListingStore((s) => s.rewriteSection)
  const generateSectionContent = useListingStore((s) => s.generateSectionContent)
  const continueGeneration = useListingStore((s) => s.continueGeneration)
  const generation = useListingStore((s) => s.generation)
  const [hovered, setHovered] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const showToggle = !section.required
  const toggleDisabled = !section.hasContent
  const toggleTip = !section.hasContent
    ? 'Nothing to show yet'
    : section.enabled
      ? 'Hide on page'
      : 'Show on page'

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => {
        setHovered(true)
        useListingStore.getState().setHoveredSection(section.id)
      }}
      onMouseLeave={() => {
        setHovered(false)
        useListingStore.getState().setHoveredSection(null)
      }}
      className={`relative rounded-[22px] bg-white shadow-[0_6px_18px_rgba(17,17,17,0.04)] ring-1 ${
        selected ? 'ring-ai/30' : 'ring-black/[0.05]'
      } ${isDragging ? 'z-20 opacity-80' : ''}`}
    >
      <div className="flex items-center">
        <span
          className={`ml-2 mr-0.5 cursor-grab text-subtle touch-none transition ${hovered ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <button
          type="button"
          className={`flex min-w-0 flex-1 items-center gap-1 py-3.5 pl-1 text-left ${
            showToggle ? 'pr-2' : 'pr-4'
          }`}
          onClick={() => {
            useListingStore.getState().setSelectedSection(section.id)
            expandSection(expanded ? null : section.id)
          }}
        >
          <span className="truncate text-[15px] font-medium text-ink">{section.title}</span>
          {section.status === 'generating' && (
            <LoaderCircle className="ml-2 h-3.5 w-3.5 animate-spin text-ai" />
          )}
          {section.locked && <Lock className="ml-2 h-3.5 w-3.5 text-subtle" />}
        </button>
        {showToggle && (
          <div className="flex h-full w-[60px] items-center justify-center pr-3">
            <Tooltip label={toggleTip}>
              <Toggle
                checked={section.enabled}
                disabled={toggleDisabled}
                label={`Toggle ${section.title}`}
                onChange={() => toggleSection(section.id)}
              />
            </Tooltip>
          </div>
        )}
      </div>

      {expanded && (
        <div
          className="border-t border-line px-4 pt-3 pb-3"
          onPointerDown={(event) => event.stopPropagation()}
        >
          {section.status === 'pending' && (
            <div className="mb-3 rounded-2xl bg-canvas px-3 py-3 text-center">
              <p className="text-[13px] text-muted">Empty — fill it in, or let Copilot do it.</p>
              <button
                type="button"
                onClick={() =>
                  generation.canContinue ? continueGeneration() : generateSectionContent(section.id)
                }
                className="mt-1 text-[13px] font-medium text-ai"
              >
                {section.type === 'floorPlan'
                  ? 'Generate plan'
                  : section.type === 'tour3d'
                    ? 'Upload or capture'
                    : generation.canContinue
                      ? 'Continue'
                      : 'Generate'}
              </button>
            </div>
          )}
          {section.status === 'generating' ? (
            <div className="h-16 rounded-2xl skeleton" />
          ) : (
            <SectionEditor section={section} />
          )}
          {section.status !== 'generating' && (
            <div className="mt-3 flex items-center justify-between text-[12px] text-muted">
              <span>{section.source ?? 'Edited manually'}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={section.locked}
                  onClick={() => rewriteSection(section.id)}
                  className="font-medium text-ink disabled:opacity-40"
                >
                  Rewrite with Copilot
                </button>
                <button
                  type="button"
                  aria-label={section.locked ? 'Unlock' : 'Lock'}
                  onClick={() => lockSection(section.id, !section.locked)}
                  className={section.locked ? 'text-ai' : 'text-subtle'}
                >
                  <Lock className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
