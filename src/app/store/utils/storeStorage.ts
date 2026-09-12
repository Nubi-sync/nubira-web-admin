'use client'

// ============================================================================
// Zigza MES Enterprise - Division 11: Central Store Godown
// Reactive Client-Side Storage & ASTM D5430 Calculation Engine
// ============================================================================

import {
  FabricRoll,
  TrimsInventoryItem,
  TruckInwardGateRecord,
  MaterialFloorIssueChallan,
  FinishedExportPallet,
  CentralStoreMetrics,
  ShadeGroup,
  FabricInspectionStatus
} from '../types/store'
import {
  INITIAL_FABRIC_ROLLS,
  INITIAL_TRIMS_INVENTORY,
  INITIAL_TRUCK_INWARDS,
  INITIAL_MATERIAL_ISSUES,
  INITIAL_EXPORT_PALLETS,
  INITIAL_STORE_METRICS
} from '../data/initialStoreData'

export const STORE_UPDATE_EVENT = 'zigza:central_store_updated'

const STORAGE_KEYS = {
  FABRIC_ROLLS: 'zigza_store_fabric_rolls_v1',
  TRIMS: 'zigza_store_trims_inventory_v1',
  TRUCK_INWARDS: 'zigza_store_truck_inwards_v1',
  MATERIAL_ISSUES: 'zigza_store_material_issues_v1',
  EXPORT_PALLETS: 'zigza_store_export_pallets_v1',
  METRICS: 'zigza_store_metrics_v1'
}

function broadcastUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORE_UPDATE_EVENT))
  }
}

// ----------------------------------------------------------------------------
// ASTM D5430 4-POINT CALCULATION ENGINE
// Standard Formula: Points / 100 sq yds = (Total Penalty Points * 3600) / (Length Yards * Width Inches)
// Pass Threshold: <= 28.0 points per 100 square yards
// ----------------------------------------------------------------------------
export function calculate4PointScore(
  totalPenaltyPoints: number,
  inspectedLengthYards: number,
  cuttableWidthInches: number
): { pointsPer100SqYd: number; verdict: FabricInspectionStatus } {
  if (!inspectedLengthYards || inspectedLengthYards <= 0 || !cuttableWidthInches || cuttableWidthInches <= 0) {
    return { pointsPer100SqYd: 0, verdict: 'PENDING_INSPECTION' }
  }

  const score = (totalPenaltyPoints * 3600) / (inspectedLengthYards * cuttableWidthInches)
  const roundedScore = Math.round(score * 10) / 10
  const verdict: FabricInspectionStatus = roundedScore <= 28.0 ? 'PASSED' : 'REJECTED'

  return { pointsPer100SqYd: roundedScore, verdict }
}

// ----------------------------------------------------------------------------
// 1. FABRIC ROLLS CRUD
// ----------------------------------------------------------------------------
export function getFabricRolls(): FabricRoll[] {
  if (typeof window === 'undefined') return INITIAL_FABRIC_ROLLS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FABRIC_ROLLS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FABRIC_ROLLS, JSON.stringify(INITIAL_FABRIC_ROLLS))
      return INITIAL_FABRIC_ROLLS
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load fabric rolls from localStorage:', e)
    return INITIAL_FABRIC_ROLLS
  }
}

export function saveFabricRoll(roll: FabricRoll): FabricRoll[] {
  const current = getFabricRolls()
  const exists = current.some(r => r.id === roll.id)
  const updated = exists ? current.map(r => (r.id === roll.id ? roll : r)) : [roll, ...current]

  try {
    localStorage.setItem(STORAGE_KEYS.FABRIC_ROLLS, JSON.stringify(updated))
    broadcastUpdate()
  } catch (e) {
    console.error('Failed to save fabric roll:', e)
  }
  return updated
}

export function updateFabricRollInspection(
  rollId: string,
  data: {
    measuredGsm: number
    measuredWidthInches: number
    points1: number
    points2: number
    points3: number
    points4: number
    shadeGroup: ShadeGroup
    inspectorName: string
    inspectorId: string
    godownRackLocation: string
    notes?: string
  }
): FabricRoll | null {
  const current = getFabricRolls()
  const roll = current.find(r => r.id === rollId)
  if (!roll) return null

  const totalPoints = data.points1 * 1 + data.points2 * 2 + data.points3 * 3 + data.points4 * 4
  const yards = roll.netMeterage * 1.09361 // Convert meters to yards
  const { pointsPer100SqYd, verdict } = calculate4PointScore(totalPoints, yards, data.measuredWidthInches)

  const updatedRoll: FabricRoll = {
    ...roll,
    measuredGsm: data.measuredGsm,
    measuredWidthInches: data.measuredWidthInches,
    penaltyPointsTotal: totalPoints,
    pointsPer100SqYd,
    inspectionStatus: verdict,
    shadeGroup: data.shadeGroup,
    inspectorId: data.inspectorId,
    inspectorName: data.inspectorName,
    inspectedAt: new Date().toISOString(),
    godownRackLocation: data.godownRackLocation,
    notes: data.notes || roll.notes,
    defectBreakdown: {
      points1: data.points1,
      points2: data.points2,
      points3: data.points3,
      points4: data.points4
    }
  }

  saveFabricRoll(updatedRoll)
  return updatedRoll
}

