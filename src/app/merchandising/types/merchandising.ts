export type OrderStatus = 
  | 'BOOKED' 
  | 'IN_FABRIC' 
  | 'IN_PRODUCTION' 
  | 'PACKED' 
  | 'DISPATCHED' 
  | 'CLOSED'

export type TnaStatus = 
  | 'ON_SCHEDULE' 
  | 'DELAYED' 
  | 'COMPLETED' 
  | 'ESCALATED'

export type MaterialType = 
  | 'FABRIC' 
  | 'SEWING_THREAD' 
  | 'LABEL' 
  | 'ZIPPER' 
  | 'CARTON' 
  | 'POLYBAG'

export type SourcingFulfillmentStatus = 
  | 'PENDING' 
  | 'ORDERED' 
  | 'STORE_RECEIVED'

export type ShipmentStatus = 
  | 'BOOKED' 
  | 'CONTAINER_STUFFED' 
  | 'SAILING' 
  | 'CUSTOMS_CLEARED' 
  | 'DELIVERED'

export interface ColorSizeMatrixItem {
  color: string
  sizes: Record<string, number>
  total: number
}

export interface MerchandisingOrder {
  id: string
  po_number: string
  brand_name: string
  style_ref: string
  style_name: string
  tech_pack_id?: string
  total_quantity: number
  currency: 'INR' | 'USD' | 'EUR' | 'GBP'
  unit_fob_price: number
  total_contract_value: number
  ex_factory_date: string
  status: OrderStatus
  color_matrix: ColorSizeMatrixItem[]
  created_at: string
}

export interface BomCosting {
  id: string
  order_id: string
  po_number: string
  style_ref: string
  style_name: string
  fabric_cost: number
  trims_accessories_cost: number
  embellishment_cost: number
  cmt_sewing_rate: number
  washing_finishing_cost: number
  packaging_cost: number
  factory_overhead_percent: number
  net_fob_cost: number
  target_margin_percent: number
  actual_realized_cost: number
  variance_percent: number
}

export interface TnaMilestone {
  id: string
  order_id: string
  po_number: string
  style_ref: string
  milestone_name: string
  planned_date: string
  actual_date: string | null
  status: TnaStatus
  delay_reason: string | null
  mitigation_notes?: string
  sort_order: number
}

export interface SourcingRequisition {
  id: string
  pr_number: string
  order_id: string
  po_number: string
  material_name: string
  material_type: MaterialType
  required_quantity: number
  unit: string
  vendor_name: string
  required_in_store_date: string
  fulfillment_status: SourcingFulfillmentStatus
  created_at: string
}

export interface ExportShipment {
  id: string
  shipment_ref: string
  order_id: string
  po_number: string
  forwarder_name: string
  carrier_vessel: string
  container_number: string
  booking_cbm: number
  port_of_loading: string
  port_of_discharge: string
  etd_date: string
  eta_date: string
  bl_number?: string
  status: ShipmentStatus
  created_at: string
}
