'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Palette,
  Briefcase,
  Scissors,
  Printer,
  Sparkles,
  Layers,
  Waves,
  Flame,
  Boxes,
  Wrench,
  Store,
  ArrowRight,
  LogOut,
  LayoutGrid,
  CheckCircle2,
  Loader2
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
  statusText: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  features: string[]
}

const MODULES: ModuleCardData[] = [
  {
    id: 'design',
    title: 'Design & Tech-Pack Studio',
    subtitle: 'CAD sketches, tech-pack specs, sample iterations, and fabric grading approvals.',
    badge: 'CREATIVE STUDIO',
    statusText: 'SAMPLE DEVELOPMENT',
    icon: Palette,
    href: '/design',
    features: ['Tech-Pack Spec Sheets', 'CAD Sampling Approvals', 'Size & Fit Grading Matrix'],
  },
  {
    id: 'merchandising',
    title: 'Merchandising & Sourcing',
    subtitle: 'Buyer PO allocation, BOM costing, trim procurement, and shipment schedules.',
    badge: 'BUYER & SOURCING',
    statusText: 'COMMERCIAL OPS',
    icon: Briefcase,
    href: '/merchandising',
    features: ['Buyer PO & BOM Costing', 'Trim Procurement Ledger', 'Production Milestone Gantt'],
  },
  {
    id: 'cutting',
    title: 'Cutting & Lay Floor',
    subtitle: 'Fabric roll lay planning, marker efficiency, auto-cutters, and bundle generation.',
    badge: 'CUTTING DIVISION',
    statusText: 'LAY EXECUTION',
    icon: Scissors,
    href: '/cutting',
    features: ['Lay Sheet & Marker Ratio', 'Fabric Roll Consumption', 'Bundle QR Ticket Generation'],
  },
  {
    id: 'printing',
    title: 'Screen & Digital Printing',
    subtitle: 'Screen print tables, industrial DTG curing, and strike-off color approvals.',
    badge: 'SURFACE ART',
    statusText: 'PRINT DIVISION',
    icon: Printer,
    href: '/printing',
    features: ['Screen Table Lots', 'Strike-Off Approvals', 'DTG & Sublimation Flow'],
  },
  {
    id: 'embroidery',
    title: 'Multi-Head Embroidery',
    subtitle: 'Multi-head computerized machines, punch digitizing, and stitch billing.',
    badge: 'THREAD ART',
    statusText: 'EMBROIDERY UNIT',
    icon: Sparkles,
    href: '/embroidery',
    features: ['Multi-Head Machine Runs', 'Punch File Library', 'Stitch Rate Billing'],
  },
  {
    id: 'stitching-sewing',
    title: 'Stitching & Sewing Floor',
    subtitle: 'Live cutting lots, lineman bundle allocations, 3-stage QC, and store sync.',
    badge: 'SEWING FLOOR',
    statusText: 'FLOOR EXECUTION',
    icon: Layers,
    href: '/stitching-sewing/dashboard',
    features: ['Live Cutting Challans', 'Lineman Bundle Allocations', '3-Stage QC & Store Sync'],
  },
  {
    id: 'washing',
    title: 'Industrial Washing',
    subtitle: 'Garment enzyme wash, silicon softeners, and liquor ratio batch tracking.',
    badge: 'WET PROCESSING',
    statusText: 'WASH FLOOR',
    icon: Waves,
    href: '/washing',
    features: ['Enzyme & Silicone Cycles', 'Batch Liquor Tracker', 'Hydro & Tumbler Logs'],
  },
  {
    id: 'iron',
    title: 'Ironing & Steam Pressing',
    subtitle: 'Industrial steam irons, vacuum pressing boards, temperature checks, and inline finishing.',
    badge: 'FINISHING UNIT',
    statusText: 'STEAM PRESSING',
    icon: Flame,
    href: '/iron',
    features: ['Steam Vacuum Tables', 'Inline Finish Inspection', 'Ironing Piece-Rate Logs'],
  },
  {
    id: 'ready-goods',
    title: 'Ready Goods & Packing',
    subtitle: 'AQL 2.5 final inspection, barcode hangtags, polybag sealing, and carton packaging.',
    badge: 'FINAL PACKING',
    statusText: 'CARTON READY',
    icon: Boxes,
    href: '/ready-goods',
    features: ['AQL Final Audit', 'Hangtag & Polybag Packing', 'Master Carton Manifest'],
  },
  {
    id: 'alter',
    title: 'Alteration & Rework',
    subtitle: 'Defect categorization, seam rework, broken stitch alterations, and re-inspection logs.',
    badge: 'REWORK CLINIC',
    statusText: 'QUALITY RECOVERY',
    icon: Wrench,
    href: '/alter',
    features: ['Defect Root-Cause Tagging', 'Line-Wise Rework Queue', 'Post-Repair AQL Clearance'],
  },
  {
    id: 'store',
    title: 'Central Store & Godown',
    subtitle: 'Raw fabric rolls, trims inventory, cutting challan issue, and finished carton storage.',
    badge: 'CENTRAL GODOWN',
    statusText: 'STORE OPS',
    icon: Store,
    href: '/store',
    features: ['Raw Material & Trim Godown', 'Cutting Challan Issues', 'Finished Carton Stock Ledger'],
  },
]

