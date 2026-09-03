import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DispatchClient } from './components/DispatchClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DispatchPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch Articles
  const { data: articles } = await supabase
    .from('articles')
    .select('id, art_no, description')
    .eq('is_active', true)
    .order('art_no')

  // 2. Fetch Delivery Challans with items
  const { data: deliveryChallans } = await supabase
    .from('delivery_challans')
    .select(`
      id,
      challan_no,
      buyer_name,
      destination,
      vehicle_no,
      driver_name,
      driver_phone,
      total_pieces,
      delivery_date,
      created_at,
      status,
      notes,
      spot_notes,
      billed_to_name,
      billed_to_address,
      billed_to_gstin,
      shipping_to_name,
      shipping_to_address,
      total_bags,
      total_order_qty,
      total_delivery_qty,
      total_balance_qty,
      challan_items (
        id,
        article_id,
        color,
        size,
        quantity,
        category,
        product_type,
        order_qty,
        delivery_qty,
        balance_qty,
        article:articles(art_no, description)
      )
    `)
    .order('created_at', { ascending: false })

  // 3. Fetch Counting Reports
  const { data: countingReports } = await supabase
    .from('counting_reports')
    .select(`
      id,
      article_id,
      color,
      size,
      counted_qty,
      expected_qty,
      remarks,
      entry_date,
      created_at,
      article:articles(art_no, description)
    `)
    .order('created_at', { ascending: false })

  // 4. Fetch Allotments for Cut Qty reconciliation
  const { data: allotments } = await supabase
    .from('allotments')
    .select(`
      id,
      article_id,
      target_qty,
      allotment_date,
      article:articles(art_no, description)
    `)
    .order('created_at', { ascending: false })

  return (
    <AdminShell userEmail={user.email}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--ink-faint, #8B9AAB)' }}>
          <Link href="/" className="hover:underline hover:text-[var(--ink,#1C2733)]">
            Production
          </Link>
          <span>/</span>
          <span className="font-semibold" style={{ color: 'var(--steel-dark, #1F3A63)' }}>
            Dispatch & Challans
          </span>
        </div>

        <DispatchClient 
          articles={(articles as any) || []}
          deliveryChallans={(deliveryChallans as any) || []}
          countingReports={(countingReports as any) || []}
          allotments={(allotments as any) || []}
        />

      </div>
    </AdminShell>
  )
}
