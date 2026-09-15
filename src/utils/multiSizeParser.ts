/**
 * Universal Multi-Size & Safety Buffer Parsing Utility
 * Enterprise-grade Garment MES logic for Trims, Accessories & Labels
 */

export interface MultiSizeParseResult {
  isMultiSize: boolean
  cleanName: string
  sizes: string[]
  detectedPattern?: string
}

export interface SizeBreakdownItem {
  size: string
  qty: number
}

export interface SizeBreakdownResult {
  isMultiSize: boolean
  sizes: string[]
  sizeBreakdown: SizeBreakdownItem[]
  baseQty: number
  bufferQty: number
  cleanName: string
}

// Known standard Alpha size ordering
const KNOWN_ALPHA_ORDER = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL']

/**
 * Expand a size range like "XS-S" or "22-26" or "28-34"
 */
function expandRange(start: string, end: string): string[] | null {
  const numStart = parseInt(start, 10)
  const numEnd = parseInt(end, 10)

  if (!isNaN(numStart) && !isNaN(numEnd) && numStart < numEnd) {
    // Determine step (usually 2 in apparel e.g. 22, 24, 26 or 28, 30, 32, 34)
    const diff = numEnd - numStart
    const step = diff % 2 === 0 ? 2 : 1
    const result: string[] = []
    for (let n = numStart; n <= numEnd; n += step) {
      result.push(n.toString())
    }
    return result
  }

  const alphaStartIdx = KNOWN_ALPHA_ORDER.indexOf(start.toUpperCase())
  const alphaEndIdx = KNOWN_ALPHA_ORDER.indexOf(end.toUpperCase())

  if (alphaStartIdx !== -1 && alphaEndIdx !== -1 && alphaStartIdx < alphaEndIdx) {
    return KNOWN_ALPHA_ORDER.slice(alphaStartIdx, alphaEndIdx + 1)
  }

  return null
}

/**
 * Extract clean tokens from a raw candidate string e.g. "XS,S", "M,L,XL,XXL", "22,24,26", "28-34"
 */
function extractTokens(raw: string): string[] {
  const trimmed = raw.trim()
  if (!trimmed) return []

  // Check for range with hyphen e.g. "XS-S" or "22-26"
  const rangeMatch = trimmed.match(/^([A-Za-z0-9]+)\s*-\s*([A-Za-z0-9]+)$/)
  if (rangeMatch) {
    const expanded = expandRange(rangeMatch[1], rangeMatch[2])
    if (expanded && expanded.length > 1) return expanded
    return [rangeMatch[1].toUpperCase(), rangeMatch[2].toUpperCase()]
  }

  // Split by comma, slash, or whitespace
  const splitTokens = trimmed
    .split(/[,/\s]+/)
    .map(t => t.trim().toUpperCase())
    .filter(t => t.length > 0)

  return splitTokens
}

/**
 * Validate whether a list of tokens looks like a genuine size set:
 * E.g. ['S', 'M', 'L', 'XL'], ['22', '24', '26'], ['XS', 'S']
 */
function isValidSizeTokenList(tokens: string[]): boolean {
  if (tokens.length < 2) return false

  const allNumeric = tokens.every(t => /^\d{2}$/.test(t))
  if (allNumeric) {
    // Validate typical apparel size ranges (kids 16-26 or adult 28-44)
    const nums = tokens.map(t => parseInt(t, 10))
    const inRange = nums.every(n => (n >= 14 && n <= 50))
    if (inRange) return true
  }

  const allAlpha = tokens.every(t => KNOWN_ALPHA_ORDER.includes(t))
  if (allAlpha) return true

  // Mixed or variations like 2XL, 3XL
  const allValidSizes = tokens.every(t => {
    return KNOWN_ALPHA_ORDER.includes(t) || /^\d{2}$/.test(t)
  })
  return allValidSizes
}

/**
 * Universal Multi-Size Parser
 * Parses strings like:
 * - "BODY- OLLYPOP COLLECTION LABLE(XS,S)"
 * - "BODY- OLLYPOP COLLECTION LABLE(M,L,XL,XXL)"
 * - "PANT-OLLYPOP LONG LABLE(XS-S)"
 * - "BODY- OLLYOP COLLECTION LABLE 22,24,26"
 * - "PANT- 28,30,32,34"
 */
