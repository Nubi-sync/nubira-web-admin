'use client'

import {
  IronTable,
  IronProductionLog,
  BoilerTelemetryLog,
  FinishQcAudit,
  PackingHandover,
} from '../types/iron'
import {
  INITIAL_TABLES,
  INITIAL_PRODUCTION_LOGS,
  INITIAL_BOILER_LOGS,
  INITIAL_QC_AUDITS,
  INITIAL_HANDOVERS,
} from '../data/initialData'

export const IRON_UPDATE_EVENT = 'zigza:iron_updated'

const KEYS = {
  TABLES: 'zigza_iron_tables_v1',
  PRODUCTION_LOGS: 'zigza_iron_production_logs_v1',
  BOILER_LOGS: 'zigza_iron_boiler_logs_v1',
  QC_AUDITS: 'zigza_iron_qc_audits_v1',
  HANDOVERS: 'zigza_iron_handovers_v1',
}

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(IRON_UPDATE_EVENT))
  }
}

// 1. Steam Vacuum Buck Tables
export function getIronTables(): IronTable[] {
  if (typeof window === 'undefined') return INITIAL_TABLES
  try {
    const raw = localStorage.getItem(KEYS.TABLES)
    if (!raw) {
      localStorage.setItem(KEYS.TABLES, JSON.stringify(INITIAL_TABLES))
      return INITIAL_TABLES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_TABLES
  } catch (e) {
    console.error('Failed to parse iron tables from storage', e)
    return INITIAL_TABLES
  }
}

export function saveIronTable(table: IronTable): void {
  if (typeof window === 'undefined') return
  const current = getIronTables()
  const idx = current.findIndex(t => t.id === table.id || t.tableNumber === table.tableNumber)
  let updated: IronTable[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = table
  } else {
    updated = [...current, table]
  }
  localStorage.setItem(KEYS.TABLES, JSON.stringify(updated))
  emitUpdate()
}

// 2. Shift Production Logs & Wage Ledgers
export function getIronProductionLogs(): IronProductionLog[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTION_LOGS
  try {
    const raw = localStorage.getItem(KEYS.PRODUCTION_LOGS)
    if (!raw) {
      localStorage.setItem(KEYS.PRODUCTION_LOGS, JSON.stringify(INITIAL_PRODUCTION_LOGS))
      return INITIAL_PRODUCTION_LOGS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_PRODUCTION_LOGS
  } catch (e) {
    console.error('Failed to parse iron production logs from storage', e)
    return INITIAL_PRODUCTION_LOGS
  }
}

export function saveIronProductionLog(log: IronProductionLog): void {
  if (typeof window === 'undefined') return
  const current = getIronProductionLogs()
  const idx = current.findIndex(l => l.id === log.id)
  let updated: IronProductionLog[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = log
  } else {
    updated = [log, ...current]
  }
  localStorage.setItem(KEYS.PRODUCTION_LOGS, JSON.stringify(updated))

  // Also update corresponding table pieces count
  const tables = getIronTables()
  const targetTable = tables.find(t => t.tableNumber === log.tableNumber)
  if (targetTable) {
    saveIronTable({
      ...targetTable,
      currentPiecesPressed: (targetTable.currentPiecesPressed || 0) + log.piecesPressed,
      operatorName: log.operatorName || targetTable.operatorName,
      status: 'ACTIVE',
    })
  }

  emitUpdate()
}

// 3. Boiler Telemetry & Steam Pressure Logs
export function getBoilerLogs(): BoilerTelemetryLog[] {
  if (typeof window === 'undefined') return INITIAL_BOILER_LOGS
  try {
    const raw = localStorage.getItem(KEYS.BOILER_LOGS)
    if (!raw) {
      localStorage.setItem(KEYS.BOILER_LOGS, JSON.stringify(INITIAL_BOILER_LOGS))
      return INITIAL_BOILER_LOGS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_BOILER_LOGS
  } catch (e) {
    console.error('Failed to parse boiler logs from storage', e)
    return INITIAL_BOILER_LOGS
  }
}

export function saveBoilerLog(log: BoilerTelemetryLog): void {
  if (typeof window === 'undefined') return
  const current = getBoilerLogs()
  const idx = current.findIndex(b => b.id === log.id)
  let updated: BoilerTelemetryLog[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = log
  } else {
    updated = [log, ...current]
  }
  localStorage.setItem(KEYS.BOILER_LOGS, JSON.stringify(updated))
  emitUpdate()
}

// 4. Finishing QC Audits
export function getFinishQcAudits(): FinishQcAudit[] {
  if (typeof window === 'undefined') return INITIAL_QC_AUDITS
  try {
    const raw = localStorage.getItem(KEYS.QC_AUDITS)
    if (!raw) {
      localStorage.setItem(KEYS.QC_AUDITS, JSON.stringify(INITIAL_QC_AUDITS))
      return INITIAL_QC_AUDITS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_QC_AUDITS
  } catch (e) {
    console.error('Failed to parse finish QC audits from storage', e)
    return INITIAL_QC_AUDITS
  }
}

export function saveFinishQcAudit(audit: FinishQcAudit): void {
  if (typeof window === 'undefined') return
  const current = getFinishQcAudits()
  const idx = current.findIndex(q => q.id === audit.id)
  let updated: FinishQcAudit[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = audit
  } else {
    updated = [audit, ...current]
  }
  localStorage.setItem(KEYS.QC_AUDITS, JSON.stringify(updated))
  emitUpdate()
}

// 5. Packing Handovers (Mobile Trolleys)
export function getPackingHandovers(): PackingHandover[] {
  if (typeof window === 'undefined') return INITIAL_HANDOVERS
  try {
    const raw = localStorage.getItem(KEYS.HANDOVERS)
    if (!raw) {
      localStorage.setItem(KEYS.HANDOVERS, JSON.stringify(INITIAL_HANDOVERS))
      return INITIAL_HANDOVERS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_HANDOVERS
  } catch (e) {
    console.error('Failed to parse packing handovers from storage', e)
    return INITIAL_HANDOVERS
  }
}

export function savePackingHandover(handover: PackingHandover): void {
  if (typeof window === 'undefined') return
  const current = getPackingHandovers()
  const idx = current.findIndex(h => h.id === handover.id)
  let updated: PackingHandover[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = handover
  } else {
    updated = [handover, ...current]
  }
  localStorage.setItem(KEYS.HANDOVERS, JSON.stringify(updated))
  emitUpdate()
}
