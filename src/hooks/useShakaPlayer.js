import { useEffect, useRef, useState } from 'react'
import shaka from 'shaka-player/dist/shaka-player.compiled'

// ─── Shaka config optimizada para IPTV ────────────────────────────────────────
const SHAKA_CONFIG = {
  preferredAudioLanguage: 'es-419',
  streaming: {
    bufferingGoal: 6,
    rebufferingGoal: 1.5,
    bufferBehind: 8,
    lowLatencyMode: true,
    // Fail fast: no reintentar segmentos en loop
    stallEnabled: true,
    stallThreshold: 3,
    stallSkip: 0.1,
    retryParameters: {
      maxAttempts: 1,
      baseDelay: 500,
      backoffFactor: 1,
      fuzzFactor: 0,
      timeout: 8000,
    },
  },

  manifest: {
    retryParameters: {
      maxAttempts: 1,
      baseDelay: 500,
      backoffFactor: 1,
      fuzzFactor: 0,
      timeout: 8000,
    },
  },
  drm: { clearKeys: {} },
}

// ─── Helper: detectar error de autenticación ──────────────────────────────────
function isAuthError(e) {
  if (!e) return false
  const status = e?.data?.[1]
  if (status === 401 || status === 403) return true
  const msg = String(e?.message || e?.data?.[0] || '')
  return msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized') || msg.includes('Forbidden')
}

