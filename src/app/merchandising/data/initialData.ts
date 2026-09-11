import { 
  MerchandisingOrder, 
  BomCosting, 
  TnaMilestone, 
  SourcingRequisition, 
  ExportShipment 
} from '../types/merchandising'

export const INITIAL_ORDERS: MerchandisingOrder[] = [
  {
    id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    brand_name: 'Zara Global',
    style_ref: 'ZG-HOOD-01',
    style_name: 'Heavyweight Fleece Pullover Hoodie 380 GSM',
    total_quantity: 24000,
    currency: 'USD',
    unit_fob_price: 14.50,
    total_contract_value: 348000.00,
    ex_factory_date: '2026-10-15',
    status: 'IN_PRODUCTION',
    color_matrix: [
      { color: 'Washed Black', sizes: { 'XS': 1200, 'S': 2400, 'M': 3600, 'L': 3000, 'XL': 1800 }, total: 12000 },
      { color: 'Bone White', sizes: { 'XS': 1200, 'S': 2400, 'M': 3600, 'L': 3000, 'XL': 1800 }, total: 12000 }
    ],
    created_at: '2026-08-20'
  },
  {
    id: 'ord-4420',
    po_number: 'PO-OLL-4420',
    brand_name: 'Ollypop Kids',
    style_ref: 'OP-KID-401',
    style_name: 'Bio-Wash Raglan Toddler Tee 190 GSM',
    total_quantity: 18500,
    currency: 'INR',
    unit_fob_price: 340.00,
    total_contract_value: 6290000.00,
    ex_factory_date: '2026-10-25',
    status: 'IN_FABRIC',
    color_matrix: [
      { color: 'Sky Blue / Navy', sizes: { '2T': 2500, '3T': 3000, '4T': 3500, '5T': 1000 }, total: 10000 },
      { color: 'Lemon / Heather', sizes: { '2T': 2000, '3T': 2500, '4T': 2500, '5T': 1500 }, total: 8500 }
    ],
    created_at: '2026-08-25'
  },
  {
    id: 'ord-9102',
    po_number: 'PO-HM-9102',
    brand_name: 'H&M Basics',
    style_ref: 'HM-TSH-102',
    style_name: 'Organic Ring-Spun Combed Crew Tee 160 GSM',
    total_quantity: 45000,
    currency: 'USD',
    unit_fob_price: 5.80,
    total_contract_value: 261000.00,
    ex_factory_date: '2026-09-28',
    status: 'PACKED',
    color_matrix: [
      { color: 'Optic White', sizes: { 'S': 6000, 'M': 10000, 'L': 6000, 'XL': 3000 }, total: 25000 },
      { color: 'Pure Black', sizes: { 'S': 5000, 'M': 8000, 'L': 5000, 'XL': 2000 }, total: 20000 }
    ],
    created_at: '2026-08-01'
  },
  {
    id: 'ord-7731',
    po_number: 'PO-NUB-7731',
    brand_name: 'Nubira Essentials',
    style_ref: 'NB-POLO-304',
    style_name: 'Mercerized Pique Structured Golf Polo 240 GSM',
    total_quantity: 12000,
    currency: 'INR',
    unit_fob_price: 620.00,
    total_contract_value: 7440000.00,
    ex_factory_date: '2026-11-05',
    status: 'BOOKED',
    color_matrix: [
      { color: 'Forest Green', sizes: { 'S': 1500, 'M': 2500, 'L': 1500, 'XL': 500 }, total: 6000 },
      { color: 'Burgundy', sizes: { 'S': 1500, 'M': 2500, 'L': 1500, 'XL': 500 }, total: 6000 }
    ],
    created_at: '2026-09-02'
  },
  {
    id: 'ord-5519',
    po_number: 'PO-MAN-5519',
    brand_name: 'Mango Casuals',
    style_ref: 'MG-CRW-201',
    style_name: 'French Terry Relaxed Crewneck 320 GSM',
    total_quantity: 16000,
    currency: 'EUR',
    unit_fob_price: 12.20,
    total_contract_value: 195200.00,
    ex_factory_date: '2026-09-05',
    status: 'DISPATCHED',
    color_matrix: [
      { color: 'Sage Mist', sizes: { 'XS': 1500, 'S': 3000, 'M': 4500, 'L': 3000 }, total: 12000 },
      { color: 'Charcoal', sizes: { 'S': 1000, 'M': 1500, 'L': 1500 }, total: 4000 }
    ],
    created_at: '2026-07-15'
  }
]

