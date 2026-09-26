import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminShell } from '@/components/layout/AdminShell'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ArrowLeft, User, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReadyGoodsWorkerProfilePage() {
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
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/ready-goods/worker"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Worker Terminal</span>
          </Link>
          <span className="text-xs font-mono font-bold text-slate-400">Worker Station Profile</span>
        </div>

        <div className="bg-white rounded-3xl border border-black/15 p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-[#3A3564] text-white flex items-center justify-center font-bold text-lg">
              {tenant.adminDisplayName?.charAt(0) || 'W'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {tenant.adminDisplayName || 'Finishing Specialist'}
              </h2>
              <p className="text-xs text-slate-500">Quality Checker & Packing Operator</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Assigned Floor</span>
              <span className="font-bold text-slate-800">Finishing & Packing Bay</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Factory / Plant</span>
              <span className="font-bold text-slate-800">{tenant.companyName}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
