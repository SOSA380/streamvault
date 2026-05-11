import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import previewLogo from './preview.webp'

export function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState(0) // 0=hidden, 1=visible, 2=out
  const [version, setVersion] = useState('3.0.0')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80)
    const t2 = setTimeout(() => setPhase(2), 2800)
    const t3 = setTimeout(() => onFinish(), 3400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  useEffect(() => {
    let active = true
    fetch(`/status.json?t=${Date.now()}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (active && d?.update?.version) setVersion(d.update.version) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: 'rgba(5, 5, 5, 0.9)',
        opacity: phase === 2 ? 0 : 1,
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: phase === 2 ? 'none' : 'all',
      }}
    >
      {/* Background Image (Unified) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img src={previewLogo} alt="" className="w-full h-full object-cover opacity-40 scale-105" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6 max-w-md w-full">
        {/* Brand Text */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black uppercase tracking-widest text-white">
            MagLink TV
          </h1>
          <span className="text-accent/60 text-xs font-bold tracking-[0.3em] uppercase mt-1">
            v{version}
          </span>
        </div>

        {/* Loading UI */}
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" strokeWidth={2.5} />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
            Cargando...
          </span>
        </div>
      </div>
    </div>
  )
}
