import { Suspense } from 'react'
import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { CreateAllotmentForm } from './components/CreateAllotmentForm'
import { AllotmentList } from './components/AllotmentList'
import { getProductionOrders } from '@/app/production-orders/actions'
import Link from 'next/link'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function AllotmentsPage() {
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

  // Restrict Store Supervisors from admin allotments management
  const userRole = tenant.role.toUpperCase()
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  // Concurrent parallel data fetching
  const [
    { data: rawLinemen },
    { data: rawManagers },
    { data: rawArticles },
    allProductionOrders,
    { data: rawAllotments }
  ] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('id, username, role, company_name, allowed_modules')
      .eq('role', 'LINEMAN')
      .eq('is_active', true)
      .order('username'),

    supabaseAdmin
      .from('profiles')
      .select('id, username, role, company_name, allowed_modules')
      .in('role', ['PRODUCTION_MANAGER', 'ADMIN'])
      .eq('is_active', true)
      .order('username'),

    supabaseAdmin
      .from('articles')
      .select('id, art_no, description, stitching_rate, size_rates')
      .eq('is_active', true)
      .order('art_no'),

    getProductionOrders(),

    supabaseAdmin
      .from('allotments')
      .select(`
        id,
        lineman_id,
        article_id,
        target_qty,
        allotment_date,
        status,
        mending_status,
        mending_total_counted,
        mending_supervisor_name,
        mending_supervisor_id,
        handed_to_mending_by,
        handed_to_mending_at,
        mending_handover_notes,
        qc_status,
        qc_total_passed,
        qc_total_alter,
        qc_supervisor_name,
        handed_to_qc_by,
        handed_to_qc_at,
        created_at,
        profiles:lineman_id ( id, username ),
        articles:article_id ( id, art_no, description, stitching_rate, size_rates ),
        challans:challan_id ( id, challan_no, brand, fabric_type )
      `)
      .order('created_at', { ascending: false })
      .limit(200)
  ])

  // Multi-tenant scoping: provisioned factories only see records tagged to their company
  const allotmentsRaw = isProvisionedTenant
    ? (rawAllotments || []).filter(a => (a.challans as any)?.brand?.toUpperCase().includes(tenant.companyName.toUpperCase()))
    : (rawAllotments || [])

  const productionOrders = allProductionOrders || []

  const isCompanyProfileMatch = (p: any) => {
    const pCompany = (p.company_name || '').trim().toLowerCase()
    const currentCompany = (tenant.companyName || '').trim().toLowerCase()
    if (pCompany) {
      return pCompany === currentCompany
    }
    return !isProvisionedTenant
  }

  const linemen = (rawLinemen || []).filter(l => {
    if (!isCompanyProfileMatch(l)) return false
    if (Array.isArray(l.allowed_modules) && l.allowed_modules.length > 0) {
      if (!l.allowed_modules.includes('/stitching-sewing')) return false
    }
    return true
  })

  const managers = (rawManagers || []).filter(m => {
    if (!isCompanyProfileMatch(m)) return false
    // Exclude users whose assigned modules strictly exclude stitching (e.g. cutting master from other tenant)
    if (Array.isArray(m.allowed_modules) && m.allowed_modules.length > 0) {
      const hasStitching = m.allowed_modules.includes('/stitching-sewing') || m.allowed_modules.includes('/modules')
      if (!hasStitching) return false
    }
    return true
  })

  const articles = rawArticles || []

  // Extract unique allotment IDs and dates for parallel child queries
  const rawList = allotmentsRaw || []
  const allotmentIds = rawList.map(a => a.id)
  const allotmentDates = Array.from(new Set(rawList.map(a => a.allotment_date).filter(Boolean)))

  const [
    { data: vData },
    { data: mData },
    { data: aData },
    { data: dailyProducts }
  ] = await Promise.all([
    allotmentIds.length > 0
      ? supabaseAdmin
          .from('allotment_variants')
          .select('id, allotment_id, color, size, quantity, completed_qty')
          .in('allotment_id', allotmentIds)
      : Promise.resolve({ data: [] }),

    allotmentIds.length > 0
      ? supabaseAdmin
          .from('allotment_materials')
          .select('id, allotment_id, item_name, required_qty, admin_issued, lineman_received, lineman_received_at, notes')
          .in('allotment_id', allotmentIds)
      : Promise.resolve({ data: [] }),

    allotmentIds.length > 0
      ? supabaseAdmin
          .from('worker_assignments')
          .select('id, allotment_id, lineman_id, article_id, worker_name, assigned_qty, completed_qty, color, size, status, notes, assigned_at, completed_at, entry_date')
          .in('allotment_id', allotmentIds)
      : Promise.resolve({ data: [] }),

    allotmentDates.length > 0
      ? supabaseAdmin
          .from('daily_product')
          .select('lineman_id, article_id, quantity, entry_date')
          .in('entry_date', allotmentDates)
      : Promise.resolve({ data: [] })
  ])

  const variants = vData || []
  const materials = mData || []
  const assignments = aData || []

  const allotments = (allotmentsRaw || []).map(al => {
    const alVariants = variants.filter(v => v.allotment_id === al.id)
    const alMaterials = materials.filter(m => m.allotment_id === al.id)
    const alAssignments = assignments.filter(a => a.allotment_id === al.id || (!a.allotment_id && a.article_id === al.article_id))

    // Real-time piece counting: sum from worker assignments, variants, status, or daily logs
    const assignmentCompleted = alAssignments.reduce((sum, a) => sum + (Number(a.completed_qty) || 0), 0)
    const variantCompleted = alVariants.reduce((sum, v) => sum + (Number(v.completed_qty) || 0), 0)
    const dailyProductSum = dailyProducts
      ?.filter(dp => 
        dp.lineman_id === al.lineman_id && 
        dp.article_id === al.article_id && 
        dp.entry_date === al.allotment_date
      )
      .reduce((sum, dp) => sum + (dp.quantity || 0), 0) || 0;

    const achieved = Math.max(
      assignmentCompleted,
      variantCompleted,
      al.status === 'COMPLETED' ? (Number(al.target_qty) || 0) : 0,
      dailyProductSum
    )

    // Extract extended metadata from materials notes if available
    let managerName = (al as any).manager_name || ''
    let poNo = (al as any).production_order_no || ''
    let dueDate = (al as any).due_date || ''
    let targetHours = (al as any).target_hours || 16
    let priority = (al as any).priority || 'NORMAL'
    let clientChallanNo = (al as any).client_challan_no || ''
    let samplePhotos = (al as any).sample_photos || []

    for (const m of alMaterials) {
      if (m.notes) {
        try {
          const parsed = JSON.parse(m.notes)
          if (parsed.manager_name && !managerName) managerName = parsed.manager_name
          if (parsed.production_order_no && !poNo) poNo = parsed.production_order_no
          if (parsed.due_date && !dueDate) dueDate = parsed.due_date
          if (parsed.target_hours && !targetHours) targetHours = parsed.target_hours
          if (parsed.priority && priority === 'NORMAL') priority = parsed.priority
          if (parsed.client_challan_no && !clientChallanNo) clientChallanNo = parsed.client_challan_no
          if (parsed.sample_photos && Array.isArray(parsed.sample_photos) && samplePhotos.length === 0) {
            samplePhotos = parsed.sample_photos
          }
        } catch (_) {}
      }
    }

    return {
      id: al.id,
      challan_id: (al as any).challan_id,
      challan_no: (al.challans as any)?.challan_no || 'Internal Order',
      brand: (al.challans as any)?.brand || 'Factory Brand',
      fabric_type: (al.challans as any)?.fabric_type || 'Knit/Woven',
      lineman_id: al.lineman_id,
      lineman_name: (al.profiles as any)?.username || 'Unassigned',
      article_id: al.article_id,
      art_no: (al.articles as any)?.art_no || 'Standard Article',
      description: (al.articles as any)?.description || '',
      stitching_rate: (al.articles as any)?.stitching_rate || 0,
      target_qty: al.target_qty,
      status: al.status,
      allotment_date: al.allotment_date,
      created_at: al.created_at,
      mending_status: al.mending_status,
      mending_total_counted: al.mending_total_counted,
      mending_supervisor_name: al.mending_supervisor_name,
      mending_handover_notes: al.mending_handover_notes,
      qc_status: al.qc_status,
      qc_total_passed: al.qc_total_passed,
      qc_total_alter: al.qc_total_alter,
      qc_supervisor_name: al.qc_supervisor_name,
      manager_name: managerName,
      production_order_no: poNo,
      due_date: dueDate,
      target_hours: targetHours,
      priority: priority,
      client_challan_no: clientChallanNo,
      sample_photos: samplePhotos,
      achieved_qty: achieved,
      variants: alVariants,
      materials: alMaterials,
      assignments: alAssignments
    }
  })

  return (
    <AdminShell userEmail={user.email} userRole={userRole}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          <Link href="/stitching-sewing/dashboard" className="hover:text-[#3A3564] transition-colors">
            Sewing Dashboard
          </Link>
          <span>/</span>
          <span>Production</span>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Target Allotments
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 ml-auto border border-slate-200">
            {tenant.companyName}
          </span>
        </div>

        {/* Section 1: Allotment & Handover Creation Form with Suspense for useSearchParams */}
        <Suspense fallback={<div className="p-8 text-center text-slate-400 font-bold">Loading allotment generator...</div>}>
          <CreateAllotmentForm 
            linemen={(linemen as any) || []} 
            managers={(managers as any) || []}
            articles={(articles as any) || []}
            productionOrders={productionOrders || []} 
          />
        </Suspense>

        {/* Section 2: Allotments List & Live Handshake Status */}
        <AllotmentList 
          allotments={([...allotments].sort((a, b) => {
            const rank = (p?: string) => (p === 'CRITICAL' ? 0 : p === 'RUSH' ? 1 : 2)
            const diff = rank(a.priority) - rank(b.priority)
            if (diff !== 0) return diff
            return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
          })) as any} 
        />

      </div>
    </AdminShell>
  )
}
