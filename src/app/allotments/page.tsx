import { Suspense } from 'react'
import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { CreateAllotmentForm } from './components/CreateAllotmentForm'
import { AllotmentList } from './components/AllotmentList'
import { getProductionOrders } from '@/app/production-orders/actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AllotmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Concurrent parallel data fetching
  const [
    { data: linemen },
    { data: managers },
    { data: articles },
    productionOrders,
    { data: allotmentsRaw }
  ] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('id, username')
      .eq('role', 'LINEMAN')
      .eq('is_active', true)
      .order('username'),

    supabaseAdmin
      .from('profiles')
      .select('id, username, role')
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
        created_at,
        profiles:lineman_id ( id, username ),
        articles:article_id ( id, art_no, description, stitching_rate, size_rates ),
        challans:challan_id ( id, challan_no, brand, fabric_type )
      `)
      .order('created_at', { ascending: false })
      .limit(200)
  ])

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
          .select('id, allotment_id, item_name, required_qty, admin_issued, notes')
          .in('allotment_id', allotmentIds)
      : Promise.resolve({ data: [] }),

    allotmentIds.length > 0
      ? supabaseAdmin
          .from('worker_assignments')
          .select('id, allotment_id, worker_name, assigned_qty, completed_qty, operation_name, status')
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
    const achieved = dailyProducts
      ?.filter(dp => 
        dp.lineman_id === al.lineman_id && 
        dp.article_id === al.article_id && 
        dp.entry_date === al.allotment_date
      )
      .reduce((sum, dp) => sum + (dp.quantity || 0), 0) || 0;

    const alVariants = variants.filter(v => v.allotment_id === al.id)
    const alMaterials = materials.filter(m => m.allotment_id === al.id)
    const alAssignments = assignments.filter(a => a.allotment_id === al.id)

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
          if (parsed.priority && !priority) priority = parsed.priority
          if (parsed.client_challan_no && !clientChallanNo) clientChallanNo = parsed.client_challan_no
          if (parsed.sample_photos && samplePhotos.length === 0) samplePhotos = parsed.sample_photos
        } catch (_) {}
      }
    }

    const rawProfile = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles
    const displayUsername = rawProfile?.username && rawProfile.username.toLowerCase() !== 'admin'
      ? rawProfile.username
      : 'Unassigned (Floor Order)'
      
    return {
      ...al,
      profiles: { username: displayUsername },
      manager_name: managerName || 'Production Manager',
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
            Target Allotments
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
        {/* @ts-ignore */}
        <AllotmentList allotments={allotments || []} />

      </div>
    </AdminShell>
  )
}
