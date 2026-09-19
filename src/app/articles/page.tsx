import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArticlesClient } from './components/ArticlesClient'
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

  // Parallel concurrent data fetching for Articles and Lineman Allotment History
  const [
    { data: rawArticles },
    { data: rawAllotments },
    { data: rawChallans },
    { data: rawProfiles }
  ] = await Promise.all([
    supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000),

    supabase
      .from('allotments')
      .select(`
        id,
        challan_id,
        article_id,
        lineman_id,
        target_qty,
        status,
        allotment_date,
        created_at,
        profiles:lineman_id ( id, username, full_name, role ),
        articles:article_id ( id, art_no ),
        challans:challan_id ( id, challan_no, brand, fabric_type )
      `)
      .order('created_at', { ascending: false }),

    supabase
      .from('challans')
      .select('id, challan_no, brand, fabric_type, challan_date, notes, created_at')
      .order('created_at', { ascending: false })
      .limit(100),

    supabase
      .from('profiles')
      .select('id, username, full_name, role, company_name')
      .eq('is_active', true)
  ])

  const allotments = isProvisionedTenant
    ? (rawAllotments || []).filter((a: any) => ((a.challans as any)?.brand || '').toUpperCase().includes(tenant.companyName.toUpperCase()))
    : (rawAllotments || [])

  const challans = isProvisionedTenant
    ? (rawChallans || []).filter((c: any) => (c.brand || '').toUpperCase().includes(tenant.companyName.toUpperCase()))
    : (rawChallans || [])

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
