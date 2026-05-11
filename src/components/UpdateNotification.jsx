import { useState, useEffect, useRef } from 'react'
import { Rocket, X, ExternalLink } from 'lucide-react'

export function UpdateNotification({ updateData }) {
  const [isOpen, setIsOpen] = useState(false)
  const dismissed = useRef(false)

  useEffect(() => {
    if (updateData?.available && !dismissed.current) setIsOpen(true)
    else if (!updateData?.available) { setIsOpen(false); dismissed.current = false }
  }, [updateData])

  const close = () => { dismissed.current = true; setIsOpen(false) }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(4,8,15,0.85)', backdropFilter: 'blur(12px)' }}>

      <div className="w-full max-w-sm animate-scale-in rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0C1525 0%, #070D1A 100%)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>

        {/* Top accent line */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.6), transparent)' }} />

        {/* Close */}
        <button onClick={close} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-txt-3 hover:text-txt-1 hover:bg-white/5 transition-all">
          <X size={15} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
            <Rocket size={17} className="text-accent" />
          </div>
          <div>
            <h2 className="text-txt-1 text-[15px] font-semibold">Actualización disponible</h2>
            {updateData?.version && <p className="text-accent text-[11px] font-medium tracking-wider mt-0.5">v{updateData.version}</p>}
          </div>
        </div>

        <div className="h-px mx-6" style={{ background: 'rgba(255,255,255,0.05)' }} />

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <p className="text-txt-3 text-[12px]">Hay una nueva versión de <span className="text-txt-1 font-medium">MagLink TV</span> disponible:</p>
          {updateData?.notes?.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {updateData.notes.map((n, i) => (
                <li key={i} className="flex gap-2 text-[12px] text-txt-2">
                  <span className="text-accent shrink-0 mt-px">•</span> {n}
                </li>
              ))}
            </ul>
          )}

          {/* Cafecito */}
          <div className="rounded-xl p-4 flex flex-col gap-3 mt-1"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-txt-1 text-[12px] font-medium">¿Te gusta MagLink TV? ☕</p>
            <p className="text-txt-3 text-[11px] leading-relaxed">Es un proyecto independiente. Si querés apoyarlo, podés invitarme un café.</p>
            <a href="https://cafecito.app/donacionesmaglinktv" target="_blank" rel="noopener"
              className="self-start flex items-center gap-1.5 text-[11px] text-accent font-medium hover:text-accent-2 transition-colors">
              <ExternalLink size={11} /> Invitar un café
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end">
          <button onClick={close}
            className="px-6 py-2.5 rounded-xl text-[12px] font-semibold text-bg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #00E5FF, #00B8CC)', boxShadow: '0 0 20px rgba(0,229,255,0.25)' }}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
