import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { VendorsClient } from './components/VendorsClient'
import { getBrands, getVendors } from './actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function VendorsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Restrict Store Supervisors from vendor management
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = (userProfile?.role || '').toUpperCase()
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  // Fetch Brands and Vendors concurrently
  const [brands, vendors] = await Promise.all([
    getBrands(),
    getVendors()
  ])

  return (
    <AdminShell userEmail={user.email}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/dashboard" className="hover:text-[#3A3564] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span>Manage</span>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Brands & Vendors Master
          </span>
        </div>

        {/* Vendors Client */}
        <VendorsClient
          brands={brands}
          vendors={vendors}
        />

      </div>
    </AdminShell>
  )
}
