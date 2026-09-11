import { Bell, CircleHelp, Sparkles } from 'lucide-react'
import { useListingStore } from '../../store/useListingStore'

export function CreditsPill() {
  const credits = useListingStore((s) => s.credits)

  return (
    <div className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[13px] font-medium text-credit shadow-sm ring-1 ring-black/[0.04]">
      <Sparkles className="h-3.5 w-3.5 fill-credit" />
      {credits}
    </div>
  )
}

export function ProfileCluster() {
  return (
    <div className="flex items-center gap-2">
      <CreditsPill />
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-avatar text-[13px] font-semibold text-white">
        O
      </div>
      <span className="text-[13px] font-medium text-ink">Pro</span>
    </div>
  )
}

export function AppHeader() {
  return (
    <header className="flex h-14 items-center justify-end gap-2 px-6">
      <button
        type="button"
        aria-label="Help"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-canvas"
      >
        <CircleHelp className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-canvas"
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
      </button>
      <ProfileCluster />
    </header>
  )
}
