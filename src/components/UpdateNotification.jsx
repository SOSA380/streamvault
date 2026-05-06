import { useState, useEffect, useRef } from 'react'
import { Rocket, X } from 'lucide-react'

export function UpdateNotification({ updateData }) {
  const [isOpen, setIsOpen] = useState(false)
  const dismissedRef = useRef(false)

  useEffect(() => {
    if (updateData?.available && !dismissedRef.current) {
      setIsOpen(true)
    } else if (!updateData?.available) {
      // Si el admin lo desactiva, resetear para la próxima vez
      setIsOpen(false)
      dismissedRef.current = false
    }
  }, [updateData])

  const handleClose = () => {
    dismissedRef.current = true
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
      <div className="relative w-full max-w-md bg-[#0d0d0e] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col animate-[scaleIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]">

        {/* Header */}
        <div className="bg-gradient-to-r from-accent/15 to-transparent p-6 flex items-center gap-4 border-b border-white/5">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center border border-accent/30 shrink-0">
            <Rocket className="text-accent w-6 h-6" />
          </div>
          <div>
            <h2 className="text-white text-lg font-black uppercase tracking-widest">Actualización disponible</h2>
            {updateData?.version && (
              <p className="text-accent/80 text-xs font-bold uppercase tracking-widest mt-1">
                Versión {updateData.version}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 text-white/70 text-sm leading-relaxed font-medium">
          <p className="text-white/50 text-xs">Hay una nueva versión de <strong className="text-white">MagLink TV</strong> disponible. Estas son las novedades:</p>

          {updateData?.notes?.length > 0 && (
            <ul className="flex flex-col gap-2">
              {updateData.notes.map((note, idx) => (
                <li key={idx} className="flex gap-2 text-[13px]">
                  <span className="text-accent shrink-0">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cafecito donation */}
        <div className="mx-6 mb-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-white text-xs font-bold">¿Te gusta MagLink TV?</p>
            <p className="text-white/40 text-[11px] leading-relaxed">
              Es un proyecto independiente mantenido con mucho esfuerzo. Si querés apoyarlo, invitame un café ☕
            </p>
          </div>
          <a
            href="https://cafecito.app/donacionesmaglinktv"
            rel="noopener"
            target="_blank"
            className="self-center opacity-90 hover:opacity-100 transition-opacity hover:scale-105 transform"
            title="Invitame un café en cafecito.app"
          >
            <img
              srcSet="https://cdn.cafecito.app/imgs/buttons/button_1.png 1x, https://cdn.cafecito.app/imgs/buttons/button_1_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_1_3.75x.png 3.75x"
              src="https://cdn.cafecito.app/imgs/buttons/button_1.png"
              alt="Invitame un café en cafecito.app"
              className="h-9 w-auto"
            />
          </a>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex justify-end">
          <button
            onClick={handleClose}
            className="bg-accent text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-accent/80 transition-colors shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)]"
          >
            Entendido
          </button>
        </div>

        {/* X button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
