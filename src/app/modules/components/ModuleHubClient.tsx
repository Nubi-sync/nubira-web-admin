'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Factory,
  Briefcase,
  Waves,
  Printer,
  Sparkles,
  Scissors,
  ArrowRight,
  LogOut,
  User,
  Clock,
  Activity,
  Layers,
  CheckCircle2,
  ShieldCheck,
  ChevronRight
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
  statusType: 'live' | 'ready' | 'beta'
  statusText: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  accentColor?: string
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
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      )
    }
    updateDateTime()
    const timer = setInterval(updateDateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-slate-900 flex flex-col selection:bg-[#3A3564] selection:text-white">
      {/* Top Enterprise Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Factory Identity */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0 font-black text-lg">
              Z
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg truncate">
                  Zigza Enterprise Portal
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                  <ShieldCheck className="w-3 h-3" />
                  Unit 1 Master Plant
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 truncate">
                Apparel Manufacturing Execution Suite
              </p>
            </div>
          </div>

          {/* User Account & Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Shift & Time Display */}
            <div className="hidden md:flex flex-col items-end text-right px-3 py-1 rounded-xl bg-[#FAF7F0] border border-black/10">
              <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-slate-900">
                <Clock className="w-3.5 h-3.5 text-[#3A3564]" />
                <span>{currentTime || '09:00:00 AM'}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                {currentDate || 'Floor Shift'}
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-[#3A3564] text-white flex items-center justify-center text-xs font-bold font-mono shadow-2xs">
                {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {userName || userEmail.split('@')[0]}
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  {userRole || 'Plant Administrator'}
                </div>
              </div>
            </div>

            {/* Sign Out */}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F2ECE1] text-slate-700 hover:text-slate-900 border border-black/10 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-[#3A3564]" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center">
        {/* Hub Header & Direction */}
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-white text-[#3A3564] border border-black/10 shadow-2xs mb-3">
            <Activity className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>EXECUTIVE WORKSPACE HUB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Select Operational Unit
          </h1>
          <p className="mt-2 text-sm sm:text-base font-semibold text-slate-600 max-w-2xl">
            Choose a manufacturing division below to monitor live floor telemetry, manage work orders, audit quality checkpoints, and oversee plant production.
          </p>
        </div>

        {/* 6 Interactive Enterprise Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            const isCore = mod.isCore

            return (
              <Link
                key={mod.id}
                href={mod.href}
                className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                  isCore
                    ? 'bg-white border-[#3A3564]/40 shadow-sm hover:shadow-md hover:border-[#3A3564] ring-1 ring-[#3A3564]/10'
                    : 'bg-white border-black/10 shadow-2xs hover:shadow-xs hover:border-[#3A3564]/30 hover:bg-[#FAF7F0]/40'
                }`}
              >
                {/* Top Row: Icon Box + Badges */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Custom Ivory Icon Badge Container */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform duration-200 group-hover:scale-105 ${
                        isCore
                          ? 'bg-[#FAF7F0] text-[#3A3564] border-black/10 ring-2 ring-[#3A3564]/20'
                          : 'bg-[#FAF7F0] text-[#3A3564] border-black/10'
                      }`}
                    >
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    {/* Status Pill */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#FAF7F0] text-[#3A3564] border border-black/10">
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

                  {/* Module Headline */}
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-[#3A3564] transition-colors">
                    {mod.title}
                  </h2>

                  {/* Module Description */}
                  <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                    {mod.subtitle}
                  </p>

                  {/* Feature Checkpoints */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1.5">
                    {mod.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isCore ? 'text-[#3A3564]' : 'text-slate-400'}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-slate-500 uppercase tracking-wider group-hover:text-slate-900 transition-colors">
                    {mod.statusText}
                  </span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCore
                        ? 'bg-[#3A3564] text-white group-hover:bg-[#2A2649] shadow-xs'
                        : 'bg-[#FAF7F0] text-[#3A3564] group-hover:bg-[#3A3564] group-hover:text-white border border-black/10'
                    }`}
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom Support / Plant Floor Info */}
        <div className="mt-10 sm:mt-12 p-4 sm:p-5 rounded-2xl bg-white border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                Unit 1 Central Manufacturing Mesh
              </h4>
              <p className="text-xs font-semibold text-slate-500">
                Connected to mobile cutting, lineman terminals, and QC handheld scanners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/stitching-sewing/dashboard"
              className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span>Go Directly to Sewing Floor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-black/10 bg-white/60 py-4 px-4 sm:px-8 text-center">
        <p className="text-xs font-mono font-bold text-slate-400">
          ZIGZA ENTERPRISE APPAREL SUITE • PROUDLY ENGINEERED IN INDIA
        </p>
      </footer>
    </div>
  )
}
