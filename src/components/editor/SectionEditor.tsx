import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Eye, EyeOff, ImagePlus, LoaderCircle, Plus, Smartphone, Sparkles, Wand2, X } from 'lucide-react'
import { useListingStore } from '../../store/useListingStore'
import { Popover, PopoverItem } from '../ui/Overlay'
import { FloorPlanViewer, FloorPlanViewToggle } from './FloorPlanGraphic'
import { FLOOR_PLAN_ROOMS, ROOM_LABELS, type RoomLabel, type Section } from '../../types'

export function isUploadedFloorPlan(url?: string) {
  if (!url || url === 'auto') return false
  return !url.startsWith('space:')
}

export function floorPlanSpaceLabel(url?: string) {
  if (url?.startsWith('space:')) return url.slice('space:'.length)
  return null
}

const PLAN_SPACES = [
  {
    name: 'My home',
    floors: ['Ground floor', 'First floor'],
  },
  {
    name: 'Show house',
    floors: ['Ground floor'],
  },
  {
    name: 'Client brief',
    floors: ['Ground floor', 'First floor', 'Second floor'],
  },
]

export function SectionEditor({ section }: { section: Section }) {
  if (section.type === 'photos') return <PhotosEditor />
  if (section.type === 'floorPlan') return <FloorPlanEditor />
  if (section.type === 'tour3d') return <TourEditor />
  if (section.type === 'keyFacts') return <FactsEditor />
  if (section.type === 'homeFeatures') return <FeaturesEditor />
  if (section.type === 'custom') return <CustomBlockEditor section={section} />
  return <AgentEditor />
}

function PhotosEditor() {
  const photos = useListingStore((s) => s.currentListing?.photos ?? [])
  const addPhotos = useListingStore((s) => s.addPhotos)
  const removePhoto = useListingStore((s) => s.removePhoto)
  const movePhoto = useListingStore((s) => s.movePhoto)
  const setPhotoRoom = useListingStore((s) => s.setPhotoRoom)
  const cleanPhoto = useListingStore((s) => s.cleanPhoto)
  const cleanAllPhotos = useListingStore((s) => s.cleanAllPhotos)
  const restorePhoto = useListingStore((s) => s.restorePhoto)
  const labelPhotosWithCopilot = useListingStore((s) => s.labelPhotosWithCopilot)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragFrom, setDragFrom] = useState<number | null>(null)

  return (
    <div>
      {photos.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={cleanAllPhotos}
            className="flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-gray-200"
          >
            <Sparkles className="h-3 w-3 text-ai" />
            Clean clutter
          </button>
          <button
            type="button"
            onClick={labelPhotosWithCopilot}
            className="flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-gray-200"
          >
            <Wand2 className="h-3 w-3 text-ai" />
            Label rooms
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-1.5">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => setDragFrom(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragFrom == null) return
              movePhoto(dragFrom, index)
              setDragFrom(null)
            }}
            className="group relative overflow-hidden rounded-xl bg-canvas"
          >
            <div className="relative aspect-square">
              <img
                src={photo.url}
                alt={photo.room || ''}
                className={`h-full w-full object-cover ${photo.cleaned ? 'photo-cleaned' : ''} ${
                  photo.cleaning ? 'opacity-60' : ''
                }`}
              />
              {photo.cleaning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <LoaderCircle className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
              {photo.cleaned && !photo.cleaning && (
                <span className="absolute top-1 left-1 rounded-full bg-ai px-1.5 py-0.5 text-[9px] font-medium text-white">
                  Cleaned
                </span>
              )}
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
              <button
                type="button"
                aria-label={photo.cleaned ? 'Restore original' : 'Clean clutter'}
                onClick={() => (photo.cleaned ? restorePhoto(photo.id) : cleanPhoto(photo.id))}
                className="absolute right-1 bottom-7 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-ai opacity-0 transition group-hover:opacity-100"
              >
                <Sparkles className="h-3 w-3" />
              </button>
            </div>
            <select
              value={photo.room}
              onChange={(event) => setPhotoRoom(photo.id, event.target.value as RoomLabel | '')}
              onPointerDown={(event) => event.stopPropagation()}
              className="w-full border-0 bg-white px-2 py-1.5 text-[11px] text-ink outline-none"
            >
              <option value="">Room…</option>
              {ROOM_LABELS.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line text-[11px] font-medium text-muted hover:bg-canvas"
        >
          <ImagePlus className="h-4 w-4" />
          Add
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files
          if (!files?.length) return
          addPhotos(Array.from(files).map((file) => URL.createObjectURL(file)))
          event.target.value = ''
        }}
      />
      <p className="mt-2 text-[11px] text-subtle">
        Drag to reorder · {photos.length}/20 · Copilot can tidy the frame and name the rooms
      </p>
    </div>
  )
}

