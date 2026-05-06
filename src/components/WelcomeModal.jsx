import { useState, useEffect } from 'react'
import { ShieldCheck, AlertTriangle, ExternalLink, Radio } from 'lucide-react'

export function WelcomeModal({ onOpenTerms, onClose }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(true)

  useEffect(() => {
    const isHiddenForever = localStorage.getItem('maglinktv_hide_welcome') === 'true'
    if (!isHiddenForever) setIsOpen(true)
  }, [])

  const handleAccept = () => {
    if (dontShowAgain) localStorage.setItem('maglinktv_hide_welcome', 'true')
    setIsOpen(false)
    if (onClose) onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#0d0d0e] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-accent/15 to-transparent p-6 flex items-center gap-4 border-b border-white/5">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center border border-accent/30 shrink-0">
            <ShieldCheck className="text-accent w-6 h-6" />
          </div>
          <div>
            <h2 className="text-white text-lg font-black uppercase tracking-widest">MagLink TV</h2>
            <p className="text-accent/80 text-xs font-bold uppercase tracking-widest mt-1">Aviso legal — Leé antes de continuar</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 text-white/70 text-sm leading-relaxed font-medium">

          <div className="flex gap-3">
            <Radio className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">MagLink TV</strong> es un <strong className="text-white">reproductor multimedia</strong> que
              indexa y reproduce streams de canales de televisión disponibles en internet, transmitidos en tiempo real
              desde servidores de terceros.
            </p>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2 text-xs">
              <p className="text-white font-bold">Declaración de no responsabilidad</p>
              <p>
                MagLink TV <strong className="text-white">no aloja, no almacena ni distribuye</strong> ningún
                canal de televisión ni contenido protegido por derechos de autor en sus servidores.
                Los streams son transmitidos en tiempo real desde <strong className="text-white">servidores externos de terceros</strong>,
                completamente ajenos a MagLink TV, y pueden interrumpirse sin previo aviso.
              </p>
              <p>
                MagLink TV actúa como <strong className="text-white">cliente de reproducción</strong>, no como proveedor de contenido.
                El usuario es el único responsable del uso que haga de esta aplicación y de los contenidos a los que
                acceda mediante ella, de acuerdo a las leyes aplicables en su jurisdicción.
              </p>
              <p>
                Al continuar, <strong className="text-white">aceptás estos términos</strong> y los{' '}
                <button
                  onClick={onOpenTerms}
                  className="text-accent/80 hover:text-accent underline underline-offset-2 transition-colors"
                >
                  Términos y Condiciones
                </button>{' '}
                completos de la aplicación.
              </p>
            </div>
          </div>

          <p className="text-xs text-white/40 leading-relaxed">
            Ante cualquier consulta legal escribinos a:{' '}
            <span className="text-accent/60">legal@maglinktv.app</span>
          </p>

          <label className="flex items-center gap-2 cursor-pointer group mt-1">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-black/50 text-accent focus:ring-accent focus:ring-offset-black"
            />
            <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">
              Leí y entendí el aviso. No volver a mostrar.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex items-center justify-between gap-4">
          <button
            onClick={onOpenTerms}
            className="text-xs text-white/25 hover:text-accent/60 transition-colors flex items-center gap-1"
          >
            <ExternalLink size={11} /> Términos y condiciones
          </button>
          <button
            onClick={handleAccept}
            className="bg-accent text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-accent/80 transition-colors shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)]"
          >
            Entendido — Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
