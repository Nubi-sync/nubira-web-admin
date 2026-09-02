'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import {
  Layers,
  FileSpreadsheet,
  Cpu,
  ShieldCheck,
  Truck,
  Scissors,
  CheckCircle2,
  ArrowRight,
  Boxes,
  Users,
  QrCode,
  Phone,
  Calculator,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Smartphone,
  Gauge,
  Sparkles,
  ClipboardCheck,
  PackageCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  Database,
  Lock,
  MessageSquareCheck
} from 'lucide-react'

interface ZigzaLandingPageClientProps {
  isAuthenticated?: boolean
  userEmail?: string
}

export function ZigzaLandingPageClient({
  isAuthenticated = false,
  userEmail = ''
}: ZigzaLandingPageClientProps) {
  // Navigation & Interactive States
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const [activeRoleTab, setActiveRoleTab] = useState<'MD' | 'CUTTING' | 'STORE' | 'LINEMAN' | 'QC'>('MD')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

  // ROI Calculator State
  const [monthlyPieces, setMonthlyPieces] = useState<number>(35000)
  const [linemenCount, setLinemenCount] = useState<number>(24)

  // Demo Form State
  const [demoForm, setDemoForm] = useState({
    factoryName: '',
    contactName: '',
    phone: '',
    volume: '10,000 - 50,000 Pcs',
    selectedModules: ['Store GRN', 'Excel Challan Matrix', 'Lineman Wages'],
    notes: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Calculated ROI Metrics
  const estimatedHoursSaved = Math.round((monthlyPieces / 1000) * 4.5)
  const estimatedPaperSavings = Math.round((monthlyPieces / 100) * 35)
  const disputeReductionRate = 100

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const toggleModule = (moduleName: string) => {
    setDemoForm(prev => {
      const exists = prev.selectedModules.includes(moduleName)
      return {
        ...prev,
        selectedModules: exists
          ? prev.selectedModules.filter(m => m !== moduleName)
          : [...prev.selectedModules, moduleName]
      }
    })
  }

  return (
    <div className="min-h-screen bg-[var(--bg,#EEF1F5)] text-[var(--ink,#1C2733)] font-sans antialiased selection:bg-[var(--steel,#2B4C7E)] selection:text-white">
      
      {/* =================================================================== */}
      {/* 1. STICKY ENTERPRISE HEADER                                         */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[var(--border,#E2E8F0)] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Product Name */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-[var(--steel,#2B4C7E)] text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-[var(--steel-dark,#1F3A63)] transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l16 0" />
                <path d="M20 4l-12 16" />
                <path d="M8 20l12 0" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[var(--ink,#1C2733)]">
                  Zigza
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--green-mist,#E6F6EE)] text-[var(--green,#1F9D63)] border border-[var(--green,#1F9D63)]/20">
                  MES
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[var(--ink-soft,#5B6B7C)] -mt-1 hidden sm:block">
                Apparel Manufacturing OS
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[var(--ink-soft,#5B6B7C)]">
            <a href="#modules" className="hover:text-[var(--steel,#2B4C7E)] transition-colors">
              Modules
            </a>
            <a href="#workflow" className="hover:text-[var(--steel,#2B4C7E)] transition-colors">
              Floor Workflow
            </a>
            <a href="#roles" className="hover:text-[var(--steel,#2B4C7E)] transition-colors">
              Role Solutions
            </a>
            <a href="#roi" className="hover:text-[var(--steel,#2B4C7E)] transition-colors">
              ROI Calculator
            </a>
            <a href="#faq" className="hover:text-[var(--steel,#2B4C7E)] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Top Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--green,#1F9D63)] bg-[var(--green-mist,#E6F6EE)] text-[var(--green,#1F9D63)] hover:bg-[var(--green,#1F9D63)] hover:text-white transition-all shadow-2xs cursor-pointer"
            >
              Request a Demo
            </button>

            {isAuthenticated ? (
              <Link
                href="/production-orders"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--steel,#2B4C7E)] text-white hover:bg-[var(--steel-dark,#1F3A63)] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Control Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--steel,#2B4C7E)] text-white hover:bg-[var(--steel-dark,#1F3A63)] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Login to Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. HERO SECTION WITH LIVE MES DASHBOARD PREVIEW                     */}
      {/* =================================================================== */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-4xl mx-auto space-y-5">
          
          {/* Industrial Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--steel-mist,#EEF3FA)] border border-[var(--steel-tint,#DBE6F5)] text-[11px] font-extrabold tracking-wider text-[var(--steel,#2B4C7E)] uppercase shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" />
            <span>Industrial Apparel MES • Zero Mismatch • 100% Floor Traceability</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--ink,#1C2733)] leading-[1.15]">
            The Manufacturing OS for Modern <span className="text-[var(--steel,#2B4C7E)] underline decoration-[var(--amber,#C8802B)] decoration-4 underline-offset-8">Garment Factories</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-[var(--ink-soft,#5B6B7C)] max-w-3xl mx-auto leading-relaxed font-normal">
            From fabric roll truck inward to multi-article cutting matrices, smart lineman bundle allotments, 
            3-stage live mobile QC, and buyer dispatch challans. Eliminate manual paper registers with Zigza.
          </p>

          {/* Hero Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-[var(--steel,#2B4C7E)] text-white hover:bg-[var(--steel-dark,#1F3A63)] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Request a Live Demo</span>
            </button>

            <Link
              href="/login"
              className="px-6 py-3 rounded-xl text-sm font-bold border border-[var(--border,#E2E8F0)] bg-white text-[var(--ink,#1C2733)] hover:border-[var(--steel,#2B4C7E)] hover:text-[var(--steel,#2B4C7E)] shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[var(--ink-soft,#5B6B7C)]" />
              <span>Staff Login to Portal</span>
            </Link>
          </div>

          {/* Key Metric Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[var(--ink-soft,#5B6B7C)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)]" />
              <span>1-Click Excel Challan Ingestion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)]" />
              <span>Android Mobile Floor Companion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)]" />
              <span>Instant Lineman Piece-Rate Ledger</span>
            </div>
          </div>
        </div>

        {/* Live MES Interactive Visual Dashboard Mockup */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="bg-white border-2 border-[var(--border,#E2E8F0)] rounded-2xl shadow-xl overflow-hidden">
            
            {/* Mockup Header Bar */}
            <div className="bg-[var(--steel-dark,#1F3A63)] px-4 py-3 flex items-center justify-between text-white border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="text-xs font-bold tracking-tight text-slate-300 ml-2">
                  Zigza MES • Live Plant Operations Control Center
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Floor Active</span>
              </div>
            </div>

            {/* Mockup Body Content */}
            <div className="p-5 sm:p-6 bg-[var(--bg,#EEF1F5)] space-y-5">
              
              {/* Top Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-3.5 bg-white border border-[var(--border,#E2E8F0)] rounded-xl shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase text-[var(--ink-soft,#5B6B7C)]">Active Job Work</span>
                  <p className="text-xl font-black text-[var(--ink,#1C2733)] mt-1">JOB-457</p>
                  <span className="text-[10px] font-bold text-[var(--steel,#2B4C7E)]">OLLYPOP Kids 2-Pc</span>
                </div>

                <div className="p-3.5 bg-white border border-[var(--border,#E2E8F0)] rounded-xl shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase text-[var(--ink-soft,#5B6B7C)]">Cutting Sets</span>
                  <p className="text-xl font-black text-[var(--steel,#2B4C7E)] mt-1">1,650 Sets</p>
                  <span className="text-[10px] font-bold text-[var(--ink-soft,#5B6B7C)]">14,850 Pieces</span>
                </div>

                <div className="p-3.5 bg-white border border-[var(--border,#E2E8F0)] rounded-xl shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase text-[var(--ink-soft,#5B6B7C)]">QC Pass Rate</span>
                  <p className="text-xl font-black text-[var(--green,#1F9D63)] mt-1">98.4%</p>
                  <span className="text-[10px] font-bold text-[var(--green,#1F9D63)]">14,612 Passed</span>
                </div>

                <div className="p-3.5 bg-white border border-[var(--border,#E2E8F0)] rounded-xl shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase text-[var(--ink-soft,#5B6B7C)]">Linemen Active</span>
                  <p className="text-xl font-black text-[var(--amber,#C8802B)] mt-1">24 Stations</p>
                  <span className="text-[10px] font-bold text-[var(--amber,#C8802B)]">Piece Rate Synced</span>
                </div>
              </div>

              {/* Multi-Article Size Grid Simulation */}
              <div className="bg-white border border-[var(--border,#E2E8F0)] rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[var(--steel,#2B4C7E)]" />
                    <span className="text-xs font-black text-[var(--ink,#1C2733)] uppercase tracking-wider">
                      Cutting Lot Size Breakdown Matrix (Excel Auto-Populated)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)] px-2 py-0.5 rounded">
                    Ratio 1:9 Auto-Calculated
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="border-b border-[var(--border,#E2E8F0)] text-[var(--ink-soft,#5B6B7C)]">
                        <th className="py-1.5 px-2 font-bold">Art No</th>
                        <th className="py-1.5 px-2 font-bold">Sub</th>
                        <th className="py-1.5 px-2 font-bold">Color / Combination</th>
                        <th className="py-1.5 px-2 font-bold">Size Tier</th>
                        <th className="py-1.5 px-2 font-bold text-right">Sets</th>
                        <th className="py-1.5 px-2 font-bold text-right">Total Pcs</th>
                        <th className="py-1.5 px-2 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-[var(--ink,#1C2733)]">
                      <tr>
                        <td className="py-2 px-2 font-bold font-mono text-[var(--steel,#2B4C7E)]">2027</td>
                        <td className="py-2 px-2 text-[var(--ink-soft,#5B6B7C)]">-</td>
                        <td className="py-2 px-2 font-bold text-blue-700">SKY BLUE</td>
                        <td className="py-2 px-2 font-mono">L/XXL</td>
                        <td className="py-2 px-2 text-right font-mono">550</td>
                        <td className="py-2 px-2 text-right font-bold text-[var(--green,#1F9D63)]">4,950</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-[var(--green-mist,#E6F6EE)] text-[var(--green,#1F9D63)]">
                            STITCHING
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-bold font-mono text-[var(--steel,#2B4C7E)]">2027</td>
                        <td className="py-2 px-2 text-[var(--ink-soft,#5B6B7C)]">B</td>
                        <td className="py-2 px-2 font-bold text-amber-700">MUSTARD</td>
                        <td className="py-2 px-2 font-mono">22X26</td>
                        <td className="py-2 px-2 text-right font-mono">600</td>
                        <td className="py-2 px-2 text-right font-bold text-[var(--green,#1F9D63)]">5,400</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-blue-50 text-blue-700">
                            QC READY
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-bold font-mono text-[var(--steel,#2B4C7E)]">2027</td>
                        <td className="py-2 px-2 text-[var(--ink-soft,#5B6B7C)]">C</td>
                        <td className="py-2 px-2 font-bold text-slate-700">CHARCOAL</td>
                        <td className="py-2 px-2 font-mono">28X32</td>
                        <td className="py-2 px-2 text-right font-mono">500</td>
                        <td className="py-2 px-2 text-right font-bold text-[var(--green,#1F9D63)]">4,500</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-amber-50 text-amber-700">
                            DISPATCH BAY
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* =================================================================== */}
      {/* 3. PROBLEM VS. SOLUTION SECTION (TRADITIONAL VS. ZIGZA)            */}
      {/* =================================================================== */}
      <section className="py-16 bg-white border-y border-[var(--border,#E2E8F0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink,#1C2733)] tracking-tight">
              Why Garment Factories Are Switching from Paper to Zigza
            </h2>
            <p className="text-xs sm:text-sm text-[var(--ink-soft,#5B6B7C)] mt-2">
              Compare the friction of traditional manual paper registers with Zigza's digital execution platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Traditional Challenges Card */}
            <div className="p-6 sm:p-7 rounded-2xl border-2 border-red-200 bg-red-50/40 space-y-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-black uppercase tracking-wider">Traditional Manufacturing Pain</h3>
              </div>
              <ul className="space-y-3 text-xs text-[var(--ink,#1C2733)]">
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Lost Paper Challans & Slips:</strong> Supplier delivery slips get misplaced, causing raw fabric shortages and billing confusion.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Lineman Wage Disputes:</strong> Daily arguments over bundle piece counts and missing stitched units during wage payouts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Late QC Defect Discovery:</strong> Stains and stitching alterations discovered at packing bay, causing shipment delays.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>WIP Blind Spots:</strong> Factory owners have zero real-time visibility into floor bottlenecks or cutting table pace.</span>
                </li>
              </ul>
            </div>

            {/* Zigza Digital Solution Card */}
            <div className="p-6 sm:p-7 rounded-2xl border-2 border-[var(--green,#1F9D63)] bg-[var(--green-mist,#E6F6EE)]/50 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[var(--green,#1F9D63)]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-black uppercase tracking-wider">The Zigza MES Digital Solution</h3>
              </div>
              <ul className="space-y-3 text-xs text-[var(--ink,#1C2733)]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0 mt-0.5" />
                  <span><strong>Digital Gate Inward (GRN):</strong> Supplier paper slips photographed on mobile and instantly reconciled with fabric roll lots.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0 mt-0.5" />
                  <span><strong>1-Click Excel Challan Import:</strong> Raw buyer spreadsheets automatically map to cutting lot matrices and size tiers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0 mt-0.5" />
                  <span><strong>Dispute-Free Piece-Rate Wages:</strong> Automated bundle allocation per lineman with live mobile app verification.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0 mt-0.5" />
                  <span><strong>3-Stage Live QC & Alteration Routing:</strong> Immediate defect tagging on mobile with instant supervisor rework dispatch.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. 6 CORE MODULAR ENGINES (DETAILED SHOWCASE WITH VECTOR GRAPHICS)   */}
      {/* =================================================================== */}
      <section id="modules" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)] text-[10.5px] font-extrabold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>End-to-End Modular Suite</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--ink,#1C2733)] tracking-tight">
            6 Specialized Engines Engineered for Garment Floor Precision
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-soft,#5B6B7C)] mt-2">
            Every department in your factory gets dedicated tools connected to a single live database.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Module 1: Store GRN */}
          <div className="p-6 bg-white border border-[var(--border,#E2E8F0)] rounded-2xl shadow-2xs hover:border-[var(--steel,#2B4C7E)] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--steel,#2B4C7E)] bg-[var(--steel-mist,#EEF3FA)] px-2 py-0.5 rounded">
              Module 1
            </span>
            <h3 className="text-base font-bold text-[var(--ink,#1C2733)] mt-2 mb-1.5">
              Truck Inward & Store GRN
            </h3>
            <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed mb-4">
              Capture delivery challan slips via mobile camera. Log fabric rolls (Sinker, Rib), lot barcodes (`T-03`), 
              buttons, and track supplier due accessories.
            </p>
            <div className="border-t border-slate-100 pt-3 text-[11px] font-bold text-[var(--steel,#2B4C7E)] flex items-center justify-between">
              <span>Zero Lost Slips</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green,#1F9D63)]" />
            </div>
          </div>

          {/* Module 2: Excel Challan Matrix */}
          <div className="p-6 bg-white border border-[var(--border,#E2E8F0)] rounded-2xl shadow-2xs hover:border-[var(--steel,#2B4C7E)] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[var(--green-mist,#E6F6EE)] text-[var(--green,#1F9D63)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--green,#1F9D63)] bg-[var(--green-mist,#E6F6EE)] px-2 py-0.5 rounded">
              Module 2
            </span>
            <h3 className="text-base font-bold text-[var(--ink,#1C2733)] mt-2 mb-1.5">
              1-Click Excel Challan Ingestion
            </h3>
            <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed mb-4">
              Upload buyer spreadsheets to instantly generate multi-article size matrices (`L/XXL`, `22x26`), 
              sets, and piece ratios without manual data entry.
            </p>
            <div className="border-t border-slate-100 pt-3 text-[11px] font-bold text-[var(--steel,#2B4C7E)] flex items-center justify-between">
              <span>100% Sizing Matrix Accuracy</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green,#1F9D63)]" />
            </div>
          </div>

          {/* Module 3: Piece-Rate Wages */}
          <div className="p-6 bg-white border border-[var(--border,#E2E8F0)] rounded-2xl shadow-2xs hover:border-[var(--steel,#2B4C7E)] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[var(--amber-mist,#FBF0E1)] text-[var(--amber,#C8802B)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Scissors className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--amber,#C8802B)] bg-[var(--amber-mist,#FBF0E1)] px-2 py-0.5 rounded">
              Module 3
            </span>
            <h3 className="text-base font-bold text-[var(--ink,#1C2733)] mt-2 mb-1.5">
              Smart Allotment & Piece-Rate Wages
            </h3>
            <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed mb-4">
              Allot cutting lots entirely or split by color combinations across linemen. Automated wage 
              calculation with zero discrepancy.
            </p>
            <div className="border-t border-slate-100 pt-3 text-[11px] font-bold text-[var(--steel,#2B4C7E)] flex items-center justify-between">
              <span>Dispute-Free Wage Ledger</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green,#1F9D63)]" />
            </div>
          </div>

          {/* Module 4: Floor Mobile App */}
          <div className="p-6 bg-white border border-[var(--border,#E2E8F0)] rounded-2xl shadow-2xs hover:border-[var(--steel,#2B4C7E)] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Module 4
            </span>
            <h3 className="text-base font-bold text-[var(--ink,#1C2733)] mt-2 mb-1.5">
              Mobile Floor Supervisor App
            </h3>
            <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed mb-4">
              Android companion app with offline support. Supervisors record daily production, scan bundle QR 
              barcodes, and view active line targets.
            </p>
            <div className="border-t border-slate-100 pt-3 text-[11px] font-bold text-[var(--steel,#2B4C7E)] flex items-center justify-between">
              <span>Real-Time Floor Sync</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green,#1F9D63)]" />
            </div>
          </div>

          {/* Module 5: 3-Stage QC Gate */}
          <div className="p-6 bg-white border border-[var(--border,#E2E8F0)] rounded-2xl shadow-2xs hover:border-[var(--steel,#2B4C7E)] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              Module 5
            </span>
            <h3 className="text-base font-bold text-[var(--ink,#1C2733)] mt-2 mb-1.5">
              3-Stage Quality Control Gate
            </h3>
            <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed mb-4">
              Lightbox garment audit with passing vs defect classification (stain, stitch open, mending). 
              Instant floor alteration re-routing.
            </p>
            <div className="border-t border-slate-100 pt-3 text-[11px] font-bold text-[var(--steel,#2B4C7E)] flex items-center justify-between">
              <span>Zero Defect Shipments</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green,#1F9D63)]" />
            </div>
          </div>

          {/* Module 6: Dispatch Bay */}
          <div className="p-6 bg-white border border-[var(--border,#E2E8F0)] rounded-2xl shadow-2xs hover:border-[var(--steel,#2B4C7E)] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <PackageCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Module 6
            </span>
            <h3 className="text-base font-bold text-[var(--ink,#1C2733)] mt-2 mb-1.5">
              Dispatch Bay & Carton Reconciliation
            </h3>
            <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed mb-4">
              Carton packing lists, buyer delivery challan generation with transport metadata, and automated 
              finished goods inventory deductions.
            </p>
            <div className="border-t border-slate-100 pt-3 text-[11px] font-bold text-[var(--steel,#2B4C7E)] flex items-center justify-between">
              <span>E-Waybill & Challan Ready</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green,#1F9D63)]" />
            </div>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. 5-STEP FACTORY FLOW PIPELINE (ROADMAP)                          */}
      {/* =================================================================== */}
      <section id="workflow" className="py-16 bg-white border-y border-[var(--border,#E2E8F0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink,#1C2733)] tracking-tight">
              The 5-Step Synchronized Factory Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-[var(--ink-soft,#5B6B7C)] mt-2">
              From raw cloth arrival to buyer truck dispatch — every milestone is tracked in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Step 1 */}
            <div className="p-4 bg-[var(--bg,#EEF1F5)] border border-[var(--border,#E2E8F0)] rounded-xl relative">
              <div className="w-8 h-8 rounded-lg bg-[var(--steel,#2B4C7E)] text-white text-xs font-bold flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="text-xs font-black text-[var(--ink,#1C2733)] uppercase">Store GRN</h4>
              <p className="text-[11px] text-[var(--ink-soft,#5B6B7C)] mt-1">
                Fabric roll barcoding and paper delivery slip photo capture.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-[var(--bg,#EEF1F5)] border border-[var(--border,#E2E8F0)] rounded-xl relative">
              <div className="w-8 h-8 rounded-lg bg-[var(--steel,#2B4C7E)] text-white text-xs font-bold flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="text-xs font-black text-[var(--ink,#1C2733)] uppercase">Excel Cutting Matrix</h4>
              <p className="text-[11px] text-[var(--ink-soft,#5B6B7C)] mt-1">
                Automatic generation of size tiers (`L/XXL`, `22x26`) from buyer Excel sheet.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-[var(--bg,#EEF1F5)] border border-[var(--border,#E2E8F0)] rounded-xl relative">
              <div className="w-8 h-8 rounded-lg bg-[var(--steel,#2B4C7E)] text-white text-xs font-bold flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="text-xs font-black text-[var(--ink,#1C2733)] uppercase">Lineman Allotment</h4>
              <p className="text-[11px] text-[var(--ink-soft,#5B6B7C)] mt-1">
                Color-split bundle distribution with piece-rate rate tracking.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-[var(--bg,#EEF1F5)] border border-[var(--border,#E2E8F0)] rounded-xl relative">
              <div className="w-8 h-8 rounded-lg bg-[var(--steel,#2B4C7E)] text-white text-xs font-bold flex items-center justify-center mb-3">
                4
              </div>
              <h4 className="text-xs font-black text-[var(--ink,#1C2733)] uppercase">3-Stage QC Audit</h4>
              <p className="text-[11px] text-[var(--ink-soft,#5B6B7C)] mt-1">
                Mobile garment passing and defect alteration routing.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 bg-[var(--bg,#EEF1F5)] border border-[var(--border,#E2E8F0)] rounded-xl relative">
              <div className="w-8 h-8 rounded-lg bg-[var(--steel,#2B4C7E)] text-white text-xs font-bold flex items-center justify-center mb-3">
                5
              </div>
              <h4 className="text-xs font-black text-[var(--ink,#1C2733)] uppercase">Buyer Dispatch</h4>
              <p className="text-[11px] text-[var(--ink-soft,#5B6B7C)] mt-1">
                Carton packing verification and delivery challan issuance.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 6. SOLUTIONS TAILORED FOR FACTORY ROLES (INTERACTIVE TABS)          */}
      {/* =================================================================== */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink,#1C2733)] tracking-tight">
            Built for Every Stakeholder on the Factory Floor
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-soft,#5B6B7C)] mt-2">
            Tailored interfaces engineered for the specific daily goals of each factory role.
          </p>

          {/* Role Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {(
              [
                { key: 'MD', label: 'Factory Owners / MDs' },
                { key: 'CUTTING', label: 'Cutting Masters' },
                { key: 'STORE', label: 'Store Managers' },
                { key: 'LINEMAN', label: 'Linemen & Tailors' },
                { key: 'QC', label: 'QC Inspectors' }
              ] as const
            ).map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveRoleTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === tab.key
                    ? 'bg-[var(--steel,#2B4C7E)] text-white shadow-xs'
                    : 'bg-white border border-[var(--border,#E2E8F0)] text-[var(--ink-soft,#5B6B7C)] hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Box */}
        <div className="max-w-4xl mx-auto bg-white border border-[var(--border,#E2E8F0)] rounded-2xl p-6 sm:p-8 shadow-sm">
          {activeRoleTab === 'MD' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--steel,#2B4C7E)]">
                <Users className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--ink,#1C2733)]">For Factory Managing Directors & Plant Heads</h3>
              </div>
              <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed">
                Gain 360-degree real-time visibility into active buyer job work, WIP throughput, and piece-rate 
                labor expenses across all lines. Stop relying on stale paper registers and eliminate ghost piece losses.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-[var(--ink,#1C2733)]">
                <div className="p-3 bg-[var(--bg,#EEF1F5)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0" />
                  <span>Real-Time Plant Utilization & Bottlenecks</span>
                </div>
                <div className="p-3 bg-[var(--bg,#EEF1F5)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0" />
                  <span>Accurate Labor Wage & Piece Accounting</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'CUTTING' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--steel,#2B4C7E)]">
                <Scissors className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--ink,#1C2733)]">For Cutting Masters & Table Supervisors</h3>
              </div>
              <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed">
                Upload raw buyer Excel sheets to instantly generate multi-article size grids. Never spend hours doing 
                manual ratio calculations (`1:9`, `L/XXL`, `22x26`). Generate bundle allotment cards in 1 click.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-[var(--ink,#1C2733)]">
                <div className="p-3 bg-[var(--bg,#EEF1F5)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0" />
                  <span>1-Click Excel Template & Bulk Upload</span>
                </div>
                <div className="p-3 bg-[var(--bg,#EEF1F5)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0" />
                  <span>Zero Ratio Math Mistakes</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'STORE' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--steel,#2B4C7E)]">
                <Truck className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--ink,#1C2733)]">For Store Managers & Gate Keepers</h3>
              </div>
              <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed">
                Photograph supplier delivery slips at the truck bay and assign roll lot barcodes. Track pending trims 
                and accessories with automatic follow-up tags before cutting begins.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-[var(--ink,#1C2733)]">
                <div className="p-3 bg-[var(--bg,#EEF1F5)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0" />
                  <span>Delivery Slip Camera Capture</span>
                </div>
                <div className="p-3 bg-[var(--bg,#EEF1F5)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0" />
                  <span>Supplier Due Accessory Follow-up</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'LINEMAN' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--steel,#2B4C7E)]">
                <Scissors className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--ink,#1C2733)]">For Stitching Linemen & Operators</h3>
              </div>
              <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed">
                Clear transparency over daily stitched bundles and piece-rate earnings. No more lost piece counts or 
                conflicts at payout time. Every completed bundle is verifiable on mobile.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-[var(--ink,#1C2733)]">
                <div className="p-3 bg-[var(--bg,#EEF1F5)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0" />
                  <span>Transparent Daily Wage Record</span>
                </div>
                <div className="p-3 bg-[var(--bg,#EEF1F5)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0" />
                  <span>Color & Bundle Breakdown</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'QC' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--steel,#2B4C7E)]">
                <ClipboardCheck className="w-5 h-5" />
                <h3 className="text-lg font-bold text-[var(--ink,#1C2733)]">For QC Inspectors & Finishing Supervisors</h3>
              </div>
              <p className="text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed">
                Log inspected pieces at lightbox checkpoints with 1 tap. Tag alterations with specific defect reasons 
                (oil stain, stitch open, measurement fault) and route them back to responsible lines immediately.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-[var(--ink,#1C2733)]">
                <div className="p-3 bg-[var(--bg,#EEF1F5)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0" />
                  <span>1-Tap Pass & Alteration Logging</span>
                </div>
                <div className="p-3 bg-[var(--bg,#EEF1F5)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--green,#1F9D63)] shrink-0" />
                  <span>Instant Lineman Alteration Accountability</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </section>

      {/* =================================================================== */}
      {/* 7. INTERACTIVE ROI & COST SAVINGS CALCULATOR                        */}
      {/* =================================================================== */}
      <section id="roi" className="py-16 bg-white border-y border-[var(--border,#E2E8F0)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--green-mist,#E6F6EE)] text-[var(--green,#1F9D63)] text-[10.5px] font-extrabold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive ROI Estimator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink,#1C2733)] tracking-tight">
              Estimate Your Plant's Monthly Time & Error Savings
            </h2>
            <p className="text-xs sm:text-sm text-[var(--ink-soft,#5B6B7C)] mt-1.5">
              Adjust the sliders based on your factory's production volume to see estimated impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[var(--bg,#EEF1F5)] p-6 sm:p-8 rounded-2xl border border-[var(--border,#E2E8F0)]">
            
            {/* Sliders Area */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-[var(--ink,#1C2733)] mb-2">
                  <span>Monthly Garment Output:</span>
                  <span className="text-sm font-black text-[var(--steel,#2B4C7E)] font-mono">
                    {monthlyPieces.toLocaleString()} Pieces
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={monthlyPieces}
                  onChange={e => setMonthlyPieces(Number(e.target.value))}
                  className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[var(--steel,#2B4C7E)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--ink-soft,#5B6B7C)] mt-1">
                  <span>5,000 Pcs</span>
                  <span>100,000 Pcs</span>
                  <span>200,000+ Pcs</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-[var(--ink,#1C2733)] mb-2">
                  <span>Active Stitching Linemen:</span>
                  <span className="text-sm font-black text-[var(--steel,#2B4C7E)] font-mono">
                    {linemenCount} Operators
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={linemenCount}
                  onChange={e => setLinemenCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[var(--steel,#2B4C7E)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--ink-soft,#5B6B7C)] mt-1">
                  <span>5 Linemen</span>
                  <span>50 Linemen</span>
                  <span>100+ Linemen</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="bg-white p-6 rounded-xl border border-[var(--border,#E2E8F0)] shadow-sm space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-soft,#5B6B7C)]">
                Projected Monthly Savings
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--steel-mist,#EEF3FA)] rounded-lg">
                  <span className="text-[10px] font-bold text-[var(--steel,#2B4C7E)]">Floor Hours Saved</span>
                  <p className="text-xl font-black text-[var(--steel,#2B4C7E)] font-mono">
                    ~{estimatedHoursSaved} hrs/mo
                  </p>
                </div>

                <div className="p-3 bg-[var(--green-mist,#E6F6EE)] rounded-lg">
                  <span className="text-[10px] font-bold text-[var(--green,#1F9D63)]">Dispute Reduction</span>
                  <p className="text-xl font-black text-[var(--green,#1F9D63)] font-mono">
                    {disputeReductionRate}%
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">Zero Mismatch Guarantee</span>
                <p className="text-[11px] text-amber-800">
                  Every piece cut on table is reconciled across lineman bundles, QC pass counts, and dispatch cartons.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-2.5 bg-[var(--steel,#2B4C7E)] hover:bg-[var(--steel-dark,#1F3A63)] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Schedule Free Factory Audit
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (ACCORDION FAQ)                       */}
      {/* =================================================================== */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink,#1C2733)] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-soft,#5B6B7C)] mt-2">
            Everything you need to know about implementing Zigza MES in your garment manufacturing unit.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Can we import our existing buyer Excel challans directly into Zigza?',
              a: 'Yes! Zigza includes a 1-Click Excel Template and Bulk Ingestion module. You can download our standard template or upload your existing spreadsheets (.xlsx, .xls, .csv). Zigza automatically maps article numbers, size tiers (L/XXL, 22x26, 28x32), and piece ratios.'
            },
            {
              q: 'Does Zigza require expensive hardware on the factory floor?',
              a: 'No. Zigza is designed to run on standard Android smartphones and budget tablets for supervisors and QC stations. The admin control center runs in any standard web browser on PCs and laptops.'
            },
            {
              q: 'How does Zigza handle lineman piece-rate wage calculation?',
              a: 'You can allot cutting lots to linemen either as full challans or split across color combinations. As garments are completed and inspected, the system automatically credits each lineman at their defined piece rate, producing a clear, transparent wage ledger with zero arguments.'
            },
            {
              q: 'What happens if internet connectivity drops on the floor?',
              a: 'The Zigza Android mobile companion app has offline-resilient local caching. Supervisors and inspectors can continue logging production and bundle scans without disruption. Data synchronizes automatically as soon as internet connection is restored.'
            },
            {
              q: 'Is data isolated for different brands and job-work buyers?',
              a: 'Yes. Zigza enforces multi-brand partitioning. You can track separate production lines and dispatch challans for Ollypop, First Smile, Lazy Bones, or your own in-house brands with complete data isolation.'
            },
            {
              q: 'How fast can a garment factory go live with Zigza?',
              a: 'Most factories complete master setup (articles, rates, lineman profiles) and go live on their first cutting lot within 24 to 48 hours of onboarding.'
            }
          ].map((faq, idx) => {
            const isOpen = expandedFaq === idx
            return (
              <div
                key={idx}
                className="bg-white border border-[var(--border,#E2E8F0)] rounded-xl overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[var(--ink,#1C2733)] hover:text-[var(--steel,#2B4C7E)] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[var(--steel,#2B4C7E)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[var(--ink-soft,#5B6B7C)] leading-relaxed border-t border-slate-50 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 9. BOTTOM CALL TO ACTION BANNER & REQUEST DEMO FORM                 */}
      {/* =================================================================== */}
      <section className="bg-[var(--steel-dark,#1F3A63)] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Left Text */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-xs font-bold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ready for Modern Apparel Execution?</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Transform Your Garment Factory with Zigza Today
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Book a personalized 20-minute live demonstration tailored to your plant capacity, 
              cutting tables, and floor workflow.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://wa.me/?text=Hi,%20I%20would%20like%20to%20request%20a%20live%20demo%20of%20Zigza%20MES%20for%20our%20garment%20factory."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--green,#1F9D63)] hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Instant WhatsApp Consultation</span>
              </a>
            </div>
          </div>

          {/* Right Consultation Form Card */}
          <div className="bg-white text-[var(--ink,#1C2733)] p-6 rounded-2xl shadow-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-[var(--ink,#1C2733)] mb-1">
              Request a Live Demonstration
            </h3>
            <p className="text-[11px] text-[var(--ink-soft,#5B6B7C)] mb-4">
              Enter your factory details for a customized walkthrough.
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-[var(--green-mist,#E6F6EE)] rounded-xl border border-[var(--green,#1F9D63)]/30 text-center space-y-2.5">
                <CheckCircle2 className="w-10 h-10 text-[var(--green,#1F9D63)] mx-auto" />
                <h4 className="text-sm font-bold text-[var(--green,#1F9D63)]">Demo Request Received!</h4>
                <p className="text-xs text-[var(--ink-soft,#5B6B7C)]">
                  Our plant solutions team will contact you within 24 hours to schedule your live walkthrough.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-2 text-xs font-bold text-[var(--steel,#2B4C7E)] hover:underline cursor-pointer"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink,#1C2733)] mb-1">
                    Factory / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shree Garments / Ollypop Job Work"
                    value={demoForm.factoryName}
                    onChange={e => setDemoForm({ ...demoForm, factoryName: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border,#E2E8F0)] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--ink,#1C2733)] mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={demoForm.contactName}
                      onChange={e => setDemoForm({ ...demoForm, contactName: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border,#E2E8F0)] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--ink,#1C2733)] mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={demoForm.phone}
                      onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border,#E2E8F0)] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink,#1C2733)] mb-1">
                    Monthly Output Volume
                  </label>
                  <select
                    value={demoForm.volume}
                    onChange={e => setDemoForm({ ...demoForm, volume: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border,#E2E8F0)] rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
                  >
                    <option value="< 10,000 Pcs">Less than 10,000 Pieces / mo</option>
                    <option value="10,000 - 50,000 Pcs">10,000 - 50,000 Pieces / mo</option>
                    <option value="50,000 - 200,000 Pcs">50,000 - 200,000 Pieces / mo</option>
                    <option value="200,000+ Pcs">200,000+ Pieces / mo (Enterprise)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[var(--steel,#2B4C7E)] hover:bg-[var(--steel-dark,#1F3A63)] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Demo Request</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 10. ENTERPRISE FOOTER                                              */}
      {/* =================================================================== */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs">
          
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--steel,#2B4C7E)] text-white flex items-center justify-center font-bold">
                Z
              </div>
              <span className="text-base font-black text-white">Zigza MES</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Industrial Manufacturing Execution System by Nubira Creation. Powering modern apparel factories with 
              zero-mismatch floor tracking.
            </p>
          </div>

          {/* Core Modules */}
          <div>
            <h5 className="font-bold text-white mb-2.5 uppercase tracking-wider text-[11px]">Factory Modules</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#modules" className="hover:text-white transition-colors">Store GRN & Rolls</a></li>
              <li><a href="#modules" className="hover:text-white transition-colors">Excel Challan Matrix</a></li>
              <li><a href="#modules" className="hover:text-white transition-colors">Piece-Rate Wages</a></li>
              <li><a href="#modules" className="hover:text-white transition-colors">3-Stage QC Audit</a></li>
              <li><a href="#modules" className="hover:text-white transition-colors">Dispatch & Packing</a></li>
            </ul>
          </div>

          {/* Plant Roles */}
          <div>
            <h5 className="font-bold text-white mb-2.5 uppercase tracking-wider text-[11px]">Role Solutions</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#roles" className="hover:text-white transition-colors">Factory MDs</a></li>
              <li><a href="#roles" className="hover:text-white transition-colors">Cutting Masters</a></li>
              <li><a href="#roles" className="hover:text-white transition-colors">Store Keepers</a></li>
              <li><a href="#roles" className="hover:text-white transition-colors">Linemen & Tailors</a></li>
              <li><a href="#roles" className="hover:text-white transition-colors">QC Inspectors</a></li>
            </ul>
          </div>

          {/* Portal Access */}
          <div>
            <h5 className="font-bold text-white mb-2.5 uppercase tracking-wider text-[11px]">System Gateway</h5>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-[var(--green,#1F9D63)] hover:text-emerald-400 font-bold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Staff Portal Login</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Schedule Demo
                </button>
              </li>
              <li>
                <span className="text-slate-500">Cloud Sync & Mobile Active</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>© {new Date().getFullYear()} Zigza MES • Nubira Creation. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Industrial Security • TLS 1.3 Encryption</span>
          </p>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* 11. INTERACTIVE REQUEST DEMO MODAL                                  */}
      {/* =================================================================== */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-[var(--border,#E2E8F0)] my-auto relative">
            
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[var(--steel,#2B4C7E)] text-white flex items-center justify-center font-bold text-xs">
                Z
              </div>
              <h3 className="text-base font-bold text-[var(--ink,#1C2733)]">
                Request a Live Zigza Demo
              </h3>
            </div>
            <p className="text-xs text-[var(--ink-soft,#5B6B7C)] mb-4">
              Schedule a personalized walkthrough of the apparel MES platform.
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-[var(--green-mist,#E6F6EE)] rounded-xl border border-[var(--green,#1F9D63)]/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[var(--green,#1F9D63)] mx-auto" />
                <h4 className="text-sm font-bold text-[var(--green,#1F9D63)]">Demo Scheduled!</h4>
                <p className="text-xs text-[var(--ink-soft,#5B6B7C)]">
                  Thank you, <strong>{demoForm.contactName || 'Plant Head'}</strong>. Our garment solutions engineer 
                  will connect with you on WhatsApp / Phone within 24 hours.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false)
                      setIsDemoModalOpen(false)
                    }}
                    className="px-4 py-2 bg-[var(--steel,#2B4C7E)] text-white rounded-lg text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink,#1C2733)] mb-1">
                    Factory / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ollypop Garment Unit"
                    value={demoForm.factoryName}
                    onChange={e => setDemoForm({ ...demoForm, factoryName: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border,#E2E8F0)] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--ink,#1C2733)] mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anil Gupta"
                      value={demoForm.contactName}
                      onChange={e => setDemoForm({ ...demoForm, contactName: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border,#E2E8F0)] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--ink,#1C2733)] mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={demoForm.phone}
                      onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border,#E2E8F0)] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink,#1C2733)] mb-1">
                    Monthly Production Capacity
                  </label>
                  <select
                    value={demoForm.volume}
                    onChange={e => setDemoForm({ ...demoForm, volume: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border,#E2E8F0)] rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
                  >
                    <option value="< 10,000 Pcs">Less than 10,000 Pcs/mo</option>
                    <option value="10,000 - 50,000 Pcs">10,000 - 50,000 Pcs/mo</option>
                    <option value="50,000 - 200,000 Pcs">50,000 - 200,000 Pcs/mo</option>
                    <option value="200,000+ Pcs">200,000+ Pcs/mo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink,#1C2733)] mb-1.5">
                    Modules Interested In
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Store GRN', 'Excel Challan Matrix', 'Lineman Wages', 'Mobile Floor App', 'QC Gate', 'Dispatch'].map(mod => {
                      const isSelected = demoForm.selectedModules.includes(mod)
                      return (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => toggleModule(mod)}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--steel,#2B4C7E)] text-white border-[var(--steel,#2B4C7E)]'
                              : 'bg-slate-50 text-[var(--ink-soft,#5B6B7C)] border-[var(--border,#E2E8F0)] hover:bg-slate-100'
                          }`}
                        >
                          {mod}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[var(--steel,#2B4C7E)] hover:bg-[var(--steel-dark,#1F3A63)] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-3"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Live Demo Booking</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
