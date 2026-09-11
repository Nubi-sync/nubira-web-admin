import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { StoreDashboardClient } from './components/StoreDashboardClient'
import Link from 'next/link'
import { Layers, Tag, Truck, ArrowRight, Warehouse, Bot, ShieldCheck, ChevronRight } from 'lucide-react'

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
    { data: readyQcAllotmentsData },
    { data: floorReissuesData },
    { data: workerAssignmentsData }
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
        *,
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
      .limit(60),

    // Floor Accessory Re-issues (Worker Loss & Machine Damage)
    supabase
      .from('floor_accessory_reissues')
      .select(`
        id,
        allotment_id,
        article_id,
        article_no,
        challan_no,
        worker_name,
        lineman_name,
        item_name,
        quantity,
        unit,
        reason,
        channel,
        issued_by,
        notes,
        entry_date,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(150),

    // Recent floor worker assignments for quick worker suggestions
    supabase
      .from('worker_assignments')
      .select('id, allotment_id, worker_name, article_id')
      .order('assigned_at', { ascending: false })
      .limit(200)
  ])

  const articles = (articlesData as any) || []
  const storeTransactions = ((storeTransactionsData as any) || []).map((tx: any) => ({
    ...tx,
    article: Array.isArray(tx.article) ? tx.article[0] : tx.article,
  }))
  const accessories = (accessoriesData as any) || []
  const truckInwards = ((truckInwardsData as any) || []).map((t: any) => {
    let garmentType = t.garment_type
    if (!garmentType && t.notes) {
      const match = t.notes.match(/\[Garment:\s*([^\]]+)\]/i)
      if (match) garmentType = match[1].trim()
    }
    return {
      ...t,
      garment_type: garmentType || null,
    }
  })
  const activeAllotments = ((activeAllotmentsData as any) || []).map((al: any) => {
    let prio = al.priority || 'NORMAL'
    if (prio === 'NORMAL' && al.allotment_materials) {
      for (const m of al.allotment_materials) {
        if (m.notes) {
          try {
            const parsed = JSON.parse(m.notes)
            if (parsed.priority) {
              prio = parsed.priority
              break
            }
          } catch (_) {}
        }
      }
    }
    return {
      ...al,
      priority: prio,
      article: Array.isArray(al.article) ? al.article[0] : al.article,
      lineman: Array.isArray(al.lineman) ? al.lineman[0] : al.lineman,
      challans: Array.isArray(al.challans) ? al.challans[0] : al.challans,
    }
  }).sort((a: any, b: any) => {
    const rank = (p?: string) => (p === 'CRITICAL' ? 0 : p === 'RUSH' ? 1 : 2)
    const diff = rank(a.priority) - rank(b.priority)
    if (diff !== 0) return diff
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  })

  const readyQcAllotments = ((readyQcAllotmentsData as any) || []).map((al: any) => ({
    ...al,
    article: Array.isArray(al.article) ? al.article[0] : al.article,
    lineman: Array.isArray(al.lineman) ? al.lineman[0] : al.lineman,
    challans: Array.isArray(al.challans) ? al.challans[0] : al.challans,
  })).sort((a: any, b: any) => {
    const rank = (p?: string) => (p === 'CRITICAL' ? 0 : p === 'RUSH' ? 1 : 2)
    const diff = rank(a.priority) - rank(b.priority)
    if (diff !== 0) return diff
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  })
  const floorReissues = (floorReissuesData as any) || []
  const workerAssignments = (workerAssignmentsData as any) || []

  const currentUserName = profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Store Supervisor'

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href={profile?.role?.toUpperCase() === 'STORE' ? '/store' : '/dashboard'} className="hover:underline hover:text-slate-900 transition-colors">
              Overview
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-extrabold text-[#3A3564]">
              Store & Godown
            </span>
          </div>

          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Division 11 • Central Store & Finished Export Vault
          </span>
        </div>

        {/* Division 11 Quick Operations Navigation Bar */}
        <div className="bg-white p-2.5 rounded-2xl border border-black/10 shadow-2xs flex items-center gap-2 overflow-x-auto">
          <Link
            href="/store/fabric-godown"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] text-xs font-mono font-bold hover:bg-[#3A3564] hover:text-white transition-all whitespace-nowrap border border-black/10 shadow-2xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fabric Godown & 4-Pt QC</span>
          </Link>

          <Link
            href="/store/trims-warehouse"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] text-xs font-mono font-bold hover:bg-[#3A3564] hover:text-white transition-all whitespace-nowrap border border-black/10 shadow-2xs cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Trims Warehouse (ROL)</span>
          </Link>

          <Link
            href="/store/truck-inwards"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] text-xs font-mono font-bold hover:bg-[#3A3564] hover:text-white transition-all whitespace-nowrap border border-black/10 shadow-2xs cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Truck Inward Gate (GRN)</span>
          </Link>

          <Link
            href="/store/material-issues"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] text-xs font-mono font-bold hover:bg-[#3A3564] hover:text-white transition-all whitespace-nowrap border border-black/10 shadow-2xs cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Material Issues to Floor</span>
          </Link>

          <Link
            href="/store/finished-godown"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] text-xs font-mono font-bold hover:bg-[#3A3564] hover:text-white transition-all whitespace-nowrap border border-black/10 shadow-2xs cursor-pointer"
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Finished Export Bay 3–5</span>
          </Link>

          <Link
            href="/store/zigza-ai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] text-xs font-mono font-bold hover:bg-[#3A3564] hover:text-white transition-all whitespace-nowrap border border-black/10 shadow-2xs cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Zigza AI</span>
          </Link>
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
          floorReissues={floorReissues}
          workerAssignments={workerAssignments}
        />

      </div>
    </AdminShell>
  )
}