export function parseMultiSizeTokens(itemName: string, sizeLabel?: string | null): MultiSizeParseResult {
  const rawItem = (itemName || '').trim()
  const rawSize = (sizeLabel || '').trim()

  // 1. Check if sizeLabel itself contains multi-size tokens
  if (rawSize) {
    const tokensFromSize = extractTokens(rawSize)
    if (isValidSizeTokenList(tokensFromSize)) {
      return {
        isMultiSize: true,
        cleanName: rawItem,
        sizes: tokensFromSize,
        detectedPattern: rawSize
      }
    }
  }

  // 2. Check for parentheses at end or inside itemName: e.g. "BODY- ... LABLE(M,L,XL,XXL)"
  const parenMatch = rawItem.match(/\(([^)]+)\)$/) || rawItem.match(/\(([^)]+)\)/)
  if (parenMatch) {
    const inside = parenMatch[1]
    const tokens = extractTokens(inside)
    if (isValidSizeTokenList(tokens)) {
      const clean = rawItem.replace(parenMatch[0], '').trim()
      return {
        isMultiSize: true,
        cleanName: clean,
        sizes: tokens,
        detectedPattern: inside
      }
    }
  }

  // 3. Check for comma/slash lists at end of itemName e.g. "LABLE 22,24,26" or "PANT- 28,30,32,34"
  const endListMatch = rawItem.match(/(?:[\s\-_:])([A-Za-z0-9]+(?:[,/][A-Za-z0-9]+)+)$/)
  if (endListMatch) {
    const candidate = endListMatch[1]
    const tokens = extractTokens(candidate)
    if (isValidSizeTokenList(tokens)) {
      const clean = rawItem.slice(0, endListMatch.index).trim()
      return {
        isMultiSize: true,
        cleanName: clean || rawItem,
        sizes: tokens,
        detectedPattern: candidate
      }
    }
  }

  // Single size fallback or common item
  return {
    isMultiSize: false,
    cleanName: rawItem,
    sizes: rawSize ? [rawSize.toUpperCase()] : []
  }
}

/**
 * Calculate the Size Breakdown Matrix & Safety Buffer Reserve
 * @param totalQty Actual received quantity in Godown (e.g. 2,350 or 2,656)
 * @param sizes Detected sizes (e.g. ['M', 'L', 'XL', 'XXL'])
 * @param targetQty Optional base order target (e.g. 2,232)
 */
export function calculateSizeBreakdown(
  totalQty: number,
  sizes: string[],
  targetQty?: number | null
): {
  sizeBreakdown: SizeBreakdownItem[]
  baseQty: number
  bufferQty: number
} {
  const qty = Math.max(0, Number(totalQty) || 0)
  if (!sizes || sizes.length === 0) {
    return {
      sizeBreakdown: [],
      baseQty: qty,
      bufferQty: 0
    }
  }

  const count = sizes.length
  let baseQuota = qty
  let buffer = 0

  if (targetQty && targetQty > 0 && qty > targetQty) {
    baseQuota = targetQty
    buffer = qty - targetQty
  } else {
    // If no targetQty specified or received doesn't exceed targetQty,
    // check if qty divides evenly among sizes, keeping remainder in buffer
    const remainder = qty % count
    if (remainder > 0) {
      baseQuota = qty - remainder
      buffer = remainder
    } else {
      baseQuota = qty
      buffer = 0
    }
  }

  const perSize = Math.floor(baseQuota / count)
  const breakdown: SizeBreakdownItem[] = sizes.map(size => ({
    size,
    qty: perSize
  }))

  return {
    sizeBreakdown: breakdown,
    baseQty: baseQuota,
    bufferQty: buffer
  }
}

/**
 * High-level helper to parse an item and get its complete breakdown
 */
export function getDetailedItemBreakdown(
  itemName: string,
  totalQty: number,
  sizeLabel?: string | null,
  targetQty?: number | null
): SizeBreakdownResult {
  const parsed = parseMultiSizeTokens(itemName, sizeLabel)
  if (!parsed.isMultiSize || parsed.sizes.length === 0) {
    return {
      isMultiSize: false,
      sizes: parsed.sizes,
      sizeBreakdown: parsed.sizes.length > 0 ? [{ size: parsed.sizes[0], qty: totalQty }] : [],
      baseQty: totalQty,
      bufferQty: 0,
      cleanName: parsed.cleanName
    }
  }

  const calc = calculateSizeBreakdown(totalQty, parsed.sizes, targetQty)
  return {
    isMultiSize: true,
    sizes: parsed.sizes,
    sizeBreakdown: calc.sizeBreakdown,
    baseQty: calc.baseQty,
    bufferQty: calc.bufferQty,
    cleanName: parsed.cleanName
  }
}
