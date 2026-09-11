import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useListingStore } from '../../store/useListingStore'
import { Popover, PopoverItem } from '../ui/Overlay'
import type { DealType } from '../../types'

export function SettingChips({ variant = 'hero' }: { variant?: 'hero' | 'compact' }) {
  const settings = useListingStore((s) => s.settings)
  const setDeal = useListingStore((s) => s.setDeal)
  const setFloorPlan = useListingStore((s) => s.setFloorPlan)
  const setSpace = useListingStore((s) => s.setSpace)
  const addAttachments = useListingStore((s) => s.addAttachments)
  const addPhotos = useListingStore((s) => s.addPhotos)
  const [open, setOpen] = useState<string | null>(null)

  const close = () => setOpen(null)

  const uploadPhotos = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => {
      if (!input.files) return
      const files = Array.from(input.files).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        kind: 'image' as const,
        url: URL.createObjectURL(file),
      }))
      addAttachments(files)
      addPhotos(files.map((file) => file.url).filter(Boolean) as string[])
      close()
    }
    input.click()
  }

  const items = [
    {
      id: 'photos',
      label: 'Photos',
      value: `${settings.photoCount}/${settings.photoMax}`,
      options: (
        <>
          <PopoverItem onClick={uploadPhotos}>Upload photos</PopoverItem>
          <p className="px-3 py-2 text-xs text-muted">Up to {settings.photoMax} images</p>
        </>
      ),
    },
    {
      id: 'floor',
      label: 'Floor plan',
      value:
        settings.floorPlan === 'auto' ? (
          <AiValue />
        ) : settings.floorPlan === 'upload' ? (
          'Upload'
        ) : (
          'None'
        ),
      options: (['auto', 'upload', 'none'] as const).map((mode) => (
        <PopoverItem
          key={mode}
          active={settings.floorPlan === mode}
          onClick={() => {
            setFloorPlan(mode)
            close()
          }}
        >
          {mode === 'auto' ? '✦ Auto' : mode === 'upload' ? 'Upload' : 'None'}
        </PopoverItem>
      )),
    },
    {
      id: 'deal',
      label: 'Deal',
      value: settings.deal,
      options: (['For sale', 'For rent'] as DealType[]).map((deal) => (
        <PopoverItem
          key={deal}
          active={settings.deal === deal}
          onClick={() => {
            setDeal(deal)
            close()
          }}
        >
          {deal}
        </PopoverItem>
      )),
    },
    {
      id: 'space',
      label: 'Space',
      value: (
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-[#3b82f6] text-[9px] font-bold text-white">
            M
          </span>
          {settings.space}
        </span>
      ),
      options: ['My home', 'Show house', 'Client brief'].map((space) => (
        <PopoverItem
          key={space}
          active={settings.space === space}
          onClick={() => {
            setSpace(space)
            close()
          }}
        >
          {space}
        </PopoverItem>
      )),
    },
  ]

  if (variant === 'compact') {
    return (
      <div className="flex flex-col p-0.5">
        {items.map((item) => (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(open === item.id ? null : item.id)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-canvas"
            >
              <span className="text-[13px] text-muted">{item.label}</span>
              <span className="text-[13px] font-semibold text-ink">{item.value}</span>
            </button>
            {open === item.id && <div className="pb-1">{item.options}</div>}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((item) => (
        <Chip
          key={item.id}
          label={item.label}
          value={item.value}
          open={open === item.id}
          onToggle={() => setOpen(open === item.id ? null : item.id)}
          onClose={close}
        >
          {item.options}
        </Chip>
      ))}
    </div>
  )
}

function AiValue() {
  return (
    <span className="flex items-center gap-1 text-ai">
      <Sparkles className="h-3.5 w-3.5 fill-ai" />
      Auto
    </span>
  )
}

function Chip({
  label,
  value,
  open,
  onToggle,
  onClose,
  children,
}: {
  label: string
  value: React.ReactNode
  open: boolean
  onToggle: () => void
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-[72px] w-full flex-col items-start justify-center rounded-[22px] bg-white px-4 text-left shadow-[0_6px_20px_rgba(17,17,17,0.05)] ring-1 ring-black/[0.04] transition hover:ring-black/[0.08]"
      >
        <span className="text-[13px] text-muted">{label}</span>
        <span className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] text-ink">
          {value}
        </span>
      </button>
      <Popover open={open} onClose={onClose} className="left-0 right-0 min-w-0">
        {children}
      </Popover>
    </div>
  )
}
