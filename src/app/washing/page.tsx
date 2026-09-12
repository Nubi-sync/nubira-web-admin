import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import Link from 'next/link'
import {
  Waves,
  ChevronLeft,
  ArrowRight,
  Cpu,
  FlaskConical,
  Droplets,
  CheckCircle2
} from 'lucide-react'
import { WashingDashboardClient } from './components/WashingDashboardClient'

import { fetchWashingDashboardDataAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function WashingDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profile }, liveData] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, role')
      .eq('id', user.id)
      .single(),
    fetchWashingDashboardDataAction()
  ])

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/modules"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Workspace Hub</span>
          </Link>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Division 07 • Wet Processing & Laundry
          </span>
        </div>

        {/* Module Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Industrial Washing & Wet Processing
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                  Division 07
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Enzyme bio-polishing, silicon softening, 1:5.0 liquor ratio management, and zero-shrinkage controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/washing/machine-runs"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] text-xs font-bold hover:bg-white transition-all shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Machine Runs</span>
            </Link>
            <Link
              href="/stitching-sewing/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Sewing Inward</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dashboard Client Area */}
        <WashingDashboardClient
          initialBatches={liveData.batches}
          initialRecipes={liveData.recipes}
          initialShrinkageQc={liveData.shrinkageQc}
        />

      </div>
    </AdminShell>
  )
}