export function useShakaPlayer(channel) {
  const videoRef    = useRef(null)
  const playerRef   = useRef(null)
  const loadIdRef   = useRef(0)  // cancela cargas anteriores

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState(null)
  const [hasSubtitles, setHasSubtitles] = useState(false)
  const subtitlesDesiredRef = useRef(false)
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false)
  const [currentStreamIndex, setCurrentStreamIndex] = useState(-1)

  // ─── Helpers ───────────────────────────────────────────────────────────────
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
    } catch {
      if (videoRef.current?.textTracks) {
        Array.from(videoRef.current.textTracks).forEach(t => {
          t.mode = subtitlesDesiredRef.current ? 'showing' : 'hidden'
        })
      }
    }
  }

  // ─── Init player (una sola vez) ───────────────────────────────────────────
  useEffect(() => {
    shaka.polyfill.installAll()
    if (!shaka.Player.isBrowserSupported()) { setError('Browser not supported'); return }

    const init = async () => {
      if (playerRef.current) { await playerRef.current.destroy(); playerRef.current = null }
      if (!videoRef.current) return
      const player = new shaka.Player()
      await player.attach(videoRef.current)
      playerRef.current = player
      player.configure(SHAKA_CONFIG)
      player.addEventListener('error', (event) => {
        // Solo loguear errores de severidad 2 (críticos)
        if (event.detail?.severity === 2) {
          console.warn('Shaka critical error:', event.detail.code, event.detail.data?.[1])
          // No hacer nada aquí — loadChannel() ya maneja el error en su catch
        }
      })
    }

    const t = setTimeout(init, 50)
    return () => {
      clearTimeout(t)
      loadIdRef.current++ // invalidar cualquier carga en curso
      if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Cambio de canal ──────────────────────────────────────────────────────
  useEffect(() => {
    if (playerRef.current && channel) {
      subtitlesDesiredRef.current = false
      setSubtitlesEnabled(false)
      loadChannel(channel)
    }
  }, [channel]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Cargar canal ─────────────────────────────────────────────────────────
  const loadChannel = async (ch, altIndex = -1, isManual = false) => {
    if (!playerRef.current) return

    // Marcar esta carga con un ID único — si el canal cambia mientras carga, se ignora
    const myId = ++loadIdRef.current
    setIsLoading(true)
    setError(null)
    setCurrentStreamIndex(altIndex)

    // Demora artificial de 5 segundos para mostrar la animación de carga solicitada
    if (altIndex === -1 || isManual) {
      await new Promise(resolve => setTimeout(resolve, 5000))
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Si durante los 5 segundos el usuario cambió a otro canal, cancelar
    if (myId !== loadIdRef.current) return

    // Resolver URL
    let url = ch.url
    let altObj = null

    if (altIndex >= 0 && ch.urlAlt?.length > altIndex) {
      altObj = ch.urlAlt[altIndex]
      url = altObj.url
    } else if (altIndex === -1 && !ch.url && ch.urlAlt?.length > 0) {
      altObj = ch.urlAlt[0]
      url = altObj.url
      altIndex = 0
    }

    if (!url) {
      if (myId === loadIdRef.current) { setError(new Error('Sin URL')); setIsLoading(false) }
      return
    }

    try {
      // Configurar headers si los hay
      const currentDrm     = altObj?.drm     || ch.drm
      const currentHeaders = altObj?.headers || null

      const net = playerRef.current.getNetworkingEngine()
      net.clearAllRequestFilters()

      if (currentHeaders) {
        const forbidden = new Set(['origin', 'referer', 'host', 'user-agent', 'keep-alive', 'content-length'])
        net.registerRequestFilter((type, request) => {
          if (type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
              type === shaka.net.NetworkingEngine.RequestType.SEGMENT) {
            for (const [k, v] of Object.entries(currentHeaders)) {
              if (!forbidden.has(k.toLowerCase())) request.headers[k] = v
            }
          }
        })
      }

      // Filtro de respuesta para matar la carga ante el primer 404 (evita reintentos infinitos de Shaka)
      net.registerResponseFilter((type, response) => {
        if (response.status === 404) {
          console.error('Abortando por 404 detectado:', response.uri)
          throw new shaka.util.Error(
            shaka.util.Error.Severity.CRITICAL,
            shaka.util.Error.Category.NETWORK,
            shaka.util.Error.Code.HTTP_ERROR,
            response.uri, response.status
          )
        }
      })

      playerRef.current.configure({
        ...SHAKA_CONFIG,
        ...(currentDrm?.keyId && currentDrm?.key
          ? { drm: { clearKeys: { [currentDrm.keyId]: currentDrm.key } } }
          : { drm: { clearKeys: {} } }
        ),
      })

      try { playerRef.current.setTextTrackVisibility(false) } catch (_) {}
      hideNativeTracks()

      await playerRef.current.load(url)

      // Si otra carga tomó el lugar, ignorar este resultado
      if (myId !== loadIdRef.current) return

      const tracks = playerRef.current.getTextTracks()
      setHasSubtitles(tracks.length > 0)
      applySubtitleState(playerRef.current)
      console.log('✓ Loaded:', ch.name, altIndex >= 0 ? `[Alt ${altIndex + 1}]` : '[Main]')

    } catch (e) {
      // Si ya no soy la carga activa, ignorar silenciosamente
      if (myId !== loadIdRef.current) return

      const authFail = isAuthError(e)
      console.warn(`✗ ${ch.name} ${authFail ? '[401]' : '[error]'}:`, e?.code || e?.message)

      // Intentar URL alternativa SOLO si no es error de auth y no fue selección manual
      const nextAlt = altIndex === -1 ? 0 : altIndex + 1
      const hasNextAlt = ch.urlAlt?.length > nextAlt

      if (!isManual && !authFail && hasNextAlt) {
        console.log(`→ Fallback a Alt ${nextAlt + 1} para ${ch.name}`)
        await loadChannel(ch, nextAlt)
        return
      }

      setError(e)
      window.dispatchEvent(new Event('check-status'))
    } finally {
      if (myId === loadIdRef.current) setIsLoading(false)
    }
  }

  const retry        = () => { if (channel) loadChannel(channel) }
  const changeStream = (index) => { if (channel) loadChannel(channel, index, true) }

  const toggleSubtitles = () => {
    if (!playerRef.current) return
    const next = !subtitlesDesiredRef.current
    subtitlesDesiredRef.current = next
    setSubtitlesEnabled(next)
    applySubtitleState(playerRef.current)
  }

  return { videoRef, isLoading, error, retry, hasSubtitles, subtitlesEnabled, toggleSubtitles, currentStreamIndex, changeStream }
}
