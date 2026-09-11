import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

interface TooltipProps {
  label: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'right'
}

export function Tooltip({ label, children, side = 'top' }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const place =
    side === 'right'
      ? 'left-full top-1/2 ml-2 -translate-y-1/2'
      : side === 'bottom'
        ? 'top-full left-1/2 mt-2 -translate-x-1/2'
        : 'bottom-full left-1/2 mb-2 -translate-x-1/2'

  return (
    <span
      className="relative inline-flex min-w-0 max-w-full"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white shadow-lg ${place}`}
        >
          {label}
        </span>
      )}
    </span>
  )
}

interface PopoverProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Popover({ open, onClose, children, className = '' }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      ref={ref}
      id={id}
      className={`absolute z-40 mt-2 min-w-[180px] rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_40px_rgba(17,17,17,0.12)] ${className}`}
    >
      {children}
    </div>
  )
}

export function PopoverItem({
  active,
  onClick,
  children,
  danger,
}: {
  active?: boolean
  onClick: () => void
  children: ReactNode
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : active
            ? 'bg-canvas font-medium text-ink'
            : 'text-ink hover:bg-canvas'
      }`}
    >
      {children}
    </button>
  )
}
