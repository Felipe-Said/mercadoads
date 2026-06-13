import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { applyPlatformSettings, loadPlatformSettings, readCachedPlatformSettings } from './lib/platformSettings.ts'

async function bootstrap() {
  const cachedSettings = readCachedPlatformSettings()

  if (cachedSettings) {
    applyPlatformSettings(cachedSettings)
  }

  try {
    const settings = await loadPlatformSettings({ force: true })
    applyPlatformSettings(settings)
  } catch (error) {
    console.error(error)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}

bootstrap().catch(console.error)
