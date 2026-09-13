import { LaySheet, CutBundle, MarkerEfficiency, PanelQCAudit, PanelQcAudit, EndBitRemnant, CuttingTable, FabricRollStaging, EndLossRemnant } from '../types/cutting'

// Production Master Tables (Division 03: Cutting Floor)
export const INITIAL_CUTTING_TABLES: CuttingTable[] = [
  {
    id: 'tbl-01',
    table_number: 'Table 01',
    table_name: 'Main Spreading Vacuum Table 01',
    length_meters: 42,
    width_inches: 72,
    vacuum_type: 'Multi-Zone Pneumatic Vacuum',
    auto_cutter_model: 'Gerber Paragon HX-500',
    status: 'IDLE'
  },
  {
    id: 'tbl-02',
    table_number: 'Table 02',
    table_name: 'High-Ply Fleece Vacuum Table 02',
    length_meters: 36,
    width_inches: 68,
    vacuum_type: 'Continuous Suction High-Density',
    auto_cutter_model: 'Lectra Vector Fashion FX',
    status: 'IDLE'
  },
  {
    id: 'tbl-03',
    table_number: 'Table 03',
    table_name: 'Band-Knife & QR Bundling Table 03',
    length_meters: 28,
    width_inches: 64,
    vacuum_type: 'Static Air-Float Table',
    auto_cutter_model: 'Eastman Band Knife EC-700',
    status: 'IDLE'
  },
  {
    id: 'tbl-04',
    table_number: 'Table 04',
    table_name: 'Sample & Small-Run Table 04',
    length_meters: 20,
    width_inches: 60,
    vacuum_type: 'Localized Zone Suction',
    auto_cutter_model: 'Kuris Shuttle Table',
    status: 'IDLE'
  }
]

export const INITIAL_LAY_SHEETS: LaySheet[] = []
export const INITIAL_CUT_BUNDLES: CutBundle[] = []
export const INITIAL_MARKERS: MarkerEfficiency[] = []
export const INITIAL_PANEL_QC_AUDITS: PanelQCAudit[] = []
export const INITIAL_END_BITS: EndBitRemnant[] = []
export const INITIAL_FABRIC_ROLLS: FabricRollStaging[] = []
export const INITIAL_END_LOSS_REMNANTS: EndLossRemnant[] = []
export const INITIAL_PANEL_AUDITS: PanelQcAudit[] = []
