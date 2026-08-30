'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export type ChallanArticleLine = {
  id?: string
  art_no: string
  sub_art_no?: string
  pattern_no?: string
  description?: string
  color_pattern: string
  size_range: string
  sets: number
  pcs_per_set: number
  total_pcs: number
  assigned_lineman_id?: string
  assigned_lineman_name?: string
  picture_url?: string
  stitching_rate?: number
  allotment_id?: string
  status?: string
}

export type ChallanBomItem = {
  id?: string
  material_type: string // 'FABRIC' | 'RIB' | 'BUTTON' | 'LABEL' | 'ACCESSORY'
  item_name: string     // 'Body + Rib', 'Mushroom', 'Dutch Blue', 'Scuba', 'First Smile', 'Ollypop'
  lot_no?: string       // 'NIP', 'T-03', 'T-03'
  required_qty?: string // '27 rolls', '4000 pcs'
  status?: 'PENDING' | 'RECEIVED' | 'VERIFIED'
}

export type CreateChallanPayload = {
  id?: string
  challan_no: string
  challan_date: string
  brand: string
  delivery_date?: string
  fabric_type?: string
  sample_given?: boolean
  notes?: string
  receiver_name?: string
  article_lines: ChallanArticleLine[]
  bom_items?: ChallanBomItem[]
  status?: 'PENDING' | 'IN_PRODUCTION' | 'QC_PASSED' | 'DISPATCHED'
}

export type ChallanGroupedOrder = {
  id: string // challan_id
  challan_no: string
  challan_date: string
  brand: string
  delivery_date: string
  fabric_type: string
  sample_given: boolean
  notes: string
  total_sets: number
  total_pcs: number
  status: string
  bom_details: ChallanBomItem[]
  articles: Array<ChallanArticleLine & {
    allotment_id: string
    status: string
    lineman_name?: string
    completed_qty?: number
    created_at?: string
  }>
  created_at: string
}

