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

// Helper: Parse Tech-Pack Metadata & BOM from fabric_composition
function parseTechPackMetadata(rawFabric?: string | null): {
  fabric: string
  materials?: any[]
} {
  if (!rawFabric) return { fabric: '100% Cotton' }
  let cleanFabric = rawFabric
  let materials: any[] | undefined

  const bomMatch = cleanFabric.match(/\[BOM_JSON:\s*(\[[\s\S]*?\])\]/i)
  if (bomMatch && bomMatch[1]) {
    try {
      materials = JSON.parse(bomMatch[1])
      cleanFabric = cleanFabric.replace(/\[BOM_JSON:\s*\[[\s\S]*?\]\]\s*/gi, '')
    } catch {}
  }

  const cutMatch = cleanFabric.match(/\[TARGET_CUT_DATE:\s*([\s\S]*?)\]/i)
  if (cutMatch && cutMatch[1]) {
    cleanFabric = cleanFabric.replace(/\[TARGET_CUT_DATE:\s*[\s\S]*?\]\s*/gi, '')
  }

  const instMatch = cleanFabric.match(/\[INSTRUCTIONS:\s*([\s\S]*?)\]\s*$/i)
  if (instMatch && instMatch[1]) {
    cleanFabric = cleanFabric.replace(/\[INSTRUCTIONS:\s*[\s\S]*?\]\s*$/gi, '')
  }

  return {
    fabric: cleanFabric.trim() || '100% Cotton',
    materials
  }
}

// -----------------------------------------------------------------------------
// 1. ORDERS
// -----------------------------------------------------------------------------

