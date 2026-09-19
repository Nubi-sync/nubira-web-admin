import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DispatchClient } from './components/DispatchClient'
import Link from 'next/link'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function DispatchPage() {
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

  // Restrict Store Supervisors from admin dispatch management
  const userRole = tenant.role.toUpperCase()
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  // 1. Fetch Articles
  const { data: rawArticles } = await supabase
    .from('articles')
    .select('id, art_no, description')
    .eq('is_active', true)
    .order('art_no')

  // 2. Fetch Delivery Challans with items (with fallback for schema flexibility)
  let rawDeliveryChallans: any[] | null = null
  const { data: dcWithVendor, error: dcErr } = await supabase
    .from('delivery_challans')
    .select(`
      id,
      challan_no,
      buyer_name,
      vendor_id,
      vendor_name,
      destination,
      vehicle_no,
      driver_name,
      driver_phone,
      total_pieces,
      delivery_date,
      created_at,
      status,
      notes,
      spot_notes,
      billed_to_name,
      billed_to_address,
      billed_to_gstin,
      shipping_to_name,
      shipping_to_address,
      total_bags,
      total_order_qty,
      total_delivery_qty,
      total_balance_qty,
      challan_items (
        id,
        article_id,
        color,
        size,
        quantity,
        category,
        product_type,
        order_qty,
        delivery_qty,
        balance_qty,
        article:articles(art_no, description)
      )
    `)
    .order('created_at', { ascending: false })

  if (!dcErr && dcWithVendor) {
    rawDeliveryChallans = dcWithVendor
  } else {
    const { data: dcFallback } = await supabase
      .from('delivery_challans')
      .select(`
        id,
        challan_no,
        buyer_name,
        destination,
        vehicle_no,
        driver_name,
        driver_phone,
        total_pieces,
        delivery_date,
        created_at,
        status,
        notes,
        spot_notes,
        billed_to_name,
        billed_to_address,
        billed_to_gstin,
        shipping_to_name,
        shipping_to_address,
        total_bags,
        total_order_qty,
        total_delivery_qty,
        total_balance_qty,
        challan_items (
          id,
          article_id,
          color,
          size,
          quantity,
          category,
          product_type,
          order_qty,
          delivery_qty,
          balance_qty,
          article:articles(art_no, description)
        )
      `)
      .order('created_at', { ascending: false })
    rawDeliveryChallans = dcFallback
  }

  // 3. Fetch Counting Reports
  const { data: rawCountingReports } = await supabase
    .from('counting_reports')
    .select(`
      id,
      article_id,
      color,
      size,
      counted_qty,
      expected_qty,
      remarks,
      entry_date,
      created_at,
      article:articles(art_no, description)
    `)
    .order('created_at', { ascending: false })

  // 4. Fetch Allotments for Cut Qty reconciliation
  const { data: rawAllotments } = await supabase
    .from('allotments')
    .select(`
      id,
      article_id,
      target_qty,
      allotment_date,
      article:articles(art_no, description),
      challans:challan_id(brand)
    `)
    .order('created_at', { ascending: false })

  // Multi-tenant scoping: provisioned factories only see records tagged to their company
  const deliveryChallans = isProvisionedTenant
    ? (rawDeliveryChallans || []).filter(dc => 
        (dc.billed_to_name && dc.billed_to_name.toUpperCase().includes(tenant.companyName.toUpperCase())) ||
        (dc.notes && dc.notes.toUpperCase().includes(tenant.companyName.toUpperCase()))
      )
    : (rawDeliveryChallans || [])

  const countingReports = rawCountingReports || []
  const articles = rawArticles || []
  const allotments = isProvisionedTenant
    ? (rawAllotments || []).filter(a => (a.challans as any)?.brand?.toUpperCase().includes(tenant.companyName.toUpperCase()))
    : (rawAllotments || [])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={userRole}>
      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
        
        {/* Breadcrumb according to Division 12 Guide */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
          <Link href="/modules" className="hover:text-[#3A3564] transition-colors">
            Workspace Hub
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">
            12. Dispatch & Logistics Hub
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 ml-auto border border-slate-200">
            {tenant.companyName}
          </span>
        </div>

        <DispatchClient 
          articles={(articles as any) || []}
          deliveryChallans={(deliveryChallans as any) || []}
          countingReports={(countingReports as any) || []}
          allotments={(allotments as any) || []}
          companyName={tenant.companyName}
          factoryAddress={tenant.cityState}
        />

      </div>
    </AdminShell>
  )
}
