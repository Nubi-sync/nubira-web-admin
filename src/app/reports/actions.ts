'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { CacheManager } from '@/lib/cache/cache-manager'
import { isLegacyNubiraTenant, resolveUserTenant, ResolvedTenantProfile } from '@/lib/tenant-context'

export interface ReportKpis {
  totalProduced: number
  producedTrendPct: number
  qcPassRate: number
  qcPassTrendPct: number
  netWarehouseStock: number
  warehouseTrendPct: number
  totalDispatched: number
  dispatchTrendPct: number
}

export interface ProductionTrendPoint {
  date: string
  label: string
  pieces: number
}

export interface QcTrendPoint {
  date: string
  label: string
  passed: number
  rejected: number
  passRate: number
}

export interface ArticleWorkerOperation {
  id: string
  division: string
  divisionRoute: string
  workerName: string
  workerPhone?: string
  operation: string
  workstation: string
  targetPcs: number
  completedPcs: number
  rejectedPcs: number
  status: string
  timestamp?: string
}

export interface ArticleReportRow {
  id: string
  artNo: string
  description: string
  buyerName: string
  poNumber: string
  targetPcs: number
  cutPcs: number
  printEmbPcs: number
  stitchedPcs: number
  washedPcs: number
  ironedPcs: number
  qcPassedPcs: number
  qcFailedPcs: number
  qcRejectRatePct: number
  godownPcs: number
  dispatchedPcs: number
  progressPct: number
  stageStatus: string
  operations: ArticleWorkerOperation[]
}

export interface WorkerPieceLedgerItem {
  id: string
  workerName: string
  workerPhone?: string
  role: string
  division: string
  divisionRoute: string
  articleNo: string
  articleName: string
  buyerName?: string
  operationName: string
  workstationRef: string
  targetPieces: number
  completedPieces: number
  rejectedPieces: number
  status: string
  date: string
  shift?: string
}

export interface DivisionScorePoint {
  division: string
  divisionRoute: string
  score: number
  metricLabel: string
  workerCount: number
  totalOutput: number
}

export interface BuyerFulfillmentItem {
  poNumber: string
  buyerName: string
  orderDate: string
  deliveryDate: string
  targetPieces: number
  deliveredPieces: number
  godownPieces: number
  challanNumbers: string[]
  percent: number
  isOverdue: boolean
  status: string
}

export interface ReportsData {
  companyName: string
  allowedDivisions: string[]
  kpis: ReportKpis
  productionTrend: ProductionTrendPoint[]
  dailyAverage: number
  qcTrend: QcTrendPoint[]
  articlesReport: ArticleReportRow[]
  workerLedger: WorkerPieceLedgerItem[]
  divisionComparison: DivisionScorePoint[]
  buyerFulfillments: BuyerFulfillmentItem[]
  generatedAt: string
}

// Safe helper for Supabase foreign relations
function getBrandName(brandObj: any): string {
  if (!brandObj) return ''
  if (Array.isArray(brandObj)) {
    return brandObj[0]?.brand_name || ''
  }
  return brandObj.brand_name || ''
}

