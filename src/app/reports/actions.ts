'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { CacheManager } from '@/lib/cache/cache-manager'
import { isLegacyNubiraTenant, ResolvedTenantProfile } from '@/lib/tenant-context'

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

export interface TailorRanking {
  rank: number
  name: string
  pieces: number
  pctOfMax: number
}

export interface StyleRanking {
  rank: number
  artNo: string
  description: string
  pieces: number
  pctOfMax: number
}

export interface WarehouseMovementPoint {
  date: string
  label: string
  inward: number
  outward: number
  net: number
}

export interface BuyerFulfillmentItem {
  poNumber: string
  buyerName: string
  orderDate: string
  deliveryDate: string
  targetPieces: number
  deliveredPieces: number
  percent: number
  isOverdue: boolean
}

export interface FabricUsagePoint {
  fabricType: string
  consumedMeters: number
  remainingMeters: number
}

export interface DivisionScorePoint {
  division: string
  score: number
  metricLabel: string
}

export interface ArticleReportRow {
  id: string
  artNo: string
  description: string
  targetPcs: number
  cutPcs: number
  stitchedPcs: number
  qcPassedPcs: number
  qcFailedPcs: number
  qcRejectRatePct: number
  godownPcs: number
  dispatchedPcs: number
  progressPct: number
}

export interface ReportsData {
  companyName: string
  kpis: ReportKpis
  productionTrend: ProductionTrendPoint[]
  dailyAverage: number
  qcTrend: QcTrendPoint[]
  topTailors: TailorRanking[]
  topStyles: StyleRanking[]
  warehouseMovement: WarehouseMovementPoint[]
  buyerFulfillments: BuyerFulfillmentItem[]
  fabricComparison: FabricUsagePoint[]
  divisionComparison: DivisionScorePoint[]
  articlesReport: ArticleReportRow[]
  generatedAt: string
}

