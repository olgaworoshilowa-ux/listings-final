import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Archive,
  Copy,
  FileText,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Tag,
  Trash2,
  Upload,
  Wand2,
} from 'lucide-react'
import { Popover, PopoverItem } from '../ui/Overlay'
import { useListingStore } from '../../store/useListingStore'
import type { ListingStatus, ListingSummary } from '../../types'

const GROUPS: { key: ListingStatus; label: string }[] = [
  { key: 'draft', label: 'Drafts' },
  { key: 'published', label: 'Published listings' },
  { key: 'closed', label: 'Closed listings' },
]

export function Sidebar() {
  const collapsed = useListingStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useListingStore((s) => s.toggleSidebar)
  const listings = useListingStore((s) => s.listings)
  const closeListing = useListingStore((s) => s.closeListing)
  const navigate = useNavigate()

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col bg-white px-4 py-5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="leading-tight">
            <div className="flex items-center gap-1.5 text-[17px] font-semibold tracking-[-0.03em]">
              Planner
              <LogoMark />
            </div>
            <div className="text-[11px] text-subtle">for real estate agents</div>
          </div>
        </div>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-canvas"
        >
          <PanelLeft className={`h-[18px] w-[18px] ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {!collapsed && (
        <>
          <button
            type="button"
            onClick={() => {
              closeListing()
              navigate('/')
            }}
            className="mt-6 flex h-10 items-center justify-between rounded-full bg-[#f3f4f6] px-3 text-sm font-medium text-ink"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New listing
            </span>
            <kbd className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-medium text-muted ring-1 ring-black/[0.06]">
              ⌘N
            </kbd>
          </button>

          <nav className="mt-6 flex-1 overflow-y-auto">
            {GROUPS.map((group) => {
              const items = listings.filter((item) => item.status === group.key)
              if (!items.length) return null
              return (
                <div key={group.key} className="mb-5">
                  <div className="px-1 pb-2 text-[12px] text-subtle">{group.label}</div>
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item.id}>
                        <ListingRow item={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}

            <div className="mt-2 px-1 pb-2 text-[12px] text-subtle">Explore</div>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-1 py-2 text-[13px] font-medium text-ink hover:bg-canvas"
            >
              <Tag className="h-4 w-4 text-ink" />
              Pricing
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-1 py-2 text-[13px] font-medium text-ink hover:bg-canvas"
            >
              <Wand2 className="h-4 w-4 text-ink" />
              Interior design app
            </button>
          </nav>
        </>
      )}
    </aside>
  )
}

function ListingRow({ item }: { item: ListingSummary }) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const openListing = useListingStore((s) => s.openListing)
  const duplicateListing = useListingStore((s) => s.duplicateListing)
  const setListingStatus = useListingStore((s) => s.setListingStatus)
  const deleteListing = useListingStore((s) => s.deleteListing)
  const currentId = useListingStore((s) => s.currentListing?.id)
  const active = currentId === item.id
  const showActions = hovered || menuOpen

  const open = () => {
    openListing(item.id)
    navigate(`/listing/${item.id}`)
  }

  return (
    <div
      className={`group relative flex items-center rounded-xl ${
        active || showActions ? 'bg-canvas' : 'hover:bg-canvas'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!menuOpen) setHovered(false)
      }}
    >
      <button
        type="button"
        onClick={open}
        className="flex min-w-0 flex-1 items-center gap-2.5 px-1 py-1.5 text-left"
      >
        <img src={item.thumbnail} alt="" className="h-8 w-8 rounded-lg object-cover" />
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-medium text-ink">{item.address}</span>
          <span className="block truncate text-[12px] text-subtle">
            {item.price} · {item.dealType.toLowerCase()}
          </span>
        </span>
      </button>

      <div className={`pr-1 ${showActions ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="relative">
          <button
            type="button"
            aria-label="Listing actions"
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen((value) => !value)
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <Popover
            open={menuOpen}
            onClose={() => {
              setMenuOpen(false)
              setHovered(false)
            }}
            className="right-0 left-auto mt-1 w-[200px]"
          >
            <PopoverItem
              onClick={() => {
                setMenuOpen(false)
                open()
              }}
            >
              <FileText className="mr-2 h-3.5 w-3.5" />
              Open
            </PopoverItem>
            <PopoverItem
              onClick={() => {
                const copyId = duplicateListing(item.id)
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
            {item.status !== 'draft' && (
              <PopoverItem
                onClick={() => {
                  setListingStatus(item.id, 'draft')
                  setMenuOpen(false)
                }}
              >
                <FileText className="mr-2 h-3.5 w-3.5" />
                Move to drafts
              </PopoverItem>
            )}
            {item.status !== 'published' && (
              <PopoverItem
                onClick={() => {
                  setListingStatus(item.id, 'published')
                  setMenuOpen(false)
                }}
              >
                <Upload className="mr-2 h-3.5 w-3.5" />
                Move to published
              </PopoverItem>
            )}
            {item.status !== 'closed' && (
              <PopoverItem
                onClick={() => {
                  setListingStatus(item.id, 'closed')
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
                deleteListing(item.id)
                setMenuOpen(false)
                if (currentId === item.id) navigate('/')
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </PopoverItem>
          </Popover>
        </div>
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center">
      <svg viewBox="0 0 32 32" className="h-7 w-7">
        <path
          d="M6 15.4 16 7l10 8.4V25a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V15.4Z"
          fill="#22c55e"
        />
        <text
          x="16"
          y="22.5"
          textAnchor="middle"
          fontSize="8"
          fontWeight="800"
          fill="white"
          fontFamily="Inter, system-ui, sans-serif"
        >
          5d
        </text>
      </svg>
    </span>
  )
}
