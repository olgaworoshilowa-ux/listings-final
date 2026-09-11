import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toast } from './components/ui/Toast'
import { useAutosave, useKeyboardShortcuts } from './hooks/useAppEffects'
import { EditorScreen } from './screens/EditorScreen'
import { NewListingScreen } from './screens/NewListingScreen'
import { PublicPreviewScreen } from './screens/PublicPreviewScreen'

export default function App() {
  useKeyboardShortcuts()
  useAutosave()

  return (
    <>
      <Routes>
        <Route path="/" element={<NewListingScreen />} />
        <Route path="/listing/:id/preview" element={<PublicPreviewScreen />} />
        <Route path="/listing/:id" element={<EditorScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  )
}

export function AppRoot() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
  return (
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  )
}
