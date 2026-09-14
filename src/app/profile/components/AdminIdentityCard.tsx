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
    <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 relative transition-all space-y-5">
      {/* Header with Avatar & Role */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs bg-[#3A3564] text-white text-base font-black font-mono tracking-wider">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                {adminDisplayName}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3A3564]" />
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Primary factory administrator and root account holder
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Clean Executive Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4.5 pt-1">
        {/* 1. Primary Login Email */}
        <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#3A3564]/30 hover:shadow-xs transition-all">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 text-[#3A3564] border border-slate-200 shadow-2xs">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Primary Login Email
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 block truncate" title={userEmail}>
              {userEmail}
            </span>
          </div>
        </div>

        {/* 2. Direct Mobile Phone */}
        <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#3A3564]/30 hover:shadow-xs transition-all">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 text-[#3A3564] border border-slate-200 shadow-2xs">
            <Phone className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Direct Mobile Number
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 block font-mono">
              {adminPhone || 'Not configured'}
            </span>
          </div>
        </div>

        {/* 3. Account Established */}
        <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#3A3564]/30 hover:shadow-xs transition-all">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 text-[#3A3564] border border-slate-200 shadow-2xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Account Established
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 block font-mono">
              {memberSince}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
