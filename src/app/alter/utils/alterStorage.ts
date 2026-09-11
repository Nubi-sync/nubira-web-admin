'use client'

import {
  AlterationTicket,
  RepairStation,
  SpotCleaningLog,
  ScrapRequisition,
  AlterationMetrics,
  ResolutionStatus
} from '../types/alter'
import {
  INITIAL_TICKETS,
  INITIAL_STATIONS,
  INITIAL_SPOTTING_LOGS,
  INITIAL_SCRAP_REQUISITIONS,
  INITIAL_METRICS
} from '../data/initialData'

export const ALTER_UPDATE_EVENT = 'zigza:alter_updated'

const KEYS = {
  TICKETS: 'zigza_alter_tickets_v1',
  STATIONS: 'zigza_alter_stations_v1',
  SPOTTING_LOGS: 'zigza_alter_spotting_logs_v1',
  SCRAP: 'zigza_alter_scrap_requisitions_v1',
  METRICS: 'zigza_alter_metrics_v1'
}

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ALTER_UPDATE_EVENT))
  }
}

// 1. Alteration Tickets
export function getAlterTickets(): AlterationTicket[] {
  if (typeof window === 'undefined') return INITIAL_TICKETS
  try {
    const raw = localStorage.getItem(KEYS.TICKETS)
    if (!raw) {
      localStorage.setItem(KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS))
      return INITIAL_TICKETS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_TICKETS
  } catch (e) {
    console.error('Failed to parse alter tickets from storage', e)
    return INITIAL_TICKETS
  }
}

export function saveAlterTicket(ticket: AlterationTicket): void {
  if (typeof window === 'undefined') return
  const current = getAlterTickets()
  const idx = current.findIndex(t => t.id === ticket.id || t.ticketNumber === ticket.ticketNumber)
  let updated: AlterationTicket[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = ticket
  } else {
    updated = [ticket, ...current]
  }
  localStorage.setItem(KEYS.TICKETS, JSON.stringify(updated))
  emitUpdate()
}

export function updateTicketResolution(
  ticketId: string,
  resolution: ResolutionStatus,
  menderName?: string,
  actionTaken?: any,
  inspectorName?: string,
  scrapReason?: any,
  repairCost: number = 0
): void {
  if (typeof window === 'undefined') return
  const current = getAlterTickets()
  const idx = current.findIndex(t => t.id === ticketId || t.ticketNumber === ticketId)
  if (idx >= 0) {
    const updated = [...current]
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
    updated[idx] = {
      ...updated[idx],
      resolutionStatus: resolution,
      menderName: menderName || updated[idx].menderName,
      repairActionTaken: actionTaken || updated[idx].repairActionTaken,
      inspectorName: inspectorName || updated[idx].inspectorName,
      scrapReason: scrapReason || updated[idx].scrapReason,
      repairCost: repairCost || updated[idx].repairCost,
      clearedAt: nowStr
    }
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(updated))

    // If declared scrap, auto-create a scrap requisition
    if (resolution === 'DECLARED_SCRAP' && scrapReason) {
      const target = updated[idx]
      saveScrapRequisition({
        id: `scrp-${Date.now()}`,
        scrapCode: `SCRP-${Math.floor(8000 + Math.random() * 900)}`,
        ticketNumber: target.ticketNumber,
        orderNumber: target.orderNumber,
        buyer: target.buyer,
        styleName: target.styleName,
        size: target.size,
        color: target.color,
        scrapReason,
        salvageWeightKg: 0.45,
        reCutAuthorized: true,
        sentToCuttingAt: nowStr,
        authorizedBy: inspectorName || 'Quality Recovery Head'
      })
    }

    emitUpdate()
  }
}

