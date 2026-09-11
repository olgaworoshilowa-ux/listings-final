import { useNavigate } from 'react-router-dom'
import { HERO_PHOTOS } from '../data/images'
import { filesToAttachments } from '../hooks/useAppEffects'
import { useListingStore } from '../store/useListingStore'
import { Composer } from '../components/composer/Composer'
import { SettingChips } from '../components/composer/SettingChips'
import { AppHeader } from '../components/shell/AppHeader'
import { Sidebar } from '../components/shell/Sidebar'
import { DropOverlay } from '../components/shell/DropOverlay'

export function NewListingScreen() {
  const navigate = useNavigate()
  const createDraftAndStart = useListingStore((s) => s.createDraftAndStart)
  const addAttachments = useListingStore((s) => s.addAttachments)
  const setDropActive = useListingStore((s) => s.setDropActive)
  const dropActive = useListingStore((s) => s.dropActive)

  const submit = (text: string) => {
    const id = createDraftAndStart(text)
    navigate(`/listing/${id}`)
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-white"
      onDragEnter={(event) => {
        event.preventDefault()
        setDropActive(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDropActive(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDropActive(false)
        if (event.dataTransfer.files.length) {
          addAttachments(filesToAttachments(event.dataTransfer.files))
        }
        const uri = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text')
        if (/^https?:\/\//i.test(uri.trim())) {
          addAttachments([{ id: crypto.randomUUID(), name: uri.trim(), kind: 'link' }])
        }
      }}
    >
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex flex-1 justify-center overflow-y-auto px-8 pb-16 pt-6">
          <div className="flex w-full max-w-[900px] flex-col items-center">
            <HeroPhotos />
            <h1 className="mt-10 text-center text-[40px] leading-[1.15] font-bold tracking-[-0.04em] text-ink">
              Everything you shot today, as a listing page
            </h1>
            <p className="mt-4 max-w-[560px] text-center text-[16px] leading-6 text-muted">
              Drop the photos, the voice note, the developer&apos;s PDF or just text.
              <br />
              Copilot sorts the photos, pulls out the numbers and writes the page
            </p>
            <div className="mt-8 w-full max-w-[760px]">
              <SettingChips />
            </div>
            <div className="mt-4 w-full max-w-[760px]">
              <Composer variant="hero" onSubmit={submit} />
            </div>
          </div>
        </main>
        {dropActive && <DropOverlay />}
      </div>
    </div>
  )
}

function HeroPhotos() {
  return (
    <div className="relative mx-auto h-[230px] w-full max-w-[720px]">
      <img
        src={HERO_PHOTOS.left}
        alt="House with a pool"
        className="absolute top-8 left-[8%] h-[168px] w-[250px] rounded-2xl object-cover shadow-[0_12px_28px_rgba(17,17,17,0.12)]"
      />
      <img
        src={HERO_PHOTOS.right}
        alt="Living room"
        className="absolute top-8 right-[8%] h-[168px] w-[250px] rounded-2xl object-cover shadow-[0_12px_28px_rgba(17,17,17,0.12)]"
      />
      <img
        src={HERO_PHOTOS.center}
        alt="Modern villa"
        className="absolute top-0 left-1/2 z-10 h-[214px] w-[318px] -translate-x-1/2 rounded-2xl object-cover shadow-[0_24px_50px_rgba(17,17,17,0.22)]"
      />
    </div>
  )
}
