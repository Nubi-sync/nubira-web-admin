export type CartonStatus = 
  | 'PACKED' 
  | 'AQL_AUDIT_PASSED' 
  | 'QUARANTINED_AQL_FAILED' 
  | 'UNPACKED_FOR_REWORK' 
  | 'SHIPPED'

export type AqlAuditDecision = 
  | 'PASS' 
  | 'RE_AUDIT' 
  | 'REJECT_QUARANTINE'

export type DefectCategory = 'CRITICAL' | 'MAJOR' | 'MINOR'

export interface DefectDetail {
  type: string
  category: DefectCategory
  count: number
  description?: string
}

export interface ReadyGoodsCarton {
  id: string
  cartonNumber: string // e.g. CTN-001, CTN-084
  orderId: string
  orderNumber: string // e.g. PO-7714
  buyer: string // e.g. Urban Outfitters, Zara Men
  styleName: string // e.g. French Terry Hoodie
  color: string
  totalPieces: number
  sizeBreakdown: Record<string, number> // e.g. { "S": 10, "M": 15, "L": 15 }
  packedBundleIds: string[] // Scanned bundle QR tickets e.g. ['BDL-7714-01', 'BDL-7714-02']
  measuredGrossWeightKg: number // Digital weighbridge measured weight
  expectedGrossWeightKg: number // BOM theoretical weight
  weightVarianceKg: number // measured - expected
  status: CartonStatus
  godownBay: 'BAY_3' | 'BAY_4' | 'BAY_5'
  dimensionsCm: string // e.g. 60x40x40
  cbmVolume: number // e.g. 0.096
  sealedBy: string
  createdAt: string
  updatedAt?: string
}

export interface AqlAudit {
  id: string
  auditNumber: string // Pattern: ^AQL-[0-9]{5,8}$
  orderId: string
  orderNumber: string
  cartonId: string
  cartonNumber: string
  inspectorId: string
  inspectorName: string
  lotSizePieces: number
  sampleSizeAudited: number // ISO 2859-1 Level II normal sample size
  criticalDefects: number // 0 allowed
  majorDefects: number // <= 10 allowed (AQL 2.5)
  minorDefects: number // <= 14 allowed (AQL 4.0)
  auditDecision: AqlAuditDecision
  defects: DefectDetail[]
  remarks?: string
  auditDate: string
}

export interface HangtagVerification {
  id: string
  scanCode: string // EAN-13 or UPC-A barcode e.g. 8901234567890
  orderNumber: string
  sku: string
  styleName: string
  size: string
  color: string
  kimbleFastenerAttached: boolean
  silicaGelInserted: boolean
  polybagHeatSealed: boolean
  scanStatus: 'VERIFIED_OK' | 'MISMATCH_ERROR' | 'MISSING_BARCODE'
  operatorName: string
  scannedAt: string
}

export interface ScaleWeightLog {
  id: string
  scaleId: string // e.g. SCALE-BAY-03
  cartonNumber: string
  orderNumber: string
  styleName: string
  measuredWeightKg: number
  expectedWeightKg: number
  varianceKg: number
  tolerancePassed: boolean // |variance| <= 0.15 kg
  scaleCalibrationStatus: 'CALIBRATED' | 'CALIBRATION_DUE'
  auditorName: string
  loggedAt: string
}

export interface GodownHandoverPallet {
  id: string
  palletCode: string // e.g. PLT-9901
  orderNumber: string
  buyer: string
  cartonIds: string[]
  cartonNumbers: string[]
  totalCartons: number
  totalPieces: number
  totalGrossWeightKg: number
  totalCbm: number
  targetBay: 'BAY_3' | 'BAY_4' | 'BAY_5'
  dockGate: 'DOCK_01' | 'DOCK_02' | 'DOCK_03'
  gatePassStatus: 'READY_FOR_STUFFING' | 'STOCKED_IN_BAY' | 'DISPATCHED_CONTAINER'
  supervisorSignoff: string
  handoverDate: string
}

export interface ReadyGoodsMetrics {
  totalPackedCartonsToday: number
  totalGarmentsPackedToday: number
  aqlScorePassPct: number
  aqlAuditCountToday: number
  barcodeMatchPct: number
  readyInGodownPcs: number
  quarantinedCartonsCount: number
}