// ----------------------------------------------------------------------
// GET PRODUCTION ORDERS / CHALLANS (Hierarchical & Grouped)
// ----------------------------------------------------------------------
export async function getProductionOrders(): Promise<ChallanGroupedOrder[]> {
  const supabase = supabaseAdmin

  try {
    // 1. Fetch all challans
    const { data: challansList, error: chErr } = await supabase
      .from('challans')
      .select('*')
      .order('created_at', { ascending: false })

    // 2. Fetch all allotments with joined data
    const { data: allotments, error: alErr } = await supabase
      .from('allotments')
      .select(`
        id,
        challan_id,
        target_qty,
        allotment_date,
        status,
        created_at,
        lineman_id,
        profiles:lineman_id ( id, username ),
        articles ( id, art_no, description, size_rates, stitching_rate )
      `)
      .order('created_at', { ascending: true })

    // 3. Fetch materials & variants for metadata extraction
    const { data: materials } = await supabase
      .from('allotment_materials')
      .select('allotment_id, notes, item_name, required_qty')

    const { data: variants } = await supabase
      .from('allotment_variants')
      .select('allotment_id, color, size, quantity, completed_qty')

    const challanGroups: ChallanGroupedOrder[] = []

    // Map of challan_id -> Article Lines
    const challanArticlesMap: Record<string, any[]> = {}

    // Group allotments into their respective challan or legacy bucket
    if (allotments && allotments.length > 0) {
      for (const rawAl of allotments) {
        const al = rawAl as any
        let meta: any = {}
        const mat = materials?.find((m: any) => m.allotment_id === al.id)
        if (mat?.notes) {
          try { meta = JSON.parse(mat.notes) } catch (_) {}
        }

        const alVars = variants?.filter((v: any) => v.allotment_id === al.id) || []
        const artObj = (Array.isArray(al.articles) ? al.articles[0] : al.articles) || {}
        const artMeta = artObj?.size_rates?._meta || {}

        const firstVar = alVars[0]
        const colorPattern = meta.color_pattern || firstVar?.color || meta.body_color || 'Standard'
        const sizeRange = meta.size_range || firstVar?.size || 'Free Size'
        const totalPcs = al.target_qty || alVars.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)
        const pcsPerSet = meta.pcs_per_set || (alVars[0] ? Math.round(totalPcs / (meta.sets || 1)) : 9) || 9
        const sets = meta.sets || Math.round(totalPcs / pcsPerSet) || 1
        const completedQty = alVars.reduce((sum: number, v: any) => sum + (v.completed_qty || 0), 0)

        const linemanObj = (Array.isArray(al.profiles) ? al.profiles[0] : al.profiles) || {}
        const linemanName = linemanObj?.full_name || linemanObj?.username || 'Unassigned'

        const articleItem = {
          id: al.id,
          allotment_id: al.id,
          art_no: artObj?.art_no || meta.art_no || 'Style',
          sub_art_no: meta.sub_art_no || '',
          pattern_no: meta.pattern_no || artMeta.pattern || '',
          description: artObj?.description || meta.article_description || '',
          color_pattern: colorPattern,
          size_range: sizeRange,
          sets: sets,
          pcs_per_set: pcsPerSet,
          total_pcs: totalPcs,
          completed_qty: completedQty,
          assigned_lineman_id: al.lineman_id || '',
          assigned_lineman_name: linemanName,
          picture_url: meta.sample_photos?.[0] || artMeta.picture_url || '',
          stitching_rate: artObj?.stitching_rate || 20,
          status: al.status || 'IN_PROGRESS',
          created_at: al.created_at
        }

        const chId = al.challan_id || 'LEGACY_UNASSIGNED'
        if (!challanArticlesMap[chId]) challanArticlesMap[chId] = []
        challanArticlesMap[chId].push(articleItem)
      }
    }

    // 4. Construct Challan Group records
    if (challansList && challansList.length > 0) {
      for (const ch of challansList) {
        const articles = challanArticlesMap[ch.id] || []
        const totalSets = articles.reduce((sum, a) => sum + (Number(a.sets) || 0), 0) || ch.total_sets || 0
        const totalPcs = articles.reduce((sum, a) => sum + (Number(a.total_pcs) || 0), 0) || ch.total_pcs || 0

        let bomItems: ChallanBomItem[] = []
        if (ch.bom_details) {
          try {
            bomItems = Array.isArray(ch.bom_details) ? ch.bom_details : JSON.parse(ch.bom_details)
          } catch (_) {}
        }

        challanGroups.push({
          id: ch.id,
          challan_no: ch.challan_no || 'CHALLAN',
          challan_date: ch.challan_date || new Date(ch.created_at).toISOString().split('T')[0],
          brand: ch.brand || 'OLLYPOP',
          delivery_date: ch.delivery_date || '',
          fabric_type: ch.fabric_type || 'PRINTED SINKER',
          sample_given: !!ch.sample_given,
          notes: ch.notes || '',
          total_sets: totalSets,
          total_pcs: totalPcs,
          status: ch.status || 'IN_PROGRESS',
          bom_details: bomItems,
          articles: articles,
          created_at: ch.created_at
        })
      }
    }

    // 5. If there are legacy allotments without challan_id, add a clean container
    if (challanArticlesMap['LEGACY_UNASSIGNED'] && challanArticlesMap['LEGACY_UNASSIGNED'].length > 0) {
      const legArticles = challanArticlesMap['LEGACY_UNASSIGNED']
      const legSets = legArticles.reduce((sum, a) => sum + (Number(a.sets) || 0), 0)
      const legPcs = legArticles.reduce((sum, a) => sum + (Number(a.total_pcs) || 0), 0)

      challanGroups.push({
        id: 'LEGACY_UNASSIGNED',
        challan_no: 'DIRECT-FLOOR-LOTS',
        challan_date: legArticles[0]?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        brand: 'INTERNAL / DIRECT',
        delivery_date: '',
        fabric_type: 'Assorted',
        sample_given: false,
        notes: 'Legacy allotments created before multi-article challan system',
        total_sets: legSets,
        total_pcs: legPcs,
        status: 'IN_PROGRESS',
        bom_details: [],
        articles: legArticles,
        created_at: legArticles[0]?.created_at || new Date().toISOString()
      })
    }

    return challanGroups
  } catch (err) {
    console.error('Error fetching production orders:', err)
    return []
  }
}