// 2. Repair Stations
export function getRepairStations(): RepairStation[] {
  if (typeof window === 'undefined') return INITIAL_STATIONS
  try {
    const raw = localStorage.getItem(KEYS.STATIONS)
    if (!raw) {
      localStorage.setItem(KEYS.STATIONS, JSON.stringify(INITIAL_STATIONS))
      return INITIAL_STATIONS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_STATIONS
  } catch (e) {
    console.error('Failed to parse stations from storage', e)
    return INITIAL_STATIONS
  }
}

export function saveRepairStation(station: RepairStation): void {
  if (typeof window === 'undefined') return
  const current = getRepairStations()
  const idx = current.findIndex(s => s.id === station.id || s.stationCode === station.stationCode)
  let updated: RepairStation[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = station
  } else {
    updated = [...current, station]
  }
  localStorage.setItem(KEYS.STATIONS, JSON.stringify(updated))
  emitUpdate()
}

// 3. Spot Cleaning Logs
export function getSpottingLogs(): SpotCleaningLog[] {
  if (typeof window === 'undefined') return INITIAL_SPOTTING_LOGS
  try {
    const raw = localStorage.getItem(KEYS.SPOTTING_LOGS)
    if (!raw) {
      localStorage.setItem(KEYS.SPOTTING_LOGS, JSON.stringify(INITIAL_SPOTTING_LOGS))
      return INITIAL_SPOTTING_LOGS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_SPOTTING_LOGS
  } catch (e) {
    console.error('Failed to parse spotting logs from storage', e)
    return INITIAL_SPOTTING_LOGS
  }
}

export function saveSpottingLog(log: SpotCleaningLog): void {
  if (typeof window === 'undefined') return
  const current = getSpottingLogs()
  const updated = [log, ...current]
  localStorage.setItem(KEYS.SPOTTING_LOGS, JSON.stringify(updated))
  emitUpdate()
}

// 4. Scrap Requisitions
export function getScrapRequisitions(): ScrapRequisition[] {
  if (typeof window === 'undefined') return INITIAL_SCRAP_REQUISITIONS
  try {
    const raw = localStorage.getItem(KEYS.SCRAP)
    if (!raw) {
      localStorage.setItem(KEYS.SCRAP, JSON.stringify(INITIAL_SCRAP_REQUISITIONS))
      return INITIAL_SCRAP_REQUISITIONS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_SCRAP_REQUISITIONS
  } catch (e) {
    console.error('Failed to parse scrap requisitions from storage', e)
    return INITIAL_SCRAP_REQUISITIONS
  }
}

export function saveScrapRequisition(scrap: ScrapRequisition): void {
  if (typeof window === 'undefined') return
  const current = getScrapRequisitions()
  const updated = [scrap, ...current]
  localStorage.setItem(KEYS.SCRAP, JSON.stringify(updated))
  emitUpdate()
}

// 5. Metrics & Pareto Analysis
export function getAlterMetrics(): AlterationMetrics {
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
    console.error('Failed to parse alter metrics from storage', e)
    return INITIAL_METRICS
  }
}

export interface ParetoDefectItem {
  defectType: string
  label: string
  count: number
  percentage: number
  cumulativePct: number
  rootCause: string
  recommendedFix: string
}

export function getParetoDefectSummary(tickets: AlterationTicket[]): ParetoDefectItem[] {
  const counts: Record<string, number> = {
    SKIP_STITCH: 0,
    SEAM_OPEN: 0,
    OIL_STAIN: 0,
    PUCKERING: 0,
    FABRIC_HOLE: 0,
    SHADING: 0,
    SIZE_MISTAG: 0
  }

  tickets.forEach(t => {
    if (counts[t.defectType] !== undefined) {
      counts[t.defectType]++
    } else {
      counts[t.defectType] = 1
    }
  })

  const total = tickets.length || 1

  const defectMeta: Record<string, { label: string; rootCause: string; fix: string }> = {
    SKIP_STITCH: {
      label: 'Skip Stitches',
      rootCause: 'Needle burr, bent tip, or incorrect hook timing',
      fix: 'Replace needle with Groz-Beckert GEBEDUR titanium and re-time rotary hook'
    },
    SEAM_OPEN: {
      label: 'Seam Opening / Broken Stitch',
      rootCause: 'Low thread strength or insufficient Stitch Per Inch (SPI < 10)',
      fix: 'Upgrade to spun polyester TKT 120 and raise machine SPI to 12'
    },
    OIL_STAIN: {
      label: 'Needle Oil / Machine Stains',
      rootCause: 'Excessive pressure lubrication on overlock needle bars',
      fix: 'Apply micro-oil seal and clean reservoir; flush table with vacuum gun'
    },
    PUCKERING: {
      label: 'Puckering / Uneven Tension',
      rootCause: 'Mismatched differential feed ratio or thread tension too tight',
      fix: 'Calibrate differential feed to 1:0.8 for stretch knit fabrics'
    },
    FABRIC_HOLE: {
      label: 'Fabric Hole / Needle Cut',
      rootCause: 'Dull ball-point needle cutting through knit loops',
      fix: 'Switch from R (sharp) point to SES/SUK (light/medium ball) needle point'
    },
    SIZE_MISTAG: {
      label: 'Size Mis-tagging',
      rootCause: 'Operator mixed size bundles during collar/waist assembly',
      fix: 'Enforce single-bundle color tray separation on sewing line'
    },
    SHADING: {
      label: 'Fabric Shading / Lot Mix',
      rootCause: 'Cut components assembled from two different dye lots',
      fix: 'Verify ply numbering tag before joining front and back panels'
    }
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0)

  let runningSum = 0
  return sorted.map(([type, count]) => {
    runningSum += count
    const pct = Math.round((count / total) * 100)
    const cumulative = Math.round((runningSum / total) * 100)
    const meta = defectMeta[type] || {
      label: type,
      rootCause: 'Operator sewing error',
      fix: 'Re-train machine lineman'
    }

    return {
      defectType: type,
      label: meta.label,
      count,
      percentage: pct,
      cumulativePct: cumulative,
      rootCause: meta.rootCause,
      recommendedFix: meta.fix
    }
  })
}
