import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProductionOrdersClient } from './components/ProductionOrdersClient'
import { getProductionOrders } from './actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProductionOrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch all articles for auto-fill & lookup
  const { data: articles } = await supabase
    .from('articles')
    .select('id, art_no, description, size_rates, stitching_rate')
    .eq('is_active', true)
    .order('art_no')

  // 2. Fetch all live production orders
  const orders = await getProductionOrders()

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
            Digital Production Chart
          </span>
        </div>

        {/* Digital Production Chart Table & Matrix Client Component */}
        <ProductionOrdersClient 
          initialOrders={orders || []} 
          articlesList={articles || []} 
        />

      </div>
    </AdminShell>
  )
}
