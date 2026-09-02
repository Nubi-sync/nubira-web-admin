import { createClient } from '../../utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { AdminShell } from '../../components/layout/AdminShell'
import DashboardClient from '../DashboardClient'
import { LogOut, Globe } from 'lucide-react'
import Link from 'next/link'
import { TvViewButton } from '../../components/ui/TvViewButton'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return 'Just now'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / (1000 * 60))
  if (mins < 1) return 'Just now'
  if (mins < 60) return mins + ' min ago'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + ' hr' + (hours > 1 ? 's' : '') + ' ago'
  const days = Math.floor(hours / 24)
  return days + ' day' + (days > 1 ? 's' : '') + ' ago'
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all 9 factory datasets concurrently in parallel
  const [
    { data: articlesData },
    { data: allotmentsData },
    { data: challansData },
    { data: variantsData },
    { data: prodData },
    { data: qcData },
    { data: storeData },
    { data: dispatchData },
    { data: materialsData },
  ] = await Promise.all([
    supabaseAdmin
      .from('articles')
      .select('id, art_no, description, stitching_rate, size_rates')
      .eq('is_active', true)
      .order('art_no'),

    supabaseAdmin
      .from('allotments')
      .select(`
        id,
        challan_id,
        lineman_id,
        article_id,
        target_qty,
        status,
        allotment_date,
        created_at,
        profiles:lineman_id ( id, username ),
        articles ( id, art_no, description, size_rates, stitching_rate ),
        challans ( id, challan_no, brand, fabric_type )
      `)
      .order('created_at', { ascending: false }),

    supabaseAdmin
      .from('challans')
      .select('*')
      .order('created_at', { ascending: false }),

    supabaseAdmin
      .from('article_variants')
      .select('*'),

    supabaseAdmin
      .from('production')
      .select(`
        id,
        quantity,
        entry_date,
        created_at,
        article_id,
        lineman_id,
        article:article_id ( id, art_no, description )
      `)
      .order('created_at', { ascending: false }),

    supabaseAdmin
      .from('qc_inspections')
      .select(`
        id,
        qty_passed,
        qty_rejected,
        stage,
        defect_type,
        entry_date,
        created_at,
        article_id,
        article:article_id ( id, art_no, description )
      `)
      .order('created_at', { ascending: false }),

    supabaseAdmin
      .from('store_entries')
      .select(`
        id,
        type,
        quantity,
        color,
        size,
        party_name,
        challan_no,
        entry_date,
        created_at,
        article:article_id ( art_no, description )
      `)
      .order('created_at', { ascending: false }),

    supabaseAdmin
      .from('dispatch_challans')
      .select('*')
      .order('created_at', { ascending: false }),

    supabaseAdmin
      .from('inventory_materials')
      .select('*')
      .order('created_at', { ascending: false })
  ])

  // 9. Synthesize Multi-Stage Activity Stream
  const activities: Array<{
    id: string
    type: 'PRODUCTION' | 'QC' | 'STORE' | 'ALLOTMENT' | 'DISPATCH'
    title: string
    details: string
    location: string
    timestamp: string
    relativeTime: string
  }> = []

  // Stitching Production Events
  ;(prodData || []).forEach(p => {
    const art: any = Array.isArray(p.article) ? p.article[0] : p.article
    activities.push({
      id: 'prod-' + p.id,
      type: 'PRODUCTION',
      title: 'Stitching Completed',
      details: p.quantity + ' pcs • ' + (art?.art_no || 'Article'),
      location: 'Floor Line',
      timestamp: p.created_at,
      relativeTime: formatRelativeTime(p.created_at)
    })
  })

  // QC Inspection Events
  ;(qcData || []).forEach(q => {
    const art: any = Array.isArray(q.article) ? q.article[0] : q.article
    activities.push({
      id: 'qc-' + q.id,
      type: 'QC',
      title: 'QC ' + (q.stage || 'Final').toUpperCase(),
      details: q.qty_passed + ' passed, ' + q.qty_rejected + ' rejected (' + (art?.art_no || 'Article') + ')',
      location: 'QC Station',
      timestamp: q.created_at,
      relativeTime: formatRelativeTime(q.created_at)
    })
  })

  // Store/Godown Stock Entries
  ;(storeData || []).forEach(s => {
    activities.push({
      id: 'store-' + s.id,
      type: 'STORE',
      title: (s.type === 'INWARD' ? 'Fabric Stock Received' : 'Fabric Inward'),
      details: s.quantity + ' units' + (s.challan_no ? ' • Challan ' + s.challan_no : ''),
      location: 'Raw Material Godown',
      timestamp: s.created_at,
      relativeTime: formatRelativeTime(s.created_at)
    })
  })

  // Allotments
  ;(allotmentsData || []).forEach(al => {
    const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
    const lm = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles
    activities.push({
      id: 'allot-' + al.id,
      type: 'ALLOTMENT',
      title: 'Target Allotted',
      details: al.target_qty + ' pcs of ' + (art?.art_no || 'Article') + ' to ' + (lm?.username || 'Lineman'),
      location: 'Floor Line',
      timestamp: al.created_at,
      relativeTime: formatRelativeTime(al.created_at)
    })
  })

  // Dispatches
  ;(dispatchData || []).forEach(d => {
    activities.push({
      id: 'dispatch-' + d.id,
      type: 'DISPATCH',
      title: 'Challan ' + d.challan_no,
      details: (d.buyer_name || 'Buyer') + ' • ' + d.total_pieces + ' pcs dispatched',
      location: 'Dispatch Bay',
      timestamp: d.created_at,
      relativeTime: formatRelativeTime(d.created_at)
    })
  })

  // Sort activities newest first and pick top 6
  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6)

  return (
    <AdminShell userEmail={user.email}>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Top Bar inside content area */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Plant Operations Control Center
              </h1>
              <span className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#3A3564] text-white tracking-wider shadow-2xs">
                MES Live
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1.5">
              Real-time 6-stage garment manufacturing floor throughput and inventory lifecycle
            </p>
          </div>

          <div className="flex items-center gap-3">
            <TvViewButton size="lg" />

            <Link
              href="/?showcase=true"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-black/15 rounded-xl text-sm font-bold text-slate-900 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            >
              <Globe className="w-[18px] h-[18px] text-[#3A3564]" />
              <span>Public Website</span>
            </Link>

            {/* Sign Out Button */}
            <form action={async () => {
              'use server'
              const sb = await createClient()
              await sb.auth.signOut()
              redirect('/login')
            }}>
              <button 
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-black/15 rounded-xl text-sm font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-2xs cursor-pointer"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Enhanced 6-Stage Dashboard Client Component */}
        <DashboardClient
          articles={(articlesData as any) || []}
          allotments={(allotmentsData as any) || []}
          variants={(variantsData as any) || []}
          materials={(materialsData as any) || []}
          challans={(challansData as any) || []}
          rawProduction={(prodData as any) || []}
          rawQC={(qcData as any) || []}
          rawStore={(storeData as any) || []}
          rawDispatch={(dispatchData as any) || []}
          recentActivities={sortedActivities}
        />

      </div>
    </AdminShell>
  )
}
