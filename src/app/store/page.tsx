import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { StoreDashboardClient } from './components/StoreDashboardClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StoreDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch current user's profile for display & role context
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', user.id)
    .single()

  // Parallel concurrent data fetching for store metrics & handshakes
  const [
    { data: articlesData },
    { data: storeTransactionsData },
    { data: accessoriesData },
    { data: truckInwardsData },
    { data: activeAllotmentsData },
    { data: readyQcAllotmentsData }
  ] = await Promise.all([
    supabase
      .from('articles')
      .select('id, art_no, description, stitching_rate, is_active')
      .eq('is_active', true)
      .order('art_no'),

    supabase
      .from('store_transactions')
      .select(`
        id,
        entry_date,
        created_at,
        type,
        quantity,
        color,
        size,
        party_name,
        challan_no,
        transport_no,
        notes,
        lineman_name,
        mending_name,
        qc_supervisor_name,
        receiver_name,
        allotment_id,
        challan_id,
        article:articles(id, art_no, description)
      `)
      .order('created_at', { ascending: false })
      .limit(300),

    supabase
      .from('accessories')
      .select(`
        id,
        entry_date,
        created_at,
        item_name,
        action,
        quantity,
        unit,
        party_name,
        notes
      `)
      .order('created_at', { ascending: false })
      .limit(300),

    supabase
      .from('truck_inwards')
      .select(`
        id,
        grn_no,
        party_name,
        article_no,
        challan_no,
        inward_date,
        truck_no,
        challan_photo_url,
        receiver_name,
        status,
        total_items,
        due_items_count,
        shortage_items_count,
        notes,
        line_items,
        created_at,
        items:truck_inward_items(
          id,
          item_name,
          size_label,
          size_color,
          quantity,
          challan_qty,
          unit,
          status,
          shortage_qty,
          remarks
        )
      `)
      .order('created_at', { ascending: false })
      .limit(60),

    // Active allotments for BOM Handover inspection
    supabase
      .from('allotments')
      .select(`
        id,
        target_qty,
        allotment_date,
        status,
        created_at,
        article:articles(id, art_no, description),
        lineman:profiles!allotments_lineman_id_fkey(id, username),
        challans(id, challan_no, brand, fabric_type),
        allotment_variants(id, color, size, quantity),
        allotment_materials(
          id,
          allotment_id,
          item_name,
          required_qty,
          admin_issued,
          lineman_received,
          notes,
          created_at
        )
      `)
      .eq('status', 'IN_PROGRESS')
      .order('created_at', { ascending: false })
      .limit(80),

    // Ready QC Allotments for Production Inward Handshake
    supabase
      .from('allotments')
      .select(`
        id,
        target_qty,
        qc_total_passed,
        qc_total_alter,
        qc_status,
        qc_supervisor_name,
        qc_passed_at,
        mending_supervisor_name,
        store_inward_status,
        admin_approved_at,
        admin_approved_by,
        created_at,
        article:articles(id, art_no, description),
        lineman:profiles!allotments_lineman_id_fkey(id, username),
        challans(id, challan_no, brand, fabric_type),
        allotment_variants(id, color, size, quantity)
      `)
      .or('qc_status.eq.APPROVED_FOR_STORE,qc_status.eq.READY_FOR_STORE')
      .neq('store_inward_status', 'INWARDED')
      .order('created_at', { ascending: false })
      .limit(60)
  ])

  const articles = (articlesData as any) || []
  const storeTransactions = ((storeTransactionsData as any) || []).map((tx: any) => ({
    ...tx,
    article: Array.isArray(tx.article) ? tx.article[0] : tx.article,
  }))
  const accessories = (accessoriesData as any) || []
  const truckInwards = (truckInwardsData as any) || []
  const activeAllotments = ((activeAllotmentsData as any) || []).map((al: any) => ({
    ...al,
    article: Array.isArray(al.article) ? al.article[0] : al.article,
    lineman: Array.isArray(al.lineman) ? al.lineman[0] : al.lineman,
    challans: Array.isArray(al.challans) ? al.challans[0] : al.challans,
  }))
  const readyQcAllotments = ((readyQcAllotmentsData as any) || []).map((al: any) => ({
    ...al,
    article: Array.isArray(al.article) ? al.article[0] : al.article,
    lineman: Array.isArray(al.lineman) ? al.lineman[0] : al.lineman,
    challans: Array.isArray(al.challans) ? al.challans[0] : al.challans,
  }))

  const currentUserName = profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Store Supervisor'

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Breadcrumb Bar */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href={profile?.role?.toUpperCase() === 'STORE' ? '/store' : '/dashboard'} className="hover:underline hover:text-slate-900 transition-colors">
            Overview
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-extrabold text-[#3A3564]">
            Store & Godown
          </span>
        </div>

        {/* Client Interactive Dashboard */}
        <StoreDashboardClient
          currentUserName={currentUserName}
          userEmail={user.email || ''}
          articles={articles}
          storeTransactions={storeTransactions}
          accessories={accessories}
          truckInwards={truckInwards}
          activeAllotments={activeAllotments}
          readyQcAllotments={readyQcAllotments}
        />

      </div>
    </AdminShell>
  )
}
