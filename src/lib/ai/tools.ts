import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const GEMINI_TOOLS_DECLARATIONS = [
  {
    name: 'get_factory_kpis',
    description: 'Get high-level factory health summary: total active garment styles, running orders, total pieces to produce, finished stock in godown, and dispatched goods.',
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_articles_catalog',
    description: 'Look up garment styles, stitching rates, descriptions, and article style numbers.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Search term for style number or description (e.g. "101", "Denim", "Shirt")' },
        limit: { type: 'INTEGER', description: 'Maximum number of records to return' }
      },
      required: []
    }
  },
  {
    name: 'get_production_orders',
    description: 'Search cutting and production orders by order/challan number, buyer/brand, or progress status.',
    parameters: {
      type: 'OBJECT',
      properties: {
        challan_no: { type: 'STRING', description: 'Order or challan number' },
        brand: { type: 'STRING', description: 'Buyer or party name' },
        status: { type: 'STRING', description: 'Status: PENDING, IN_PROGRESS, or COMPLETED' },
        limit: { type: 'INTEGER', description: 'Maximum number of orders to return' }
      },
      required: []
    }
  },
  {
    name: 'get_floor_allotments',
    description: 'Check worker and tailor allotments, target pieces given to linemen, and progress.',
    parameters: {
      type: 'OBJECT',
      properties: {
        lineman_name: { type: 'STRING', description: 'Worker or tailor name' },
        challan_no: { type: 'STRING', description: 'Order or challan number' },
        status: { type: 'STRING', description: 'Status: PENDING, IN_PROGRESS, or COMPLETED' }
      },
      required: []
    }
  },
  {
    name: 'get_daily_production',
    description: 'Check daily sewing output, pieces stitched today or on a specific date.',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: { type: 'STRING', description: 'Date (YYYY-MM-DD) or "today"' },
        lineman_name: { type: 'STRING', description: 'Tailor or worker name' },
        art_no: { type: 'STRING', description: 'Style or article number' }
      },
      required: []
    }
  },
  {
    name: 'get_qc_inspections',
    description: 'Check quality checking logs, passed pieces, rejected pieces, and defects.',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: { type: 'STRING', description: 'Date (YYYY-MM-DD) or "today"' },
        stage: { type: 'STRING', description: 'Inspection stage' },
        limit: { type: 'INTEGER', description: 'Max records' }
      },
      required: []
    }
  },
  {
    name: 'get_inventory_stock',
    description: 'Check stock stored in the godown or warehouse, inward receipts, and outward deliveries.',
    parameters: {
      type: 'OBJECT',
      properties: {
        art_no: { type: 'STRING', description: 'Style or article number' },
        transaction_type: { type: 'STRING', description: 'INWARD or OUTWARD' },
        limit: { type: 'INTEGER', description: 'Max records' }
      },
      required: []
    }
  },
  {
    name: 'get_dispatch_history',
    description: 'Check dispatched goods, delivery passes, buyer shipments, and transport details.',
    parameters: {
      type: 'OBJECT',
      properties: {
        buyer_name: { type: 'STRING', description: 'Buyer or company name' },
        challan_no: { type: 'STRING', description: 'Delivery pass number' }
      },
      required: []
    }
  }
]

