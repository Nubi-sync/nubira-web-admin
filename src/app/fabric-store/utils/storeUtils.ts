export function categorizeTrim(name: string, component?: string): string {
  const combined = `${name || ''} ${component || ''}`.toLowerCase()
  if (combined.includes('label') || combined.includes('tag') || combined.includes('patch')) {
    return 'Labels & Tags'
  }
  if (combined.includes('button') || combined.includes('snap') || combined.includes('rivet') || combined.includes('hook')) {
    return 'Buttons & Fasteners'
  }
  if (combined.includes('zip') || combined.includes('slider') || combined.includes('puller')) {
    return 'Zippers & Sliders'
  }
  if (combined.includes('thread') || combined.includes('yarn') || combined.includes('dori')) {
    return 'Sewing Threads'
  }
  if (combined.includes('polybag') || combined.includes('box') || combined.includes('carton') || combined.includes('hanger')) {
    return 'Packaging'
  }
  if (combined.includes('tape') || combined.includes('ribbon') || combined.includes('elastic') || combined.includes('cord')) {
    return 'Tapes & Elastics'
  }
  return 'Trims & Sundries'
}

export function formatTrimDisplayName(itemName: string, componentType?: string): string {
  const item = (itemName || '').trim()
  const comp = (componentType || '').trim()
  
  if (!comp) return item || 'Trim Item'
  if (!item) return comp

  // If item is very short like "white" or "cotton", give it full context
  const compLower = comp.toLowerCase()
  const itemLower = item.toLowerCase()

  if (compLower.includes('button') && !itemLower.includes('button')) {
    return `${item.charAt(0).toUpperCase() + item.slice(1)} Buttons`
  }
  if (compLower.includes('zip') && !itemLower.includes('zip')) {
    return `${item.charAt(0).toUpperCase() + item.slice(1)} Zipper`
  }
  if (compLower.includes('label') && !itemLower.includes('label')) {
    return `${item.charAt(0).toUpperCase() + item.slice(1)} (Label)`
  }
  if (compLower.includes('ribbon') && !itemLower.includes('ribbon')) {
    return `${item.charAt(0).toUpperCase() + item.slice(1)} (Ribbon)`
  }

  if (itemLower === compLower) return item

  return `${item.charAt(0).toUpperCase() + item.slice(1)} (${comp})`
}

export function parseBOMFromFabric(raw: string): {
  cleanFabric: string
  materials: Array<{
    component: string
    item: string
    consumption: string
    placement: string
  }>
} {
  if (!raw) return { cleanFabric: '', materials: [] }

  const bomMatch = raw.match(/\[BOM_JSON:\s*(\[.*?\])\]/s)
  let materials: Array<{
    component: string
    item: string
    consumption: string
    placement: string
  }> = []

  if (bomMatch) {
    try {
      const parsed = JSON.parse(bomMatch[1])
      if (Array.isArray(parsed)) {
        materials = parsed.map(item => ({
          component: item.component_type || item.item_name || 'Material',
          item: item.item_name || item.specification || item.component_type || 'Trim',
          consumption: item.consumption ? String(item.consumption) : '1',
          placement: item.placement || 'Standard'
        }))
      }
    } catch (_) {}
  }

  const cleanFabric = raw
    .replace(/\[BOM_JSON:\s*\[.*?\]\]/gs, '')
    .replace(/\[TARGET_CUT_DATE:\s*[^\]]+\]/gi, '')
    .replace(/\[INSTRUCTIONS:\s*[^\]]+\]/gi, '')
    .trim()

  return { cleanFabric, materials }
}
