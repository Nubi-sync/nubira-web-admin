import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArticlesClient } from './components/ArticlesClient'
import { fetchArticlesPageDataAction } from './actions'
import Link from 'next/link'

import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
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

  // Restrict Store Supervisors from admin articles management
  const userRole = tenant.role.toUpperCase()
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  // Cached concurrent data fetching for Articles and Lineman Allotment History
  const { rawArticles, rawAllotments, rawChallans, rawProfiles } =
    await fetchArticlesPageDataAction(tenant.companyName)

  const allotments = rawAllotments || []
  const challans = rawChallans || []

  const articles = rawArticles || []
  const profiles = (rawProfiles || []).filter((p: any) => {
    const pComp = (p.company_name || '').trim().toLowerCase()
    const tComp = (tenant.companyName || '').trim().toLowerCase()
    if (pComp) return pComp === tComp
    return !isProvisionedTenant
  })

  return (
    <AdminShell userEmail={user.email} userRole={userRole}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/stitching-sewing/dashboard" className="hover:text-[#3A3564] transition-colors">
            Sewing Dashboard
          </Link>
          <span>/</span>
          <span>Manage</span>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Articles & Lineman History
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 ml-auto border border-slate-200">
            {tenant.companyName}
          </span>
        </div>

        {/* 2. Unified Full-Width Client Component */}
        <ArticlesClient 
          articles={(articles as any) || []}
          allotments={(allotments as any) || []}
          challans={(challans as any) || []}
          profiles={(profiles as any) || []}
        />

      </div>
    </AdminShell>
  )
}
