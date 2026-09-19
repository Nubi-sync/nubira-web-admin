import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { VendorsClient } from './components/VendorsClient'
import { getBrands, getVendors } from './actions'
import Link from 'next/link'

import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function VendorsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve tenant identity
  const tenant = await resolveUserTenant(user)
  const isProvisionedTenant = tenant.isProvisionedTenant

  // Restrict Store Supervisors from vendor management
  const userRole = tenant.role.toUpperCase()
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  // Fetch Brands and Vendors concurrently
  const [rawBrands, rawVendors] = await Promise.all([
    getBrands(),
    getVendors()
  ])

  const targetCompany = tenant.companyName.toUpperCase()

  const brands = isProvisionedTenant
    ? (rawBrands || []).filter(b => (b.brand_name || '').toUpperCase().includes(targetCompany))
    : (rawBrands || [])

  const vendors = isProvisionedTenant
    ? (rawVendors || []).filter(v => (v.brand_name || '').toUpperCase().includes(targetCompany))
    : (rawVendors || [])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={userRole}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/stitching-sewing/dashboard" className="hover:text-[#3A3564] transition-colors">
            Sewing Dashboard
          </Link>
          <span>/</span>
          <span>Manage</span>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Brands & Vendors Master
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 ml-auto border border-slate-200">
            {tenant.companyName}
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
