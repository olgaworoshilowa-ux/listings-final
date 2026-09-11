import { useState } from 'react'
import { ChevronDown, ChevronsLeft, MessageSquare } from 'lucide-react'
import { useListingStore } from '../../store/useListingStore'
import { Composer } from '../composer/Composer'

export function ChatRail({ docked = false }: { docked?: boolean }) {
  const expanded = useListingStore((s) => s.chatExpanded)
  const toggleChat = useListingStore((s) => s.toggleChat)
  const messages = useListingStore((s) => s.messages)
  const generation = useListingStore((s) => s.generation)
  const sendFollowUp = useListingStore((s) => s.sendFollowUp)
  const continueGeneration = useListingStore((s) => s.continueGeneration)
  const [logOpen, setLogOpen] = useState(false)

  if (!docked && !expanded) {
    return (
      <div className="absolute top-4 left-4 z-20">
        <button
          type="button"
          onClick={() => toggleChat(true)}
          className="flex h-10 items-center gap-2 rounded-full bg-white px-3.5 text-[13px] font-medium text-ink shadow-sm ring-1 ring-black/[0.08] hover:bg-canvas"
        >
          <MessageSquare className="h-4 w-4" />
          Chat
        </button>
      </div>
    )
  }

  const seconds = Math.max(1, Math.round(generation.elapsedMs / 1000))

  return (
    <aside className="flex w-[340px] shrink-0 flex-col bg-white">
      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-ink">Chat</h2>
        {!docked && (
          <button
            type="button"
            aria-label="Collapse chat"
            onClick={() => toggleChat(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-end overflow-y-auto px-5 pb-3 pt-4">
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? 'ml-auto max-w-[240px] rounded-[18px] bg-[#f3f4f6] px-4 py-3 text-[13px] leading-5 text-ink'
                  : 'mr-auto max-w-[260px] text-[13px] leading-5 text-muted'
              }
            >
              {message.content}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        {(generation.running || generation.steps.length > 0) && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setLogOpen((v) => !v)}
              className="flex items-center gap-1 text-[13px] text-ink"
            >
              {generation.running ? (
                <>
                  {generation.currentLabel}
                  <span className="text-muted">· {seconds}s</span>
                </>
              ) : generation.cancelled ? (
                <span>Stopped</span>
              ) : (
                <span>Done</span>
              )}
              <ChevronDown className={`h-3.5 w-3.5 text-muted transition ${logOpen ? 'rotate-180' : ''}`} />
            </button>
            {logOpen && (
              <ul className="mt-2 space-y-1.5 text-[12px] text-muted">
                {generation.steps.map((step) => (
                  <li key={step.id} className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        step.status === 'done'
                          ? 'bg-publish'
                          : step.status === 'active'
                            ? 'bg-ai'
                            : step.status === 'cancelled'
                              ? 'bg-red-400'
                              : 'bg-gray-300'
                      }`}
                    />
                    {step.label}
                  </li>
                ))}
              </ul>
            )}
            {generation.canContinue && !generation.running && (
              <button
                type="button"
                onClick={continueGeneration}
                className="mt-2 text-[13px] font-medium text-ai"
              >
                Continue
              </button>
            )}
          </div>
        )}
        <Composer
          variant="chat"
          onSubmit={(text) => {
            if (generation.running) return
            sendFollowUp(text)
          }}
        />
      </div>
    </aside>
  )
}
