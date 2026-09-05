import { createClient } from '../../utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { AdminShell } from '../../components/layout/AdminShell'
import DashboardClient from '../DashboardClient'
import { LogOut, LayoutDashboard } from 'lucide-react'
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
        mending_status,
        mending_total_counted,
        mending_supervisor_name,
        handed_to_mending_by,
        qc_status,
        qc_total_passed,
        qc_total_alter,
        qc_supervisor_name,
        handed_to_qc_by,
        handed_to_qc_at,
        created_at,
        profiles:lineman_id ( id, username ),
        articles:article_id ( id, art_no, description, size_rates, stitching_rate ),
        challans:challan_id ( id, challan_no, brand, fabric_type )
      `)
      .order('created_at', { ascending: false })
      .limit(200),

    supabaseAdmin
      .from('challans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),

    supabaseAdmin
      .from('allotment_variants')
      .select('*')
      .limit(500),

    supabaseAdmin
      .from('daily_product')
      .select(`
        id,
        quantity,
        entry_date,
        created_at,
        article_id,
        lineman_id,
        article:article_id ( id, art_no, description )
      `)
      .order('created_at', { ascending: false })
      .limit(200),

    supabaseAdmin
      .from('qc_logs')
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
      .order('created_at', { ascending: false })
      .limit(200),

    supabaseAdmin
      .from('store_transactions')
      .select(`
        id,
        type,
        quantity,
        party_name,
        created_at,
        article:article_id ( art_no, description )
      `)
      .order('created_at', { ascending: false })
      .limit(200),

    supabaseAdmin
      .from('delivery_challans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),

    supabaseAdmin
      .from('allotment_materials')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
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
      title: (s.type === 'INWARD' ? 'Godown Stock Received' : 'Store Outward'),
      details: s.quantity + ' pcs' + (s.party_name ? ' • ' + s.party_name : ''),
      location: 'Godown Store',
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
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        
        {/* 1. Page Header Card (Standard Admin Card) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Plant Operations Control Center
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                  MES Live
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Real-time 6-stage garment manufacturing floor throughput and inventory lifecycle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <TvViewButton size="md" />

            {/* Sign Out Button: Posts to dedicated /auth/signout to guarantee clean session wipe & prevent Vercel 404s */}
            <form action="/auth/signout" method="POST">
              <button 
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-black/15 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-2xs cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

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