// ----------------------------------------------------------------------------
// 2. TRIMS & ACCESSORIES WAREHOUSE
// ----------------------------------------------------------------------------
export function getTrimsInventory(): TrimsInventoryItem[] {
  if (typeof window === 'undefined') return INITIAL_TRIMS_INVENTORY
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRIMS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRIMS, JSON.stringify(INITIAL_TRIMS_INVENTORY))
      return INITIAL_TRIMS_INVENTORY
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load trims inventory:', e)
    return INITIAL_TRIMS_INVENTORY
  }
}

export function saveTrimsItem(item: TrimsInventoryItem): TrimsInventoryItem[] {
  const current = getTrimsInventory()
  const exists = current.some(t => t.id === item.id)
  const updated = exists ? current.map(t => (t.id === item.id ? item : t)) : [item, ...current]

  try {
    localStorage.setItem(STORAGE_KEYS.TRIMS, JSON.stringify(updated))
    broadcastUpdate()
  } catch (e) {
    console.error('Failed to save trims item:', e)
  }
  return updated
}

export function adjustTrimsStock(
  itemId: string,
  adjustmentQty: number,
  mode: 'ADD' | 'SUBTRACT' | 'SET',
  reason?: string
): TrimsInventoryItem | null {
  const current = getTrimsInventory()
  const item = current.find(t => t.id === itemId)
  if (!item) return null

  let newStock = item.currentStock
  if (mode === 'ADD') newStock += adjustmentQty
  else if (mode === 'SUBTRACT') newStock = Math.max(0, newStock - adjustmentQty)
  else if (mode === 'SET') newStock = Math.max(0, adjustmentQty)

  const updatedItem: TrimsInventoryItem = {
    ...item,
    currentStock: newStock,
    lastReplenishedAt: new Date().toISOString().split('T')[0]
  }

  saveTrimsItem(updatedItem)
  return updatedItem
}

// ----------------------------------------------------------------------------
// 3. TRUCK INWARD GATE & WEIGHBRIDGE GRN
// ----------------------------------------------------------------------------
export function getTruckInwards(): TruckInwardGateRecord[] {
  if (typeof window === 'undefined') return INITIAL_TRUCK_INWARDS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRUCK_INWARDS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRUCK_INWARDS, JSON.stringify(INITIAL_TRUCK_INWARDS))
      return INITIAL_TRUCK_INWARDS
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load truck inwards:', e)
    return INITIAL_TRUCK_INWARDS
  }
}

export function saveTruckInwardRecord(record: TruckInwardGateRecord): TruckInwardGateRecord[] {
  const current = getTruckInwards()
  const exists = current.some(r => r.id === record.id)
  const updated = exists ? current.map(r => (r.id === record.id ? record : r)) : [record, ...current]

  try {
    localStorage.setItem(STORAGE_KEYS.TRUCK_INWARDS, JSON.stringify(updated))
    broadcastUpdate()
  } catch (e) {
    console.error('Failed to save truck inward record:', e)
  }
  return updated
}

// ----------------------------------------------------------------------------
// 4. MATERIAL FLOOR ISSUE CHALLANS
// ----------------------------------------------------------------------------
export function getMaterialIssues(): MaterialFloorIssueChallan[] {
  if (typeof window === 'undefined') return INITIAL_MATERIAL_ISSUES
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIAL_ISSUES)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MATERIAL_ISSUES, JSON.stringify(INITIAL_MATERIAL_ISSUES))
      return INITIAL_MATERIAL_ISSUES
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load material issues:', e)
    return INITIAL_MATERIAL_ISSUES
  }
}

export function createMaterialIssueChallan(challan: MaterialFloorIssueChallan): MaterialFloorIssueChallan[] {
  const current = getMaterialIssues()
  const updated = [challan, ...current]

  // If rolls were issued, update roll status in godown
  if (challan.destinationDivision === 'CUTTING_FLOOR') {
    const rolls = getFabricRolls()
    const updatedRolls = rolls.map(r => {
      if (challan.scannedBarcodes.includes(r.rollBarcode)) {
        return { ...r, isIssuedToCutting: true, allocatedOrderId: challan.orderId }
      }
      return r
    })
    try {
      localStorage.setItem(STORAGE_KEYS.FABRIC_ROLLS, JSON.stringify(updatedRolls))
    } catch (_) {}
  }

  try {
    localStorage.setItem(STORAGE_KEYS.MATERIAL_ISSUES, JSON.stringify(updated))
    broadcastUpdate()
  } catch (e) {
    console.error('Failed to save material issue challan:', e)
  }
  return updated
}

