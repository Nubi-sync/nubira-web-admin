export type LaySheetStatus = 
  | 'SPREADING' 
  | 'READY_FOR_CUT' 
  | 'CUT_IN_PROGRESS' 
  | 'CUT_COMPLETED' 
  | 'BUNDLED'

export interface LaySheet {
  id: string
  lay_number: string
  po_number: string
  brand_name: string
  style_ref: string
  style_name: string
  table_number: string
  fabric_roll_barcodes: string[]
  shell_fabric: string
  gsm: number
  plies_count: number
  marker_length_meters: number
  total_cut_pieces: number
  ratio_breakdown: string
  fabric_weight_kg: number
  cutting_master: string
  status: LaySheetStatus
  created_at: string
}

export type BundleStatus = 
  | 'GENERATED' 
  | 'BANDED' 
  | 'IN_TRANSIT' 
  | 'HANDOVER_CONFIRMED'

export type HandoverDestination = 
  | '04_PRINTING' 
  | '05_EMBROIDERY' 
  | '06_SEWING'

export interface CutBundle {
  id: string
  bundle_number: string
  lay_sheet_id: string
  lay_number: string
  po_number: string
  style_ref: string
  style_name: string
  color: string
  size: string
  ply_range_start: number
  ply_range_end: number
  pieces_count: number
  qr_code: string
  destination: HandoverDestination
  status: BundleStatus
  created_at: string
}

export type MarkerStatus = 
  | 'CAD_APPROVED' 
  | 'TEST_SPREAD' 
  | 'IN_BULK_USE'

export type GrainlineConstraint = 
  | 'ONE_WAY' 
  | 'EITHER_WAY' 
  | 'FACE_TO_FACE'

export interface MarkerEfficiency {
  id: string
  marker_ref: string
  style_ref: string
  style_name: string
  category: string
  fabric_width_inches: number
  marker_length_meters: number
  patterns_nested: number
  fabric_yield_meters_per_piece: number
  efficiency_percent: number
  scrap_percent: number
  cad_software: string
  grainline_constraint: GrainlineConstraint
  status: MarkerStatus
  created_at: string
}

export type SampledPly = 'TOP' | 'MIDDLE' | 'BOTTOM'
export type AuditDecision = 'PASSED' | 'RECUT_REQUIRED' | 'HOLD'

export interface PanelQCAudit {
  id: string
  audit_number: string
  lay_sheet_id: string
  lay_number: string
  bundle_number: string
  style_ref: string
  sampled_ply: SampledPly
  measurement_variance_mm: number
  notching_precision: 'PASS' | 'FAIL'
  grainline_alignment: 'ALIGNED' | 'OFF_GRAIN'
  blade_heat_melt: 'NONE' | 'FUSED'
  decision: AuditDecision
  defect_notes: string
  auditor_name: string
  created_at: string
}

export type RemnantStatus = 
  | 'AVAILABLE_FOR_RECUT' 
  | 'CONSUMED' 
  | 'SCRAP_RECYCLED'

export interface EndBitRemnant {
  id: string
  remnant_code: string
  fabric_roll_ref: string
  fabric_description: string
  color_shade_lot: string
  usable_length_meters: number
  weight_kg: number
  storage_rack_bin: string
  status: RemnantStatus
  logged_by: string
  created_at: string
}

export type TableStatus = 'IDLE' | 'SPREADING' | 'CUTTING' | 'MAINTENANCE'

export interface CuttingTable {
  id: string
  table_number: string
  table_name: string
  length_meters: number
  width_inches: number
  vacuum_type: string
  auto_cutter_model: string
  current_lay_id?: string
  status: TableStatus
}
