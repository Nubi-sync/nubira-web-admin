'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { 
  Warehouse, 
  User, 
  Mail, 
  ShieldCheck, 
  Building2, 
  LogOut, 
  CheckCircle2, 
  Loader2, 
  Lock,
  ArrowUpRight
} from 'lucide-react'
import { signOut } from '@/app/login/actions'

interface StaffProfileViewProps {
  user: {
    id: string
    email?: string
    created_at?: string
  }
  profile: {
    id?: string
    username?: string
    role?: string
    is_active?: boolean
    created_at?: string
  } | null
}

export function StaffProfileView({ user, profile }: StaffProfileViewProps) {
  // Logout state
  const [logoutPending, startLogoutTransition] = useTransition()

  const username = profile?.username || 'Store Supervisor'
  const roleName = (profile?.role || 'STORE_SUPERVISOR').replace(/_/g, ' ').toUpperCase()
  const displayEmail = user.email || 'store@nubira.local'
  const initials = username.substring(0, 2).toUpperCase() || 'ST'
  const memberSince = (profile?.created_at || user.created_at)
    ? new Date(profile?.created_at || user.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Sep 2026'

  function handleLogout() {
    startLogoutTransition(async () => {
      await signOut()
    })
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
        <Link href="/store" className="hover:text-[#3A3564] transition-colors flex items-center gap-1.5">
          <Warehouse className="w-3.5 h-3.5" />
          Store Dashboard
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900">Supervisor Profile</span>
      </div>

      {/* 2. Page Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Store Supervisor Profile
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Shift Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Store & Godown Department • Raw Material Inventory & Floor Handover
            </p>
          </div>
        </div>

        {/* Quick launcher to store */}
        <Link
          href="/store"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2c284e] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer"
        >
          <span>Open Store Dashboard</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 3. Info Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left 2 Cols: Supervisor Identification & Department */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-[#3A3564] text-white text-xl font-black">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">
                      {username}
                    </h2>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/15 uppercase">
                      {roleName}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Assigned Floor: Godown & Materials Inward Hub
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <User className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Username / Staff ID</div>
                  <div className="text-sm font-bold text-slate-900 truncate font-mono">{username}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Login Credential</div>
                  <div className="text-sm font-semibold text-slate-900 truncate font-mono">{displayEmail}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <Building2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Facility</div>
                  <div className="text-sm font-semibold text-slate-900 truncate">Nubira Creation (Plant 1)</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Account Standing</div>
                  <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Authorized Floor Staff
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom metadata banner */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Staff Account Active Since: <strong className="text-slate-700">{memberSince}</strong></span>
            <span className="text-[11px] font-mono text-slate-400">UID: {user.id.substring(0, 8)}...</span>
          </div>
        </div>

        {/* Right 1 Col: Access Scope & Restrictions Summary */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-[#3A3564]" />
              <h3 className="text-base font-extrabold text-slate-900">
                Department Access Level
              </h3>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-start gap-2.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Raw Material & Trims Inward</div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Supplier Challans & GRN Photo Records</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-start gap-2.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Lineman BOM Issuance</div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Physical material handover for active orders</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-start gap-2.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">QC Floor Handover Inward</div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Receive QC approved garments to godown</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-slate-600">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-700">Master Admin & Financials</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Company GST & Admin settings are restricted</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              disabled={logoutPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100/80 text-red-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {logoutPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Store Shift</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
