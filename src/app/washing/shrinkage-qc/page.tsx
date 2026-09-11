import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { ShrinkageQcClient } from './components/ShrinkageQcClient'

export const dynamic = 'force-dynamic'

export default async function ShrinkageQcPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', user.id)
    .single()

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/washing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Washing Dashboard</span>
          </Link>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            AATCC 135 / ISO 6330 Standard
          </span>
        </div>

        {/* Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Shrinkage & Fastness QC Station
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                  Quality Audit
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                10-piece statistical dimensional audit per batch, residual shrinkage tolerance (&le; 1.5%), and automatic Cutting alert escalation
              </p>
            </div>
          </div>
        </div>

        {/* Shrinkage QC Client */}
        <ShrinkageQcClient />

      </div>
    </AdminShell>
  )
}