// ----------------------------------------------------------------------
// CREATE MULTI-ARTICLE CHALLAN (Saves Header + All Articles + Allotments)
// ----------------------------------------------------------------------
export async function createChallan(payload: CreateChallanPayload) {
  const supabase = supabaseAdmin

  const {
    challan_no,
    challan_date,
    brand,
    delivery_date,
    fabric_type = 'PRINTED SINKER',
    sample_given = false,
    notes = '',
    article_lines = [],
    bom_items = []
  } = payload

  if (!challan_no || !challan_no.trim()) {
    return { error: 'Please enter a Challan / Job Number (e.g. JOB-457).' }
  }

  if (!article_lines || article_lines.length === 0) {
    return { error: 'Please add at least one article line to the delivery challan.' }
  }

  const grandTotalSets = article_lines.reduce((acc, row) => acc + (Number(row.sets) || 0), 0)
  const grandTotalPcs = article_lines.reduce((acc, row) => acc + (Number(row.total_pcs) || 0), 0)

  // 1. Fetch default admin owner ID as fallback for unassigned allotments
  let defaultAdminOwnerId = ''
  const { data: { user } } = await supabase.auth.getUser()
  if (user) defaultAdminOwnerId = user.id
  try {
    const { data: adm } = await supabase.from('profiles').select('id').eq('role', 'ADMIN').limit(1).single()
    if (adm) defaultAdminOwnerId = adm.id
  } catch (_) {}

  try {
    // 2. Insert into `challans` table
    const { data: newChallan, error: challanInsertErr } = await supabase
      .from('challans')
      .insert({
        challan_no: challan_no.trim().toUpperCase(),
        challan_date: challan_date || new Date().toISOString().split('T')[0],
        brand: brand.trim().toUpperCase(),
        delivery_date: delivery_date || null,
        fabric_type: fabric_type.trim(),
        sample_given: !!sample_given,
        notes: notes.trim(),
        total_sets: grandTotalSets,
        total_pcs: grandTotalPcs,
        status: 'IN_PROGRESS',
        bom_details: bom_items
      })
      .select('id')
      .single()

    if (challanInsertErr || !newChallan) {
      console.error('Failed to create challan header:', challanInsertErr)
      return { error: `Failed to create Challan: ${challanInsertErr?.message || 'Unknown database error'}` }
    }

    const challanId = newChallan.id

    // 3. Process each Article Line
    for (let idx = 0; idx < article_lines.length; idx++) {
      const line = article_lines[idx]
      const cleanArtNo = line.art_no.trim().toUpperCase()
      const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
      const fullArtCode = cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo
      const linePcs = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))
      const lineSets = Number(line.sets) || Math.round(linePcs / (Number(line.pcs_per_set) || 9))
      const lineRatio = Number(line.pcs_per_set) || 9

      // Find or create article in `articles` table by fullArtCode
      let articleId = ''
      const { data: existingArt } = await supabase
        .from('articles')
        .select('id, size_rates')
        .eq('art_no', fullArtCode)
        .limit(1)
        .single()

      if (existingArt) {
        articleId = existingArt.id
      } else {
        const { data: createdArt } = await supabase
          .from('articles')
          .insert({
            art_no: fullArtCode,
            description: line.description || `${fullArtCode} - ${line.color_pattern || ''} (${line.size_range || ''})`.trim(),
            stitching_rate: line.stitching_rate || 20,
            is_active: true,
            size_rates: {
              _meta: {
                base_art: cleanArtNo,
                sub_art: cleanSubArt,
                pattern: line.pattern_no || '',
                fabric: fabric_type,
                party: brand,
                size: line.size_range,
                picture_url: line.picture_url || ''
              }
            }
          })
          .select('id')
          .single()

        if (createdArt) articleId = createdArt.id
      }

      // Determine Lineman for this article
      const assignedLineman = line.assigned_lineman_id || defaultAdminOwnerId

      // Insert Allotment container linked to this challan
      if (articleId && assignedLineman) {
        const { data: allot, error: allotErr } = await supabase
          .from('allotments')
          .insert({
            challan_id: challanId,
            lineman_id: assignedLineman,
            article_id: articleId,
            target_qty: linePcs,
            status: 'IN_PROGRESS',
            allotment_date: challan_date || new Date().toISOString().split('T')[0]
          })
          .select('id')
          .single()

        if (allot) {
          const allotmentId = allot.id

          // Insert variant
          await supabase.from('allotment_variants').insert({
            allotment_id: allotmentId,
            color: line.color_pattern || 'Standard',
            size: line.size_range || 'Free Size',
            quantity: linePcs,
            completed_qty: 0
          })

          // Structured metadata for fast floor consumption
          const metadataNote = JSON.stringify({
            challan_id: challanId,
            challan_no: challan_no.trim().toUpperCase(),
            art_no: cleanArtNo,
            sub_art_no: cleanSubArt,
            pattern_no: line.pattern_no || '',
            article_description: line.description || '',
            color_pattern: line.color_pattern || 'Standard',
            size_range: line.size_range || 'Free Size',
            sets: lineSets,
            pcs_per_set: lineRatio,
            total_pcs: linePcs,
            brand: brand.trim().toUpperCase(),
            fabric: fabric_type,
            sample_photos: line.picture_url ? [line.picture_url] : [],
            bom_items: bom_items,
            notes: notes
          })

          // Insert Materials BOM Handover records for Store
          const materialRows: any[] = [
            {
              allotment_id: allotmentId,
              item_name: `Fabric: ${fabric_type} (Challan #${challan_no})`,
              required_qty: `${linePcs} pcs marker`,
              admin_issued: true,
              admin_issued_at: new Date().toISOString(),
              lineman_received: false,
              notes: metadataNote
            },
            {
              allotment_id: allotmentId,
              item_name: `Brand Labels & Tags (${brand})`,
              required_qty: `${linePcs} pcs`,
              admin_issued: false,
              lineman_received: false,
              notes: metadataNote
            }
          ]

          if (line.pattern_no) {
            materialRows.push({
              allotment_id: allotmentId,
              item_name: `Pattern Cutout: ${line.pattern_no}`,
              required_qty: 'Master Pattern',
              admin_issued: true,
              admin_issued_at: new Date().toISOString(),
              lineman_received: false,
              notes: metadataNote
            })
          }

          // Add specific lot records from BOM if available
          if (bom_items && bom_items.length > 0) {
            bom_items.forEach(bom => {
              if (bom.item_name) {
                materialRows.push({
                  allotment_id: allotmentId,
                  item_name: `${bom.material_type || 'Material'}: ${bom.item_name} ${bom.lot_no ? `(Lot #${bom.lot_no})` : ''}`.trim(),
                  required_qty: bom.required_qty || 'As per lot',
                  admin_issued: bom.status === 'RECEIVED',
                  admin_issued_at: bom.status === 'RECEIVED' ? new Date().toISOString() : null,
                  lineman_received: false,
                  notes: metadataNote
                })
              }
            })
          }

          await supabase.from('allotment_materials').insert(materialRows)
        }
      }
    }

    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    revalidatePath('/articles')
    revalidatePath('/')
    return { success: true, challan_id: challanId }
  } catch (err: any) {
    console.error('Error creating challan:', err)
    return { error: err?.message || 'Server error creating challan.' }
  }
}

