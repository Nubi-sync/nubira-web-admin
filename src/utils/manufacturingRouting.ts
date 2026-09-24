import { EmbellishmentSequence } from '@/app/design/types/design'
import { getOrders, getActiveBuyers, saveActiveBuyer, saveOrder, MERCHANDISING_UPDATE_EVENT } from '@/app/merchandising/utils/merchandisingStorage'
import { CUTTING_UPDATE_EVENT } from '@/app/cutting/utils/cuttingStorage'
import { PRINTING_FLOOR_UPDATE_EVENT } from '@/app/printing/utils/printingFloorStorage'
import { EMBROIDERY_FLOOR_UPDATE_EVENT } from '@/app/embroidery/utils/embroideryFloorStorage'

export type { EmbellishmentSequence }

export interface RouteOption {
  value: EmbellishmentSequence
  label: string
  shortLabel: string
  flowDescription: string
  isPrintingActive: boolean
  isEmbroideryActive: boolean
  printingStage: number // 1 = first after cutting, 2 = after embroidery, 0 = bypassed
  embroideryStage: number // 1 = first after cutting, 2 = after printing, 0 = bypassed
}

export const EMBELLISHMENT_ROUTE_CONFIGS: Record<EmbellishmentSequence, RouteOption> = {
  'NONE': {
    value: 'NONE',
    label: 'No Embroidery, No Printing (Cut & Sew Direct)',
    shortLabel: 'Cut & Sew (Direct)',
    flowDescription: 'Cutting Floor ➔ Stitching & Sewing Floor (Division 06)',
    isPrintingActive: false,
    isEmbroideryActive: false,
    printingStage: 0,
    embroideryStage: 0
  },
  'ONLY_PRINTING': {
    value: 'ONLY_PRINTING',
    label: 'Only Printing (Cutting ➔ Printing ➔ Sewing)',
    shortLabel: 'Only Printing',
    flowDescription: 'Cutting Floor ➔ Printing Studio (Div 04) ➔ Stitching & Sewing Floor (Div 06)',
    isPrintingActive: true,
    isEmbroideryActive: false,
    printingStage: 1,
    embroideryStage: 0
  },
  'ONLY_EMBROIDERY': {
    value: 'ONLY_EMBROIDERY',
    label: 'Only Embroidery (Cutting ➔ Embroidery ➔ Sewing)',
    shortLabel: 'Only Embroidery',
    flowDescription: 'Cutting Floor ➔ Embroidery Studio (Div 05) ➔ Stitching & Sewing Floor (Div 06)',
    isPrintingActive: false,
    isEmbroideryActive: true,
    printingStage: 0,
    embroideryStage: 1
  },
  'PRINT_FIRST_THEN_EMBROIDERY': {
    value: 'PRINT_FIRST_THEN_EMBROIDERY',
    label: 'Printing First, Then Embroidery (Print ➔ Emb ➔ Sew)',
    shortLabel: 'Print First ➔ Embroidery',
    flowDescription: 'Cutting Floor ➔ Printing Studio (Div 04) ➔ Embroidery Studio (Div 05) ➔ Stitching & Sewing Floor (Div 06)',
    isPrintingActive: true,
    isEmbroideryActive: true,
    printingStage: 1,
    embroideryStage: 2
  },
  'EMBROIDERY_FIRST_THEN_PRINT': {
    value: 'EMBROIDERY_FIRST_THEN_PRINT',
    label: 'Embroidery First, Then Printing (Emb ➔ Print ➔ Sew)',
    shortLabel: 'Embroidery First ➔ Print',
    flowDescription: 'Cutting Floor ➔ Embroidery Studio (Div 05) ➔ Printing Studio (Div 04) ➔ Stitching & Sewing Floor (Div 06)',
    isPrintingActive: true,
    isEmbroideryActive: true,
    printingStage: 2,
    embroideryStage: 1
  }
}

