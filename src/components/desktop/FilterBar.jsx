import { useEffect, useRef } from 'react'
import { Search, X, Layers, Star, Globe, Film, Tv, Baby, Trophy, BookOpen, Music, Globe2, Info } from 'lucide-react'

export const FILTERS = [
  { id: 'Todos',              label: 'Todos',         icon: Layers   },
  { id: 'Favoritos',          label: 'Favoritos',     icon: Star     },
  { id: 'Locales y noticias', label: 'Local y Noticias',  icon: Globe    },
  { id: 'Películas',          label: 'Películas',     icon: Film     },
  { id: 'Series y shows',     label: 'Series y Realitys', icon: Tv       },
  { id: 'Infantil',           label: 'Infantil',      icon: Baby     },
  { id: 'Deportes',           label: 'Deportes',      icon: Trophy   },
  { id: 'Documentales',       label: 'Documentales',  icon: BookOpen },
  { id: 'Música',             label: 'Música',        icon: Music    },
  { id: 'Internacional',      label: 'Internacional', icon: Globe2   },
]

// ─── Filter Tab ───────────────────────────────────────────────────────────────
export function FilterTab({ f, active, focused, onChange, isTV }) {
  const ref = useRef(null)
  const Icon = f.icon
  const on = active === f.id

  // Scroll into view when focused
  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
  }, [focused])

  return (
    <button
      ref={ref}
      onClick={() => onChange(f.id)}
      className={`flex items-center gap-2 rounded-xl whitespace-nowrap shrink-0 transition-all duration-200 outline-none
        ${isTV ? 'text-sm px-5 py-3' : 'text-xs px-4 py-2.5'}
        ${on
          ? 'bg-white text-black font-semibold'
          : focused
            ? 'bg-white/15 text-white ring-1 ring-white/30'
            : 'text-white/40 hover:text-white hover:bg-white/10'
        }`}
    >
      <Icon size={isTV ? 15 : 13} />
      <span className="font-medium tracking-wide">{f.label}</span>
    </button>
  )
}

// ─── Search Input ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, onClear, isTV, isPortrait, searchRef, focused }) {
  useEffect(() => {
    if (focused) searchRef.current?.focus()
  }, [focused, searchRef])

  return (
    <div className="relative w-full group">
      <Search
        size={isTV ? 15 : 13}
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors
          ${focused ? 'text-white' : 'text-white/25 group-hover:text-white/40'}`}
      />
      <input
        ref={searchRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar canales..."
        className={`w-full rounded-2xl pl-10 pr-9 font-medium outline-none transition-all duration-200
          placeholder:text-white/20
          ${isTV ? 'py-3 text-[14px]' : 'py-2.5 text-[12px]'}
          ${focused || value
            ? 'bg-white/10 text-white ring-1 ring-white/30'
            : 'bg-white/5 text-white/70 hover:bg-white/8'
          }`}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-all"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
export function FilterBar({
  visibleFilters, activeFilter, setActiveFilter,
  searchQuery, setSearchQuery,
  isTV, isPortrait, onOpenTerms,
  // navigation
  focusedFilterIndex, isFilterZone,
  searchRef,
}) {
  const scrollRef = useRef(null)

  return (
    <div className="w-full shrink-0 relative z-40 bg-surface border-b border-white/[0.07]">
      {isPortrait ? (
        /* ── Portrait layout ── */
        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <SearchInput
                value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')}
                isTV={isTV} isPortrait={true}
                searchRef={searchRef}
                focused={false}
              />
            </div>
            <button
              onClick={onOpenTerms}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 bg-white/5 hover:bg-white/10 hover:text-white/60 transition-all shrink-0"
            >
              <Info size={15} />
            </button>
          </div>
          {!searchQuery && (
            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4"
            >
              {visibleFilters.map((f, i) => (
                <FilterTab key={f.id} f={f}
                  active={activeFilter}
                  focused={isFilterZone && focusedFilterIndex === i}
                  onChange={setActiveFilter}
                  isTV={isTV}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Landscape layout ── */
        <div className="flex items-center w-full px-5 py-3 gap-5">
          {/* Filter tabs */}
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0"
          >
            {visibleFilters.map((f, i) => (
              <FilterTab key={f.id} f={f}
                active={activeFilter}
                focused={isFilterZone && focusedFilterIndex === i}
                onChange={setActiveFilter}
                isTV={isTV}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-white/10 shrink-0" />

          {/* Search */}
          <div className="shrink-0" style={{ width: isTV ? 260 : 220 }}>
            <SearchInput
              value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')}
              isTV={isTV} isPortrait={false}
              searchRef={searchRef}
              focused={isFilterZone && focusedFilterIndex === visibleFilters.length}
            />
          </div>

          {/* Info button */}
          <button
            onClick={onOpenTerms}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 bg-white/5 hover:bg-white/10 hover:text-white/60 transition-all shrink-0"
          >
            <Info size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
