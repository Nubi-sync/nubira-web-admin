import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateAllotmentForm } from './components/CreateAllotmentForm'
import { AllotmentList } from './components/AllotmentList'
import { ClipboardList } from 'lucide-react'

export default async function AllotmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch active linemen
  const { data: linemen } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('role', 'LINEMAN')
    .eq('is_active', true)
    .order('username')

  // Fetch active articles
  const { data: articles } = await supabase
    .from('articles')
    .select('id, art_no')
    .eq('is_active', true)
    .order('art_no')

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
      articles ( art_no )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Calculate achieved_qty for each allotment based on daily_product
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
      
    return {
      ...al,
      achieved_qty: achieved
    }
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Target Allotments</h1>
              <p className="text-slate-500 mt-1">Assign daily production targets to workers</p>
            </div>
          </div>
          
          <a href="/" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-medium border border-slate-200 shadow-sm">
            Back to Dashboard
          </a>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <CreateAllotmentForm 
              linemen={linemen || []} 
              articles={articles || []} 
            />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            {/* @ts-ignore */}
            <AllotmentList allotments={allotments || []} />
          </div>
        </div>

      </div>
    </div>
  )
}
