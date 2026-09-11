export type TableStatus = 'ACTIVE' | 'IDLE' | 'MAINTENANCE'

export type CondensateStatus = 'NORMAL' | 'DRAINING' | 'CLOGGED'

export type FinishQcStatus = 'PASS' | 'REWORK_ALTERATION'

export interface IronTable {
  id: string
  tableNumber: string // e.g., Table 01
  operatorName: string // e.g., Rajesh Halder
  operatorId?: string
  challanId: string // e.g., CH-2026-901
  articleName: string // e.g., Heavyweight Loopback Hoodie
  targetHourlyPcs: number // e.g., 60
  pieceRate: number // e.g., 2.20
  currentPiecesPressed: number // e.g., 420
  status: TableStatus
  ironTempC: number // e.g., 150
  vacuumActive: boolean
  teflonShoeVerified: boolean
  shiftStartTime: string
}

export interface IronProductionLog {
  id: string
  tableNumber: string // Table 01 - Table 12
  operatorName: string
  operatorId?: string
  challanId: string
  articleName?: string
  piecesPressed: number
  defectShineCount: number
  waterStainCount: number
  pieceRate: number
  totalEarnedWages: number // piecesPressed * pieceRate
  shiftDate: string
  shiftType: 'SHIFT_1' | 'SHIFT_2'
  notes?: string
}

export interface BoilerTelemetryLog {
  id: string
  logTime: string
  steamPressureBar: number // 4.2 - 4.8 Bar optimal target: 4.5
  boilerTempC: number // e.g., 152
  condensateTrapStatus: CondensateStatus
  blowdownDone: boolean
  feedWaterLevelPct: number // e.g., 85%
  operatorName: string
  remarks?: string
}

export interface FinishQcAudit {
  id: string
  auditCode: string // e.g., FQC-7701
  tableNumber: string
  operatorName: string
  challanId: string
  articleName: string
  samplePcs: number // default 20
  glazeDefects: number
  waterSpots: number
  unalignedSeams: number
  qcStatus: FinishQcStatus
  auditorName: string
  timestamp: string
  actionTaken?: string
}

export interface PackingHandover {
  id: string
  trolleyCode: string // e.g., TRL-2026-101
  challanId: string
  articleName: string
  color: string
  piecesTransferred: number
  transferredTo: string // e.g., 09. Ready Goods & Packing Floor
  wrinkleFreeVerified: boolean
  zeroShineVerified: boolean
  supervisorSignoff: string
  handoverDate: string
  status: 'TRANSFERRED' | 'ACCEPTED'
}
