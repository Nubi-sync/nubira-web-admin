'use client'

import React, { useState, useMemo } from 'react'
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
  Store,
  Truck,
  ArrowRight,
  LayoutGrid,
  Loader2,
  Search,
  X
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
    subtitle: 'Create tech packs, style specs, sample reviews, and design approvals.',
    badge: 'DESIGN STUDIO',
    statusText: 'SAMPLE DEVELOPMENT',
    icon: Palette,
    href: '/design',
    features: ['Tech Packs & Style Specs', 'Sample Approvals & Colors'],
  },
  {
    id: 'merchandising',
    title: 'Merchandising & Sourcing',
    subtitle: 'Manage buyer purchase orders, style costing, fabric needs, and delivery dates.',
    badge: 'MERCHANDISING',
    statusText: 'COMMERCIAL OPS',
    icon: Briefcase,
    href: '/merchandising',
    features: ['Buyer Purchase Orders', 'Fabric & Trim Costing'],
  },
  {
    id: 'cutting',
    title: 'Cutting & Lay Floor',
    subtitle: 'Plan fabric lays, cut order lots, print bundle tags, and issue cutting challans.',
    badge: 'CUTTING UNIT',
    statusText: 'LAY EXECUTION',
    icon: Scissors,
    href: '/cutting',
    features: ['Lay Planning & Roll Usage', 'Bundle Tags & Cut Challans'],
  },
  {
    id: 'printing',
    title: 'Screen & Digital Printing',
    subtitle: 'Track print lot orders, sample strike-off approvals, table runs, and daily output.',
    badge: 'PRINTING UNIT',
    statusText: 'PRINT DIVISION',
    icon: Printer,
    href: '/printing',
    features: ['Sample Strike-Off Approvals', 'Print Production & Quality'],
  },
  {
    id: 'embroidery',
    title: 'Multi-Head Embroidery',
    subtitle: 'Manage embroidery design files, machine running status, stitch counts, and daily lot output.',
    badge: 'EMBROIDERY UNIT',
    statusText: 'EMBROIDERY UNIT',
    icon: Sparkles,
    href: '/embroidery',
    features: ['Punch Files & Stitch Count', 'Machine Production Logs'],
  },
  {
    id: 'stitching-sewing',
    title: 'Stitching & Sewing Floor',
    subtitle: 'Track sewing lines, bundle issues to tailors, hourly targets, and line checking.',
    badge: 'SEWING FLOOR',
    statusText: 'FLOOR EXECUTION',
    icon: Layers,
    href: '/stitching-sewing/dashboard',
    features: ['Sewing Lines & Bundle Issue', 'Hourly Output & End-Line QC'],
  },
  {
    id: 'washing',
    title: 'Industrial Washing',
    subtitle: 'Manage garment washing recipes, machine loads, batch timings, and wash quality.',
    badge: 'WASHING UNIT',
    statusText: 'WASH FLOOR',
    icon: Waves,
    href: '/washing',
    features: ['Wash Batches & Recipes', 'Lot Inward & Outward Status'],
  },
  {
    id: 'iron',
    title: 'Ironing & Steam Pressing',
    subtitle: 'Track steam iron tables, operator pressing counts, wrinkle checks, and transfer to packing.',
    badge: 'IRONING & FINISHING',
    statusText: 'STEAM PRESSING',
    icon: Flame,
    href: '/iron',
    features: ['Table Pressing Counts', 'Finishing & Press Inspection'],
  },
  {
    id: 'ready-goods',
    title: 'Quality Clinic & Export Packing',
    subtitle: '100% final garment checking, alteration repairs, polybag tagging, and carton packing.',
    badge: 'QUALITY & PACKING',
    statusText: 'FINAL CLEARANCE',
    icon: Boxes,
    href: '/ready-goods',
    features: ['Final Inspection & Alterations', 'Polybag & Carton Packing'],
  },
  {
    id: 'store',
    title: 'Central Store & Godown',
    subtitle: 'Track fabric rolls, trims inventory, material issue to floor, and stock levels.',
    badge: 'CENTRAL STORE',
    statusText: 'STORE OPS',
    icon: Store,
    href: '/store',
    features: ['Fabric Rolls & Trims Stock', 'Material Issues & Challans'],
  },
  {
    id: 'dispatch',
    title: 'Dispatch & Delivery Logistics',
    subtitle: 'Generate delivery challans, verify carton counts, assign vehicles, and print gate passes.',
    badge: 'DISPATCH & GATE',
    statusText: 'GATE DISPATCH',
    icon: Truck,
    href: '/dispatch',
    features: ['Delivery Challans & Invoices', 'Carton Count & Gate Passes'],
  },
]

