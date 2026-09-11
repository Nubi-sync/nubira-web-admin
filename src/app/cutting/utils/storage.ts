import { LaySheet, CutBundle, MarkerEfficiency, PanelQCAudit, PanelQcAudit, EndBitRemnant, CuttingTable, FabricRollStaging, EndLossRemnant } from '../types/cutting'
import { 
  INITIAL_CUTTING_TABLES, 
  INITIAL_LAY_SHEETS, 
  INITIAL_CUT_BUNDLES, 
  INITIAL_MARKERS, 
  INITIAL_PANEL_QC_AUDITS, 
  INITIAL_END_BITS,
  INITIAL_FABRIC_ROLLS,
  INITIAL_END_LOSS_REMNANTS,
  INITIAL_PANEL_AUDITS
} from '../data/mockData'

const TABLES_KEY = 'zigza_cutting_tables_v1'
const LAYS_KEY = 'zigza_cutting_lays_v1'
const BUNDLES_KEY = 'zigza_cutting_bundles_v1'
const MARKERS_KEY = 'zigza_cutting_markers_v1'
const QC_KEY = 'zigza_cutting_qc_v1'
const ENDBITS_KEY = 'zigza_cutting_endbits_v1'
const ROLLS_KEY = 'zigza_cutting_rolls_v1'
const ENDLOSS_KEY = 'zigza_cutting_endloss_v1'
const AUDITS_KEY = 'zigza_cutting_audits_v1'

export function getCuttingTables(): CuttingTable[] {
  if (typeof window === 'undefined') return INITIAL_CUTTING_TABLES
  const stored = localStorage.getItem(TABLES_KEY)
  if (!stored) {
    localStorage.setItem(TABLES_KEY, JSON.stringify(INITIAL_CUTTING_TABLES))
    return INITIAL_CUTTING_TABLES
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_CUTTING_TABLES
  }
}

export function saveCuttingTables(tables: CuttingTable[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TABLES_KEY, JSON.stringify(tables))
}

export function getLaySheets(): LaySheet[] {
  if (typeof window === 'undefined') return INITIAL_LAY_SHEETS
  const stored = localStorage.getItem(LAYS_KEY)
  if (!stored) {
    localStorage.setItem(LAYS_KEY, JSON.stringify(INITIAL_LAY_SHEETS))
    return INITIAL_LAY_SHEETS
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_LAY_SHEETS
  }
}

export function saveLaySheet(lay: LaySheet): LaySheet[] {
  const current = getLaySheets()
  const index = current.findIndex(item => item.id === lay.id)
  let updated: LaySheet[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = lay
  } else {
    updated = [lay, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAYS_KEY, JSON.stringify(updated))
  }
  return updated
}

export function getCutBundles(): CutBundle[] {
  if (typeof window === 'undefined') return INITIAL_CUT_BUNDLES
  const stored = localStorage.getItem(BUNDLES_KEY)
  if (!stored) {
    localStorage.setItem(BUNDLES_KEY, JSON.stringify(INITIAL_CUT_BUNDLES))
    return INITIAL_CUT_BUNDLES
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_CUT_BUNDLES
  }
}

