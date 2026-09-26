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

// -----------------------------------------------------------------------------
// WORKER, QUALITY CHECKING & INTEGRATED ALTERATION TYPES
// -----------------------------------------------------------------------------

export type ReadyGoodsWorkerRole = 'CHECKER' | 'PACKER' | 'BOTH'

export interface ReadyGoodsWorker {
  id: string
  worker_name: string
  phone_number: string
  role: ReadyGoodsWorkerRole // 'CHECKER' | 'PACKER' | 'BOTH'
  assigned_station: string // e.g. "Inspection Table 01", "Packing Conveyor 02"
  shift: 'MORNING' | 'EVENING' | 'NIGHT'
  status: 'ACTIVE' | 'ON_BREAK' | 'OFFLINE'
  inspected_pieces: number
  packed_cartons: number
  company_name?: string
  created_at: string
}

export type InspectionTaskStatus = 
  | 'PENDING_CHECK' 
  | 'IN_CHECKING' 
  | 'PASSED_TO_PACKING' 
  | 'REJECTED_TO_ALTERATION' 
  | 'PACKED_IN_CARTON'

export interface InspectionChecklist {
  cutting_done_right: boolean // Pattern symmetry, notches, grain line
  printing_done_right?: boolean // Only applicable if tech pack has printing
  embroidery_done_right?: boolean // Only applicable if tech pack has embroidery
  washing_done_right: boolean // Shade, hand feel, no odor
  iron_done_right: boolean // Seams flat, no shine marks, crisp finish
}

export interface FinishingInspectionTask {
  id: string
  task_code: string // e.g. "FIN-QC-7714-01"
  order_number: string // e.g. "PO-7714"
  buyer: string // e.g. "Urban Outfitters"
  style_name: string // e.g. "French Terry Relaxed Hoodie"
  color: string
  size: string
  pieces_count: number
  origin_stage: 'WASHING_AND_IRON' | 'REPAIRED_ALTERATION_REINSPECTION'
  wash_batch_ref: string // e.g. "WB-082 (Silicon Softener Wash)"
  iron_station_ref: string // e.g. "Vacuum Press Table 03"
  
  // Tech-Pack embellishment requirements
  has_printing: boolean
  has_embroidery: boolean
  tech_pack_summary: string // e.g. "Embroidery First, Then Printing" or "No Embellishment"

  // Verification Checklist
  checklist: InspectionChecklist

  status: InspectionTaskStatus
  checked_by_worker_id?: string
  checked_by_worker_name?: string
  defect_notes?: string
  defect_category?: string
  alteration_ticket_id?: string
  packed_carton_id?: string
  created_at: string
  completed_at?: string
}
