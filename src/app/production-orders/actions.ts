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
        let articles = challanArticlesMap[ch.id] ? [...challanArticlesMap[ch.id]] : []
        const allottedArtCodes = new Set(articles.map(a => (a.art_no || '').trim().toUpperCase()))

        // Merge planned article lines from challan notes that are not yet allotted
        if (ch.notes) {
          try {
            const parsedNotes = JSON.parse(ch.notes)
            const rawLines = parsedNotes.article_lines || parsedNotes
            if (Array.isArray(rawLines)) {
              rawLines.forEach((line: any, idx: number) => {
                const cleanArtNo = (line.art_no || '9433').trim().toUpperCase()
                const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
                const fullArtCode = line.full_art_code || (cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo)

                // Only add if this article code is not already in floor allotments
                if (!allottedArtCodes.has(fullArtCode)) {
                  const linePcs = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))
                  const lineSets = Number(line.sets) || Math.round(linePcs / (Number(line.pcs_per_set) || 9))
                  const lineRatio = Number(line.pcs_per_set) || 9

                  articles.push({
                    id: `${ch.id}-planned-${idx}`,
                    allotment_id: '',
                    art_no: fullArtCode,
                    sub_art_no: cleanSubArt,
                    pattern_no: line.pattern_no || '',
                    description: line.description || `${fullArtCode} - ${line.color_pattern || ''} (${line.size_range || ''})`,
                    color_pattern: line.color_pattern || 'Standard',
                    size_range: line.size_range || 'Free Size',
                    sets: lineSets,
                    pcs_per_set: lineRatio,
                    total_pcs: linePcs,
                    completed_qty: 0,
                    assigned_lineman_id: '',
                    assigned_lineman_name: 'Unassigned (Floor Order)',
                    picture_url: line.picture_url || '',
                    stitching_rate: line.stitching_rate || 20,
                    status: 'PLANNED',
                    created_at: ch.created_at
                  })
                }
              })
            }
          } catch (_) {}
        }

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

    // 5. If there are legacy direct allotments without a challan, show them in a Direct Allotments card
    if (challanArticlesMap['LEGACY_UNASSIGNED'] && challanArticlesMap['LEGACY_UNASSIGNED'].length > 0) {
      const legacyArticles = challanArticlesMap['LEGACY_UNASSIGNED']
      const totalSets = legacyArticles.reduce((sum, a) => sum + (Number(a.sets) || 0), 0)
      const totalPcs = legacyArticles.reduce((sum, a) => sum + (Number(a.total_pcs) || 0), 0)

      challanGroups.push({
        id: 'legacy-unassigned',
        challan_no: 'DIRECT-ALLOTMENTS',
        challan_date: new Date().toISOString().split('T')[0],
        brand: 'FLOOR DIRECT',
        delivery_date: '',
        fabric_type: 'FACTORY LOT',
        sample_given: false,
        notes: 'Direct Floor Allotments created outside formal delivery challan',
        total_sets: totalSets,
        total_pcs: totalPcs,
        status: 'IN_PROGRESS',
        bom_details: [],
        articles: legacyArticles,
        created_at: new Date().toISOString()
      })
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

    // 3. Insert into `challans` table
    const { data: newChallan, error: challanInsertErr } = await supabase
      .from('challans')
      .insert({
        challan_no: cleanChallanNo,
        challan_date: challan_date || new Date().toISOString().split('T')[0],
        brand: brand.trim().toUpperCase(),
        delivery_date: delivery_date || null,
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
            const cleanArtNo = (line.art_no || '9433').trim().toUpperCase()
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

    // 1. Check existing allotments for this challan
    const { data: existingAllots } = await supabase
      .from('allotments')
      .select('id, article_id, articles(art_no, description)')
      .eq('challan_id', challanId)

    if (existingAllots && existingAllots.length > 0) {
      for (const al of existingAllots) {
        const artObj = (Array.isArray(al.articles) ? al.articles[0] : al.articles) || {}
        const artDesc = (artObj.description || '').toUpperCase()

        if (artDesc.includes(cleanColor) || cleanColor.includes('MUSHROOM') || cleanColor.includes('DUTCH') || cleanColor.includes('SCUBA')) {
          await supabase.from('allotments').update({ lineman_id: linemanId }).eq('id', al.id)

          const { data: mats } = await supabase.from('allotment_materials').select('id, notes').eq('allotment_id', al.id)
          if (mats) {
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
      }
    }

    // 2. Check planned lines in challan notes
    if (challan.notes) {
      try {
        const parsed = JSON.parse(challan.notes)
        const plannedLines = parsed.article_lines || parsed
        if (Array.isArray(plannedLines)) {
          for (const line of plannedLines) {
            const lineCol = (line.color_pattern || line.description || '').toUpperCase()
            if (lineCol.includes(cleanColor) || lineCol.includes('3 COLOUR') || lineCol.includes('3 COLOR') || cleanColor === 'ALL') {
              const cleanArtNo = (line.art_no || '9433').trim().toUpperCase()
              const cleanSubArt = (line.sub_art_no || '').trim().toUpperCase()
              const fullArtCode = line.full_art_code || (cleanSubArt ? `${cleanArtNo}${cleanSubArt}` : cleanArtNo)
              const targetQty = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))

              const { data: artObj } = await supabase
                .from('articles')
                .select('id, art_no, description')
                .eq('art_no', fullArtCode)
                .limit(1)
                .single()

              if (artObj) {
                // Check if already created
                const { data: alreadyCreated } = await supabase
                  .from('allotments')
                  .select('id')
                  .eq('challan_id', challanId)
                  .eq('article_id', artObj.id)
                  .limit(1)
                  .single()

                if (alreadyCreated) {
                  await supabase.from('allotments').update({ lineman_id: linemanId }).eq('id', alreadyCreated.id)
                } else {
                  const { data: newAl } = await supabase
                    .from('allotments')
                    .insert({
                      challan_id: challanId,
                      lineman_id: linemanId,
                      article_id: artObj.id,
                      target_qty: targetQty,
                      status: 'IN_PROGRESS',
                      allotment_date: new Date().toISOString().split('T')[0]
                    })
                    .select('id')
                    .single()

                  if (newAl) {
                    const sizeList = (line.size_range || 'L/XXL').split('/').map((s: string) => s.trim())
                    const perSizeQty = Math.round(targetQty / (sizeList.length || 1))
                    const varsToInsert = sizeList.map((sz: string) => ({
                      allotment_id: newAl.id,
                      color: line.color_pattern || colorName,
                      size: sz,
                      quantity: perSizeQty,
                      completed_qty: 0
                    }))
                    await supabase.from('allotment_variants').insert(varsToInsert)

                    const matNote = JSON.stringify({
                      lineman_id: linemanId,
                      lineman_name: linemanName,
                      article_id: artObj.id,
                      art_no: fullArtCode,
                      article_description: artObj.description || '',
                      client_challan_no: challan.challan_no,
                      brand: challan.brand,
                      color_focus: colorName,
                      total_pcs: targetQty,
                      status: 'PENDING'
                    })
                    await supabase.from('allotment_materials').insert([
                      { allotment_id: newAl.id, item_name: `${colorName} Fabric Lot`, required_qty: 'As per lot', admin_issued: false, notes: matNote },
                      { allotment_id: newAl.id, item_name: `Matching Thread (${colorName})`, required_qty: '5 Cones', admin_issued: false, notes: matNote },
                      { allotment_id: newAl.id, item_name: 'Size & Main Neck Labels', required_qty: `${targetQty} pcs`, admin_issued: false, notes: matNote },
                      { allotment_id: newAl.id, item_name: 'Master Polybags', required_qty: `${targetQty} pcs`, admin_issued: false, notes: matNote }
                    ])
                  }
                }
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
    console.error('Error in allotChallanByColor:', err)
    return { error: err?.message || 'Server error while assigning color line.' }
  }
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
