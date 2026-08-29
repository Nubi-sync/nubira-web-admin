'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export type SizeMatrixRow = {
  size: string
  sets: number
  ratio: number
  pcs: number
}

export type ProductionOrderPayload = {
  id?: string
  delivery_date: string
  art_no: string
  sub_art_no?: string
  picture_url?: string
  mt_code: string
  fabric: string
  pattern_no: string
  description: string
  body_color: string
  pant_color?: string
  brand: string
  rib_status?: string
  notes?: string
  size_matrix: SizeMatrixRow[]
  status?: 'PENDING' | 'IN_PRODUCTION' | 'QC_PASSED' | 'DISPATCHED'
}

export async function getProductionOrders() {
  let supabase: any = supabaseAdmin
  try {
    const serverClient = await createClient()
    if (serverClient) supabase = serverClient
  } catch (_) {
    supabase = supabaseAdmin
  }

  // 1. Try fetching from dedicated production_orders table if present
  try {
    const { data: directOrders, error: directErr } = await supabase
      .from('production_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!directErr && directOrders && directOrders.length > 0) {
      return directOrders
    }
  } catch (_) {}

  // 2. Query from allotments and articles metadata
  try {
    const { data: allotments } = await supabase
      .from('allotments')
      .select(`
        id,
        target_qty,
        allotment_date,
        status,
        created_at,
        profiles ( username ),
        articles ( id, art_no, description, size_rates )
      `)
      .order('created_at', { ascending: false })

    const { data: materials } = await supabase
      .from('allotment_materials')
      .select('allotment_id, notes')

    const { data: variants } = await supabase
      .from('allotment_variants')
      .select('allotment_id, color, size, quantity, completed_qty')

    const orders: any[] = []

    if (allotments && allotments.length > 0) {
      for (const al of allotments) {
        let meta: any = {}
        const mat = materials?.find((m: any) => m.allotment_id === al.id)
        if (mat?.notes) {
          try { meta = JSON.parse(mat.notes) } catch (_) {}
        }

        const alVars = variants?.filter((v: any) => v.allotment_id === al.id) || []
        const artMeta = al.articles?.size_rates?._meta || {}

        orders.push({
          id: al.id,
          delivery_date: meta.due_date || al.allotment_date || new Date().toISOString().split('T')[0],
          art_no: al.articles?.art_no || meta.art_no || 'Style',
          sub_art_no: meta.sub_art_no || '',
          picture_url: meta.sample_photos?.[0] || artMeta.picture_url || '',
          mt_code: meta.production_order_no || artMeta.mt_code || 'MT-1001',
          fabric: meta.fabric || artMeta.fabric || 'Printed Sinker',
          pattern_no: meta.pattern_no || artMeta.pattern || 'G-342',
          description: al.articles?.description || meta.article_description || '',
          body_color: meta.body_color || alVars[0]?.color || 'Blue Printed',
          pant_color: meta.pant_color || alVars[1]?.color || 'Blue Printed',
          brand: meta.brand || artMeta.party || 'OLLYPOP',
          rib_status: meta.rib_status || 'PENDING',
          status: al.status || 'IN_PROGRESS',
          size_matrix: alVars.map((v: any) => ({
            size: v.size,
            sets: Math.round(v.quantity / 3) || v.quantity,
            ratio: 3,
            pcs: v.quantity
          })),
          total_sets: alVars.reduce((sum: number, v: any) => sum + (Math.round(v.quantity / 3) || v.quantity), 0) || Math.round(al.target_qty / 3),
          total_pcs: al.target_qty || alVars.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0),
          created_at: al.created_at
        })
      }
    }

    return orders
  } catch (err) {
    console.error('Error fetching production orders:', err)
    return []
  }
}

