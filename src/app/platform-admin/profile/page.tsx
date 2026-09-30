'use client'

import Link from 'next/link'
import {
  User,
  ShieldCheck,
  Key,
  Mail,
  MapPin,
  ExternalLink,
  Zap,
  ChevronRight
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'

export default function SuperAdminProfilePage() {
  return (
    <PlatformAdminShell userEmail="admin@zigza.in">
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-5xl w-full mx-auto text-[#0B1220]">
        
        {/* Layer 1: Breadcrumb Hierarchy Trail */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/platform-admin" className="hover:text-[#0B1220] transition-colors">
            Platform Root
          </Link>
          <span>/</span>
          <span>Identity & Clearance</span>
          <span>/</span>
          <span className="font-bold text-[#0B1220]">Root SuperAdmin Profile</span>
        </div>

        {/* Layer 2: Encapsulated Top Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
              <User className="w-6 h-6 text-[#0B1220]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                  SuperAdmin <span className="text-[#1D4ED8]">Security</span> Profile
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
                  Platform Root Authority
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
                Master credentials, global tenant access authority, and cloud cluster entitlements
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0B1220] text-white flex items-center justify-center font-bold font-mono text-xl shadow-xs shrink-0 border border-slate-800">
                RA
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-[#0B1220] font-[family-name:var(--font-heading)]">
                    Platform Super Admin
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
                    Root Clearance
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1.5 font-semibold text-[#0B1220]">
                    <Mail className="w-3.5 h-3.5 text-[#0B1220]" />
                    admin@zigza.in
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Burhanpur, MP, India
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Multi-Tenant Master Active</span>
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-sm">
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs block">
                Assigned Authority
              </span>
              <p className="font-bold text-[#0B1220] text-base font-[family-name:var(--font-heading)]">
                Zigza Founding Architect
              </p>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Full cloud infrastructure & tenant lifecycle provisioning
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs block">
                Primary Master Key
              </span>
              <p className="font-bold text-[#0B1220] text-base font-mono">
                @Burhanpur123
              </p>
              <p className="text-emerald-700 text-xs font-semibold mt-0.5">
                Hardware challenge verified
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs block">
                Authorized Tenant Scope
              </span>
              <p className="font-bold text-[#0B1220] text-base">
                All Factory Tenants (11 Modules)
              </p>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Unlimited floor allocations & license generation
              </p>
            </div>
          </div>
        </div>

        {/* Security & Access Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0B1220] font-[family-name:var(--font-heading)] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#0B1220]" />
              <span>Platform Administration Capabilities</span>
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/20 flex items-center justify-between">
                <span className="text-[#0B1220] font-semibold">Instant Tenant Provisioning</span>
                <span className="text-emerald-800 font-semibold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">Enabled</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/20 flex items-center justify-between">
                <span className="text-[#0B1220] font-semibold">Enterprise Module Entitlements</span>
                <span className="text-emerald-800 font-semibold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">11 Divisions</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/20 flex items-center justify-between">
                <span className="text-[#0B1220] font-semibold">Supabase Row-Level Isolation (RLS)</span>
                <span className="text-emerald-800 font-semibold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">SuperAdmin Bypass</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/20 flex items-center justify-between">
                <span className="text-[#0B1220] font-semibold">WhatsApp Dispatch Automation</span>
                <span className="text-emerald-800 font-semibold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0B1220] font-[family-name:var(--font-heading)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#14C8B4]" />
              <span>Fast Actions</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <Link
                href="/platform-admin/provisioning"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0B1220] bg-slate-50/70 hover:bg-[#F0FDFA] flex items-center justify-between transition-all block cursor-pointer group shadow-xs"
              >
                <div>
                  <span className="font-bold text-[#0B1220] group-hover:text-[#1D4ED8] block font-[family-name:var(--font-public-sans)]">
                    Provision a New Factory Tenant
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans font-medium">
                    Create super admin credentials and allocate floor divisions
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B1220]" />
              </Link>

              <Link
                href="/platform-admin/audit-logs"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0B1220] bg-slate-50/70 hover:bg-[#F0FDFA] flex items-center justify-between transition-all block cursor-pointer group shadow-xs"
              >
                <div>
                  <span className="font-bold text-[#0B1220] group-hover:text-[#1D4ED8] block font-[family-name:var(--font-public-sans)]">
                    Inspect SOC-2 Audit Trail
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans font-medium">
                    Review access logs, timestamps, and IP origins
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B1220]" />
              </Link>

              <Link
                href="/platform-admin/modules"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0B1220] bg-slate-50/70 hover:bg-[#F0FDFA] flex items-center justify-between transition-all block cursor-pointer group shadow-xs"
              >
                <div>
                  <span className="font-bold text-[#0B1220] group-hover:text-[#1D4ED8] block font-[family-name:var(--font-public-sans)]">
                    Overview 11 Enterprise Modules
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans font-medium">
                    Inspect architecture, tenant safety boundaries, and schemas
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B1220]" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </PlatformAdminShell>
  )
}
