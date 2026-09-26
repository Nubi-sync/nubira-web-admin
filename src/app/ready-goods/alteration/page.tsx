import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { ClinicDashboardClient } from '@/app/alter/components/ClinicDashboardClient'
import { fetchAlterDashboardDataAction } from '@/app/alter/actions'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Alteration & Mending Clinic | Quality & Packing',
  description: 'Integrated alteration clinic for mending defects flagged during post-wash and iron quality checking.'
}

export default async function ReadyGoodsAlterationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const liveData = await fetchAlterDashboardDataAction(companyFilter)

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <div className="space-y-4">
        {/* Unified Module Breadcrumb Banner */}
        <div className="p-3 bg-[#FAF7F0] border border-black/15 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#3A3564]">Integrated Module:</span>
            <span className="text-slate-600">
              Alteration Clinic is merged into Quality Inspection & Export Packing.
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Active Finishing Pipeline
          </span>
        </div>

        <ClinicDashboardClient
          userEmail={user.email}
          initialTickets={liveData.tickets}
          initialScrapLogs={liveData.scrapLogs}
        />
      </div>
    </AdminShell>
  )
}