export function ModuleHubClient({ userEmail, userName, userRole }: ModuleHubClientProps) {
  const [launchingId, setLaunchingId] = useState<string | null>(null)

  const handleCardClick = (e: React.MouseEvent, mod: ModuleCardData) => {
    if (launchingId) {
      e.preventDefault()
      return
    }
    setLaunchingId(mod.id)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* 1. Page Header Card (Standard Zigza Admin Card) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564]">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Enterprise Workspace Hub
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-[#FAF7F0] text-[#3A3564] shadow-2xs tracking-wider">
                11 Operating Units
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Central manufacturing execution hub across all 11 apparel production divisions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/modules/profile"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/10 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>Company Profile</span>
          </Link>

          <form action="/auth/signout" method="POST">
            <button 
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-black/15 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-2xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* Supervisor Absentee Override Hub Banner */}
      <div className="bg-gradient-to-r from-[#3A3564] to-[#2B274C] p-5 sm:p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Floor Supervisor Operations & Absentee Override Hub
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                Executive Control
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/80 font-medium mt-0.5">
              Direct access to Lineman lines, Mending verification, QC inspection, Store issuance, and Dispatch gates.
            </p>
          </div>
        </div>

        <Link
          href="/stitching-sewing/supervisor-desk"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#FAF7F0] text-[#3A3564] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <span>Open Floor Stations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. 6 Equalized Enterprise Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {MODULES.map((mod) => {
          const Icon = mod.icon
          const isLaunching = launchingId === mod.id
          const isOtherLaunching = Boolean(launchingId && launchingId !== mod.id)

          return (
            <Link
              key={mod.id}
              href={mod.href}
              onClick={(e) => handleCardClick(e, mod)}
              aria-disabled={isOtherLaunching}
              className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border shadow-2xs transition-all duration-200 cursor-pointer ${
                isLaunching
                  ? 'border-2 border-[#3A3564] ring-2 ring-[#3A3564]/20 shadow-md bg-[#FAF7F0]/40'
                  : isOtherLaunching
                    ? 'border-black/20 opacity-50 pointer-events-none'
                    : 'border-black/80 hover:border-black hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {/* Top animated progress bar when launching */}
              {isLaunching && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#3A3564] overflow-hidden rounded-t-2xl z-20">
                  <div className="w-full h-full bg-gradient-to-r from-[#3A3564] via-[#FAF7F0] to-[#3A3564] animate-pulse" />
                </div>
              )}

              {/* Top Row: Icon Container + Category Badge */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* Icon Container */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xs transition-all duration-200 ${
                      isLaunching
                        ? 'bg-[#3A3564] text-white'
                        : 'bg-[#FAF7F0] text-[#3A3564] group-hover:scale-105'
                    }`}
                  >
                    {isLaunching ? (
                      <Loader2 className="w-6 h-6 stroke-[2.2] animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6 stroke-[2]" />
                    )}
                  </div>

                  {/* Category Badge: Rectangular with subtle rounded corners */}
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider transition-colors ${
                      isLaunching
                        ? 'bg-[#3A3564] text-white'
                        : 'bg-[#FAF7F0] text-slate-700'
                    }`}
                  >
                    {isLaunching ? 'OPENING...' : mod.badge}
                  </span>
                </div>

                {/* Card Title */}
                <h2
                  className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${
                    isLaunching ? 'text-[#3A3564]' : 'text-slate-900 group-hover:text-[#3A3564]'
                  }`}
                >
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
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isLaunching ? 'text-[#3A3564]' : 'text-slate-400'
                        }`}
                      />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Status Tag + Launch Button */}
              <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                {isLaunching ? (
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#3A3564] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#3A3564] animate-ping" />
                    <span>Opening Portal...</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {mod.statusText}
                  </span>
                )}

                {isLaunching ? (
                  <div className="inline-flex items-center gap-2 px-4.5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#3A3564] text-white border border-black shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Opening...</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#FAF7F0] text-slate-900 group-hover:bg-[#3A3564] group-hover:text-white border border-black transition-all shadow-2xs">
                    <span>Launch</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

    </div>
  )
}
