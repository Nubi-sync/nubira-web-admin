// ============================================================================
// Zigza MES - Buyers & Vendors Utilities & Data Cleaners
// ============================================================================

export interface ParsedBOMMaterial {
  component_type: string
  item_name: string
  specification?: string
  consumption: string
  placement: string
}

export function parseFabricAndBOM(rawFabric?: string | null): {
  cleanFabric: string
  targetCutDate?: string
  materials: ParsedBOMMaterial[]
} {
  if (!rawFabric) {
    return { cleanFabric: '100% Combed Cotton Single Jersey', materials: [] }
  }

  let text = String(rawFabric)
  let targetCutDate: string | undefined
  let materials: ParsedBOMMaterial[] = []

  // 1. Extract and parse BOM_JSON
  const bomMatch = text.match(/\[BOM_JSON:\s*(\[[\s\S]*?\])\]/i)
  if (bomMatch && bomMatch[1]) {
    try {
      const parsed = JSON.parse(bomMatch[1])
      if (Array.isArray(parsed)) {
        materials = parsed.map((m: any) => ({
          component_type: m.component_type || m.type || 'Trim / Material',
          item_name: m.item_name || m.name || '-',
          specification: m.specification || '',
          consumption: m.consumption ? `${m.consumption} pcs / unit` : '-',
          placement: m.placement || '-'
        }))
      }
    } catch (_) {}
    text = text.replace(/\[BOM_JSON:\s*\[[\s\S]*?\]\]\s*/gi, '')
  }

  // 2. Extract TARGET_CUT_DATE
  const cutMatch = text.match(/\[TARGET_CUT_DATE:\s*([\s\S]*?)\]/i)
  if (cutMatch && cutMatch[1]) {
    targetCutDate = cutMatch[1].trim()
    text = text.replace(/\[TARGET_CUT_DATE:\s*[\s\S]*?\]\s*/gi, '')
  }

  // 3. Extract INSTRUCTIONS
  const instMatch = text.match(/\[INSTRUCTIONS:\s*([\s\S]*?)\]/i)
  if (instMatch && instMatch[1]) {
    text = text.replace(/\[INSTRUCTIONS:\s*[\s\S]*?\]\s*/gi, '')
  }

  const cleanFabric = text.trim() || '100% Combed Cotton Single Jersey'
  return { cleanFabric, targetCutDate, materials }
}

/**
 * Avatar Initials Formatter:
 * - 1 word: First letter + Last letter (e.g. Hollypop -> HP, Ollywood -> OD)
 * - 2+ words: First letter of first two words (e.g. Candy Pop -> CP, First Smile -> FS)
 */
export function getBuyerAvatarInitials(name?: string | null): string {
  if (!name) return 'BY'
  const cleaned = name.replace(/[^\w\s]/gi, '').trim()
  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'BY'
  if (words.length === 1) {
    const w = words[0]
    if (w.length <= 1) return w.toUpperCase()
    return (w[0] + w[w.length - 1]).toUpperCase()
  }
  return (words[0][0] + words[1][0]).toUpperCase()
}
