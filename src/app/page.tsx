import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch Global Stats
  const { data: prodData } = await supabase.from('daily_product').select('quantity, entry_date')
  const { data: qcData } = await supabase.from('qc_logs').select('qty_passed, qty_rejected, entry_date').in('stage', ['CHECKING', 'BULKING'])
  const { data: storeData } = await supabase.from('store_transactions').select('quantity, entry_date').eq('type', 'INWARD')

  let totalProduced = 0
  let totalPassed = 0
  let totalRejected = 0
  let totalInward = 0

  const dailyMap: Record<string, { produced: number, passed: number }> = {}

  prodData?.forEach(row => {
    totalProduced += row.quantity || 0
    if (row.entry_date) {
      if (!dailyMap[row.entry_date]) dailyMap[row.entry_date] = { produced: 0, passed: 0 }
      dailyMap[row.entry_date].produced += row.quantity || 0
    }
  })

  qcData?.forEach(row => {
    totalPassed += row.qty_passed || 0
    totalRejected += row.qty_rejected || 0
    if (row.entry_date) {
      if (!dailyMap[row.entry_date]) dailyMap[row.entry_date] = { produced: 0, passed: 0 }
      dailyMap[row.entry_date].passed += row.qty_passed || 0
    }
  })

  storeData?.forEach(row => {
    totalInward += row.quantity || 0
  })

  // Format chart data (sort by date)
  const chartData = Object.keys(dailyMap)
    .sort()
    .map(date => ({
      date,
      produced: dailyMap[date].produced,
      passed: dailyMap[date].passed
    }))

  const stats = {
    produced: totalProduced,
    passed: totalPassed,
    rejected: totalRejected,
    inward: totalInward
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user.email}</p>
          </div>
          
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/login')
          }}>
            <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-semibold border border-slate-200 shadow-sm">
              Sign Out
            </button>
          </form>
        </header>

        <DashboardClient stats={stats} chartData={chartData} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Employees */}
          <Link href="/employees" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-700 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer relative z-10">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-bold text-base text-slate-800">Manage Employees</span>
            <span className="text-xs text-slate-400 mt-1">Add or update workers</span>
          </Link>

          {/* Articles */}
          <Link href="/articles" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-700 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer relative z-10">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <span className="font-bold text-base text-slate-800">Manage Articles</span>
            <span className="text-xs text-slate-400 mt-1">Set rates & Art No.</span>
          </Link>

          {/* Allotments */}
          <Link href="/allotments" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-700 hover:border-purple-300 hover:shadow-md transition-all group cursor-pointer relative z-10">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-base text-slate-800">Target Allotments</span>
            <span className="text-xs text-slate-400 mt-1">Assign work to Linemen</span>
          </Link>

          {/* Reports */}
          <Link href="/reports" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-700 hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer relative z-10">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-base text-slate-800">Reports & Analytics</span>
            <span className="text-xs text-slate-400 mt-1">Production, QC & Stock</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
