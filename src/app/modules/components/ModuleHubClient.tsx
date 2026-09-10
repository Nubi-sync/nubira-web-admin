'use client'

import React from 'react'
import Link from 'next/link'
import {
  Factory,
  Briefcase,
  Waves,
  Printer,
  Sparkles,
  Scissors,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react'

interface ModuleHubClientProps {
  userEmail: string
  userName: string
  userRole: string
}

interface ModuleCard {
  id: string
  title: string
  subtitle: string
  badge: string
  statusText: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  isCore?: boolean
}

const MODULES: ModuleCard[] = [
  {
    id: 'factory',
    title: 'Factory Control',
    subtitle: 'Plant operations, machine efficiency (OEE), and floor telemetry.',
    badge: 'PLANT HUB',
    statusText: '12 Lines Active',
    icon: Factory,
    href: '/factory',
  },
  {
    id: 'brands',
    title: 'Brands & Buyers',
    subtitle: 'Buyer accounts, export PO orders, and style catalogs.',
    badge: 'BUYER CRM',
    statusText: 'PO Contract Ledger',
    icon: Briefcase,
    href: '/brands',
  },
  {
    id: 'washing',
    title: 'Industrial Washing',
    subtitle: 'Enzyme wash, silicon softeners, liquor ratios, and tumbler drying.',
    badge: 'WET PROCESS',
    statusText: 'Batch Wash Cycles',
    icon: Waves,
    href: '/washing',
  },
  {
    id: 'printing',
    title: 'Printing Division',
    subtitle: 'Screen tables, DTG digital printing, and strike-off approvals.',
    badge: 'SURFACE ART',
    statusText: 'Screen & Sublimation',
    icon: Printer,
    href: '/printing',
  },
  {
    id: 'embroidery',
    title: 'Multi-Head Embroidery',
    subtitle: 'Computerized embroidery, punch digitizing, and stitch billing.',
    badge: 'THREAD ART',
    statusText: 'Multi-Head Lines',
    icon: Sparkles,
    href: '/embroidery',
  },
  {
    id: 'stitching-sewing',
    title: 'Stitching & Sewing',
    subtitle: 'Live cutting lots, lineman bundle allocations, QC audits, and store sync.',
    badge: 'CORE FLOOR',
    statusText: 'LIVE FLOOR EXECUTION',
    icon: Scissors,
    href: '/stitching-sewing/dashboard',
    isCore: true,
  },
]

export function ModuleHubClient({ userEmail, userName, userRole }: ModuleHubClientProps) {
  return (
    <div className="h-screen max-h-screen w-full bg-[#FAF7F0] text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-7 overflow-hidden select-none">
      
      {/* Top Header: Clean & Compact */}
      <div className="flex items-center justify-between gap-4 shrink-0 pb-3 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs font-black text-lg">
            Z
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                Zigza Workspace
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                <ShieldCheck className="w-3 h-3" />
                Unit 1 Plant
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Select an operational unit to open dashboard & floor controls
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-black/10 shadow-2xs text-xs font-mono font-bold text-slate-700">
          <Activity className="w-3.5 h-3.5 text-[#3A3564]" />
          <span>6 Active Manufacturing Divisions</span>
        </div>
      </div>

      {/* Center 6-Module Grid: Balanced 3x2 Grid Fitted to Viewport */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 my-auto py-2">
        {MODULES.map((mod) => {
          const Icon = mod.icon
          const isCore = mod.isCore

          return (
            <Link
              key={mod.id}
              href={mod.href}
              className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isCore
                  ? 'bg-white border-[#3A3564]/50 shadow-xs hover:shadow-md hover:border-[#3A3564] ring-2 ring-[#3A3564]/10'
                  : 'bg-white border-black/10 shadow-2xs hover:shadow-xs hover:border-[#3A3564]/40 hover:bg-[#FAF7F0]/40'
              }`}
            >
              {/* Card Top: Icon + Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs transition-transform duration-200 group-hover:scale-105 ${
                      isCore
                        ? 'bg-[#FAF7F0] text-[#3A3564] border-black/10 ring-1 ring-[#3A3564]/20'
                        : 'bg-[#FAF7F0] text-[#3A3564] border-black/10'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCore && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                      {mod.badge}
                    </span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-[#3A3564] transition-colors">
                  {mod.title}
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-600 line-clamp-2 leading-relaxed">
                  {mod.subtitle}
                </p>
              </div>

              {/* Card Bottom: Status + Action */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 truncate">
                  {mod.statusText}
                </span>
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isCore
                      ? 'bg-[#3A3564] text-white group-hover:bg-[#2A2649] shadow-2xs'
                      : 'bg-[#FAF7F0] text-[#3A3564] group-hover:bg-[#3A3564] group-hover:text-white border border-black/10'
                  }`}
                >
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Bottom Bar: User Info on Left, Logout on Right */}
      <div className="flex items-center justify-between gap-4 shrink-0 pt-3 border-t border-black/10 bg-white/50 backdrop-blur-xs p-3 rounded-2xl border border-black/10 shadow-2xs">
        {/* User Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#3A3564] text-white flex items-center justify-center text-xs font-bold font-mono shadow-2xs shrink-0">
            {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-slate-900 truncate">
              {userName || userEmail}
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider truncate">
              {userRole || 'Plant Administrator'} • Unit 1 Floor
            </div>
          </div>
        </div>

        {/* Quick Sewing Floor Entry + Proper Logout Button on Right */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/stitching-sewing/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>Sewing Floor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-black/10 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#3A3564] group-hover:text-rose-600" />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
