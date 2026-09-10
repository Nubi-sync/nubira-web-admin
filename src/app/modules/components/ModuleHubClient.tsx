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
  Activity,
  CheckCircle2
} from 'lucide-react'

interface ModuleHubClientProps {
  userEmail: string
  userName: string
  userRole: string
}

interface ModuleCardData {
  id: string
  title: string
  subtitle: string
  badge: string
  statusType: 'live' | 'ready'
  statusText: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  isCore?: boolean
  features: string[]
}

const MODULES: ModuleCardData[] = [
  {
    id: 'factory',
    title: 'Factory Control Center',
    subtitle: 'Master plant operations, overall equipment efficiency (OEE), department telemetry, and executive plant KPIs.',
    badge: 'PLANT HUB',
    statusType: 'ready',
    statusText: 'OPERATIONAL',
    icon: Factory,
    href: '/factory',
    features: ['Plant-Wide Telemetry', 'Department Oversight', 'Shift Master Control'],
  },
  {
    id: 'brands',
    title: 'Brands & Buyer Portfolios',
    subtitle: 'Buyer accounts, export PO contracts, style catalogs, buyer compliance matrices, and dispatch order pipelines.',
    badge: 'BUYER CRM',
    statusType: 'ready',
    statusText: 'CLIENT PORTAL',
    icon: Briefcase,
    href: '/brands',
    features: ['PO Contract Ledger', 'Brand Style Catalogs', 'Buyer Compliance'],
  },
  {
    id: 'washing',
    title: 'Industrial Washing',
    subtitle: 'Garment enzyme wash, silicon softeners, acid wash cycles, batch liquor ratios, and wet processing quality checks.',
    badge: 'WET PROCESSING',
    statusType: 'ready',
    statusText: 'WASH FLOOR',
    icon: Waves,
    href: '/washing',
    features: ['Enzyme & Silicone Cycles', 'Batch Liquor Tracker', 'Hydro & Tumbler Logs'],
  },
  {
    id: 'printing',
    title: 'Screen & Digital Printing',
    subtitle: 'Rotary screen tables, digital DTG printing, sublimation ovens, strike-off color approvals, and print defect tracking.',
    badge: 'SURFACE ART',
    statusType: 'ready',
    statusText: 'PRINT DIVISION',
    icon: Printer,
    href: '/printing',
    features: ['Screen Table Lots', 'Strike-Off Approvals', 'DTG & Sublimation Flow'],
  },
  {
    id: 'embroidery',
    title: 'Multi-Head Embroidery',
    subtitle: 'Computerized embroidery lines, thread shade matching, punch digitizing files, frame stitch counts, and jobwork billing.',
    badge: 'THREAD ART',
    statusType: 'ready',
    statusText: 'EMBROIDERY UNIT',
    icon: Sparkles,
    href: '/embroidery',
    features: ['Multi-Head Machine Runs', 'Punch File Library', 'Stitch Rate Billing'],
  },
  {
    id: 'stitching-sewing',
    title: 'Stitching & Sewing Floor',
    subtitle: 'Live cutting matrices, lineman bundle allotments, piece-rate wages, inline checking, 3-stage QC audit, and godown store sync.',
    badge: 'CORE FLOOR',
    statusType: 'live',
    statusText: 'LIVE FLOOR EXECUTION',
    icon: Scissors,
    href: '/stitching-sewing/dashboard',
    isCore: true,
    features: ['Live Cutting Challans', 'Lineman Bundle Allocations', '3-Stage QC & Store Sync'],
  },
]

export function ModuleHubClient({ userEmail, userName, userRole }: ModuleHubClientProps) {
  return (
    <div className="min-h-screen bg-[#FAF7F0] text-slate-900 flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none">
      
      <div className="max-w-7xl w-full mx-auto">
        {/* Top Header: Badge, Title, Subtitle + Log Out on Right */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-white text-[#3A3564] border border-black/10 shadow-2xs mb-3">
              <Activity className="w-3.5 h-3.5 text-[#3A3564]" />
              <span>EXECUTIVE WORKSPACE HUB</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Select Operational Unit
            </h1>
            <p className="mt-2 text-sm sm:text-base font-medium text-slate-600 max-w-2xl leading-relaxed">
              Choose a manufacturing division below to monitor live floor telemetry, manage work orders, audit quality checkpoints, and oversee plant production.
            </p>
          </div>

          {/* Top-Right Log Out Action */}
          <div className="flex items-center gap-3 shrink-0 pt-1">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-extrabold text-slate-900">{userName || userEmail}</div>
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                {userRole || 'Plant Administrator'}
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-black/10 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[#3A3564] group-hover:text-rose-600" />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* 6 Interactive Enterprise Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            const isCore = mod.isCore

            return (
              <Link
                key={mod.id}
                href={mod.href}
                className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border transition-all duration-200 cursor-pointer ${
                  isCore
                    ? 'border-[#3A3564]/40 shadow-2xs hover:shadow-md hover:border-[#3A3564]'
                    : 'border-black/10 shadow-2xs hover:shadow-xs hover:border-[#3A3564]/30'
                }`}
              >
                {/* Top Row: Icon Container + Badges */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Ivory Icon Container */}
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-slate-800 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>

                    {/* Category & Status Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#FAF7F0] text-slate-700 border border-black/10">
                        {mod.badge}
                      </span>
                      {isCore && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE OPERATIONAL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Title */}
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#3A3564] transition-colors">
                    {mod.title}
                  </h2>

                  {/* Card Description */}
                  <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                    {mod.subtitle}
                  </p>

                  {/* 3 Checkpoint Features */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1.5">
                    {mod.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Status Tag + Launch Button */}
                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {mod.statusText}
                  </span>
                  <div className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF7F0] text-slate-800 group-hover:bg-[#3A3564] group-hover:text-white border border-black/10 transition-all">
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Clean Bottom Bar */}
      <div className="max-w-7xl w-full mx-auto mt-8 pt-4 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div>ZIGZA ENTERPRISE APPAREL SUITE • UNIT 1 MASTER PLANT</div>
        <div className="flex items-center gap-4">
          <span>{userEmail}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="hover:text-rose-600 transition-colors font-bold underline cursor-pointer">
              Sign Out
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
