import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DispatchClient } from './components/DispatchClient'

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
      challan_items (
        id,
        article_id,
        color,
        size,
        quantity,
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <DispatchClient 
          articles={(articles as any) || []}
          deliveryChallans={(deliveryChallans as any) || []}
          countingReports={(countingReports as any) || []}
        />
      </div>
    </div>
  )
}