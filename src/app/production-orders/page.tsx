import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProductionOrdersClient } from './components/ProductionOrdersClient'
import { getProductionOrders } from './actions'
import { getBrands, getVendors } from '../vendors/actions'
import Link from 'next/link'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function ProductionOrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve tenant identity
  const tenant = await resolveUserTenant(user)
  const isProvisionedTenant = tenant.isProvisionedTenant && tenant.companyName !== 'Nubira Creation'

  // Restrict Store Supervisors from admin production orders
  const userRole = tenant.role.toUpperCase()
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  // Parallel concurrent data fetching
  const [
    { data: rawArticles },
    { data: rawLinemen },
    allOrders,
    allBrands,
    allVendors
  ] = await Promise.all([
    supabase
      .from('articles')
      .select('id, art_no, description, size_rates, stitching_rate')
      .eq('is_active', true)
      .order('art_no'),
    supabase
      .from('profiles')
      .select('id, username, role, company_name, allowed_modules')
      .eq('role', 'LINEMAN')
      .order('username'),
    getProductionOrders(),
    getBrands(),
    getVendors()
  ])

  // Tenant data isolation: provisioned factories only view their own records
  const filteredOrders = isProvisionedTenant
    ? (allOrders || []).filter(o => o.brand?.toUpperCase().includes(tenant.companyName.toUpperCase()))
    : (allOrders || [])

  const filteredBrands = isProvisionedTenant
    ? (allBrands || []).filter(b => b.brand_name.toUpperCase().includes(tenant.companyName.toUpperCase()))
    : (allBrands || [])

  const filteredVendors = isProvisionedTenant
    ? (allVendors || []).filter(v => v.brand_name.toUpperCase().includes(tenant.companyName.toUpperCase()))
    : (allVendors || [])

  const isCompanyProfileMatch = (p: any) => {
    const pCompany = (p.company_name || '').trim().toLowerCase()
    const currentCompany = (tenant.companyName || '').trim().toLowerCase()
    if (pCompany) {
      return pCompany === currentCompany || (currentCompany.includes('nubira') && pCompany.includes('nubira'))
    }
    return !isProvisionedTenant || currentCompany.includes('nubira')
  }

  const filteredLinemen = (rawLinemen || []).filter(l => {
    if (!isCompanyProfileMatch(l)) return false
    if (Array.isArray(l.allowed_modules) && l.allowed_modules.length > 0) {
      if (!l.allowed_modules.includes('/stitching-sewing')) return false
    }
    return true
  })
  const filteredArticles = isProvisionedTenant ? [] : (rawArticles || [])

  return (
    <AdminShell userEmail={user.email} userRole={userRole}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/stitching-sewing/dashboard" className="hover:text-[#3A3564] transition-colors">
            Sewing Dashboard
          </Link>
          <span>/</span>
          <span>Production</span>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Production & Job Work Challans
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 ml-auto border border-slate-200">
            {tenant.companyName}
          </span>
        </div>

        {/* Digital Production Chart Table & Matrix Client Component */}
        <ProductionOrdersClient 
          initialOrders={filteredOrders} 
          articlesList={filteredArticles} 
          linemenList={filteredLinemen}
          brandsList={filteredBrands}
          vendorsList={filteredVendors}
        />

      </div>
    </AdminShell>
  )
}