export function acceptMaterialIssue(challanId: string): MaterialFloorIssueChallan | null {
  const current = getMaterialIssues()
  const challan = current.find(c => c.id === challanId)
  if (!challan) return null

  const updated: MaterialFloorIssueChallan = {
    ...challan,
    status: 'ACCEPTED_BY_FLOOR',
    acceptedAt: new Date().toISOString()
  }

  const list = current.map(c => (c.id === challanId ? updated : c))
  try {
    localStorage.setItem(STORAGE_KEYS.MATERIAL_ISSUES, JSON.stringify(list))
    broadcastUpdate()
  } catch (_) {}

  return updated
}

// ----------------------------------------------------------------------------
// 5. FINISHED GOODS EXPORT PALLETS & CONTAINER STUFFING
// ----------------------------------------------------------------------------
export function getExportPallets(): FinishedExportPallet[] {
  if (typeof window === 'undefined') return INITIAL_EXPORT_PALLETS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPORT_PALLETS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPORT_PALLETS, JSON.stringify(INITIAL_EXPORT_PALLETS))
      return INITIAL_EXPORT_PALLETS
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load export pallets:', e)
    return INITIAL_EXPORT_PALLETS
  }
}

export function saveExportPallet(pallet: FinishedExportPallet): FinishedExportPallet[] {
  const current = getExportPallets()
  const exists = current.some(p => p.id === pallet.id)
  const updated = exists ? current.map(p => (p.id === pallet.id ? pallet : p)) : [pallet, ...current]

  try {
    localStorage.setItem(STORAGE_KEYS.EXPORT_PALLETS, JSON.stringify(updated))
    broadcastUpdate()
  } catch (e) {
    console.error('Failed to save export pallet:', e)
  }
  return updated
}

export function assignContainerStuffing(
  palletIds: string[],
  containerNumber: string,
  destinationPort?: string
): FinishedExportPallet[] {
  const current = getExportPallets()
  const now = new Date().toISOString()
  const updated = current.map(p => {
    if (palletIds.includes(p.id)) {
      return {
        ...p,
        shippingStatus: 'STUFFED_IN_CONTAINER' as const,
        containerNumber,
        destinationPort: destinationPort || p.destinationPort,
        stuffedAt: now
      }
    }
    return p
  })

  try {
    localStorage.setItem(STORAGE_KEYS.EXPORT_PALLETS, JSON.stringify(updated))
    broadcastUpdate()
  } catch (_) {}

  return updated
}

// ----------------------------------------------------------------------------
// 6. STORE METRICS SUMMARY
// ----------------------------------------------------------------------------
export function getStoreMetrics(): CentralStoreMetrics {
  const rolls = getFabricRolls()
  const trims = getTrimsInventory()
  const pallets = getExportPallets()
  const challans = getMaterialIssues()
  const trucks = getTruckInwards()

  const totalRolls = rolls.length
  const totalWeightKg = rolls.reduce((acc, r) => acc + (r.grossWeightKg || 0), 0)
  const weightTons = Math.round((totalWeightKg / 1000) * 10) / 10

  const totalFinishedPcs = pallets.reduce((acc, p) => acc + (p.totalPcs || 0), 0)
  const todayStr = new Date().toISOString().split('T')[0]
  const challansToday = challans.filter(c => c.issuedAt.startsWith(todayStr)).length
  const trucksToday = trucks.filter(t => t.arrivalTimestamp.startsWith(todayStr)).length

  const inspectedRolls = rolls.filter(r => r.inspectionStatus !== 'PENDING_INSPECTION')
  const passedRolls = rolls.filter(r => r.inspectionStatus === 'PASSED')
  const passRate = inspectedRolls.length > 0 
    ? Math.round((passedRolls.length / inspectedRolls.length) * 1000) / 10 
    : 96.4

  const lowStockTrims = trims.filter(t => t.currentStock <= t.reorderLevel).length

  return {
    totalFabricRollsInGodown: totalRolls > 0 ? totalRolls : INITIAL_STORE_METRICS.totalFabricRollsInGodown,
    totalFabricWeightTons: weightTons > 0 ? weightTons : INITIAL_STORE_METRICS.totalFabricWeightTons,
    totalFinishedExportPcs: totalFinishedPcs > 0 ? totalFinishedPcs : INITIAL_STORE_METRICS.totalFinishedExportPcs,
    challansIssuedToday: challansToday > 0 ? challansToday : INITIAL_STORE_METRICS.challansIssuedToday,
    inventoryLedgerAccuracy: INITIAL_STORE_METRICS.inventoryLedgerAccuracy,
    trucksAtGateToday: trucksToday > 0 ? trucksToday : INITIAL_STORE_METRICS.trucksAtGateToday,
    fourPointAuditPassRate: passRate,
    lowStockTrimsCount: lowStockTrims
  }
}
