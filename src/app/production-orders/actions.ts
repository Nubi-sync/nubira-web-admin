'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

/**
 * Strictly sanitizes a date string to ensure it is a valid PostgreSQL DATE (YYYY-MM-DD) between years 1990 and 2099.
 * Returns null if invalid or absent.
 */
function sanitizeDate(dateStr?: string | null): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const trimmed = dateStr.trim()
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const y = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const d = parseInt(match[3], 10)
  if (y >= 1990 && y <= 2099 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return null
}

/**
 * Normalizes article number to its core base style (e.g. '5295A' -> '5295', '5214 A' -> '5214', '6064A' -> '6064', '2925 A' -> '2925').
 * In garment manufacturing cutting sheets, size batches are often split with 'A' suffixes, but represent the single unified article style.
 */
function extractBaseArtNo(artNo?: string, subArtNo?: string): string {
  if (!artNo) return ''
  const trimmed = String(artNo).trim().toUpperCase()
  const match = trimmed.match(/^(\d+)[-_/\s]*([A-Z])$/i)
  if (match) {
    return match[1]
  }
  return trimmed
}

export type ChallanArticleLine = {
  id?: string
  art_no: string
  sub_art_no?: string
  pattern_no?: string
  category?: string
  product?: string
  description?: string
  color_pattern: string
  size_range: string
  order_qty?: number | string
  sets?: number | string
  pcs_per_set?: number | string
  total_pcs: number | string
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
    // 1. Fetch all challans, allotments, materials & variants concurrently in parallel
    const [
      { data: challansList, error: chErr },
      { data: allotments, error: alErr },
      { data: materials },
      { data: variants }
    ] = await Promise.all([
      supabase
        .from('challans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),

      supabase
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
        .order('created_at', { ascending: true }),

      supabase
        .from('allotment_materials')
        .select('allotment_id, notes, item_name, required_qty'),

      supabase
        .from('allotment_variants')
        .select('allotment_id, color, size, quantity, completed_qty')
    ])

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

        // Real-time automatic line status determination
        let autoLineStatus = 'PENDING'
        if (al.status === 'DISPATCHED') {
          autoLineStatus = 'DISPATCHED'
        } else if (al.status === 'QC_PASSED' || (completedQty >= totalPcs && totalPcs > 0)) {
          autoLineStatus = 'QC_PASSED'
        } else if (al.lineman_id && al.lineman_id !== '') {
          autoLineStatus = 'IN_PROGRESS'
        } else {
          autoLineStatus = 'PENDING'
        }

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
          status: autoLineStatus,
          created_at: al.created_at
        }

        let chId = al.challan_id
        if (!chId && challansList) {
          const clientChNo = al.client_challan_no || meta.client_challan_no || al.production_order_no
          if (clientChNo) {
            const matchedCh = challansList.find(c => (c.challan_no || '').trim().toUpperCase() === String(clientChNo).trim().toUpperCase())
            if (matchedCh) chId = matchedCh.id
          }
        }
        if (!chId) chId = 'LEGACY_UNASSIGNED'
        if (!challanArticlesMap[chId]) challanArticlesMap[chId] = []
        challanArticlesMap[chId].push(articleItem)
      }
    }

    // 4. Construct Challan Group records
    if (challansList && challansList.length > 0) {
      for (const ch of challansList) {
        let articles: any[] = []
        const chAllotments = (allotments || []).filter((a: any) => a.challan_id === ch.id)

        // 1. If structured article lines exist in challan notes, map them to live floor allotment status
        if (ch.notes) {
          try {
            const parsedNotes = JSON.parse(ch.notes)
            const rawLines = parsedNotes.article_lines || parsedNotes
            if (Array.isArray(rawLines) && rawLines.length > 0) {
              rawLines.forEach((line: any, idx: number) => {
                const cleanArtNo = (line.art_no || '').trim().toUpperCase()
                const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
                const fullArtCode = line.full_art_code || (cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo)
                const baseArtNo = extractBaseArtNo(cleanArtNo, cleanSubArt)
                const colorPattern = (line.color_pattern || 'Standard').trim()
                const sizeRange = (line.size_range || 'Free Size').trim()

                const linePcs = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))
                const lineSets = Number(line.sets) || Math.round(linePcs / (Number(line.pcs_per_set) || 9))
                const lineRatio = Number(line.pcs_per_set) || 9

                // Match with active floor allotment for this base article style and color
                const matchingAl = chAllotments.find((al: any) => {
                  const art = (Array.isArray(al.articles) ? al.articles[0] : al.articles) || {}
                  const alArtNo = (art.art_no || '').trim().toUpperCase()
                  const isArtMatch = alArtNo === baseArtNo || alArtNo === cleanArtNo || alArtNo === fullArtCode
                  if (!isArtMatch) return false

                  // Check variant color match if variants exist
                  const alVars = variants?.filter((v: any) => v.allotment_id === al.id) || []
                  if (alVars.length > 0) {
                    return alVars.some((v: any) => (v.color || '').trim().toUpperCase() === colorPattern.toUpperCase())
                  }

                  // Fallback: check materials notes color_focus
                  const mat = materials?.find((m: any) => m.allotment_id === al.id)
                  if (mat?.notes) {
                    try {
                      const metaNotes = JSON.parse(mat.notes)
                      if (metaNotes.color_focus && metaNotes.color_focus.toUpperCase() !== 'ALL') {
                        return metaNotes.color_focus.toUpperCase() === colorPattern.toUpperCase()
                      }
                    } catch (_) {}
                  }

                  return true
                })

                let linemanId = ''
                let linemanName = 'Unassigned (Floor Order)'
                let lineStatus = 'PENDING'
                let allotmentId = ''
                let completedQty = 0

                if (matchingAl) {
                  allotmentId = matchingAl.id
                  const linemanObj: any = (Array.isArray(matchingAl.profiles) ? matchingAl.profiles[0] : matchingAl.profiles) || {}
                  if (matchingAl.lineman_id) {
                    linemanId = matchingAl.lineman_id
                    linemanName = linemanObj?.username || linemanObj?.full_name || 'Lineman'
                    lineStatus = matchingAl.status === 'QC_PASSED' ? 'QC_PASSED' : (matchingAl.status === 'DISPATCHED' ? 'DISPATCHED' : 'IN_PROGRESS')
                  }
                  
                  // Check completed qty from variants
                  const alVars = variants?.filter((v: any) => v.allotment_id === matchingAl.id) || []
                  const vMatch = alVars.find((v: any) => 
                    (v.color || '').toUpperCase() === colorPattern.toUpperCase() && 
                    (v.size || '').toUpperCase() === sizeRange.toUpperCase()
                  )
                  if (vMatch) {
                    completedQty = vMatch.completed_qty || 0
                  }
                }

                articles.push({
                  id: `${ch.id}-line-${idx}`,
                  allotment_id: allotmentId,
                  art_no: cleanArtNo,
                  sub_art_no: cleanSubArt,
                  pattern_no: line.pattern_no || '',
                  description: line.description || `${fullArtCode} - ${colorPattern} (${sizeRange})`,
                  color_pattern: colorPattern,
                  size_range: sizeRange,
                  sets: lineSets,
                  pcs_per_set: lineRatio,
                  total_pcs: linePcs,
                  completed_qty: completedQty,
                  assigned_lineman_id: linemanId,
                  assigned_lineman_name: linemanName,
                  picture_url: line.picture_url || '',
                  stitching_rate: line.stitching_rate || 20,
                  status: lineStatus,
                  created_at: ch.created_at
                })
              })
            }
          } catch (_) {}
        }

        // 2. Fallback to legacy allotments bucket if no structured lines were in notes
        if (articles.length === 0 && challanArticlesMap[ch.id]) {
          articles = [...challanArticlesMap[ch.id]]
        }

        const totalSets = articles.reduce((sum, a) => sum + (Number(a.sets) || 0), 0) || ch.total_sets || 0
        const totalPcs = articles.reduce((sum, a) => sum + (Number(a.total_pcs) || 0), 0) || ch.total_pcs || 0

        let bomItems: ChallanBomItem[] = []
        if (ch.bom_details) {
          try {
            bomItems = Array.isArray(ch.bom_details) ? ch.bom_details : JSON.parse(ch.bom_details)
          } catch (_) {}
        }

        // Determine dynamic Challan status based on active floor allotments
        const totalLines = articles.length
        const allottedLines = articles.filter(a => a.assigned_lineman_id && a.status !== 'PLANNED' && a.status !== 'PENDING').length
        const completedLines = articles.filter(a => a.status === 'QC_PASSED' || a.status === 'COMPLETED').length
        const dispatchedLines = articles.filter(a => a.status === 'DISPATCHED').length

        let challanStatus = 'PENDING'
        if (ch.status === 'DISPATCHED' || (dispatchedLines === totalLines && totalLines > 0)) {
          challanStatus = 'DISPATCHED'
        } else if (ch.status === 'QC_PASSED' || (completedLines === totalLines && totalLines > 0)) {
          challanStatus = 'QC_PASSED'
        } else if (allottedLines === totalLines && totalLines > 0) {
          challanStatus = 'IN_PROGRESS'
        } else if (allottedLines > 0) {
          challanStatus = 'PARTIALLY_ALLOTTED'
        } else {
          challanStatus = 'PENDING'
        }

        challanGroups.push({
          id: ch.id,
          challan_no: ch.challan_no || 'CHALLAN',
          challan_date: ch.challan_date || new Date(ch.created_at).toISOString().split('T')[0],
          brand: ch.brand || '',
          delivery_date: ch.delivery_date || '',
          fabric_type: ch.fabric_type || '',
          sample_given: !!ch.sample_given,
          notes: ch.notes || '',
          total_sets: totalSets,
          total_pcs: totalPcs,
          status: challanStatus,
          bom_details: bomItems,
          articles: articles,
          created_at: ch.created_at
        })
      }
    }

    return challanGroups
  } catch (err) {
    console.error('Error fetching production orders:', err)
    return []
  }
}