export async function executeAiTool(name: string, args: Record<string, any>) {
  try {
    switch (name) {
      case 'get_factory_kpis': {
        const [
          articlesRes,
          ordersRes,
          inventoryRes,
          dispatchRes
        ] = await Promise.all([
          supabase.from('articles').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('challans').select('total_pcs, status'),
          supabase.from('store_transactions').select('quantity, type'),
          supabase.from('delivery_challans').select('total_pieces')
        ])

        const activeStyles = articlesRes.count || 0
        const orders = ordersRes.data || []
        const totalOrdersTarget = orders.reduce((sum, o) => sum + (Number(o.total_pcs) || 0), 0)
        const activeOrdersCount = orders.filter(o => o.status !== 'COMPLETED').length
        
        const dispatches = dispatchRes.data || []
        const totalDispatched = dispatches.reduce((sum, d) => sum + (Number(d.total_pieces) || 0), 0)
        
        let godownReadyPieces = 0
        const inventory = inventoryRes.data || []
        inventory.forEach(item => {
          const qty = Number(item.quantity) || 0
          if (item.type === 'INWARD') godownReadyPieces += qty
          else if (item.type === 'OUTWARD') godownReadyPieces -= qty
        })

        return {
          activeGarmentStyles: activeStyles,
          runningOrdersCount: activeOrdersCount,
          totalTargetPieces: totalOrdersTarget,
          readyStockInGodown: Math.max(0, godownReadyPieces),
          totalDispatchedPieces: totalDispatched
        }
      }

      case 'get_articles_catalog': {
        let query = supabase
          .from('articles')
          .select('id, art_no, description, stitching_rate, size_rates, is_active')
          .order('art_no')
          .limit(args.limit || 10)

        if (args.query) {
          query = query.or(`art_no.ilike.%${args.query}%,description.ilike.%${args.query}%`)
        }

        const { data, error } = await query
        if (error) {
          return { totalFound: 0, styles: [], note: 'No matching garment styles found.' }
        }

        const formatted = (data || []).map(a => ({
          styleNumber: a.art_no,
          styleName: a.description || 'General Garment',
          stitchingRate: a.stitching_rate ? `Rs. ${a.stitching_rate}/pc` : 'Standard Rate',
          status: a.is_active ? 'Active' : 'Inactive'
        }))

        return {
          totalFound: formatted.length,
          styles: formatted
        }
      }

      case 'get_production_orders': {
        let query = supabase
          .from('challans')
          .select('id, challan_no, brand, challan_date, delivery_date, fabric_type, total_pcs, status')
          .order('created_at', { ascending: false })
          .limit(args.limit || 10)

        if (args.challan_no) query = query.ilike('challan_no', `%${args.challan_no}%`)
        if (args.brand) query = query.ilike('brand', `%${args.brand}%`)
        if (args.status) query = query.eq('status', args.status)

        const { data, error } = await query
        if (error) {
          return { totalOrders: 0, orders: [], note: 'No production orders found.' }
        }

        const formatted = (data || []).map(o => ({
          orderNumber: o.challan_no,
          buyerName: o.brand || 'Direct Buyer',
          orderDate: o.challan_date || 'N/A',
          deliveryDate: o.delivery_date || 'N/A',
          totalPieces: Number(o.total_pcs) || 0,
          status: o.status || 'IN_PROGRESS'
        }))

        return {
          totalOrders: formatted.length,
          orders: formatted
        }
      }

      case 'get_floor_allotments': {
        let query = supabase
          .from('allotments')
          .select(`
            id, target_qty, status, allotment_date,
            profiles:lineman_id ( username ),
            articles:article_id ( art_no, description ),
            challans:challan_id ( challan_no, brand )
          `)
          .order('created_at', { ascending: false })
          .limit(15)

        if (args.status) query = query.eq('status', args.status)

        const { data, error } = await query
        if (error) {
          return { totalAllotments: 0, allotments: [], note: 'No worker allotments found.' }
        }

        let filtered = data || []
        if (args.lineman_name) {
          const nameLower = args.lineman_name.toLowerCase()
          filtered = filtered.filter(a => ((a.profiles as any)?.username || '').toLowerCase().includes(nameLower))
        }
        if (args.challan_no) {
          const chLower = args.challan_no.toLowerCase()
          filtered = filtered.filter(a => ((a.challans as any)?.challan_no || '').toLowerCase().includes(chLower))
        }

        const formatted = filtered.map(a => ({
          tailorOrWorker: (a.profiles as any)?.username || 'Assigned Worker',
          styleNumber: (a.articles as any)?.art_no || 'N/A',
          styleName: (a.articles as any)?.description || '',
          orderNumber: (a.challans as any)?.challan_no || 'N/A',
          targetPieces: Number(a.target_qty) || 0,
          status: a.status || 'IN_PROGRESS'
        }))

        return {
          totalAllotments: formatted.length,
          allotments: formatted
        }
      }

      case 'get_daily_production': {
        let query = supabase
          .from('daily_product')
          .select(`
            id, quantity, entry_date, created_at, color, size,
            articles:article_id ( art_no, description ),
            profiles:lineman_id ( username )
          `)
          .order('entry_date', { ascending: false })
          .limit(20)

        const todayStr = new Date().toISOString().split('T')[0]
        if (args.date === 'today') query = query.eq('entry_date', todayStr)
        else if (args.date) query = query.eq('entry_date', args.date)

        const { data, error } = await query
        if (error) {
          return { totalPiecesStitched: 0, recordsCount: 0, logs: [], note: 'No sewing entries found for this date.' }
        }

        let filtered = data || []
        if (args.lineman_name) {
          const nameLower = args.lineman_name.toLowerCase()
          filtered = filtered.filter(p => ((p.profiles as any)?.username || '').toLowerCase().includes(nameLower))
        }
        if (args.art_no) {
          const artLower = args.art_no.toLowerCase()
          filtered = filtered.filter(p => ((p.articles as any)?.art_no || '').toLowerCase().includes(artLower))
        }

        const totalPieces = filtered.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)

        const formatted = filtered.map(p => ({
          tailorName: (p.profiles as any)?.username || 'Floor Worker',
          styleNumber: (p.articles as any)?.art_no || 'N/A',
          color: p.color || 'Standard',
          size: p.size || 'Standard',
          piecesStitched: Number(p.quantity) || 0,
          date: p.entry_date || 'Today'
        }))

        return {
          totalPiecesStitched: totalPieces,
          recordsCount: formatted.length,
          logs: formatted
        }
      }

      case 'get_qc_inspections': {
        let query = supabase
          .from('qc_logs')
          .select(`
            id, qty_passed, qty_rejected, defect_type, stage, remarks, entry_date, created_at, color, size,
            articles:article_id ( art_no ),
            profiles:from_lineman_id ( username )
          `)
          .order('entry_date', { ascending: false })
          .limit(args.limit || 15)

        const todayStr = new Date().toISOString().split('T')[0]
        if (args.date === 'today') query = query.eq('entry_date', todayStr)
        else if (args.date) query = query.eq('entry_date', args.date)
        if (args.stage) query = query.eq('stage', args.stage)

        const { data, error } = await query
        if (error) {
          return { totalPassedPieces: 0, totalRejectedPieces: 0, inspectionsCount: 0, note: 'No quality checking logs found.' }
        }

        const totalPassed = (data || []).reduce((s, r) => s + (Number(r.qty_passed) || 0), 0)
        const totalRejected = (data || []).reduce((s, r) => s + (Number(r.qty_rejected) || 0), 0)

        const formatted = (data || []).map(r => ({
          styleNumber: (r.articles as any)?.art_no || 'N/A',
          tailor: (r.profiles as any)?.username || 'Worker',
          passedPieces: Number(r.qty_passed) || 0,
          rejectedPieces: Number(r.qty_rejected) || 0,
          defectReason: r.defect_type || r.remarks || 'Minor Alteration',
          date: r.entry_date || 'Recent'
        }))

        return {
          totalPassedPieces: totalPassed,
          totalRejectedPieces: totalRejected,
          inspectionsCount: formatted.length,
          logs: formatted
        }
      }

      case 'get_inventory_stock': {
        let query = supabase
          .from('store_transactions')
          .select(`
            id, quantity, type, party_name, notes, created_at, entry_date, color, size, challan_no,
            articles:article_id ( art_no, description )
          `)
          .order('created_at', { ascending: false })
          .limit(args.limit || 15)

        if (args.transaction_type && args.transaction_type !== 'ALL') {
          query = query.eq('type', args.transaction_type)
        }

        const { data, error } = await query
        if (error) {
          return { totalTransactions: 0, stockRecords: [], note: 'No warehouse stock transactions found.' }
        }

        let filtered = data || []
        if (args.art_no) {
          const artLower = args.art_no.toLowerCase()
          filtered = filtered.filter(item => ((item.articles as any)?.art_no || '').toLowerCase().includes(artLower))
        }

        const formatted = filtered.map(item => ({
          styleNumber: (item.articles as any)?.art_no || 'N/A',
          styleName: (item.articles as any)?.description || '',
          pieces: Number(item.quantity) || 0,
          movement: item.type === 'INWARD' ? 'Received into Godown' : 'Dispatched out of Godown',
          partyOrChallan: item.party_name || item.challan_no || 'Factory Floor'
        }))

        return {
          totalTransactions: formatted.length,
          stockRecords: formatted
        }
      }

      case 'get_dispatch_history': {
        let query = supabase
          .from('delivery_challans')
          .select('id, challan_no, buyer_name, total_pieces, destination, vehicle_no, driver_name, driver_phone, status, created_at')
          .order('created_at', { ascending: false })
          .limit(10)

        if (args.buyer_name) query = query.ilike('buyer_name', `%${args.buyer_name}%`)
        if (args.challan_no) query = query.ilike('challan_no', `%${args.challan_no}%`)

        const { data, error } = await query
        if (error) {
          return { totalDispatches: 0, dispatches: [], note: 'No dispatch challans found.' }
        }

        const formatted = (data || []).map(d => ({
          deliveryChallanNo: d.challan_no,
          buyerName: d.buyer_name || 'Buyer',
          destinationCity: d.destination || 'N/A',
          totalPieces: Number(d.total_pieces) || 0,
          vehicleNumber: d.vehicle_no || 'N/A',
          status: d.status || 'DISPATCHED'
        }))

        return {
          totalDispatches: formatted.length,
          dispatches: formatted
        }
      }

      default:
        return { note: `No specific information found for ${name.replace(/_/g, ' ')}.` }
    }
  } catch (err: any) {
    return { note: 'Unable to fetch data from the floor database right now. Please try again in a moment.' }
  }
}
