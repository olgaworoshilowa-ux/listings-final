import { useEffect } from 'react'
import { useListingStore } from '../../store/useListingStore'

export function Toast() {
  const toast = useListingStore((s) => s.toast)
  const undo = useListingStore((s) => s.undo)
  const dismissToast = useListingStore((s) => s.dismissToast)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(dismissToast, 4200)
    return () => window.clearTimeout(id)
  }, [toast, dismissToast])

  if (!toast) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-xl">
        <span>{toast.message}</span>
        {toast.actionLabel && (
          <>
            <span className="text-white/30">·</span>
            <button
              type="button"
              className="font-medium text-white underline decoration-white/40 underline-offset-2"
              onClick={() => {
                undo()
                dismissToast()
              }}
            >
              {toast.actionLabel}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
