export type PrintTechnique = 
  | 'PLASTISOL' 
  | 'WATER_BASED' 
  | 'DISCHARGE' 
  | 'DTG' 
  | 'PUFF' 
  | 'HIGH_DENSITY'

export type ScreenMesh = 120 | 160 | 180 | 200 | 230 | 280 | 305

export type ScreenStatus = 
  | 'READY_FOR_PRINT' 
  | 'IN_USE' 
  | 'NEEDS_RECLAMATION' 
  | 'DAMAGED_MESH'

export type PrintRunStatus = 
  | 'QUEUED' 
  | 'PRINTING' 
  | 'CURING' 
  | 'COMPLETED' 
  | 'QUARANTINED'

export type StrikeOffStatus = 
  | 'APPROVED' 
  | 'REVISE_RECIPE' 
  | 'REJECTED' 
  | 'PENDING_LAB'

export type DefectReason = 
  | 'SMUDGE' 
  | 'BLEED' 
  | 'OFF_REGISTRATION' 
  | 'CURING_SCORCH' 
  | 'PINHOLE_LEAK' 
  | 'POOR_COVERAGE'

export interface PrintingScreen {
  id: string
  screen_code: string
  artwork_ref: string
  color_separation: string
  mesh_count: ScreenMesh
  tension_newtons: number
  emulsion_type: string
  frame_material: 'ALUMINUM' | 'WOOD'
  rack_location: string
  status: ScreenStatus
  exposures_count: number
  last_exposure_date: string
  created_at: string
}

export interface PrintingProductionRun {
  id: string
  run_number: string
  order_id?: string
  po_number: string
  style_ref: string
  style_name: string
  table_or_machine: string
  operator_id?: string
  operator_name: string
  technique: PrintTechnique
  pantone_codes: string[]
  total_panels_issued: number
  panels_completed: number
  panels_rejected: number
  defect_reason?: DefectReason | string
  curing_temp_c: number
  curing_temp_verified: boolean
  stroke_speed_cpm?: number
  status: PrintRunStatus
  started_at: string
  estimated_finish?: string
  created_at: string
}

export interface StrikeOffTest {
  id: string
  test_number: string
  po_number: string
  style_ref: string
  pantone_target: string
  technique: PrintTechnique
  spectro_delta_e: number
  curing_temp_c: number
  stretch_test_pass: boolean
  wash_fastness_rating: number // 1 to 5 scale (e.g. 4.5)
  crocking_test_pass: boolean
  approval_status: StrikeOffStatus
  auditor_name: string
  remarks: string
  tested_at: string
}

export interface InkRecipe {
  id: string
  recipe_code: string
  color_name: string
  pantone_code: string
  technique: PrintTechnique
  base_binder_grams: number
  pigment_concentrate_grams: number
  fixer_crosslinker_grams: number
  retarder_grams: number
  viscosity_cps: number
  eco_compliance: 'OEKO-TEX Standard 100' | 'GOTS 6.0' | 'ZDHC Level 3'
  prepared_by: string
  batch_volume_kg: number
  created_at: string
}

export interface CuringOvenLog {
  id: string
  log_number: string
  oven_id: string
  target_temp_c: number
  probe_temp_c: number
  conveyor_speed_mpm: number
  dwell_time_minutes: number
  active_run_id?: string
  po_number?: string
  wash_test_cycles: number
  fastness_rating: number
  auditor_name: string
  status: 'OPTIMAL' | 'TEMP_WARNING' | 'CRITICAL'
  logged_at: string
}

export type PrintingWorkerRole = 
  | 'SCREEN_PRINTER' 
  | 'DTG_TECHNICIAN' 
  | 'TABLE_OPERATOR'

export interface PrintingWorker {
  id: string
  worker_user_id?: string
  worker_name: string
  phone_number: string
  worker_email?: string
  roles: PrintingWorkerRole[] | string[]
  role?: string
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | string
  assigned_pieces?: number
  completed_pieces?: number
  company_name?: string
  created_at: string
  updated_at?: string
}

export type PrintingAllocationStatus = 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'WORKER_COMPLETED' 
  | 'VERIFIED_COMPLETED' 
  | 'COMPLETED'

export interface PrintingTaskAllocation {
  id: string
  task_ref: string
  buyer_id?: string
  buyer_name: string
  article_number: string
  article_name: string
  worker_id: string
  worker_name: string
  worker_phone?: string
  table_number?: string
  pieces_to_print: number
  completed_pieces: number
  alloted_hours: number
  due_time: string
  started_at?: string
  completed_at?: string
  notes?: string
  status: PrintingAllocationStatus
  company_name?: string
  created_at: string
  updated_at?: string
}