export const ALL_ROUTE_OPTIONS: RouteOption[] = [
  EMBELLISHMENT_ROUTE_CONFIGS.PRINT_FIRST_THEN_EMBROIDERY,
  EMBELLISHMENT_ROUTE_CONFIGS.EMBROIDERY_FIRST_THEN_PRINT,
  EMBELLISHMENT_ROUTE_CONFIGS.ONLY_PRINTING,
  EMBELLISHMENT_ROUTE_CONFIGS.ONLY_EMBROIDERY,
  EMBELLISHMENT_ROUTE_CONFIGS.NONE
]

/**
 * Resolves the active embellishment sequence for a buyer or article.
 */
export function resolveArticleRoute(
  buyer?: any,
  articleStyle?: string,
  techPacks: any[] = [],
  orders: any[] = []
): EmbellishmentSequence {
  // 1. Direct field on buyer object
  if (buyer?.embellishment_sequence && EMBELLISHMENT_ROUTE_CONFIGS[buyer.embellishment_sequence as EmbellishmentSequence]) {
    return buyer.embellishment_sequence as EmbellishmentSequence
  }

  const cleanStyle = (articleStyle || buyer?.linked_article_number || '').trim().toUpperCase()

  // 2. Lookup in passed orders
  if (cleanStyle && orders.length > 0) {
    const matchedOrder = orders.find(
      o => (o.style_ref && o.style_ref.trim().toUpperCase() === cleanStyle) ||
           (buyer && o.brand_name && buyer.buyer_name && o.brand_name.toLowerCase() === buyer.buyer_name.toLowerCase())
    )
    if (matchedOrder?.embellishment_sequence && EMBELLISHMENT_ROUTE_CONFIGS[matchedOrder.embellishment_sequence as EmbellishmentSequence]) {
      return matchedOrder.embellishment_sequence as EmbellishmentSequence
    }
  }

  // 3. Lookup in passed tech packs
  if (cleanStyle && techPacks.length > 0) {
    const matchedTp = techPacks.find(
      tp => (tp.style_number && tp.style_number.trim().toUpperCase() === cleanStyle) ||
            (buyer?.linked_article_id && tp.id === buyer.linked_article_id)
    )
    if (matchedTp?.embellishment_sequence && EMBELLISHMENT_ROUTE_CONFIGS[matchedTp.embellishment_sequence as EmbellishmentSequence]) {
      return matchedTp.embellishment_sequence as EmbellishmentSequence
    }
  }

  // 4. Check client-side localStorage if available
  if (typeof window !== 'undefined') {
    try {
      const localOrders = getOrders()
      const matchedLocalOrder = localOrders.find(
        o => (cleanStyle && o.style_ref && o.style_ref.trim().toUpperCase() === cleanStyle) ||
             (buyer && o.brand_name && buyer.buyer_name && o.brand_name.toLowerCase() === buyer.buyer_name.toLowerCase()) ||
             (buyer && o.buyer_id === buyer.id)
      )
      if (matchedLocalOrder?.embellishment_sequence && EMBELLISHMENT_ROUTE_CONFIGS[matchedLocalOrder.embellishment_sequence as EmbellishmentSequence]) {
        return matchedLocalOrder.embellishment_sequence as EmbellishmentSequence
      }

      const localBuyers = getActiveBuyers()
      const matchedLocalBuyer = localBuyers.find(
        b => (buyer && b.id === buyer.id) ||
             (buyer && b.buyer_name && buyer.buyer_name && b.buyer_name.toLowerCase() === buyer.buyer_name.toLowerCase())
      )
      if (matchedLocalBuyer?.embellishment_sequence && EMBELLISHMENT_ROUTE_CONFIGS[matchedLocalBuyer.embellishment_sequence as EmbellishmentSequence]) {
        return matchedLocalBuyer.embellishment_sequence as EmbellishmentSequence
      }

      // Check tech packs in localStorage
      const rawTp = localStorage.getItem('zigza_design_tech_packs_v2')
      if (rawTp) {
        const parsedTps = JSON.parse(rawTp)
        const matchedParsed = parsedTps.find(
          (tp: any) => (cleanStyle && tp.style_number && tp.style_number.trim().toUpperCase() === cleanStyle) ||
                       (buyer?.linked_article_id && tp.id === buyer.linked_article_id)
        )
        if (matchedParsed?.embellishment_sequence && EMBELLISHMENT_ROUTE_CONFIGS[matchedParsed.embellishment_sequence as EmbellishmentSequence]) {
          return matchedParsed.embellishment_sequence as EmbellishmentSequence
        }
      }
    } catch {}
  }

  // Default fallback if unspecified:
  // If style mentions PRINT or PRN, ONLY_PRINTING. If EMB, ONLY_EMBROIDERY.
  if (cleanStyle.includes('PRINT') || cleanStyle.includes('PRN')) return 'ONLY_PRINTING'
  if (cleanStyle.includes('EMB')) return 'ONLY_EMBROIDERY'

  // Default for articles with dual embellishment requirement
  return 'PRINT_FIRST_THEN_EMBROIDERY'
}

