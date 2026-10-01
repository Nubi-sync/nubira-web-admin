'use client'

import React from 'react'
import Link from 'next/link'
import {
  Printer,
  User,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react'

interface WorkerProfileClientProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  userId?: string
  userRole?: string
  workerRecord?: any
}

export function WorkerProfileClient({
  userEmail,
  userName,
  userPhone,
  userId,
  userRole,
  workerRecord
}: WorkerProfileClientProps) {
  const normPhone = (userPhone || workerRecord?.phone_number || '').replace(/\D/g, '').slice(-10)
  const rolesList: string[] = workerRecord?.roles || (workerRecord?.role ? [workerRecord.role] : ['SCREEN_PRINTER'])

  return (
    <div className="space-y-4 sm:space-y-6 select-none text-[#09090b]">
      
      {/* Top Profile Banner Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <User className="w-6 h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                {userName || 'Printing Floor Operator'}
              </h1>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-slate-900 border border-black/15 shadow-2xs tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B1220]" />
                Active Operator
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-mono">
              Floor ID: {workerRecord?.id || userId ? `OP-${(workerRecord?.id || userId).slice(-6)}` : 'OP-PRN-01'} • +91 {normPhone || '9876543210'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          <Link
            href="/printing/worker"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F0FDFA] border border-black/15 text-xs font-mono font-bold text-slate-700 hover:text-[#0B1220] hover:bg-slate-100 transition-all shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Active Work</span>
          </Link>
          <Link
            href="/printing/worker/history"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-black/15 text-xs font-mono font-bold text-slate-700 hover:text-[#0B1220] hover:bg-[#F0FDFA] transition-all shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>History</span>
          </Link>
        </div>
      </div>

      {/* Layer 3: Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Workstation Credentials */}
        <div className="bg-white p-6 rounded-3xl border border-black/15 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#0B1220] font-bold text-sm">
            <Lock className="w-4.5 h-4.5" />
            <span>Portal Access &amp; Identity</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0FDFA]/60 border border-black/5">
              <span className="text-slate-500">Registered Name</span>
              <span className="font-bold text-slate-900">{userName || 'Printing Operator'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0FDFA]/60 border border-black/5">
              <span className="text-slate-500">Mobile Login ID</span>
              <span className="font-bold text-slate-900">+91 {normPhone}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0FDFA]/60 border border-black/5">
              <span className="text-slate-500">Factory Tenant</span>
              <span className="font-bold text-[#0B1220]">Nubira Creation</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0FDFA]/60 border border-black/5">
              <span className="text-slate-500">Authentication</span>
              <span className="font-bold text-slate-900">✓ RBAC Secured</span>
            </div>
          </div>
        </div>

        {/* Card 2: Assigned Floor Roles */}
        <div className="bg-white p-6 rounded-3xl border border-black/15 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#0B1220] font-bold text-sm">
            <Printer className="w-4.5 h-4.5" />
            <span>Assigned Floor Roles</span>
          </div>

          <p className="text-xs text-slate-500 font-mono">
            Operational roles assigned to this operator by the Printing Master &amp; Floor Supervisor
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {rolesList.map(r => (
              <span
                key={r}
                className="px-3.5 py-1.5 rounded-xl bg-[#F0FDFA] border border-black/15 text-xs font-mono font-bold text-[#0B1220] shadow-2xs"
              >
                {r.replace(/_/g, ' ')}
              </span>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-black/5 text-xs text-slate-600 font-mono space-y-1 mt-4">
            <div className="font-bold text-slate-900">Workstation Permissions:</div>
            <div>• Receive article printing piece quotas &amp; print table stations</div>
            <div>• Start live printing clock and record station operations</div>
            <div>• Submit finished job batches to Head of Dept for verification</div>
          </div>
        </div>

      </div>

    </div>
  )
}
