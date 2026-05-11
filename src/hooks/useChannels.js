import { useState, useMemo, useEffect, useCallback } from 'react'
import channels from '../data/premiumChannels_clean.json'
import { applyFilters, getRecentChannels, getChannelGroup } from '../utils/channelFilters'

const FILTER_MAP = {
  'Deportes':       'Deportes',
  'Películas':      'Películas',
  'Infantil':       'Infantiles',
  'Series y shows': 'Series y Entretenimiento',
  'Internacional':  'Internacional',
  'Música':         'Música',
  'Documentales':   'Documentales',
}

export function useChannels() {
  const [activeFilter, setActiveFilter] = useState(() => {
    return localStorage.getItem('maglinktv_last_filter') || 'Todos'
  })
  
  useEffect(() => {
    localStorage.setItem('maglinktv_last_filter', activeFilter)
  }, [activeFilter])

  const [searchQuery, setSearchQuery]   = useState('')
  const [show18Plus, setShow18Plus]     = useState(true)
  const [recentIds, setRecentIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('maglinktv_recents')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('maglinktv_recents', JSON.stringify(recentIds))
  }, [recentIds])

  const addRecent = useCallback((channelId) => {
    setRecentIds(prev => {
      return [channelId, ...prev.filter(id => id !== channelId)].slice(0, 20)
    })
  }, [])

  const clearRecents = useCallback(() => {
    setRecentIds([])
    localStorage.removeItem('maglinktv_recents')
  }, [])

  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('maglinktv_favorites')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('maglinktv_favorites', JSON.stringify(favoriteIds))
  }, [favoriteIds])

  const toggleFavorite = useCallback((channelId) => {
    setFavoriteIds(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId) 
        : [...prev, channelId]
    )
  }, [])

  const isFavorite = useCallback((channelId) => favoriteIds.includes(channelId), [favoriteIds])

  const filteredChannels = useMemo(() => {
    if (activeFilter === 'Favoritos') {
      return channels.filter(ch => favoriteIds.includes(ch.id))
    }
    if (activeFilter === 'Recientes') {
      return getRecentChannels(channels, recentIds)
    }
    if (activeFilter === 'Locales y noticias') {
      const base = applyFilters(channels, { show18Plus, query: searchQuery })
      return base.filter(ch =>
        getChannelGroup(ch) === 'Locales' || getChannelGroup(ch) === 'Noticias'
      )
    }
    return applyFilters(channels, {
      group: FILTER_MAP[activeFilter] || null,
      query: searchQuery,
      show18Plus,
    })
  }, [activeFilter, searchQuery, show18Plus, recentIds, favoriteIds])

  return {
    channels,
    filteredChannels,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    show18Plus,
    setShow18Plus,
    recentIds,
    addRecent,
    clearRecents,
    favoriteIds,
    toggleFavorite,
    isFavorite,
  }
}
