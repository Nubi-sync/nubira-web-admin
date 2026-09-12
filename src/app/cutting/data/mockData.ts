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
    current_lay_id: 'lay-0842',
    status: 'SPREADING'
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

// Production Lay Sheets (Division 03 - Synced with PO-ZIG-8901)
export const INITIAL_LAY_SHEETS: LaySheet[] = [
  {
    id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    brand_name: 'OLLYPOP',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    table_number: 'Table 01',
    fabric_roll_barcodes: ['ROL-FT-8821-A1', 'ROL-FT-8821-A2'],
    shell_fabric: '100% Combed Cotton French Terry 380 GSM',
    gsm: 380,
    plies_count: 80,
    marker_length_meters: 5.40,
    total_cut_pieces: 800,
    ratio_breakdown: 'XS:1, S:2, M:4, L:2, XL:1 (Ratio: 10)',
    fabric_weight_kg: 216.0,
    cutting_master: 'R. Veerappan (Master Cutter)',
    status: 'CUT_COMPLETED',
    created_at: '2026-09-12T08:30:00Z'
  }
]

// Serialized Component Barcode Bundles (Seed: 35 Barcode Bundles from LAY-2026-0842)
export const INITIAL_CUT_BUNDLES: CutBundle[] = [
  // XS (4 Bundles)
  {
    id: 'bnd-0842-xs-001',
    bundle_number: 'BND-0842-XS-001',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    color: 'Jet Black',
    size: 'XS',
    ply_range_start: 1,
    ply_range_end: 25,
    pieces_count: 25,
    qr_code: 'BND-0842-XS-001',
    destination: '06_SEWING',
    status: 'BANDED',
    created_at: '2026-09-12T09:00:00Z'
  },
  {
    id: 'bnd-0842-xs-002',
    bundle_number: 'BND-0842-XS-002',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    color: 'Jet Black',
    size: 'XS',
    ply_range_start: 26,
    ply_range_end: 50,
    pieces_count: 25,
    qr_code: 'BND-0842-XS-002',
    destination: '06_SEWING',
    status: 'BANDED',
    created_at: '2026-09-12T09:00:00Z'
  },
  {
    id: 'bnd-0842-xs-003',
    bundle_number: 'BND-0842-XS-003',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    color: 'Jet Black',
    size: 'XS',
    ply_range_start: 51,
    ply_range_end: 75,
    pieces_count: 25,
    qr_code: 'BND-0842-XS-003',
    destination: '06_SEWING',
    status: 'IN_TRANSIT',
    created_at: '2026-09-12T09:00:00Z'
  },
  {
    id: 'bnd-0842-xs-004',
    bundle_number: 'BND-0842-XS-004',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    color: 'Jet Black',
    size: 'XS',
    ply_range_start: 76,
    ply_range_end: 80,
    pieces_count: 5,
    qr_code: 'BND-0842-XS-004',
    destination: '06_SEWING',
    status: 'HANDOVER_CONFIRMED',
    created_at: '2026-09-12T09:00:00Z'
  },
  // S (Sample of 7 Bundles)
  {
    id: 'bnd-0842-s-001',
    bundle_number: 'BND-0842-S-001',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    color: 'Jet Black',
    size: 'S',
    ply_range_start: 1,
    ply_range_end: 25,
    pieces_count: 25,
    qr_code: 'BND-0842-S-001',
    destination: '06_SEWING',
    status: 'BANDED',
    created_at: '2026-09-12T09:05:00Z'
  },
  {
    id: 'bnd-0842-s-002',
    bundle_number: 'BND-0842-S-002',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    color: 'Jet Black',
    size: 'S',
    ply_range_start: 26,
    ply_range_end: 50,
    pieces_count: 25,
    qr_code: 'BND-0842-S-002',
    destination: '06_SEWING',
    status: 'BANDED',
    created_at: '2026-09-12T09:05:00Z'
  },
  // M (Sample of 13 Bundles)
  {
    id: 'bnd-0842-m-001',
    bundle_number: 'BND-0842-M-001',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    color: 'Jet Black',
    size: 'M',
    ply_range_start: 1,
    ply_range_end: 25,
    pieces_count: 25,
    qr_code: 'BND-0842-M-001',
    destination: '06_SEWING',
    status: 'IN_TRANSIT',
    created_at: '2026-09-12T09:10:00Z'
  },
  {
    id: 'bnd-0842-m-002',
    bundle_number: 'BND-0842-M-002',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    color: 'Jet Black',
    size: 'M',
    ply_range_start: 26,
    ply_range_end: 50,
    pieces_count: 25,
    qr_code: 'BND-0842-M-002',
    destination: '06_SEWING',
    status: 'BANDED',
    created_at: '2026-09-12T09:10:00Z'
  },
  // L (Sample of 7 Bundles)
  {
    id: 'bnd-0842-l-001',
    bundle_number: 'BND-0842-L-001',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    color: 'Jet Black',
    size: 'L',
    ply_range_start: 1,
    ply_range_end: 25,
    pieces_count: 25,
    qr_code: 'BND-0842-L-001',
    destination: '06_SEWING',
    status: 'GENERATED',
    created_at: '2026-09-12T09:15:00Z'
  },
  // XL (Sample of 4 Bundles)
  {
    id: 'bnd-0842-xl-001',
    bundle_number: 'BND-0842-XL-001',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    color: 'Jet Black',
    size: 'XL',
    ply_range_start: 1,
    ply_range_end: 25,
    pieces_count: 25,
    qr_code: 'BND-0842-XL-001',
    destination: '06_SEWING',
    status: 'GENERATED',
    created_at: '2026-09-12T09:20:00Z'
  }
]

