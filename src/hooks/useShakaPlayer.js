import { useEffect, useRef, useState } from 'react'
import shaka from 'shaka-player/dist/shaka-player.compiled'

export function useShakaPlayer(channel) {
  const videoRef    = useRef(null)
  const playerRef   = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState(null)
  const [hasSubtitles, setHasSubtitles] = useState(false)

  // Estado deseado de subtítulos — POR CANAL (se resetea al cambiar de canal)
  const subtitlesDesiredRef = useRef(false)
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false)

  const [currentStreamIndex, setCurrentStreamIndex] = useState(-1)

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const hideNativeTracks = () => {
    if (!videoRef.current?.textTracks) return
    Array.from(videoRef.current.textTracks).forEach(t => { t.mode = 'hidden' })
  }

  const applySubtitleState = (player) => {
    if (!player) return
    try {
      if (subtitlesDesiredRef.current) {
        const tracks = player.getTextTracks()
        if (tracks.length > 0) {
          const esTrack = tracks.find(t => t.language?.startsWith('es')) || tracks[0]
          if (esTrack) player.selectTextTrack(esTrack)
          player.setTextTrackVisibility(true)
        }
      } else {
        player.setTextTrackVisibility(false)
        hideNativeTracks()
      }
    } catch (e) {
      // Fallback nativo si la API de Shaka falla — respetar el estado deseado
      if (videoRef.current?.textTracks) {
        Array.from(videoRef.current.textTracks).forEach(t => {
          t.mode = subtitlesDesiredRef.current ? 'showing' : 'hidden'
        })
      }
    }
  }

  // ─── Init player (una vez) ────────────────────────────────────────────────
  useEffect(() => {
    shaka.polyfill.installAll()
    if (!shaka.Player.isBrowserSupported()) { setError('Browser not supported'); return }

    const initPlayer = async () => {
      if (playerRef.current) { await playerRef.current.destroy(); playerRef.current = null }
      if (!videoRef.current) return

      const player = new shaka.Player()
      await player.attach(videoRef.current)
      playerRef.current = player
      player.configure({ preferredAudioLanguage: 'es-419' })
      player.addEventListener('error', (event) => {
        console.error('Shaka error:', event.detail)
        if (event.detail.severity === 2) {
          setError(event.detail)
          window.dispatchEvent(new Event('check-status'))
        }
      })
      if (channel) await loadChannel(channel)
    }

    const timer = setTimeout(initPlayer, 50)
    return () => {
      clearTimeout(timer)
      if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Cambio de canal — RESET subtítulos siempre ──────────────────────────
  useEffect(() => {
    if (playerRef.current && channel) {
      subtitlesDesiredRef.current = false
      setSubtitlesEnabled(false)
      loadChannel(channel)
    }
  }, [channel]) // eslint-disable-line react-hooks/exhaustive-deps

  const onTracksChangedRef = useRef(null)
  const onNativeAddTrackRef = useRef(null)

  // ─── Manejadores de eventos ───────────────────────────────────────────────
  onTracksChangedRef.current = () => {
    if (!playerRef.current) return
    const tracks = playerRef.current.getTextTracks()
    setHasSubtitles(tracks.length > 0)
    if (!subtitlesDesiredRef.current) {
      try { playerRef.current.setTextTrackVisibility(false) } catch (_) {}
      hideNativeTracks()
    }
  }

  onNativeAddTrackRef.current = () => {
    if (!subtitlesDesiredRef.current) hideNativeTracks()
  }

  // ─── Cargar canal ─────────────────────────────────────────────────────────
  const loadChannel = async (ch, altIndex = -1, isManual = false) => {
    if (!playerRef.current) return
    setIsLoading(true)
    setError(null)
    setCurrentStreamIndex(altIndex)

    try { playerRef.current.removeEventListener('trackschanged', onTracksChangedRef.current) } catch (_) {}
    try {
      if (videoRef.current?.textTracks)
        videoRef.current.textTracks.removeEventListener('addtrack', onNativeAddTrackRef.current)
    } catch (_) {}

    try {
      // Determine which URL to use
      let url = ch.url
      let altObj = null;

      if (altIndex >= 0 && ch.urlAlt && Array.isArray(ch.urlAlt) && altIndex < ch.urlAlt.length) {
        altObj = ch.urlAlt[altIndex];
        url = altObj.url
      } else if (altIndex === -1 && !ch.url) {
        // If main URL is missing but alternatives exist, start with the first alternative
        if (ch.urlAlt && Array.isArray(ch.urlAlt) && ch.urlAlt.length > 0) {
          altObj = ch.urlAlt[0];
          url = altObj.url
          altIndex = 0
        }
      }

      if (!url) throw new Error("No URL found for channel")

      // Use alt properties if applicable
      let currentDrm = ch.drm;
      let currentHeaders = null;
      
      if (altObj) {
        if (altObj.drm) currentDrm = altObj.drm;
        if (altObj.headers) currentHeaders = altObj.headers;
      }

      // Interceptor para agregar headers si existieran
      if (currentHeaders) {
        playerRef.current.getNetworkingEngine().registerRequestFilter((type, request) => {
          if (type === shaka.net.NetworkingEngine.RequestType.MANIFEST || 
              type === shaka.net.NetworkingEngine.RequestType.SEGMENT) {
            
            const forbiddenHeaders = ['origin', 'referer', 'host', 'user-agent', 'keep-alive', 'content-length'];
            for (const [key, value] of Object.entries(currentHeaders)) {
              if (!forbiddenHeaders.includes(key.toLowerCase())) {
                request.headers[key] = value;
              }
            }
          }
        });
      } else {
        playerRef.current.getNetworkingEngine().clearAllRequestFilters();
      }

      playerRef.current.configure({
        preferredAudioLanguage: 'es-419',
        streaming: {
          bufferingGoal: 10,
          rebufferingGoal: 2,
          lowLatencyMode: true,
          alwaysStreamText: false,
        },
        ...(currentDrm?.keyId && currentDrm?.key
          ? { drm: { clearKeys: { [currentDrm.keyId]: currentDrm.key } } }
          : { drm: { clearKeys: {} } }
        )
      })

      // Forzar oculto ANTES de cargar
      try { playerRef.current.setTextTrackVisibility(false) } catch (_) {}
      hideNativeTracks()

      await playerRef.current.load(url)

      const tracks = playerRef.current.getTextTracks()
      setHasSubtitles(tracks.length > 0)
      applySubtitleState(playerRef.current)

      // Escuchar futuros cambios de tracks (streams HLS con tracks cargados tarde)
      playerRef.current.addEventListener('trackschanged', onTracksChangedRef.current)
      if (videoRef.current?.textTracks)
        videoRef.current.textTracks.addEventListener('addtrack', onNativeAddTrackRef.current)

      console.log('Channel loaded natively:', ch.name, altIndex >= 0 ? `(Alt ${altIndex + 1})` : '')
    } catch (e) {
      console.error('Error loading channel natively:', e)
      
      // Fallback logic (only if not manually selected)
      let nextAltIndex = altIndex + 1
      if (altIndex === -1) nextAltIndex = 0 // Start alternatives if main failed
      
      if (!isManual && ch.urlAlt && Array.isArray(ch.urlAlt) && nextAltIndex < ch.urlAlt.length) {
        console.log(`Fallback to alternative ${nextAltIndex + 1} for ${ch.name}...`)
        await loadChannel(ch, nextAltIndex)
      } else {
        setError(e)
        window.dispatchEvent(new Event('check-status'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const retry = () => { if (channel) loadChannel(channel) }

  const toggleSubtitles = () => {
    if (!playerRef.current) return
    const newState = !subtitlesDesiredRef.current
    subtitlesDesiredRef.current = newState
    setSubtitlesEnabled(newState)
    applySubtitleState(playerRef.current)
  }

  const changeStream = (index) => {
    if (channel) {
      loadChannel(channel, index, true)
    }
  }

  return { videoRef, isLoading, error, retry, hasSubtitles, subtitlesEnabled, toggleSubtitles, currentStreamIndex, changeStream }
}
