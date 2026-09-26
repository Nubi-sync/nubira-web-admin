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
  Truck,
  ArrowRight,
  LogOut,
  LayoutGrid,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from 'lucide-react'

interface ModuleHubClientProps {
  userEmail: string
  userName: string
  userRole: string
  companyName?: string
  allowedModules?: string[]
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
    features: ['Tech-Pack Spec Sheets', 'CAD Sampling Approvals'],
  },
  {
    id: 'merchandising',
    title: 'Merchandising & Sourcing',
    subtitle: 'Buyer PO allocation, BOM costing, trim procurement, and shipment schedules.',
    badge: 'BUYER & SOURCING',
    statusText: 'COMMERCIAL OPS',
    icon: Briefcase,
    href: '/merchandising',
    features: ['Buyer PO & BOM Costing', 'Trim Procurement Ledger'],
  },
  {
    id: 'cutting',
    title: 'Cutting & Lay Floor',
    subtitle: 'Fabric roll lay planning, marker efficiency, auto-cutters, and bundle generation.',
    badge: 'CUTTING DIVISION',
    statusText: 'LAY EXECUTION',
    icon: Scissors,
    href: '/cutting',
    features: ['Lay Sheet & Marker Ratio', 'Fabric Roll Consumption'],
  },
  {
    id: 'printing',
    title: 'Screen & Digital Printing',
    subtitle: 'Screen print tables, industrial DTG curing, and strike-off color approvals.',
    badge: 'SURFACE ART',
    statusText: 'PRINT DIVISION',
    icon: Printer,
    href: '/printing',
    features: ['Screen Table Lots', 'Strike-Off Approvals'],
  },
  {
    id: 'embroidery',
    title: 'Multi-Head Embroidery',
    subtitle: 'Multi-head computerized machines, punch digitizing, and stitch billing.',
    badge: 'THREAD ART',
    statusText: 'EMBROIDERY UNIT',
    icon: Sparkles,
    href: '/embroidery',
    features: ['Multi-Head Machine Runs', 'Punch File Library'],
  },
  {
    id: 'stitching-sewing',
    title: 'Stitching & Sewing Floor',
    subtitle: 'Live cutting lots, lineman bundle allocations, 3-stage QC, and store sync.',
    badge: 'SEWING FLOOR',
    statusText: 'FLOOR EXECUTION',
    icon: Layers,
    href: '/stitching-sewing/dashboard',
    features: ['Live Cutting Challans', 'Lineman Bundle Allocations'],
  },
  {
    id: 'washing',
    title: 'Industrial Washing',
    subtitle: 'Garment enzyme wash, silicon softeners, and liquor ratio batch tracking.',
    badge: 'WET PROCESSING',
    statusText: 'WASH FLOOR',
    icon: Waves,
    href: '/washing',
    features: ['Enzyme & Silicone Cycles', 'Batch Liquor Tracker'],
  },
  {
    id: 'iron',
    title: 'Ironing & Steam Pressing',
    subtitle: 'Industrial steam irons, vacuum pressing boards, temperature checks, and inline finishing.',
    badge: 'FINISHING UNIT',
    statusText: 'STEAM PRESSING',
    icon: Flame,
    href: '/iron',
    features: ['Steam Vacuum Tables', 'Inline Finish Inspection'],
  },
  {
    id: 'ready-goods',
    title: 'Quality Clinic & Export Packing',
    subtitle: 'Post-wash & iron quality inspection, cutting/print/embroidery verification, alteration mending clinic, and carton export packing.',
    badge: 'QUALITY & PACKING',
    statusText: 'FINAL CLEARANCE',
    icon: Boxes,
    href: '/ready-goods',
    features: ['Quality Checking (Cut, Print, Emb, Wash, Iron)', 'Alteration Clinic & Carton Packing'],
  },
  {
    id: 'store',
    title: 'Central Store & Godown',
    subtitle: 'Raw fabric rolls, trims inventory, cutting challan issue, and finished carton storage.',
    badge: 'CENTRAL GODOWN',
    statusText: 'STORE OPS',
    icon: Store,
    href: '/store',
    features: ['Raw Material & Trim Godown', 'Cutting Challan Issues'],
  },
  {
    id: 'dispatch',
    title: 'Dispatch & Delivery Logistics',
    subtitle: 'Delivery challans, physical counting audits, transport vehicle assignments, and gate-out passes.',
    badge: 'LOGISTICS GATE',
    statusText: 'GATE DISPATCH',
    icon: Truck,
    href: '/dispatch',
    features: ['Pre-Loading Counting Audit', 'GST Delivery Challans'],
  },
]

