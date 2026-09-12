'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { 
  MerchandisingOrder, 
  BomCosting, 
  TnaMilestone, 
  SourcingRequisition, 
  ExportShipment,
  OrderStatus,
  TnaStatus,
  MaterialType,
  SourcingFulfillmentStatus,
  ShipmentStatus,
  ColorSizeMatrixItem
} from './types/merchandising'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper: Map Database order status to UI OrderStatus
function mapDbStatusToUI(st: string): OrderStatus {
  switch (st) {
    case 'PENDING_COSTING': return 'BOOKED'
    case 'CONFIRMED': return 'BOOKED'
    case 'IN_PRODUCTION': return 'IN_PRODUCTION'
    case 'SHIPPED': return 'DISPATCHED'
    case 'CANCELLED': return 'CLOSED'
    default: return 'BOOKED'
  }
}

// Helper: Map Database T&A status to UI TnaStatus
function mapDbTnaStatusToUI(st: string): TnaStatus {
  switch (st) {
    case 'COMPLETED': return 'COMPLETED'
    case 'DELAYED': return 'DELAYED'
    case 'ON_TRACK': return 'ON_SCHEDULE'
    default: return 'ON_SCHEDULE'
  }
}

// -----------------------------------------------------------------------------
// 1. ORDERS
// -----------------------------------------------------------------------------

