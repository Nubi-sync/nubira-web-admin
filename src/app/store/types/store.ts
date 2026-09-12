// ============================================================================
// Zigza MES Enterprise - Division 11: Central Store Godown & Finished Vault
// Domain Types & ASTM D5430 4-Point Fabric Inspection Specifications
// ============================================================================

export type ShadeGroup = 'SHADE_A' | 'SHADE_B' | 'SHADE_C'

export type FabricInspectionStatus = 'PENDING_INSPECTION' | 'PASSED' | 'REJECTED'

export type TrimCategory = 
  | 'SEWING_THREAD' 
  | 'ZIPPERS' 
  | 'BUTTONS' 
  | 'LABELS' 
  | 'PACKAGING' 
  | 'ELASTIC_TAPE'
  | 'INTERLINING'

export type GateSecurityStatus = 
  | 'GATE_INWARDED' 
  | 'WEIGHBRIDGE_COMPLETED' 
  | 'UNLOADED_VERIFIED'

export type GateItemCategory = 
  | 'RAW_FABRIC_ROLL' 
  | 'TRIMS' 
  | 'PACKAGING' 
  | 'CHEMICAL'

export type MaterialDestination = 
  | 'CUTTING_FLOOR' 
  | 'SEWING_FLOOR'

export type IssueChallanStatus = 
  | 'PREPARED' 
  | 'IN_TRANSIT_TO_FLOOR' 
  | 'ACCEPTED_BY_FLOOR'

export type ExportBayLocation = 
  | 'BAY_3' 
  | 'BAY_4' 
  | 'BAY_5'

export type PalletShippingStatus = 
  | 'STAGED_IN_BAY' 
  | 'STUFFED_IN_CONTAINER' 
  | 'EXPORT_DISPATCHED'

export interface FabricRollDefects {
  points1: number // defects up to 3 inches (1 pt)
  points2: number // defects 3 to 6 inches (2 pt)
  points3: number // defects 6 to 9 inches (3 pt)
  points4: number // defects over 9 inches or holes (4 pt)
}

export interface FabricRoll {
  id: string
  rollBarcode: string
  supplierName: string
  fabricType: string
  colorShade: string
  shadeGroup: ShadeGroup
  grossWeightKg: number
  netMeterage: number
  measuredGsm: number
  targetGsm: number
  measuredWidthInches: number
  targetWidthInches: number
  penaltyPointsTotal: number
  pointsPer100SqYd: number
  inspectionStatus: FabricInspectionStatus
  inspectorId: string
  inspectorName: string
  inspectedAt?: string
  godownRackLocation: string
  isIssuedToCutting: boolean
  allocatedOrderId?: string
  defectBreakdown?: FabricRollDefects
  notes?: string
}

export interface TrimsInventoryItem {
  id: string
  itemCode: string
  itemName: string
  category: TrimCategory
  binLocation: string
  currentStock: number
  reorderLevel: number
  unit: string
  supplierName: string
  leadTimeDays: number
  lastReplenishedAt: string
  color?: string
  unitCostInr?: number
}

export interface TruckInwardGateRecord {
  id: string
  grnNumber: string
  vehicleNumber: string
  supplierName: string
  poReference: string
  driverPhone: string
  driverName: string
  arrivalTimestamp: string
  grossWeightKg: number
  tareWeightKg: number
  netWeightKg: number
  itemCategory: GateItemCategory
  totalPackages: number
  gateSecurityStatus: GateSecurityStatus
  receiverInspector: string
  remarks?: string
}

export interface MaterialFloorIssueChallan {
  id: string
  issueChallanNo: string
  destinationDivision: MaterialDestination
  orderId: string
  articleNo: string
  buyerName: string
  receiverEmployeeId: string
  receiverName: string
  issuedBy: string
  scannedBarcodes: string[]
  materialSummary: string
  quantityIssued: number
  unit: string
  status: IssueChallanStatus
  issuedAt: string
  acceptedAt?: string
  notes?: string
}

export interface FinishedExportPallet {
  id: string
  palletId: string
  buyerName: string
  orderNumber: string
  styleDescription: string
  bayLocation: ExportBayLocation
  rackNumber: string
  cartonCount: number
  totalPcs: number
  grossWeightKg: number
  aqlPassSealNumber: string
  destinationCountry: string
  destinationPort?: string
  shippingStatus: PalletShippingStatus
  containerNumber?: string
  stagedAt: string
  stuffedAt?: string
}

export interface CentralStoreMetrics {
  totalFabricRollsInGodown: number
  totalFabricWeightTons: number
  totalFinishedExportPcs: number
  challansIssuedToday: number
  inventoryLedgerAccuracy: number
  trucksAtGateToday: number
  fourPointAuditPassRate: number
  lowStockTrimsCount: number
}
