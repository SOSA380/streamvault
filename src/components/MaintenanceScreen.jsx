import { useState } from 'react'
import { RefreshCw, Wrench } from 'lucide-react'
import previewLogo from './preview.webp'

export function MaintenanceScreen() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'rgba(5, 5, 5, 0.9)' }}>

      {/* Background Image */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img src={previewLogo} alt="" className="w-full h-full object-cover opacity-40 scale-105" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6 max-w-md w-full">

        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)' }} />
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)' }}>
            <Wrench size={26} className="text-accent" />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h1 className="text-white text-2xl font-black uppercase tracking-widest">En Mantenimiento</h1>
          <p className="text-slate-200 text-sm font-medium leading-relaxed max-w-xs drop-shadow-md">
            Estamos realizando actualizaciones. Volvé en unos minutos.
          </p>
        </div>

        {/* Legal note */}
        <div className="w-full rounded-xl p-4 text-left"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <span className="text-white/60 font-semibold">Recordatorio: </span>
            MagLink TV es un reproductor multimedia. No aloja ni distribuye contenido. Los streams son transmitidos desde servidores externos de terceros.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => { setLoading(true); setTimeout(() => window.location.reload(), 300) }}
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-[12px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Reintentar
        </button>

        <p className="text-txt-3 text-[10px] tracking-widest uppercase font-medium">
          © 2026 MagLink TV
        </p>
      </div>
    </div>
  )
}
