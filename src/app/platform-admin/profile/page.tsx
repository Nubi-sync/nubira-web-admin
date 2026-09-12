'use client'

import Link from 'next/link'
import {
  User,
  ChevronLeft,
  ShieldCheck,
  Key,
  Mail,
  MapPin,
  Clock,
  Server,
  Building2,
  Lock,
  CheckCircle2,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'

export default function SuperAdminProfilePage() {
  return (
    <PlatformAdminShell userEmail="admin@zigza.in">
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl w-full mx-auto select-none">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/platform-admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Platform Command</span>
          </Link>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Root SuperAdmin Security Credentials
          </span>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-black/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#3A3564] text-white flex items-center justify-center font-black font-mono text-2xl shadow-xs shrink-0">
                RA
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black text-slate-900">
                    Platform Super Admin
                  </h1>
                  <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-[#3A3564] text-white tracking-wider">
                    ROOT CLEARANCE
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <Mail className="w-3.5 h-3.5 text-[#3A3564]" />
                    admin@zigza.in
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Burhanpur, MP, India
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Multi-Tenant Master Active</span>
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                Assigned Authority
              </span>
              <p className="font-bold text-slate-900">
                Zigza Founding Platform Architect
              </p>
              <p className="text-slate-500 text-[11px]">
                Full cloud infrastructure & tenant lifecycle provisioning
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                Primary Master Key
              </span>
              <p className="font-bold text-slate-900">
                @Burhanpur123
              </p>
              <p className="text-emerald-700 text-[11px] font-bold">
                ✓ Hardware Challenge Verified
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                Authorized Tenant Scope
              </span>
              <p className="font-bold text-slate-900">
                All Factory Tenants (11/11 Modules)
              </p>
              <p className="text-slate-500 text-[11px]">
                Unlimited floor allocations & license generation
              </p>
            </div>
          </div>
        </div>

        {/* Security & Access Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#3A3564]" />
              <span>Platform Administration Capabilities</span>
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <span className="text-slate-800 font-bold">Instant Tenant Provisioning</span>
                <span className="text-emerald-700 font-bold">ENABLED</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <span className="text-slate-800 font-bold">Enterprise Module Entitlements</span>
                <span className="text-emerald-700 font-bold">11 DIVISIONS</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <span className="text-slate-800 font-bold">Supabase Row-Level Isolation (RLS)</span>
                <span className="text-emerald-700 font-bold">BYPASS/SUPER</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <span className="text-slate-800 font-bold">WhatsApp Dispatch Automation</span>
                <span className="text-emerald-700 font-bold">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#3A3564]" />
              <span>Fast Actions</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <Link
                href="/platform-admin/provisioning"
                className="p-3.5 rounded-xl border border-black/10 hover:border-[#3A3564] bg-[#FAF7F0] hover:bg-white flex items-center justify-between transition-all block cursor-pointer group"
              >
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-[#3A3564] block">
                    Provision a New Factory Tenant
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Create super admin credentials and allocate floor divisions
                  </span>
                </div>
                <ChevronLeft className="w-4 h-4 rotate-180 text-slate-400 group-hover:text-[#3A3564]" />
              </Link>

              <Link
                href="/platform-admin/audit-logs"
                className="p-3.5 rounded-xl border border-black/10 hover:border-[#3A3564] bg-[#FAF7F0] hover:bg-white flex items-center justify-between transition-all block cursor-pointer group"
              >
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-[#3A3564] block">
                    Inspect SOC-2 Audit Trail
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Review access logs, timestamps, and IP origins
                  </span>
                </div>
                <ChevronLeft className="w-4 h-4 rotate-180 text-slate-400 group-hover:text-[#3A3564]" />
              </Link>

              <Link
                href="/modules"
                className="p-3.5 rounded-xl border border-black/10 hover:border-[#3A3564] bg-[#FAF7F0] hover:bg-white flex items-center justify-between transition-all block cursor-pointer group"
              >
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-[#3A3564] block">
                    Inspect 11 Factory Division Units
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Open client garment manufacturing floor view
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564]" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </PlatformAdminShell>
  )
}
