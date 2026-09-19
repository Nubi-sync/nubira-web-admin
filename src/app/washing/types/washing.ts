export type WashBatchStatus = 'WASHING' | 'HYDRO' | 'DRYING' | 'PASSED' | 'FAILED'

export type RecipeCategory = 'BIO_POLISH' | 'SILICON_SOFT' | 'VINTAGE_STONE' | 'DESIZE_NEUTRALIZE'

export type MachineType = 'WASHER' | 'HYDRO' | 'TUMBLER_DRYER'

export type MachineStatus = 'RUNNING' | 'IDLE' | 'MAINTENANCE' | 'COMPLETED'

export type QcVerdict = 'PASS' | 'MARGINAL_WARN' | 'CRITICAL_FAIL'

export type HandoverStatus = 'TRANSFERRED' | 'ACCEPTED' | 'IN_TRANSIT'

export interface WashBatch {
  id: string
  batchNumber: string // e.g., WB-40201
  challanId: string // e.g., CH-2026-901
  articleName: string // e.g., Heavyweight French Terry Hoodie
  color: string // e.g., Vintage Charcoal
  totalPieces: number // e.g., 1200
  washerMachineId: string // e.g., Washer 01
  operatorName: string // e.g., Ramesh Mondal
  recipeName: string // e.g., Bio-Enzyme Wash 55°C
  dryWeightKg: number // e.g., 480
  waterVolumeLiters: number // Auto dryWeight * 5.0 = 2400
  tumblerTempC: number // e.g., 65
  cycleDurationMinutes: number // e.g., 45
  measuredShrinkageLengthPct?: number // e.g., 1.15
  measuredShrinkageWidthPct?: number // e.g., 0.95
  colorfastnessRating?: number // e.g., 4.5
  status: WashBatchStatus
  stageTimeRemainingMin?: number
  startedAt: string
  completedAt?: string
  notes?: string
}

export interface WashRecipe {
  id: string
  recipeCode: string // e.g., WASH-BIO-01
  recipeName: string // e.g., Bio-Enzyme Wash 55°C
  category: RecipeCategory
  enzymeType: string // e.g., Neutral Cellulase Enzyme
  enzymeDoseGpl: number // g/L (e.g., 1.5)
  aceticAcidGpl: number // g/L (e.g., 0.8)
  softenerGpl: number // g/L (e.g., 2.0)
  temperatureC: number // e.g., 55
  cycleMinutes: number // e.g., 45
  phTarget: string // e.g., 5.2 - 5.5
  liquorRatio: string // e.g., 1 : 5.0
  targetHandFeel: string // e.g., Peach Finish / Ultra-Soft
  approvedBy: string
  status: 'ACTIVE' | 'ARCHIVED'
}

export interface WasherMachine {
  id: string
  name: string // e.g., Washer 01
  type: MachineType
  capacityKg: number // e.g., 600
  currentBatchNumber?: string
  currentRecipe?: string
  status: MachineStatus
  timeRemainingMin?: number
  tempC?: number
  rpm?: number
}

export interface WaterAuditLog {
  id: string
  auditDate: string
  meterReadingInitial: number
  meterReadingFinal: number
  litersConsumed: number
  dryWeightProcessedKg: number
  actualLiquorRatio: number // liters / kg
  effluentPh: number // 6.5 - 8.0 target
  effluentTdsPpm: number
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT'
  auditorName: string
  notes?: string
}

export interface ShrinkageQcRecord {
  id: string
  qcCode: string // e.g., SQC-8821
  batchId: string
  batchNumber: string
  articleName: string
  samplePiecesTested: number // default 10
  preWashLengthCm: number
  postWashLengthCm: number
  avgLengthShrinkPct: number
  preWashWidthCm: number
  postWashWidthCm: number
  avgWidthShrinkPct: number
  colorfastnessRating: number // 1.0 - 5.0
  qcStatus: QcVerdict
  cuttingAlertSent: boolean
  auditorName: string
  auditDate: string
  actionTaken?: string
}

export interface FinishingHandover {
  id: string
  handoverCode: string // e.g., WH-2026-501
  batchNumber: string
  challanId: string
  articleName: string
  piecesTransferred: number
  transferredTo: string // e.g., 08. Steam Ironing & Finishing Floor
  moistureVerified: boolean
  odorFreeVerified: boolean
  pieceCountMatch: boolean
  supervisorSignoff: string
  handoverDate: string
  status: HandoverStatus
}

// -----------------------------------------------------------------------------
// Interactive Floor Matrix & Worker Types
// -----------------------------------------------------------------------------

export type WashingAllocationStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'WORKER_COMPLETED' | 'VERIFIED_COMPLETED'

export type WashingWorkerRole =
  | 'WASH_MASTER'
  | 'HYDRO_EXTRACTOR'
  | 'TUMBLER_OPERATOR'
  | 'CHEMICAL_MIXER'
  | 'SHRINKAGE_INSPECTOR'
  | 'FINISHING_LOADER'

export interface WashingWorker {
  id: string
  worker_user_id?: string
  worker_name: string
  phone_number: string
  worker_email?: string
  role: string
  roles: string[]
  assigned_machine?: string
  shift?: 'MORNING' | 'EVENING' | 'NIGHT'
  status: 'ACTIVE' | 'INACTIVE'
  assigned_pieces?: number
  completed_pieces?: number
  company_name?: string
  created_at?: string
}

export interface WashingTaskAllocation {
  id: string
  task_ref: string
  buyer_id?: string | null
  buyer_name: string
  article_number: string
  article_name?: string | null
  worker_id?: string | null
  worker_name: string
  worker_phone?: string | null
  table_number?: string // Machine / Washer / Tumbler ID
  machine_number?: string
  machine_station?: string
  wash_type?: string
  pieces_to_wash: number
  completed_pieces: number
  alloted_hours: number
  due_time?: string | null
  wash_recipe?: string | null
  notes?: string | null
  company_name?: string
  status: WashingAllocationStatus
  started_at?: string | null
  assigned_at?: string
  completed_at?: string
  created_at?: string
  updated_at?: string
}