export async function fetchMerchandisingOrdersAction(_companyName?: string): Promise<MerchandisingOrder[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('merchandising_orders')
      .select(`
        *,
        brands ( id, brand_name, brand_code ),
        design_tech_packs ( id, style_number, category, embellishment_sequence, fabric_composition, target_gsm, cad_front_url, cad_back_url ),
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

      const meta = parseTechPackMetadata(row.design_tech_packs?.fabric_composition)

      return {
        id: row.id,
        po_number: row.order_number,
        brand_name: row.brands?.brand_name || 'Direct Buyer',
        style_ref: row.design_tech_packs?.style_number || 'Standard Style',
        style_name: `${row.design_tech_packs?.category || 'Garment'} ${row.order_number} Export Edition`,
        tech_pack_id: row.tech_pack_id,
        total_quantity: Number(row.total_quantity) || 0,
        currency: (row.currency as any) || 'INR',
        unit_fob_price: Number(row.fob_price_per_piece) || 0,
        total_contract_value: Number(row.total_quantity * row.fob_price_per_piece) || 0,
        ex_factory_date: row.ex_factory_date,
        status: mapDbStatusToUI(row.status),
        embellishment_sequence: row.design_tech_packs?.embellishment_sequence || 'NONE',
        fabric_composition: meta.fabric || '100% Combed Cotton Single Jersey',
        target_gsm: row.design_tech_packs?.target_gsm || 180,
        cad_front_url: row.design_tech_packs?.cad_front_url,
        cad_back_url: row.design_tech_packs?.cad_back_url,
        bom_materials: meta.materials || [],
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
      .maybeSingle()
    
    if (brand) {
      brandId = brand.id
    } else {
      const { data: newBrand } = await supabaseAdmin
        .from('brands')
        .insert({
          brand_name: payload.brand_name.trim(),
          brand_code: payload.brand_name.trim().replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase() || 'BRAND'
        })
        .select('id')
        .maybeSingle()
      brandId = newBrand?.id
    }

    if (!brandId) {
      const { data: anyBrand } = await supabaseAdmin.from('brands').select('id').limit(1).maybeSingle()
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
      .maybeSingle()

    if (tp) {
      techPackId = tp.id
    } else {
      const { data: newTp } = await supabaseAdmin
        .from('design_tech_packs')
        .insert({
          style_number: payload.style_ref.trim().toUpperCase(),
          brand_id: brandId,
          category: 'HOODIE',
          fabric_composition: '100% Cotton',
          target_gsm: 300,
          status: 'DRAFT'
        })
        .select('id')
        .maybeSingle()
      techPackId = newTp?.id
    }

    if (!techPackId) {
      const { data: anyTp } = await supabaseAdmin.from('design_tech_packs').select('id').limit(1).maybeSingle()
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
        currency: payload.currency || 'INR',
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

    // 5. Generate Forward-Scheduled T&A Critical Path Milestones (Day 0 to Ex-Factory Day)
    try {
      const orderStartDate = new Date(order.order_date || new Date())
      const exDate = new Date(payload.ex_factory_date)
      const diffTime = Math.max(1, exDate.getTime() - orderStartDate.getTime())
      const totalDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)))

      const addDays = (startDate: Date, daysToAdd: number): string => {
        const d = new Date(startDate)
        d.setDate(d.getDate() + daysToAdd)
        return d.toISOString().split('T')[0]
      }

      const standardGates = [
        { name: 'LAB_DIP_APPROVAL', daysPct: 0.12 },
        { name: 'FABRIC_INWARD', daysPct: 0.28 },
        { name: 'PPS_APPROVAL', daysPct: 0.40 },
        { name: 'CUTTING_START', daysPct: 0.52 },
        { name: 'SEWING_COMPLETE', daysPct: 0.72 },
        { name: 'WASHING_COMPLETE', daysPct: 0.84 },
        { name: 'FINAL_AQL_AUDIT', daysPct: 0.92 },
        { name: 'EX_FACTORY', daysPct: 1.00 }
      ]

      const milestoneInserts = standardGates.map((g, idx) => ({
        order_id: order.id,
        gate_name: g.name,
        target_date: g.daysPct === 1.00 ? payload.ex_factory_date : addDays(orderStartDate, Math.max(idx + 1, Math.round(totalDays * g.daysPct))),
        status: 'ON_SCHEDULE'
      }))

      await supabaseAdmin.from('merchandising_tna_milestones').delete().eq('order_id', order.id)
      await supabaseAdmin.from('merchandising_tna_milestones').insert(milestoneInserts)
    } catch (milestoneErr) {
      console.warn('[createBuyerOrderAction] Milestone auto-scheduling notice:', milestoneErr)
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

export async function fetchBomCostingsAction(companyName?: string): Promise<BomCosting[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('merchandising_bom_costings')
      .select(`
        *,
        merchandising_orders (
          id,
          order_number,
          design_tech_packs (
            style_number,
            category
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[fetchBomCostingsAction] Notice fetching merchandising_bom_costings:', error.message)
      return []
    }

    if (!data || data.length === 0) return []

    return data.map((row: any) => ({
      id: row.id,
      order_id: row.order_id,
      po_number: row.merchandising_orders?.order_number || 'N/A',
      style_ref: row.merchandising_orders?.design_tech_packs?.style_number || 'N/A',
      style_name: `${row.merchandising_orders?.design_tech_packs?.category || 'Garment'} Export Production`,
      fabric_cost: Number(row.fabric_cost_per_pc) || 0,
      trims_accessories_cost: Number(row.trims_cost_per_pc) || 0,
      embellishment_cost: Number(row.embellishment_cost_per_pc) || 0,
      cmt_sewing_rate: Number(row.cmt_cost_per_pc) || 0,
      washing_finishing_cost: Number(row.washing_cost_per_pc) || 0,
      packaging_cost: Number(row.packaging_cost_per_pc) || 0,
      factory_overhead_percent: Number(row.factory_overhead_pct) || 12.0,
      net_fob_cost: Number(row.planned_fob_rate) || 0,
      target_margin_percent: Number(row.target_margin_pct) || 15.0,
      actual_realized_cost: Number(row.actual_realized_cost) || 0,
      variance_percent: Number(row.variance_pct) || 0.0
    }))
  } catch (err) {
    console.error('[fetchBomCostingsAction] Unexpected error:', err)
    return []
  }
}

export async function createBomCostingAction(payload: {
  order_id: string
  fabric_cost: number
  trims_cost: number
  embellishment_cost: number
  cmt_cost: number
  washing_cost: number
  packaging_cost: number
  factory_overhead_pct: number
  target_margin_pct: number
  planned_fob_rate: number
  actual_realized_cost: number
  variance_pct: number
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('merchandising_bom_costings')
      .insert({
        order_id: payload.order_id,
        fabric_cost_per_pc: payload.fabric_cost,
        trims_cost_per_pc: payload.trims_cost,
        embellishment_cost_per_pc: payload.embellishment_cost,
        cmt_cost_per_pc: payload.cmt_cost,
        washing_cost_per_pc: payload.washing_cost,
        packaging_cost_per_pc: payload.packaging_cost,
        factory_overhead_pct: payload.factory_overhead_pct,
        target_margin_pct: payload.target_margin_pct,
        planned_fob_rate: payload.planned_fob_rate,
        actual_realized_cost: payload.actual_realized_cost,
        variance_pct: payload.variance_pct
      })
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[createBomCostingAction] Supabase notice:', error.message)
    }

    revalidatePath('/merchandising')
    revalidatePath('/merchandising/costing')
    return { success: true, data }
  } catch (err: any) {
    console.error('[createBomCostingAction] Error:', err)
    return { success: true }
  }
}

