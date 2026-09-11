import { Upload } from 'lucide-react'

export function DropOverlay() {
  return (
    <div className="absolute inset-3 z-40 flex items-center justify-center rounded-[28px] border-2 border-dashed border-ai/50 bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ai/10 text-ai">
          <Upload className="h-6 w-6" />
        </span>
        <div>
          <p className="text-lg font-semibold text-ink">Drop to add to this listing</p>
          <p className="mt-1 text-sm text-muted">Photos, PDF, voice notes, or a link</p>
        </div>
      </div>
    </div>
  )
}
