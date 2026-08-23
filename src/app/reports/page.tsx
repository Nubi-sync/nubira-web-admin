import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsClient } from './components/ReportsClient'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch Daily Product logs (Lineman production)
  const { data: dailyProducts } = await supabase
    .from('daily_product')
    .select(`
      id,
      entry_date,
      quantity,
      notes,
      color,
      size,
      lineman:profiles!daily_product_lineman_id_fkey(username),
      article:articles(art_no, description)
    `)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })

  // 2. Fetch QC logs (Enhanced with Color, Size, Mending lifecycle, and Bulking)
  const { data: qcLogs } = await supabase
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

  // 3. Fetch Store transactions
  const { data: storeTransactions } = await supabase
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

  // 4. Fetch Worker Assignments (Lineman -> Worker distribution)
  const { data: workerAssignments } = await supabase
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

  return (
    <AdminShell userEmail={user.email}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <ReportsClient 
          dailyProducts={(dailyProducts as any) || []}
          qcLogs={(qcLogs as any) || []}
          storeTransactions={(storeTransactions as any) || []}
          workerAssignments={(workerAssignments as any) || []}
        />
      </div>
    </div>
    </AdminShell>
  )
}
