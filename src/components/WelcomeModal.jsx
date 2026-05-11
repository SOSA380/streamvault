import { useState, useEffect } from 'react'
import { ShieldCheck, AlertTriangle, ExternalLink, Activity } from 'lucide-react'

export function WelcomeModal({ onOpenTerms, onClose }) {
  const [isOpen, setIsOpen] = useState(false)
  const [checked, setChecked] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('maglinktv_hide_welcome') !== 'true') setIsOpen(true)
  }, [])

  const handleAccept = () => {
    if (checked) localStorage.setItem('maglinktv_hide_welcome', 'true')
    setIsOpen(false)
    onClose?.()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(20px)' }}>

      <div className="w-full max-w-xl animate-scale-in overflow-hidden rounded-[28px] glass-card relative">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-3/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Top accent line */}
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent 0%, #00F0FF 50%, transparent 100%)' }} />

        {/* Header */}
        <div className="flex items-center gap-5 px-8 pt-8 pb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 v3-accent-bg v3-glow text-bg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-txt-1 text-xl font-bold tracking-tight">StreamVault</h2>
            <p className="text-accent text-[11px] font-semibold tracking-[0.2em] uppercase mt-1">Aviso de Responsabilidad</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 50%, transparent)' }} />

        {/* Body */}
        <div className="px-8 py-6 flex flex-col gap-5 relative z-10">
          <div className="flex gap-4 items-start p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <Activity size={18} className="text-accent shrink-0 mt-0.5" />
            <p className="text-txt-2 text-sm leading-relaxed font-light">
              <span className="text-txt-1 font-medium">StreamVault</span> es un reproductor multimedia avanzado que indexa y reproduce streams de canales disponibles en internet desde servidores de terceros.
            </p>
          </div>

          <div className="rounded-2xl p-5 flex gap-4 items-start relative overflow-hidden group">
            <div className="absolute inset-0 bg-warning/10 transition-colors group-hover:bg-warning/15" />
            <div className="absolute inset-0 border border-warning/20 rounded-2xl" />
            <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5 relative z-10" />
            <div className="text-sm leading-relaxed relative z-10">
              <p className="text-warning font-semibold mb-2">Aclaración Importante</p>
              <p className="text-txt-2 font-light">StreamVault <span className="text-txt-1 font-medium">no aloja ni distribuye</span> contenido. Los streams provienen de servidores externos ajenos a esta app. Al continuar aceptas los{' '}
                <button onClick={onOpenTerms} className="text-txt-1 font-medium underline underline-offset-4 decoration-accent/50 hover:decoration-accent transition-colors">Términos y Condiciones</button>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-txt-3">Consultas: <span className="text-txt-2">legal@streamvault.app</span></p>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checked ? 'bg-accent border-accent text-bg' : 'border-txt-3 text-transparent group-hover:border-txt-2'}`}>
                <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className="hidden" />
              <span className="text-sm text-txt-3 group-hover:text-txt-1 transition-colors">No volver a mostrar</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2 flex items-center justify-between gap-4 relative z-10">
          <button onClick={onOpenTerms} className="flex items-center gap-2 text-xs text-txt-3 hover:text-accent transition-colors font-medium">
            <ExternalLink size={14} /> Leer Términos
          </button>
          <button onClick={handleAccept}
            className="px-8 py-3.5 rounded-2xl text-sm font-bold text-bg transition-all hover:scale-[1.02] active:scale-[0.98] v3-accent-bg v3-glow">
            Entendido, Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
