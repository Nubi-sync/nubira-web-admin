export type GarmentCategory = string

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
  | 'PPS_APPROVED'
  | 'APPROVED_BULK'
  | 'REVISE_FIT'

export interface TechPackMaterialRequirement {
  id: string
  component_type: string
  item_name: string
  specification?: string
  consumption?: string
  placement?: string
}

export interface AvailableArticleOption {
  id: string
  art_number: string
  garment_type: string
  category_style: string
  color_name?: string
  photo_front?: string
  photo_back?: string
  brief_id: string
  submission_id?: string
  designer_name?: string
  designer_notes?: string
  instructions?: string
  company_name?: string
  brand_name?: string
  target_gsm?: number
  fabric_composition?: string
}

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
  design_submission_id?: string
  created_by_ph?: string
  approved_by_sa?: boolean
  sa_verdict?: string
  company_name?: string
  materials?: TechPackMaterialRequirement[]
  instructions?: string
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

// -----------------------------------------------------------------------------
// 3-TIER VERIFICATION PIPELINE & TEAM TYPES
// -----------------------------------------------------------------------------

export type TeamMemberStatus = 'ACTIVE' | 'SUSPENDED' | 'REMOVED'

export interface DesignTeamMember {
  id: string
  ph_user_id: string
  designer_user_id?: string
  designer_name: string
  phone_number?: string
  username?: string
  designer_email: string
  designer_phone?: string
  company_name: string
  status: TeamMemberStatus
  created_at: string
  updated_at: string
  active_briefs_count?: number
}

export type BriefCategory = string

export type BriefStatus = 
  | 'ALLOCATED'
  | 'SUBMITTED'
  | 'PH_APPROVED'
  | 'PH_REJECTED'
  | 'SA_APPROVED'
  | 'SA_SAVED_FOR_LATER'
  | 'TECH_PACK_CREATED'

export interface BriefDesignConceptRequirement {
  concept_number: number
  art_number?: string
  category_style?: string
  colors: string[]
  notes?: string
}

export interface DesignBrief {
  id: string
  ph_user_id: string
  designer_member_id?: string
  designer_name?: string
  designer_email?: string
  designer_phone?: string
  garment_type: string
  category: string
  max_colors: number
  chart_colors?: number
  target_colors?: string[]
  target_designs?: number
  num_designs?: number
  submissions_count?: number
  instructions?: string
  design_concepts_brief?: BriefDesignConceptRequirement[]
  status: BriefStatus
  company_name: string
  created_at: string
  updated_at: string
  latest_submission?: DesignSubmission
}

export type PHVerdict = 'PENDING' | 'APPROVED' | 'REJECTED'
export type SAVerdict = 'PENDING' | 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED'

export interface DesignConceptColorway {
  color_name: string
  photo_front: string
  photo_back?: string
  status?: 'APPROVED' | 'REJECTED' | 'PENDING'
  sa_verdict?: SAVerdict
  sa_notes?: string
}

export interface DesignConceptItem {
  concept_number: number
  art_number?: string
  title?: string
  notes?: string
  colorways: DesignConceptColorway[]
  status?: BriefStatus
  ph_verdict?: PHVerdict
  ph_feedback?: string
  sa_verdict?: SAVerdict
  sa_notes?: string
}

export interface DesignSubmission {
  id: string
  brief_id: string
  designer_member_id?: string
  designer_name?: string
  photo_url_1: string
  photo_url_2?: string
  designer_notes?: string
  concepts?: DesignConceptItem[]
  ph_verdict: PHVerdict
  ph_feedback?: string
  sa_verdict?: SAVerdict
  sa_notes?: string
  company_name: string
  submitted_at: string
  reviewed_at?: string
  brief?: DesignBrief
}

export interface BodyPartCode {
  id: string
  ph_user_id: string
  company_name: string
  code: string
  body_part_name: string
  sort_order: number
  created_at: string
}

export type BOMComponentType = 'BUTTON' | 'SLEEVE' | 'COLLAR' | 'TRIM' | 'ZIPPER' | 'FABRIC' | 'THREAD'

export interface BOMComponentCode {
  id: string
  ph_user_id: string
  company_name: string
  component_type: BOMComponentType
  component_spec: string
  code?: string
  sort_order: number
  created_at: string
}

export interface GarmentTemplateBodyPart {
  code: string
  name: string
  default_tolerance: number
  default_grade_step: number
}

export interface GarmentTemplateBOMDefault {
  type: string
  spec: string
  code?: string
}

export interface GarmentTemplate {
  id: string
  garment_type: string
  body_parts: GarmentTemplateBodyPart[]
  bom_defaults: GarmentTemplateBOMDefault[]
  is_system_template: boolean
  ph_user_id?: string
  company_name?: string
  created_at: string
}
