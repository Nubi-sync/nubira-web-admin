import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const GEMINI_TOOLS_DECLARATIONS = [
  {
    name: 'get_factory_kpis',
    description: 'Get high-level factory health KPIs: total orders, WIP pieces in line, ready stock in godown, total dispatched, and active articles.',
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_articles_catalog',
    description: 'Look up article styles, rates (stitching/job work rate), descriptions, and size-color matrices.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Search term for article number or style description (e.g. "101", "Denim", "Polo")' },
        limit: { type: 'INTEGER', description: 'Max number of records (default 10)' }
      },
      required: []
    }
  },
  {
    name: 'get_production_orders',
    description: 'Search delivery challans and cutting orders by challan number, party/brand, status, or date.',
    parameters: {
      type: 'OBJECT',
      properties: {
        challan_no: { type: 'STRING', description: 'Challan number (e.g. "CH-102")' },
        brand: { type: 'STRING', description: 'Buyer or brand name (e.g. "Sparky", "Killer", "Direct")' },
        status: { type: 'STRING', description: 'Order status: "PENDING", "IN_PROGRESS", or "COMPLETED"' },
        limit: { type: 'INTEGER', description: 'Max number of orders to return (default 10)' }
      },
      required: []
    }
  },
  {
    name: 'get_floor_allotments',
    description: 'Check lineman assignments, who is stitching which article lot, target quantities, and allotment dates.',
    parameters: {
      type: 'OBJECT',
      properties: {
        lineman_name: { type: 'STRING', description: 'Name of the lineman or worker' },
        challan_no: { type: 'STRING', description: 'Challan number filter' },
        status: { type: 'STRING', description: 'Status: "PENDING", "IN_PROGRESS", "COMPLETED"' }
      },
      required: []
    }
  },
  {
    name: 'get_daily_production',
    description: 'Fetch daily sewing machine production logs, quantities stitched by lineman or article.',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: { type: 'STRING', description: 'ISO date string (YYYY-MM-DD) or "today"' },
        lineman_name: { type: 'STRING', description: 'Filter by specific lineman name' },
        art_no: { type: 'STRING', description: 'Filter by article number' }
      },
      required: []
    }
  },
  {
    name: 'get_qc_inspections',
    description: 'Fetch quality control inspection records, defect types, passed vs rejected piece quantities.',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: { type: 'STRING', description: 'ISO date (YYYY-MM-DD) or "today"' },
        stage: { type: 'STRING', description: 'Inspection stage: "CHECKING", "MENDING", "FINISHING"' },
        limit: { type: 'INTEGER', description: 'Number of records to return (default 10)' }
      },
      required: []
    }
  },
  {
    name: 'get_inventory_stock',
    description: 'Check finished goods in Godown inventory, inward receipts, or outward delivery dispatches.',
    parameters: {
      type: 'OBJECT',
      properties: {
        art_no: { type: 'STRING', description: 'Article number to look up in Godown' },
        transaction_type: { type: 'STRING', description: '"INWARD", "OUTWARD", or "ALL"' },
        limit: { type: 'INTEGER', description: 'Max records (default 15)' }
      },
      required: []
    }
  },
  {
    name: 'get_dispatch_history',
    description: 'Fetch delivery challans dispatched out of the factory to buyers, including total pieces and gate pass logs.',
    parameters: {
      type: 'OBJECT',
      properties: {
        buyer_name: { type: 'STRING', description: 'Buyer or recipient name' },
        challan_no: { type: 'STRING', description: 'Dispatch challan number' }
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
          { count: activeArticles },
          { data: orders },
          { data: inventory },
          { data: dispatch }
        ] = await Promise.all([
          supabase.from('articles').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('challans').select('total_pcs, status'),
          supabase.from('store_inventory').select('quantity, transaction_type'),
          supabase.from('dispatch_challans').select('total_pieces')
        ])

        const totalOrdersTarget = (orders || []).reduce((sum, o) => sum + (Number(o.total_pcs) || 0), 0)
        const totalDispatched = (dispatch || []).reduce((sum, d) => sum + (Number(d.total_pieces) || 0), 0)
        
        let godownReadyPieces = 0
        ;(inventory || []).forEach(item => {
          if (item.transaction_type === 'INWARD') godownReadyPieces += (Number(item.quantity) || 0)
          else if (item.transaction_type === 'OUTWARD') godownReadyPieces -= (Number(item.quantity) || 0)
        })

        return {
          activeArticlesCount: activeArticles || 0,
          totalOrderTargetPieces: totalOrdersTarget,
          godownReadyStockPieces: Math.max(0, godownReadyPieces),
          totalDispatchedPieces: totalDispatched,
          activeOrdersCount: (orders || []).filter(o => o.status !== 'COMPLETED').length
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
        if (error) return { error: error.message }
        return { articles: data || [] }
      }

      case 'get_production_orders': {
        let query = supabase
          .from('challans')
          .select(`
            id, challan_no, brand, challan_date, delivery_date, fabric_type, total_pcs, status,
            allotments ( lineman_id, target_qty, status )
          `)
          .order('created_at', { ascending: false })
          .limit(args.limit || 10)

        if (args.challan_no) query = query.ilike('challan_no', `%${args.challan_no}%`)
        if (args.brand) query = query.ilike('brand', `%${args.brand}%`)
        if (args.status) query = query.eq('status', args.status)

        const { data, error } = await query
        if (error) return { error: error.message }
        return { orders: data || [] }
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
        if (error) return { error: error.message }

        let filtered = data || []
        if (args.lineman_name) {
          const nameLower = args.lineman_name.toLowerCase()
          filtered = filtered.filter(a => ((a.profiles as any)?.username || '').toLowerCase().includes(nameLower))
        }
        if (args.challan_no) {
          const chLower = args.challan_no.toLowerCase()
          filtered = filtered.filter(a => ((a.challans as any)?.challan_no || '').toLowerCase().includes(chLower))
        }

        return { allotments: filtered }
      }

      case 'get_daily_production': {
        let query = supabase
          .from('production')
          .select(`
            id, quantity, entry_date, created_at,
            article:article_id ( art_no, description ),
            lineman:lineman_id ( username )
          `)
          .order('entry_date', { ascending: false })
          .limit(20)

        const todayStr = new Date().toISOString().split('T')[0]
        if (args.date === 'today') query = query.eq('entry_date', todayStr)
        else if (args.date) query = query.eq('entry_date', args.date)

        const { data, error } = await query
        if (error) return { error: error.message }

        let filtered = data || []
        if (args.lineman_name) {
          const nameLower = args.lineman_name.toLowerCase()
          filtered = filtered.filter(p => ((p.lineman as any)?.username || '').toLowerCase().includes(nameLower))
        }
        if (args.art_no) {
          const artLower = args.art_no.toLowerCase()
          filtered = filtered.filter(p => ((p.article as any)?.art_no || '').toLowerCase().includes(artLower))
        }

        const totalPiecesStitched = filtered.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)

        return {
          totalPiecesStitched,
          recordsCount: filtered.length,
          logs: filtered
        }
      }

      case 'get_qc_inspections': {
        let query = supabase
          .from('qc_inspections')
          .select(`
            id, qty_passed, qty_rejected, defect_type, stage, remarks, inspection_date,
            article:article_id ( art_no ),
            lineman:lineman_id ( username )
          `)
          .order('inspection_date', { ascending: false })
          .limit(args.limit || 15)

        const todayStr = new Date().toISOString().split('T')[0]
        if (args.date === 'today') query = query.eq('inspection_date', todayStr)
        else if (args.date) query = query.eq('inspection_date', args.date)
        if (args.stage) query = query.eq('stage', args.stage)

        const { data, error } = await query
        if (error) return { error: error.message }

        const totalPassed = (data || []).reduce((s, r) => s + (Number(r.qty_passed) || 0), 0)
        const totalRejected = (data || []).reduce((s, r) => s + (Number(r.qty_rejected) || 0), 0)

        return {
          totalPassed,
          totalRejected,
          inspections: data || []
        }
      }

      case 'get_inventory_stock': {
        let query = supabase
          .from('store_inventory')
          .select(`
            id, quantity, transaction_type, source_party, notes, created_at,
            article:article_id ( art_no, description ),
            variant:variant_id ( color, size )
          `)
          .order('created_at', { ascending: false })
          .limit(args.limit || 15)

        if (args.transaction_type && args.transaction_type !== 'ALL') {
          query = query.eq('transaction_type', args.transaction_type)
        }

        const { data, error } = await query
        if (error) return { error: error.message }

        let filtered = data || []
        if (args.art_no) {
          const artLower = args.art_no.toLowerCase()
          filtered = filtered.filter(item => ((item.article as any)?.art_no || '').toLowerCase().includes(artLower))
        }

        return { transactions: filtered }
      }

      case 'get_dispatch_history': {
        let query = supabase
          .from('dispatch_challans')
          .select(`
            id, challan_no, buyer_name, total_pieces, transport_mode, vehicle_number, created_at
          `)
          .order('created_at', { ascending: false })
          .limit(10)

        if (args.buyer_name) query = query.ilike('buyer_name', `%${args.buyer_name}%`)
        if (args.challan_no) query = query.ilike('challan_no', `%${args.challan_no}%`)

        const { data, error } = await query
        if (error) return { error: error.message }
        return { dispatches: data || [] }
      }

      default:
        return { error: `Tool ${name} not found` }
    }
  } catch (err: any) {
    return { error: err.message || 'Error executing tool' }
  }
}