// ----------------------------------------------------------------------
// UPDATE STATUS (Challan or Article Line level)
// ----------------------------------------------------------------------
export async function updateOrderStatus(orderOrChallanId: string, newStatus: string, isChallanLevel: boolean = false) {
  const supabase = supabaseAdmin

  if (isChallanLevel) {
    // 1. Update challan status
    await supabase.from('challans').update({ status: newStatus }).eq('id', orderOrChallanId)
    // 2. Update all child allotments
    await supabase.from('allotments').update({ status: newStatus }).eq('challan_id', orderOrChallanId)
  } else {
    // Single allotment update
    await supabase.from('allotments').update({ status: newStatus }).eq('id', orderOrChallanId)
  }

  revalidatePath('/production-orders')
  revalidatePath('/allotments')
  revalidatePath('/')
  return { success: true }
}

// ----------------------------------------------------------------------
// ASSIGN LINEMAN TO AN ARTICLE LINE
// ----------------------------------------------------------------------
export async function assignLinemanToArticle(allotmentId: string, linemanId: string) {
  const supabase = supabaseAdmin

  const { error } = await supabase
    .from('allotments')
    .update({ lineman_id: linemanId })
    .eq('id', allotmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/production-orders')
  revalidatePath('/allotments')
  return { success: true }
}

// ----------------------------------------------------------------------
// DELETE CHALLAN & ALL ASSOCIATED ALLOTMENTS
// ----------------------------------------------------------------------
export async function deleteProductionOrder(challanOrAllotmentId: string, isChallanLevel: boolean = false) {
  const supabase = supabaseAdmin

  if (isChallanLevel) {
    // Find all child allotments
    const { data: childAllots } = await supabase
      .from('allotments')
      .select('id')
      .eq('challan_id', challanOrAllotmentId)

    if (childAllots && childAllots.length > 0) {
      const ids = childAllots.map((a: any) => a.id)
      await supabase.from('allotment_variants').delete().in('allotment_id', ids)
      await supabase.from('allotment_materials').delete().in('allotment_id', ids)
      await supabase.from('worker_assignments').delete().in('allotment_id', ids)
      await supabase.from('floor_alerts').delete().in('allotment_id', ids)
      await supabase.from('allotments').delete().in('id', ids)
    }

    await supabase.from('challans').delete().eq('id', challanOrAllotmentId)
  } else {
    // Delete single allotment
    await supabase.from('allotment_variants').delete().eq('allotment_id', challanOrAllotmentId)
    await supabase.from('allotment_materials').delete().eq('allotment_id', challanOrAllotmentId)
    await supabase.from('worker_assignments').delete().eq('allotment_id', challanOrAllotmentId)
    await supabase.from('floor_alerts').delete().eq('allotment_id', challanOrAllotmentId)
    await supabase.from('allotments').delete().eq('id', challanOrAllotmentId)
  }

  revalidatePath('/production-orders')
  revalidatePath('/allotments')
  revalidatePath('/')
  return { success: true }
}