export async function fetchReportsData(
  tenantOrCompany?: ResolvedTenantProfile | string
): Promise<ReportsData> {
  const tenant = typeof tenantOrCompany === 'object' && tenantOrCompany !== null ? tenantOrCompany : null
  let companyName = (tenant ? tenant.companyName : (typeof tenantOrCompany === 'string' ? tenantOrCompany : '')) || ''
  let allowedDivisions = tenant?.allowedDivisions || []

  if (!companyName) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const uTenant = await resolveUserTenant(user)
        companyName = uTenant.companyName || ''
        allowedDivisions = uTenant.allowedDivisions || []
      }
    } catch (_) {}
  }

  const isLegacy = tenant ? isLegacyNubiraTenant(tenant) : (companyName ? companyName.toLowerCase().includes('nubira') : false)
  const targetComp = companyName.trim().toLowerCase()
  const normComp = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:reports:analytics:v3`

  return CacheManager.fetchOrSet(cacheKey, async () => {
    try {
      // 1. Ingest Design Tech Packs (Modern Standard Factory Articles)
      let techPacksQuery = supabaseAdmin
        .from('design_tech_packs')
        .select('id, style_number, category, company_name, fabric_composition, target_gsm, embellishment_sequence, cad_front_url, approval_status, created_at')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!isLegacy && companyName) {
        techPacksQuery = techPacksQuery.ilike('company_name', companyName)
      }

      // 2. Ingest Merchandising Orders with Joined Brands (Fixes buyer_name column error)
      let merchOrdersQuery = supabaseAdmin
        .from('merchandising_orders')
        .select('id, order_number, total_quantity, order_date, delivery_date, status, company_name, style_number, brands ( id, brand_name, brand_code )')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!isLegacy && companyName) {
        merchOrdersQuery = merchOrdersQuery.ilike('company_name', companyName)
      }

      // 3. Ingest Legacy Articles
      let legacyArticlesQuery = supabaseAdmin
        .from('articles')
        .select('id, art_no, description, is_active, size_rates')
        .order('art_no', { ascending: true })
        .limit(200)

      if (!isLegacy && companyName) {
        legacyArticlesQuery = legacyArticlesQuery.or(
          `size_rates->>company_name.ilike.%${targetComp}%,size_rates->_meta->>company_name.ilike.%${targetComp}%,description.ilike.%${targetComp}%`
        )
      }

      // 4. Ingest Allotments (Targets for legacy articles)
      let allotmentsQuery = supabaseAdmin
        .from('allotments')
        .select('id, target_qty, article_id')
        .limit(500)

      const [techPacksRes, merchOrdersRes, legacyArticlesRes, allotmentsRes] = await Promise.all([
        techPacksQuery,
        merchOrdersQuery,
        legacyArticlesQuery,
        allotmentsQuery
      ])

      const rawTechPacks = techPacksRes.data || []
      const rawMerch = merchOrdersRes.data || []
      const rawLegacyArticles = legacyArticlesRes.data || []
      const rawAllotments = allotmentsRes.data || []

      // 5. Ingest Floor Module Task Allocations & Submissions in Parallel
      let cuttingAllocQuery = supabaseAdmin
        .from('cutting_task_allocations')
        .select('id, task_ref, buyer_name, article_number, article_name, worker_name, worker_phone, table_number, pieces_to_cut, completed_pieces, alloted_hours, due_time, status, created_at')
        .order('created_at', { ascending: false })
        .limit(300)

      let stitchingAllocQuery = supabaseAdmin
        .from('stitching_task_allocations')
        .select('id, task_ref, lot_number, po_number, buyer_name, article_name, style_number, source_department, operation_type, machine_type, target_quantity, completed_quantity, rejected_quantity, worker_name, worker_phone, priority, status, company_name, started_at, completed_at, created_at')
        .order('created_at', { ascending: false })
        .limit(300)

      if (!isLegacy && companyName) {
        stitchingAllocQuery = stitchingAllocQuery.ilike('company_name', companyName)
      }

      let printingAllocQuery = supabaseAdmin
        .from('printing_task_allocations')
        .select('id, task_ref, buyer_name, article_number, article_name, worker_name, worker_phone, table_number, pieces_to_print, completed_pieces, alloted_hours, status, created_at')
        .order('created_at', { ascending: false })
        .limit(300)

      let embroideryAllocQuery = supabaseAdmin
        .from('embroidery_task_allocations')
        .select('id, task_ref, buyer_name, article_number, article_name, worker_name, worker_phone, machine_number, pieces_to_embroider, completed_pieces, alloted_hours, status, created_at')
        .order('created_at', { ascending: false })
        .limit(300)

      let washingAllocQuery = supabaseAdmin
        .from('washing_task_allocations')
        .select('id, task_ref, buyer_name, article_number, article_name, worker_name, worker_phone, table_number, machine_number, pieces_to_wash, completed_pieces, wash_recipe, status, company_name, created_at')
        .order('created_at', { ascending: false })
        .limit(300)

      if (!isLegacy && companyName) {
        washingAllocQuery = washingAllocQuery.ilike('company_name', companyName)
      }

      let ironAllocQuery = supabaseAdmin
        .from('iron_task_allocations')
        .select('id, task_ref, buyer_name, article_number, article_name, worker_name, worker_phone, table_number, pieces_to_iron, completed_pieces, iron_temp_c, status, company_name, created_at')
        .order('created_at', { ascending: false })
        .limit(300)

      if (!isLegacy && companyName) {
        ironAllocQuery = ironAllocQuery.ilike('company_name', companyName)
      }

      // 6. Ingest Legacy Logs, QC Logs, Store Inward/Outward, and Delivery Challans
      const legacyArticleIds = rawLegacyArticles.map(a => a.id).filter(Boolean)

      let dailyProdPromise: any = Promise.resolve({ data: [] })
      let qcPromise: any = Promise.resolve({ data: [] })
      let storePromise: any = Promise.resolve({ data: [] })
      let dispatchPromise: any = Promise.resolve({ data: [] })

      if (isLegacy) {
        dailyProdPromise = supabaseAdmin
          .from('daily_product')
          .select('id, quantity, entry_date, created_at, article_id, lineman:profiles!daily_product_lineman_id_fkey(username, phone), article:articles(art_no, description)')
          .order('entry_date', { ascending: false })
          .limit(800)

        qcPromise = supabaseAdmin
          .from('qc_logs')
          .select('id, qty_passed, qty_rejected, defect_type, entry_date, created_at, article_id, lineman:profiles!qc_logs_from_lineman_id_fkey(username, phone), article:articles(art_no, description)')
          .order('entry_date', { ascending: false })
          .limit(800)

        storePromise = supabaseAdmin
          .from('store_transactions')
          .select('id, type, quantity, entry_date, created_at, party_name, article_id, article:articles(art_no, description)')
          .order('created_at', { ascending: false })
          .limit(800)

        dispatchPromise = supabaseAdmin
          .from('delivery_challans')
          .select('id, challan_no, buyer_name, total_pieces, destination, status, created_at')
          .order('created_at', { ascending: false })
          .limit(300)
      } else {
        if (legacyArticleIds.length > 0) {
          dailyProdPromise = supabaseAdmin
            .from('daily_product')
            .select('id, quantity, entry_date, created_at, article_id, lineman:profiles!daily_product_lineman_id_fkey(username, phone), article:articles(art_no, description)')
            .in('article_id', legacyArticleIds)
            .order('entry_date', { ascending: false })
            .limit(800)

          qcPromise = supabaseAdmin
            .from('qc_logs')
            .select('id, qty_passed, qty_rejected, defect_type, entry_date, created_at, article_id, lineman:profiles!qc_logs_from_lineman_id_fkey(username, phone), article:articles(art_no, description)')
            .in('article_id', legacyArticleIds)
            .order('entry_date', { ascending: false })
            .limit(800)

          storePromise = supabaseAdmin
            .from('store_transactions')
            .select('id, type, quantity, entry_date, created_at, party_name, article_id, article:articles(art_no, description)')
            .in('article_id', legacyArticleIds)
            .order('created_at', { ascending: false })
            .limit(800)
        }

        dispatchPromise = supabaseAdmin
          .from('delivery_challans')
          .select('id, challan_no, buyer_name, total_pieces, destination, status, created_at')
          .ilike('buyer_name', `%${targetComp}%`)
          .order('created_at', { ascending: false })
          .limit(300)
      }

      const safeQuery = async (p: any) => {
        try {
          const res = await p
          return { data: res?.data || [] }
        } catch (_) {
          return { data: [] }
        }
      }

      const [
        cuttingRes,
        stitchingRes,
        printingRes,
        embroideryRes,
        washingRes,
        ironRes,
        dailyProdRes,
        qcRes,
        storeRes,
        dispatchRes
      ] = await Promise.all([
        safeQuery(cuttingAllocQuery),
        safeQuery(stitchingAllocQuery),
        safeQuery(printingAllocQuery),
        safeQuery(embroideryAllocQuery),
        safeQuery(washingAllocQuery),
        safeQuery(ironAllocQuery),
        safeQuery(dailyProdPromise),
        safeQuery(qcPromise),
        safeQuery(storePromise),
        safeQuery(dispatchPromise)
      ])

      const rawCutting = cuttingRes.data || []
      const rawStitching = stitchingRes.data || []
      const rawPrinting = printingRes.data || []
      const rawEmbroidery = embroideryRes.data || []
      const rawWashing = washingRes.data || []
      const rawIron = ironRes.data || []
      const rawProd = dailyProdRes.data || []
      const rawQc = qcRes.data || []
      const rawStore = storeRes.data || []
      const rawDispatch = dispatchRes.data || []

      // =======================================================================
      // 7. BUILD CONSOLIDATED WORKER PIECE LEDGER (TAB 2)
      // =======================================================================
      const workerLedger: WorkerPieceLedgerItem[] = []

      // 7.1 Cutting Workers Allocations
      rawCutting.forEach((c: any) => {
        workerLedger.push({
          id: `cut-${c.id}`,
          workerName: c.worker_name || 'Knife Cutter',
          workerPhone: c.worker_phone || undefined,
          role: 'Knife Cutter',
          division: 'Cutting Floor',
          divisionRoute: '/cutting',
          articleNo: c.article_number || 'Style',
          articleName: c.article_name || c.article_number || 'Garment Component',
          buyerName: c.buyer_name || undefined,
          operationName: `Lay Cutting (${c.task_ref || 'Ref'})`,
          workstationRef: c.table_number || 'Cutting Table 01',
          targetPieces: Number(c.pieces_to_cut) || 0,
          completedPieces: Number(c.completed_pieces) || 0,
          rejectedPieces: 0,
          status: c.status || 'ASSIGNED',
          date: c.created_at ? c.created_at.split('T')[0] : 'Today'
        })
      })

      // 7.2 Stitching Workers Allocations
      rawStitching.forEach((s: any) => {
        workerLedger.push({
          id: `stitch-${s.id}`,
          workerName: s.worker_name || 'Tailor',
          workerPhone: s.worker_phone || undefined,
          role: 'Tailor Specialist',
          division: 'Stitching & Sewing',
          divisionRoute: '/stitching-sewing',
          articleNo: s.style_number || s.article_name || 'Style',
          articleName: s.article_name || s.style_number || 'Garment Assembly',
          buyerName: s.buyer_name || undefined,
          operationName: s.operation_type || 'Full Garment Assembly',
          workstationRef: s.machine_type || 'Lockstitch (SNLS)',
          targetPieces: Number(s.target_quantity) || 0,
          completedPieces: Number(s.completed_quantity) || 0,
          rejectedPieces: Number(s.rejected_quantity) || 0,
          status: s.status || 'ASSIGNED',
          date: s.created_at ? s.created_at.split('T')[0] : 'Today'
        })
      })

      // 7.3 Printing Workers Allocations
      rawPrinting.forEach((p: any) => {
        workerLedger.push({
          id: `print-${p.id}`,
          workerName: p.worker_name || 'Screen Printer',
          workerPhone: p.worker_phone || undefined,
          role: 'Screen Print Master',
          division: 'Printing Unit',
          divisionRoute: '/printing',
          articleNo: p.article_number || 'Style',
          articleName: p.article_name || 'Printed Panel',
          buyerName: p.buyer_name || undefined,
          operationName: 'Screen & Placement Print',
          workstationRef: p.table_number || 'Print Table 01',
          targetPieces: Number(p.pieces_to_print) || 0,
          completedPieces: Number(p.completed_pieces) || 0,
          rejectedPieces: 0,
          status: p.status || 'ASSIGNED',
          date: p.created_at ? p.created_at.split('T')[0] : 'Today'
        })
      })

      // 7.4 Embroidery Workers Allocations
      rawEmbroidery.forEach((e: any) => {
        workerLedger.push({
          id: `emb-${e.id}`,
          workerName: e.worker_name || 'Embroidery Operator',
          workerPhone: e.worker_phone || undefined,
          role: 'Machine Operator',
          division: 'Embroidery Unit',
          divisionRoute: '/embroidery',
          articleNo: e.article_number || 'Style',
          articleName: e.article_name || 'Embroidered Artwork',
          buyerName: e.buyer_name || undefined,
          operationName: 'Multi-Head Embroidery Run',
          workstationRef: e.machine_number || 'Embroidery Machine 01',
          targetPieces: Number(e.pieces_to_embroider) || 0,
          completedPieces: Number(e.completed_pieces) || 0,
          rejectedPieces: 0,
          status: e.status || 'ASSIGNED',
          date: e.created_at ? e.created_at.split('T')[0] : 'Today'
        })
      })

      // 7.5 Washing Workers Allocations
      rawWashing.forEach((w: any) => {
        workerLedger.push({
          id: `wash-${w.id}`,
          workerName: w.worker_name || 'Wash Master',
          workerPhone: w.worker_phone || undefined,
          role: 'Wash Master',
          division: 'Washing Plant',
          divisionRoute: '/washing',
          articleNo: w.article_number || 'Style',
          articleName: w.article_name || 'Wash Batch',
          buyerName: w.buyer_name || undefined,
          operationName: w.wash_recipe || 'Enzyme Wash',
          workstationRef: w.machine_number || w.table_number || 'Tumbler Washer 01',
          targetPieces: Number(w.pieces_to_wash) || 0,
          completedPieces: Number(w.completed_pieces) || 0,
          rejectedPieces: 0,
          status: w.status || 'ASSIGNED',
          date: w.created_at ? w.created_at.split('T')[0] : 'Today'
        })
      })

      // 7.6 Steam Ironing Allocations
      rawIron.forEach((i: any) => {
        workerLedger.push({
          id: `iron-${i.id}`,
          workerName: i.worker_name || 'Steam Ironer',
          workerPhone: i.worker_phone || undefined,
          role: 'Steam Press Operator',
          division: 'Ironing & Finishing',
          divisionRoute: '/iron',
          articleNo: i.article_number || 'Style',
          articleName: i.article_name || 'Steam Pressed Unit',
          buyerName: i.buyer_name || undefined,
          operationName: `Steam Press & Fold (${i.iron_temp_c || 150}°C)`,
          workstationRef: i.table_number || 'Vacuum Table 01',
          targetPieces: Number(i.pieces_to_iron) || 0,
          completedPieces: Number(i.completed_pieces) || 0,
          rejectedPieces: 0,
          status: i.status || 'ASSIGNED',
          date: i.created_at ? i.created_at.split('T')[0] : 'Today'
        })
      })

      // 7.7 Legacy Lineman / Tailor Daily Production Logs
      rawProd.forEach((p: any) => {
        const workerName = (p.lineman as any)?.username || 'Tailor'
        const workerPhone = (p.lineman as any)?.phone || undefined
        const artNo = (p.article as any)?.art_no || 'Art'
        const artDesc = (p.article as any)?.description || 'Garment Style'
        const qty = Number(p.quantity) || 0

        workerLedger.push({
          id: `prod-${p.id}`,
          workerName,
          workerPhone,
          role: 'Floor Tailor',
          division: 'Stitching & Sewing',
          divisionRoute: '/stitching-sewing',
          articleNo: artNo,
          articleName: artDesc,
          operationName: 'Line Assembly Unit',
          workstationRef: 'Floor Line 01',
          targetPieces: qty,
          completedPieces: qty,
          rejectedPieces: 0,
          status: 'COMPLETED',
          date: p.entry_date || (p.created_at ? p.created_at.split('T')[0] : 'Today')
        })
      })

      // Sort worker ledger descending by date
      workerLedger.sort((a, b) => b.date.localeCompare(a.date))

      // =======================================================================
      // 8. UNIFIED ARTICLE CATALOG & PIPELINE LEDGER (TAB 1)
      // =======================================================================
      const articlesMap = new Map<string, {
        id: string
        artNo: string
        description: string
        buyerName: string
        poNumber: string
        targetPcs: number
      }>()

      // Ingest from Design Tech Packs
      rawTechPacks.forEach((tp: any) => {
        if (!tp.style_number) return
        const key = tp.style_number.trim().toUpperCase()
        articlesMap.set(key, {
          id: tp.id,
          artNo: tp.style_number,
          description: tp.category || 'Tech-Pack Garment',
          buyerName: '',
          poNumber: '',
          targetPcs: 0
        })
      })

      // Ingest & enrich from Merchandising Orders
      rawMerch.forEach((mo: any) => {
        const styleKey = (mo.style_number || mo.order_number || '').trim().toUpperCase()
        const buyerName = getBrandName(mo.brands) || 'Direct Buyer'
        const poNumber = mo.order_number || 'PO'
        const qty = Number(mo.total_quantity) || 0

        if (styleKey && articlesMap.has(styleKey)) {
          const existing = articlesMap.get(styleKey)!
          existing.buyerName = buyerName
          existing.poNumber = poNumber
          existing.targetPcs = Math.max(existing.targetPcs, qty)
        } else if (styleKey) {
          articlesMap.set(styleKey, {
            id: mo.id,
            artNo: mo.style_number || mo.order_number,
            description: `${buyerName} Order`,
            buyerName,
            poNumber,
            targetPcs: qty
          })
        }
      })

      // Ingest from Legacy Articles
      rawLegacyArticles.forEach((art: any) => {
        if (!art.art_no) return
        const key = art.art_no.trim().toUpperCase()
        const artAllotmentTarget = rawAllotments
          .filter((a: any) => a.article_id === art.id)
          .reduce((s: number, a: any) => s + (Number(a.target_qty) || 0), 0)

        if (!articlesMap.has(key)) {
          articlesMap.set(key, {
            id: art.id,
            artNo: art.art_no,
            description: art.description || 'Legacy Article',
            buyerName: 'Direct Buyer',
            poNumber: `PO-${art.art_no}`,
            targetPcs: artAllotmentTarget
          })
        }
      })

      // Build Article Progress Rows with Nested Worker Traceability
      const articlesReport: ArticleReportRow[] = Array.from(articlesMap.values()).map(meta => {
        const artNoKey = meta.artNo.toLowerCase()

        // Match worker allocations for this article
        const matchedAllocations = workerLedger.filter(
          item => item.articleNo.toLowerCase() === artNoKey || item.articleName.toLowerCase().includes(artNoKey)
        )

        // Calculate stage piece completions
        const cutPcs = matchedAllocations
          .filter(a => a.divisionRoute === '/cutting')
          .reduce((s, a) => s + a.completedPieces, 0)

        const printEmbPcs = matchedAllocations
          .filter(a => a.divisionRoute === '/printing' || a.divisionRoute === '/embroidery')
          .reduce((s, a) => s + a.completedPieces, 0)

        let stitchedPcs = matchedAllocations
          .filter(a => a.divisionRoute === '/stitching-sewing')
          .reduce((s, a) => s + a.completedPieces, 0)

        // Legacy daily prod fallback
        if (stitchedPcs === 0) {
          stitchedPcs = rawProd
            .filter((p: any) => (p.article?.art_no || '').toLowerCase() === artNoKey || p.article_id === meta.id)
            .reduce((s: number, p: any) => s + (Number(p.quantity) || 0), 0)
        }

        const washedPcs = matchedAllocations
          .filter(a => a.divisionRoute === '/washing')
          .reduce((s, a) => s + a.completedPieces, 0)

        const ironedPcs = matchedAllocations
          .filter(a => a.divisionRoute === '/iron')
          .reduce((s, a) => s + a.completedPieces, 0)

        // QC inspection
        const artQcLogs = rawQc.filter(
          (q: any) => (q.article?.art_no || '').toLowerCase() === artNoKey || q.article_id === meta.id
        )
        const qcPassedPcs = artQcLogs.reduce((s: number, q: any) => s + (Number(q.qty_passed) || 0), 0)
        const qcFailedPcs = artQcLogs.reduce((s: number, q: any) => s + (Number(q.qty_rejected) || 0), 0)
        const totalQc = qcPassedPcs + qcFailedPcs
        const qcRejectRatePct = totalQc > 0 ? Number(((qcFailedPcs / totalQc) * 100).toFixed(1)) : 0

        // Warehouse Stock
        const artStoreLogs = rawStore.filter(
          (tx: any) => (tx.article?.art_no || '').toLowerCase() === artNoKey || tx.article_id === meta.id
        )
        let godownPcs = 0
        artStoreLogs.forEach((tx: any) => {
          const q = Number(tx.quantity) || 0
          if (tx.type === 'INWARD') godownPcs += q
          else if (tx.type === 'OUTWARD') godownPcs -= q
        })
        godownPcs = Math.max(0, godownPcs)

        // Dispatches
        const dispatchedPcs = rawDispatch
          .filter((d: any) => (d.buyer_name || '').toLowerCase() === (meta.buyerName || '').toLowerCase())
          .reduce((s: number, d: any) => s + (Number(d.total_pieces) || 0), 0)

        // Calculate progress percentage
        const target = meta.targetPcs || Math.max(cutPcs, stitchedPcs, qcPassedPcs, 100)
        const maxCompletedStage = Math.max(cutPcs, stitchedPcs, qcPassedPcs, ironedPcs, godownPcs)
        const progressPct = target > 0 ? Math.min(100, Math.round((maxCompletedStage / target) * 100)) : 0

        // Determine current stage status
        let stageStatus = 'Scheduled'
        if (dispatchedPcs >= target && target > 0) stageStatus = 'Dispatched'
        else if (godownPcs > 0) stageStatus = 'In Godown'
        else if (qcPassedPcs > 0) stageStatus = 'QC Passed'
        else if (ironedPcs > 0) stageStatus = 'In Ironing'
        else if (washedPcs > 0) stageStatus = 'In Washing'
        else if (stitchedPcs > 0) stageStatus = 'In Stitching'
        else if (printEmbPcs > 0) stageStatus = 'In Embellishment'
        else if (cutPcs > 0) stageStatus = 'In Cutting'

        // Nested worker operations for single-click drilldown
        const operations: ArticleWorkerOperation[] = matchedAllocations.map(a => ({
          id: a.id,
          division: a.division,
          divisionRoute: a.divisionRoute,
          workerName: a.workerName,
          workerPhone: a.workerPhone,
          operation: a.operationName,
          workstation: a.workstationRef,
          targetPcs: a.targetPieces,
          completedPcs: a.completedPieces,
          rejectedPcs: a.rejectedPieces,
          status: a.status,
          timestamp: a.date
        }))

        return {
          id: meta.id,
          artNo: meta.artNo,
          description: meta.description,
          buyerName: meta.buyerName || 'Direct Buyer',
          poNumber: meta.poNumber || `PO-${meta.artNo}`,
          targetPcs: target,
          cutPcs,
          printEmbPcs,
          stitchedPcs,
          washedPcs,
          ironedPcs,
          qcPassedPcs,
          qcFailedPcs,
          qcRejectRatePct,
          godownPcs,
          dispatchedPcs,
          progressPct,
          stageStatus,
          operations
        }
      })

      // Sort articles by target pieces descending
      articlesReport.sort((a, b) => b.targetPcs - a.targetPcs)

      // =======================================================================
      // 9. CALCULATE MACRO KPIS & 14-DAY PRODUCTION TREND
      // =======================================================================
      const totalProduced = workerLedger.reduce((s, w) => s + w.completedPieces, 0)
      const totalPassedQc = articlesReport.reduce((s, a) => s + a.qcPassedPcs, 0)
      const totalFailedQc = articlesReport.reduce((s, a) => s + a.qcFailedPcs, 0)
      const totalAuditedQc = totalPassedQc + totalFailedQc
      const qcPassRate = totalAuditedQc > 0 ? Number(((totalPassedQc / totalAuditedQc) * 100).toFixed(1)) : 100

      const netWarehouseStock = articlesReport.reduce((s, a) => s + a.godownPcs, 0)
      const totalDispatched = rawDispatch.reduce((s: number, d: any) => s + (Number(d.total_pieces) || 0), 0)

      const kpis: ReportKpis = {
        totalProduced,
        producedTrendPct: 0,
        qcPassRate,
        qcPassTrendPct: 0,
        netWarehouseStock,
        warehouseTrendPct: 0,
        totalDispatched,
        dispatchTrendPct: 0
      }

      // 14-Day Production Trend Map
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const prodTrendMap = new Map<string, number>()
      const qcTrendMap = new Map<string, { passed: number; rejected: number }>()

      workerLedger.forEach(w => {
        if (!w.date) return
        prodTrendMap.set(w.date, (prodTrendMap.get(w.date) || 0) + w.completedPieces)
      })

      rawQc.forEach((q: any) => {
        const dStr = q.entry_date || (q.created_at ? q.created_at.split('T')[0] : '')
        if (!dStr) return
        const existing = qcTrendMap.get(dStr) || { passed: 0, rejected: 0 }
        existing.passed += Number(q.qty_passed) || 0
        existing.rejected += Number(q.qty_rejected) || 0
        qcTrendMap.set(dStr, existing)
      })

      const productionTrend: ProductionTrendPoint[] = []
      const qcTrend: QcTrendPoint[] = []
      let sumTrendPcs = 0

      for (let i = 13; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dStr = d.toISOString().split('T')[0]
        const label = `${dayNames[d.getDay()]} ${d.getDate()}`

        const pcs = prodTrendMap.get(dStr) || 0
        sumTrendPcs += pcs
        productionTrend.push({ date: dStr, label, pieces: pcs })

        const qEntry = qcTrendMap.get(dStr) || { passed: 0, rejected: 0 }
        const pass = qEntry.passed
        const rej = qEntry.rejected
        const tot = pass + rej
        qcTrend.push({
          date: dStr,
          label,
          passed: pass,
          rejected: rej,
          passRate: tot > 0 ? Number(((pass / tot) * 100).toFixed(1)) : 100
        })
      }

      const dailyAverage = Math.round(sumTrendPcs / Math.max(productionTrend.length, 1))

      // =======================================================================
      // 10. DIVISION PERFORMANCE SCORECARDS
      // =======================================================================
      const divisionStatsMap = new Map<string, { route: string; workerSet: Set<string>; output: number }>()

      const defaultDivs = [
        { name: 'Cutting Floor', route: '/cutting' },
        { name: 'Printing Unit', route: '/printing' },
        { name: 'Embroidery Unit', route: '/embroidery' },
        { name: 'Stitching & Sewing', route: '/stitching-sewing' },
        { name: 'Washing Plant', route: '/washing' },
        { name: 'Ironing & Finishing', route: '/iron' },
        { name: 'QC Audit', route: '/modules' },
        { name: 'Warehouse / Godown', route: '/store' },
        { name: 'Dispatch Bay', route: '/dispatch' }
      ]

      defaultDivs.forEach(d => {
        divisionStatsMap.set(d.name, { route: d.route, workerSet: new Set(), output: 0 })
      })

      workerLedger.forEach(w => {
        if (divisionStatsMap.has(w.division)) {
          const entry = divisionStatsMap.get(w.division)!
          entry.workerSet.add(w.workerName)
          entry.output += w.completedPieces
        }
      })

      const divisionComparison: DivisionScorePoint[] = defaultDivs.map(d => {
        const stats = divisionStatsMap.get(d.name)!
        const workerCount = stats.workerSet.size
        const output = stats.output
        const score = output > 0 ? Math.min(100, Math.round((output / 500) * 100)) : 0

        let metricLabel = `${output.toLocaleString()} pcs output`
        if (d.name === 'QC Audit') {
          metricLabel = `${qcPassRate}% pass rate (${totalAuditedQc} audited)`
        } else if (d.name === 'Warehouse / Godown') {
          metricLabel = `${netWarehouseStock.toLocaleString()} in stock`
        } else if (d.name === 'Dispatch Bay') {
          metricLabel = `${totalDispatched.toLocaleString()} shipped`
        }

        return {
          division: d.name,
          divisionRoute: d.route,
          score,
          metricLabel,
          workerCount,
          totalOutput: output
        }
      })

      // =======================================================================
      // 11. BUYER PO FULFILLMENT & DISPATCH AUDIT (TAB 3)
      // =======================================================================
      const buyerFulfillments: BuyerFulfillmentItem[] = rawMerch.map((m: any) => {
        const target = Number(m.total_quantity) || 0
        const buyer = getBrandName(m.brands) || 'Direct Buyer'
        const po = m.order_number || 'PO'

        const matchingChallans = rawDispatch.filter(
          (d: any) => (d.buyer_name || '').toLowerCase().includes(buyer.toLowerCase())
        )
        const delivered = matchingChallans.reduce((s: number, d: any) => s + (Number(d.total_pieces) || 0), 0)
        const challanNumbers = matchingChallans.map((d: any) => d.challan_no).filter(Boolean)
        const pct = target > 0 ? Math.min(100, Math.round((delivered / target) * 100)) : 0

        let status = 'In Production'
        if (pct >= 100) status = 'Fully Shipped'
        else if (delivered > 0) status = 'Partially Dispatched'

        return {
          poNumber: po,
          buyerName: buyer,
          orderDate: m.order_date || 'N/A',
          deliveryDate: m.delivery_date || 'N/A',
          targetPieces: target,
          deliveredPieces: delivered,
          godownPieces: Math.max(0, target - delivered),
          challanNumbers,
          percent: pct,
          isOverdue: pct < 100 && Boolean(m.delivery_date && new Date(m.delivery_date).getTime() < Date.now()),
          status
        }
      })

      return {
        companyName,
        allowedDivisions,
        kpis,
        productionTrend,
        dailyAverage,
        qcTrend,
        articlesReport,
        workerLedger,
        divisionComparison,
        buyerFulfillments,
        generatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    } catch (err: any) {
      console.error('Error fetching comprehensive Reports data:', err)
      return {
        companyName: typeof tenantOrCompany === 'string' ? tenantOrCompany : (tenantOrCompany?.companyName || 'Apparel Factory'),
        allowedDivisions: [],
        kpis: {
          totalProduced: 0,
          producedTrendPct: 0,
          qcPassRate: 100,
          qcPassTrendPct: 0,
          netWarehouseStock: 0,
          warehouseTrendPct: 0,
          totalDispatched: 0,
          dispatchTrendPct: 0
        },
        productionTrend: [],
        dailyAverage: 0,
        qcTrend: [],
        articlesReport: [],
        workerLedger: [],
        divisionComparison: [],
        buyerFulfillments: [],
        generatedAt: 'Just now'
      }
    }
  })
}
