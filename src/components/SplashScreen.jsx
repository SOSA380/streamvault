import React, { useEffect, useState } from 'react'
import splashImage from '../preview-removebg-preview.png'

export function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(false)
  const [out, setOut] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 60)
    const t2 = setTimeout(() => setOut(true), 2800)
    const t3 = setTimeout(() => onFinish(), 3500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden
        transition-opacity duration-700 ease-in-out
        ${out ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Glow radial igual que MaintenanceScreen */}
      <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-10">

        {/* Logo grande */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(24px)',
            transition: 'opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <img
            src={splashImage}
            alt="MagLink TV"
            className="w-85 h-auto object-contain drop-shadow-[0_0_80px_rgba(0,243,255,0.5)]"
          />
        </div>

        {/* Versión */}
        <p
          className="text-white/25 text-xs font-bold uppercase tracking-widest -my-4"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease 0.2s',
          }}
        >
          1.3.1
        </p>

        {/* Spinner */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease 0.3s',
          }}
        >
          <svg
            className="animate-spin"
            width="26" height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <circle cx="13" cy="13" r="10" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
            <path
              d="M13 3 A10 10 0 0 1 23 13"
              stroke="#00E5FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 4px rgba(0,229,255,0.9))' }}
            />
          </svg>
        </div>

      </div>
    </div>
  )
}
