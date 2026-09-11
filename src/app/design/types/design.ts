export type GarmentCategory = 
  | 'Hoodie'
  | 'T-Shirt'
  | 'Polo'
  | 'Jogger'
  | 'Jacket'
  | 'Kids Romper'

export type SizeSystem = 
  | 'ALPHA_ADULT' 
  | 'NUMERIC_WAIST' 
  | 'KIDS_AGE' 
  | 'PLUS_SIZE'

export type EmbellishmentSequence = 
  | 'NONE'
  | 'EMBROIDERY_FIRST_THEN_PRINT'
  | 'PRINT_FIRST_THEN_EMBROIDERY'

export type SeamClass = 
  | 'ISO 4915 Class 401 (Chainstitch)'
  | 'ISO 4915 Class 504 (Overlock)'
  | 'ISO 4915 Class 607 (Flatlock)'

export type TechPackStatus = 
  | 'DRAFT'
  | 'SAMPLE_DEV'
  | 'PPS_SUBMITTED'
  | 'APPROVED_BULK'
  | 'REVISE_FIT'

export interface TechPack {
  id: string
  style_number: string
  style_name: string
  brand_name: string
  category: GarmentCategory
  size_system: SizeSystem
  base_size: string
  fabric_composition: string
  target_gsm: number
  embellishment_sequence: EmbellishmentSequence
  cad_front_url?: string
  cad_back_url?: string
  spi: number
  seam_class: SeamClass
  status: TechPackStatus
  target_cut_date: string
  version: number
  created_at: string
  updated_at: string
}

export type SampleStage = 'PROTO' | 'SIZE_SET' | 'PPS'
export type SampleApprovalStatus = 'APPROVED' | 'REVISE_FIT' | 'REJECTED' | 'PENDING_REVIEW'

export interface SampleApproval {
  id: string
  tech_pack_id: string
  style_number: string
  style_name: string
  brand_name: string
  sample_stage: SampleStage
  measured_chest: number
  target_chest: number
  measured_length: number
  target_length: number
  measured_sleeve: number
  target_sleeve: number
  variance_status: 'WITHIN_TOLERANCE' | 'OUT_OF_TOLERANCE'
  fit_comments: string
  buyer_reviewer_email: string
  approval_status: SampleApprovalStatus
  submitted_date: string
  audit_date?: string
}

export interface PointOfMeasure {
  pom_code: string
  pom_name: string
  tolerance_cm: number
  grade_step_cm: number
  base_value_cm: number
  sizes: Record<string, number>
}

export interface GradingScheme {
  id: string
  name: string
  category: SizeSystem
  base_size: string
  sizes: string[]
  poms: PointOfMeasure[]
}

export type MaterialType = 'FABRIC' | 'TRIM' | 'THREAD'
export type MaterialStatus = 'CERTIFIED' | 'TESTING' | 'DEPRECATED'

export interface MaterialItem {
  id: string
  material_code: string
  material_name: string
  type: MaterialType
  construction: string
  composition: string
  weight_gsm?: number
  shrinkage_length_pct: number
  shrinkage_width_pct: number
  spirality_pct: number
  recommended_needle: string
  supplier_mill: string
  lead_time_days: number
  status: MaterialStatus
}