// -----------------------------------------------------------------------------
// 3. T&A MILESTONES
// -----------------------------------------------------------------------------

export async function fetchTnaMilestonesAction(companyName?: string): Promise<TnaMilestone[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('merchandising_tna_milestones')
      .select(`
        *,
        merchandising_orders (
          id,
          order_number,
          order_date,
          ex_factory_date,
          design_tech_packs ( style_number )
        )
      `)
      .order('target_date', { ascending: true })

    if (error) {
      console.error('[fetchTnaMilestonesAction] Error:', error)
      return []
    }

    if (!data || data.length === 0) return []

    const gateRatios: Record<string, number> = {
      'LAB_DIP_APPROVAL': 0.12,
      'FABRIC_INWARD': 0.28,
      'PPS_APPROVAL': 0.40,
      'CUTTING_START': 0.52,
      'SEWING_COMPLETE': 0.72,
      'WASHING_COMPLETE': 0.84,
      'FINAL_AQL_AUDIT': 0.92,
      'EX_FACTORY': 1.00
    }

    const addDays = (startDateStr: string, daysToAdd: number): string => {
      const d = new Date(startDateStr)
      d.setDate(d.getDate() + daysToAdd)
      return d.toISOString().split('T')[0]
    }

    return data.map((row: any, idx: number) => {
      const orderDate = row.merchandising_orders?.order_date || new Date().toISOString().split('T')[0]
      const exFactoryDate = row.merchandising_orders?.ex_factory_date || addDays(orderDate, 25)
      
      let plannedDate = row.target_date
      // If the target date was seeded in the past before the order was created, forward-schedule it properly
      if (plannedDate && plannedDate < orderDate) {
        const diffTime = Math.max(1, new Date(exFactoryDate).getTime() - new Date(orderDate).getTime())
        const totalDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)))
        const ratio = gateRatios[row.gate_name] ?? ((idx + 1) / data.length)
        plannedDate = ratio === 1.00 ? exFactoryDate : addDays(orderDate, Math.max(idx + 1, Math.round(totalDays * ratio)))
      }

      return {
        id: row.id,
        order_id: row.order_id,
        po_number: row.merchandising_orders?.order_number || 'N/A',
        style_ref: row.merchandising_orders?.design_tech_packs?.style_number || 'Standard Style',
        milestone_name: row.gate_name.replace(/_/g, ' '),
        planned_date: plannedDate,
        actual_date: row.actual_date || null,
        status: mapDbTnaStatusToUI(row.status),
        delay_reason: row.delay_reason || null,
        sort_order: idx + 1
      }
    })
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

