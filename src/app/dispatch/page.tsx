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

  // Parallel concurrent data fetching
  const [
    { data: articles },
    { data: deliveryChallans },
    { data: countingReports },
    { data: allotments }
  ] = await Promise.all([
    supabase
      .from('articles')
      .select('id, art_no, description')
      .eq('is_active', true)
      .order('art_no'),

    supabase
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
        challan_items (
          id,
          article_id,
          color,
          size,
          quantity,
          article:articles(art_no, description)
        )
      `)
      .order('created_at', { ascending: false }),

    supabase
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
      .order('created_at', { ascending: false }),

    supabase
      .from('allotments')
      .select(`
        id,
        article_id,
        target_qty,
        allotment_date,
        article:articles(art_no, description)
      `)
      .order('created_at', { ascending: false })
  ])

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
