import { 
  MerchandisingOrder, 
  BomCosting, 
  TnaMilestone, 
  SourcingRequisition, 
  ExportShipment 
} from '../types/merchandising'
import { 
  INITIAL_ORDERS, 
  INITIAL_BOM_COSTINGS, 
  INITIAL_TNA_MILESTONES, 
  INITIAL_SOURCING_REQUISITIONS, 
  INITIAL_EXPORT_SHIPMENTS 
} from '../data/initialData'

const STORAGE_KEYS = {
  ORDERS: 'zigza_merchandising_orders_v1',
  BOM_COSTINGS: 'zigza_merchandising_bom_costings_v1',
  TNA_MILESTONES: 'zigza_merchandising_tna_milestones_v1',
  SOURCING_PR: 'zigza_merchandising_sourcing_pr_v1',
  SHIPMENTS: 'zigza_merchandising_shipments_v1'
}

export const MERCHANDISING_UPDATE_EVENT = 'zigza:merchandising_updated'

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MERCHANDISING_UPDATE_EVENT))
  }
}

// ==========================================
// 1. ORDERS
// ==========================================
export function getOrders(): MerchandisingOrder[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS))
      return INITIAL_ORDERS
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to load merchandising orders from localStorage:', err)
    return INITIAL_ORDERS
  }
}

export function saveOrder(order: MerchandisingOrder): MerchandisingOrder[] {
  const current = getOrders()
  const existsIndex = current.findIndex(o => o.id === order.id || o.po_number === order.po_number)
  let updated: MerchandisingOrder[]
  if (existsIndex >= 0) {
    updated = [...current]
    updated[existsIndex] = order
  } else {
    updated = [order, ...current]
  }
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated))
  emitUpdate()
  return updated
}

// ==========================================
// 2. BOM COSTINGS
// ==========================================
export function getBomCostings(): BomCosting[] {
  if (typeof window === 'undefined') return INITIAL_BOM_COSTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOM_COSTINGS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOM_COSTINGS, JSON.stringify(INITIAL_BOM_COSTINGS))
      return INITIAL_BOM_COSTINGS
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to load BOM costings from localStorage:', err)
    return INITIAL_BOM_COSTINGS
  }
}

export function saveBomCosting(sheet: BomCosting): BomCosting[] {
  const current = getBomCostings()
  const existsIndex = current.findIndex(b => b.id === sheet.id || b.po_number === sheet.po_number)
  let updated: BomCosting[]
  if (existsIndex >= 0) {
    updated = [...current]
    updated[existsIndex] = sheet
  } else {
    updated = [sheet, ...current]
  }
  localStorage.setItem(STORAGE_KEYS.BOM_COSTINGS, JSON.stringify(updated))
  emitUpdate()
  return updated
}

// ==========================================
// 3. T&A MILESTONES
// ==========================================
export function getTnaMilestones(): TnaMilestone[] {
  if (typeof window === 'undefined') return INITIAL_TNA_MILESTONES
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TNA_MILESTONES)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TNA_MILESTONES, JSON.stringify(INITIAL_TNA_MILESTONES))
      return INITIAL_TNA_MILESTONES
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to load T&A milestones from localStorage:', err)
    return INITIAL_TNA_MILESTONES
  }
}

export function saveTnaMilestone(milestone: TnaMilestone): TnaMilestone[] {
  const current = getTnaMilestones()
  const existsIndex = current.findIndex(m => m.id === milestone.id)
  let updated: TnaMilestone[]
  if (existsIndex >= 0) {
    updated = [...current]
    updated[existsIndex] = milestone
  } else {
    updated = [...current, milestone]
  }
  localStorage.setItem(STORAGE_KEYS.TNA_MILESTONES, JSON.stringify(updated))
  emitUpdate()
  return updated
}

// ==========================================
// 4. SOURCING REQUISITIONS (PR)
// ==========================================
export function getSourcingRequisitions(): SourcingRequisition[] {
  if (typeof window === 'undefined') return INITIAL_SOURCING_REQUISITIONS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOURCING_PR)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SOURCING_PR, JSON.stringify(INITIAL_SOURCING_REQUISITIONS))
      return INITIAL_SOURCING_REQUISITIONS
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to load Sourcing PRs from localStorage:', err)
    return INITIAL_SOURCING_REQUISITIONS
  }
}

export function saveSourcingRequisition(req: SourcingRequisition): SourcingRequisition[] {
  const current = getSourcingRequisitions()
  const existsIndex = current.findIndex(r => r.id === req.id || r.pr_number === req.pr_number)
  let updated: SourcingRequisition[]
  if (existsIndex >= 0) {
    updated = [...current]
    updated[existsIndex] = req
  } else {
    updated = [req, ...current]
  }
  localStorage.setItem(STORAGE_KEYS.SOURCING_PR, JSON.stringify(updated))
  emitUpdate()
  return updated
}

// ==========================================
// 5. EXPORT SHIPMENTS
// ==========================================
export function getShipments(): ExportShipment[] {
  if (typeof window === 'undefined') return INITIAL_EXPORT_SHIPMENTS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIPMENTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(INITIAL_EXPORT_SHIPMENTS))
      return INITIAL_EXPORT_SHIPMENTS
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to load export shipments from localStorage:', err)
    return INITIAL_EXPORT_SHIPMENTS
  }
}

export function saveShipment(shipment: ExportShipment): ExportShipment[] {
  const current = getShipments()
  const existsIndex = current.findIndex(s => s.id === shipment.id || s.shipment_ref === shipment.shipment_ref)
  let updated: ExportShipment[]
  if (existsIndex >= 0) {
    updated = [...current]
    updated[existsIndex] = shipment
  } else {
    updated = [shipment, ...current]
  }
  localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(updated))
  emitUpdate()
  return updated
}
