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
    <div className="space-y-5 sm:space-y-6">
      
      {/* Layer 1: Breadcrumb Hierarchy Trail */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Floor Workstation</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Operator Profile</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/printing/worker"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Active Assignments</span>
          </Link>
          <Link
            href="/printing/worker/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed History</span>
          </Link>
        </div>
      </div>

      {/* Layer 2: Profile Banner Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs">
            <User className="w-8 h-8 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                {userName || 'Printing Floor Operator'}
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-slate-900 border border-black/10 shadow-2xs tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3A3564]" />
                Active Floor Operator
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1 font-mono">
              Floor ID: {workerRecord?.id || userId ? `OP-${(workerRecord?.id || userId).slice(-6)}` : 'OP-PRN-01'} • Nubira Creation Floor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] shadow-2xs">
            +91 {normPhone || '9876543210'}
          </span>
        </div>
      </div>

      {/* Layer 3: Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Workstation Credentials */}
        <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#3A3564] font-bold text-sm">
            <Lock className="w-4.5 h-4.5" />
            <span>Portal Access &amp; Identity</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0]/60 border border-black/5">
              <span className="text-slate-500">Registered Name</span>
              <span className="font-bold text-slate-900">{userName || 'Printing Operator'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0]/60 border border-black/5">
              <span className="text-slate-500">Mobile Login ID</span>
              <span className="font-bold text-slate-900">+91 {normPhone}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0]/60 border border-black/5">
              <span className="text-slate-500">Factory Tenant</span>
              <span className="font-bold text-[#3A3564]">Nubira Creation</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0]/60 border border-black/5">
              <span className="text-slate-500">Authentication</span>
              <span className="font-bold text-slate-900">✓ RBAC Secured</span>
            </div>
          </div>
        </div>

        {/* Card 2: Assigned Floor Roles */}
        <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#3A3564] font-bold text-sm">
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
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] shadow-2xs"
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
