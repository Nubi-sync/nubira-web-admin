import React from 'react'
import Link from 'next/link'
import {
  User,
  Building2,
  ShieldCheck,
  Clock,
  Mail,
  Phone,
  Layers,
  ChevronLeft,
  Settings,
  Sliders,
  CheckCircle2
} from 'lucide-react'

interface DivisionProfileViewProps {
  divisionName: string
  divisionSlug: string
  categoryBadge: string
  userEmail: string
  userName: string
  userRole: string
  icon: React.ComponentType<{ className?: string }>
  supervisorName?: string
  shiftDetails?: string
  capacityInfo?: string
  qualityStandard?: string
}

export function DivisionProfileView({
  divisionName,
  divisionSlug,
  categoryBadge,
  userEmail,
  userName,
  userRole,
  icon: Icon,
  supervisorName = 'Operations Head',
  shiftDetails = 'Shift A (08:00 AM - 05:30 PM)',
  capacityInfo = 'Unit 1 Dedicated Floor',
  qualityStandard = 'ISO 9001 / Zero-Defect Line'
}: DivisionProfileViewProps) {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl w-full mx-auto space-y-5 sm:space-y-6">
      
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          <Link href={divisionSlug} className="hover:text-[#3A3564] transition-colors">
            {divisionName}
          </Link>
          <span>/</span>
          <span className="text-slate-900">Division Profile</span>
        </div>

        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Workspace Hub</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {divisionName} Profile
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                {categoryBadge}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              Division configuration, supervisor credentials, and shift parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active Division
          </span>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Supervisor & Identity Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#3A3564]" />
              Supervisor In-Charge
            </h2>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              {userRole}
            </span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="font-semibold text-slate-500">Name</span>
              <span className="font-extrabold text-slate-900 font-mono">{userName || supervisorName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="font-semibold text-slate-500">Login ID</span>
              <span className="font-bold text-slate-900 font-mono">{userEmail}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="font-semibold text-slate-500">Access Level</span>
              <span className="font-bold text-[#3A3564] font-mono">Division Supervisor / Master</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="font-semibold text-slate-500">Device Handheld</span>
              <span className="font-bold text-emerald-700 font-mono">Authorized & Synced</span>
            </div>
          </div>
        </div>

        {/* Operational Parameters Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#3A3564]" />
              Division Parameters
            </h2>
            <span className="text-[10px] font-mono font-bold text-slate-400">UNIT 1</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="font-semibold text-slate-500">Floor Shift</span>
              <span className="font-bold text-slate-900 font-mono">{shiftDetails}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="font-semibold text-slate-500">Capacity Allocation</span>
              <span className="font-bold text-slate-900 font-mono">{capacityInfo}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="font-semibold text-slate-500">Audit Standard</span>
              <span className="font-bold text-slate-900 font-mono">{qualityStandard}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="font-semibold text-slate-500">Realtime WebSocket</span>
              <span className="font-bold text-emerald-700 font-mono">Connected (Sub-100ms)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Cross-Link to Company Profile */}
      <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-[#3A3564] shrink-0" />
          <span className="font-semibold text-slate-700">
            Looking for company-wide GSTIN, registered factory address, and master billing?
          </span>
        </div>
        <Link
          href="/modules/profile"
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#3A3564] font-bold border border-black/10 shadow-2xs shrink-0 transition-colors"
        >
          Master Company Profile →
        </Link>
      </div>

    </div>
  )
}