export function ModuleHubClient({ userEmail, userName, userRole, companyName, allowedModules }: ModuleHubClientProps) {
  const [launchingId, setLaunchingId] = useState<string | null>(null)

  const isModuleAllowed = (modHref: string) => {
    if (!allowedModules || allowedModules.includes('/modules')) return true
    if (modHref === '/ready-goods' && (allowedModules.includes('/ready-goods') || allowedModules.includes('/alter'))) {
      return true
    }
    return allowedModules.some(allowed => {
      const a = allowed.replace(/\/+$/, '')
      const h = modHref.replace(/\/+$/, '')
      return a === h || h.startsWith(`${a}/`) || a.startsWith(`${h}/`)
    })
  }

  const visibleModules = (allowedModules && !allowedModules.includes('/modules'))
    ? MODULES.filter(m => isModuleAllowed(m.href))
    : MODULES

  const handleCardClick = (e: React.MouseEvent, mod: ModuleCardData) => {
    if (launchingId) {
      e.preventDefault()
      return
    }
    setLaunchingId(mod.id)
  }

  const resolvedCompany = companyName && companyName.trim() && companyName !== 'Account Deactivated'
    ? companyName.trim()
    : ''

  const headingTitle = resolvedCompany
    ? `Welcome, ${resolvedCompany}`
    : 'Enterprise Workspace Hub'

  const headingSubtitle = resolvedCompany
    ? `Central manufacturing execution and floor operations hub for ${resolvedCompany}`
    : `Central manufacturing execution hub across ${visibleModules.length === MODULES.length ? 'all 12 apparel production divisions' : 'your authorized division modules'}`

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
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                {headingTitle}
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs tracking-wider">
                {visibleModules.length} Operating Units
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
              {headingSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Department Heads & Incharges RBAC Button (For Company SuperAdmin) */}
          <Link
            href="/modules/access-control"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            title="Appoint and manage Division Heads across all 12 manufacturing units"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Department Heads</span>
          </Link>

          <Link
            href="/modules/profile"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/10 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>Company Profile</span>
          </Link>

          <form action="/auth/signout" method="post">
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

      {/* 2. Equalized Enterprise Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {visibleModules.map((mod) => {
          const Icon = mod.icon
          const isLaunching = launchingId === mod.id
          const isOtherLaunching = Boolean(launchingId && launchingId !== mod.id)

          return (
            <Link
              key={mod.id}
              href={mod.href}
              onClick={(e) => handleCardClick(e, mod)}
              aria-disabled={isOtherLaunching}
              className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border shadow-2xs transition-all duration-200 cursor-pointer ${
                isLaunching
                  ? 'border-2 border-[#3A3564] ring-2 ring-[#3A3564]/20 shadow-md bg-[#FAF7F0]/40 -translate-y-0.5'
                  : isOtherLaunching
                    ? 'border-black/30 opacity-50 pointer-events-none'
                    : 'border-black hover:border-black hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Top animated progress bar when launching */}
              {isLaunching && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#3A3564] overflow-hidden rounded-t-3xl z-20">
                  <div className="w-full h-full bg-gradient-to-r from-[#3A3564] via-[#FAF7F0] to-[#3A3564] animate-pulse" />
                </div>
              )}

              {/* Top Section: Icon Glyph + Category Tag, Title, Subtitle, 2 Bullets */}
              <div>
                {/* Row 1: Bare Outline Icon + Category Tag */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* Icon: Plain outline glyph directly on card background */}
                  {isLaunching ? (
                    <Loader2 className="w-7 h-7 text-[#3A3564] stroke-[2] animate-spin" />
                  ) : (
                    <Icon className="w-7 h-7 text-[#3A3564] stroke-[1.75] transition-transform duration-200 group-hover:scale-105" />
                  )}

                  {/* Single Top-Right Category Tag */}
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider transition-colors ${
                      isLaunching
                        ? 'bg-[#3A3564] text-white'
                        : 'bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs'
                    }`}
                  >
                    {isLaunching ? 'OPENING...' : mod.badge}
                  </span>
                </div>

                {/* Card Title */}
                <h2
                  className={`text-lg sm:text-xl font-extrabold tracking-tight transition-colors font-[family-name:var(--font-heading)] ${
                    isLaunching ? 'text-[#3A3564]' : 'text-slate-900 group-hover:text-[#3A3564]'
                  }`}
                >
                  {mod.title}
                </h2>

                {/* Card Description */}
                <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed font-[family-name:var(--font-public-sans)]">
                  {mod.subtitle}
                </p>

                {/* 2 Feature Bullets with Simple Flat Dot (Whitespace separation, no divider line) */}
                <div className="mt-4 flex flex-col gap-2">
                  {mod.features.slice(0, 2).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isLaunching ? 'bg-[#3A3564]' : 'bg-[#3A3564]/50 group-hover:bg-[#3A3564]'
                      }`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Section: Solid Filled Indigo Launch Button (Rounded Rectangle) */}
              <div className="mt-6 flex items-center justify-end">
                {isLaunching ? (
                  <div className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#3A3564] text-white shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Opening...</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#3A3564] text-white shadow-xs group-hover:bg-[#2A2649] transition-all cursor-pointer">
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