export const INITIAL_BOM_COSTINGS: BomCosting[] = [
  {
    id: 'bom-8901',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ZG-HOOD-01',
    style_name: 'Heavyweight Fleece Pullover Hoodie 380 GSM',
    fabric_cost: 6.80,
    trims_accessories_cost: 1.40,
    embellishment_cost: 0.85,
    cmt_sewing_rate: 2.10,
    washing_finishing_cost: 0.60,
    packaging_cost: 0.45,
    factory_overhead_percent: 12.0,
    net_fob_cost: 13.66,
    target_margin_percent: 18.5,
    actual_realized_cost: 13.78,
    variance_percent: 0.88
  },
  {
    id: 'bom-4420',
    order_id: 'ord-4420',
    po_number: 'PO-OLL-4420',
    style_ref: 'OP-KID-401',
    style_name: 'Bio-Wash Raglan Toddler Tee 190 GSM',
    fabric_cost: 145.00,
    trims_accessories_cost: 28.00,
    embellishment_cost: 22.00,
    cmt_sewing_rate: 42.00,
    washing_finishing_cost: 18.00,
    packaging_cost: 12.00,
    factory_overhead_percent: 12.0,
    net_fob_cost: 299.04,
    target_margin_percent: 16.0,
    actual_realized_cost: 308.50,
    variance_percent: 3.16 // Alert: > 2.0% variance
  },
  {
    id: 'bom-9102',
    order_id: 'ord-9102',
    po_number: 'PO-HM-9102',
    style_ref: 'HM-TSH-102',
    style_name: 'Organic Ring-Spun Combed Crew Tee 160 GSM',
    fabric_cost: 2.40,
    trims_accessories_cost: 0.45,
    embellishment_cost: 0.00,
    cmt_sewing_rate: 1.15,
    washing_finishing_cost: 0.35,
    packaging_cost: 0.25,
    factory_overhead_percent: 12.0,
    net_fob_cost: 5.15,
    target_margin_percent: 14.0,
    actual_realized_cost: 5.12,
    variance_percent: -0.58
  },
  {
    id: 'bom-7731',
    order_id: 'ord-7731',
    po_number: 'PO-NUB-7731',
    style_ref: 'NB-POLO-304',
    style_name: 'Mercerized Pique Structured Golf Polo 240 GSM',
    fabric_cost: 260.00,
    trims_accessories_cost: 45.00,
    embellishment_cost: 35.00,
    cmt_sewing_rate: 68.00,
    washing_finishing_cost: 24.00,
    packaging_cost: 18.00,
    factory_overhead_percent: 12.0,
    net_fob_cost: 504.00,
    target_margin_percent: 21.0,
    actual_realized_cost: 501.20,
    variance_percent: -0.55
  }
]

export const INITIAL_TNA_MILESTONES: TnaMilestone[] = [
  {
    id: 'tna-1',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ZG-HOOD-01',
    milestone_name: '1. Lab Dip Approval',
    planned_date: '2026-08-27',
    actual_date: '2026-08-26',
    status: 'COMPLETED',
    delay_reason: null,
    sort_order: 1
  },
  {
    id: 'tna-2',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ZG-HOOD-01',
    milestone_name: '2. Bulk Fabric Inward',
    planned_date: '2026-09-08',
    actual_date: '2026-09-08',
    status: 'COMPLETED',
    delay_reason: null,
    sort_order: 2
  },
  {
    id: 'tna-3',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ZG-HOOD-01',
    milestone_name: '3. Size Set Sample Approval',
    planned_date: '2026-09-12',
    actual_date: '2026-09-11',
    status: 'COMPLETED',
    delay_reason: null,
    sort_order: 3
  },
  {
    id: 'tna-4',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ZG-HOOD-01',
    milestone_name: '4. Pre-Production Meeting & Pilot Cut',
    planned_date: '2026-09-16',
    actual_date: null,
    status: 'ON_SCHEDULE',
    delay_reason: null,
    sort_order: 4
  },
  {
    id: 'tna-5',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ZG-HOOD-01',
    milestone_name: '5. Bulk Cutting & Lineman Allotment',
    planned_date: '2026-09-20',
    actual_date: null,
    status: 'ON_SCHEDULE',
    delay_reason: null,
    sort_order: 5
  },
  {
    id: 'tna-6',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ZG-HOOD-01',
    milestone_name: '6. Mid-Inspection Audit',
    planned_date: '2026-09-30',
    actual_date: null,
    status: 'ON_SCHEDULE',
    delay_reason: null,
    sort_order: 6
  },
  {
    id: 'tna-7',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ZG-HOOD-01',
    milestone_name: '7. Final AQL 2.5 Audit & Carton Sealing',
    planned_date: '2026-10-10',
    actual_date: null,
    status: 'ON_SCHEDULE',
    delay_reason: null,
    sort_order: 7
  },
  {
    id: 'tna-8',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    style_ref: 'ZG-HOOD-01',
    milestone_name: '8. Container Handover / Port Departure',
    planned_date: '2026-10-15',
    actual_date: null,
    status: 'ON_SCHEDULE',
    delay_reason: null,
    sort_order: 8
  },
  // Order OP-4420 with an alert milestone
  {
    id: 'tna-9',
    order_id: 'ord-4420',
    po_number: 'PO-OLL-4420',
    style_ref: 'OP-KID-401',
    milestone_name: '2. Bulk Fabric Inward',
    planned_date: '2026-09-10',
    actual_date: null,
    status: 'DELAYED',
    delay_reason: 'Dyeing house lot shade variation re-dip in progress',
    mitigation_notes: 'Mill expedited express truck dispatch scheduled for Sept 14',
    sort_order: 2
  }
]