/**
 * Printing Division (04) Floor Handover Details
 */
export interface PrintingRouteDetails {
  isActive: boolean
  stage: number // 1 = directly after cutting, 2 = after embroidery, 0 = bypassed
  sourceDepartment: 'Cutting Floor' | 'Embroidery Studio' | 'None (Bypassed)'
  sourceCompletedPieces: number
  inHandPieces: number
  routeConfig: RouteOption
  explanationText: string
  badgeLabel: string
}

export function calculatePrintingRouteDetails(params: {
  route: EmbellishmentSequence
  completedCutPieces: number
  completedEmbroideryPieces: number
  pendingPrintingPieces: number
  completedPrintingPieces: number
}): PrintingRouteDetails {
  const { route, completedCutPieces, completedEmbroideryPieces, pendingPrintingPieces, completedPrintingPieces } = params
  const config = EMBELLISHMENT_ROUTE_CONFIGS[route] || EMBELLISHMENT_ROUTE_CONFIGS['PRINT_FIRST_THEN_EMBROIDERY']

  if (!config.isPrintingActive) {
    return {
      isActive: false,
      stage: 0,
      sourceDepartment: 'None (Bypassed)',
      sourceCompletedPieces: 0,
      inHandPieces: 0,
      routeConfig: config,
      explanationText: `This article route is set to ${config.shortLabel}. Printing is bypassed.`,
      badgeLabel: 'Bypassed in Route'
    }
  }

  if (config.printingStage === 1) {
    // Stage 1: Receives cut pieces directly from Cutting Floor
    const available = Math.max(0, completedCutPieces - pendingPrintingPieces - completedPrintingPieces)
    return {
      isActive: true,
      stage: 1,
      sourceDepartment: 'Cutting Floor',
      sourceCompletedPieces: completedCutPieces,
      inHandPieces: available,
      routeConfig: config,
      explanationText: `${completedCutPieces.toLocaleString('en-IN')} cut pcs received from Cutting Floor`,
      badgeLabel: 'Step 1: Cutting ➔ Printing'
    }
  } else {
    // Stage 2: Receives embroidered pieces from Embroidery Studio
    const available = Math.max(0, completedEmbroideryPieces - pendingPrintingPieces - completedPrintingPieces)
    return {
      isActive: true,
      stage: 2,
      sourceDepartment: 'Embroidery Studio',
      sourceCompletedPieces: completedEmbroideryPieces,
      inHandPieces: available,
      routeConfig: config,
      explanationText: `${completedEmbroideryPieces.toLocaleString('en-IN')} embroidered panels received from Embroidery Studio (Awaiting embroidery verification for remaining)`,
      badgeLabel: 'Step 2: Embroidery ➔ Printing'
    }
  }
}

/**
 * Embroidery Division (05) Floor Handover Details
 */
export interface EmbroideryRouteDetails {
  isActive: boolean
  stage: number // 1 = directly after cutting, 2 = after printing, 0 = bypassed
  sourceDepartment: 'Cutting Floor' | 'Printing Studio' | 'None (Bypassed)'
  sourceCompletedPieces: number
  inHandPieces: number
  routeConfig: RouteOption
  explanationText: string
  badgeLabel: string
}

