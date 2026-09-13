// ============================================================================
// Zigza MES Enterprise - Division 11: Central Store Godown
// Initial Store Data Specifications
// ============================================================================

import {
  FabricRoll,
  TrimsInventoryItem,
  TruckInwardGateRecord,
  MaterialFloorIssueChallan,
  FinishedExportPallet,
  CentralStoreMetrics
} from '../types/store'

export const INITIAL_FABRIC_ROLLS: FabricRoll[] = []
export const INITIAL_TRIMS_INVENTORY: TrimsInventoryItem[] = []
export const INITIAL_TRUCK_INWARDS: TruckInwardGateRecord[] = []
export const INITIAL_MATERIAL_ISSUES: MaterialFloorIssueChallan[] = []
export const INITIAL_EXPORT_PALLETS: FinishedExportPallet[] = []

export const INITIAL_STORE_METRICS: CentralStoreMetrics = {
  totalFabricRollsInGodown: 0,
  totalFabricWeightTons: 0,
  totalFinishedExportPcs: 0,
  challansIssuedToday: 0,
  inventoryLedgerAccuracy: 100,
  trucksAtGateToday: 0,
  fourPointAuditPassRate: 100,
  lowStockTrimsCount: 0
}