export const INITIAL_SOURCING_REQUISITIONS: SourcingRequisition[] = [
  {
    id: 'pr-101',
    pr_number: 'PR-2026-0881',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    material_name: '3-End French Terry Cotton 380 GSM',
    material_type: 'FABRIC',
    required_quantity: 18240,
    unit: 'Kg',
    vendor_name: 'Vardhman Textiles Ltd',
    required_in_store_date: '2026-09-08',
    fulfillment_status: 'STORE_RECEIVED',
    created_at: '2026-08-21'
  },
  {
    id: 'pr-102',
    pr_number: 'PR-2026-0882',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    material_name: 'Coats Epic 120 Polyester Core Thread (Jet Black)',
    material_type: 'SEWING_THREAD',
    required_quantity: 480,
    unit: 'Cones',
    vendor_name: 'Coats India Global',
    required_in_store_date: '2026-09-15',
    fulfillment_status: 'ORDERED',
    created_at: '2026-08-22'
  },
  {
    id: 'pr-103',
    pr_number: 'PR-2026-0883',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    material_name: 'Recycled Woven Neck Damask Labels',
    material_type: 'LABEL',
    required_quantity: 24500,
    unit: 'Pcs',
    vendor_name: 'Avery Dennison India',
    required_in_store_date: '2026-09-18',
    fulfillment_status: 'ORDERED',
    created_at: '2026-08-22'
  },
  {
    id: 'pr-104',
    pr_number: 'PR-2026-0884',
    order_id: 'ord-4420',
    po_number: 'PO-OLL-4420',
    material_name: '100% Combed Single Jersey 190 GSM (Lemon Yellow)',
    material_type: 'FABRIC',
    required_quantity: 4200,
    unit: 'Kg',
    vendor_name: 'Nahar Spinning Mills',
    required_in_store_date: '2026-09-12',
    fulfillment_status: 'PENDING',
    created_at: '2026-08-26'
  },
  {
    id: 'pr-105',
    pr_number: 'PR-2026-0885',
    order_id: 'ord-9102',
    po_number: 'PO-HM-9102',
    material_name: '7-Ply Export Grade Corrugated Master Cartons',
    material_type: 'CARTON',
    required_quantity: 900,
    unit: 'Boxes',
    vendor_name: 'Jayant Packaging Corp',
    required_in_store_date: '2026-09-22',
    fulfillment_status: 'STORE_RECEIVED',
    created_at: '2026-08-05'
  }
]

export const INITIAL_EXPORT_SHIPMENTS: ExportShipment[] = [
  {
    id: 'shp-801',
    shipment_ref: 'SHP-80129',
    order_id: 'ord-9102',
    po_number: 'PO-HM-9102',
    forwarder_name: 'Kuehne + Nagel Logistics',
    carrier_vessel: 'MSC GULSUN Voy 204E',
    container_number: 'MSCU-482019-4',
    booking_cbm: 68.5,
    port_of_loading: 'Nhava Sheva (INNSA)',
    port_of_discharge: 'Rotterdam (NLRTM)',
    etd_date: '2026-10-02',
    eta_date: '2026-10-26',
    bl_number: 'MSCUIN8829018',
    status: 'CONTAINER_STUFFED',
    created_at: '2026-09-01'
  },
  {
    id: 'shp-802',
    shipment_ref: 'SHP-80115',
    order_id: 'ord-5519',
    po_number: 'PO-MAN-5519',
    forwarder_name: 'DB Schenker Global',
    carrier_vessel: 'MAERSK MC-KINNEY MOLLER Voy 119W',
    container_number: 'MRKU-992104-1',
    booking_cbm: 42.0,
    port_of_loading: 'Mundra (INMUN)',
    port_of_discharge: 'Valencia (ESVLC)',
    etd_date: '2026-09-08',
    eta_date: '2026-09-29',
    bl_number: 'MAEU982180421',
    status: 'SAILING',
    created_at: '2026-08-15'
  },
  {
    id: 'shp-803',
    shipment_ref: 'SHP-80144',
    order_id: 'ord-8901',
    po_number: 'PO-ZIG-8901',
    forwarder_name: 'DHL Global Forwarding',
    carrier_vessel: 'CMA CGM ANTOINE DE SAINT EXUPERY',
    container_number: 'CMAU-772183-9',
    booking_cbm: 72.0,
    port_of_loading: 'Nhava Sheva (INNSA)',
    port_of_discharge: 'New York (USNYC)',
    etd_date: '2026-10-20',
    eta_date: '2026-11-14',
    bl_number: 'CMAG8819201',
    status: 'BOOKED',
    created_at: '2026-09-05'
  }
]
