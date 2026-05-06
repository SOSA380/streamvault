import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Evita que Chrome muestre el mini-infobar por defecto
      e.preventDefault()
      // Guarda el evento para dispararlo más tarde
      setDeferredPrompt(e)
      
      // Chequeamos si el usuario ya descartó el mensaje anteriormente
      const hasDismissed = localStorage.getItem('maglinktv_dismissed_install') === 'true'
      if (!hasDismissed) {
        setIsVisible(true)
      }
    }

    // Escuchamos el evento de instalación de la PWA
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Escuchamos si la app se instala con éxito para ocultar el mensaje
    window.addEventListener('appinstalled', () => {
      setIsVisible(false)
      setDeferredPrompt(null)
      console.log('MagLink TV fue instalado exitosamente')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Muestra el prompt nativo de instalación
    deferredPrompt.prompt()

    // Espera a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // Limpiamos el prompt y ocultamos nuestra UI
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('maglinktv_dismissed_install', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 transform translate-y-0 opacity-100 w-max">
      <div className="bg-[#0d0d0e]/95 backdrop-blur-md border border-accent/40 shadow-[0_15px_50px_rgba(0,243,255,0.25)] rounded-2xl p-4 pr-12 relative flex items-center gap-4 max-w-[90vw]">
        
        <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center shrink-0 border border-accent/30 shadow-[0_0_15px_rgba(0,243,255,0.4)]">
          <Download className="text-accent w-5 h-5" />
        </div>

        <div className="flex flex-col">
          <h3 className="text-white text-sm font-black uppercase tracking-widest drop-shadow-md">
            Instalar App
          </h3>
          <p className="text-white/70 text-[11px] font-bold mt-0.5 max-w-[200px] leading-tight">
            Instala MagLink TV en tu dispositivo para una mejor experiencia.
          </p>

          <button
            onClick={handleInstallClick}
            className="mt-3 flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-black px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all w-max shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:scale-105 active:scale-95"
          >
            <Download size={14} />
            Instalar
          </button>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