export function calculateEmbroideryRouteDetails(params: {
  route: EmbellishmentSequence
  completedCutPieces: number
  completedPrintingPieces: number
  pendingEmbroideryPieces: number
  completedEmbroideryPieces: number
}): EmbroideryRouteDetails {
  const { route, completedCutPieces, completedPrintingPieces, pendingEmbroideryPieces, completedEmbroideryPieces } = params
  const config = EMBELLISHMENT_ROUTE_CONFIGS[route] || EMBELLISHMENT_ROUTE_CONFIGS['PRINT_FIRST_THEN_EMBROIDERY']

  if (!config.isEmbroideryActive) {
    return {
      isActive: false,
      stage: 0,
      sourceDepartment: 'None (Bypassed)',
      sourceCompletedPieces: 0,
      inHandPieces: 0,
      routeConfig: config,
      explanationText: `This article route is set to ${config.shortLabel}. Embroidery is bypassed.`,
      badgeLabel: 'Bypassed in Route'
    }
  }

  if (config.embroideryStage === 1) {
    // Stage 1: Receives cut pieces directly from Cutting Floor
    const available = Math.max(0, completedCutPieces - pendingEmbroideryPieces - completedEmbroideryPieces)
    return {
      isActive: true,
      stage: 1,
      sourceDepartment: 'Cutting Floor',
      sourceCompletedPieces: completedCutPieces,
      inHandPieces: available,
      routeConfig: config,
      explanationText: `${completedCutPieces.toLocaleString('en-IN')} cut pcs received from Cutting Floor`,
      badgeLabel: 'Step 1: Cutting ➔ Embroidery'
    }
  } else {
    // Stage 2: Receives printed panels from Printing Studio
    const available = Math.max(0, completedPrintingPieces - pendingEmbroideryPieces - completedEmbroideryPieces)
    return {
      isActive: true,
      stage: 2,
      sourceDepartment: 'Printing Studio',
      sourceCompletedPieces: completedPrintingPieces,
      inHandPieces: available,
      routeConfig: config,
      explanationText: `${completedPrintingPieces.toLocaleString('en-IN')} printed panels received from Printing Studio (Awaiting print curing & verification for remaining)`,
      badgeLabel: 'Step 2: Printing ➔ Embroidery'
    }
  }
}

/**
 * Stitching & Sewing Floor (Division 06) Floor Handover Details
 * Resolves whether cut pieces come directly from Cutting Floor, or from Printing / Embroidery
 * depending on the embellishment route set in the tech pack.
 */
export interface StitchingRouteDetails {
  sourceDepartment: 'Cutting Floor' | 'Printing Studio' | 'Embroidery Studio'
  sourceCompletedPieces: number
  inHandPieces: number
  routeConfig: RouteOption
  explanationText: string
  badgeLabel: string
}