export function saveCutBundle(bundle: CutBundle): CutBundle[] {
  const current = getCutBundles()
  const index = current.findIndex(item => item.id === bundle.id)
  let updated: CutBundle[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = bundle
  } else {
    updated = [bundle, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(BUNDLES_KEY, JSON.stringify(updated))
  }
  return updated
}

export function bulkAddCutBundles(newBundles: CutBundle[]): CutBundle[] {
  const current = getCutBundles()
  const updated = [...newBundles, ...current]
  if (typeof window !== 'undefined') {
    localStorage.setItem(BUNDLES_KEY, JSON.stringify(updated))
  }
  return updated
}

export function getMarkers(): MarkerEfficiency[] {
  if (typeof window === 'undefined') return INITIAL_MARKERS
  const stored = localStorage.getItem(MARKERS_KEY)
  if (!stored) {
    localStorage.setItem(MARKERS_KEY, JSON.stringify(INITIAL_MARKERS))
    return INITIAL_MARKERS
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_MARKERS
  }
}

export function saveMarker(marker: MarkerEfficiency): MarkerEfficiency[] {
  const current = getMarkers()
  const index = current.findIndex(item => item.id === marker.id)
  let updated: MarkerEfficiency[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = marker
  } else {
    updated = [marker, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(MARKERS_KEY, JSON.stringify(updated))
  }
  return updated
}

export function getPanelQcAudits(): PanelQCAudit[] {
  if (typeof window === 'undefined') return INITIAL_PANEL_QC_AUDITS
  const stored = localStorage.getItem(QC_KEY)
  if (!stored) {
    localStorage.setItem(QC_KEY, JSON.stringify(INITIAL_PANEL_QC_AUDITS))
    return INITIAL_PANEL_QC_AUDITS
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_PANEL_QC_AUDITS
  }
}

export function savePanelQcAudit(audit: PanelQCAudit): PanelQCAudit[] {
  const current = getPanelQcAudits()
  const index = current.findIndex(item => item.id === audit.id)
  let updated: PanelQCAudit[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = audit
  } else {
    updated = [audit, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(QC_KEY, JSON.stringify(updated))
  }
  return updated
}

export function getEndBits(): EndBitRemnant[] {
  if (typeof window === 'undefined') return INITIAL_END_BITS
  const stored = localStorage.getItem(ENDBITS_KEY)
  if (!stored) {
    localStorage.setItem(ENDBITS_KEY, JSON.stringify(INITIAL_END_BITS))
    return INITIAL_END_BITS
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_END_BITS
  }
}

export function saveEndBit(endBit: EndBitRemnant): EndBitRemnant[] {
  const current = getEndBits()
  const index = current.findIndex(item => item.id === endBit.id)
  let updated: EndBitRemnant[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = endBit
  } else {
    updated = [endBit, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(ENDBITS_KEY, JSON.stringify(updated))
  }
  return updated
}

export function getFabricRolls(): FabricRollStaging[] {
  if (typeof window === 'undefined') return INITIAL_FABRIC_ROLLS
  const stored = localStorage.getItem(ROLLS_KEY)
  if (!stored) {
    localStorage.setItem(ROLLS_KEY, JSON.stringify(INITIAL_FABRIC_ROLLS))
    return INITIAL_FABRIC_ROLLS
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_FABRIC_ROLLS
  }
}

export function saveFabricRoll(roll: FabricRollStaging): FabricRollStaging[] {
  const current = getFabricRolls()
  const index = current.findIndex(item => item.id === roll.id)
  let updated: FabricRollStaging[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = roll
  } else {
    updated = [roll, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(ROLLS_KEY, JSON.stringify(updated))
  }
  return updated
}

export function getEndLossRemnants(): EndLossRemnant[] {
  if (typeof window === 'undefined') return INITIAL_END_LOSS_REMNANTS
  const stored = localStorage.getItem(ENDLOSS_KEY)
  if (!stored) {
    localStorage.setItem(ENDLOSS_KEY, JSON.stringify(INITIAL_END_LOSS_REMNANTS))
    return INITIAL_END_LOSS_REMNANTS
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_END_LOSS_REMNANTS
  }
}

export function saveEndLossRemnant(remnant: EndLossRemnant): EndLossRemnant[] {
  const current = getEndLossRemnants()
  const index = current.findIndex(item => item.id === remnant.id)
  let updated: EndLossRemnant[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = remnant
  } else {
    updated = [remnant, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(ENDLOSS_KEY, JSON.stringify(updated))
  }
  return updated
}

export function getPanelAudits(): PanelQcAudit[] {
  if (typeof window === 'undefined') return INITIAL_PANEL_AUDITS
  const stored = localStorage.getItem(AUDITS_KEY)
  if (!stored) {
    localStorage.setItem(AUDITS_KEY, JSON.stringify(INITIAL_PANEL_AUDITS))
    return INITIAL_PANEL_AUDITS
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_PANEL_AUDITS
  }
}

export function savePanelAudit(audit: PanelQcAudit): PanelQcAudit[] {
  const current = getPanelAudits()
  const index = current.findIndex(item => item.id === audit.id)
  let updated: PanelQcAudit[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = audit
  } else {
    updated = [audit, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUDITS_KEY, JSON.stringify(updated))
  }
  return updated
}