// ----------------------------------------------------------------------
// CREATE MULTI-ARTICLE CHALLAN (Saves Planning Blueprint in Challan)
// NOTE: Floor Allotments are ONLY created when Admin/Manager assigns from /allotments!
// ----------------------------------------------------------------------
export async function createChallan(payload: CreateChallanPayload) {
  const supabase = supabaseAdmin

  const {
    challan_no,
    challan_date,
    brand,
    delivery_date,
    fabric_type = '',
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

  try {
    const cleanChallanNo = challan_no.trim().toUpperCase()

    // Enforce Industry Standard: Unique Challan Number check
    const { data: existingChallan } = await supabase
      .from('challans')
      .select('id, challan_no')
      .ilike('challan_no', cleanChallanNo)
      .limit(1)

    if (existingChallan && existingChallan.length > 0) {
      return {
        error: `Challan #${cleanChallanNo} already exists in the system! Each delivery job challan must have a unique Challan Number. Please enter a new Challan Number.`
      }
    }

    // 1. Process and save Article Styles into master catalog
    const processedLines = []
    for (let idx = 0; idx < article_lines.length; idx++) {
      const line = article_lines[idx]
      const cleanArtNo = line.art_no.trim().toUpperCase()
      const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
      const fullArtCode = cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo
      const linePcs = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))
      const lineSets = Number(line.sets) || Math.round(linePcs / (Number(line.pcs_per_set) || 9))
      const lineRatio = Number(line.pcs_per_set) || 9

      // Ensure style exists in `articles` master catalog
      const { data: existingArt } = await supabase
        .from('articles')
        .select('id')
        .eq('art_no', fullArtCode)
        .limit(1)
        .single()

      if (!existingArt) {
        await supabase
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
      }

      processedLines.push({
        ...line,
        full_art_code: fullArtCode,
        sets: lineSets,
        pcs_per_set: lineRatio,
        total_pcs: linePcs
      })
    }

    // 2. Structured Challan Notes containing complete article blueprint & user notes
    const challanNotesJson = JSON.stringify({
      user_notes: notes.trim(),
      article_lines: processedLines
    })

    const todayDate = new Date().toISOString().split('T')[0]
    const safeChallanDate = sanitizeDate(challan_date) || todayDate
    const safeDeliveryDate = sanitizeDate(delivery_date)

    // 3. Insert into `challans` table
    const { data: newChallan, error: challanInsertErr } = await supabase
      .from('challans')
      .insert({
        challan_no: cleanChallanNo,
        challan_date: safeChallanDate,
        brand: brand.trim().toUpperCase(),
        delivery_date: safeDeliveryDate,
        fabric_type: fabric_type.trim(),
        sample_given: !!sample_given,
        notes: challanNotesJson,
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

    // 4. Auto-create Allotments for any article lines with assigned Lineman
    try {
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('is_active', true)

      const profileMap = new Map<string, string>()
      if (allProfiles) {
        allProfiles.forEach(p => {
          if (p.username) profileMap.set(p.username.trim().toLowerCase(), p.id)
        })
      }

      // Group lines by (base_art_no + lineman) -> All colors merge into 1 unified allotment card
      const groupedAllotmentMap = new Map<string, {
        artObj: any
        resolvedLinemanId: string
        resolvedLinemanName: string
        totalTargetQty: number
        fullArtCode: string
        variantsMap: Map<string, { color: string; size: string; quantity: number }>
        descriptions: Set<string>
      }>()

      for (const line of processedLines) {
        const lmRaw = ((line as any).lineman_name || '').trim().toLowerCase()
        const resolvedLinemanId = (line as any).assigned_lineman_id || (lmRaw ? profileMap.get(lmRaw) : null)
        if (!resolvedLinemanId) continue

        const cleanArtNo = (line.art_no || '').trim().toUpperCase()
        const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
        const baseArtNo = extractBaseArtNo(cleanArtNo, cleanSubArt)

        let { data: artObj } = await supabase
          .from('articles')
          .select('id, description, art_no')
          .eq('art_no', baseArtNo)
          .limit(1)
          .maybeSingle()

        if (!artObj) {
          const { data: fallbackArt } = await supabase
            .from('articles')
            .select('id, description, art_no')
            .eq('art_no', line.full_art_code)
            .limit(1)
            .maybeSingle()
          artObj = fallbackArt
        }

        if (!artObj) continue

        const key = `${artObj.id}__${resolvedLinemanId}`
        const linePcs = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))

        if (!groupedAllotmentMap.has(key)) {
          const lmName = (allProfiles || []).find(p => p.id === resolvedLinemanId)?.username || (line as any).lineman_name || 'Lineman'
          groupedAllotmentMap.set(key, {
            artObj,
            resolvedLinemanId,
            resolvedLinemanName: lmName,
            totalTargetQty: 0,
            fullArtCode: baseArtNo,
            variantsMap: new Map<string, { color: string; size: string; quantity: number }>(),
            descriptions: new Set<string>()
          })
        }

        const grp = groupedAllotmentMap.get(key)!
        grp.totalTargetQty += linePcs
        if (line.description) grp.descriptions.add(line.description)

        const color = (line.color_pattern || 'Standard').trim()
        const sizeList = (line.size_range || 'Free Size').split('/').map((s: string) => s.trim()).filter(Boolean)
        const perSizeQty = Math.round(linePcs / (sizeList.length || 1))
        sizeList.forEach((sz: string) => {
          const vKey = `${color.toUpperCase()}__${sz.toUpperCase()}`
          const curVar = grp.variantsMap.get(vKey) || { color, size: sz, quantity: 0 }
          curVar.quantity += perSizeQty
          grp.variantsMap.set(vKey, curVar)
        })
      }

      for (const grp of groupedAllotmentMap.values()) {
        const { data: newAl } = await supabase
          .from('allotments')
          .insert({
            challan_id: newChallan.id,
            article_id: grp.artObj.id,
            lineman_id: grp.resolvedLinemanId,
            target_qty: grp.totalTargetQty || 0,
            status: 'IN_PROGRESS',
            qc_status: 'PENDING_STITCHING',
            mending_status: 'PENDING_STITCHING',
            allotment_date: safeChallanDate
          })
          .select('id')
          .single()

        if (newAl) {
          const vars = Array.from(grp.variantsMap.values()).map(v => ({
            allotment_id: newAl.id,
            color: v.color || 'Standard',
            size: v.size,
            quantity: v.quantity,
            completed_qty: 0
          }))
          await supabase.from('allotment_variants').insert(vars)

          const matNote = JSON.stringify({
            lineman_id: grp.resolvedLinemanId,
            lineman_name: grp.resolvedLinemanName,
            article_id: grp.artObj.id,
            art_no: grp.fullArtCode,
            article_description: Array.from(grp.descriptions).join(', ') || grp.artObj.description || '',
            client_challan_no: cleanChallanNo,
            brand: brand,
            fabric: fabric_type,
            total_pcs: grp.totalTargetQty || 0,
            status: 'PENDING'
          })

          await supabase.from('allotment_materials').insert([
            { allotment_id: newAl.id, item_name: `Main Fabric (${fabric_type || 'Sinker'})`, required_qty: 'As per lot', admin_issued: false, notes: matNote },
            { allotment_id: newAl.id, item_name: 'Matching Sewing Thread', required_qty: '5 Cones', admin_issued: false, notes: matNote },
            { allotment_id: newAl.id, item_name: 'Main Brand Neck Tag', required_qty: `${grp.totalTargetQty || 0} pcs`, admin_issued: false, notes: matNote },
            { allotment_id: newAl.id, item_name: 'Master Polybags', required_qty: `${grp.totalTargetQty || 0} pcs`, admin_issued: false, notes: matNote }
          ])
        }
      }
    } catch (allotErr) {
      console.warn('Auto-allotment creation warning:', allotErr)
    }

    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    revalidatePath('/articles')
    revalidatePath('/')
    return { success: true, challan_id: newChallan.id }
  } catch (err: any) {
    console.error('Error in createChallan:', err)
    return { error: err?.message || 'Server error while creating delivery challan.' }
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
// ASSIGN ENTIRE CHALLAN TO A SINGLE LINEMAN (1-Click Full Allotment)
// ----------------------------------------------------------------------
export async function allotEntireChallan(challanId: string, linemanId: string) {
  const supabase = supabaseAdmin

  if (!challanId || !linemanId) {
    return { error: 'Please select a valid Challan and Lineman.' }
  }

  try {
    // 1. Fetch lineman profile username
    let linemanName = 'Lineman'
    const { data: prof } = await supabase.from('profiles').select('username').eq('id', linemanId).single()
    if (prof?.username) linemanName = prof.username

    // 2. Fetch challan details
    const { data: challan } = await supabase.from('challans').select('*').eq('id', challanId).single()
    if (!challan) return { error: 'Challan not found.' }

    // 3. Update existing allotments for this challan
    const { data: existingAllots } = await supabase
      .from('allotments')
      .select('id, article_id')
      .eq('challan_id', challanId)

    if (existingAllots && existingAllots.length > 0) {
      await supabase
        .from('allotments')
        .update({ lineman_id: linemanId })
        .eq('challan_id', challanId)

      // Sync materials notes
      const allotIds = existingAllots.map(a => a.id)
      const { data: mats } = await supabase
        .from('allotment_materials')
        .select('id, notes')
        .in('allotment_id', allotIds)

      if (mats && mats.length > 0) {
        for (const m of mats) {
          let nObj: any = {}
          if (m.notes) {
            try { nObj = JSON.parse(m.notes) } catch (_) {}
          }
          nObj.lineman_id = linemanId
          nObj.lineman_name = linemanName
          await supabase.from('allotment_materials').update({ notes: JSON.stringify(nObj) }).eq('id', m.id)
        }
      }
    }

    // 4. Check if there are planned lines in challan.notes not yet in allotments
    if (challan.notes) {
      try {
        const parsed = JSON.parse(challan.notes)
        const plannedLines = parsed.article_lines || parsed
        if (Array.isArray(plannedLines)) {
          const existingArtIds = new Set((existingAllots || []).map(a => a.article_id))

          for (const line of plannedLines) {
            const cleanArtNo = (line.art_no || '').trim().toUpperCase()
            const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
            const fullArtCode = line.full_art_code || (cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo)
            const targetQty = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))

            // Find article in articles table
            const { data: artObj } = await supabase
              .from('articles')
              .select('id, art_no, description')
              .eq('art_no', fullArtCode)
              .limit(1)
              .single()

            if (artObj && !existingArtIds.has(artObj.id)) {
              // Create new allotment
              const { data: newAl } = await supabase
                .from('allotments')
                .insert({
                  challan_id: challanId,
                  lineman_id: linemanId,
                  article_id: artObj.id,
                  target_qty: targetQty,
                  status: 'IN_PROGRESS',
                  qc_status: 'PENDING_STITCHING',
                  mending_status: 'PENDING_STITCHING',
                  allotment_date: new Date().toISOString().split('T')[0]
                })
                .select('id')
                .single()

              if (newAl) {
                // Insert default variants
                const sizeList = (line.size_range || 'L/XXL').split('/').map((s: string) => s.trim())
                const perSizeQty = Math.round(targetQty / (sizeList.length || 1))
                const varsToInsert = sizeList.map((sz: string) => ({
                  allotment_id: newAl.id,
                  color: line.color_pattern || 'Standard',
                  size: sz,
                  quantity: perSizeQty,
                  completed_qty: 0
                }))
                await supabase.from('allotment_variants').insert(varsToInsert)

                // Insert default materials
                const matNote = JSON.stringify({
                  lineman_id: linemanId,
                  lineman_name: linemanName,
                  article_id: artObj.id,
                  art_no: fullArtCode,
                  article_description: artObj.description || '',
                  client_challan_no: challan.challan_no,
                  brand: challan.brand,
                  total_pcs: targetQty,
                  status: 'PENDING'
                })
                await supabase.from('allotment_materials').insert([
                  { allotment_id: newAl.id, item_name: `Main Fabric (${challan.fabric_type || 'Sinker'})`, required_qty: 'As per lot', admin_issued: false, notes: matNote },
                  { allotment_id: newAl.id, item_name: 'Matching Sewing Thread', required_qty: '5 Cones', admin_issued: false, notes: matNote },
                  { allotment_id: newAl.id, item_name: 'Main Brand Neck Tag', required_qty: `${targetQty} pcs`, admin_issued: false, notes: matNote },
                  { allotment_id: newAl.id, item_name: 'Master Polybags', required_qty: `${targetQty} pcs`, admin_issued: false, notes: matNote }
                ])
              }
            }
          }
        }
      } catch (_) {}
    }

    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error in allotEntireChallan:', err)
    return { error: err?.message || 'Server error while assigning entire challan.' }
  }
}

