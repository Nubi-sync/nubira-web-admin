import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateAllotmentForm } from './components/CreateAllotmentForm'
import { AllotmentList } from './components/AllotmentList'
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

  // 1. Fetch active linemen
  const { data: linemen } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('role', 'LINEMAN')
    .eq('is_active', true)
    .order('username')

  // 2. Fetch active articles with stitching rate
  const { data: articles } = await supabase
    .from('articles')
    .select('id, art_no, description, stitching_rate')
    .eq('is_active', true)
    .order('art_no')

  // 3. Fetch Allotments
  const { data: allotmentsRaw } = await supabase
    .from('allotments')
    .select(`
      id,
      lineman_id,
      article_id,
      target_qty,
      allotment_date,
      status,
      profiles ( username ),
      articles ( art_no, description, stitching_rate )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const allotmentIds = allotmentsRaw?.map(a => a.id) || []

  // 4. Fetch variants for these allotments
  let variants: any[] = []
  if (allotmentIds.length > 0) {
    const { data: vData } = await supabase
      .from('allotment_variants')
      .select('id, allotment_id, color, size, quantity, completed_qty')
      .in('allotment_id', allotmentIds)
    variants = vData || []
  }

  // 5. Fetch materials for these allotments
  let materials: any[] = []
  if (allotmentIds.length > 0) {
    const { data: mData } = await supabase
      .from('allotment_materials')
      .select('id, allotment_id, item_name, required_qty, admin_issued, lineman_received, lineman_received_at')
      .in('allotment_id', allotmentIds)
    materials = mData || []
  }

  // 6. Calculate achieved_qty for each allotment based on daily_product
  const allotmentDates = [...new Set(allotmentsRaw?.map(a => a.allotment_date) || [])]
  const { data: dailyProducts } = await supabase
    .from('daily_product')
    .select('lineman_id, article_id, quantity, entry_date')
    .in('entry_date', allotmentDates.length > 0 ? allotmentDates : [''])

  const allotments = allotmentsRaw?.map(al => {
    const achieved = dailyProducts
      ?.filter(dp => 
        dp.lineman_id === al.lineman_id && 
        dp.article_id === al.article_id && 
        dp.entry_date === al.allotment_date
      )
      .reduce((sum, dp) => sum + (dp.quantity || 0), 0) || 0;

    const alVariants = variants.filter(v => v.allotment_id === al.id)
    const alMaterials = materials.filter(m => m.allotment_id === al.id)
      
    return {
      ...al,
      achieved_qty: achieved,
      variants: alVariants,
      materials: alMaterials
    }
  })

  return (
    <AdminShell userEmail={user.email}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--ink-faint, #8B9AAB)' }}>
          <Link href="/" className="hover:underline hover:text-[var(--ink,#1C2733)]">
            Production
          </Link>
          <span>/</span>
          <span className="font-semibold" style={{ color: 'var(--steel-dark, #1F3A63)' }}>
            Target Allotments
          </span>
        </div>

        {/* Section 1: Allotment & Handover Creation Form */}
        <CreateAllotmentForm 
          linemen={(linemen as any) || []} 
          articles={(articles as any) || []} 
        />

        {/* Section 2: Allotments List & Live Handshake Status */}
        {/* @ts-ignore */}
        <AllotmentList allotments={allotments || []} />

      </div>
    </AdminShell>
  )
}
