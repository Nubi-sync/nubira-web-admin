'use client'

import {
  ReadyGoodsCarton,
  AqlAudit,
  HangtagVerification,
  ScaleWeightLog,
  GodownHandoverPallet,
  ReadyGoodsMetrics,
  CartonStatus
} from '../types/readyGoods'
import {
  INITIAL_CARTONS,
  INITIAL_AQL_AUDITS,
  INITIAL_HANGTAG_SCANS,
  INITIAL_SCALE_LOGS,
  INITIAL_PALLETS,
  INITIAL_METRICS
} from '../data/initialData'

export const READY_GOODS_UPDATE_EVENT = 'zigza:ready_goods_updated'

const KEYS = {
  CARTONS: 'zigza_ready_goods_cartons_v1',
  AQL_AUDITS: 'zigza_ready_goods_aql_audits_v1',
  HANGTAG_SCANS: 'zigza_ready_goods_hangtag_scans_v1',
  SCALE_LOGS: 'zigza_ready_goods_scale_logs_v1',
  PALLETS: 'zigza_ready_goods_pallets_v1',
  METRICS: 'zigza_ready_goods_metrics_v1'
}

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(READY_GOODS_UPDATE_EVENT))
  }
}

// ISO 2859-1 (AQL 2.5 Normal Level II Sampling Table)
export function calculateIso2859SampleSize(lotSize: number): {
  sampleSize: number
  maxMajorDefects: number // AQL 2.5
  maxMinorDefects: number // AQL 4.0
  criticalAllowed: number // Strict 0
} {
  let sampleSize = 200
  let maxMajor = 10
  let maxMinor = 14

  if (lotSize <= 8) {
    sampleSize = 2
    maxMajor = 0
    maxMinor = 0
  } else if (lotSize <= 15) {
    sampleSize = 3
    maxMajor = 0
    maxMinor = 0
  } else if (lotSize <= 25) {
    sampleSize = 5
    maxMajor = 0
    maxMinor = 1
  } else if (lotSize <= 50) {
    sampleSize = 8
    maxMajor = 0
    maxMinor = 1
  } else if (lotSize <= 90) {
    sampleSize = 13
    maxMajor = 1
    maxMinor = 1
  } else if (lotSize <= 150) {
    sampleSize = 20
    maxMajor = 1
    maxMinor = 2
  } else if (lotSize <= 280) {
    sampleSize = 32
    maxMajor = 2
    maxMinor = 3
  } else if (lotSize <= 500) {
    sampleSize = 50
    maxMajor = 3
    maxMinor = 5
  } else if (lotSize <= 1200) {
    sampleSize = 80
    maxMajor = 5
    maxMinor = 7
  } else if (lotSize <= 3200) {
    sampleSize = 125
    maxMajor = 7
    maxMinor = 10
  } else if (lotSize <= 10000) {
    sampleSize = 200
    maxMajor = 10
    maxMinor = 14
  } else if (lotSize <= 35000) {
    sampleSize = 315
    maxMajor = 14
    maxMinor = 21
  } else {
    sampleSize = 500
    maxMajor = 21
    maxMinor = 21
  }

  return {
    sampleSize,
    maxMajorDefects: maxMajor,
    maxMinorDefects: maxMinor,
    criticalAllowed: 0
  }
}