// ----------------------------------------------------------------------
// ASSIGN SPECIFIC COLOR GROUP TO A LINEMAN (Color-Wise Split)
// ----------------------------------------------------------------------
export async function allotChallanByColor(challanId: string, colorName: string, linemanId: string) {
  const supabase = supabaseAdmin

  if (!challanId || !colorName || !linemanId) {
    return { error: 'Please select a valid Color and Lineman.' }
  }

  try {
    let linemanName = 'Lineman'
    const { data: prof } = await supabase.from('profiles').select('username').eq('id', linemanId).single()
    if (prof?.username) linemanName = prof.username

    const { data: challan } = await supabase.from('challans').select('*').eq('id', challanId).single()
    if (!challan) return { error: 'Challan not found.' }

    const cleanColor = colorName.trim().toUpperCase()

    // Parse planned lines from challan notes
    let plannedLines: any[] = []
    if (challan.notes) {
      try {
        const parsed = JSON.parse(challan.notes)
        plannedLines = parsed.article_lines || parsed
        if (!Array.isArray(plannedLines)) plannedLines = []
      } catch (_) {}
    }

    // Filter lines matching this color
    const matchingLines = plannedLines.filter(line => {
      const lineCol = (line.color_pattern || line.description || '').toUpperCase()
      return lineCol.includes(cleanColor) || lineCol.includes('3 COLOUR') || lineCol.includes('3 COLOR') || cleanColor === 'ALL'
    })

    if (matchingLines.length > 0) {
      // Group by baseArtNo
      const styleGroups: Record<string, {
        baseArtNo: string
        fullArtCode: string
        description: string
        totalPcs: number
        variants: Array<{ color: string; size: string; quantity: number }>
      }> = {}

      for (const line of matchingLines) {
        const cleanArtNo = (line.art_no || '').trim().toUpperCase()
        const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
        const fullArtCode = line.full_art_code || (cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo)
        const baseArtNo = extractBaseArtNo(cleanArtNo, cleanSubArt)
        const linePcs = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))
        const lineSize = (line.size_range || 'Free Size').trim()
        const lineColor = (line.color_pattern || colorName).trim()

        if (!styleGroups[baseArtNo]) {
          styleGroups[baseArtNo] = {
            baseArtNo,
            fullArtCode,
            description: line.description || `${baseArtNo} - ${cleanColor}`,
            totalPcs: 0,
            variants: []
          }
        }

        styleGroups[baseArtNo].totalPcs += linePcs
        styleGroups[baseArtNo].variants.push({
          color: lineColor,
          size: lineSize,
          quantity: linePcs
        })
      }

      for (const group of Object.values(styleGroups)) {
        // Find or create article in DB
        let artId = ''
        const { data: existingArt } = await supabase
          .from('articles')
          .select('id, art_no')
          .or(`art_no.eq.${group.baseArtNo},art_no.eq.${group.fullArtCode}`)
          .limit(1)
          .single()

        if (existingArt) {
          artId = existingArt.id
        } else {
          const { data: newArt } = await supabase
            .from('articles')
            .insert({
              art_no: group.baseArtNo,
              description: group.description,
              stitching_rate: 20
            })
            .select('id')
            .single()
          if (newArt) artId = newArt.id
        }

        if (!artId) continue

        // Check if allotment already exists for this challan and article
        const { data: existingAllot } = await supabase
          .from('allotments')
          .select('id, target_qty')
          .eq('challan_id', challanId)
          .eq('article_id', artId)
          .limit(1)
          .single()

        let allotmentId = ''
        if (existingAllot) {
          allotmentId = existingAllot.id
          await supabase
            .from('allotments')
            .update({
              lineman_id: linemanId,
              status: 'IN_PROGRESS'
            })
            .eq('id', allotmentId)

          // Delete existing variants for this color and re-insert fresh
          await supabase
            .from('allotment_variants')
            .delete()
            .eq('allotment_id', allotmentId)
            .eq('color', cleanColor)
        } else {
          const { data: newAl } = await supabase
            .from('allotments')
            .insert({
              challan_id: challanId,
              lineman_id: linemanId,
              article_id: artId,
              target_qty: group.totalPcs,
              status: 'IN_PROGRESS',
              qc_status: 'PENDING_STITCHING',
              mending_status: 'PENDING_STITCHING',
              allotment_date: new Date().toISOString().split('T')[0]
            })
            .select('id')
            .single()

          if (newAl) allotmentId = newAl.id
        }

        if (allotmentId) {
          // Insert all variants for this color group
          const varsToInsert = group.variants.map(v => ({
            allotment_id: allotmentId,
            color: v.color,
            size: v.size,
            quantity: v.quantity,
            completed_qty: 0
          }))
          await supabase.from('allotment_variants').insert(varsToInsert)

          const matNote = JSON.stringify({
            lineman_id: linemanId,
            lineman_name: linemanName,
            article_id: artId,
            art_no: group.baseArtNo,
            article_description: group.description,
            client_challan_no: challan.challan_no,
            brand: challan.brand,
            color_focus: cleanColor,
            total_pcs: group.totalPcs,
            status: 'PENDING'
          })

          await supabase.from('allotment_materials').insert([
            { allotment_id: allotmentId, item_name: `${cleanColor} Fabric Lot`, required_qty: 'As per lot', admin_issued: false, notes: matNote },
            { allotment_id: allotmentId, item_name: `Matching Thread (${cleanColor})`, required_qty: '5 Cones', admin_issued: false, notes: matNote },
            { allotment_id: allotmentId, item_name: 'Size & Main Neck Labels', required_qty: `${group.totalPcs} pcs`, admin_issued: false, notes: matNote },
            { allotment_id: allotmentId, item_name: 'Master Polybags', required_qty: `${group.totalPcs} pcs`, admin_issued: false, notes: matNote }
          ])
        }
      }
    }

    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error in allotChallanByColor:', err)
    return { error: err?.message || 'Server error while assigning color line.' }
  }
}

