import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { InventoryClient } from './components/InventoryClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parallel concurrent data fetching for inventory datasets & QC Handshake Approvals
  const [
    { data: articles },
    { data: storeTransactions },
    { data: accessories },
    { data: truckInwardsData },
    { data: pendingQcAllotmentsData }
  ] = await Promise.all([
    supabase
      .from('articles')
      .select('id, art_no, description')
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
          quantity,
          unit,
          status,
          shortage_qty,
          remarks
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100),

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
        store_inward_status,
        admin_approved_at,
        admin_approved_by,
        created_at,
        article:articles(id, art_no, description),
        lineman:profiles!allotments_lineman_id_fkey(id, username),
        challans(id, challan_no, brand, fabric_type),
        allotment_variants(id, color, size, quantity)
      `)
      .or('qc_status.eq.PENDING_ADMIN_APPROVAL,qc_status.eq.APPROVED_FOR_STORE')
      .neq('store_inward_status', 'INWARDED')
      .order('created_at', { ascending: false })
      .limit(60)
  ])

  const truckInwards = truckInwardsData || []
  const pendingQcAllotments = pendingQcAllotmentsData || []

  return (
    <AdminShell userEmail={user.email}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--ink-faint, #8B9AAB)' }}>
          <Link href="/dashboard" className="hover:underline hover:text-[var(--ink,#1C2733)]">
            Production
          </Link>
          <span>/</span>
          <span className="font-semibold" style={{ color: 'var(--steel-dark, #1F3A63)' }}>
            Godown & Inventory
          </span>
        </div>

        <InventoryClient 
          articles={(articles as any) || []}
          storeTransactions={(storeTransactions as any) || []}
          accessories={(accessories as any) || []}
          truckInwards={truckInwards}
          pendingQcAllotments={pendingQcAllotments as any[]}
        />

      </div>
    </AdminShell>
  )
}
