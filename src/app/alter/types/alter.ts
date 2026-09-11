export type DefectSource = 
  | 'SEWING_LINE' 
  | 'WASHING' 
  | 'IRONING' 
  | 'PACKING_AQL'

export type DefectType = 
  | 'SKIP_STITCH' 
  | 'SEAM_OPEN' 
  | 'OIL_STAIN' 
  | 'PUCKERING' 
  | 'FABRIC_HOLE' 
  | 'SHADING' 
  | 'SIZE_MISTAG'

export type AssignedStation = 
  | 'Mending Station 01' 
  | 'Mending Station 02' 
  | 'Mending Station 03' 
  | 'Mending Station 04' 
  | 'Spot Cleaning Gun 05' 
  | 'Spot Cleaning Gun 06' 
  | 'Secondary Inspection Table'

export type RepairAction = 
  | 'SEAM_RE_STITCHED' 
  | 'COLLAR_RESET' 
  | 'STAIN_SPRAY_CLEANED' 
  | 'PANEL_REPLACED' 
  | 'BUTTON_RESET' 
  | 'UNPICK_RESEW'

export type ResolutionStatus = 
  | 'IN_REWORK' 
  | 'REPAIRED_PASSED' 
  | 'DECLARED_SCRAP'

export type ScrapReason = 
  | 'FABRIC_TORN' 
  | 'PERMANENT_STAIN' 
  | 'BURNT_FABRIC' 
  | 'HOLE_IN_SHELL' 
  | 'UNSALVAGEABLE_COLOR_BLEED'

export interface AlterationTicket {
  id: string
  ticketNumber: string // Pattern: ^ALT-[0-9]{4,6}$ e.g. ALT-5501
  garmentBarcode: string // Scanned bundle barcode e.g. BDL-7714-04-P08
  orderNumber: string // e.g. PO-7714
  buyer: string // e.g. Urban Outfitters
  styleName: string // e.g. French Terry Relaxed Hoodie
  size: string
  color: string
  sourceDivision: DefectSource
  defectType: DefectType
  defectDescription: string
  linemanEmployeeId: string
  linemanName: string
  assignedStation: AssignedStation
  menderEmployeeId?: string
  menderName?: string
  repairActionTaken?: RepairAction
  inspectorId?: string
  inspectorName?: string
  resolutionStatus: ResolutionStatus
  scrapReason?: ScrapReason
  repairCost: number // In INR (₹)
  createdAt: string
  clearedAt?: string
}

export interface RepairStation {
  id: string
  stationCode: string // e.g. STN-MEND-01
  stationName: string // e.g. Mending Station 01 (Collar & Neck)
  menderName: string
  equipmentType: string // e.g. Juki DDL-9000C Direct-Drive Lockstitch
  activeTicketsCount: number
  repairedTodayCount: number
  status: 'ACTIVE' | 'MAINTENANCE' | 'IDLE'
}

export interface SpotCleaningLog {
  id: string
  logCode: string // e.g. SPT-1021
  ticketNumber: string
  stainType: string
  solventUsed: string
  vacuumTableSec: number
  stainRemoved: boolean
  haloVisible: boolean // false = clean
  operatorName: string
  timestamp: string
}

export interface ScrapRequisition {
  id: string
  scrapCode: string // e.g. SCRP-8801
  ticketNumber: string
  orderNumber: string
  buyer: string
  styleName: string
  size: string
  color: string
  scrapReason: ScrapReason
  salvageWeightKg: number
  reCutAuthorized: boolean
  sentToCuttingAt: string
  authorizedBy: string
}

export interface AlterationMetrics {
  activeInQueueCount: number
  repairedAndClearedToday: number
  topRecurringDefect: string
  recoveryClearanceRatePct: number
  scrapCountToday: number
}
