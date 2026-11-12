'use client'

import { ShieldCheck, Mail, Phone, Calendar } from 'lucide-react'
import { DashboardSectionHeader } from '../../dashboard/components/DashboardSectionHeader'

interface AdminIdentityCardProps {
  userEmail: string
  adminDisplayName?: string
  adminPhone?: string
  createdAt?: string
}

export function AdminIdentityCard({
  userEmail,
  adminDisplayName = 'Enterprise Owner',
  adminPhone = '',
  createdAt,
}: AdminIdentityCardProps) {
  const initials = (adminDisplayName.substring(0, 2) || userEmail.substring(0, 2)).toUpperCase() || 'EA'
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active Account'

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs md:shadow-2xs p-4 sm:p-7 relative transition-all space-y-3.5 md:space-y-6">
      {/* Mobile Screenshot-1 Header (< md) */}
      <div className="md:hidden space-y-3">
        <DashboardSectionHeader
          icon={ShieldCheck}
          title="Executive"
          accent="Credentials"
          badge="OWNER"
        />

        <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl border border-slate-200/80 p-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#0B1220] text-white text-sm font-extrabold font-[family-name:var(--font-heading)] tracking-wider">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-[#0B1220] truncate font-[family-name:var(--font-heading)]">
              {adminDisplayName}
            </div>
            <div className="text-[11px] font-medium text-slate-500 font-[family-name:var(--font-public-sans)]">
              Primary Master Account Holder
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header (>= md untouched) */}
      <div className="hidden md:flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#0B1220] text-white text-sm sm:text-base font-black font-mono tracking-wider">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#0B1220] tracking-tight font-[family-name:var(--font-heading)]">
                {adminDisplayName}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B1220]" />
                OWNER
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Primary factory owner credentials and master account holder
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Clean Executive Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4.5 md:pt-1">
        {/* 1. Primary Login Email */}
        <div className="col-span-2 sm:col-span-1 flex items-start gap-3 md:gap-3.5 p-3 md:p-4.5 rounded-xl md:rounded-2xl bg-[#F8FAFC] md:bg-slate-50/70 md:hover:bg-white border border-slate-200/80 md:hover:border-black/20 md:hover:shadow-xs transition-all">
          <div className="w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-[#14C8B4]/40 md:border-black/15 shadow-2xs">
            <Mail className="w-4 h-4 md:w-6 md:h-6 text-[#0B1220]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-xs font-[family-name:var(--font-public-sans)] md:font-mono font-bold uppercase tracking-wider text-slate-500 block truncate">
              Primary Login Email
            </span>
            <span className="text-xs sm:text-base md:text-lg font-extrabold text-[#0B1220] mt-0.5 block truncate font-[family-name:var(--font-heading)] tabular-nums md:font-mono" title={userEmail}>
              {userEmail}
            </span>
            <span className="hidden md:block text-xs text-slate-500 mt-0.5 font-medium">
              Root Authentication
            </span>
          </div>
        </div>

        {/* 2. Direct Mobile Phone */}
        <div className="flex flex-col md:flex-row items-start gap-2 md:gap-3.5 p-3 md:p-4.5 rounded-xl md:rounded-2xl bg-[#F8FAFC] md:bg-slate-50/70 md:hover:bg-white border border-slate-200/80 md:hover:border-black/20 md:hover:shadow-xs transition-all">
          <div className="hidden md:flex w-11 h-11 rounded-xl bg-[#F0FDFA] items-center justify-center shrink-0 text-[#0B1220] border border-black/15 shadow-2xs">
            <Phone className="w-6 h-6 text-[#0B1220]" />
          </div>
          <div className="md:hidden w-full flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-[family-name:var(--font-public-sans)] font-bold uppercase tracking-wider text-slate-500 truncate">
              Mobile
            </span>
            <div className="w-6 h-6 rounded-md bg-[#F0FDFA] border border-[#14C8B4]/40 flex items-center justify-center shrink-0">
              <Phone className="w-3 h-3 text-[#0B1220]" />
            </div>
          </div>
          <div className="min-w-0 w-full flex-1">
            <span className="hidden md:block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 truncate">
              Direct Mobile Number
            </span>
            <span className="text-xs sm:text-base md:text-lg font-extrabold text-[#0B1220] md:mt-0.5 block truncate font-[family-name:var(--font-heading)] tabular-nums md:font-mono">
              {adminPhone || 'Not configured'}
            </span>
            <span className="text-[10px] md:text-xs text-slate-500 mt-0.5 block font-medium">
              Verified OTP Contact
            </span>
          </div>
        </div>

        {/* 3. Account Established */}
        <div className="flex flex-col md:flex-row items-start gap-2 md:gap-3.5 p-3 md:p-4.5 rounded-xl md:rounded-2xl bg-[#F8FAFC] md:bg-slate-50/70 md:hover:bg-white border border-slate-200/80 md:hover:border-black/20 md:hover:shadow-xs transition-all">
          <div className="hidden md:flex w-11 h-11 rounded-xl bg-[#F0FDFA] items-center justify-center shrink-0 text-[#0B1220] border border-black/15 shadow-2xs">
            <Calendar className="w-6 h-6 text-[#0B1220]" />
          </div>
          <div className="md:hidden w-full flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-[family-name:var(--font-public-sans)] font-bold uppercase tracking-wider text-slate-500 truncate">
              Established
            </span>
            <div className="w-6 h-6 rounded-md bg-[#F0FDFA] border border-[#14C8B4]/40 flex items-center justify-center shrink-0">
              <Calendar className="w-3 h-3 text-[#0B1220]" />
            </div>
          </div>
          <div className="min-w-0 w-full flex-1">
            <span className="hidden md:block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 truncate">
              Account Established
            </span>
            <span className="text-xs sm:text-base md:text-lg font-extrabold text-[#0B1220] md:mt-0.5 block truncate font-[family-name:var(--font-heading)] tabular-nums md:font-mono">
              {memberSince}
            </span>
            <span className="text-[10px] md:text-xs text-slate-500 mt-0.5 block font-medium">
              Registration Date
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