// ----------------------------------------------------------------------
// DELETE CHALLAN & ALL ASSOCIATED ALLOTMENTS (CASCADE SAFE)
// ----------------------------------------------------------------------
export async function deleteProductionOrder(challanOrAllotmentId: string, isChallanLevel: boolean = false) {
  const supabase = supabaseAdmin

  try {
    if (isChallanLevel) {
      // Find all child allotments
      const { data: childAllots } = await supabase
        .from('allotments')
        .select('id')
        .eq('challan_id', challanOrAllotmentId)

      if (childAllots && childAllots.length > 0) {
        const ids = childAllots.map((a: any) => a.id)
        await supabase.from('qc_logs').delete().in('allotment_id', ids)
        await supabase.from('daily_product').delete().in('allotment_id', ids)
        await supabase.from('mending_assignments').delete().in('allotment_id', ids)
        await supabase.from('qc_assignments').delete().in('allotment_id', ids)
        await supabase.from('counting_reports').delete().in('allotment_id', ids)
        await supabase.from('store_transactions').delete().in('allotment_id', ids)
        await supabase.from('allotment_variants').delete().in('allotment_id', ids)
        await supabase.from('allotment_materials').delete().in('allotment_id', ids)
        await supabase.from('worker_assignments').delete().in('allotment_id', ids)
        await supabase.from('floor_alerts').delete().in('allotment_id', ids)
        await supabase.from('allotments').delete().in('id', ids)
      }

      await supabase.from('challans').delete().eq('id', challanOrAllotmentId)
    } else {
      // Delete single allotment with cascade
      await supabase.from('qc_logs').delete().eq('allotment_id', challanOrAllotmentId)
      await supabase.from('daily_product').delete().eq('allotment_id', challanOrAllotmentId)
      await supabase.from('mending_assignments').delete().eq('allotment_id', challanOrAllotmentId)
      await supabase.from('qc_assignments').delete().eq('allotment_id', challanOrAllotmentId)
      await supabase.from('counting_reports').delete().eq('allotment_id', challanOrAllotmentId)
      await supabase.from('store_transactions').delete().eq('allotment_id', challanOrAllotmentId)
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
  } catch (err: any) {
    console.error('Error in deleteProductionOrder:', err)
    return { error: err?.message || 'Server error while deleting record' }
  }
}

// Helper to safely chunk arrays for PostgREST query parameters and payload limits
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// ----------------------------------------------------------------------
// BULK CREATE MULTI-CHALLANS (Ultra High-Performance Batched Import)
// ----------------------------------------------------------------------
export async function createBulkChallans(payloads: CreateChallanPayload[]): Promise<{
  success: boolean
  createdCount: number
  skippedCount: number
  createdChallans: ChallanGroupedOrder[]
  skippedChallanNos: string[]
  error?: string
}> {
  const supabase = supabaseAdmin

  if (!payloads || payloads.length === 0) {
    return {
      success: false,
      createdCount: 0,
      skippedCount: 0,
      createdChallans: [],
      skippedChallanNos: [],
      error: 'No challans provided for bulk import.'
    }
  }

  try {
    // 1. Bulk check duplicates in safe chunks of 100 (prevents URL length overflow)
    const allChallanNos = Array.from(
      new Set(payloads.map(p => (p.challan_no || '').trim().toUpperCase()).filter(Boolean))
    )

    const existingChallanSet = new Set<string>()
    const challanChunks = chunkArray(allChallanNos, 100)

    await Promise.all(
      challanChunks.map(async chunk => {
        const { data } = await supabase
          .from('challans')
          .select('challan_no')
          .in('challan_no', chunk)

        if (data) {
          data.forEach((c: any) => {
            const num = (c.challan_no || '').trim().toUpperCase()
            if (num) existingChallanSet.add(num)
          })
        }
      })
    )

    const validPayloads: CreateChallanPayload[] = []
    const skippedChallanNos: string[] = []

    for (const p of payloads) {
      const cNo = (p.challan_no || '').trim().toUpperCase()
      if (!cNo) continue
      if (existingChallanSet.has(cNo)) {
        skippedChallanNos.push(cNo)
      } else {
        validPayloads.push(p)
      }
    }

    if (validPayloads.length === 0) {
      return {
        success: true,
        createdCount: 0,
        skippedCount: skippedChallanNos.length,
        createdChallans: [],
        skippedChallanNos
      }
    }

    // 2. Collect and Batch Insert all unique article styles in safe chunks
    const styleMetaMap = new Map<string, {
      art_no: string
      base_art: string
      sub_art: string
      description: string
      stitching_rate: number
      pattern: string
      fabric: string
      party: string
      size: string
    }>()

    for (const payload of validPayloads) {
      for (const line of payload.article_lines || []) {
        const cleanArtNo = (line.art_no || '').trim().toUpperCase()
        if (!cleanArtNo) continue

        const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
        const fullArtCode = cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo
        const baseArtNo = extractBaseArtNo(cleanArtNo, cleanSubArt)

        if (!styleMetaMap.has(baseArtNo)) {
          styleMetaMap.set(baseArtNo, {
            art_no: baseArtNo,
            base_art: baseArtNo,
            sub_art: '',
            description: line.description || `${baseArtNo} - ${line.color_pattern || ''} (${line.size_range || ''})`.trim(),
            stitching_rate: line.stitching_rate || 20,
            pattern: line.pattern_no || '',
            fabric: payload.fabric_type || '',
            party: payload.brand || '',
            size: line.size_range || ''
          })
        }

        if (fullArtCode !== baseArtNo && !styleMetaMap.has(fullArtCode)) {
          styleMetaMap.set(fullArtCode, {
            art_no: fullArtCode,
            base_art: baseArtNo,
            sub_art: cleanSubArt,
            description: line.description || `${fullArtCode} - ${line.color_pattern || ''} (${line.size_range || ''})`.trim(),
            stitching_rate: line.stitching_rate || 20,
            pattern: line.pattern_no || '',
            fabric: payload.fabric_type || '',
            party: payload.brand || '',
            size: line.size_range || ''
          })
        }
      }
    }

    const allArtCodes = Array.from(styleMetaMap.keys())
    if (allArtCodes.length > 0) {
      const existingArtSet = new Set<string>()
      const artCodeChunks = chunkArray(allArtCodes, 100)

      await Promise.all(
        artCodeChunks.map(async chunk => {
          const { data } = await supabase
            .from('articles')
            .select('art_no')
            .in('art_no', chunk)

          if (data) {
            data.forEach((a: any) => {
              const code = (a.art_no || '').trim().toUpperCase()
              if (code) existingArtSet.add(code)
            })
          }
        })
      )

      const newArticlesToInsert: any[] = []
      for (const [code, meta] of styleMetaMap.entries()) {
        if (!existingArtSet.has(code)) {
          newArticlesToInsert.push({
            art_no: code,
            description: meta.description,
            stitching_rate: meta.stitching_rate,
            is_active: true,
            size_rates: {
              _meta: {
                base_art: meta.base_art,
                sub_art: meta.sub_art,
                pattern: meta.pattern,
                fabric: meta.fabric,
                party: meta.party,
                size: meta.size,
                picture_url: ''
              }
            }
          })
        }
      }

      if (newArticlesToInsert.length > 0) {
        const articleInsertChunks = chunkArray(newArticlesToInsert, 100)
        await Promise.all(
          articleInsertChunks.map(chunk => supabase.from('articles').insert(chunk))
        )
      }
    }

    // 3. Fetch registered profiles and articles for automated floor allotment
    const [profilesRes, articlesRes] = await Promise.all([
      supabase.from('profiles').select('id, username, role'),
      supabase.from('articles').select('id, art_no, description')
    ])

    const profileLookupMap = new Map<string, { id: string; username: string; role: string }>()
    profilesRes.data?.forEach((p: any) => {
      if (p.username) profileLookupMap.set(p.username.trim().toLowerCase(), p)
    })
    if (profileLookupMap.get('nawaz saddam')) {
      profileLookupMap.set('naawaz saddam', profileLookupMap.get('nawaz saddam')!)
    }

    const articleCodeToIdMap = new Map<string, { id: string; art_no: string; description: string }>()
    articlesRes.data?.forEach((a: any) => {
      if (a.art_no) {
        articleCodeToIdMap.set(a.art_no.trim().toUpperCase(), a)
        articleCodeToIdMap.set(a.art_no.replace(/\s+/g, '').toUpperCase(), a)
      }
    })

    // 4. Prepare Batch Insert for Challans with Floor Personnel Metadata
    const challansToInsert: any[] = []
    const challanMetadataMap = new Map<string, {
      payload: CreateChallanPayload
      processedLines: any[]
      totalSets: number
      totalPcs: number
      hasAnyLinemanAllotted: boolean
      allLinemenAllotted: boolean
    }>()

    for (const payload of validPayloads) {
      const cleanChallanNo = (payload.challan_no || '').trim().toUpperCase()
      const processedLines: any[] = []
      let allottedCount = 0

      for (const line of payload.article_lines || []) {
        const cleanArtNo = (line.art_no || '').trim().toUpperCase()
        if (!cleanArtNo) continue

        const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
        const fullArtCode = cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo
        const linePcs = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))
        const lineSets = Number(line.sets) || Math.max(1, Math.round(linePcs / (Number(line.pcs_per_set) || 9)))
        const lineRatio = Number(line.pcs_per_set) || 9

        // Auto-match personnel
        const lmRaw = ((line as any).lineman_name || '').trim().toLowerCase()
        const matchedLm = lmRaw ? profileLookupMap.get(lmRaw) : null
        const resolvedLinemanId = line.assigned_lineman_id || matchedLm?.id || ''
        const resolvedLinemanName = matchedLm?.username || (line as any).lineman_name || ''

        const qcRaw = ((line as any).qc_name || '').trim().toLowerCase()
        const matchedQc = qcRaw ? profileLookupMap.get(qcRaw) : null

        const mendingRaw = ((line as any).mending_name || '').trim().toLowerCase()
        const matchedMending = mendingRaw ? profileLookupMap.get(mendingRaw) : null

        const rawStage = ((line as any).stage_status || line.status || '').toUpperCase()
        const isQcPassed = rawStage === 'QC_PASSED' || rawStage === 'COMPLETED' || rawStage === 'DONE'

        if (resolvedLinemanId) allottedCount++

        processedLines.push({
          ...line,
          full_art_code: fullArtCode,
          sets: lineSets,
          pcs_per_set: lineRatio,
          total_pcs: linePcs,
          assigned_lineman_id: resolvedLinemanId,
          assigned_lineman_name: resolvedLinemanName || 'Unassigned (Floor Order)',
          lineman_name: resolvedLinemanName,
          qc_name: matchedQc?.username || (line as any).qc_name || '',
          qc_supervisor_id: matchedQc?.id || '',
          mending_name: matchedMending?.username || (line as any).mending_name || '',
          stage_status: rawStage,
          is_qc_passed: isQcPassed
        })
      }

      const grandTotalSets = processedLines.reduce((acc, row) => acc + (Number(row.sets) || 0), 0)
      const grandTotalPcs = processedLines.reduce((acc, row) => acc + (Number(row.total_pcs) || 0), 0)

      const hasAnyLineman = allottedCount > 0
      const allAllotted = allottedCount === processedLines.length && processedLines.length > 0

      const challanNotesJson = JSON.stringify({
        user_notes: (payload.notes || '').trim(),
        article_lines: processedLines
      })

      challanMetadataMap.set(cleanChallanNo, {
        payload,
        processedLines,
        totalSets: grandTotalSets,
        totalPcs: grandTotalPcs,
        hasAnyLinemanAllotted: hasAnyLineman,
        allLinemenAllotted: allAllotted
      })

      const todayDate = new Date().toISOString().split('T')[0]
      const safeChallanDate = sanitizeDate(payload.challan_date) || todayDate
      const safeDeliveryDate = sanitizeDate(payload.delivery_date)

      const initialStatus = allAllotted ? 'IN_PROGRESS' : (hasAnyLineman ? 'PARTIALLY_ALLOTTED' : 'PENDING')

      challansToInsert.push({
        challan_no: cleanChallanNo,
        challan_date: safeChallanDate,
        brand: (payload.brand || '').trim().toUpperCase(),
        delivery_date: safeDeliveryDate,
        fabric_type: (payload.fabric_type || '').trim(),
        sample_given: !!payload.sample_given,
        notes: challanNotesJson,
        total_sets: grandTotalSets,
        total_pcs: grandTotalPcs,
        status: initialStatus,
        bom_details: payload.bom_items || []
      })
    }

    // 5. Safe Parallel Batch Insert into database (chunks of 50 rows)
    const challanInsertChunks = chunkArray(challansToInsert, 50)
    const insertedChallansList: Array<{ id: string; challan_no: string; created_at?: string }> = []

    await Promise.all(
      challanInsertChunks.map(async chunk => {
        const { data, error: bulkInsertErr } = await supabase
          .from('challans')
          .insert(chunk)
          .select('id, challan_no, created_at')

        if (bulkInsertErr) {
          throw new Error(bulkInsertErr.message || 'Failed to bulk insert delivery challans.')
        }
        if (data) {
            insertedChallansList.push(...data)
        }
      })
    )

    // 6. Automated Creation of Allotments, Variants, Materials, & QC for assigned Linemen (Grouped Cleanly)
    const groupedAllotmentMap = new Map<string, {
      challan_id: string
      article_id: string
      lineman_id: string
      target_qty: number
      status: string
      qc_status: string
      mending_status: string
      qc_total_passed: number
      allotment_date: string
      color: string
      fullArtCode: string
      artDescription: string
      brand: string
      fabric: string
      challanNo: string
      assigned_lineman_name: string
      qc_name?: string
      qc_supervisor_id?: string
      variantsMap: Map<string, { color: string; size: string; quantity: number }>
      is_qc_passed: boolean
    }>()

    const fallbackToday = new Date().toISOString().split('T')[0]

    for (const inserted of insertedChallansList) {
      const cNo = (inserted.challan_no || '').trim().toUpperCase()
      const meta = challanMetadataMap.get(cNo)
      if (!meta) continue

      for (const line of meta.processedLines) {
        if (!line.assigned_lineman_id) continue

        const cleanArtNo = (line.art_no || '').trim().toUpperCase()
        const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
        const baseArtNo = extractBaseArtNo(cleanArtNo, cleanSubArt)

        const artObj = articleCodeToIdMap.get(baseArtNo) ||
          articleCodeToIdMap.get(line.full_art_code) || 
          articleCodeToIdMap.get(cleanArtNo) || 
          articleCodeToIdMap.get(String(line.full_art_code || '').replace(/\s+/g, ''))
        if (!artObj) continue

        const groupKey = `${inserted.id}__${artObj.id}__${line.assigned_lineman_id}`
        const linePcs = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))

        if (!groupedAllotmentMap.has(groupKey)) {
          groupedAllotmentMap.set(groupKey, {
            challan_id: inserted.id,
            article_id: artObj.id,
            lineman_id: line.assigned_lineman_id,
            target_qty: 0,
            status: line.is_qc_passed ? 'COMPLETED' : 'IN_PROGRESS',
            qc_status: line.is_qc_passed ? 'PASSED' : 'PENDING_STITCHING',
            mending_status: line.is_qc_passed ? 'PASSED' : 'PENDING_STITCHING',
            qc_total_passed: 0,
            allotment_date: sanitizeDate(meta.payload.challan_date) || fallbackToday,
            color: 'Multi-Color',
            fullArtCode: baseArtNo,
            artDescription: artObj.description || '',
            brand: meta.payload.brand || '',
            fabric: meta.payload.fabric_type || '',
            challanNo: cNo,
            assigned_lineman_name: line.assigned_lineman_name || 'Lineman',
            qc_name: line.qc_name,
            qc_supervisor_id: line.qc_supervisor_id,
            variantsMap: new Map<string, { color: string; size: string; quantity: number }>(),
            is_qc_passed: !!line.is_qc_passed
          })
        }

        const grp = groupedAllotmentMap.get(groupKey)!
        grp.target_qty += linePcs
        if (line.is_qc_passed) grp.qc_total_passed += linePcs

        const color = (line.color_pattern || 'Standard').trim()
        const sizeList = (line.size_range || 'Free Size').split('/').map((s: string) => s.trim()).filter(Boolean)
        const perSizeQty = Math.round(linePcs / (sizeList.length || 1))
        sizeList.forEach((sz: string) => {
          const vKey = `${color.toUpperCase()}__${sz.toUpperCase()}`
          const curVar = grp.variantsMap.get(vKey) || { color, size: sz, quantity: 0 }
          curVar.quantity += perSizeQty
          grp.variantsMap.set(vKey, curVar)
        })
      }
    }

    const masterAllotmentPayloads = Array.from(groupedAllotmentMap.values())

    if (masterAllotmentPayloads.length > 0) {
      const cleanAllotmentPayloads = masterAllotmentPayloads.map(g => ({
        challan_id: g.challan_id,
        article_id: g.article_id,
        lineman_id: g.lineman_id,
        target_qty: g.target_qty,
        status: g.status,
        qc_status: g.qc_status,
        mending_status: g.mending_status,
        qc_total_passed: g.qc_total_passed,
        allotment_date: g.allotment_date
      }))

      const allotChunks = chunkArray(cleanAllotmentPayloads, 50)
      const insertedAllotments: Array<{ id: string; challan_id: string; article_id: string; lineman_id: string }> = []

      for (const chunk of allotChunks) {
        const { data } = await supabase
          .from('allotments')
          .insert(chunk)
          .select('id, challan_id, article_id, lineman_id')

        if (data) insertedAllotments.push(...data)
      }

      const variantsToInsert: any[] = []
      const materialsToInsert: any[] = []
      const qcAssignmentsToInsert: any[] = []

      insertedAllotments.forEach((insertedAl, idx) => {
        const grp = masterAllotmentPayloads[idx]
        if (!grp) return

        for (const v of grp.variantsMap.values()) {
          variantsToInsert.push({
            allotment_id: insertedAl.id,
            color: v.color || 'Standard',
            size: v.size,
            quantity: v.quantity,
            completed_qty: grp.is_qc_passed ? v.quantity : 0
          })
        }

        const matNote = JSON.stringify({
          lineman_id: insertedAl.lineman_id,
          lineman_name: grp.assigned_lineman_name,
          article_id: insertedAl.article_id,
          art_no: grp.fullArtCode,
          article_description: grp.artDescription,
          client_challan_no: grp.challanNo,
          brand: grp.brand,
          fabric: grp.fabric,
          total_pcs: grp.target_qty,
          status: 'PENDING'
        })

        materialsToInsert.push(
          { allotment_id: insertedAl.id, item_name: `Main Fabric (${grp.fabric || 'Sinker'})`, required_qty: 'As per lot', admin_issued: false, notes: matNote },
          { allotment_id: insertedAl.id, item_name: 'Matching Sewing Thread', required_qty: '5 Cones', admin_issued: false, notes: matNote },
          { allotment_id: insertedAl.id, item_name: 'Main Brand Neck Tag', required_qty: `${grp.target_qty} pcs`, admin_issued: false, notes: matNote },
          { allotment_id: insertedAl.id, item_name: 'Master Polybags', required_qty: `${grp.target_qty} pcs`, admin_issued: false, notes: matNote }
        )

        if (grp.qc_name || grp.qc_supervisor_id) {
          qcAssignmentsToInsert.push({
            allotment_id: insertedAl.id,
            qc_supervisor_id: grp.qc_supervisor_id || null,
            worker_name: grp.qc_name || 'QC Inspector',
            article_id: insertedAl.article_id,
            color: grp.color || 'Standard',
            size: 'All Sizes',
            assigned_qty: grp.target_qty,
            checked_qty: grp.is_qc_passed ? grp.target_qty : 0,
            passed_qty: grp.is_qc_passed ? grp.target_qty : 0,
            alter_qty: 0,
            status: grp.is_qc_passed ? 'DONE' : 'ASSIGNED'
          })
        }
      })

      const variantChunks = chunkArray(variantsToInsert, 100)
      const materialChunks = chunkArray(materialsToInsert, 100)
      const qcChunks = chunkArray(qcAssignmentsToInsert, 100)

      await Promise.all([
        ...variantChunks.map(chunk => supabase.from('allotment_variants').insert(chunk)),
        ...materialChunks.map(chunk => supabase.from('allotment_materials').insert(chunk)),
        ...qcChunks.map(chunk => supabase.from('qc_assignments').insert(chunk))
      ])
    }

    // 7. Build optimistic ChallanGroupedOrder results
    const createdChallans: ChallanGroupedOrder[] = []

    for (const inserted of insertedChallansList) {
      const cNo = (inserted.challan_no || '').trim().toUpperCase()
      const meta = challanMetadataMap.get(cNo)
      if (meta) {
        const initialStatus = meta.allLinemenAllotted ? 'IN_PROGRESS' : (meta.hasAnyLinemanAllotted ? 'PARTIALLY_ALLOTTED' : 'PENDING')
        createdChallans.push({
          id: inserted.id,
          challan_no: cNo,
          challan_date: sanitizeDate(meta.payload.challan_date) || fallbackToday,
          brand: (meta.payload.brand || '').trim().toUpperCase(),
          delivery_date: sanitizeDate(meta.payload.delivery_date) || '',
          fabric_type: (meta.payload.fabric_type || '').trim(),
          sample_given: !!meta.payload.sample_given,
          notes: JSON.stringify({
            user_notes: (meta.payload.notes || '').trim(),
            article_lines: meta.processedLines
          }),
          total_sets: meta.totalSets,
          total_pcs: meta.totalPcs,
          status: initialStatus as any,
          bom_details: meta.payload.bom_items || [],
          articles: meta.processedLines.map((line, idx) => ({
            ...line,
            allotment_id: '',
            status: line.assigned_lineman_id ? (line.is_qc_passed ? 'QC_PASSED' : 'IN_PROGRESS') : 'PLANNED',
            assigned_lineman_name: line.assigned_lineman_name || 'Unassigned (Floor Order)'
          })),
          created_at: inserted.created_at || new Date().toISOString()
        })
      }
    }

    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    revalidatePath('/')

    return {
      success: true,
      createdCount: createdChallans.length,
      skippedCount: skippedChallanNos.length,
      createdChallans,
      skippedChallanNos
    }
  } catch (err: any) {
    console.error('Error in createBulkChallans:', err)
    return {
      success: false,
      createdCount: 0,
      skippedCount: 0,
      createdChallans: [],
      skippedChallanNos: [],
      error: err?.message || 'Server error during bulk challans creation.'
    }
  }
}

