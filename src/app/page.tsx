import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardClient from './DashboardClient'
import { 
  Users, 
  Tag, 
  ClipboardList, 
  FileText, 
  Warehouse, 
  Truck 
} from 'lucide-react'

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

        {/* 6 Quick Access Navigation Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Inventory & Godown */}
          <Link href="/inventory" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-700 hover:border-purple-300 hover:shadow-md transition-all group cursor-pointer relative z-10">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <Warehouse className="w-7 h-7" />
            </div>
            <span className="font-bold text-base text-slate-800">Godown & Inventory</span>
            <span className="text-xs text-slate-400 mt-1">Stock matrix & raw trims</span>
          </Link>

          {/* 2. Dispatch & Logistics */}
          <Link href="/dispatch" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-700 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer relative z-10">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <Truck className="w-7 h-7" />
            </div>
            <span className="font-bold text-base text-slate-800">Dispatch & Challans</span>
            <span className="text-xs text-slate-400 mt-1">Counting & gate passes</span>
          </Link>

          {/* 3. Target Allotments */}
          <Link href="/allotments" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-700 hover:border-amber-300 hover:shadow-md transition-all group cursor-pointer relative z-10">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <ClipboardList className="w-7 h-7" />
            </div>
            <span className="font-bold text-base text-slate-800">Target Allotments</span>
            <span className="text-xs text-slate-400 mt-1">Assign work to Linemen</span>
          </Link>

          {/* 4. Manage Employees */}
          <Link href="/employees" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-700 hover:border-cyan-300 hover:shadow-md transition-all group cursor-pointer relative z-10">
            <div className="p-4 bg-cyan-50 text-cyan-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <Users className="w-7 h-7" />
            </div>
            <span className="font-bold text-base text-slate-800">Manage Employees</span>
            <span className="text-xs text-slate-400 mt-1">Add or update workers</span>
          </Link>

          {/* 5. Manage Articles */}
          <Link href="/articles" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-700 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer relative z-10">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <Tag className="w-7 h-7" />
            </div>
            <span className="font-bold text-base text-slate-800">Manage Articles</span>
            <span className="text-xs text-slate-400 mt-1">Set rates & Art No.</span>
          </Link>

          {/* 6. Reports & Analytics */}
          <Link href="/reports" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-48 flex flex-col items-center justify-center text-slate-700 hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer relative z-10">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <FileText className="w-7 h-7" />
            </div>
            <span className="font-bold text-base text-slate-800">Reports & Analytics</span>
            <span className="text-xs text-slate-400 mt-1">Production, QC & Stock</span>
          </Link>
        </div>
      </div>
    </div>
  )
}