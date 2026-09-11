import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useListingStore } from '../store/useListingStore'
import { ChatRail } from '../components/editor/ChatRail'
import { ContentPanel } from '../components/editor/ContentPanel'
import { EditorTopBar } from '../components/editor/EditorTopBar'
import { LivePreview } from '../components/editor/LivePreview'

export function EditorScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const current = useListingStore((s) => s.currentListing)
  const openListing = useListingStore((s) => s.openListing)
  const editorOption = useListingStore((s) => s.editorOption)
  const option2Panel = useListingStore((s) => s.option2Panel)

  useEffect(() => {
    if (!id) return
    if (!current || current.id !== id) {
      const exists = useListingStore.getState().listings.some((item) => item.id === id)
      if (exists) openListing(id)
      else if (!current) navigate('/')
    }
  }, [id, current, openListing, navigate])

  if (!current) return null

  if (editorOption === 'option2') {
    return (
      <div className="flex h-screen flex-col bg-white">
        <EditorTopBar />
        <div className="relative flex min-h-0 flex-1 bg-[#f2f3f5]">
          {option2Panel === 'content' ? <ContentPanel docked /> : <ChatRail docked />}
          <LivePreview />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <EditorTopBar />
      <div className="relative flex min-h-0 flex-1 bg-[#f2f3f5]">
        <ChatRail />
        <LivePreview />
        <ContentPanel />
      </div>
    </div>
  )
}
