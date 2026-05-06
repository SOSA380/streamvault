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

export function useEpg(channels) {
  const [epgData, setEpgData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEpg() {
      try {
        setLoading(true)

        const cacheKey = 'maglinktv_epg_cache'
        const cacheTimeKey = 'maglinktv_epg_cache_time'
        
        try {
          const cachedTime = sessionStorage.getItem(cacheTimeKey)
          // Cache disabled temporarily for debugging
          if (false && cachedTime && (Date.now() - parseInt(cachedTime)) < 3600000) {
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
              console.log('EPG loaded from cache')
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
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

        const programmeNodes = xmlDoc.getElementsByTagName('programme')
        if (!programmeNodes || programmeNodes.length === 0) {
          console.warn('EPG vacío o inválido')
          return
        }

        const parsedData = {}

        for (let i = 0; i < programmeNodes.length; i++) {
          const node = programmeNodes[i]
          const xmlChId = node.getAttribute('channel')
          
          // Skip if the channel id is not in our premiumChannels_clean list
          if (!xmlChId || !validIds.has(xmlChId)) continue

          if (!parsedData[xmlChId]) parsedData[xmlChId] = []

          const getVal = tag => {
            const n = node.getElementsByTagName(tag)[0]
            return n ? n.textContent.trim() : ''
          }

          parsedData[xmlChId].push({
            title:    getVal('title') || 'Programa',
            desc:     getVal('desc'),
            start:    parseXmlTime(node.getAttribute('start')),
            end:      parseXmlTime(node.getAttribute('stop')),
            category: getVal('category') || 'General',
          })
        }

        Object.keys(parsedData).forEach(id => {
          parsedData[id].sort((a, b) => a.start - b.start)
        })

        const total = Object.values(parsedData).reduce((acc, v) => acc + v.length, 0)
        console.log(`EPG cargado: ${Object.keys(parsedData).length} canales, ${total} programas`)

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(parsedData))
          sessionStorage.setItem(cacheTimeKey, Date.now().toString())
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
