import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import Link from 'next/link'
import { ChevronLeft, Cpu } from 'lucide-react'
import { MachineRunsClient } from './components/MachineRunsClient'

import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function MachineRunsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  Tumbler & Hydro Runs
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider">
                  Live Operations
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Assign incoming sewing challans to 600 kg washing drums, monitor hydro moisture extraction, and track tumbler drying
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              href="/washing"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/15 bg-[#F0FDFA] hover:bg-white text-xs font-mono font-bold text-[#0B1220] transition-all shadow-2xs shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Machine Runs Client */}
        <MachineRunsClient />

      </div>
    </AdminShell>
  )
}
