import { useState } from 'react'
import { RefreshCw, Wrench } from 'lucide-react'
import previewImg from './preview.webp'

export function MaintenanceScreen() {
  const [isReloading, setIsReloading] = useState(false)

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[9999] p-4 text-center font-sans overflow-hidden">
      <img src={previewImg} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 z-0 pointer-events-none" />
      {/* Glow accent */}
      <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-xl px-6 gap-4">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/25 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
          <Wrench className="w-7 h-7 text-accent" />
        </div>

        <h1 className="text-white font-black uppercase tracking-widest text-2xl md:text-3xl drop-shadow-md">
          En Mantenimiento
        </h1>

        <p className="text-white/70 leading-relaxed text-sm md:text-base max-w-md">
          Estamos realizando actualizaciones técnicas en la interfaz del reproductor.
          Volvé a intentarlo en unos minutos.
        </p>

        {/* Legal note */}
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-left max-w-md w-full">
          <p className="text-white/40 text-[11px] leading-relaxed">
            <strong className="text-white/60">Recordatorio:</strong>{' '}
            MagLink TV es un reproductor multimedia. No aloja, almacena ni distribuye ningún
            canal de televisión ni contenido audiovisual en sus propios servidores. Los streams
            son transmitidos desde servidores externos de terceros, ajenos a MagLink TV.
          </p>
        </div>

        <button
          onClick={() => { setIsReloading(true); setTimeout(() => window.location.reload(), 300) }}
          className="mt-2 flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors border border-accent/30 shadow-[0_0_20px_rgba(0,243,255,0.1)]"
        >
          <RefreshCw size={14} className={isReloading ? 'animate-spin' : ''} />
          Reintentar
        </button>

        <p className="text-white/20 text-[10px] tracking-widest font-bold uppercase mt-4">
          © 2026 MagLink TV · Status: Maintenance
        </p>
      </div>
    </div>
  )
}