function FloorPlanEditor() {
  const url = useListingStore((s) => s.currentListing?.floorPlanUrl ?? '')
  const view = useListingStore((s) => s.currentListing?.floorPlanView ?? '2d')
  const hiddenRooms = useListingStore((s) => s.currentListing?.hiddenFloorRooms ?? [])
  const updateFloorPlan = useListingStore((s) => s.updateFloorPlan)
  const setFloorPlanView = useListingStore((s) => s.setFloorPlanView)
  const toggleFloorRoom = useListingStore((s) => s.toggleFloorRoom)
  const setSpace = useListingStore((s) => s.setSpace)
  const fileRef = useRef<HTMLInputElement>(null)
  const [spaceOpen, setSpaceOpen] = useState(false)
  const uploaded = isUploadedFloorPlan(url)
  const fromSpace = floorPlanSpaceLabel(url)
  const generated = url === 'auto' || Boolean(fromSpace)

  const pickFromSpace = (space: string, floor: string) => {
    setSpace(space)
    updateFloorPlan(`space:${space} · ${floor}`)
    setSpaceOpen(false)
  }

  return (
    <div className="space-y-2">
      {(uploaded || generated) && (
        <div className="flex items-center justify-end">
          <FloorPlanViewToggle mode={view} onChange={setFloorPlanView} />
        </div>
      )}
      <div className="overflow-hidden rounded-xl ring-1 ring-black/[0.06]">
        {uploaded || generated ? (
          <FloorPlanViewer
            uploaded={uploaded}
            url={url}
            mode={view}
            hiddenRooms={hiddenRooms}
            heightClass="h-[140px]"
          />
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-[120px] w-full flex-col items-center justify-center gap-1 text-[12px] text-muted hover:bg-canvas"
          >
            <ImagePlus className="h-4 w-4" />
            Upload a plan or pick a space
          </button>
        )}
      </div>
      {fromSpace && <p className="text-[11px] text-subtle">From space · {fromSpace}</p>}
      {generated && (
        <div className="overflow-hidden rounded-xl ring-1 ring-black/[0.06]">
          {FLOOR_PLAN_ROOMS.map((room) => {
            const visible = !hiddenRooms.includes(room.id)
            return (
              <div
                key={room.id}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 hover:bg-canvas"
              >
                <span className={`truncate text-[12px] ${visible ? 'text-ink' : 'text-subtle'}`}>
                  {room.label}
                </span>
                <button
                  type="button"
                  aria-label={visible ? `Hide ${room.label}` : `Show ${room.label}`}
                  onClick={() => toggleFloorRoom(room.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-white hover:text-ink"
                >
                  {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            )
          })}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-[12px] font-medium text-ai"
        >
          Upload plan
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSpaceOpen((open) => !open)}
            className="flex items-center gap-0.5 text-[12px] font-medium text-ai"
          >
            From space
            <ChevronDown className={`h-3.5 w-3.5 transition ${spaceOpen ? 'rotate-180' : ''}`} />
          </button>
          <Popover open={spaceOpen} onClose={() => setSpaceOpen(false)} className="left-0 w-56">
            {PLAN_SPACES.map((space) => (
              <div key={space.name} className="py-0.5">
                <p className="px-3 pt-1.5 pb-0.5 text-[11px] font-medium text-subtle">{space.name}</p>
                {space.floors.map((floor) => {
                  const label = `${space.name} · ${floor}`
                  return (
                    <PopoverItem
                      key={label}
                      active={fromSpace === label}
                      onClick={() => pickFromSpace(space.name, floor)}
                    >
                      {floor}
                    </PopoverItem>
                  )
                })}
              </div>
            ))}
          </Popover>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          updateFloorPlan(URL.createObjectURL(file))
          event.target.value = ''
        }}
      />
    </div>
  )
}

function TourEditor() {
  const listingId = useListingStore((s) => s.currentListing?.id ?? 'tour')
  const tourUrl = useListingStore((s) => s.currentListing?.tourUrl ?? '')
  const updateTourUrl = useListingStore((s) => s.updateTourUrl)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [panel, setPanel] = useState<'idle' | 'phone' | 'camera' | 'waiting'>('idle')

  const captureCode = listingId.replace(/-/g, '').slice(0, 8).toUpperCase()
  const captureUrl = `https://planner5d.com/capture/${captureCode}`
  const onPhone =
    typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  useEffect(() => () => stopCamera(), [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setPanel('camera')
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      })
    } catch {
      setPanel('phone')
    }
  }

  const finishCapture = () => {
    stopCamera()
    updateTourUrl(`https://planner5d.com/tour/${captureCode.toLowerCase()}`)
    setPanel('idle')
  }

  const waitForPhone = () => {
    setPanel('waiting')
    window.setTimeout(finishCapture, 2600)
  }

  return (
    <div className="space-y-2">
      <Field
        label="Tour link"
        value={tourUrl}
        placeholder="https://planner5d.com/tour/…"
        onChange={updateTourUrl}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-[12px] font-medium text-ai"
        >
          Upload tour
        </button>
        <button
          type="button"
          onClick={() => (onPhone ? startCamera() : setPanel('phone'))}
          className="flex items-center gap-1 text-[12px] font-medium text-ai"
        >
          <Smartphone className="h-3.5 w-3.5" />
          Capture on phone
        </button>
      </div>

      {panel === 'phone' && (
        <div className="rounded-2xl bg-canvas px-3 py-3">
          <div className="flex items-start gap-3">
            <CaptureQr value={captureUrl} />
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-ink">Scan with your phone</p>
              <p className="mt-1 text-[11px] leading-4 text-muted">
                Walk the rooms. The tour lands here when you finish.
              </p>
              <p className="mt-1 truncate text-[11px] text-subtle">{captureUrl}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={waitForPhone}
              className="text-[12px] font-medium text-ai"
            >
              I&apos;m capturing now
            </button>
            {onPhone && (
              <button
                type="button"
                onClick={startCamera}
                className="text-[12px] font-medium text-muted"
              >
                Use this camera
              </button>
            )}
            <button
              type="button"
              onClick={() => setPanel('idle')}
              className="text-[12px] text-subtle"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {panel === 'waiting' && (
        <div className="flex items-center gap-2 rounded-2xl bg-canvas px-3 py-3 text-[12px] text-muted">
          <LoaderCircle className="h-4 w-4 animate-spin text-ai" />
          Waiting for the phone capture…
        </div>
      )}

      {panel === 'camera' && (
        <div className="overflow-hidden rounded-2xl bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="h-[140px] w-full object-cover" />
          <div className="flex items-center justify-between gap-2 bg-ink px-3 py-2">
            <p className="text-[11px] text-white/80">Walk slowly. Keep the phone level.</p>
            <button
              type="button"
              onClick={finishCapture}
              className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink"
            >
              Save tour
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/*,.zip,.glb,.gltf,application/zip"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          updateTourUrl(URL.createObjectURL(file) || file.name)
          event.target.value = ''
        }}
      />
    </div>
  )
}

function CaptureQr({ value }: { value: string }) {
  const cells = 17
  const bits: boolean[] = []
  let seed = 0
  for (let i = 0; i < value.length; i += 1) seed = (seed * 33 + value.charCodeAt(i)) >>> 0
  for (let i = 0; i < cells * cells; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    bits.push((seed & 5) === 0)
  }
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 5; x += 1) {
        const border = x === 0 || y === 0 || x === 4 || y === 4
        const center = x === 2 && y === 2
        bits[(oy + y) * cells + ox + x] = border || center
      }
    }
  }
  finder(1, 1)
  finder(cells - 6, 1)
  finder(1, cells - 6)

  return (
    <div
      className="grid shrink-0 rounded-lg bg-white p-1 ring-1 ring-black/[0.06]"
      style={{ gridTemplateColumns: `repeat(${cells}, 5px)`, gap: 0 }}
      aria-hidden
    >
      {bits.map((on, index) => (
        <span key={index} className={on ? 'bg-ink' : 'bg-white'} style={{ width: 5, height: 5 }} />
      ))}
    </div>
  )
}

function FactsEditor() {
  const facts = useListingStore((s) => s.currentListing?.keyFacts ?? [])
  const updateKeyFact = useListingStore((s) => s.updateKeyFact)
  const addKeyFact = useListingStore((s) => s.addKeyFact)
  const removeKeyFact = useListingStore((s) => s.removeKeyFact)

  return (
    <div className="space-y-2">
        {facts.map((fact, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <input
            value={fact.label}
            onChange={(event) => updateKeyFact(index, { label: event.target.value })}
            placeholder="Label"
            className="h-9 w-[42%] rounded-xl border border-[#eceef1] px-2.5 text-[13px] outline-none focus:border-ai/40"
          />
          <input
            value={fact.value}
            onChange={(event) => updateKeyFact(index, { value: event.target.value })}
            placeholder="Value"
            className="h-9 min-w-0 flex-1 rounded-xl border border-[#eceef1] px-2.5 text-[13px] outline-none focus:border-ai/40"
          />
          <button
            type="button"
            aria-label="Remove fact"
            onClick={() => removeKeyFact(index)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-subtle hover:bg-canvas hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addKeyFact}
        className="flex items-center gap-1 text-[12px] font-medium text-ai"
      >
        <Plus className="h-3.5 w-3.5" />
        Add fact
      </button>
    </div>
  )
}

function FeaturesEditor() {
  const features = useListingStore((s) => s.currentListing?.homeFeatures ?? [])
  const updateHomeFeature = useListingStore((s) => s.updateHomeFeature)
  const addHomeFeature = useListingStore((s) => s.addHomeFeature)
  const removeHomeFeature = useListingStore((s) => s.removeHomeFeature)
  const [draft, setDraft] = useState('')

  return (
    <div className="space-y-2">
        {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <input
            value={feature}
            onChange={(event) => updateHomeFeature(index, event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-xl border border-[#eceef1] px-2.5 text-[13px] outline-none focus:border-ai/40"
          />
          <button
            type="button"
            aria-label="Remove feature"
            onClick={() => removeHomeFeature(index)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-subtle hover:bg-canvas hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!draft.trim()) return
          addHomeFeature(draft.trim())
          setDraft('')
        }}
        className="flex items-center gap-1.5"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a feature"
          className="h-9 min-w-0 flex-1 rounded-xl border border-dashed border-line px-2.5 text-[13px] outline-none focus:border-ai/40"
        />
        <button
          type="submit"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ai hover:bg-canvas"
          aria-label="Add feature"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

function CustomBlockEditor({ section }: { section: Section }) {
  const updateCustomBlock = useListingStore((s) => s.updateCustomBlock)
  const removeCustomBlock = useListingStore((s) => s.removeCustomBlock)

  return (
    <div className="space-y-3">
      <Field
        label="Heading"
        value={section.title}
        placeholder="Neighbourhood"
        onChange={(title) => updateCustomBlock(section.id, { title })}
      />
      <Field
        label="Text"
        value={section.body ?? ''}
        placeholder="Write anything you want on the listing page"
        multiline
        onChange={(body) => updateCustomBlock(section.id, { body })}
      />
      <button
        type="button"
        onClick={() => removeCustomBlock(section.id)}
        className="text-[12px] font-medium text-red-600"
      >
        Remove block
      </button>
    </div>
  )
}

function AgentEditor() {
  const agent = useListingStore((s) => s.currentListing?.agent)
  const updateAgent = useListingStore((s) => s.updateAgent)
  const fileRef = useRef<HTMLInputElement>(null)
  if (!agent) return null

  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative h-12 w-12 overflow-hidden rounded-full bg-canvas"
        >
          {agent.photo ? (
            <img src={agent.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[11px] text-muted">Add</span>
          )}
        </button>
        <p className="text-[12px] text-muted">Click photo to replace</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            updateAgent({ photo: URL.createObjectURL(file) })
            event.target.value = ''
          }}
        />
      </div>
      <Field label="Name" value={agent.name} placeholder="Agent name" onChange={(name) => updateAgent({ name })} />
      <Field label="Role" value={agent.role} placeholder="Senior negotiator" onChange={(role) => updateAgent({ role })} />
      <Field label="Phone" value={agent.phone} placeholder="+353 …" onChange={(phone) => updateAgent({ phone })} />
      <Field label="Email" value={agent.email} placeholder="name@agency.com" onChange={(email) => updateAgent({ email })} />
    </div>
  )
}

export function Field({
  label,
  value,
  placeholder,
  onChange,
  multiline,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  const cls =
    'w-full rounded-[16px] border border-[#eceef1] bg-white px-3 pt-4 pb-2.5 text-[14px] text-ink outline-none placeholder:text-subtle focus:border-ai/40'
  return (
    <label className="relative block">
      <span className="absolute -top-2 left-3 z-10 bg-white px-1 text-[11px] text-subtle">{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cls}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cls}
        />
      )}
    </label>
  )
}
