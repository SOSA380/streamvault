import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useDrag } from '@use-gesture/react'
import { DesktopPlayer } from './DesktopPlayer'
import { FILTERS } from './FilterBar'

const SLOT_W = 200

// ─── Device detection ─────────────────────────────────────────────────────────
function detectSmartTV() {
  const ua = navigator.userAgent
  return /SmartTV|WebOS|Tizen|Android TV|BRAVIA|Roku|SMART-TV|HbbTV|NetCast|DLNADOC|CE-HTML/i.test(ua)
    || (navigator.userAgentData?.platform === 'Android' && window.innerWidth >= 1280 && !('ontouchstart' in window))
}
function detectMobile() {
  return (typeof window.orientation !== 'undefined') || window.matchMedia('(any-pointer: coarse)').matches
}

// ─── TV Fullscreen Splash ─────────────────────────────────────────────────────
function TVSplash({ onEnter }) {
  useEffect(() => {
    const h = (e) => {
      if (['Enter', ' ', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault(); onEnter()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onEnter])

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black cursor-pointer" onClick={onEnter}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)', backgroundSize: '100% 3px' }} />
      </div>
      <div className="relative flex flex-col items-center gap-8 px-12 text-center">
        <picture>
          <source srcSet="/icon-512.png" type="image/png" />
          <img src="/icon-512.png" alt="MagLink TV" className="h-20 w-auto object-contain" onError={e => { e.target.style.display = 'none' }} />
        </picture>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border-2 border-accent/30 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-accent/60 flex items-center justify-center bg-accent/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent ml-1">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-white text-2xl font-black uppercase tracking-[0.3em]">Presioná OK para entrar</p>
          <p className="text-white/30 text-sm font-medium tracking-widest uppercase">Press any key or click to continue</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export function DesktopLayout({
  selectedChannel,
  channels, filteredChannels, epgData,
  searchQuery, setSearchQuery,
  activeFilter, setActiveFilter,
  onChannelClick,
  toggleFavorite, isFavorite, favoriteIds,
}) {
  const logoScrollRef   = useRef(null)
  const gridScrollRef   = useRef(null)
  const scrollTimeout   = useRef(null)
  const controlsTimeout = useRef(null)
  const searchRef       = useRef(null)

  const isTV     = useMemo(() => detectSmartTV(), [])
  const isMobile = useMemo(() => detectMobile() && !isTV, [isTV])

  const [tvSplashDone, setTvSplashDone] = useState(!isTV)
  const [gridVisible,  setGridVisible]  = useState(true)
  const [now,          setNow]          = useState(new Date())
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)
  const [volume,       setVolume]       = useState(100)
  const [isMuted,      setIsMuted]      = useState(false)
  const [typedNumber,  setTypedNumber]  = useState('')
  const [isPortrait,   setIsPortrait]   = useState(window.innerHeight > window.innerWidth)
  const prevIsPortrait                  = useRef(isPortrait)
  const zappingTimeout                  = useRef(null)

  // ── Navigation state ─────────────────────────────────────────────────────────
  // 'player' | 'filter' | 'channel'
  const [navZone,            setNavZone]            = useState('player')
  const [focusedChannelIndex, setFocusedChannelIndex] = useState(0)
  const [focusedFilterIndex,  setFocusedFilterIndex]  = useState(0)
  // How many filter tabs + 1 search box = total "filter items"
  const filterItemCount = useRef(0)

  // Keep filterItemCount in sync
  useEffect(() => {
    const hasFav = favoriteIds?.length > 0
    const visible = FILTERS.filter(f => f.id !== 'Favoritos' || hasFav)
    filterItemCount.current = visible.length + 1 // +1 for search
  }, [favoriteIds])

  // ── Clock ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  // ── Orientation ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const nowPortrait = window.innerHeight > window.innerWidth
      const wasPortrait = prevIsPortrait.current
      setIsPortrait(nowPortrait)
      if (isMobile && wasPortrait !== nowPortrait) {
        if (!nowPortrait) { setGridVisible(false); document.documentElement.requestFullscreen().catch(() => {}) }
        else              { setGridVisible(true);  document.fullscreenElement && document.exitFullscreen().catch(() => {}) }
      }
      prevIsPortrait.current = nowPortrait
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

  // ── Fullscreen ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen()
        if (isMobile && window.screen?.orientation) await window.screen.orientation.lock('landscape').catch(() => {})
      } catch (e) {}
    } else {
      try {
        isMobile && window.screen?.orientation?.unlock()
        await document.exitFullscreen()
      } catch (e) {}
    }
  }, [isMobile])

  const toggleMute = useCallback(() => setIsMuted(p => !p), [])

  const handleVolumeChange = useCallback((e) => {
    const v = parseInt(e.target.value)
    setVolume(v)
    if (v > 0) setIsMuted(false)
  }, [])

  // ── Show controls on mouse move ───────────────────────────────────────────
  const showControlsTemp = useCallback(() => {
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  useEffect(() => {
    if (!selectedChannel) return
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => setShowControls(false), 5000)
  }, [selectedChannel])

  // ── Scroll sync ───────────────────────────────────────────────────────────
  const handleGridScroll = useCallback((e) => {
    if (logoScrollRef.current && Math.abs(logoScrollRef.current.scrollTop - e.target.scrollTop) > 2) {
      logoScrollRef.current.scrollTop = e.target.scrollTop
    }
  }, [])

  const handleLogoScroll = useCallback((e) => {
    if (gridScrollRef.current && Math.abs(gridScrollRef.current.scrollTop - e.target.scrollTop) > 2) {
      gridScrollRef.current.scrollTop = e.target.scrollTop
    }
  }, [])

  // ── TV Splash ─────────────────────────────────────────────────────────────
  const handleTVEnter = useCallback(async () => {
    try { await document.documentElement.requestFullscreen() } catch (e) {}
    setTvSplashDone(true)
  }, [])

  // ── Swipe gesture (for mobile) ────────────────────────────────────────────
  const bind = useDrag(({ movement: [, my], velocity: [, vy], direction: [, dy], last }) => {
    if (last && Math.abs(vy) > 0.5) {
      if (dy < 0) { setGridVisible(true);  setNavZone('filter') }
      if (dy > 0) { setGridVisible(false); setNavZone('player') }
    }
  }, { filterTaps: true })

  // ── Open grid and focus filter zone ──────────────────────────────────────
  const openGrid = useCallback(() => {
    setGridVisible(true)
    setShowControls(true)
    setNavZone('filter')
  }, [])

  // ── KEYBOARD / REMOTE NAVIGATION ─────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      const inInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA'

      // ── Backspace / Escape ────────────────────────────────────────────────
      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (inInput) {
          // Exit search on Escape, or Backspace if empty
          if (e.key === 'Escape' || !searchQuery) {
            e.preventDefault()
            document.activeElement?.blur()
            setNavZone('filter')
          }
          return
        }
        e.preventDefault()
        if (navZone === 'channel') {
          // Go back to filter zone
          setNavZone('filter')
        } else if (navZone === 'filter' || gridVisible) {
          setGridVisible(false)
          setNavZone('player')
        } else if (document.fullscreenElement) {
          document.exitFullscreen()
        }
        return
      }

      // ── Enter / OK ────────────────────────────────────────────────────────
      if (e.key === 'Enter' || e.key === 'Return') {
        if (inInput) {
          // Confirm search and go to channels
          e.preventDefault()
          document.activeElement?.blur()
          setNavZone('channel')
          setFocusedChannelIndex(0)
          return
        }
        e.preventDefault()
        if (navZone === 'filter') {
          const hasFav = favoriteIds?.length > 0
          const visible = FILTERS.filter(f => f.id !== 'Favoritos' || hasFav)
          if (focusedFilterIndex < visible.length) {
            setActiveFilter(visible[focusedFilterIndex].id)
            setNavZone('channel')
          } else {
            // Search box — focus it
            searchRef.current?.focus()
          }
        } else if (navZone === 'channel') {
          const ch = filteredChannels[focusedChannelIndex]
          if (ch) {
            onChannelClick(ch)
            if (!isPortrait) { setGridVisible(false); setNavZone('player') }
          }
        } else {
          // player zone — open grid
          openGrid()
        }
        return
      }

      // ── Arrow keys ────────────────────────────────────────────────────────
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Numeric zapping
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
        // f = fullscreen, m = mute
        if (!inInput && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); toggleFullscreen() }
        if (!inInput && (e.key === 'm' || e.key === 'M')) { e.preventDefault(); toggleMute() }
        return
      }

      // From here: arrow keys
      if (inInput) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          document.activeElement?.blur()
          setNavZone('channel')
          setFocusedChannelIndex(0)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          document.activeElement?.blur()
          setNavZone('filter')
        }
        return
      }

      // ── Zone: player ──────────────────────────────────────────────────────
      if (navZone === 'player') {
        e.preventDefault()
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          openGrid()
        } else if (e.key === 'ArrowLeft') {
          setVolume(p => Math.max(0, p - 10)); showControlsTemp()
        } else if (e.key === 'ArrowRight') {
          setVolume(p => { const v = Math.min(100, p + 10); if (v > 0) setIsMuted(false); return v }); showControlsTemp()
        }
        return
      }

      // ── Zone: filter ──────────────────────────────────────────────────────
      if (navZone === 'filter') {
        const hasFav = favoriteIds?.length > 0
        const visible = FILTERS.filter(f => f.id !== 'Favoritos' || hasFav)
        const total = visible.length + 1 // +1 for search

        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          setFocusedFilterIndex(p => Math.max(0, p - 1))
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          setFocusedFilterIndex(p => Math.min(total - 1, p + 1))
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setNavZone('channel')
          // Make sure channel list is visible
          if (filteredChannels.length > 0) setFocusedChannelIndex(p => Math.max(0, p))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          // Close grid — go back to player
          setGridVisible(false)
          setNavZone('player')
        }
        return
      }

      // ── Zone: channel ─────────────────────────────────────────────────────
      if (navZone === 'channel') {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          if (focusedChannelIndex <= 0) {
            // At top of list — go back to filter zone
            setNavZone('filter')
          } else {
            setFocusedChannelIndex(p => p - 1)
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setFocusedChannelIndex(p => Math.min(filteredChannels.length - 1, p + 1))
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          // Left/right in channel zone: change volume (player is behind)
          e.preventDefault()
          if (e.key === 'ArrowLeft') {
            setVolume(p => Math.max(0, p - 10)); showControlsTemp()
          } else {
            setVolume(p => { const v = Math.min(100, p + 10); if (v > 0) setIsMuted(false); return v }); showControlsTemp()
          }
        }
        return
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [
    navZone, gridVisible, focusedChannelIndex, focusedFilterIndex,
    filteredChannels, onChannelClick, isPortrait, favoriteIds,
    setActiveFilter, toggleFullscreen, toggleMute, showControlsTemp, openGrid,
  ])

  // ── EPG data / time ───────────────────────────────────────────────────────
  const startH    = now.getHours() - 1
  const startTime = new Date(now); startTime.setHours(startH, 0, 0, 0)
  const msToPixels = useCallback((ms) => (ms / 1800000) * SLOT_W, [])
  const nowOffset  = msToPixels(now - startTime)
  const timeSlots  = useMemo(() => Array.from({ length: 24 }, (_, i) => {
    const t = new Date(startTime); t.setMinutes(t.getMinutes() + i * 30); return t
  }), [startTime.getTime()])

  const currentPrograms  = selectedChannel ? (epgData[selectedChannel.tvgId || selectedChannel.id] || []) : []
  const currentProgIndex = currentPrograms.findIndex(p => p.start <= now && p.end > now)
  const currentProg      = currentProgIndex !== -1 ? currentPrograms[currentProgIndex] : null
  const nextProg         = currentProgIndex !== -1 ? currentPrograms[currentProgIndex + 1] : null
  const progressPercent  = currentProg ? ((now - currentProg.start) / (currentProg.end - currentProg.start)) * 100 : 0

  // Sync focusedChannelIndex when selectedChannel changes externally
  useEffect(() => {
    if (!selectedChannel) return
    const idx = filteredChannels.findIndex(c => c.id === selectedChannel.id)
    if (idx !== -1) setFocusedChannelIndex(idx)
  }, [selectedChannel, filteredChannels])

  return (
    <>
      {!tvSplashDone && <TVSplash onEnter={handleTVEnter} />}

      <div
        {...bind()}
        className="fixed inset-0 bg-black overflow-hidden outline-none touch-none"
        style={isTV ? {
          padding: 'env(safe-area-inset-top, 24px) env(safe-area-inset-right, 32px) env(safe-area-inset-bottom, 24px) env(safe-area-inset-left, 32px)',
        } : undefined}
        onMouseMove={showControlsTemp}
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

          // Grid & filter props
          channels={channels}
          filteredChannels={filteredChannels}
          epgData={epgData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          toggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          favoriteIds={favoriteIds}
          onChannelClick={useCallback((ch) => {
            onChannelClick(ch)
            if (!isPortrait) setGridVisible(false)
          }, [onChannelClick, isPortrait, setGridVisible])}
          now={now}
          startTime={startTime}
          timeSlots={timeSlots}
          nowOffset={nowOffset}
          msToPixels={msToPixels}
          SLOT_W={SLOT_W}

          // Scroll refs
          logoScrollRef={logoScrollRef}
          gridScrollRef={gridScrollRef}
          handleGridScroll={handleGridScroll}
          handleLogoScroll={handleLogoScroll}

          // Navigation state (passed down to EPGGrid and FilterBar)
          navZone={navZone}
          focusedChannelIndex={focusedChannelIndex}
          setFocusedChannelIndex={setFocusedChannelIndex}
          focusedFilterIndex={focusedFilterIndex}
          searchRef={searchRef}

          // Callbacks
          onNavZone={setNavZone}
          openGrid={openGrid}
        />
      </div>
    </>
  )
}
