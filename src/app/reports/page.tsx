import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsClient } from './components/ReportsClient'

import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parallel concurrent data fetching
  const [
    { data: dailyProducts },
    { data: qcLogs },
    { data: storeTransactions },
    { data: workerAssignments }
  ] = await Promise.all([
    supabase
      .from('daily_product')
      .select(`
        id,
        entry_date,
        quantity,
        notes,
        color,
        size,
        created_at,
        lineman:profiles!daily_product_lineman_id_fkey(username),
        article:articles(art_no, description)
      `)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(400),

    supabase
      .from('qc_logs')
      .select(`
        id,
        entry_date,
        stage,
        qty_received,
        qty_passed,
        qty_rejected,
        defect_type,
        remarks,
        color,
        size,
        mending_returned_qty,
        mending_scrap_qty,
        mending_status,
        bundle_size,
        total_bundles,
        sent_to_store,
        created_at,
        lineman:profiles!qc_logs_from_lineman_id_fkey(username),
        article:articles(art_no, description)
      `)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(400),

    supabase
      .from('store_transactions')
      .select(`
        id,
        entry_date,
        created_at,
        type,
        quantity,
        party_name,
        article:articles(art_no, description)
      `)
      .order('created_at', { ascending: false })
      .limit(400),

    supabase
      .from('worker_assignments')
      .select(`
        id,
        worker_name,
        assigned_qty,
        completed_qty,
        color,
        size,
        status,
        notes,
        assigned_at,
        completed_at,
        entry_date,
        lineman:profiles!worker_assignments_lineman_id_fkey(username),
        article:articles(art_no, description)
      `)
      .order('entry_date', { ascending: false })
      .order('assigned_at', { ascending: false })
      .limit(400)
  ])

  return (
    <AdminShell userEmail={user.email}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/dashboard" className="hover:text-[#3A3564] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Reports & Analytics
          </span>
        </div>

        {/* 2. Client Reports Component */}
        <ReportsClient 
          dailyProducts={(dailyProducts as any) || []}
          qcLogs={(qcLogs as any) || []}
          storeTransactions={(storeTransactions as any) || []}
          workerAssignments={(workerAssignments as any) || []}
        />

      </div>
    </AdminShell>
  )
}