// 1. Ready Goods Cartons
export function getReadyGoodsCartons(): ReadyGoodsCarton[] {
  if (typeof window === 'undefined') return INITIAL_CARTONS
  try {
    const raw = localStorage.getItem(KEYS.CARTONS)
    if (!raw) {
      localStorage.setItem(KEYS.CARTONS, JSON.stringify(INITIAL_CARTONS))
      return INITIAL_CARTONS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_CARTONS
  } catch (e) {
    console.error('Failed to parse cartons from storage', e)
    return INITIAL_CARTONS
  }
}

export function saveReadyGoodsCarton(carton: ReadyGoodsCarton): void {
  if (typeof window === 'undefined') return
  const current = getReadyGoodsCartons()
  const idx = current.findIndex(c => c.id === carton.id || c.cartonNumber === carton.cartonNumber)
  let updated: ReadyGoodsCarton[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = carton
  } else {
    updated = [carton, ...current]
  }
  localStorage.setItem(KEYS.CARTONS, JSON.stringify(updated))
  emitUpdate()
}

export function updateCartonStatus(cartonId: string, newStatus: CartonStatus): void {
  if (typeof window === 'undefined') return
  const current = getReadyGoodsCartons()
  const idx = current.findIndex(c => c.id === cartonId || c.cartonNumber === cartonId)
  if (idx >= 0) {
    const updated = [...current]
    updated[idx] = {
      ...updated[idx],
      status: newStatus,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }
    localStorage.setItem(KEYS.CARTONS, JSON.stringify(updated))
    emitUpdate()
  }
}

// 2. AQL Audits (Triggers Carton Status Transition)
export function getAqlAudits(): AqlAudit[] {
  if (typeof window === 'undefined') return INITIAL_AQL_AUDITS
  try {
    const raw = localStorage.getItem(KEYS.AQL_AUDITS)
    if (!raw) {
      localStorage.setItem(KEYS.AQL_AUDITS, JSON.stringify(INITIAL_AQL_AUDITS))
      return INITIAL_AQL_AUDITS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_AQL_AUDITS
  } catch (e) {
    console.error('Failed to parse AQL audits from storage', e)
    return INITIAL_AQL_AUDITS
  }
}

export function saveAqlAudit(audit: AqlAudit): void {
  if (typeof window === 'undefined') return
  const current = getAqlAudits()
  const idx = current.findIndex(a => a.id === audit.id || a.auditNumber === audit.auditNumber)
  let updated: AqlAudit[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = audit
  } else {
    updated = [audit, ...current]
  }
  localStorage.setItem(KEYS.AQL_AUDITS, JSON.stringify(updated))

  // Automated Carton Status Transition per ISO 2859 standard
  if (audit.cartonId) {
    if (audit.auditDecision === 'PASS') {
      updateCartonStatus(audit.cartonId, 'AQL_AUDIT_PASSED')
    } else if (audit.auditDecision === 'REJECT_QUARANTINE') {
      updateCartonStatus(audit.cartonId, 'QUARANTINED_AQL_FAILED')
    } else if (audit.auditDecision === 'RE_AUDIT') {
      updateCartonStatus(audit.cartonId, 'PACKED')
    }
  }

  emitUpdate()
}

// 3. Hangtag Scans & Polybag Verification
export function getHangtagScans(): HangtagVerification[] {
  if (typeof window === 'undefined') return INITIAL_HANGTAG_SCANS
  try {
    const raw = localStorage.getItem(KEYS.HANGTAG_SCANS)
    if (!raw) {
      localStorage.setItem(KEYS.HANGTAG_SCANS, JSON.stringify(INITIAL_HANGTAG_SCANS))
      return INITIAL_HANGTAG_SCANS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_HANGTAG_SCANS
  } catch (e) {
    console.error('Failed to parse hangtag scans from storage', e)
    return INITIAL_HANGTAG_SCANS
  }
}

export function saveHangtagScan(scan: HangtagVerification): void {
  if (typeof window === 'undefined') return
  const current = getHangtagScans()
  const updated = [scan, ...current]
  localStorage.setItem(KEYS.HANGTAG_SCANS, JSON.stringify(updated))
  emitUpdate()
}

// 4. Scale Weight Logs
export function getScaleLogs(): ScaleWeightLog[] {
  if (typeof window === 'undefined') return INITIAL_SCALE_LOGS
  try {
    const raw = localStorage.getItem(KEYS.SCALE_LOGS)
    if (!raw) {
      localStorage.setItem(KEYS.SCALE_LOGS, JSON.stringify(INITIAL_SCALE_LOGS))
      return INITIAL_SCALE_LOGS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_SCALE_LOGS
  } catch (e) {
    console.error('Failed to parse scale logs from storage', e)
    return INITIAL_SCALE_LOGS
  }
}

export function saveScaleLog(log: ScaleWeightLog): void {
  if (typeof window === 'undefined') return
  const current = getScaleLogs()
  const updated = [log, ...current]
  localStorage.setItem(KEYS.SCALE_LOGS, JSON.stringify(updated))
  emitUpdate()
}

// 5. Pallet Handovers
export function getHandoverPallets(): GodownHandoverPallet[] {
  if (typeof window === 'undefined') return INITIAL_PALLETS
  try {
    const raw = localStorage.getItem(KEYS.PALLETS)
    if (!raw) {
      localStorage.setItem(KEYS.PALLETS, JSON.stringify(INITIAL_PALLETS))
      return INITIAL_PALLETS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_PALLETS
  } catch (e) {
    console.error('Failed to parse pallets from storage', e)
    return INITIAL_PALLETS
  }
}

export function saveHandoverPallet(pallet: GodownHandoverPallet): void {
  if (typeof window === 'undefined') return
  const current = getHandoverPallets()
  const idx = current.findIndex(p => p.id === pallet.id || p.palletCode === pallet.palletCode)
  let updated: GodownHandoverPallet[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = pallet
  } else {
    updated = [pallet, ...current]
  }
  localStorage.setItem(KEYS.PALLETS, JSON.stringify(updated))

  // Mark all member cartons as SHIPPED
  if (Array.isArray(pallet.cartonIds)) {
    pallet.cartonIds.forEach(id => {
      updateCartonStatus(id, 'SHIPPED')
    })
  }

  emitUpdate()
}

// 6. Metrics
export function getReadyGoodsMetrics(): ReadyGoodsMetrics {
  if (typeof window === 'undefined') return INITIAL_METRICS
  try {
    const raw = localStorage.getItem(KEYS.METRICS)
    if (!raw) {
      localStorage.setItem(KEYS.METRICS, JSON.stringify(INITIAL_METRICS))
      return INITIAL_METRICS
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : INITIAL_METRICS
  } catch (e) {
    console.error('Failed to parse metrics from storage', e)
    return INITIAL_METRICS
  }
}
