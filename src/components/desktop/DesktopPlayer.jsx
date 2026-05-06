import { useEffect, useRef, useState, useCallback } from 'react'
import { useShakaPlayer } from '../../hooks/useShakaPlayer'
import { Volume2, VolumeX, Maximize, Minimize, Loader2, Search, Layers, Trophy, Film, Globe, Tv, Globe2, Music, BookOpen, X, Subtitles, PictureInPicture2, Info, Baby, Star, Settings2 } from 'lucide-react'
import { useFocusable, FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation'
import { useDrag } from '@use-gesture/react'
import previewImg from '../preview.webp'

// --- Categorías ---
const FILTERS = [
  { id: 'Todos',              label: 'Todos',              icon: Layers  },
  { id: 'Favoritos',          label: 'Favoritos',          icon: Star    },
  { id: 'Locales y noticias', label: 'Locales y noticias', icon: Globe   },
  { id: 'Películas',          label: 'Películas',          icon: Film    },
  { id: 'Series y shows',     label: 'Series y shows',     icon: Tv      },
  { id: 'Infantil',           label: 'Infantil',           icon: Baby    },
  { id: 'Deportes',           label: 'Deportes',           icon: Trophy  },
  { id: 'Documentales',       label: 'Documentales',       icon: BookOpen},
  { id: 'Música',             label: 'Música',             icon: Music   },
  { id: 'Internacional',      label: 'Internacionales',    icon: Globe2  },
]

// --- Universal Focusable Components ---
function NavButton({ children, onClick, focusKey, className, style, onFocus }) {
  const { ref, focused } = useFocusable({ focusKey, onEnterPress: onClick, onFocus })
  return (
    <button ref={ref} onClick={onClick} style={style} className={`${className} outline-none transition-all ${focused ? 'ring-2 ring-accent ring-offset-2 ring-offset-black scale-105 z-20' : ''}`}>
      {children}
    </button>
  )
}

function FilterButton({ f, active, onChange, isTV, onFocusZone }) {
  const { ref, focused } = useFocusable({
    focusKey: `FILTER-${f.id}`,
    onEnterPress: () => onChange(f.id),
    onFocus: () => {
      ref.current?.scrollIntoView({ inline: 'nearest', behavior: 'smooth' })
      onFocusZone?.('filter')
    }
  })
  const Icon = f.icon
  const isActive = active === f.id
  return (
    <button
      ref={ref}
      onClick={() => onChange(f.id)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all uppercase tracking-[0.05em] shrink-0 border font-black
        ${isTV ? 'text-[13px] px-4 py-2' : 'text-[10px]'}
        ${isActive
          ? 'bg-accent text-black shadow-lg shadow-accent/20 border-accent'
          : focused
            ? 'bg-accent/30 text-white border-accent/50 scale-105'
            : 'bg-white/5 text-white/30 border-white/5 hover:bg-white/10 hover:text-white/60'
        }`}
    >
      <Icon size={isTV ? 14 : 12} />{f.label}
    </button>
  )
}

function FocusableInput({ value, onChange, placeholder, onClear, isPortrait, isTV, onFocusZone }) {
  const { ref, focused } = useFocusable({
    focusKey: `SEARCH_INPUT_${isPortrait ? 'PORT' : 'LAND'}`,
    onEnterPress: () => { ref.current?.focus() },
    onFocus: () => { onFocusZone?.('filter') }
  })

  useEffect(() => {
    const handleSlash = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', handleSlash)
    return () => window.removeEventListener('keydown', handleSlash)
  }, [ref])

  return (
    <div className={`relative w-full ${focused ? 'ring-2 ring-accent rounded-xl' : ''}`}>
      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 text-white outline-none focus:border-accent/50 transition-all focus:bg-white/10
          ${isTV ? 'py-3 text-[15px]' : isPortrait ? 'py-2.5 text-[12px]' : 'py-2 text-[11px]'}`}
      />
      {value && (
        <button onClick={onClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-white">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Logo column cell ────────────────────────────────────────────────────────
function LogoCell({ ch, index, onChannelClick, onFocus, isPortrait, selected, isTV, onFocusZone, isFavorite }) {
  const rowH = isTV ? 68 : isPortrait ? 58 : 52
  const [logoError, setLogoError] = useState(false)
  const { ref, focused } = useFocusable({
    focusKey: `LOGO-${ch.id}`,
    onEnterPress: () => onChannelClick(ch),
    onFocus: (layoutProps) => {
      onFocus({ ...layoutProps, index, focusKey: `LOGO-${ch.id}` })
      onFocusZone?.('channel')
    }
  })

  return (
    <div
      ref={ref}
      onClick={() => onChannelClick(ch)}
      style={{ height: rowH }}
      className={`
        w-[100px] shrink-0 flex flex-col items-center justify-center gap-0.5 relative cursor-pointer
        border-r transition-all duration-150 select-none
        ${selected
          ? 'bg-accent/10 border-accent/30 border-l-2 border-l-accent'
          : focused
            ? 'bg-accent/20 border-accent/60 border-l-2 border-l-accent z-50'
            : 'bg-[#0d0d0e] border-white/8 hover:bg-white/5'
        }
      `}
    >
      {/* Favorite star badge */}
      {isFavorite(ch.id) && (
        <div className="absolute top-1 right-1.5 text-accent">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
      )}

      {/* Channel number */}
      <span className={`font-black text-white/20 leading-none ${isTV ? 'text-[9px]' : 'text-[7px]'}`}>
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Logo or initials fallback */}
      {!logoError ? (
        <img
          src={ch.logo}
          alt={ch.name}
          className={`object-contain transition-opacity
            ${isTV ? 'max-w-[44px] max-h-8' : 'max-w-[38px] max-h-6'}
            ${selected || focused ? 'opacity-100' : 'opacity-70'}
          `}
          onError={() => setLogoError(true)}
        />
      ) : (
        <div className={`flex items-center justify-center rounded bg-white/10 text-white/60 font-black uppercase
          ${isTV ? 'text-[10px] w-10 h-7' : 'text-[8px] w-8 h-5'}`}>
          {ch.name.slice(0, 3)}
        </div>
      )}
    </div>
  )
}

// ─── EPG program button ───────────────────────────────────────────────────────
function EPGProgBtn({ prog, ch, onClick, onFocus, left, width, isNow, focusKey: fk, index, isTV, onFocusZone }) {
  const { ref, focused } = useFocusable({
    focusKey: fk,
    onEnterPress: () => onClick(ch),
    onFocus: (layoutProps) => {
      onFocus({ ...layoutProps, left, width, index, focusKey: fk })
      onFocusZone?.('channel')
    }
  })

  const startStr = prog ? prog.start.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''

  return (
    <div
      ref={ref}
      onClick={() => onClick(ch)}
      style={{ left: left + 2, width: width - 4 }}
      className={`
        absolute top-[3px] bottom-[3px] rounded-lg px-3 flex flex-col justify-center
        border transition-all text-left overflow-hidden cursor-pointer
        ${isNow
          ? 'bg-accent/10 border-accent/25'
          : 'bg-white/[0.04] border-white/[0.06]'
        }
        ${focused ? 'border-accent bg-white/20 ring-1 ring-accent z-30 shadow-[0_0_12px_rgba(0,243,255,0.15)]' : 'hover:bg-white/10'}
      `}
    >
      <p className={`text-white font-black truncate leading-tight ${isTV ? 'text-[14px]' : 'text-[11px]'}`}>
        {prog ? prog.title : ch.name}
      </p>
      {prog && width > 120 && (
        <p className={`text-white/30 truncate font-bold tracking-widest uppercase mt-0.5 ${isTV ? 'text-[10px]' : 'text-[8px]'}`}>
          {startStr} · {prog.category || 'General'}
        </p>
      )}
    </div>
  )
}

// ─── EPG row ─────────────────────────────────────────────────────────────────
function EPGProgramsOnlyRow({ channel, index, programs, onChannelClick, startTime, msToPixels, now, SLOT_W, onFocusProg, isPortrait, selected, isTV, onFocusZone }) {
  const rowH = isTV ? 68 : isPortrait ? 58 : 52
  return (
    <div
      className={`flex shrink-0 relative transition-colors duration-150
        ${selected ? 'bg-accent/[0.04] border-b border-accent/20' : 'border-b border-white/[0.05] bg-transparent'}
      `}
      style={{ height: rowH }}
    >
      <div className="relative flex-1">
        {programs.length === 0 && (
          <EPGProgBtn
            prog={null} ch={channel} onClick={onChannelClick} onFocus={onFocusProg}
            left={2} width={SLOT_W * 24 - 4} isNow={false}
            focusKey={`PROG-${channel.id}-EMPTY`} index={index} isTV={isTV}
            onFocusZone={onFocusZone}
          />
        )}
        {programs.map((prog, i) => {
          const left  = msToPixels(prog.start - startTime)
          const width = msToPixels(prog.end - prog.start)
          if (left + width < 0 || left > SLOT_W * 24) return null
          return (
            <EPGProgBtn
              key={i} prog={prog} ch={channel} onClick={onChannelClick} onFocus={onFocusProg}
              left={left} width={width} isNow={prog.start <= now && prog.end > now}
              focusKey={`PROG-${channel.id}-${i}`} index={index} isTV={isTV}
              onFocusZone={onFocusZone}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── PiP Hook ─────────────────────────────────────────────────────────────────
function usePiP(videoRef) {
  const [isPiP, setIsPiP] = useState(false)
  const supported = typeof document !== 'undefined' && !!document.pictureInPictureEnabled

  useEffect(() => {
    const onEnter = () => setIsPiP(true)
    const onLeave = () => setIsPiP(false)
    document.addEventListener('enterpictureinpicture', onEnter)
    document.addEventListener('leavepictureinpicture', onLeave)
    return () => {
      document.removeEventListener('enterpictureinpicture', onEnter)
      document.removeEventListener('leavepictureinpicture', onLeave)
    }
  }, [])

  const togglePiP = useCallback(async () => {
    if (!videoRef.current || !supported) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch (e) {
      console.warn('PiP error:', e)
    }
  }, [videoRef, supported])

  return { isPiP, togglePiP, supported }
}

// --- Main DesktopPlayer Component ---

export function DesktopPlayer({ ...props }) {
  const {
    selectedChannel, isFullscreen, gridVisible, setGridVisible, onToggleFullscreen,
    filteredChannels, nowOffset, activeFilter, currentProg, nextProg, progressPercent,
    showControls, isMuted, volume, onToggleMute, onVolumeChange, epgData,
    searchQuery, setSearchQuery, setActiveFilter, onChannelClick,
    now, startTime, timeSlots, msToPixels, SLOT_W, onFocusProg,
    gridScrollRef, logoScrollRef, handleGridScroll, handleLogoScroll,
    onFocusZone, toggleFavorite, isFavorite, typedNumber,
    isTV = false,
  } = props

  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth)
  const { videoRef, isLoading, error, retry, hasSubtitles, subtitlesEnabled, toggleSubtitles, currentStreamIndex, changeStream } = useShakaPlayer(selectedChannel)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)

  useEffect(() => { setShowOptionsMenu(false) }, [selectedChannel])
  const { isPiP, togglePiP, supported: pipSupported } = usePiP(videoRef)

  const { ref: playerRef, focusKey } = useFocusable({ focusKey: 'PLAYER_ROOT', trackChildren: true })
  const scrollTimeoutRef = useRef(null)

  const scrollToNow = useCallback(() => {
    if (gridScrollRef?.current && nowOffset && (gridVisible || isPortrait)) {
      gridScrollRef.current.scrollTo({ left: nowOffset - 100, behavior: 'smooth' })
    }
  }, [gridScrollRef, nowOffset, gridVisible, isPortrait])

  const handleManualScroll = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => { scrollToNow() }, 3000)
  }

  useEffect(() => {
    const handleOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth)
    window.addEventListener('resize', handleOrientation)
    return () => {
      window.removeEventListener('resize', handleOrientation)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      videoRef.current.volume = volume / 100
    }
  }, [isMuted, volume, videoRef])

  useEffect(() => { scrollToNow() }, [nowOffset, gridVisible, isPortrait, scrollToNow])

  // RE-FOCUS + SCROLL TO SELECTED CHANNEL
  // Incluye selectedChannel?.id para que al cambiar canal en portrait,
  // el foco se mueva al nuevo canal y no quede marcado el anterior
  useEffect(() => {
    if (!gridVisible && !isPortrait) return

    const inList = selectedChannel && filteredChannels.find(c => c.id === selectedChannel.id)
    const targetCh = inList ? selectedChannel : filteredChannels[0]
    const targetKey = targetCh ? `LOGO-${targetCh.id}` : null
    if (!targetKey) return

    let attempts = 0
    const tryFocus = () => {
      try {
        setFocus(targetKey)
      } catch (e) {
        if (attempts++ < 4) setTimeout(tryFocus, 100)
      }
    }

    const t = setTimeout(() => {
      tryFocus()
      if (targetCh && logoScrollRef?.current) {
        const idx = filteredChannels.findIndex(c => c.id === targetCh.id)
        if (idx !== -1) {
          const rowH = isTV ? 68 : isPortrait ? 58 : 52
          const top = idx * rowH
          const containerH = logoScrollRef.current.clientHeight
          logoScrollRef.current.scrollTo({ top: top - containerH / 2 + rowH / 2, behavior: 'smooth' })
        }
      }
    }, 350)

    return () => clearTimeout(t)
    // selectedChannel?.id añadido para corregir: canal anterior queda marcado en portrait
  }, [gridVisible, isPortrait, activeFilter, selectedChannel?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Gestures
  const bindPlayerSwipe = useDrag(({ last, direction: [, dy], distance: [, distY] }) => {
    if (!isPortrait && last && dy < 0 && distY > 40 && !gridVisible) setGridVisible(true)
  }, { axis: 'y', filterTaps: true })

  const bindDrawerSwipe = useDrag(({ last, direction: [, dy], distance: [, distY] }) => {
    if (!isPortrait && last && dy > 0 && distY > 40 && gridVisible && (!gridScrollRef.current || gridScrollRef.current.scrollTop === 0)) {
      setGridVisible(false)
    }
  }, { axis: 'y', filterTaps: true })

  const openTerms = () => window.dispatchEvent(new Event('open-terms'))

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={playerRef} className="fixed inset-0 bg-[#0a0a0b] overflow-hidden outline-none flex flex-col touch-none">

        {/* --- TOP HEADER FOR PORTRAIT (Search & Filters) --- */}
        {isPortrait && (
          <div className="flex flex-col shrink-0 bg-[#0a0a0b] z-50 pt-safe">
            <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
              <div className="flex-1">
                <FocusableInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar canal..." onClear={() => setSearchQuery('')} isPortrait={true} isTV={isTV} onFocusZone={onFocusZone} />
              </div>
              {/* Botón Términos — accesible aunque el modal de bienvenida esté cerrado */}
              <button
                onClick={openTerms}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
                title="Términos y condiciones"
              >
                <Info size={14} />
              </button>
            </div>
            {!searchQuery && (
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide shrink-0 px-4 py-2.5 border-b border-white/5 shadow-md">
                {FILTERS.map(f => (
                  <FilterButton key={f.id} f={f} active={activeFilter} onChange={setActiveFilter} isTV={isTV} onFocusZone={onFocusZone} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- VIDEO AREA --- */}
        <div
          {...(!isPortrait ? bindPlayerSwipe() : {})}
          className={`
            ${isPortrait ? 'relative w-full aspect-video shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-20' : 'absolute inset-0 z-0'}
            bg-black flex items-center justify-center overflow-hidden transition-all duration-300
          `}
        >
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20 p-4 text-center">
              <img src={previewImg} className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 z-0 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-6 gap-2">
                <div className={`mb-2 rounded-full border border-white/10 bg-white/5 flex items-center justify-center ${isPortrait ? 'w-8 h-8' : isTV ? 'w-20 h-20' : 'w-12 h-12'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-white/50 ${isPortrait ? 'w-4 h-4' : isTV ? 'w-10 h-10' : 'w-6 h-6'}`}>
                    <path d="M3 3l18 18M10.5 6H19a2 2 0 012 2v8m-2.5 2.5H5a2 2 0 01-2-2V8a2 2 0 012-2h.5"/>
                  </svg>
                </div>
                <h3 className={`text-white font-black uppercase tracking-widest ${isPortrait ? 'text-[11px]' : isTV ? 'text-4xl' : 'text-2xl md:text-3xl'}`}>
                  Señal no disponible
                </h3>
                <p className={`text-white/60 leading-relaxed ${isPortrait ? 'text-[9px]' : isTV ? 'text-lg mt-2' : 'text-sm mt-1'}`}>
                  Este stream proviene de servidores externos ajenos a MagLink TV y no pudo cargarse en este momento. Probá otro canal o intentá de nuevo más tarde.
                </p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full object-contain z-10 pointer-events-none"
            autoPlay
            playsInline
            muted
          />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 backdrop-blur-sm">
              <Loader2 className={`text-accent animate-spin ${isTV ? 'w-14 h-14' : 'w-8 h-8'}`} />
            </div>
          )}

          {/* Zapping Number Indicator */}
          {typedNumber && (
            <div className={`absolute top-6 right-8 z-[100] flex items-center gap-4 bg-black/50 backdrop-blur-3xl border border-white/10 rounded-[35px] shadow-2xl ${isTV ? 'px-10 py-4' : 'px-7 py-3'}`}>
              <div className="flex flex-col items-start">
                <span className={`text-white/40 font-black uppercase tracking-widest leading-none ${isTV ? 'text-[13px]' : 'text-[9px]'}`}>CANAL</span>
                <span className={`font-black text-accent leading-none mt-0.5 ${isTV ? 'text-5xl' : 'text-3xl'}`}>{typedNumber}</span>
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div className={`absolute inset-0 transition-opacity duration-500 z-30 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-auto`}>
            
            {/* Options Menu Overlay */}
            {showOptionsMenu && selectedChannel?.urlAlt && selectedChannel.urlAlt.length > 0 && (
              <div className={`absolute bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-50 min-w-[120px] ${isTV ? 'bottom-[120px] right-12' : isPortrait ? 'bottom-16 right-3' : 'bottom-[100px] right-8'}`}>
                <NavButton
                  focusKey="STREAM_OPT_MAIN"
                  onClick={() => { changeStream(-1); setShowOptionsMenu(false); }}
                  className={`px-3 py-2 rounded-lg text-left text-[12px] md:text-sm font-bold transition-colors ${currentStreamIndex === -1 ? 'bg-accent text-black shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                >
                  Opción 1
                </NavButton>
                {selectedChannel.urlAlt.map((alt, idx) => (
                  <NavButton
                    key={idx}
                    focusKey={`STREAM_OPT_${idx}`}
                    onClick={() => { changeStream(idx); setShowOptionsMenu(false); }}
                    className={`px-3 py-2 rounded-lg text-left text-[12px] md:text-sm font-bold transition-colors ${currentStreamIndex === idx ? 'bg-accent text-black shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                  >
                    Opción {idx + 2}
                  </NavButton>
                ))}
              </div>
            )}

            {isPortrait ? (
              <>
                {/* Top Right Controls — iconos más chicos en portrait */}
                <div className="absolute top-3 right-3 flex gap-2.5">
                  {selectedChannel && (
                    <NavButton onClick={() => toggleFavorite(selectedChannel.id)} focusKey="FAV_MOBILE" className={`p-1.5 backdrop-blur-xl rounded-full border transition-colors shadow-lg ${isFavorite(selectedChannel.id) ? 'bg-accent/20 text-accent border-accent/50' : 'bg-black/40 text-white border-white/10'}`}>
                      <Star size={15} fill={isFavorite(selectedChannel.id) ? 'currentColor' : 'none'} />
                    </NavButton>
                  )}
                  {hasSubtitles && (
                    <NavButton onClick={toggleSubtitles} focusKey="CC_MOBILE" className={`p-1.5 backdrop-blur-xl rounded-full border transition-colors shadow-lg ${subtitlesEnabled ? 'bg-accent/20 text-accent border-accent/50' : 'bg-black/40 text-white border-white/10'}`}>
                      <Subtitles size={15} />
                    </NavButton>
                  )}
                  {selectedChannel?.urlAlt && selectedChannel.urlAlt.length > 0 && (
                    <NavButton onClick={() => setShowOptionsMenu(!showOptionsMenu)} focusKey="OPTS_MOBILE" className={`p-1.5 backdrop-blur-xl rounded-full border transition-colors shadow-lg ${showOptionsMenu ? 'bg-accent/20 text-accent border-accent/50' : 'bg-black/40 text-white border-white/10'}`}>
                      <Settings2 size={15} />
                    </NavButton>
                  )}
                  {pipSupported && (
                    <NavButton onClick={togglePiP} focusKey="PIP_MOBILE" className={`p-1.5 backdrop-blur-xl rounded-full border transition-colors shadow-lg ${isPiP ? 'bg-accent/20 text-accent border-accent/50' : 'bg-black/40 text-white border-white/10'}`}>
                      <PictureInPicture2 size={15} />
                    </NavButton>
                  )}
                  <NavButton onClick={onToggleMute} focusKey="MUTE_MOBILE" className="p-1.5 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 shadow-lg">
                    {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </NavButton>
                </div>

                {/* Bottom Right Fullscreen */}
                <div className="absolute bottom-3 right-3">
                  <NavButton onClick={() => onToggleFullscreen()} focusKey="FULLSCREEN_MOBILE" className="p-1.5 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 shadow-lg">
                    {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                  </NavButton>
                </div>
              </>
            ) : (
              /* Landscape / TV controls bar */
              <div className={`absolute flex justify-center ${isTV ? 'bottom-10 left-12 right-12' : 'bottom-8 left-8 right-8'}`}>
                <div className={`w-full max-w-5xl flex items-center bg-black/50 backdrop-blur-3xl border border-white/10 rounded-[35px] shadow-2xl gap-8
                  ${isTV ? 'p-3 px-12 min-h-[100px]' : 'p-1.5 px-10 min-h-[86px]'}`}>

                  <div className={`flex items-center justify-center shrink-0 ${isTV ? 'h-16 w-auto' : 'h-12 w-auto'}`}>
                    {selectedChannel?.logo && <img src={selectedChannel.logo} className="max-h-full w-auto object-contain drop-shadow-lg" />}
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h2 className={`font-black text-white uppercase italic truncate drop-shadow-md leading-normal pb-1 w-full ${isTV ? 'text-xl' : 'text-lg'}`}>
                      {currentProg ? currentProg.title : 'SIN INFORMACION'}
                    </h2>
                    <div className="flex flex-col mt-1.5">
                      <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-accent shadow-[0_0_15px_#00f3ff] transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        {nextProg && <p className={`text-white/30 font-bold uppercase tracking-widest truncate ${isTV ? 'text-[12px]' : 'text-[9px]'}`}>Sig: {nextProg.title}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 h-full">
                    <div className="flex items-center gap-4">
                      {selectedChannel && (
                        <NavButton onClick={() => toggleFavorite(selectedChannel.id)} focusKey="FAV_DESKTOP" className={`p-3 transition-all flex items-center justify-center rounded-full ${isFavorite(selectedChannel.id) ? 'text-accent bg-accent/10' : 'text-white/50 hover:text-white'}`}>
                          <Star size={isTV ? 24 : 20} fill={isFavorite(selectedChannel.id) ? 'currentColor' : 'none'} />
                        </NavButton>
                      )}
                      {hasSubtitles && (
                        <NavButton onClick={toggleSubtitles} focusKey="CC_DESKTOP" className={`p-3 transition-all flex items-center justify-center rounded-full ${subtitlesEnabled ? 'text-accent bg-accent/10' : 'text-white/50 hover:text-white'}`}>
                          <Subtitles size={isTV ? 24 : 20} />
                        </NavButton>
                      )}
                      {selectedChannel?.urlAlt && selectedChannel.urlAlt.length > 0 && (
                        <NavButton onClick={() => setShowOptionsMenu(!showOptionsMenu)} focusKey="OPTS_DESKTOP" className={`p-3 transition-all flex items-center justify-center rounded-full ${showOptionsMenu ? 'text-accent bg-accent/10' : 'text-white/50 hover:text-white'}`}>
                          <Settings2 size={isTV ? 24 : 20} />
                        </NavButton>
                      )}
                      {pipSupported && !isTV && (
                        <NavButton onClick={togglePiP} focusKey="PIP_DESKTOP" className={`p-3 transition-all flex items-center justify-center rounded-full ${isPiP ? 'text-accent bg-accent/10' : 'text-white/50 hover:text-white'}`}>
                          <PictureInPicture2 size={20} />
                        </NavButton>
                      )}
                      <NavButton onClick={onToggleMute} focusKey="MUTE_DESKTOP" className="p-3 text-white/50 hover:text-white transition-all flex items-center justify-center">
                        {isMuted || volume === 0 ? <VolumeX size={isTV ? 24 : 20} /> : <Volume2 size={isTV ? 24 : 20} />}
                      </NavButton>
                    </div>
                    <div className="relative w-28 h-1.5 bg-white/15 rounded-full overflow-hidden flex items-center">
                      <div className="absolute top-0 left-0 h-full bg-white shadow-[0_0_10px_white]" style={{ width: `${volume}%` }} />
                      <input type="range" min="0" max="100" value={volume} onChange={onVolumeChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    </div>
                    {!isTV && (
                      <NavButton onClick={() => onToggleFullscreen()} focusKey="FULLSCREEN_DESKTOP" className="p-3 text-white/50 hover:text-white transition-all flex items-center justify-center ml-2">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                      </NavButton>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- INFO BARS & EPG GRID --- */}
        <div
          {...(!isPortrait ? bindDrawerSwipe() : {})}
          className={`
            flex flex-col bg-[#0a0a0b] overflow-hidden
            ${isPortrait
              ? 'flex-1 relative z-10'
              : `absolute bottom-0 left-0 right-0 z-[110] h-[55vh] max-h-[500px] rounded-t-3xl border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${gridVisible ? 'translate-y-0' : 'translate-y-[105%]'}`
            }
          `}
        >
          {/* Info bar superior (Solo en portrait) */}
          {isPortrait && (
            <div className="flex flex-col shrink-0 px-5 py-4 bg-[#0d0d0e] border-b border-white/5 shadow-md">
              <div className="flex gap-4 items-center">
                <div className="flex items-center justify-center w-16 h-16 shrink-0 overflow-hidden">
                  {selectedChannel?.logo && <img src={selectedChannel.logo} className="w-full h-full object-contain drop-shadow-md" alt="Channel" />}
                </div>
                <div className="flex flex-col flex-1 min-w-0 justify-center gap-1">
                  <span className="text-white text-[15px] font-black italic tracking-wide drop-shadow-sm truncate pb-0.5 leading-normal w-full">{selectedChannel?.name}</span>
                  <span className="text-white/90 text-[12px] font-medium truncate pb-0.5 leading-normal">Ahora: {currentProg ? currentProg.title : 'Sin información'}</span>
                  <div className="w-full h-[3px] bg-white/10 my-0.5 overflow-hidden rounded-full shadow-inner">
                    <div className="h-full bg-accent shadow-[0_0_10px_#00f3ff] transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-white/50 text-[11px] font-medium truncate">Después: {nextProg ? nextProg.title : 'Sin información'}</span>
                </div>
              </div>
            </div>
          )}

          {/* HEADER FOR LANDSCAPE DRAWER (Filters + Search + Terms) */}
          {!isPortrait && (
            <div className="flex items-center justify-between shrink-0 px-8 py-3 bg-[#0d0d0e] border-b border-white/5">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 pr-4">
                {FILTERS.map(f => (
                  <FilterButton
                    key={f.id} f={f} active={activeFilter}
                    onChange={setActiveFilter} isTV={isTV}
                    onFocusZone={onFocusZone}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 shrink-0 border-l border-white/10 pl-5">
                <div className="w-56">
                  <FocusableInput
                    value={searchQuery} onChange={setSearchQuery}
                    placeholder="Buscar canal..." onClear={() => setSearchQuery('')}
                    isPortrait={false} isTV={isTV} onFocusZone={onFocusZone}
                  />
                </div>
                <button
                  onClick={openTerms}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors shrink-0"
                  title="Términos y condiciones"
                >
                  <Info size={14} />
                </button>
              </div>
            </div>
          )}

          {/* EPG GRID */}
          <div className="flex-1 flex overflow-hidden bg-[#09090a]">
            {/* Logo column */}
            <div
              ref={logoScrollRef}
              onScroll={handleLogoScroll}
              className="w-[100px] shrink-0 bg-[#0d0d0e] border-r border-white/[0.08] z-[60] overflow-y-auto scrollbar-hide"
            >
              <div className="flex flex-col">
                <div className={`border-b border-white/[0.08] bg-[#09090a] shrink-0 flex items-center justify-center ${isTV ? 'h-12' : 'h-10'}`}>
                  <span className={`font-black text-white/15 uppercase tracking-widest ${isTV ? 'text-[10px]' : 'text-[8px]'}`}>CH</span>
                </div>
                {filteredChannels.map((ch, idx) => (
                  <LogoCell
                    key={ch.id} ch={ch} index={idx}
                    onChannelClick={(c) => { onChannelClick(c); if (!isPortrait) setGridVisible(false) }}
                    onFocus={onFocusProg}
                    isPortrait={isPortrait}
                    selected={selectedChannel?.id === ch.id}
                    isTV={isTV}
                    onFocusZone={onFocusZone}
                    isFavorite={isFavorite}
                  />
                ))}
              </div>
            </div>

            {/* Program grid */}
            <div
              ref={gridScrollRef}
              onScroll={(e) => { handleGridScroll(e); handleManualScroll() }}
              className="flex-1 overflow-auto scrollbar-hide"
            >
              <div className="relative" style={{ width: SLOT_W * 24 }}>
                {/* Time header */}
                <div className={`sticky top-0 z-40 flex bg-[#09090a]/95 backdrop-blur-md border-b border-white/[0.08] ${isTV ? 'h-12' : 'h-10'}`}>
                  {timeSlots.map((t, i) => (
                    <div
                      key={i}
                      style={{ width: SLOT_W }}
                      className={`shrink-0 flex items-center px-3 font-black text-white/25 border-l border-white/[0.04] uppercase tracking-[0.12em] ${isTV ? 'text-[12px]' : 'text-[9px]'}`}
                    >
                      {t.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  ))}
                </div>

                {/* Now line */}
                <div
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={{ left: nowOffset, width: 2 }}
                >
                  <div className="w-full h-full bg-accent shadow-[0_0_8px_2px_rgba(0,243,255,0.6)]" />
                  <div
                    className="absolute top-0 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: '6px solid rgb(0,243,255)',
                    }}
                  />
                </div>

                {/* Rows */}
                <div className="flex flex-col pb-10">
                  {filteredChannels.map((ch, idx) => (
                    <EPGProgramsOnlyRow
                      key={ch.id} channel={ch} index={idx}
                      programs={epgData[ch.tvgId || ch.id] || []}
                      onChannelClick={(c) => { onChannelClick(c); if (!isPortrait) setGridVisible(false) }}
                      startTime={startTime} msToPixels={msToPixels} now={now}
                      SLOT_W={SLOT_W} onFocusProg={onFocusProg}
                      isPortrait={isPortrait} selected={selectedChannel?.id === ch.id}
                      isTV={isTV} onFocusZone={onFocusZone}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FocusContext.Provider>
  )
}
