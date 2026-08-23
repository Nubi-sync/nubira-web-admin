import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import DashboardClient from './DashboardClient'
import { LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'

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

  // 1. Fetch Production Logs
  const { data: prodData } = await supabase
    .from('daily_product')
    .select('quantity, entry_date, created_at')
    .order('created_at', { ascending: false })

  // 2. Fetch QC Logs
  const { data: qcData } = await supabase
    .from('qc_logs')
    .select(`
      id,
      stage,
      qty_passed,
      qty_rejected,
      defect_type,
      entry_date,
      created_at,
      article:articles(art_no, description)
    `)
    .order('created_at', { ascending: false })

  // 3. Fetch Store Transactions
  const { data: storeData } = await supabase
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

  // 4. Fetch Delivery Challans
  const { data: dispatchData } = await supabase
    .from('delivery_challans')
    .select('id, challan_no, buyer_name, total_pieces, created_at, status')
    .order('created_at', { ascending: false })

  // Calculate Overall Totals
  let totalProduced = 0
  let totalPassed = 0
  let totalRejected = 0
  let totalInward = 0

  prodData?.forEach(row => {
    totalProduced += row.quantity || 0
  })

  qcData?.forEach(row => {
    if (row.stage === 'CHECKING' || row.stage === 'BULKING') {
      totalPassed += row.qty_passed || 0
      totalRejected += row.qty_rejected || 0
    }
  })

  storeData?.forEach(row => {
    if (row.type === 'INWARD') {
      totalInward += row.quantity || 0
    }
  })

  // Build Recent Activity Feed (Top 4 events)
  const activities: Array<{
    id: string
    type: 'QC_PASS' | 'QC_REJECT' | 'STORE_INWARD' | 'DISPATCH'
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

  // Sort activities newest first and pick top 4
  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4)

  return (
    <AdminShell userEmail={user.email}>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Top Bar inside content area */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
          <div>
            <h1 
              className="text-[24px] font-bold font-[family-name:var(--font-fraunces)] leading-tight"
              style={{ color: 'var(--ink, #1C2733)' }}
            >
              Admin Dashboard
            </h1>
            <p 
              className="text-[13px] mt-0.5"
              style={{ color: 'var(--ink-soft, #5B6B7C)' }}
            >
              Welcome back — here's what's moving on the floor today
            </p>
          </div>

          {/* Ghost Sign Out Button */}
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
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
        </header>

        {/* Dashboard Client Component */}
        <DashboardClient
          overallStats={{
            produced: totalProduced,
            passed: totalPassed,
            rejected: totalRejected,
            inward: totalInward
          }}
          rawProduction={prodData || []}
          rawQC={qcData || []}
          recentActivities={sortedActivities}
        />

      </div>
    </AdminShell>
  )
}