// ----------------------------------------------------------------------
// 1-CLICK INSTANT FULL CHALLAN ALLOTMENT (Direct from Challan Hub)
// ----------------------------------------------------------------------
export async function allotFullChallanDirectly(challanId: string, linemanId: string) {
  const supabase = supabaseAdmin
  try {
    if (!challanId || !linemanId) {
      return { error: 'Please select a valid Challan and Lineman.' }
    }

    // 1. Fetch Lineman details
    const { data: lineman, error: lmErr } = await supabase
      .from('profiles')
      .select('id, username, role')
      .eq('id', linemanId)
      .single()

    if (lmErr || !lineman) {
      return { error: 'Lineman not found in database.' }
    }
    const linemanName = lineman.username || 'Lineman'

    // 2. Fetch Challan details
    const { data: ch, error: chErr } = await supabase
      .from('challans')
      .select('*')
      .eq('id', challanId)
      .single()

    if (chErr || !ch) {
      return { error: 'Challan not found.' }
    }

    let parsedLines: any[] = []
    if (ch.notes) {
      try {
        const p = JSON.parse(ch.notes)
        parsedLines = p.article_lines || p
      } catch (_) {}
    }

    // 3. Check existing allotments for this challan
    const { data: existingAllotments } = await supabase
      .from('allotments')
      .select('id, article_id, articles(art_no)')
      .eq('challan_id', challanId)

    const existingArtIdMap = new Map<string, string>()
    if (existingAllotments) {
      existingAllotments.forEach((al: any) => {
        const artNo = (al.articles?.art_no || '').trim().toUpperCase()
        if (artNo) existingArtIdMap.set(artNo, al.id)
      })
    }

    const todayDate = new Date().toISOString().split('T')[0]

    // If existing allotments exist, update their lineman_id
    if (existingAllotments && existingAllotments.length > 0) {
      const allIds = existingAllotments.map((a: any) => a.id)
      await supabase
        .from('allotments')
        .update({
          lineman_id: linemanId,
          status: 'IN_PROGRESS',
          qc_status: 'PENDING_STITCHING',
          mending_status: 'PENDING_STITCHING'
        })
        .in('id', allIds)
    }

    // For any article lines in challan.notes that don't have an allotment yet, create them!
    if (Array.isArray(parsedLines) && parsedLines.length > 0) {
      for (const line of parsedLines) {
        const cleanArtNo = (line.art_no || '').trim().toUpperCase()
        const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
        const fullArtCode = line.full_art_code || (cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo)
        
        if (!fullArtCode) continue
        if (existingArtIdMap.has(fullArtCode)) continue // already updated above

        // Ensure article exists in `articles` table
        let { data: artRec } = await supabase
          .from('articles')
          .select('id, stitching_rate')
          .eq('art_no', fullArtCode)
          .limit(1)
          .maybeSingle()

        if (!artRec) {
          const { data: createdArt } = await supabase
            .from('articles')
            .insert({
              art_no: fullArtCode,
              description: line.description || `${fullArtCode} - ${line.color_pattern || ''} (${line.size_range || ''})`,
              stitching_rate: line.stitching_rate || 20,
              is_active: true,
              size_rates: {
                _meta: {
                  base_art: cleanArtNo,
                  sub_art: cleanSubArt,
                  pattern: line.pattern_no || '',
                  fabric: ch.fabric_type || '',
                  party: ch.brand || '',
                  size: line.size_range,
                  picture_url: line.picture_url || ''
                }
              }
            })
            .select('id, stitching_rate')
            .single()

          artRec = createdArt
        }

        const linePcs = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))
        const lineSets = Number(line.sets) || Math.round(linePcs / (Number(line.pcs_per_set) || 9))
        const lineRatio = Number(line.pcs_per_set) || 9

        if (artRec) {
          // Insert allotment
          const { data: newAllotment } = await supabase
            .from('allotments')
            .insert({
              challan_id: challanId,
              article_id: artRec.id,
              lineman_id: linemanId,
              target_qty: linePcs,
              status: 'IN_PROGRESS',
              qc_status: 'PENDING_STITCHING',
              mending_status: 'PENDING_STITCHING',
              allotment_date: todayDate,
              production_order_no: ch.challan_no,
              client_challan_no: ch.challan_no
            })
            .select('id')
            .single()

          if (newAllotment) {
            existingArtIdMap.set(fullArtCode, newAllotment.id)

            // Insert variant
            await supabase.from('allotment_variants').insert({
              allotment_id: newAllotment.id,
              color: line.color_pattern || 'Standard',
              size: line.size_range || 'Free Size',
              quantity: linePcs,
              completed_qty: 0
            })

            // Insert material note
            await supabase.from('allotment_materials').insert({
              allotment_id: newAllotment.id,
              item_name: `${ch.fabric_type || 'Fabric'} - ${line.color_pattern || 'Standard'}`,
              required_qty: `${linePcs} pcs`,
              admin_issued: true,
              notes: JSON.stringify({
                sets: lineSets,
                pcs_per_set: lineRatio,
                color_pattern: line.color_pattern,
                size_range: line.size_range,
                sub_art_no: line.sub_art_no,
                pattern_no: line.pattern_no,
                article_description: line.description,
                client_challan_no: ch.challan_no
              })
            })
          }
        }
      }
    }

    // 4. Update Challan status to IN_PROGRESS
    await supabase
      .from('challans')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', challanId)

    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    revalidatePath('/dashboard')
    revalidatePath('/')

    return {
      success: true,
      challanId,
      linemanId,
      linemanName
    }
  } catch (err: any) {
    console.error('Error in allotFullChallanDirectly:', err)
    return { error: err?.message || 'Failed to allot challan.' }
  }
}

