import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      if (localStorage.getItem('maglinktv_dismissed_install') !== 'true') setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setVisible(false); setPrompt(null) })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    await prompt.userChoice
    setPrompt(null); setVisible(false)
  }

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('maglinktv_dismissed_install', 'true')
  }

  if (!visible) return null

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-fade-up">
      <div className="relative flex items-center gap-4 px-5 py-4 pr-12 rounded-2xl max-w-[90vw]"
        style={{ background: 'rgba(7,13,26,0.95)', border: '1px solid rgba(0,229,255,0.25)', boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,229,255,0.05) inset', backdropFilter: 'blur(20px)' }}>

        {/* Accent bar top */}
        <div className="absolute top-0 left-6 right-6 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.5), transparent)' }} />

        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
          <Download size={16} className="text-accent" />
        </div>

        <div className="flex flex-col">
          <p className="text-txt-1 text-[13px] font-semibold">Instalar MagLink TV</p>
          <p className="text-txt-2 text-[11px] font-normal mt-0.5 max-w-[180px] leading-snug">
            Instalá la app para una experiencia más fluida.
          </p>
          <button onClick={install}
            className="mt-3 self-start flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-semibold text-bg transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #00E5FF, #00B8CC)' }}>
            <Download size={11} /> Instalar
          </button>
        </div>

        <button onClick={dismiss}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-txt-3 hover:text-txt-1 hover:bg-white/5 transition-all">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
