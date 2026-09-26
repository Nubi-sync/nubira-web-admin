import {
  ReadyGoodsCarton,
  AqlAudit,
  HangtagVerification,
  ScaleWeightLog,
  GodownHandoverPallet,
  ReadyGoodsMetrics,
  ReadyGoodsWorker,
  FinishingInspectionTask
} from '../types/readyGoods'

export const INITIAL_METRICS: ReadyGoodsMetrics = {
  totalPackedCartonsToday: 18,
  totalGarmentsPackedToday: 360,
  aqlScorePassPct: 98.4,
  aqlAuditCountToday: 6,
  barcodeMatchPct: 99.8,
  readyInGodownPcs: 1420,
  quarantinedCartonsCount: 1
}

export const INITIAL_CARTONS: ReadyGoodsCarton[] = []
export const INITIAL_AQL_AUDITS: AqlAudit[] = []
export const INITIAL_HANGTAG_VERIFICATIONS: HangtagVerification[] = []
export const INITIAL_HANGTAG_SCANS: HangtagVerification[] = []
export const INITIAL_WEIGHT_LOGS: ScaleWeightLog[] = []
export const INITIAL_SCALE_LOGS: ScaleWeightLog[] = []
export const INITIAL_PALLETS: GodownHandoverPallet[] = []

export const INITIAL_READY_GOODS_WORKERS: ReadyGoodsWorker[] = [
  {
    id: 'rgw-01',
    worker_name: 'Dinesh Rathod',
    phone_number: '9876543210',
    role: 'CHECKER',
    assigned_station: 'Inspection Table 01 (Post-Wash & Iron QC)',
    shift: 'MORNING',
    status: 'ACTIVE',
    inspected_pieces: 142,
    packed_cartons: 0,
    created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    id: 'rgw-02',
    worker_name: 'Sunita Mehra',
    phone_number: '9876543211',
    role: 'PACKER',
    assigned_station: 'Conveyor Packing Line 02',
    shift: 'MORNING',
    status: 'ACTIVE',
    inspected_pieces: 0,
    packed_cartons: 18,
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: 'rgw-03',
    worker_name: 'Vikram Solanki',
    phone_number: '9876543212',
    role: 'BOTH',
    assigned_station: 'Table 03 / Multi-Stage Station',
    shift: 'EVENING',
    status: 'ACTIVE',
    inspected_pieces: 86,
    packed_cartons: 12,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  }
]

export const INITIAL_INSPECTION_TASKS: FinishingInspectionTask[] = [
  {
    id: 'task-fin-01',
    task_code: 'QC-7714-01',
    order_number: 'PO-7714',
    buyer: 'Urban Outfitters',
    style_name: 'French Terry Relaxed Hoodie',
    color: 'Vintage Mineral Wash',
    size: 'L',
    pieces_count: 50,
    origin_stage: 'WASHING_AND_IRON',
    wash_batch_ref: 'WB-082 (Silicon Softener Wash)',
    iron_station_ref: 'Steam Press Board 03',
    has_printing: true,
    has_embroidery: true,
    tech_pack_summary: 'Embroidery First, Then Printing',
    checklist: {
      cutting_done_right: false,
      printing_done_right: false,
      embroidery_done_right: false,
      washing_done_right: false,
      iron_done_right: false
    },
    status: 'PENDING_CHECK',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'task-fin-02',
    task_code: 'QC-7715-02',
    order_number: 'PO-7715',
    buyer: 'Zara International',
    style_name: 'Heavyweight Boxy Drop-Shoulder Tee',
    color: 'Onyx Black',
    size: 'M',
    pieces_count: 75,
    origin_stage: 'WASHING_AND_IRON',
    wash_batch_ref: 'WB-084 (Bio-Polish Enzyme Wash)',
    iron_station_ref: 'Vacuum Table 01',
    has_printing: true,
    has_embroidery: false,
    tech_pack_summary: 'Only Screen Printing (Chest Graphic)',
    checklist: {
      cutting_done_right: false,
      printing_done_right: false,
      washing_done_right: false,
      iron_done_right: false
    },
    status: 'PENDING_CHECK',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'task-fin-03',
    task_code: 'QC-7716-03',
    order_number: 'PO-7716',
    buyer: 'Levi Strauss Co',
    style_name: 'Raw Denim Workwear Overshirt',
    color: 'Indigo Rinse',
    size: 'XL',
    pieces_count: 40,
    origin_stage: 'WASHING_AND_IRON',
    wash_batch_ref: 'WB-085 (Stone Wash & Tint)',
    iron_station_ref: 'Heavy Steam Press 04',
    has_printing: false,
    has_embroidery: false,
    tech_pack_summary: 'No Printing, No Embroidery',
    checklist: {
      cutting_done_right: false,
      washing_done_right: false,
      iron_done_right: false
    },
    status: 'PENDING_CHECK',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'task-fin-04',
    task_code: 'QC-7717-04',
    order_number: 'PO-7717',
    buyer: 'Tommy Hilfiger',
    style_name: 'Pique Heritage Polo',
    color: 'Classic Navy',
    size: 'S',
    pieces_count: 60,
    origin_stage: 'WASHING_AND_IRON',
    wash_batch_ref: 'WB-081 (Silicone Soft Wash)',
    iron_station_ref: 'Collar Crease Table 02',
    has_printing: false,
    has_embroidery: true,
    tech_pack_summary: 'Only Multi-Head Embroidery (Crest Logo)',
    checklist: {
      cutting_done_right: false,
      embroidery_done_right: false,
      washing_done_right: false,
      iron_done_right: false
    },
    status: 'PENDING_CHECK',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'task-fin-05',
    task_code: 'QC-7714-R1',
    order_number: 'PO-7714',
    buyer: 'Urban Outfitters',
    style_name: 'French Terry Relaxed Hoodie',
    color: 'Vintage Mineral Wash',
    size: 'M',
    pieces_count: 8,
    origin_stage: 'REPAIRED_ALTERATION_REINSPECTION',
    wash_batch_ref: 'WB-082 (Repaired Rework)',
    iron_station_ref: 'Touchup Press 01',
    has_printing: true,
    has_embroidery: true,
    tech_pack_summary: 'Embroidery & Print - Repaired from Alteration Station 02',
    checklist: {
      cutting_done_right: true,
      printing_done_right: true,
      embroidery_done_right: true,
      washing_done_right: true,
      iron_done_right: false
    },
    status: 'IN_CHECKING',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  }
]