export function ModuleHubClient({ userEmail, userName, userRole, companyName, allowedModules }: ModuleHubClientProps) {
  const [launchingId, setLaunchingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return visibleModules
    const q = searchQuery.toLowerCase().trim()
    return visibleModules.filter(m => (
      m.title.toLowerCase().includes(q) ||
      m.subtitle.toLowerCase().includes(q) ||
      m.badge.toLowerCase().includes(q) ||
      m.statusText.toLowerCase().includes(q) ||
      m.features.some(f => f.toLowerCase().includes(q))
    ))
  }, [visibleModules, searchQuery])

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
    : `Central manufacturing execution hub across ${visibleModules.length === MODULES.length ? 'all 11 apparel production divisions' : 'your authorized division modules'}`

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-[1536px] w-full mx-auto select-none text-[#0B1220]">
      
      {/* 1. Page Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <LayoutGrid className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                {resolvedCompany ? (
                  <>Welcome, <span className="text-[#1D4ED8]">{resolvedCompany}</span></>
                ) : (
                  <>Enterprise <span className="text-[#1D4ED8]">Workspace</span> Hub</>
                )}
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs tracking-wider">
                {visibleModules.length} Operating Units
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              {headingSubtitle}
            </p>
          </div>
        </div>

        {/* Right Search Option */}
        <div className="w-full sm:w-80 md:w-96 relative shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules & divisions..."
              className="min-h-[42px] w-full pl-10 pr-9 py-2 sm:py-2.5 bg-[#F8FAFC] hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm font-medium text-[#0B1220] placeholder:text-slate-400 border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/20 rounded-xl transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Equalized Enterprise Module Cards Grid */}
      {filteredModules.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] mx-auto shadow-xs">
            <Search className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)]">
            No modules found
          </h3>
          <p className="text-sm sm:text-base text-slate-500 max-w-sm mx-auto font-medium">
            No operating unit matched &quot;{searchQuery}&quot;. Try a different search keyword.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="min-h-[42px] inline-flex items-center justify-center gap-2 px-4.5 py-2 sm:py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 cursor-pointer"
          >
            <span>Clear Search</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredModules.map((mod) => {
            const Icon = mod.icon
            const isLaunching = launchingId === mod.id
            const isOtherLaunching = Boolean(launchingId && launchingId !== mod.id)

            return (
              <Link
                key={mod.id}
                href={mod.href}
                onClick={(e) => handleCardClick(e, mod)}
                aria-disabled={isOtherLaunching}
                className={`group relative flex flex-col justify-between p-5 sm:p-6 md:p-7 rounded-3xl bg-white border shadow-xs transition-all duration-200 cursor-pointer ${
                  isLaunching
                    ? 'border-2 border-[#0B1220] ring-2 ring-[#0B1220]/20 shadow-md bg-[#F0FDFA]/40 -translate-y-0.5'
                    : isOtherLaunching
                      ? 'border-slate-200 opacity-50 pointer-events-none'
                      : 'border-slate-200/80 hover:border-[#0B1220]/40 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Top animated progress bar when launching */}
                {isLaunching && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0B1220] overflow-hidden rounded-t-3xl z-20">
                    <div className="w-full h-full bg-[#0B1220] animate-pulse" />
                  </div>
                )}

                {/* Top Section */}
                <div>
                  {/* Row 1: Bare Outline Icon + Category Tag */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    {isLaunching ? (
                      <Loader2 className="w-7 h-7 text-[#0B1220] stroke-[2] animate-spin" />
                    ) : (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] transition-transform duration-200 group-hover:scale-105 shadow-xs">
                        <Icon className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220] stroke-[1.75]" />
                      </div>
                    )}

                    {/* Single Top-Right Category Tag */}
                    <span
                      className={`text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider transition-colors ${
                        isLaunching
                          ? 'bg-[#0B1220] text-white'
                          : 'bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs'
                      }`}
                    >
                      {isLaunching ? 'OPENING...' : mod.badge}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h2
                    className={`text-lg sm:text-xl font-bold tracking-tight transition-colors font-[family-name:var(--font-heading)] ${
                      isLaunching ? 'text-[#0B1220]' : 'text-[#0B1220] group-hover:text-[#0B1220]'
                    }`}
                  >
                    {mod.title}
                  </h2>

                  {/* Card Description */}
                  <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed font-[family-name:var(--font-public-sans)]">
                    {mod.subtitle}
                  </p>

                  {/* 2 Feature Bullets */}
                  <div className="mt-3.5 flex flex-col gap-2">
                    {mod.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-[#0B1220]/60 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Section: Solid Filled Launch Button */}
                <div className="mt-5 flex items-center justify-end">
                  {isLaunching ? (
                    <div className="min-h-[40px] sm:min-h-[42px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1D4ED8] text-white shadow-sm shadow-blue-500/20">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Opening...</span>
                    </div>
                  ) : (
                    <div className="min-h-[40px] sm:min-h-[42px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1D4ED8] text-white shadow-sm shadow-blue-500/20 group-hover:bg-[#1E40AF] hover:shadow-md hover:shadow-blue-500/30 active:scale-[0.98] transition-all cursor-pointer text-center">
                      <span>Launch</span>
                      <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

    </div>
  )
}
