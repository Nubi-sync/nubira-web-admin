import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DispatchClient } from './components/DispatchClient'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'
import { CacheManager } from '@/lib/cache/cache-manager'

export const dynamic = 'force-dynamic'

interface DispatchPageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function DispatchPage({ searchParams }: DispatchPageProps) {
  const resolvedSearchParams = await searchParams
  const initialTab = resolvedSearchParams?.tab === 'counting' ? 'counting' : 'challans'

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

  const normComp = (tenant.companyName || 'all').toLowerCase().replace(/[^a-z0-9]/g, '_')
  const cacheKey = `company:${normComp}:dispatch:page_data`

  const { articles, deliveryChallans, countingReports, allotments } = await CacheManager.fetchOrSet(
    cacheKey,
    async () => {
      const [
        { data: rawArticles },
        dcRes,
        { data: rawCountingReports },
        { data: rawAllotments }
      ] = await Promise.all([
        // 1. Fetch Articles
        supabase
          .from('articles')
          .select('id, art_no, description')
          .eq('is_active', true)
          .order('art_no'),

        // 2. Fetch Delivery Challans with items
        supabase
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
          .order('created_at', { ascending: false }),

        // 3. Fetch Counting Reports
        supabase
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
          .order('created_at', { ascending: false }),

        // 4. Fetch Allotments for Cut Qty reconciliation
        supabase
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
      ])

      const targetComp = (tenant.companyName || '').trim().toLowerCase()
      const isTargetMatch = (...values: (string | null | undefined)[]) => {
        if (!targetComp) return true
        return values.some(v => {
          if (!v) return false
          const s = v.trim().toLowerCase()
          return s === targetComp || s.includes(targetComp)
        })
      }

      const filteredDc = (dcRes?.data || []).filter((dc: any) =>
        isTargetMatch(dc.buyer_name, dc.billed_to_name, dc.shipping_to_name, dc.notes, dc.spot_notes, dc.company_name)
      )

      const filteredAllotments = (rawAllotments || []).filter((al: any) =>
        isTargetMatch((al.challans as any)?.brand, al.company_name)
      )

      return {
        articles: rawArticles || [],
        deliveryChallans: filteredDc,
        countingReports: rawCountingReports || [],
        allotments: filteredAllotments
      }
    },
    60,
    [`company:${normComp}:dispatch`, 'dispatch_data']
  )

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={userRole} companyName={tenant.companyName}>
      <div className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
        <DispatchClient 
          articles={(articles as any) || []}
          deliveryChallans={(deliveryChallans as any) || []}
          countingReports={(countingReports as any) || []}
          allotments={(allotments as any) || []}
          companyName={tenant.companyName}
          factoryAddress={tenant.cityState}
          initialTab={initialTab}
        />
      </div>
    </AdminShell>
  )
}
