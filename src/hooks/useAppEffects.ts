import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListingStore } from '../store/useListingStore'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey
      const store = useListingStore.getState()
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      if (meta && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        store.closeListing()
        navigate('/')
        return
      }

      if (meta && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        if (typing) return
        event.preventDefault()
        store.undo()
        return
      }

      if (!store.currentListing) return

      if (meta && event.key === 'ArrowUp') {
        event.preventDefault()
        store.moveSelected(-1)
        return
      }
      if (meta && event.key === 'ArrowDown') {
        event.preventDefault()
        store.moveSelected(1)
        return
      }

      if (typing) return

      const ordered = [...store.currentListing.sections].sort((a, b) => a.order - b.order)
      const ids = ['property-details', ...ordered.map((s) => s.id), 'branding']
      const current = store.selectedSectionId ?? store.expandedSectionId
      const index = Math.max(0, ids.indexOf(current ?? 'property-details'))

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        const next = ids[Math.min(ids.length - 1, index + 1)]
        store.setSelectedSection(next)
        store.expandSection(next)
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        const next = ids[Math.max(0, index - 1)]
        store.setSelectedSection(next)
        store.expandSection(next)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])
}

export function useAutosave() {
  useEffect(() => {
    const id = window.setInterval(() => {
      const { dirty, markSaved, currentListing } = useListingStore.getState()
      if (dirty && currentListing) markSaved()
    }, 2800)
    return () => window.clearInterval(id)
  }, [])
}

export function filesToAttachments(files: FileList | File[]) {
  return Array.from(files).map((file) => {
    const kind =
      file.type.startsWith('image/')
        ? ('image' as const)
        : file.type === 'application/pdf'
          ? ('pdf' as const)
          : file.type.startsWith('audio/')
            ? ('audio' as const)
            : ('text' as const)
    return {
      id: crypto.randomUUID(),
      name: file.name,
      kind,
      url: kind === 'image' ? URL.createObjectURL(file) : undefined,
    }
  })
}
