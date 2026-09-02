import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import DashboardClient from './DashboardClient'
import { ZigzaLandingPageClient } from './components/ZigzaLandingPageClient'
import { LogOut, Globe } from 'lucide-react'
import Link from 'next/link'

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

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ showcase?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const resolvedParams = searchParams ? await searchParams : {}
  const isShowcase = resolvedParams?.showcase === 'true'

  // If user is not authenticated or explicitly requested showcase, render the Zigza Landing Page
  if (!user || isShowcase) {
    return (
      <ZigzaLandingPageClient
        isAuthenticated={!!user}
        userEmail={user?.email || ''}
      />
    )
  }

  // 0. Fetch Articles
  const { data: articlesData } = await supabaseAdmin
    .from('articles')
    .select('id, art_no, description, stitching_rate, size_rates')
    .eq('is_active', true)
    .order('art_no')

  // 1. Fetch Allotments with Challan & Lineman Metadata (Full Factory Pipeline)
  const { data: allotmentsData } = await supabaseAdmin
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
    .order('created_at', { ascending: false })

  // 1.1 Fetch Allotment Variants
  const { data: variantsData } = await supabaseAdmin
    .from('allotment_variants')
    .select('id, allotment_id, color, size, quantity, completed_qty')

  // 1.2 Fetch Allotment Materials (BOM)
  const { data: materialsData } = await supabaseAdmin
    .from('allotment_materials')
    .select('id, allotment_id, item_name, required_qty, notes')

  // 1.3 Fetch Challans
  const { data: challansData } = await supabaseAdmin
    .from('challans')
    .select('id, challan_no, brand, fabric_type, created_at')
    .order('created_at', { ascending: false })

  // 2. Fetch Production Logs
  const { data: prodData } = await supabaseAdmin
    .from('daily_product')
    .select('id, quantity, entry_date, created_at, article_id, lineman_id, article:articles(id, art_no, description)')
    .order('created_at', { ascending: false })

  // 3. Fetch QC Logs
  const { data: qcData } = await supabaseAdmin
    .from('qc_logs')
    .select(`
      id,
      stage,
      qty_passed,
      qty_rejected,
      defect_type,
      entry_date,
      created_at,
      article_id,
      article:articles(id, art_no, description)
    `)
    .order('created_at', { ascending: false })

  // 4. Fetch Store Transactions
  const { data: storeData } = await supabaseAdmin
    .from('store_transactions')
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
      article:articles(art_no, description)
    `)
    .order('created_at', { ascending: false })

  // 5. Fetch Delivery Challans (Dispatch)
  const { data: dispatchData } = await supabaseAdmin
    .from('delivery_challans')
    .select('id, challan_no, buyer_name, total_pieces, created_at, status')
    .order('created_at', { ascending: false })

  // Build Recent Activity Feed (Top 6 events)
  const activities: Array<{
    id: string
    type: 'QC_PASS' | 'QC_REJECT' | 'STORE_INWARD' | 'DISPATCH' | 'ALLOTMENT'
    title: string
    details: string
    location: string
    timestamp: string
    relativeTime: string
  }> = []

  // Collect from QC logs
  qcData?.slice(0, 4).forEach((q: any) => {
    const artNo = q.article?.art_no || 'Garment Batch'
    if ((q.qty_passed || 0) > 0) {
      activities.push({
        id: 'qc-pass-' + q.id,
        type: 'QC_PASS',
        title: 'QC Passed (' + q.qty_passed + ' pcs)',
        details: artNo + ' • Passed Inspection',
        location: 'Finishing Floor',
        timestamp: q.created_at || q.entry_date,
        relativeTime: formatRelativeTime(q.created_at || q.entry_date)
      })
    }
    if ((q.qty_rejected || 0) > 0) {
      activities.push({
        id: 'qc-rej-' + q.id,
        type: 'QC_REJECT',
        title: 'Defect Tagged (' + q.qty_rejected + ' pcs)',
        details: artNo + ' • ' + (q.defect_type || 'Mending required'),
        location: 'Inspection Line',
        timestamp: q.created_at || q.entry_date,
        relativeTime: formatRelativeTime(q.created_at || q.entry_date)
      })
    }
  })

  // Collect from Store logs
  storeData?.slice(0, 4).forEach((s: any) => {
    const artNo = s.article?.art_no || 'Garment'
    const colorSize = s.color && s.size ? ' • ' + s.color + ' (' + s.size + ')' : ''
    activities.push({
      id: 'store-' + s.id,
      type: 'STORE_INWARD',
      title: s.type === 'INWARD' ? 'Store Inward (+' + s.quantity + ' pcs)' : 'Store Outward (-' + s.quantity + ' pcs)',
      details: artNo + colorSize + ' • ' + (s.party_name || 'Godown Receipt'),
      location: 'Godown Store',
      timestamp: s.created_at || s.entry_date,
      relativeTime: formatRelativeTime(s.created_at || s.entry_date)
    })
  })

  // Collect from Dispatch challans
  dispatchData?.slice(0, 4).forEach((d: any) => {
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
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
          <div>
            <div className="flex items-center gap-2">
              <h1 
                className="text-[24px] font-bold font-[family-name:var(--font-heading)] leading-tight"
                style={{ color: 'var(--ink, #1C2733)' }}
              >
                Plant Operations Control Center
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white tracking-wider">
                MES Live
              </span>
            </div>
            <p 
              className="text-[13px] mt-0.5"
              style={{ color: 'var(--ink-soft, #5B6B7C)' }}
            >
              Real-time 6-stage garment manufacturing floor throughput and inventory lifecycle
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/?showcase=true"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border rounded-[8px] text-[13px] font-semibold transition-colors shadow-2xs hover:border-[var(--steel,#2B4C7E)] hover:text-[var(--steel,#2B4C7E)] cursor-pointer"
              style={{ 
                borderColor: 'var(--border, #E2E8F0)',
                color: 'var(--ink, #1C2733)'
              }}
            >
              <Globe className="w-4 h-4 text-[var(--steel,#2B4C7E)]" />
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
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border rounded-[8px] text-[13px] font-semibold transition-colors shadow-2xs hover:border-[var(--steel,#2B4C7E)] hover:text-[var(--steel,#2B4C7E)] cursor-pointer"
                style={{ 
                  borderColor: 'var(--border, #E2E8F0)',
                  color: 'var(--ink, #1C2733)'
                }}
              >
                <LogOut className="w-4 h-4" />
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
