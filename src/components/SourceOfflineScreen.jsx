import { useState } from 'react'
import { RefreshCw, ServerOff } from 'lucide-react'
import previewImg from './preview.webp'

export function SourceOfflineScreen() {
  const [isReloading, setIsReloading] = useState(false)

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[9999] p-4 text-center font-sans overflow-hidden">
      <img src={previewImg} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 via-transparent to-transparent z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-xl px-6 gap-4">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(245,158,11,0.08)]">
          <ServerOff className="w-7 h-7 text-amber-400" />
        </div>

        <h1 className="text-white font-black uppercase tracking-widest text-2xl md:text-3xl drop-shadow-md">
          Fuente Temporalmente Caída
        </h1>

        <p className="text-white/70 leading-relaxed text-sm md:text-base max-w-md">
          Los servidores externos de terceros que proveen los streams están fuera de servicio
          en este momento. Intentá de nuevo más tarde.
        </p>

        {/* Legal note */}
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-left max-w-md w-full">
          <p className="text-white/40 text-[11px] leading-relaxed">
            <strong className="text-white/60">Recordatorio:</strong>{' '}
            MagLink TV actúa exclusivamente como cliente de reproducción. No controla,
            opera ni es responsable de la disponibilidad, continuidad ni estado de los
            servidores externos de terceros desde los cuales se transmite el contenido.
          </p>
        </div>

        <button
          onClick={() => { setIsReloading(true); setTimeout(() => window.location.reload(), 300) }}
          className="mt-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors border border-white/10"
        >
          <RefreshCw size={14} className={isReloading ? 'animate-spin' : ''} />
          Verificar conexión
        </button>

        <p className="text-white/20 text-[10px] tracking-widest font-bold uppercase mt-4">
          © 2026 MagLink TV · Status: Source Down
        </p>
      </div>
    </div>
  )
}
