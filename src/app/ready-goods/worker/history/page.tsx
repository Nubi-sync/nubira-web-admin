import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminShell } from '@/components/layout/AdminShell'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ArrowLeft, Clock, History } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReadyGoodsWorkerHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/ready-goods/worker"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Worker Terminal</span>
          </Link>
          <span className="text-xs font-mono font-bold text-slate-400">Shift QC History</span>
        </div>

        <div className="bg-white rounded-3xl border border-black/15 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564]/10 text-[#3A3564] flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Work History</h2>
              <p className="text-xs text-slate-500">Inspection logs, alteration dispatches, and carton manifests</p>
            </div>
          </div>

          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            Shift activity is automatically synchronized with your active floor terminal session.
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
