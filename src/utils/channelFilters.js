/**
 * channelFilters.js
 * Utilidades para filtrar y agrupar canales por categoría.
 *
 * ESTRUCTURA REAL DEL JSON:
 * - category: "Local" | "Noticias" | "Deportes" | "Entretenimiento" |
 *             "Cine y Series" | "Documentales" | "Infantil" | "Música" | "Adultos"
 * - country:  "AR" | "UY" | "PY" | "MX" | "ES" | "FR" | "VE" | "Internacional"
 * - categoryGroup: null (no usado — ignorar)
 *
 * REGLAS DE CLASIFICACIÓN UI:
 * - "Nacionales"      → category === "Local" AND country === "AR"
 * - "Internacionales" → category === "Local" AND country !== "AR"
 *                       OR country !== "AR" (canales de otros países)
 * - El resto (cables) → por su campo category directamente (country === "AR")
 */



// ─── Resolver grupo UI de un canal ──────────────────────────────────────────

/**
 * Devuelve el grupo UI de un canal.
 * @param {Object} channel
 * @returns {string}
 */
export function getChannelGroup(channel) {
  if (!channel) return 'Otros'
  
  return channel.category ?? 'Otros'
}

// ─── Filtros principales ─────────────────────────────────────────────────────

/**
 * Filtra canales por grupo UI.
 * @param {Array}  channels
 * @param {string} group - "Nacionales" | "Internacionales" | "Deportes" | etc.
 * @returns {Array}
 */
export function filterByGroup(channels, group) {
  if (!group || group === 'Todos') return channels
  return channels.filter(ch => getChannelGroup(ch) === group)
}

/**
 * Filtra canales por country.
 * Acepta valores directos del JSON: "AR" | "UY" | "PY" | "MX" | "ES" | "FR" | "VE" | "Internacional"
 * @param {Array}  channels
 * @param {string} country
 * @returns {Array}
 */
export function filterByCountry(channels, country) {
  if (!country) return channels
  return channels.filter(ch => ch.country === country)
}

/**
 * Excluye contenido adulto si show18Plus es false.
 * @param {Array}   channels
 * @param {boolean} show18Plus
 * @returns {Array}
 */
export function filterAdultContent(channels, show18Plus = false) {
  if (show18Plus) return channels
  return channels.filter(ch => ch.category !== 'Adultos')
}

// ─── Búsqueda ────────────────────────────────────────────────────────────────

/**
 * Búsqueda por nombre (case-insensitive, sin tildes).
 * @param {Array}  channels
 * @param {string} query
 * @returns {Array}
 */
export function searchChannels(channels, query) {
  if (!query || query.trim() === '') return channels
  const q = normalize(query)
  return channels.filter(ch => normalize(ch.name).includes(q))
}

// ─── Agrupación ──────────────────────────────────────────────────────────────

/**
 * Devuelve la lista de grupos presentes en los canales, en orden lógico.
 * @param {Array} channels
 * @returns {string[]}
 */
export function getGroups(channels) {
  const ORDER = [
    'Locales',
    'Noticias',
    'Deportes',
    'Películas',
    'Series y Entretenimiento',
    'Documentales',
    'Infantiles',
    'Música',
    'Internacional',
    'Adultos',
  ]

  const present = new Set(channels.map(ch => getChannelGroup(ch)))
  return ORDER.filter(g => present.has(g))
}

/**
 * Agrupa todos los canales por grupo UI.
 * @param {Array} channels
 * @returns {Object} { "Nacionales": [...], "Deportes": [...], ... }
 */
export function groupByCategory(channels) {
  return channels.reduce((acc, ch) => {
    const group = getChannelGroup(ch)
    if (!acc[group]) acc[group] = []
    acc[group].push(ch)
    return acc
  }, {})
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

/**
 * Devuelve un canal por su id.
 * @param {Array}  channels
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getChannelById(channels, id) {
  return channels.find(ch => ch.id === id)
}

/**
 * Devuelve los canales del historial en orden (más reciente primero).
 * @param {Array}    channels
 * @param {string[]} historyIds
 * @param {number}   limit
 * @returns {Array}
 */
export function getRecentChannels(channels, historyIds, limit = 10) {
  return historyIds
    .slice(0, limit)
    .map(id => getChannelById(channels, id))
    .filter(Boolean)
}

/**
 * Devuelve los canales favoritos.
 * @param {Array} channels
 * @param {Set}   favoriteIds
 * @returns {Array}
 */
export function getFavoriteChannels(channels, favoriteIds) {
  return channels.filter(ch => favoriteIds.has(ch.id))
}

// ─── Filtro combinado ─────────────────────────────────────────────────────────

/**
 * Aplica múltiples filtros a la vez.
 * @param {Array}  channels
 * @param {Object} filters
 * @param {string}  [filters.group]
 * @param {string}  [filters.country]
 * @param {string}  [filters.query]
 * @param {boolean} [filters.show18Plus]
 * @returns {Array}
 */
export function applyFilters(channels, filters = {}) {
  const { group, country, query, show18Plus = false } = filters

  let result = channels

  result = filterAdultContent(result, show18Plus)
  if (group)   result = filterByGroup(result, group)
  if (country) result = filterByCountry(result, country)
  if (query)   result = searchChannels(result, query)

  return result
}

// ─── Helper interno ───────────────────────────────────────────────────────────

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
