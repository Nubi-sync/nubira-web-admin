'use client'

import { ShieldCheck, Mail, Phone, Calendar } from 'lucide-react'

interface AdminIdentityCardProps {
  userEmail: string
  adminDisplayName?: string
  adminPhone?: string
  createdAt?: string
}

export function AdminIdentityCard({
  userEmail,
  adminDisplayName = 'Enterprise SuperAdmin',
  adminPhone = '',
  createdAt,
}: AdminIdentityCardProps) {
  const initials = (adminDisplayName.substring(0, 2) || userEmail.substring(0, 2)).toUpperCase() || 'EA'
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active Account'

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-7 relative transition-all space-y-6">
      {/* Header with Avatar & Role */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#0B1220] text-white text-sm sm:text-base font-black font-mono tracking-wider">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#0B1220] tracking-tight font-[family-name:var(--font-heading)]">
                {adminDisplayName}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-mono font-bold bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B1220]" />
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Primary factory administrator credentials and master root account holder
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Clean Executive Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4.5 pt-1">
        {/* 1. Primary Login Email */}
        <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-black/20 hover:shadow-xs transition-all">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-black/15 shadow-2xs">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block truncate">
              Primary Login Email
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[#0B1220] mt-0.5 block truncate font-mono" title={userEmail}>
              {userEmail}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block font-medium">
              Root Authentication
            </span>
          </div>
        </div>

        {/* 2. Direct Mobile Phone */}
        <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-black/20 hover:shadow-xs transition-all">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-black/15 shadow-2xs">
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block truncate">
              Direct Mobile Number
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[#0B1220] mt-0.5 block font-mono">
              {adminPhone || 'Not configured'}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block font-medium">
              Verified OTP Contact
            </span>
          </div>
        </div>

        {/* 3. Account Established */}
        <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-black/20 hover:shadow-xs transition-all">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-black/15 shadow-2xs">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block truncate">
              Account Established
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[#0B1220] mt-0.5 block font-mono">
              {memberSince}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block font-medium">
              Registration Date
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
