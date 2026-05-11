import { useState, useEffect, useCallback } from 'react'
import { DesktopApp } from './DesktopApp'
import { MaintenanceScreen } from './components/MaintenanceScreen'
import { SourceOfflineScreen } from './components/SourceOfflineScreen'
import { UpdateNotification } from './components/UpdateNotification'
import { WelcomeModal } from './components/WelcomeModal'
import { InstallPrompt } from './components/InstallPrompt'
import { TermsPage } from './components/TermsPage'
import { SplashScreen } from './components/SplashScreen'

export default function App() {
  const [status, setStatus] = useState({ maintenance: false, sourceOffline: false, update: null })
  const [showTerms, setShowTerms] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [welcomeClosed, setWelcomeClosed] = useState(() => {
    return localStorage.getItem('maglinktv_hide_welcome') === 'true'
  })

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/status.json?t=${Date.now()}`)
      const data = await res.json()
      setStatus({ maintenance: !!data.maintenance, sourceOffline: !!data.sourceOffline, update: data.update || null })
    } catch (e) {
      console.error('Error fetching status.json', e)
    }
  }, [])

  useEffect(() => {
    checkStatus() // Revisar al abrir
    
    // Solo seguir revisando si la app está operativa
    if (status.maintenance || status.sourceOffline) return

    // Revisar automáticamente cada 5 minutos (300000 ms) para ahorrar cuota
    const interval = setInterval(checkStatus, 300000)
    
    // Revisar al instante si el usuario vuelve a la pestaña de la app
    window.addEventListener('focus', checkStatus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', checkStatus)
    }
  }, [checkStatus, status.maintenance, status.sourceOffline])

  // Escuchar evento global para abrir los Términos desde cualquier componente
  useEffect(() => {
    const handler = () => setShowTerms(true)
    window.addEventListener('open-terms', handler)
    return () => window.removeEventListener('open-terms', handler)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-bg">
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : status.maintenance ? (
        <MaintenanceScreen />
      ) : status.sourceOffline ? (
        <SourceOfflineScreen />
      ) : (
        <>
          <DesktopApp />
          <WelcomeModal onOpenTerms={() => setShowTerms(true)} onClose={() => setWelcomeClosed(true)} />
          <InstallPrompt />
          {welcomeClosed && <UpdateNotification updateData={status.update} />}
          {showTerms && <TermsPage onClose={() => setShowTerms(false)} />}
        </>
      )}
    </div>
  )
}
