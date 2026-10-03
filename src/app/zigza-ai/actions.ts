'use server'

import { supabaseAdmin } from '@/utils/supabase/admin'
import { CacheManager } from '@/lib/cache/cache-manager'

export interface MasterAiKpis {
  activeStylesCount: number
  runningOrdersCount: number
  readyStockGodownPieces: number
  dispatchedPieces: number
}

export async function fetchMasterZigzaAiData(companyName?: string): Promise<MasterAiKpis> {
  const normComp = (companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:master_ai_kpis:v1`

  return CacheManager.fetchOrSet<MasterAiKpis>(
    cacheKey,
    async () => {
      try {
        const [
          articlesRes,
          ordersRes,
          inventoryRes,
          dispatchRes
        ] = await Promise.all([
          supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabaseAdmin.from('challans').select('total_pcs, status'),
          supabaseAdmin.from('store_transactions').select('quantity, type'),
          supabaseAdmin.from('delivery_challans').select('total_pieces')
        ])

        const activeStylesCount = articlesRes.count || 0
        const orders = ordersRes.data || []
        const runningOrdersCount = orders.filter(o => o.status !== 'COMPLETED').length

        let readyStockGodownPieces = 0
        const inventory = inventoryRes.data || []
        inventory.forEach(item => {
          const qty = Number(item.quantity) || 0
          if (item.type === 'INWARD') readyStockGodownPieces += qty
          else if (item.type === 'OUTWARD') readyStockGodownPieces -= qty
        })

        const dispatches = dispatchRes.data || []
        const dispatchedPieces = dispatches.reduce((sum, d) => sum + (Number(d.total_pieces) || 0), 0)

        return {
          activeStylesCount,
          runningOrdersCount,
          readyStockGodownPieces: Math.max(0, readyStockGodownPieces),
          dispatchedPieces
        }
      } catch (e) {
        return {
          activeStylesCount: 0,
          runningOrdersCount: 0,
          readyStockGodownPieces: 0,
          dispatchedPieces: 0
        }
      }
    },
    30 // 30 seconds cache
  )
}
