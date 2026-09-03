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

  // Parallel concurrent data fetching
  const [
    { data: articles },
    { data: linemen },
    orders
  ] = await Promise.all([
    supabase
      .from('articles')
      .select('id, art_no, description, size_rates, stitching_rate')
      .eq('is_active', true)
      .order('art_no'),
    supabase
      .from('profiles')
      .select('id, username, role')
      .eq('role', 'LINEMAN')
      .order('username'),
    getProductionOrders()
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
          <span>Production</span>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Production & Job Work Challans
          </span>
        </div>

        {/* Digital Production Chart Table & Matrix Client Component */}
        <ProductionOrdersClient 
          initialOrders={orders || []} 
          articlesList={articles || []} 
          linemenList={linemen || []}
        />

      </div>
    </AdminShell>
  )
}
