import {
  EmbroideryDesign,
  EmbroideryMachineRun,
  StitchBillingLedger,
  ThreadConeItem,
  EmbroideryQcAudit,
} from '../types/embroidery'

export const INITIAL_EMBROIDERY_DESIGNS: EmbroideryDesign[] = [
  {
    id: 'emb-des-0842',
    design_code: 'DST-OLLY-HD8821-CHEST',
    design_name: 'OLLYPOP Bear Crest 3D Puff & Satin',
    buyer_name: 'OLLYPOP',
    order_id: 'PO-ZIG-8901',
    total_stitches: 22400,
    color_stops_count: 4,
    dst_file_name: 'olly_hd8821_chest_v2.dst',
    rate_per_thousand_stitches: 2.80,
    backing_type: 'Tear-Away 40 GSM',
    thread_brand: 'Madeira',
    status: 'APPROVED',
    width_mm: 85,
    height_mm: 90,
    created_at: '2026-09-11T08:30:00Z',
  }
]

export const INITIAL_MACHINE_RUNS: EmbroideryMachineRun[] = [
  {
    id: 'emb-run-0842',
    run_number: 'EMB-RUN-2026-0842',
    machine_number: 'TAJIMA-20-HEAD-01',
    operator_name: 'P. Murugesan (Senior Embroidery Master)',
    design_id: 'emb-des-0842',
    design_code: 'DST-OLLY-HD8821-CHEST',
    order_po: 'PO-ZIG-8901',
    panels_loaded: 25,
    panels_completed: 25,
    thread_breaks_count: 1,
    total_stitches_run: 448000,
    rpm_speed: 850,
    active_heads: 20,
    total_heads: 20,
    backing_spec: 'Tear-Away 40 GSM',
    status: 'COMPLETED',
    run_date: '12 Sep 2026',
    created_at: '2026-09-12T08:00:00Z',
  }
]

export const INITIAL_BILLING_LEDGERS: StitchBillingLedger[] = [
  {
    id: 'bill-0842',
    invoice_code: 'BIL-EMB-2026-0842',
    order_po: 'PO-ZIG-8901',
    buyer_name: 'OLLYPOP',
    design_code: 'DST-OLLY-HD8821-CHEST',
    total_pieces: 25,
    stitch_count_per_piece: 22400,
    total_stitches_billed: 560000,
    rate_per_thousand: 2.80,
    backing_cost_per_piece: 0.45,
    total_amount: 1579.25,
    billing_status: 'APPROVED',
    created_at: '2026-09-12T10:00:00Z',
  }
]

export const INITIAL_THREAD_CONES: ThreadConeItem[] = [
  {
    id: 'cone-01',
    cone_code: 'THD-MAD-1142',
    brand: 'Madeira',
    shade_number: '1142',
    pantone_match: 'Pantone 19-4052 TCX (Classic Navy)',
    thread_type: 'Polyester 40wt',
    initial_weight_grams: 1000,
    current_weight_grams: 850,
    cones_in_stock: 12,
    storage_bin: 'Rack E-01 / Bin 04',
    status: 'IN_STOCK',
    created_at: '2026-09-11T09:00:00Z',
  },
  {
    id: 'cone-02',
    cone_code: 'THD-MAD-1001',
    brand: 'Madeira',
    shade_number: '1001',
    pantone_match: 'Pantone 11-0601 TCX (Optical White)',
    thread_type: 'Polyester 40wt',
    initial_weight_grams: 1000,
    current_weight_grams: 920,
    cones_in_stock: 15,
    storage_bin: 'Rack E-01 / Bin 05',
    status: 'IN_STOCK',
    created_at: '2026-09-11T09:15:00Z',
  },
  {
    id: 'cone-03',
    cone_code: 'THD-MAD-1224',
    brand: 'Madeira',
    shade_number: '1224',
    pantone_match: 'Pantone 14-0848 TCX (Mimosa Gold)',
    thread_type: 'Polyester 40wt',
    initial_weight_grams: 1000,
    current_weight_grams: 740,
    cones_in_stock: 8,
    storage_bin: 'Rack E-02 / Bin 01',
    status: 'IN_STOCK',
    created_at: '2026-09-11T09:30:00Z',
  }
]

export const INITIAL_QC_AUDITS: EmbroideryQcAudit[] = [
  {
    id: 'qc-0842-1',
    audit_code: 'EMB-QC-2026-001',
    run_id: 'emb-run-0842',
    machine_number: 'TAJIMA-20-HEAD-01',
    head_number: 4,
    defect_type: 'JUMP_TRIM_STRAY',
    severity: 'MINOR',
    action_taken: 'Tension disc adjusted & movable trimmer cleaned',
    auditor_name: 'K. Balaji (QA Inspector)',
    created_at: '2026-09-12T09:45:00Z',
  }
]