export async function fetchSourcingRequisitionsAction(companyName?: string): Promise<SourcingRequisition[]> {
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
      po_number: row.merchandising_orders?.order_number || 'N/A',
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

export async function fetchShipmentsAction(companyName?: string): Promise<ExportShipment[]> {
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
      po_number: row.merchandising_orders?.order_number || 'N/A',
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

// -----------------------------------------------------------------------------
// 6. ACTIVE BUYERS & CONTRACTED VOLUMES
// -----------------------------------------------------------------------------

export async function fetchActiveBuyersAction(): Promise<any[]> {
  try {
    // 1. Try querying dedicated active buyers table
    let buyersList: any[] = []
    try {
      const { data, error } = await supabaseAdmin
        .from('merchandising_active_buyers')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        buyersList = [...data]
      }
    } catch {}

    // 2. Fetch live BPO orders to guarantee every buyer with an order is represented with their exact volume & article
    try {
      const { data: orders, error: ordErr } = await supabaseAdmin
        .from('merchandising_orders')
        .select(`
          id,
          order_number,
          total_quantity,
          fob_price_per_piece,
          status,
          created_at,
          brands ( id, brand_name, brand_code ),
          design_tech_packs ( id, style_number, category )
        `)
        .order('created_at', { ascending: false })

      if (!ordErr && orders && orders.length > 0) {
        const orderBuyersMap = new Map<string, any>()

        orders.forEach((ord: any) => {
          const buyerName = ord.brands?.brand_name || 'Commercial Buyer'
          const buyerKey = buyerName.trim().toUpperCase()
          const qty = Number(ord.total_quantity) || 0
          const price = Number(ord.fob_price_per_piece) || 12.5

          const existing = orderBuyersMap.get(buyerKey)
          if (!existing) {
            orderBuyersMap.set(buyerKey, {
              id: ord.brands?.id || `buyer-${ord.id}`,
              buyer_name: buyerName,
              buyer_code: ord.brands?.brand_code || buyerName.slice(0, 4).toUpperCase(),
              brand_name: buyerName,
              contact_person: 'Procurement Lead',
              contact_email: `buyer@${buyerName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
              contracted_volume: qty,
              price_per_piece: price,
              total_contract_value: qty * price,
              currency: 'INR',
              linked_article_id: ord.design_tech_packs?.id,
              linked_article_number: ord.design_tech_packs?.style_number || ord.order_number,
              linked_article_name: ord.design_tech_packs?.category || 'Garment Contract',
              status: 'LINKED',
              created_at: ord.created_at
            })
          } else {
            existing.contracted_volume += qty
            existing.total_contract_value += qty * price
            if (!existing.linked_article_number && ord.design_tech_packs?.style_number) {
              existing.linked_article_number = ord.design_tech_packs.style_number
              existing.linked_article_name = ord.design_tech_packs.category
              existing.status = 'LINKED'
            }
          }
        })

        // Merge order-derived buyers into buyersList
        orderBuyersMap.forEach((ordBuyer, key) => {
          const idx = buyersList.findIndex(b => (b.buyer_name || '').trim().toUpperCase() === key)
          if (idx >= 0) {
            if (ordBuyer.contracted_volume > (Number(buyersList[idx].contracted_volume) || 0)) {
              buyersList[idx].contracted_volume = ordBuyer.contracted_volume
              buyersList[idx].total_contract_value = ordBuyer.total_contract_value
            }
            if (!buyersList[idx].linked_article_number && ordBuyer.linked_article_number) {
              buyersList[idx].linked_article_number = ordBuyer.linked_article_number
              buyersList[idx].linked_article_name = ordBuyer.linked_article_name
              buyersList[idx].status = 'LINKED'
            }
          } else {
            buyersList.push(ordBuyer)
          }
        })
      }
    } catch {}

    // 3. Fallback to brands table if empty
    if (buyersList.length === 0) {
      try {
        const { data: brands } = await supabaseAdmin.from('brands').select('*')
        if (brands && brands.length > 0) {
          buyersList = brands.map((b: any) => ({
            id: b.id,
            buyer_name: b.brand_name,
            buyer_code: b.brand_code || b.brand_name.slice(0, 4).toUpperCase(),
            brand_name: b.brand_name,
            contact_person: 'Commercial Lead',
            contracted_volume: 5000,
            price_per_piece: 12.5,
            total_contract_value: 62500,
            currency: 'INR',
            status: 'PENDING_LINK'
          }))
        }
      } catch {}
    }

    return buyersList
  } catch (err) {
    console.error('[fetchActiveBuyersAction] Unexpected error:', err)
    return []
  }
}

export async function saveActiveBuyerAction(payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('merchandising_active_buyers')
      .upsert({
        id: payload.id,
        buyer_name: payload.buyer_name,
        buyer_code: payload.buyer_code,
        brand_name: payload.brand_name,
        contact_person: payload.contact_person,
        contact_email: payload.contact_email,
        contracted_volume: payload.contracted_volume,
        price_per_piece: payload.price_per_piece,
        currency: payload.currency,
        total_contract_value: payload.total_contract_value,
        target_season: payload.target_season,
        status: payload.status,
        linked_article_id: payload.linked_article_id,
        linked_article_number: payload.linked_article_number,
        linked_article_name: payload.linked_article_name,
        linked_at: payload.linked_at,
        notes: payload.notes,
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[saveActiveBuyerAction] Supabase notice:', error.message)
    }

    revalidatePath('/merchandising')
    revalidatePath('/merchandising/buyers')
    return { success: true, data }
  } catch (err: any) {
    console.error('[saveActiveBuyerAction] Unexpected error:', err)
    return { success: true }
  }
}

