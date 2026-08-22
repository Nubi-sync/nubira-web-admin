import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateAllotmentForm } from './components/CreateAllotmentForm'
import { AllotmentList } from './components/AllotmentList'
import { ClipboardList, ArrowLeft } from 'lucide-react'
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

  // 2. Fetch active articles
  const { data: articles } = await supabase
    .from('articles')
    .select('id, art_no, description')
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
      articles ( art_no, description )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-purple-500/20">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Target Allotments & Material Handover</h1>
              <p className="text-slate-500 text-sm mt-0.5">Assign cut-to-sew size-color ratios & verify raw materials issue</p>
            </div>
          </div>
          
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-semibold border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </header>

        {/* Section 1: Allotment & Handover Creation Form */}
        <CreateAllotmentForm 
          linemen={linemen || []} 
          articles={articles || []} 
        />

        {/* Section 2: Allotments List & Live Handshake Status */}
        {/* @ts-ignore */}
        <AllotmentList allotments={allotments || []} />

      </div>
    </div>
  )
}