// ----------------------------------------------------------------------
// 1-CLICK INSTANT COLOR GROUP ALLOTMENT (Direct from Challan Hub)
// ----------------------------------------------------------------------
export async function allotColorGroupDirectly(challanId: string, colorName: string, linemanId: string) {
  const supabase = supabaseAdmin
  try {
    if (!challanId || !colorName || !linemanId) {
      return { error: 'Please select a valid Challan, Color line, and Lineman.' }
    }

    const { data: lineman } = await supabase
      .from('profiles')
      .select('id, username, role')
      .eq('id', linemanId)
      .single()

    const linemanName = lineman?.username || 'Lineman'

    const { data: ch } = await supabase
      .from('challans')
      .select('*')
      .eq('id', challanId)
      .single()

    if (!ch) return { error: 'Challan not found.' }

    let parsedLines: any[] = []
    if (ch.notes) {
      try {
        const p = JSON.parse(ch.notes)
        parsedLines = p.article_lines || p
      } catch (_) {}
    }

    // Match lines for this color
    const targetLines = parsedLines.filter(line => {
      const c = (line.color_pattern || line.description || '').trim().toUpperCase()
      return c === colorName.trim().toUpperCase() || c.includes(colorName.trim().toUpperCase())
    })

    const todayDate = new Date().toISOString().split('T')[0]

    for (const line of (targetLines.length > 0 ? targetLines : parsedLines)) {
      const cleanArtNo = (line.art_no || '').trim().toUpperCase()
      const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
      const fullArtCode = line.full_art_code || (cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo)

      let { data: artRec } = await supabase
        .from('articles')
        .select('id')
        .eq('art_no', fullArtCode)
        .limit(1)
        .maybeSingle()

      if (!artRec) {
        const { data: createdArt } = await supabase
          .from('articles')
          .insert({
            art_no: fullArtCode,
            description: line.description || `${fullArtCode} - ${line.color_pattern || colorName}`,
            stitching_rate: line.stitching_rate || 20,
            is_active: true,
            size_rates: {
              _meta: {
                base_art: cleanArtNo,
                sub_art: cleanSubArt,
                pattern: line.pattern_no || '',
                fabric: ch.fabric_type || '',
                party: ch.brand || '',
                size: line.size_range,
                picture_url: line.picture_url || ''
              }
            }
          })
          .select('id')
          .single()
        artRec = createdArt
      }

      const linePcs = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))
      const lineSets = Number(line.sets) || Math.round(linePcs / (Number(line.pcs_per_set) || 9))
      const lineRatio = Number(line.pcs_per_set) || 9

      if (artRec) {
        const { data: newAllotment } = await supabase
          .from('allotments')
          .insert({
            challan_id: challanId,
            article_id: artRec.id,
            lineman_id: linemanId,
            target_qty: linePcs,
            status: 'IN_PROGRESS',
            qc_status: 'PENDING_STITCHING',
            mending_status: 'PENDING_STITCHING',
            allotment_date: todayDate,
            production_order_no: ch.challan_no,
            client_challan_no: ch.challan_no
          })
          .select('id')
          .single()

        if (newAllotment) {
          await supabase.from('allotment_variants').insert({
            allotment_id: newAllotment.id,
            color: colorName,
            size: line.size_range || 'Free Size',
            quantity: linePcs,
            completed_qty: 0
          })

          await supabase.from('allotment_materials').insert({
            allotment_id: newAllotment.id,
            item_name: `${ch.fabric_type || 'Fabric'} - ${colorName}`,
            required_qty: `${linePcs} pcs`,
            admin_issued: true,
            notes: JSON.stringify({
              sets: lineSets,
              pcs_per_set: lineRatio,
              color_pattern: colorName,
              size_range: line.size_range,
              sub_art_no: line.sub_art_no,
              pattern_no: line.pattern_no,
              client_challan_no: ch.challan_no
            })
          })
        }
      }
    }

    await supabase
      .from('challans')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', challanId)

    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    revalidatePath('/dashboard')
    revalidatePath('/')

    return {
      success: true,
      challanId,
      colorName,
      linemanId,
      linemanName
    }
  } catch (err: any) {
    console.error('Error in allotColorGroupDirectly:', err)
    return { error: err?.message || 'Failed to allot color line.' }
  }
}

// ----------------------------------------------------------------------
// 1-CLICK UNALLOT CHALLAN (Moves back to Pending Allotment)
// ----------------------------------------------------------------------
export async function unallotChallanDirectly(challanId: string) {
  const supabase = supabaseAdmin
  try {
    if (!challanId) return { error: 'Invalid Challan ID.' }

    // Delete floor allotments associated with this challan
    await supabase
      .from('allotments')
      .delete()
      .eq('challan_id', challanId)

    await supabase
      .from('challans')
      .update({ status: 'PENDING' })
      .eq('id', challanId)

    revalidatePath('/production-orders')
    revalidatePath('/allotments')
    revalidatePath('/dashboard')
    revalidatePath('/')

    return { success: true, challanId }
  } catch (err: any) {
    console.error('Error in unallotChallanDirectly:', err)
    return { error: err?.message || 'Failed to unallot challan.' }
  }
}


