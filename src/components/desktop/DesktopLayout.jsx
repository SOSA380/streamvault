import { useRef, useEffect, useState, useCallback } from 'react'
import { useFocusable, FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation'
import { useDrag } from '@use-gesture/react'
import { DesktopPlayer } from './DesktopPlayer'

const SLOT_W = 200
const ROW_H   = 68
const HEAD_H  = 36

// ─── Device detection helpers (module-level, stable) ────────────────────────
function detectSmartTV() {
  const ua = navigator.userAgent
  return /SmartTV|WebOS|Tizen|Android TV|BRAVIA|Roku|SMART-TV|HbbTV|NetCast|DLNADOC|CE-HTML/i.test(ua)
    || (navigator.userAgentData?.platform === 'Android' && window.innerWidth >= 1280 && !('ontouchstart' in window))
}

function detectMobile() {
  return (typeof window.orientation !== 'undefined') || window.matchMedia('(any-pointer: coarse)').matches
}

// ─── TV Fullscreen Splash ────────────────────────────────────────────────────
function TVSplash({ onEnter }) {
  const { ref, focused } = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return { ref: useRef(null), focused: false }
    } catch { return { ref: { current: null }, focused: false } }
  })()

  useEffect(() => {
    const handleKey = (e) => {
      if (['Enter', ' ', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'MediaPlayPause'].includes(e.key)) {
        e.preventDefault()
        onEnter()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onEnter])

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black cursor-pointer"
      onClick={onEnter}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
            backgroundSize: '100% 3px'
          }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-8 px-12 text-center">
        {/* Logo — PNG preferido para máxima compatibilidad en TV browsers */}
        <picture>
          <source srcSet="/icon-512.png" type="image/png" />
          <source srcSet="/logo.webp" type="image/webp" />
          <img
            src="/icon-512.png"
            alt="MagLink TV"
            className="h-20 w-auto object-contain drop-shadow-[0_0_40px_rgba(0,243,255,0.4)]"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </picture>

        {/* Pulse ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border-2 border-accent/30 animate-ping" />
          <div className="absolute w-20 h-20 rounded-full border border-accent/20 animate-pulse" />
          <div className="w-16 h-16 rounded-full border-2 border-accent/60 flex items-center justify-center bg-accent/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent ml-1">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-white text-2xl font-black uppercase tracking-[0.3em]">
            Presioná OK para entrar
          </p>
          <p className="text-white/30 text-sm font-medium tracking-widest uppercase">
            Press any key or click to continue
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export function DesktopLayout({
  selectedChannel,
  channels, filteredChannels, epgData,
  searchQuery, setSearchQuery,
  activeFilter, setActiveFilter,
  onChannelClick,
  toggleFavorite, isFavorite,
}) {
  const logoScrollRef    = useRef(null)
  const gridScrollRef    = useRef(null)
  const isUserScrolling  = useRef(false)
  const scrollTimeout    = useRef(null)
  const controlsTimeout  = useRef(null)
  const lastFocusedKey   = useRef(null)
  // zona activa: 'filter' o 'channel' — para ArrowDown inteligente
  const focusZoneRef     = useRef('channel')

  const isTV      = detectSmartTV()
  const isMobile  = detectMobile() && !isTV

  // Smart TV: show splash until user interacts (needed for fullscreen API)
  const [tvSplashDone, setTvSplashDone] = useState(!isTV)

  const handleTVEnter = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch (e) {
      // Some TVs (WebOS, Tizen) don't support it — silently ignore
    }
    setTvSplashDone(true)
  }, [])

  // Auto-play eliminado: cambiar sección ya no interrumpe el canal en reproducción

  const [gridVisible, setGridVisible]   = useState(true)
  const [now, setNow]                   = useState(new Date())
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)
  const [volume, setVolume]             = useState(100)
  const [isMuted, setIsMuted]           = useState(false)
  const [typedNumber, setTypedNumber]   = useState('')
  const [isPortrait, setIsPortrait]     = useState(window.innerHeight > window.innerWidth)
  const prevIsPortrait                  = useRef(isPortrait)
  const zappingTimeout                  = useRef(null)

  // ── Orientation / resize ──
  useEffect(() => {
    const handleResize = () => {
      const nowPortrait  = window.innerHeight > window.innerWidth
      const wasPortrait  = prevIsPortrait.current
      setIsPortrait(nowPortrait)

      if (isMobile && wasPortrait !== nowPortrait) {
        if (!nowPortrait) {
          setGridVisible(false)
          document.documentElement.requestFullscreen().catch(() => {})
        } else {
          setGridVisible(true)
          document.fullscreenElement && document.exitFullscreen().catch(() => {})
        }
      }
      prevIsPortrait.current = nowPortrait
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

  const { ref, focusKey, focusSelf } = useFocusable({
    focusKey: 'DESKTOP_LAYOUT',
    trackChildren: true,
  })

  // ── Swipe gestures ──
  const bind = useDrag(({ movement: [, my], velocity: [, vy], direction: [, dy], last }) => {
    if (last && Math.abs(vy) > 0.5) {
      if (dy < 0) setGridVisible(true)
      if (dy > 0) setGridVisible(false)
    }
  }, { filterTaps: true })

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  // Show controls 5 s on channel change
  useEffect(() => {
    if (!selectedChannel) return
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => setShowControls(false), 5000)
  }, [selectedChannel])

  const toggleMute = useCallback(() => setIsMuted(prev => !prev), [])

  const handleVolumeChange = (e) => {
    const v = parseInt(e.target.value)
    setVolume(v)
    if (v > 0) setIsMuted(false)
  }

  const toggleFullscreen = useCallback(async (force) => {
    const shouldEnter = force !== undefined ? force : !document.fullscreenElement
    if (shouldEnter) {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen()
          if (isMobile && window.screen?.orientation) {
            await window.screen.orientation.lock('landscape').catch(() => {})
          }
        } catch (e) {}
      }
    } else {
      if (document.fullscreenElement) {
        try {
          isMobile && window.screen?.orientation?.unlock()
          await document.exitFullscreen()
        } catch (e) {}
      }
    }
  }, [isMobile])

  // ── Keyboard ──
  useEffect(() => {
    const handleKey = (e) => {
      const inInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA'

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          if (document.fullscreenElement) document.exitFullscreen()
          else if (gridVisible) setGridVisible(false)
          break

        case 'Backspace':
          // No interceptar si el usuario está escribiendo en un input
          if (inInput) return
          e.preventDefault()
          if (document.fullscreenElement) document.exitFullscreen()
          else setGridVisible(v => !v)
          break

        case 'f': case 'F':
          if (inInput) return
          e.preventDefault()
          toggleFullscreen()
          break

        case 'm': case 'M':
          if (inInput) return
          e.preventDefault()
          toggleMute()
          break

        case 'ArrowUp':
          if (!gridVisible) {
            // Abrir grilla con flecha arriba cuando está oculta
            e.preventDefault()
            setGridVisible(true)
            setShowControls(true)
          }
          // Cuando está visible dejar que la nav espacial maneje el movimiento
          break

        case 'ArrowDown':
          if (!gridVisible) break
          // Cerrar grilla solo si el foco está en la zona de filtros (no en canales)
          if (focusZoneRef.current === 'filter') {
            e.preventDefault()
            setGridVisible(false)
          }
          // Si está en canales, dejar que la nav espacial maneje el movimiento
          break

        case 'ArrowLeft':
          if (gridVisible || inInput) return
          e.preventDefault()
          setVolume(prev => Math.max(0, prev - 10))
          setShowControls(true)
          if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
          scrollTimeout.current = setTimeout(() => setShowControls(false), 3000)
          break

        case 'ArrowRight':
          if (gridVisible || inInput) return
          e.preventDefault()
          setVolume(prev => {
            const v = Math.min(100, prev + 10)
            if (v > 0) setIsMuted(false)
            return v
          })
          setShowControls(true)
          if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
          scrollTimeout.current = setTimeout(() => setShowControls(false), 3000)
          break
        default:
          if (!inInput && /^[0-9]$/.test(e.key)) {
            e.preventDefault()
            setTypedNumber(prev => {
              const next = (prev + e.key).slice(-3)
              
              if (zappingTimeout.current) clearTimeout(zappingTimeout.current)
              zappingTimeout.current = setTimeout(() => {
                const idx = parseInt(next, 10) - 1
                if (idx >= 0 && idx < filteredChannels.length) {
                  onChannelClick(filteredChannels[idx])
                  if (!isPortrait) setGridVisible(false)
                }
                setTypedNumber('')
              }, 1500)
              
              return next
            })
          }
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gridVisible, toggleMute, toggleFullscreen, filteredChannels, onChannelClick, isPortrait])

  useEffect(() => {
    if (gridVisible) {
      lastFocusedKey.current ? setFocus(lastFocusedKey.current) : focusSelf()
    }
  }, [gridVisible])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const handleGridScroll = (e) => {
    if (logoScrollRef.current && Math.abs(logoScrollRef.current.scrollTop - e.target.scrollTop) > 2) {
      logoScrollRef.current.scrollTop = e.target.scrollTop
    }
    isUserScrolling.current = true
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => { isUserScrolling.current = false }, 5000)
  }

  const handleLogoScroll = (e) => {
    if (gridScrollRef.current && Math.abs(gridScrollRef.current.scrollTop - e.target.scrollTop) > 2) {
      gridScrollRef.current.scrollTop = e.target.scrollTop
    }
    isUserScrolling.current = true
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => { isUserScrolling.current = false }, 5000)
  }

  const onFocusProg = ({ left, width, index, focusKey: fk }) => {
    if (fk) lastFocusedKey.current = fk
    focusZoneRef.current = 'channel'   // ← estamos en la lista de canales
    if (!gridScrollRef.current) return
    const gridContainer = gridScrollRef.current

    if (index !== undefined) {
      const rowHeight        = isTV ? 68 : isPortrait ? 58 : 52   // ← nuevo tamaño
      const itemTop          = index * rowHeight
      const containerHeight  = gridContainer.clientHeight
      const currentScrollTop = gridContainer.scrollTop
      if (itemTop < currentScrollTop || itemTop + rowHeight > currentScrollTop + containerHeight) {
        gridContainer.scrollTo({ top: itemTop - containerHeight / 2 + rowHeight / 2, behavior: 'smooth' })
      }
    }

    if (left !== undefined) {
      const containerWidth   = gridContainer.clientWidth
      const currentScrollLeft = gridContainer.scrollLeft
      const itemWidth        = width || 200
      if (left < currentScrollLeft || left + itemWidth > currentScrollLeft + containerWidth) {
        gridContainer.scrollTo({ left: left - containerWidth / 2 + itemWidth / 2, behavior: 'smooth' })
      }
    }
  }

  const startH     = now.getHours() - 1
  const startTime  = new Date(now); startTime.setHours(startH, 0, 0, 0)
  const msToPixels = (ms) => (ms / 1800000) * SLOT_W
  const nowOffset  = msToPixels(now - startTime)
  const timeSlots  = Array.from({ length: 24 }, (_, i) => {
    const t = new Date(startTime); t.setMinutes(t.getMinutes() + i * 30); return t
  })

  const currentPrograms  = selectedChannel ? (epgData[selectedChannel.tvgId || selectedChannel.id] || []) : []
  const currentProgIndex = currentPrograms.findIndex(p => p.start <= now && p.end > now)
  const currentProg      = currentProgIndex !== -1 ? currentPrograms[currentProgIndex] : null
  const nextProg         = currentProgIndex !== -1 ? currentPrograms[currentProgIndex + 1] : null
  const progressPercent  = currentProg ? ((now - currentProg.start) / (currentProg.end - currentProg.start)) * 100 : 0

  return (
    <FocusContext.Provider value={focusKey}>
      {/* TV Splash — shown only on Smart TV before first interaction */}
      {!tvSplashDone && <TVSplash onEnter={handleTVEnter} />}

      <div
        ref={ref}
        {...bind()}
        // tv-safe: add safe-area padding so TV bezels don't cut content
        className="fixed inset-0 bg-black overflow-hidden outline-none touch-none"
        style={isTV ? {
          padding: 'env(safe-area-inset-top, 24px) env(safe-area-inset-right, 32px) env(safe-area-inset-bottom, 24px) env(safe-area-inset-left, 32px)',
        } : undefined}
        onMouseMove={() => {
          setShowControls(true)
          if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
          controlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
        }}
      >
        <DesktopPlayer
          selectedChannel={selectedChannel}
          currentProg={currentProg}
          nextProg={nextProg}
          progressPercent={progressPercent}
          showControls={showControls}
          isMuted={isMuted}
          volume={volume}
          onToggleMute={toggleMute}
          onVolumeChange={handleVolumeChange}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          gridVisible={gridVisible}
          setGridVisible={setGridVisible}
          typedNumber={typedNumber}
          isTV={isTV}

          // Unified Grid Props
          channels={channels}
          filteredChannels={filteredChannels}
          epgData={epgData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          toggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          onChannelClick={(ch) => {
            onChannelClick(ch)
            if (!isPortrait) setGridVisible(false)
          }}
          now={now}
          startTime={startTime}
          timeSlots={timeSlots}
          nowOffset={nowOffset}
          msToPixels={msToPixels}
          SLOT_W={SLOT_W}
          onFocusProg={onFocusProg}
          onFocusZone={(zone) => { focusZoneRef.current = zone }}
          logoScrollRef={logoScrollRef}
          gridScrollRef={gridScrollRef}
          handleGridScroll={handleGridScroll}
          handleLogoScroll={handleLogoScroll}
        />
      </div>
    </FocusContext.Provider>
  )
}