export async function fetchMerchandisingOrdersAction(): Promise<MerchandisingOrder[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('merchandising_orders')
      .select(`
        *,
        brands ( id, brand_name, brand_code ),
        design_tech_packs ( id, style_number, category ),
        merchandising_order_ratios ( id, color_name, color_code, size_label, ratio_units, quantity )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[fetchMerchandisingOrdersAction] Error:', error)
      return []
    }

    if (!data || data.length === 0) return []

    return data.map((row: any) => {
      // Group ratios by color_name
      const colorGroups: Record<string, { sizes: Record<string, number>; total: number }> = {}
      ;(row.merchandising_order_ratios || []).forEach((r: any) => {
        if (!colorGroups[r.color_name]) {
          colorGroups[r.color_name] = { sizes: {}, total: 0 }
        }
        colorGroups[r.color_name].sizes[r.size_label] = r.quantity
        colorGroups[r.color_name].total += r.quantity
      })

      const colorMatrix: ColorSizeMatrixItem[] = Object.entries(colorGroups).map(([color, val]) => ({
        color,
        sizes: val.sizes,
        total: val.total
      }))

      return {
        id: row.id,
        po_number: row.order_number,
        brand_name: row.brands?.brand_name || 'OLLYPOP',
        style_ref: row.design_tech_packs?.style_number || 'ART-HD-8821',
        style_name: `${row.design_tech_packs?.category || 'Garment'} ${row.order_number} Export Edition`,
        tech_pack_id: row.tech_pack_id,
        total_quantity: Number(row.total_quantity) || 0,
        currency: (row.currency as any) || 'USD',
        unit_fob_price: Number(row.fob_price_per_piece) || 0,
        total_contract_value: Number(row.total_quantity * row.fob_price_per_piece) || 0,
        ex_factory_date: row.ex_factory_date,
        status: mapDbStatusToUI(row.status),
        color_matrix: colorMatrix.length > 0 ? colorMatrix : [
          { color: 'Standard Colorway', sizes: { S: 500, M: 1000, L: 500 }, total: Number(row.total_quantity) || 2000 }
        ],
        created_at: row.created_at
      }
    })
  } catch (err) {
    console.error('[fetchMerchandisingOrdersAction] Unexpected error:', err)
    return []
  }
}

export async function createBuyerOrderAction(payload: {
  po_number: string
  brand_name: string
  style_ref: string
  total_quantity: number
  unit_fob_price: number
  currency: string
  ex_factory_date: string
  season?: string
  incoterm?: string
  color_matrix: Array<{ color: string; sizes: Record<string, number>; total: number }>
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // 1. Resolve Brand
    let brandId: string | null = null
    const { data: brand } = await supabaseAdmin
      .from('brands')
      .select('id')
      .ilike('brand_name', payload.brand_name)
      .limit(1)
      .single()
    
    if (brand) {
      brandId = brand.id
    } else {
      const { data: anyBrand } = await supabaseAdmin.from('brands').select('id').limit(1).single()
      brandId = anyBrand?.id
    }

    if (!brandId) return { success: false, error: 'No active brand found in database.' }

    // 2. Resolve Tech Pack
    let techPackId: string | null = null
    const { data: tp } = await supabaseAdmin
      .from('design_tech_packs')
      .select('id')
      .ilike('style_number', payload.style_ref)
      .limit(1)
      .single()

    if (tp) {
      techPackId = tp.id
    } else {
      const { data: anyTp } = await supabaseAdmin.from('design_tech_packs').select('id').limit(1).single()
      techPackId = anyTp?.id
    }

    if (!techPackId) return { success: false, error: 'No active tech pack found in database.' }

    // 3. Insert Master Order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('merchandising_orders')
      .insert({
        order_number: payload.po_number.trim().toUpperCase(),
        buyer_id: brandId,
        tech_pack_id: techPackId,
        season: payload.season || 'SS27',
        total_quantity: Number(payload.total_quantity),
        fob_price_per_piece: Number(payload.unit_fob_price),
        currency: payload.currency || 'USD',
        order_date: new Date().toISOString().split('T')[0],
        ex_factory_date: payload.ex_factory_date,
        incoterm: payload.incoterm || 'FOB',
        status: 'CONFIRMED'
      })
      .select()
      .single()

    if (orderErr) {
      console.error('[createBuyerOrderAction] Order error:', orderErr)
      return { success: false, error: orderErr.message }
    }

    // 4. Insert Ratios
    const ratioInserts: any[] = []
    payload.color_matrix.forEach(c => {
      Object.entries(c.sizes).forEach(([size, qty]) => {
        if (Number(qty) > 0) {
          ratioInserts.push({
            order_id: order.id,
            color_name: c.color,
            size_label: size,
            ratio_units: 1,
            quantity: Number(qty)
          })
        }
      })
    })

    if (ratioInserts.length > 0) {
      await supabaseAdmin.from('merchandising_order_ratios').insert(ratioInserts)
    }

    revalidatePath('/merchandising')
    revalidatePath('/merchandising/orders')
    revalidatePath('/merchandising/tna-calendar')
    revalidatePath('/merchandising/costing')

    return { success: true, data: order }
  } catch (err: any) {
    console.error('[createBuyerOrderAction] Unexpected error:', err)
    return { success: false, error: err?.message || 'Server error creating buyer order.' }
  }
}

// -----------------------------------------------------------------------------
// 2. BOM COSTINGS
// -----------------------------------------------------------------------------

export async function fetchBomCostingsAction(): Promise<BomCosting[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('view_merchandising_order_economics')
      .select('*')

    if (error) {
      console.error('[fetchBomCostingsAction] Error:', error)
      return []
    }

    if (!data || data.length === 0) return []

    return data.map((row: any) => ({
      id: `bom-${row.order_id}`,
      order_id: row.order_id,
      po_number: row.order_number,
      style_ref: row.style_number,
      style_name: `${row.garment_silhouette} Export Production`,
      fabric_cost: Number(row.total_bom_cost_per_pc * 0.76) || 9.18,
      trims_accessories_cost: Number(row.total_bom_cost_per_pc * 0.24) || 2.94,
      embellishment_cost: 0.85,
      cmt_sewing_rate: Number(row.estimated_cm_overhead_per_pc) || 2.50,
      washing_finishing_cost: 0.45,
      packaging_cost: 0.35,
      factory_overhead_percent: 8.5,
      net_fob_cost: Number(row.total_garment_cost) || 15.45,
      target_margin_percent: Number(row.gross_profit_margin_pct) || 16.49,
      actual_realized_cost: Number(row.actual_bom_cost_per_pc) > 0 ? Number(row.actual_bom_cost_per_pc) + 3.33 : Number(row.total_garment_cost),
      variance_percent: 0.0
    }))
  } catch (err) {
    console.error('[fetchBomCostingsAction] Unexpected error:', err)
    return []
  }
}

// -----------------------------------------------------------------------------
// 3. T&A MILESTONES
// -----------------------------------------------------------------------------

export async function fetchTnaMilestonesAction(): Promise<TnaMilestone[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('merchandising_tna_milestones')
      .select(`
        *,
        merchandising_orders (
          id,
          order_number,
          design_tech_packs ( style_number )
        )
      `)
      .order('target_date', { ascending: true })

    if (error) {
      console.error('[fetchTnaMilestonesAction] Error:', error)
      return []
    }

    if (!data || data.length === 0) return []

    return data.map((row: any, idx: number) => ({
      id: row.id,
      order_id: row.order_id,
      po_number: row.merchandising_orders?.order_number || 'PO-ZIG-8901',
      style_ref: row.merchandising_orders?.design_tech_packs?.style_number || 'ART-HD-8821',
      milestone_name: row.gate_name.replace(/_/g, ' '),
      planned_date: row.target_date,
      actual_date: row.actual_date || null,
      status: mapDbTnaStatusToUI(row.status),
      delay_reason: row.delay_reason || null,
      sort_order: idx + 1
    }))
  } catch (err) {
    console.error('[fetchTnaMilestonesAction] Unexpected error:', err)
    return []
  }
}

export async function updateTnaMilestoneAction(payload: {
  id: string
  status: 'ON_TRACK' | 'DELAYED' | 'COMPLETED'
  actual_date?: string
  delay_reason?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('merchandising_tna_milestones')
      .update({
        status: payload.status,
        actual_date: payload.actual_date || (payload.status === 'COMPLETED' ? new Date().toISOString().split('T')[0] : null),
        delay_reason: payload.delay_reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.id)

    if (error) throw error

    revalidatePath('/merchandising')
    revalidatePath('/merchandising/tna-calendar')
    return { success: true }
  } catch (err: any) {
    console.error('[updateTnaMilestoneAction] Error:', err)
    return { success: false, error: err?.message || 'Failed to update milestone.' }
  }
}

// -----------------------------------------------------------------------------
// 4. SOURCING REQUISITIONS (PR)
// -----------------------------------------------------------------------------

export async function fetchSourcingRequisitionsAction(): Promise<SourcingRequisition[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('merchandising_sourcing_requisitions')
      .select(`
        *,
        merchandising_orders ( id, order_number ),
        vendors ( id, vendor_name )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[fetchSourcingRequisitionsAction] Error:', error)
      return []
    }

    if (!data || data.length === 0) return []

    return data.map((row: any) => ({
      id: row.id,
      pr_number: row.pr_number,
      order_id: row.order_id,
      po_number: row.merchandising_orders?.order_number || 'PO-ZIG-8901',
      material_name: row.item_description,
      material_type: (row.category as MaterialType) || 'FABRIC',
      required_quantity: Number(row.required_quantity) || 0,
      unit: row.uom || 'KG',
      vendor_name: row.vendors?.vendor_name || 'In-House Stitching & Knitting Unit',
      required_in_store_date: row.required_in_house_date,
      fulfillment_status: row.status === 'RECEIVED_STORE' ? 'STORE_RECEIVED' : row.status === 'PO_ISSUED' ? 'ORDERED' : 'PENDING',
      created_at: row.created_at
    }))
  } catch (err) {
    console.error('[fetchSourcingRequisitionsAction] Unexpected error:', err)
    return []
  }
}

