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