export async function fetchReportsData(
  tenantOrCompany?: ResolvedTenantProfile | string
): Promise<ReportsData> {
  const tenant = typeof tenantOrCompany === 'object' && tenantOrCompany !== null ? tenantOrCompany : null
  const companyName = (tenant ? tenant.companyName : (typeof tenantOrCompany === 'string' ? tenantOrCompany : 'Nubira Creation')) || 'Nubira Creation'
  const isLegacy = tenant ? isLegacyNubiraTenant(tenant) : companyName.toLowerCase().includes('nubira')
  const targetComp = companyName.trim().toLowerCase()

  const normComp = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:reports:analytics:v2`

  return CacheManager.fetchOrSet(cacheKey, async () => {
    try {
      // 1. Articles Query
      let articlesQuery = supabaseAdmin
        .from('articles')
        .select('id, art_no, description, is_active, size_rates')
        .order('art_no', { ascending: true })

      if (!isLegacy) {
        articlesQuery = articlesQuery.or(
          `size_rates->>company_name.ilike.%${targetComp}%,size_rates->_meta->>company_name.ilike.%${targetComp}%,description.ilike.%${targetComp}%`
        )
      }

      // 2. Merchandising Orders Query
      let merchOrdersQuery = supabaseAdmin
        .from('merchandising_orders')
        .select('id, order_number, buyer_name, total_quantity, order_date, delivery_date, status, company_name')
        .limit(200)

      if (!isLegacy) {
        merchOrdersQuery = merchOrdersQuery.ilike('company_name', companyName)
      }

      // 3. Central Fabric Inventory
      let fabricQuery = supabaseAdmin
        .from('central_fabric_inventory')
        .select('id, fabric_type, total_meters, total_rolls, company_name')
        .limit(100)

      if (!isLegacy) {
        fabricQuery = fabricQuery.ilike('company_name', companyName)
      }

      const [articlesRes, merchOrdersRes, fabricRes] = await Promise.all([
        articlesQuery,
        merchOrdersQuery,
        fabricQuery
      ])

      const rawArticles = articlesRes.data || []
      const rawMerch = merchOrdersRes.data || []
      const rawFabric = fabricRes.data || []

      const tenantArticleIds = rawArticles.map(a => a.id).filter(Boolean)
      const tenantMerchOrderIds = rawMerch.map(m => m.id).filter(Boolean)

      // 4. Dependent Queries
      let dailyProdPromise: Promise<any> = Promise.resolve({ data: [] })
      let qcPromise: Promise<any> = Promise.resolve({ data: [] })
      let storePromise: Promise<any> = Promise.resolve({ data: [] })
      let dispatchPromise: Promise<any> = Promise.resolve({ data: [] })
      let cuttingPromise: Promise<any> = Promise.resolve({ data: [] })
      let allotmentsPromise: Promise<any> = Promise.resolve({ data: [] })

      if (isLegacy) {
        dailyProdPromise = supabaseAdmin
          .from('daily_product')
          .select('id, quantity, entry_date, created_at, article_id, lineman:profiles!daily_product_lineman_id_fkey(username), article:articles(art_no, description)')
          .order('entry_date', { ascending: false })
          .limit(800)

        qcPromise = supabaseAdmin
          .from('qc_logs')
          .select('id, qty_passed, qty_rejected, defect_type, entry_date, created_at, article_id, lineman:profiles!qc_logs_from_lineman_id_fkey(username), article:articles(art_no, description)')
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

        cuttingPromise = supabaseAdmin
          .from('cutting_lay_sheets')
          .select('id, actual_cut_pieces, total_plies, created_at')
          .limit(200)

        allotmentsPromise = supabaseAdmin
          .from('allotments')
          .select('id, target_qty, article_id')
          .limit(500)
      } else {
        if (tenantArticleIds.length > 0) {
          dailyProdPromise = supabaseAdmin
            .from('daily_product')
            .select('id, quantity, entry_date, created_at, article_id, lineman:profiles!daily_product_lineman_id_fkey(username), article:articles(art_no, description)')
            .in('article_id', tenantArticleIds)
            .order('entry_date', { ascending: false })
            .limit(800)

          qcPromise = supabaseAdmin
            .from('qc_logs')
            .select('id, qty_passed, qty_rejected, defect_type, entry_date, created_at, article_id, lineman:profiles!qc_logs_from_lineman_id_fkey(username), article:articles(art_no, description)')
            .in('article_id', tenantArticleIds)
            .order('entry_date', { ascending: false })
            .limit(800)

          storePromise = supabaseAdmin
            .from('store_transactions')
            .select('id, type, quantity, entry_date, created_at, party_name, article_id, article:articles(art_no, description)')
            .in('article_id', tenantArticleIds)
            .order('created_at', { ascending: false })
            .limit(800)

          allotmentsPromise = supabaseAdmin
            .from('allotments')
            .select('id, target_qty, article_id')
            .in('article_id', tenantArticleIds)
            .limit(500)
        }

        dispatchPromise = supabaseAdmin
          .from('delivery_challans')
          .select('id, challan_no, buyer_name, total_pieces, destination, status, created_at')
          .ilike('buyer_name', `%${targetComp}%`)
          .order('created_at', { ascending: false })
          .limit(300)

        if (tenantMerchOrderIds.length > 0) {
          cuttingPromise = supabaseAdmin
            .from('cutting_lay_sheets')
            .select('id, actual_cut_pieces, total_plies, created_at, order_id')
            .in('order_id', tenantMerchOrderIds)
            .limit(200)
        }
      }

      const [dailyProdRes, qcRes, storeRes, dispatchRes, cuttingRes, allotmentsRes] = await Promise.all([
        dailyProdPromise,
        qcPromise,
        storePromise,
        dispatchPromise,
        cuttingPromise,
        allotmentsPromise
      ])

      const rawProd = dailyProdRes.data || []
      const rawQc = qcRes.data || []
      const rawStore = storeRes.data || []
      const rawDispatch = dispatchRes.data || []
      const rawCutting = cuttingRes.data || []
      const rawAllotments = allotmentsRes.data || []

      // 1. KPI Aggregation (REAL NUMBERS ONLY)
      const totalProduced = rawProd.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
      const totalPassed = rawQc.reduce((s, q) => s + (Number(q.qty_passed) || 0), 0)
      const totalRejected = rawQc.reduce((s, q) => s + (Number(q.qty_rejected) || 0), 0)
      const totalInspected = totalPassed + totalRejected
      const qcPassRate = totalInspected > 0 ? Number(((totalPassed / totalInspected) * 100).toFixed(1)) : 100

      let netWarehouseStock = 0
      rawStore.forEach(t => {
        const q = Number(t.quantity) || 0
        if (t.type === 'INWARD') netWarehouseStock += q
        else if (t.type === 'OUTWARD') netWarehouseStock -= q
      })
      netWarehouseStock = Math.max(0, netWarehouseStock)

      const totalDispatched = rawDispatch.reduce((s, d) => s + (Number(d.total_pieces) || 0), 0)

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

      // 2. 14-Day Production Trend (REAL DATA ONLY)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const prodTrendMap = new Map<string, number>()
      const qcTrendMap = new Map<string, { passed: number; rejected: number }>()
      const warehouseMoveMap = new Map<string, { inward: number; outward: number }>()

      rawProd.forEach(p => {
        if (!p.entry_date) return
        prodTrendMap.set(p.entry_date, (prodTrendMap.get(p.entry_date) || 0) + (Number(p.quantity) || 0))
      })

      rawQc.forEach(q => {
        if (!q.entry_date) return
        const existing = qcTrendMap.get(q.entry_date) || { passed: 0, rejected: 0 }
        existing.passed += Number(q.qty_passed) || 0
        existing.rejected += Number(q.qty_rejected) || 0
        qcTrendMap.set(q.entry_date, existing)
      })

      rawStore.forEach(s => {
        const dStr = s.entry_date || (s.created_at ? s.created_at.split('T')[0] : '')
        if (!dStr) return
        const existing = warehouseMoveMap.get(dStr) || { inward: 0, outward: 0 }
        const q = Number(s.quantity) || 0
        if (s.type === 'INWARD') existing.inward += q
        else if (s.type === 'OUTWARD') existing.outward += q
        warehouseMoveMap.set(dStr, existing)
      })

      const productionTrend: ProductionTrendPoint[] = []
      const qcTrend: QcTrendPoint[] = []
      const warehouseMovement: WarehouseMovementPoint[] = []

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

        const wEntry = warehouseMoveMap.get(dStr) || { inward: 0, outward: 0 }
        warehouseMovement.push({
          date: dStr,
          label,
          inward: wEntry.inward,
          outward: wEntry.outward,
          net: wEntry.inward - wEntry.outward
        })
      }

      const dailyAverage = Math.round(sumTrendPcs / productionTrend.length)

      // 3. Top Tailors (REAL DATA ONLY)
      const tailorMap = new Map<string, number>()
      rawProd.forEach(p => {
        const tailor = (p.lineman as any)?.username
        if (tailor) {
          tailorMap.set(tailor, (tailorMap.get(tailor) || 0) + (Number(p.quantity) || 0))
        }
      })

      const topTailorsList = Array.from(tailorMap.entries()).map(([name, pcs]) => ({ name, pcs }))
      topTailorsList.sort((a, b) => b.pcs - a.pcs)

      const maxTailorPcs = Math.max(...topTailorsList.map(t => t.pcs), 1)
      const topTailors: TailorRanking[] = topTailorsList.slice(0, 5).map((t, idx) => ({
        rank: idx + 1,
        name: t.name,
        pieces: t.pcs,
        pctOfMax: Math.round((t.pcs / maxTailorPcs) * 100)
      }))

      // 4. Top Styles (REAL DATA ONLY)
      const styleMap = new Map<string, { desc: string; pcs: number }>()
      rawProd.forEach(p => {
        const art = (p.article as any)
        const artNo = art?.art_no
        if (artNo) {
          const existing = styleMap.get(artNo) || { desc: art?.description || 'Garment Style', pcs: 0 }
          existing.pcs += Number(p.quantity) || 0
          styleMap.set(artNo, existing)
        }
      })

      const topStylesList = Array.from(styleMap.entries()).map(([artNo, data]) => ({
        artNo,
        description: data.desc,
        pcs: data.pcs
      }))
      topStylesList.sort((a, b) => b.pcs - a.pcs)

      const maxStylePcs = Math.max(...topStylesList.map(s => s.pcs), 1)
      const topStyles: StyleRanking[] = topStylesList.slice(0, 5).map((s, idx) => ({
        rank: idx + 1,
        artNo: s.artNo,
        description: s.description,
        pieces: s.pcs,
        pctOfMax: Math.round((s.pcs / maxStylePcs) * 100)
      }))

      // 5. Buyer Delivery Fulfillment (REAL DATA ONLY)
      const buyerFulfillments: BuyerFulfillmentItem[] = rawMerch.slice(0, 5).map(m => {
        const target = Number(m.total_quantity) || 0
        const buyer = m.buyer_name || 'Buyer'
        const delivered = rawDispatch
          .filter(d => (d.buyer_name || '').toLowerCase() === buyer.toLowerCase())
          .reduce((s, d) => s + (Number(d.total_pieces) || 0), 0)
        const pct = target > 0 ? Math.min(100, Math.round((delivered / target) * 100)) : 0

        return {
          poNumber: m.order_number || 'PO',
          buyerName: buyer,
          orderDate: m.order_date || 'N/A',
          deliveryDate: m.delivery_date || 'N/A',
          targetPieces: target,
          deliveredPieces: delivered,
          percent: pct,
          isOverdue: pct < 100 && new Date(m.delivery_date).getTime() < Date.now()
        }
      })

      // 6. Fabric Consumption vs Stock (REAL DATA ONLY)
      const fabricComparison: FabricUsagePoint[] = rawFabric.slice(0, 5).map(f => ({
        fabricType: f.fabric_type || 'Fabric',
        consumedMeters: 0,
        remainingMeters: Number(f.total_meters) || 0
      }))

      // 7. Division Comparison Scores (REAL COUNTS)
      const divisionComparison: DivisionScorePoint[] = [
        { division: 'Cutting', score: rawCutting.length > 0 ? 100 : 0, metricLabel: `${rawCutting.length} lay sheets` },
        { division: 'Stitching', score: totalProduced > 0 ? 100 : 0, metricLabel: `${totalProduced} pcs output` },
        { division: 'QC Audit', score: totalInspected > 0 ? qcPassRate : 0, metricLabel: `${totalInspected} audited` },
        { division: 'Warehouse', score: netWarehouseStock > 0 ? 100 : 0, metricLabel: `${netWarehouseStock} in stock` },
        { division: 'Dispatch', score: totalDispatched > 0 ? 100 : 0, metricLabel: `${totalDispatched} shipped` }
      ]

      // 8. Article-Level Report (REAL DATA ONLY)
      const articlesReport: ArticleReportRow[] = rawArticles.map(art => {
        const artId = art.id
        const artAllotmentTarget = rawAllotments
          .filter(a => a.article_id === artId)
          .reduce((s, a) => s + (Number(a.target_qty) || 0), 0)
        const artStitched = rawProd
          .filter(p => p.article_id === artId)
          .reduce((s, p) => s + (Number(p.quantity) || 0), 0)
        const artPassed = rawQc
          .filter(q => q.article_id === artId)
          .reduce((s, q) => s + (Number(q.qty_passed) || 0), 0)
        const artRejected = rawQc
          .filter(q => q.article_id === artId)
          .reduce((s, q) => s + (Number(q.qty_rejected) || 0), 0)
        const artNetStock = rawStore
          .filter(s => s.article_id === artId)
          .reduce((s, tx) => {
            const q = Number(tx.quantity) || 0
            return tx.type === 'INWARD' ? s + q : tx.type === 'OUTWARD' ? s - q : s
          }, 0)

        const tot = artPassed + artRejected
        const rejectRate = tot > 0 ? Number(((artRejected / tot) * 100).toFixed(1)) : 0
        const target = artAllotmentTarget || 0
        const progress = target > 0 ? Math.min(100, Math.round((artStitched / target) * 100)) : (artStitched > 0 ? 100 : 0)

        return {
          id: art.id,
          artNo: art.art_no || 'Art',
          description: art.description || 'Garment Style',
          targetPcs: target,
          cutPcs: 0,
          stitchedPcs: artStitched,
          qcPassedPcs: artPassed,
          qcFailedPcs: artRejected,
          qcRejectRatePct: rejectRate,
          godownPcs: Math.max(0, artNetStock),
          dispatchedPcs: 0,
          progressPct: progress
        }
      })

      return {
        companyName,
        kpis,
        productionTrend,
        dailyAverage,
        qcTrend,
        topTailors,
        topStyles,
        warehouseMovement,
        buyerFulfillments,
        fabricComparison,
        divisionComparison,
        articlesReport,
        generatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    } catch (err: any) {
      console.error('Error fetching Reports data:', err)
      return {
        companyName: typeof tenantOrCompany === 'string' ? tenantOrCompany : (tenantOrCompany?.companyName || 'Apparel Factory'),
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
        topTailors: [],
        topStyles: [],
        warehouseMovement: [],
        buyerFulfillments: [],
        fabricComparison: [],
        divisionComparison: [],
        articlesReport: [],
        generatedAt: 'Just now'
      }
    }
  })
}
