import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ListingPage } from '../components/editor/LivePreview'
import { hydrateSampleListing, SAMPLE_LISTINGS } from '../data/mock'
import { readPreviewSnapshot } from '../lib/previewSnapshot'
import { useListingStore } from '../store/useListingStore'
import type { Listing } from '../types'

export function PublicPreviewScreen() {
  const { id } = useParams()
  const [listing, setListing] = useState<Listing | null>(null)

  useEffect(() => {
    if (!id) return
    document.title = 'Listing preview'
    const snapshot = readPreviewSnapshot(id)
    if (snapshot) {
      setListing(snapshot)
      return
    }
    const current = useListingStore.getState().currentListing
    if (current?.id === id) {
      setListing(current)
      return
    }
    const summary = SAMPLE_LISTINGS.find((item) => item.id === id)
    setListing(summary ? hydrateSampleListing(summary) : null)
  }, [id])

  if (!listing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2f3f5] px-6 text-center">
        <p className="max-w-sm text-[15px] text-muted">
          This preview is empty. Open the listing in the editor and click Preview again.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f2f3f5] px-4 py-8 md:px-8">
      <ListingPage listing={listing} publicView />
    </div>
  )
}
