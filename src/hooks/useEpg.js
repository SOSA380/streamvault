import { useState, useEffect } from 'react'

// Fuera del hook — siempre disponible, sin problemas de hoisting
function parseXmlTime(str) {
  if (!str) return new Date()
  const year  = parseInt(str.slice(0, 4))
  const month = parseInt(str.slice(4, 6)) - 1
  const day   = parseInt(str.slice(6, 8))
  const hour  = parseInt(str.slice(8, 10))
  const min   = parseInt(str.slice(10, 12))
  const sec   = parseInt(str.slice(12, 14))

  let date = new Date(Date.UTC(year, month, day, hour, min, sec))

  const parts = str.trim().split(/\s+/)
  const offsetPart = parts[1]
  if (offsetPart && /^[+-]\d{4}$/.test(offsetPart)) {
    const sign = offsetPart[0] === '+' ? 1 : -1
    const offH = parseInt(offsetPart.slice(1, 3))
    const offM = parseInt(offsetPart.slice(3, 5))
    date = new Date(date.getTime() - (offH * 60 + offM) * 60000 * sign)
  }
  return date
}

function decodeXml(value = '') {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
}

function getTagValue(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? decodeXml(match[1]) : ''
}

export function useEpg(channels) {
  const [epgData, setEpgData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEpg() {
      try {
        setLoading(true)

        const cacheKey = 'maglinktv_epg_cache'
        const cacheTimeKey = 'maglinktv_epg_cache_time'
        const now = Date.now()
        const minTime = now - 2 * 60 * 60 * 1000
        const maxTime = now + 30 * 60 * 60 * 1000
        
        try {
          const cachedTime = sessionStorage.getItem(cacheTimeKey)
          if (cachedTime && (now - parseInt(cachedTime)) < 1800000) {
            const cachedData = sessionStorage.getItem(cacheKey)
            if (cachedData) {
              const parsed = JSON.parse(cachedData)
              Object.keys(parsed).forEach(id => {
                parsed[id] = parsed[id].map(p => ({
                  ...p,
                  start: new Date(p.start),
                  end: new Date(p.end)
                }))
              })
              setEpgData(parsed)
              setLoading(false)
              return
            }
          }
        } catch (e) {
          console.warn('Failed to read EPG cache', e)
        }

        // Build a Set of valid tvgIds for O(1) lookup
        const validIds = new Set(
          (channels || [])
            .map(c => c.tvgId)
            .filter(id => id && id.trim() !== '')
        );

        const res = await fetch(`/data/epg-tgdrjoarjq.xml?t=${Date.now()}`)
        if (!res.ok) throw new Error('EPG not found')

        const xmlText = await res.text()
        const parsedData = {}
        const programmeRe = /<programme\s+([^>]*)>([\s\S]*?)<\/programme>/g
        let match
        let total = 0

        while ((match = programmeRe.exec(xmlText)) !== null) {
          const attrs = match[1]
          const block = match[2]
          const xmlChId = attrs.match(/channel="([^"]+)"/)?.[1]
          if (!xmlChId || !validIds.has(xmlChId)) continue

          const start = parseXmlTime(attrs.match(/start="([^"]+)"/)?.[1])
          const end = parseXmlTime(attrs.match(/stop="([^"]+)"/)?.[1])
          if (end.getTime() < minTime || start.getTime() > maxTime) continue

          if (!parsedData[xmlChId]) parsedData[xmlChId] = []
          parsedData[xmlChId].push({
            title:    getTagValue(block, 'title') || 'Programa',
            desc:     getTagValue(block, 'desc'),
            start,
            end,
            category: getTagValue(block, 'category') || 'General',
          })
          total++
        }

        Object.keys(parsedData).forEach(id => {
          parsedData[id].sort((a, b) => a.start - b.start)
        })

        if (total === 0) console.warn('EPG vacío o fuera de la ventana horaria')

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(parsedData))
          sessionStorage.setItem(cacheTimeKey, now.toString())
        } catch (e) {
          console.warn('Failed to save EPG cache', e)
        }

        setEpgData(parsedData)
      } catch (err) {
        console.error('Error cargando EPG:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEpg()
  }, [])

  return { epgData, loading }
}