// Production CAD Markers
export const INITIAL_MARKERS: MarkerEfficiency[] = [
  {
    id: 'mkr-01',
    marker_ref: 'MKR-HD-8821-A',
    style_ref: 'ART-HD-8821',
    style_name: 'Heavyweight French Terry Hoodie',
    category: 'Hoodie',
    fabric_width_inches: 60,
    marker_length_meters: 5.40,
    patterns_nested: 10,
    fabric_yield_meters_per_piece: 1.08,
    efficiency_percent: 89.6,
    scrap_percent: 10.4,
    cad_software: 'Gerber AccuMark v16.2',
    grainline_constraint: 'ONE_WAY',
    status: 'IN_BULK_USE',
    created_at: '2026-09-11T09:30:00Z'
  }
]

// Precision Cut Panel QC Audits (Production Records)
export const INITIAL_PANEL_QC_AUDITS: PanelQCAudit[] = [
  {
    id: 'pqc-01',
    audit_number: 'AUD-CUT-0001',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    bundle_number: 'BND-0842-M-001',
    style_ref: 'ART-HD-8821',
    sampled_ply: 'TOP',
    measurement_variance_mm: 0.45,
    notching_precision: 'PASS',
    grainline_alignment: 'ALIGNED',
    blade_heat_melt: 'NONE',
    decision: 'PASSED',
    defect_notes: 'Top and bottom plies verified against acrylic template. Notch precision within 0.5mm. Zero blade heat fusion.',
    auditor_name: 'K. Balaji (Cutting Floor QA)',
    created_at: '2026-09-12T10:00:00Z'
  }
]

// End-Bit Remnants (Production Records)
export const INITIAL_END_BITS: EndBitRemnant[] = [
  {
    id: 'ebt-01',
    remnant_code: 'REM-0842-A1',
    fabric_roll_ref: 'ROL-FT-8821-A1',
    fabric_description: 'Heavyweight French Terry 380 GSM Combed Cotton',
    color_shade_lot: 'Jet Black (Shade Lot A)',
    usable_length_meters: 1.20,
    weight_kg: 0.48,
    storage_rack_bin: 'Rack C-04 / Bin 12',
    status: 'AVAILABLE_FOR_RECUT',
    logged_by: 'M. Senthil',
    created_at: '2026-09-12T09:45:00Z'
  }
]

// Store Fabric Rolls in Cutting Relaxation Bay
export const INITIAL_FABRIC_ROLLS: FabricRollStaging[] = [
  {
    id: 'roll-01',
    roll_barcode: 'ROL-FT-8821-A1',
    fabric_lot_number: 'LOT-2026-991',
    fabric_type: 'Heavyweight French Terry 380 GSM Combed Cotton',
    colorway: 'Jet Black',
    weight_kg: 22.5,
    meters_length: 55.0,
    nominal_gsm: 380,
    tested_gsm: 382,
    unrolled_at: '2026-09-11T08:00:00Z',
    relaxation_hours_required: 24,
    relaxation_hours_elapsed: 24,
    status: 'CONDITIONING_COMPLETED',
    staging_rack: 'Rack A-01 (Air-Conditioned Bay)'
  },
  {
    id: 'roll-02',
    roll_barcode: 'ROL-FT-8821-A2',
    fabric_lot_number: 'LOT-2026-991',
    fabric_type: 'Heavyweight French Terry 380 GSM Combed Cotton',
    colorway: 'Jet Black',
    weight_kg: 22.8,
    meters_length: 55.0,
    nominal_gsm: 380,
    tested_gsm: 381,
    unrolled_at: '2026-09-11T08:00:00Z',
    relaxation_hours_required: 24,
    relaxation_hours_elapsed: 24,
    status: 'CONDITIONING_COMPLETED',
    staging_rack: 'Rack A-02 (Air-Conditioned Bay)'
  }
]

export const INITIAL_END_LOSS_REMNANTS: EndLossRemnant[] = [
  {
    id: 'rem-01',
    remnant_code: 'REM-0842-A1',
    source_roll_barcode: 'ROL-FT-8821-A1',
    fabric_type: 'Heavyweight French Terry 380 GSM Combed Cotton',
    colorway: 'Jet Black',
    length_meters: 1.20,
    width_inches: 60,
    reason: 'End-of-roll cut off insufficient for full marker lay',
    disposition: 'SALVAGED_FOR_POCKETS',
    allocated_to: 'Pocket linings & Hood welts',
    created_at: '2026-09-12T09:50:00Z'
  }
]

export const INITIAL_PANEL_AUDITS: PanelQcAudit[] = [
  {
    id: 'pqc-101',
    audit_number: 'AUD-CUT-0001',
    lay_sheet_id: 'lay-0842',
    lay_number: 'LAY-2026-0842',
    component_name: 'Front Hood & Body Panels',
    sampled_plies: ['Top Ply #1', 'Mid Ply #40', 'Bottom Ply #80'],
    notch_alignment_check: 'ACCURATE',
    top_bottom_ply_variance_mm: 0.45,
    defects_found: ['None detected - Precision straight-knife within 0.5mm'],
    result: 'PASSED',
    auditor_name: 'K. Balaji (Cutting Floor QA)',
    audit_timestamp: '2026-09-12T10:00:00Z'
  }
]
