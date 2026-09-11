import { useRef, useState } from 'react'
import { ChevronDown, Paperclip, Mic, SlidersHorizontal, Square, ArrowUp } from 'lucide-react'
import { useListingStore } from '../../store/useListingStore'
import { filesToAttachments } from '../../hooks/useAppEffects'
import { Popover, PopoverItem } from '../ui/Overlay'
import { SettingChips } from './SettingChips'
import type { CopilotMode } from '../../types'

const MODES: CopilotMode[] = ['Lite', 'Standard', 'Pro']

interface ComposerProps {
  variant: 'hero' | 'chat'
  onSubmit: (text: string) => void
}

export function Composer({ variant, onSubmit }: ComposerProps) {
  const text = useListingStore((s) => s.composerText)
  const setComposerText = useListingStore((s) => s.setComposerText)
  const settings = useListingStore((s) => s.settings)
  const setMode = useListingStore((s) => s.setMode)
  const addAttachments = useListingStore((s) => s.addAttachments)
  const removeAttachment = useListingStore((s) => s.removeAttachment)
  const generation = useListingStore((s) => s.generation)
  const stopGeneration = useListingStore((s) => s.stopGeneration)
  const continueGeneration = useListingStore((s) => s.continueGeneration)
  const fileRef = useRef<HTMLInputElement>(null)
  const [modeOpen, setModeOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const running = generation.running
  const canSend = text.trim().length > 0 || settings.attachments.length > 0

  const submit = () => {
    if (running) {
      stopGeneration()
      return
    }
    if (generation.canContinue && !canSend) {
      continueGeneration()
      return
    }
    if (!canSend) return
    onSubmit(text)
  }

  const isHero = variant === 'hero'

  return (
    <div
      className={`relative bg-white ${
        isHero
          ? 'rounded-[28px] px-6 pt-5 pb-4 shadow-[0_8px_30px_rgba(17,17,17,0.06)] ring-1 ring-black/[0.04]'
          : 'rounded-[22px] px-3.5 pt-3 pb-2.5 ring-1 ring-black/[0.08]'
      }`}
    >
      {settings.attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {settings.attachments.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => removeAttachment(file.id)}
              className="flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-xs text-ink"
            >
              {file.kind === 'image' && file.url ? (
                <img src={file.url} alt="" className="h-4 w-4 rounded object-cover" />
              ) : null}
              <span className="max-w-[140px] truncate">{file.name}</span>
              <span className="text-subtle">×</span>
            </button>
          ))}
        </div>
      )}

      <textarea
        value={text}
        onChange={(event) => setComposerText(event.target.value)}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData('text')
          if (/^https?:\/\//i.test(pasted.trim())) {
            event.preventDefault()
            addAttachments([
              {
                id: crypto.randomUUID(),
                name: pasted.trim(),
                kind: 'link',
              },
            ])
          }
          const files = event.clipboardData.files
          if (files.length) {
            addAttachments(filesToAttachments(files))
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            submit()
          }
        }}
        rows={isHero ? 2 : 2}
        placeholder="Paste anything you have about this home and Copilot will do the rest"
        className={`w-full bg-transparent text-[15px] leading-6 text-ink outline-none placeholder:text-subtle ${
          isHero ? 'min-h-[52px]' : 'min-h-[44px] text-[13px] leading-5'
        }`}
      />

      <div className={`mt-2 flex items-center justify-between ${isHero ? 'pt-1' : ''}`}>
        <div className="flex items-center gap-1.5">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,application/pdf,audio/*,text/plain"
            className="hidden"
            onChange={(event) => {
              if (event.target.files) addAttachments(filesToAttachments(event.target.files))
              event.target.value = ''
            }}
          />
          <IconButton
            label="Attach files"
            onClick={() => fileRef.current?.click()}
            large={isHero}
          >
            <Paperclip className={isHero ? 'h-[18px] w-[18px]' : 'h-4 w-4'} />
          </IconButton>
          {!isHero && (
            <div
              className="relative"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <IconButton
                label="Generation settings"
                large={false}
                onClick={() => setSettingsOpen((value) => !value)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </IconButton>
              <Popover
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                className="bottom-[44px] left-0 mt-0 w-[260px]"
              >
                <SettingChips variant="compact" />
              </Popover>
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModeOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full px-1.5 py-1 text-[13px] text-muted hover:bg-canvas"
          >
            {isHero ? `Mode: ${settings.mode}` : settings.mode}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <Popover open={modeOpen} onClose={() => setModeOpen(false)} className="right-10 bottom-10 mt-0">
            {MODES.map((mode) => (
              <PopoverItem
                key={mode}
                active={settings.mode === mode}
                onClick={() => {
                  setMode(mode)
                  setModeOpen(false)
                }}
              >
                {mode}
              </PopoverItem>
            ))}
          </Popover>

          {isHero ? (
            <IconButton label="Voice note" large>
              <Mic className="h-[18px] w-[18px]" />
            </IconButton>
          ) : (
            <button
              type="button"
              onClick={submit}
              aria-label={running ? 'Stop' : 'Send'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition hover:bg-black"
            >
              {running ? (
                <Square className="h-3.5 w-3.5 fill-white" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function IconButton({
  children,
  onClick,
  label,
  large,
}: {
  children: React.ReactNode
  onClick?: () => void
  label: string
  large: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex items-center justify-center rounded-full bg-canvas text-ink/70 transition hover:bg-gray-200 ${
        large ? 'h-11 w-11' : 'h-8 w-8'
      }`}
    >
      {children}
    </button>
  )
}