export function calculateStitchingRouteDetails(params: {
  route: EmbellishmentSequence
  completedCutPieces: number
  completedPrintingPieces: number
  completedEmbroideryPieces: number
  pendingStitchingPieces: number
  completedStitchingPieces: number
}): StitchingRouteDetails {
  const {
    route,
    completedCutPieces,
    completedPrintingPieces,
    completedEmbroideryPieces,
    pendingStitchingPieces,
    completedStitchingPieces
  } = params

  const config = EMBELLISHMENT_ROUTE_CONFIGS[route] || EMBELLISHMENT_ROUTE_CONFIGS['NONE']

  if (route === 'NONE') {
    // Cut & Sew Direct (Bypasses Printing & Embroidery)
    const available = Math.max(0, completedCutPieces - pendingStitchingPieces - completedStitchingPieces)
    return {
      sourceDepartment: 'Cutting Floor',
      sourceCompletedPieces: completedCutPieces,
      inHandPieces: available,
      routeConfig: config,
      explanationText: `${completedCutPieces.toLocaleString('en-IN')} cut pcs received directly from Cutting Floor (Cut & Sew Direct)`,
      badgeLabel: 'Step 1: Cutting ➔ Sewing (Direct)'
    }
  }

  if (route === 'ONLY_PRINTING') {
    // Cutting -> Printing -> Sewing
    const available = Math.max(0, completedPrintingPieces - pendingStitchingPieces - completedStitchingPieces)
    return {
      sourceDepartment: 'Printing Studio',
      sourceCompletedPieces: completedPrintingPieces,
      inHandPieces: available,
      routeConfig: config,
      explanationText: `${completedPrintingPieces.toLocaleString('en-IN')} printed panels received from Printing Studio (Step 2/2 completed)`,
      badgeLabel: 'Step 2: Printing ➔ Sewing'
    }
  }

  if (route === 'ONLY_EMBROIDERY') {
    // Cutting -> Embroidery -> Sewing
    const available = Math.max(0, completedEmbroideryPieces - pendingStitchingPieces - completedStitchingPieces)
    return {
      sourceDepartment: 'Embroidery Studio',
      sourceCompletedPieces: completedEmbroideryPieces,
      inHandPieces: available,
      routeConfig: config,
      explanationText: `${completedEmbroideryPieces.toLocaleString('en-IN')} embroidered panels received from Embroidery Studio (Step 2/2 completed)`,
      badgeLabel: 'Step 2: Embroidery ➔ Sewing'
    }
  }

  if (route === 'PRINT_FIRST_THEN_EMBROIDERY') {
    // Cutting -> Printing -> Embroidery -> Sewing
    const available = Math.max(0, completedEmbroideryPieces - pendingStitchingPieces - completedStitchingPieces)
    return {
      sourceDepartment: 'Embroidery Studio',
      sourceCompletedPieces: completedEmbroideryPieces,
      inHandPieces: available,
      routeConfig: config,
      explanationText: `${completedEmbroideryPieces.toLocaleString('en-IN')} fully printed & embroidered panels received from Embroidery Studio`,
      badgeLabel: 'Step 3: Embroidery ➔ Sewing (Print ➔ Emb ➔ Sew)'
    }
  }

  // EMBROIDERY_FIRST_THEN_PRINT (Cutting -> Embroidery -> Printing -> Sewing)
  const available = Math.max(0, completedPrintingPieces - pendingStitchingPieces - completedStitchingPieces)
  return {
    sourceDepartment: 'Printing Studio',
    sourceCompletedPieces: completedPrintingPieces,
    inHandPieces: available,
    routeConfig: config,
    explanationText: `${completedPrintingPieces.toLocaleString('en-IN')} fully embroidered & printed panels received from Printing Studio`,
    badgeLabel: 'Step 3: Printing ➔ Sewing (Emb ➔ Print ➔ Sew)'
  }
}

/**
 * Helper to update and synchronize route changes across all floor modules
 */
export function setAndSyncArticleRoute(buyerId: string, buyerName: string, newRoute: EmbellishmentSequence) {
  if (typeof window === 'undefined') return

  try {
    // 1. Update active buyer in storage
    const buyers = getActiveBuyers()
    const buyerIndex = buyers.findIndex(
      b => b.id === buyerId || (b.buyer_name && b.buyer_name.toLowerCase() === buyerName.toLowerCase())
    )
    if (buyerIndex >= 0) {
      buyers[buyerIndex] = {
        ...buyers[buyerIndex],
        embellishment_sequence: newRoute,
        updated_at: new Date().toISOString()
      }
      localStorage.setItem('zigza_merchandising_active_buyers_v2', JSON.stringify(buyers))
    }

    // 2. Update matching order if any
    const orders = getOrders()
    let orderUpdated = false
    const updatedOrders = orders.map(o => {
      if ((o.buyer_id && o.buyer_id === buyerId) || 
          (o.brand_name && o.brand_name.toLowerCase() === buyerName.toLowerCase())) {
        orderUpdated = true
        return { ...o, embellishment_sequence: newRoute }
      }
      return o
    })
    if (orderUpdated) {
      localStorage.setItem('zigza_merchandising_orders_v2', JSON.stringify(updatedOrders))
    }

    // 3. Emit floor synchronization events
    window.dispatchEvent(new CustomEvent(MERCHANDISING_UPDATE_EVENT))
    window.dispatchEvent(new Event(CUTTING_UPDATE_EVENT))
    window.dispatchEvent(new Event(PRINTING_FLOOR_UPDATE_EVENT))
    window.dispatchEvent(new Event(EMBROIDERY_FLOOR_UPDATE_EVENT))
    window.dispatchEvent(new Event('stitching_floor_updated'))
  } catch (err) {
    console.error('Failed to sync article route:', err)
  }
}
