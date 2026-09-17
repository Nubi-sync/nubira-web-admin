export type ThreadBrand = 'Madeira' | 'Isacord' | 'Coats' | 'Vardhman'

export type BackingType = 'Tear-Away 40 GSM' | 'Cut-Away 60 GSM' | 'Water Soluble'

export type EmbroideryRunStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'PAUSED_NEEDLE_ERROR' | 'MAINTENANCE'

export type DesignStatus = 'APPROVED' | 'IN_TESTING' | 'REVISE_PUNCH'

export type BillingStatus = 'PENDING_AUDIT' | 'APPROVED' | 'INVOICED'

export type DefectType = 
  | 'BIRD_NESTING' 
  | 'NEEDLE_BREAKAGE' 
  | 'TENSION_LOOPING' 
  | 'HOOP_DISTORTION' 
  | 'MISSED_STITCH' 
  | 'JUMP_TRIM_STRAY'

export type DefectSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR'

export type ThreadType = 'Polyester 40wt' | 'Rayon Viscose 40wt' | 'Metallic Gold' | 'Flame Retardant'

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'EXHAUSTED'

export interface EmbroideryDesign {
  id: string
  design_code: string
  design_name: string
  buyer_name: string
  order_id: string
  total_stitches: number
  color_stops_count: number
  dst_file_name: string
  rate_per_thousand_stitches: number
  backing_type: BackingType
  thread_brand: ThreadBrand
  status: DesignStatus
  width_mm: number
  height_mm: number
  created_at: string
}

export interface EmbroideryMachineRun {
  id: string
  run_number: string
  machine_number: string
  operator_name: string
  design_id: string
  design_code: string
  order_po: string
  panels_loaded: number
  panels_completed: number
  thread_breaks_count: number
  total_stitches_run: number
  rpm_speed: number
  active_heads: number
  total_heads: number
  backing_spec: string
  status: EmbroideryRunStatus
  run_date: string
  created_at: string
}

export interface StitchBillingLedger {
  id: string
  invoice_code: string
  order_po: string
  buyer_name: string
  design_code: string
  total_pieces: number
  stitch_count_per_piece: number
  total_stitches_billed: number
  rate_per_thousand: number
  backing_cost_per_piece: number
  total_amount: number
  billing_status: BillingStatus
  created_at: string
}

export interface ThreadConeItem {
  id: string
  cone_code: string
  brand: ThreadBrand
  shade_number: string
  pantone_match: string
  thread_type: ThreadType
  initial_weight_grams: number
  current_weight_grams: number
  cones_in_stock: number
  storage_bin: string
  status: StockStatus
  created_at: string
}

export interface EmbroideryQcAudit {
  id: string
  audit_code: string
  run_id: string
  machine_number: string
  head_number: number
  defect_type: DefectType
  severity: DefectSeverity
  action_taken: string
  auditor_name: string
  created_at: string
}

export type EmbroideryWorkerRole = 
  | 'EMBROIDERY_OPERATOR' 
  | 'HOOPING_SPECIALIST' 
  | 'PUNCH_DIGITIZER'

export interface EmbroideryWorker {
  id: string
  worker_user_id?: string
  worker_name: string
  phone_number: string
  worker_email?: string
  roles: EmbroideryWorkerRole[] | string[]
  role?: string
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | string
  assigned_pieces?: number
  completed_pieces?: number
  company_name?: string
  created_at: string
  updated_at?: string
}

export type EmbroideryAllocationStatus = 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'WORKER_COMPLETED' 
  | 'VERIFIED_COMPLETED' 
  | 'COMPLETED'

export interface EmbroideryTaskAllocation {
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
  pieces_to_embroider: number
  completed_pieces: number
  alloted_hours: number
  due_time: string
  started_at?: string
  completed_at?: string
  notes?: string
  status: EmbroideryAllocationStatus
  created_at: string
  updated_at?: string
}

