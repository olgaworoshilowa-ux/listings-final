import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Archive,
  ArrowLeft,
  ChevronDown,
  Columns2,
  Copy,
  ExternalLink,
  FileText,
  History,
  Layers,
  LayoutList,
  MessageSquare,
  PanelsTopLeft,
  Trash2,
  Upload,
} from 'lucide-react'
import { savePreviewSnapshot } from '../../lib/previewSnapshot'
import { withBase } from '../../lib/baseUrl'
import { useListingStore } from '../../store/useListingStore'
import { DEFAULT_PUBLISH_SETTINGS, type ListingLayout } from '../../types'
import { Popover, PopoverItem, Tooltip } from '../ui/Overlay'
import { Toggle } from '../ui/Toggle'
import { CreditsPill } from '../shell/AppHeader'

export function EditorTopBar() {
  const navigate = useNavigate()
  const listing = useListingStore((s) => s.currentListing)
  const lastSavedAt = useListingStore((s) => s.lastSavedAt)
  const closeListing = useListingStore((s) => s.closeListing)
  const duplicateListing = useListingStore((s) => s.duplicateListing)
  const setListingStatus = useListingStore((s) => s.setListingStatus)
  const deleteListing = useListingStore((s) => s.deleteListing)
  const openListing = useListingStore((s) => s.openListing)
  const [now, setNow] = useState(Date.now())
  const [historyOpen, setHistoryOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const editorOption = useListingStore((s) => s.editorOption)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  if (!listing) return null

  const seconds = lastSavedAt ? Math.max(0, Math.round((now - lastSavedAt) / 1000)) : 0
  const savedLabel =
    seconds < 3 ? 'Saved just now' : seconds < 60 ? `Saved ${seconds}s ago` : `Saved ${Math.floor(seconds / 60)}m ago`

  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-white px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Back"
          onClick={() => {
            closeListing()
            navigate('/')
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink hover:bg-canvas"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="relative min-w-0">
          <Tooltip label={listing.address}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex min-w-0 max-w-[220px] items-center gap-0.5 rounded-lg px-1.5 py-1 text-left hover:bg-canvas"
            >
              <h1 className="min-w-0 truncate text-[15px] font-semibold tracking-[-0.02em] text-ink">
                {listing.title || listing.address}
              </h1>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
            </button>
          </Tooltip>
          <Popover
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            className="left-0 w-[220px]"
          >
            <p className="truncate px-3 py-2 text-[11px] text-subtle">{listing.address}</p>
            <PopoverItem
              onClick={() => {
                savePreviewSnapshot(listing)
                window.open(withBase(`/listing/${listing.id}/preview`), '_blank', 'noopener,noreferrer')
                setMenuOpen(false)
              }}
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Preview
            </PopoverItem>
            <PopoverItem
              onClick={() => {
                const copyId = duplicateListing(listing.id)
                setMenuOpen(false)
                if (copyId) {
                  openListing(copyId)
                  navigate(`/listing/${copyId}`)
                }
              }}
            >
              <Copy className="mr-2 h-3.5 w-3.5" />
              Duplicate
            </PopoverItem>
            {listing.status !== 'draft' && (
              <PopoverItem
                onClick={() => {
                  setListingStatus(listing.id, 'draft')
                  setMenuOpen(false)
                }}
              >
                <FileText className="mr-2 h-3.5 w-3.5" />
                Move to drafts
              </PopoverItem>
            )}
            {listing.status !== 'published' && (
              <PopoverItem
                onClick={() => {
                  setListingStatus(listing.id, 'published')
                  setMenuOpen(false)
                }}
              >
                <Upload className="mr-2 h-3.5 w-3.5" />
                Move to published
              </PopoverItem>
            )}
            {listing.status !== 'closed' && (
              <PopoverItem
                onClick={() => {
                  setListingStatus(listing.id, 'closed')
                  setMenuOpen(false)
                }}
              >
                <Archive className="mr-2 h-3.5 w-3.5" />
                Move to closed
              </PopoverItem>
            )}
            <PopoverItem
              danger
              onClick={() => {
                deleteListing(listing.id)
                setMenuOpen(false)
                closeListing()
                navigate('/')
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </PopoverItem>
          </Popover>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Version history"
            onClick={() => setHistoryOpen((v) => !v)}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-canvas"
          >
            <History className="h-4 w-4" />
          </button>
          <Popover open={historyOpen} onClose={() => setHistoryOpen(false)} className="left-0 w-56">
            <div className="px-3 py-2 text-xs text-subtle">Version history</div>
            <div className="rounded-xl px-3 py-2 text-sm font-medium">Current · {savedLabel.toLowerCase()}</div>
            <div className="rounded-xl px-3 py-2 text-sm text-muted">Draft started</div>
          </Popover>
        </div>
      </div>

      {editorOption === 'option2' ? (
        <Option2PanelSwitch />
      ) : (
        <LayoutSwitch layout={listing.layout ?? 'classic'} />
      )}

      <div className="flex items-center justify-end gap-3">
        <CreditsPill />
        <span className="text-[13px] text-muted">{savedLabel}</span>
        <PublishMenu />
      </div>
    </header>
  )
}

const LAYOUTS: { id: ListingLayout; label: string; hint: string; icon: typeof LayoutList }[] = [
  { id: 'classic', label: 'Classic', hint: 'One column, your order', icon: LayoutList },
  { id: 'gallery', label: 'Gallery', hint: 'Photos first, then the story', icon: PanelsTopLeft },
  { id: 'split', label: 'Split', hint: 'Media left, facts right', icon: Columns2 },
]

export function LayoutSwitch({
  layout,
  className = 'bg-canvas',
}: {
  layout: ListingLayout
  className?: string
}) {
  const setListingLayout = useListingStore((s) => s.setListingLayout)

  return (
    <div className={`flex rounded-full p-0.5 ${className}`}>
      {LAYOUTS.map((item) => {
        const Icon = item.icon
        const active = layout === item.id
        return (
          <button
            key={item.id}
            type="button"
            title={item.hint}
            onClick={() => setListingLayout(item.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
              active ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function Option2PanelSwitch() {
  const panel = useListingStore((s) => s.option2Panel)
  const setOption2Panel = useListingStore((s) => s.setOption2Panel)

  return (
    <div className="flex rounded-full bg-canvas p-0.5">
      {(
        [
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'content', label: 'Content', icon: Layers },
        ] as const
      ).map((item) => {
        const Icon = item.icon
        const active = panel === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setOption2Panel(item.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
              active ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function PublishMenu() {
  const listing = useListingStore((s) => s.currentListing)
  const publish = useListingStore((s) => s.publish)
  const updatePublishSettings = useListingStore((s) => s.updatePublishSettings)
  const [open, setOpen] = useState(false)
  if (!listing) return null

  const settings = { ...DEFAULT_PUBLISH_SETTINGS, ...listing.publishSettings }
  const published = listing.status === 'published'

  const publishNow = () => {
    publish()
    const stillDraft = useListingStore.getState().currentListing?.status !== 'published'
    if (!stillDraft) setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 items-center gap-1 rounded-full bg-publish px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-publish-hover"
      >
        {published ? 'Published' : 'Publish'}
        <ChevronDown className={`h-3.5 w-3.5 ${open ? 'rotate-180' : ''}`} />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} className="right-0 left-auto w-[300px] p-2">
        <div className="px-2 pt-1.5 pb-2">
          <p className="text-[13px] font-semibold text-ink">Publish settings</p>
          <p className="mt-0.5 text-[11px] text-subtle">Who can see this listing, and where it goes.</p>
        </div>
        <div className="px-2 pb-2">
          <p className="mb-1.5 text-[11px] font-medium text-subtle">Visibility</p>
          <div className="flex rounded-full bg-canvas p-0.5">
            {(
              [
                { id: 'public', label: 'Public' },
                { id: 'unlisted', label: 'Unlisted' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updatePublishSettings({ visibility: item.id })}
                className={`flex-1 rounded-full px-2 py-1.5 text-[12px] font-medium ${
                  settings.visibility === item.id ? 'bg-white text-ink shadow-sm' : 'text-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <SettingRow
          label="Show price"
          hint="On the public page"
          checked={settings.showPrice}
          onChange={() => updatePublishSettings({ showPrice: !settings.showPrice })}
        />
        <SettingRow
          label="Exact address"
          hint="Off = area only"
          checked={settings.showExactAddress}
          onChange={() => updatePublishSettings({ showExactAddress: !settings.showExactAddress })}
        />
        <SettingRow
          label="Agency website"
          hint="Your listing page"
          checked={settings.listOnWebsite}
          onChange={() => updatePublishSettings({ listOnWebsite: !settings.listOnWebsite })}
        />
        <SettingRow
          label="Property portals"
          hint="Daft, MyHome"
          checked={settings.listOnPortals}
          onChange={() => updatePublishSettings({ listOnPortals: !settings.listOnPortals })}
        />
        <div className="mt-2 flex items-center gap-2 px-2 pb-1">
          <button
            type="button"
            onClick={() => {
              savePreviewSnapshot(listing)
              window.open(withBase(`/listing/${listing.id}/preview`), '_blank', 'noopener,noreferrer')
            }}
            className="h-9 flex-1 rounded-full bg-canvas text-[12px] font-medium text-ink hover:bg-line"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={publishNow}
            className="h-9 flex-1 rounded-full bg-publish text-[12px] font-semibold text-white hover:bg-publish-hover"
          >
            {published ? 'Update' : 'Publish'}
          </button>
        </div>
      </Popover>
    </div>
  )
}

function SettingRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-1.5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink">{label}</p>
        <p className="text-[11px] text-subtle">{hint}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  )
}
