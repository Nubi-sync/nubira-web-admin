import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { InventoryClient } from './components/InventoryClient'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
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

  // 2. Fetch Store Transactions
  const { data: storeTransactions } = await supabase
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
      article:articles(id, art_no, description)
    `)
    .order('created_at', { ascending: false })

  // 3. Fetch Accessories (Raw Materials & Trims)
  const { data: accessories } = await supabase
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

  return (
    <AdminShell userEmail={user.email}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <InventoryClient 
          articles={(articles as any) || []}
          storeTransactions={(storeTransactions as any) || []}
          accessories={(accessories as any) || []}
        />
      </div>
    </div>
    </AdminShell>
  )
}
