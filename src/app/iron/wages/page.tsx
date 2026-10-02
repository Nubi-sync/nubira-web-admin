import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import Link from 'next/link'
import { ChevronLeft, Calculator } from 'lucide-react'
import { WagesClient } from './components/WagesClient'

import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function PieceRateWagesPage() {
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
      <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        
        {/* Header Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/15 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  Operator <span className="text-[#1D4ED8]">Piece-Rate Wages</span>
                </h1>
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                  Verified Pieces &times; Rate
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
                Real-time shift wage calculation ledger based on verified wrinkle-free passed pieces and station piece-rates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <Link
              href="/iron"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F0FDFA] hover:bg-white border border-black/15 text-xs font-mono font-bold text-[#0B1220] transition-all shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Floor</span>
            </Link>
          </div>
        </div>

        {/* Wages Client Component */}
        <WagesClient />

      </div>
    </AdminShell>
  )
}