export async function createProductionOrder(payload: ProductionOrderPayload) {
  let supabase: any = supabaseAdmin
  try {
    const serverClient = await createClient()
    if (serverClient) supabase = serverClient
  } catch (_) {
    supabase = supabaseAdmin
  }

  const {
    delivery_date,
    art_no,
    sub_art_no,
    picture_url,
    mt_code,
    fabric,
    pattern_no,
    description,
    body_color,
    pant_color,
    brand,
    rib_status = 'PENDING',
    size_matrix = [],
    notes = ''
  } = payload

  if (!art_no || !mt_code) {
    return { error: 'Please provide an Article Number and Production/MT Lot Number.' }
  }

  const totalSets = size_matrix.reduce((acc, row) => acc + (Number(row.sets) || 0), 0)
  const totalPcs = size_matrix.reduce((acc, row) => acc + (Number(row.pcs) || 0), 0)

  // 1. Ensure Article exists or create it
  let articleId = ''
  try {
    const { data: existingArt } = await supabase
      .from('articles')
      .select('id, size_rates')
      .eq('art_no', art_no.trim().toUpperCase())
      .single()

    if (existingArt) {
      articleId = existingArt.id
      // Update article metadata with latest fabric/pattern/picture
      const updatedMeta = {
        ...(existingArt.size_rates?._meta || {}),
        picture_url: picture_url || existingArt.size_rates?._meta?.picture_url,
        fabric: fabric || existingArt.size_rates?._meta?.fabric,
        pattern: pattern_no || existingArt.size_rates?._meta?.pattern,
        party: brand || existingArt.size_rates?._meta?.party,
        mt_code: mt_code
      }
      await supabase.from('articles').update({
        size_rates: { ...(existingArt.size_rates || {}), _meta: updatedMeta }
      }).eq('id', existingArt.id)
    } else {
      // Create new article
      const { data: newArt } = await supabase.from('articles').insert({
        art_no: art_no.trim().toUpperCase(),
        description: description.trim(),
        stitching_rate: 20,
        is_active: true,
        size_rates: {
          _meta: {
            picture_url,
            fabric,
            pattern: pattern_no,
            party: brand,
            mt_code
          }
        }
      }).select('id').single()

      if (newArt) articleId = newArt.id
    }
  } catch (artErr) {
    console.warn('Article sync warning:', artErr)
  }

  // 2. Fetch or select first active lineman for default floor routing
  let defaultLinemanId = ''
  try {
    const { data: lm } = await supabase.from('profiles').select('id').eq('role', 'LINEMAN').eq('is_active', true).limit(1).single()
    if (lm) defaultLinemanId = lm.id
  } catch (_) {}

  // 3. Create Allotment container for floor synchronization
  if (defaultLinemanId && articleId) {
    try {
      const { data: allot, error: allotErr } = await supabase
        .from('allotments')
        .insert({
          lineman_id: defaultLinemanId,
          article_id: articleId,
          target_qty: totalPcs > 0 ? totalPcs : 300,
          status: 'IN_PROGRESS',
          allotment_date: delivery_date || new Date().toISOString().split('T')[0]
        })
        .select('id')
        .single()

      if (allot) {
        const allotmentId = allot.id

        // Insert variants from size matrix
        if (size_matrix.length > 0) {
          const variantsPayload = size_matrix.map(row => ({
            allotment_id: allotmentId,
            color: body_color || 'Standard',
            size: row.size || 'Free Size',
            quantity: Number(row.pcs) || 0,
            completed_qty: 0
          }))
          await supabase.from('allotment_variants').insert(variantsPayload)
        }

        // Insert structured material & order metadata
        const metadataNote = JSON.stringify({
          production_order_no: mt_code,
          due_date: delivery_date,
          art_no,
          sub_art_no: sub_art_no || '',
          fabric,
          pattern_no,
          body_color,
          pant_color: pant_color || body_color,
          brand,
          rib_status,
          total_sets: totalSets,
          total_pcs: totalPcs,
          sample_photos: picture_url ? [picture_url] : [],
          notes,
          status: 'IN_PROGRESS'
        })

        await supabase.from('allotment_materials').insert([
          {
            allotment_id: allotmentId,
            item_name: `Fabric: ${fabric} (Lot #${mt_code})`,
            required_qty: 'As per marker',
            admin_issued: true,
            admin_issued_at: new Date().toISOString(),
            lineman_received: false,
            notes: metadataNote
          },
          {
            allotment_id: allotmentId,
            item_name: `Pattern Cutout: ${pattern_no}`,
            required_qty: 'Master Pattern',
            admin_issued: true,
            admin_issued_at: new Date().toISOString(),
            lineman_received: false,
            notes: metadataNote
          },
          {
            allotment_id: allotmentId,
            item_name: `Brand Labels & Tags (${brand})`,
            required_qty: `${totalPcs} pcs`,
            admin_issued: false,
            lineman_received: false,
            notes: metadataNote
          }
        ])
      }
    } catch (allotErr) {
      console.error('Failed to create floor allotment for order:', allotErr)
    }
  }

  revalidatePath('/production-orders')
  revalidatePath('/allotments')
  revalidatePath('/articles')
  revalidatePath('/')
  return { success: true }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  let supabase: any = supabaseAdmin
  try {
    const serverClient = await createClient()
    if (serverClient) supabase = serverClient
  } catch (_) {
    supabase = supabaseAdmin
  }

  // 1. Update allotment status if mapped by allotment id
  await supabase.from('allotments').update({ status: newStatus }).eq('id', orderId)

  // 2. Sync to notes inside allotment_materials
  try {
    const { data: mats } = await supabase.from('allotment_materials').select('id, notes').eq('allotment_id', orderId)
    if (mats && mats.length > 0) {
      for (const m of mats) {
        let nObj: any = {}
        try { if (m.notes) nObj = JSON.parse(m.notes) } catch (_) {}
        nObj.status = newStatus
        await supabase.from('allotment_materials').update({ notes: JSON.stringify(nObj) }).eq('id', m.id)
      }
    }
  } catch (_) {}

  revalidatePath('/production-orders')
  revalidatePath('/allotments')
  revalidatePath('/')
  return { success: true }
}

export async function deleteProductionOrder(orderId: string) {
  let supabase: any = supabaseAdmin
  try {
    const serverClient = await createClient()
    if (serverClient) supabase = serverClient
  } catch (_) {
    supabase = supabaseAdmin
  }

  await supabase.from('allotment_variants').delete().eq('allotment_id', orderId)
  await supabase.from('allotment_materials').delete().eq('allotment_id', orderId)
  await supabase.from('worker_assignments').delete().eq('allotment_id', orderId)
  await supabase.from('floor_alerts').delete().eq('allotment_id', orderId)
  await supabase.from('allotments').delete().eq('id', orderId)

  revalidatePath('/production-orders')
  revalidatePath('/allotments')
  revalidatePath('/')
  return { success: true }
}
