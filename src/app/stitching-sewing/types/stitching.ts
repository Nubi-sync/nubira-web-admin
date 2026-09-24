export type StitchingWorkerRole =
  | 'TAILOR'
  | 'OVERLOCK_OPERATOR'
  | 'SINGLE_NEEDLE'
  | 'FLATLOCK_OPERATOR'
  | 'KANSAI_SPECIALIST'
  | 'FEED_OFF_ARM'
  | 'FINISHING_HELPER'
  | 'QUALITY_INSPECTOR'

export type StitchingTaskStatus = 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'ON_HOLD'

export type MachineSpecialty =
  | 'Single Needle Lockstitch (SNLS)'
  | '4-Thread Overlock (Safety Stitch)'
  | '5-Thread Overlock'
  | 'Flatlock (Coverstitch / Hemming)'
  | 'Kansai Special (Waistband & Multi-needle)'
  | 'Feed-off-the-arm (Lap Seaming)'
  | 'Button Hole & Button Stitch'
  | 'Bar-tacking Machine'
  | 'Manual Assembly / Helper'

export interface StitchingWorker {
  id: string
  worker_user_id?: string
  worker_name: string
  phone_number: string
  worker_email?: string
  roles?: StitchingWorkerRole[]
  role?: string
  assigned_machine?: string
  machine_specialty?: MachineSpecialty | string
  shift?: 'MORNING' | 'EVENING' | 'NIGHT'
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'
  assigned_pieces: number
  completed_pieces: number
  piece_rate_inr?: number
  company_name?: string
  created_at?: string
}

export interface StitchingTaskAllocation {
  id: string
  task_ref: string
  lot_number: string
  po_number?: string
  buyer_id?: string
  buyer_name?: string
  article_name: string
  style_number?: string
  source_department?: string
  operation_type?: string
  machine_type?: string
  target_quantity: number
  completed_quantity: number
  rejected_quantity?: number
  piece_rate_inr?: number
  alloted_hours?: number
  worker_id: string
  worker_name: string
  worker_phone?: string
  status: StitchingTaskStatus
  due_date?: string
  priority?: 'NORMAL' | 'HIGH' | 'URGENT'
  company_name?: string
  notes?: string
  started_at?: string
  completed_at?: string
  created_at?: string
}

export interface StitchingSubmissionRecord {
  id: string
  task_id: string
  task_ref: string
  lot_number: string
  article_name: string
  operation_type: string
  worker_id: string
  worker_name: string
  completed_pieces: number
  rejected_pieces: number
  piece_rate_inr: number
  total_earned_inr: number
  submitted_at: string
  company_name?: string
  notes?: string
}
