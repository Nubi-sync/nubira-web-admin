import {
  ReadyGoodsCarton,
  AqlAudit,
  HangtagVerification,
  ScaleWeightLog,
  GodownHandoverPallet,
  ReadyGoodsMetrics
} from '../types/readyGoods'

export const INITIAL_METRICS: ReadyGoodsMetrics = {
  totalPackedCartonsToday: 0,
  totalGarmentsPackedToday: 0,
  aqlScorePassPct: 0,
  aqlAuditCountToday: 0,
  barcodeMatchPct: 0,
  readyInGodownPcs: 0,
  quarantinedCartonsCount: 0
}

export const INITIAL_CARTONS: ReadyGoodsCarton[] = []
export const INITIAL_AQL_AUDITS: AqlAudit[] = []
export const INITIAL_HANGTAG_VERIFICATIONS: HangtagVerification[] = []
export const INITIAL_HANGTAG_SCANS: HangtagVerification[] = []
export const INITIAL_WEIGHT_LOGS: ScaleWeightLog[] = []
export const INITIAL_SCALE_LOGS: ScaleWeightLog[] = []
export const INITIAL_PALLETS: GodownHandoverPallet[] = []