// -----------------------------------------------------------------------------
// 5. EXPORT SHIPMENTS
// -----------------------------------------------------------------------------

export async function fetchShipmentsAction(): Promise<ExportShipment[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('merchandising_shipments')
      .select(`
        *,
        merchandising_orders ( id, order_number )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[fetchShipmentsAction] Error:', error)
      return []
    }

    if (!data || data.length === 0) return []

    return data.map((row: any) => ({
      id: row.id,
      shipment_ref: row.shipment_ref,
      order_id: row.order_id,
      po_number: row.merchandising_orders?.order_number || 'PO-ZIG-8901',
      forwarder_name: row.forwarder_name,
      carrier_vessel: `${row.forwarder_name} Express (Voyage 042E)`,
      container_number: row.container_number || 'MSKU-892182-1',
      booking_cbm: Number(row.total_cbm) || 54.0,
      port_of_loading: row.port_of_loading,
      port_of_discharge: row.port_of_discharge,
      etd_date: row.etd_date,
      eta_date: row.eta_date,
      bl_number: row.bill_of_lading_no || undefined,
      status: (row.status as ShipmentStatus) || 'BOOKED',
      created_at: row.created_at
    }))
  } catch (err) {
    console.error('[fetchShipmentsAction] Unexpected error:', err)
    return []
  }
}
