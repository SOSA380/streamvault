import { useState, useEffect } from 'react'
import { init } from '@noriginmedia/norigin-spatial-navigation'
import { useChannels } from './hooks/useChannels'
import { useEpg } from './hooks/useEpg'
import { DesktopLayout } from './components/desktop/DesktopLayout'
import channels from './data/premiumChannels_clean.json'

export function DesktopApp() {
  const {
    filteredChannels, activeFilter, setActiveFilter,
    searchQuery, setSearchQuery, recentIds, addRecent, clearRecents,
    toggleFavorite, isFavorite, favoriteIds,
  } = useChannels()

  const { epgData } = useEpg(channels)
  const [selectedChannel, setSelectedChannel] = useState(() => {
    const savedId = localStorage.getItem('maglinktv_last_channel')
    if (savedId) {
      const ch = channels.find(c => c.id === savedId)
      if (ch) return ch
    }
    return channels[0] || null
  })

  useEffect(() => {
    // Inicializar navegación espacial solo para el mundo desktop
    init({
      debug: false,
      visualDebug: false,
    })
  }, [])

  const handleChannelClick = (channel) => {
    addRecent(channel.id)
    setSelectedChannel(channel)
    localStorage.setItem('maglinktv_last_channel', channel.id)
  }

  // Removed unused getNowPlaying and epgNow

  const commonProps = {
    selectedChannel,
    channels, filteredChannels, epgData,
    recentIds, clearRecents,
    searchQuery, setSearchQuery,
    activeFilter, setActiveFilter,
    onChannelClick: handleChannelClick,
    toggleFavorite, isFavorite, favoriteIds,
  }

  return (
    <>
      <DesktopLayout {...commonProps} />
    </>
  )
}
