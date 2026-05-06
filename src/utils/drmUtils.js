/**
 * Utility functions for DRM and Key handling
 */

/**
 * Converts a hex string to a Uint8Array
 * @param {string} hex 
 * @returns {Uint8Array}
 */
export const hexToUint8Array = (hex) => {
  if (!hex) return new Uint8Array(0)
  const matches = hex.match(/.{1,2}/g)
  if (!matches) return new Uint8Array(0)
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)))
}

/**
 * Formats keys for ClearKey DRM
 * @param {string} keyId Hex string
 * @param {string} key Hex string
 * @returns {Object} Mapping for Shaka clearKeys
 */
export const formatClearKeys = (keyId, key) => {
  if (!keyId || !key) return {}
  return {
    [keyId]: key
  }
}
