'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Shield,
  Lock,
  Database,
  Server,
  FileText,
  Search,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ArrowUp,
  Cpu,
  Smartphone,
  Layers,
  Users,
  EyeOff,
  Building2,
  FolderLock,
  DownloadCloud,
  FileCheck,
  Home,
  Check,
  Clock,
  Sparkles,
  RefreshCw,
  Mail,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'

function IndiaFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 225 150" 
      className={`${className} inline-block rounded-xs shadow-xs shrink-0 align-middle`}
      aria-label="Flag of India"
    >
      <rect width="225" height="50" fill="#FF9933" />
      <rect y="50" width="225" height="50" fill="#FFFFFF" />
      <rect y="100" width="225" height="50" fill="#138808" />
      <circle cx="112.5" cy="75" r="20" fill="none" stroke="#000080" strokeWidth="2.5" />
      <circle cx="112.5" cy="75" r="3.5" fill="#000080" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="112.5"
          y1="75"
          x2="112.5"
          y2="55"
          stroke="#000080"
          strokeWidth="1.2"
          transform={`rotate(${i * 15} 112.5 75)`}
        />
      ))}
    </svg>
  )
}

interface SectionItem {
  id: string
  number: string
  title: string
  icon: any
  summary: string
  keywords: string[]
}

const SECTIONS_METADATA: SectionItem[] = [
  {
    id: 'section-1',
    number: '01',
    title: 'What This Policy Covers',
    icon: Shield,
    summary: 'A simple overview of how Zigza MES protects your factory data under Indian privacy law (DPDPA 2023).',
    keywords: ['scope', 'dpdpa', 'legal', 'overview', 'rules', 'fiduciary', 'processor', 'compliance', 'india']
  },
  {
    id: 'section-2',
    number: '02',
    title: 'Your Factory Data Belongs to You',
    icon: FolderLock,
    summary: 'You own 100% of your tech packs, BOMs, CAD markers, cutting yields, and worker wage records. We never sell your data.',
    keywords: ['ownership', 'ip', 'private', 'bom', 'cad', 'markers', 'monetize', 'trade secret']
  },
  {
    id: 'section-3',
    number: '03',
    title: 'Information We Collect in Your Factory',
    icon: Layers,
    summary: 'A clear breakdown of the information collected across Design, Store, Cutting, Printing, Sewing, QC, and Packing.',
    keywords: ['data', 'collect', 'telemetry', 'divisions', 'cutting', 'sewing', 'store', 'merchandising', 'qc', 'packing']
  },
  {
    id: 'section-4',
    number: '04',
    title: 'Keeping Competing Brands & Buyers Separate',
    icon: Building2,
    summary: 'How our database prevents data leaks between competing brands (like Zara, Ollypop, or private labels) in your factory.',
    keywords: ['buyer', 'confidentiality', 'isolation', 'multi-tenant', 'rls', 'tenant', 'brands', 'separate']
  },
  {
    id: 'section-5',
    number: '05',
    title: 'How Zigza AI Uses (and Protects) Your Data',
    icon: Cpu,
    summary: 'Our strict promise: Your factory tech packs, costing sheets, and designs are never used to train public AI models.',
    keywords: ['ai', 'zigza ai', 'machine learning', 'model', 'training', 'zero-retention', 'privacy', 'llm']
  },
  {
    id: 'section-6',
    number: '06',
    title: 'Workers, Attendance & Piece Rates',
    icon: Users,
    summary: 'How worker names, operator IDs, attendance, and barcode scans are used to calculate fair, dispute-free wages.',
    keywords: ['workers', 'operators', 'piece-rate', 'wages', 'attendance', 'companion', 'scans']
  },
  {
    id: 'section-7',
    number: '07',
    title: 'Data Stored Safely in India',
    icon: Lock,
    summary: 'All your data stays inside India (AWS Mumbai) with bank-grade encryption both in transit and in storage.',
    keywords: ['residency', 'hosting', 'mumbai', 'encryption', 'security', 'backups', 'india']
  },
  {
    id: 'section-8',
    number: '08',
    title: 'Live Floor Updates & Offline Mobile App',
    icon: Smartphone,
    summary: 'How our mobile app works smoothly even in low-signal factory sheds and syncs bundle scans without errors.',
    keywords: ['websockets', 'realtime', 'offline', 'companion app', 'sync', 'floor terminal', 'mobile']
  },
  {
    id: 'section-9',
    number: '09',
    title: 'Trusted Cloud Partners We Use',
    icon: Server,
    summary: 'The trusted infrastructure providers we rely on (Supabase, AWS India, and Resend) and their security certifications.',
    keywords: ['subprocessors', 'supabase', 'aws', 'infrastructure', 'resend', 'partners', 'hosting']
  },
  {
    id: 'section-10',
    number: '10',
    title: 'Exporting or Deleting Your Data Anytime',
    icon: DownloadCloud,
    summary: 'Zero lock-in: Download all your historical factory records into Excel or CSV with one click whenever you want.',
    keywords: ['portability', 'export', 'retention', 'deletion', 'excel', 'csv', 'backup', 'download']
  },
  {
    id: 'section-11',
    number: '11',
    title: 'Your Privacy Rights Under Indian Law',
    icon: FileCheck,
    summary: 'Your rights under the DPDPA 2023: See what data is stored, correct errors, or ask for data deletion.',
    keywords: ['rights', 'dpdpa', 'principal', 'erasure', 'access', 'correction', 'grievance', 'privacy']
  },
  {
    id: 'section-12',
    number: '12',
    title: 'Questions & Contact Information',
    icon: Mail,
    summary: 'Direct contact info for our team at support@zigza.in, and resolution turnaround times.',
    keywords: ['dpo', 'support', 'contact', 'email', 'help', 'grievance', 'questions']
  }
]

export function PrivacyClient() {
  const [activeSection, setActiveSection] = useState<string>('section-1')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const lastAuditedDate = "September 2, 2026"

  // Scrollspy to update active section in sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180
      for (const section of SECTIONS_METADATA) {
        const el = document.getElementById(section.id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setIsCopied(true)
      toast.success('Privacy policy link copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  // Filter sections if searching
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS_METADATA
    const q = searchQuery.toLowerCase().trim()
    return SECTIONS_METADATA.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.keywords.some(k => k.includes(q))
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 selection:bg-[#3A3564] selection:text-white flex flex-col justify-between font-[family-name:var(--font-sans)]">
      
      {/* 1. TOP ENTERPRISE NAVIGATION BAR (Matches Zigza Homepage) */}
      <header className="sticky top-0 z-40 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#57564E]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] sm:h-[88px] flex items-center justify-between gap-3">
          
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center cursor-pointer select-none shrink-0 py-1">
            <img 
              src="/z i g z a (8).png" 
              alt="Zigza" 
              className="h-[46px] sm:h-[58px] lg:h-[64px] w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Action: Sign In text link + Try For Free Indigo button */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/login"
              className="text-[15px] font-medium text-[#57564E] hover:text-[#14140F] transition-colors cursor-pointer py-1"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-md text-[15px] font-medium bg-[#3A3564] text-white hover:bg-[#2F2B52] transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Try For Free</span>
              <ArrowRight className="w-4 h-4 text-white/70" />
            </Link>
          </div>

        </div>
      </header>

      {/* 2. HERO DOCUMENT HEADER */}
      <section className="bg-white border-b border-[#57564E]/15 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-3 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-500">
              Effective Date: <strong className="text-slate-800 font-semibold">{lastAuditedDate}</strong> · Governed by the Digital Personal Data Protection Act (DPDPA), India
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
              This document sets forth how Zigza MES collects, protects, and governs proprietary factory data, BOM specifications, cutting lots, piece-rate wages, and floor telemetry across all production divisions.
            </p>
          </div>

          {/* Quick Filter Search Bar */}
          <div className="pt-1 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search policy clauses (e.g. BOM, CAD, workers, AI, DPDPA, retention, encryption)..."
                className="w-full pl-11 pr-14 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#3A3564] text-sm shadow-2xs font-mono transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXECUTIVE COMMITMENTS STRIP (4 ENTERPRISE HIGHLIGHTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3.5">
          Executive Summary · Core Guarantees
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <FolderLock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">You Own All Your Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All your tech packs, cutting markers, BOM costings, and wage sheets belong 100% to your factory. We never sell or share your data.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Stored Safely in India</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All factory databases and backups are hosted securely in Mumbai, India (AWS) in full compliance with Indian privacy laws.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Zero AI Model Training</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zigza AI helps answer floor questions, but your sketches, formulas, and margins are never used to train public AI models.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Strict Buyer Privacy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Competing buyer brands (like Zara, Ollypop, or private labels) and other factories can never view each other's styles, orders, or pricing.
            </p>
          </div>

        </div>
      </section>

      {/* 4. MAIN TWO-COLUMN BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* A. STICKY SIDEBAR NAVIGATION (Desktop) */}
          <aside className="lg:col-span-4 sticky top-20 hidden lg:block space-y-4">
            <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Table of Contents
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {filteredSections.length} Sections
                </span>
              </div>

              <nav className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 scrollbar-thin">
                {filteredSections.map(s => {
                  const isActive = activeSection === s.id
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={`group flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all font-mono ${
                        isActive
                          ? 'bg-[#3A3564] text-white font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-[#FAF7F0] hover:text-slate-900'
                      }`}
                    >
                      <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {s.number}
                      </span>
                      <span className="line-clamp-1 leading-snug">{s.title}</span>
                    </a>
                  )
                })}
              </nav>

              {/* Quick Actions: Share & Print Buttons */}
              <div className="pt-4 border-t border-black/10 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-2 py-3 px-3.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-white text-xs sm:text-sm font-semibold text-slate-800 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#3A3564]" />}
                  <span>{isCopied ? 'Copied' : 'Share Policy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 py-3 px-3.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-white text-xs sm:text-sm font-semibold text-slate-800 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <Printer className="w-4 h-4 text-[#3A3564]" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>
          </aside>

          {/* B. MAIN LEGAL CLAUSES CONTENT */}
          <div className="lg:col-span-8 space-y-8">

            {/* SECTION 1 */}
            <article id="section-1" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  01
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 1.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    What This Policy Covers
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  This Privacy Policy explains how <strong>Zigza</strong> collects, protects, and handles your factory information. This includes all data entered through our web portals, floor tablets, and Android mobile companion app.
                </p>
                <p>
                  This policy complies with Indian law, including the <strong>Digital Personal Data Protection Act (DPDPA), 2023</strong> and the <strong>Information Technology Act, 2000</strong>.
                </p>

                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-2 mt-3">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564]" />
                    <span>Who Owns the Data vs. Who Processes It</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under Indian privacy law (DPDPA 2023), <strong>your factory is the owner of the data</strong> (Data Fiduciary). <strong>Zigza is strictly your service provider</strong> (Data Processor). We only process your factory data to help you track orders, run production, and calculate worker wages based strictly on your instructions.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 2 */}
            <article id="section-2" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  02
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 2.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Your Factory Data Belongs to You
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  In the apparel manufacturing business, your tech packs, markers, BOM costings, and wage rates are your private trade secrets. We treat them that way.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">100% Your Factory Property</div>
                    <p className="text-[11px] text-slate-600">
                      All CAD markers, cutting lay sheets, stitch timings (SAM), fabric consumption logs, and packing manifests remain 100% your private property.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">We Never Monetize Your Data</div>
                    <p className="text-[11px] text-slate-600">
                      Zigza never sells, rents, or shares your production numbers, buyer prices, or fabric usage with competing factories, buyers, or third parties.
                    </p>
                  </div>
                </div>
                <p>
                  Our commercial model is simple: you pay a software subscription. We never treat your factory data as our asset.
                </p>
              </div>
            </article>

            {/* SECTION 3 */}
            <article id="section-3" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  03
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 3.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Information We Collect in Your Factory
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  To help your factory coordinate orders smoothly from raw fabric to final carton dispatch, Zigza tracks standard production information across each department:
                </p>

                {/* Structured Table */}
                <div className="overflow-x-auto rounded-xl border border-black/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Factory Department</th>
                        <th className="py-2.5 px-3">Information Handled</th>
                        <th className="py-2.5 px-3">Why It Is Used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">01 • Design Studio</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Style sketches, measurement size charts, colorways, and fabric specifications.</td>
                        <td className="py-2.5 px-3 text-slate-600">Digitizing buyer tech packs and tracking sample approval stages.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">02 • Merchandising &amp; Sourcing</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Buyer PO numbers, order quantities, delivery dates, and trims requisitions.</td>
                        <td className="py-2.5 px-3 text-slate-600">Tracking production timelines and supplier delivery schedules.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">03 • Central Fabric Store</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Fabric roll barcodes, shade lot numbers, 4-point inspection defect logs, and rack bins.</td>
                        <td className="py-2.5 px-3 text-slate-600">Allocating fabric rolls to cutting orders and preventing shortages.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">04 • Cutting Room</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Marker lay lengths, ply counts, bundle QR codes, and fabric scrap weights.</td>
                        <td className="py-2.5 px-3 text-slate-600">Calculating fabric yields and creating bundle tickets for sewing lines.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">05 • Printing &amp; Embroidery</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Screen table run counts, ink batch recipes, and strike-off sample stamps.</td>
                        <td className="py-2.5 px-3 text-slate-600">Verifying panel artwork quality before sewing assembly.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">06 • Sewing Floor</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Operator bundle scans, line numbers, hourly targets, and inline defect counts.</td>
                        <td className="py-2.5 px-3 text-slate-600">Tracking hourly output and automatically calculating worker piece-rate pay.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">07 • Alteration &amp; Quality Check</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">100% garment inspection tags, defect types (open stitch, oil stain), and mender re-checks.</td>
                        <td className="py-2.5 px-3 text-slate-600">Reducing garment defects and clearing approved pieces for packing.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">08 • Finishing, Packing &amp; Dispatch</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Carton barcode IDs, verified carton gross weights, packing bays, and gate passes.</td>
                        <td className="py-2.5 px-3 text-slate-600">Final shipment verification and container dispatch challans.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            {/* SECTION 4 */}
            <article id="section-4" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  04
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 4.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Keeping Competing Brands &amp; Buyers Separate
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Most garment factories manufacture collections for competing brands (like Zara, Ollypop, Urban Outfitters, or private labels) at the same time on adjacent sewing lines.
                </p>
                <p>
                  To make sure no brand&rsquo;s confidential designs, prices, or orders ever leak, Zigza uses strong, built-in database safeguards:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Automatic Database Separation (Row-Level Security):</strong> Every single record—from tech packs to cut bundles—is locked with your factory&rsquo;s private account ID. It is technically impossible for one brand or factory to view another&rsquo;s records.</li>
                  <li><strong>Role-Based Staff Permissions:</strong> Line operators only see the bundles assigned to their station. Cutting masters cannot view buyer profit margins. Only designated factory administrators hold full management access.</li>
                  <li><strong>Order Protection:</strong> Fabric rolls or cut bundles meant for Buyer A cannot be mistakenly transferred to Buyer B without manager approval and an automatic audit log.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 5 */}
            <article id="section-5" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  05
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 5.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    How Zigza AI Uses (and Protects) Your Data
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Zigza includes an AI floor assistant to help production managers quickly check line delays, fabric bottlenecks, and shipment deadlines using normal everyday questions.
                </p>

                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#3A3564]" />
                    <span>Our Guarantee: Zero AI Model Training</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We make a strict promise: <strong>Your factory tech packs, pattern measurements, costing sheets, and worker wage records are never used to train or improve public or commercial AI models.</strong>
                  </p>
                </div>

                <p>
                  How Zigza AI safely works:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>When you ask a question, the assistant only looks up data inside your own private database.</li>
                  <li>Questions and answers are held in temporary memory only while you are chatting, and are discarded as soon as you close the conversation.</li>
                  <li>All AI connections use enterprise agreements with zero data storage.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 6 */}
            <article id="section-6" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  06
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 6.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Workers, Attendance &amp; Piece Rates
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Garment manufacturing depends on piece-rate pay for tailors, checkers, ironers, and packers. We handle worker records responsibly and transparently:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Worker Profiles:</strong> Basic information needed for work rosters, including worker name, employee ID, assigned sewing line, skill category, and contact phone number.</li>
                  <li><strong>Accurate Piece-Rate Wages:</strong> Each barcode bundle scan is recorded with an exact timestamp. This calculates transparent, dispute-free piece-rate earnings directly on the worker&rsquo;s wage slip.</li>
                  <li><strong>Shift Attendance:</strong> Clock-in and clock-out times are recorded to calculate overtime properly under the Factories Act, 1948.</li>
                  <li><strong>Worker Privacy:</strong> Worker phone numbers and personal details are never shared with external garment buyers. Buyer audits only see anonymized compliance summaries.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 7 */}
            <article id="section-7" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  07
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 7.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Data Stored Safely in India
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  In compliance with Section 16 of the DPDPA 2023, all your factory data is kept safely within India:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Primary Indian Cloud Region</div>
                    <p className="text-[11px] text-slate-600">
                      All live databases, file uploads, and accounts are stored in enterprise data centers located in <strong>Mumbai, India (AWS ap-south-1)</strong>.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Secure Disaster Backups</div>
                    <p className="text-[11px] text-slate-600">
                      Backups replicate to secondary secure facilities in <strong>Hyderabad, India</strong>, ensuring your data never leaves Indian borders.
                    </p>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <h4 className="font-bold text-slate-900 text-xs">Bank-Grade Encryption:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                    <li><strong>In Transit:</strong> All website visits, tablet logins, and mobile sync calls use modern TLS 1.3 encryption to protect data from eavesdropping.</li>
                    <li><strong>In Storage:</strong> All stored database records, tech pack PDFs, and backups are encrypted using AES-256 (the global banking and military standard).</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* SECTION 8 */}
            <article id="section-8" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  08
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 8.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Live Floor Updates &amp; Offline Mobile App
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Garment factories often have large metal-roof sheds where Wi-Fi or mobile networks can be weak or drop out. Our mobile companion app is designed specifically for this:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Private Live Updates:</strong> Real-time alerts (like tasks completed or bundles checked) only broadcast to users logged into your specific factory account.</li>
                  <li><strong>Offline Bundle Scanning:</strong> If Wi-Fi drops while an operator is scanning bundle tickets, the app saves each scan safely on the device with a secure timestamp.</li>
                  <li><strong>Automatic Sync &amp; No Duplicate Pay:</strong> When connection returns, the app uploads the saved scans. Our system checks timestamps to ensure no bundle is ever scanned or paid twice.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 9 */}
            <article id="section-9" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  09
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 9.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Trusted Cloud Partners We Use
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  To keep Zigza fast, secure, and always available, we work with three trusted infrastructure providers under strict privacy agreements:
                </p>

                <div className="overflow-x-auto rounded-xl border border-black/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Partner</th>
                        <th className="py-2.5 px-3">Service Provided</th>
                        <th className="py-2.5 px-3">Server Location</th>
                        <th className="py-2.5 px-3">Security Standards</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Supabase Inc.</td>
                        <td className="py-2.5 px-3 text-slate-600">Managed database, user logins, row-level security, and file storage.</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Mumbai, India</td>
                        <td className="py-2.5 px-3 text-slate-600">SOC 2 Type II, ISO 27001</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Amazon Web Services (AWS)</td>
                        <td className="py-2.5 px-3 text-slate-600">Cloud servers, network hosting, and automated encrypted backups.</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Mumbai / Hyderabad, India</td>
                        <td className="py-2.5 px-3 text-slate-600">ISO 27001, Indian Govt (MeitY) Approved</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Resend Technologies</td>
                        <td className="py-2.5 px-3 text-slate-600">Sending factory invoices, password resets, and alert emails.</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Secure Cloud Gateway</td>
                        <td className="py-2.5 px-3 text-slate-600">TLS 1.3, Zero Email Storage Agreement</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            {/* SECTION 10 */}
            <article id="section-10" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  10
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 10.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Exporting or Deleting Your Data Anytime
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  You should never feel trapped in any software. Zigza guarantees zero lock-in:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>1-Click Excel Export:</strong> Factory administrators can download all style sheets, cutting logs, worker wage slips, and dispatch records into standard <strong>Microsoft Excel (.xlsx)</strong> or <strong>CSV</strong> files at any time directly from the dashboard.</li>
                  <li><strong>Full History Available:</strong> All your floor logs and scan records remain accessible as long as your account subscription is active.</li>
                  <li><strong>Clean Account Closure:</strong> If you ever choose to leave Zigza, you have 60 days to download all your records. After that, your data is permanently deleted from all our servers.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 11 */}
            <article id="section-11" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  11
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 11.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Your Privacy Rights Under Indian Law
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Under India&rsquo;s Digital Personal Data Protection Act (DPDPA), 2023, you and your staff have clear legal rights regarding your personal information:
                </p>

                <div className="space-y-2 pt-1">
                  <div className="p-3 rounded-xl border border-black/10 bg-slate-50 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Right to See Your Data (Section 11)</div>
                      <p className="text-[11px] text-slate-600">You can ask for a summary of all personal details stored about you or your team.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-black/10 bg-slate-50 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Right to Correct Mistakes (Section 12)</div>
                      <p className="text-[11px] text-slate-600">You can update wrong names, change phone numbers, or correct any outdated information.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-black/10 bg-slate-50 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Right to Delete Data (Section 12)</div>
                      <p className="text-[11px] text-slate-600">You can ask to erase personal details when they are no longer needed for work or legal reasons.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-black/10 bg-slate-50 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Right to Help &amp; Complaints (Section 13)</div>
                      <p className="text-[11px] text-slate-600">You have the right to fast, direct help from our team if you have any privacy concerns.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-black/10 bg-slate-50 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Right to Nominate (Section 14)</div>
                      <p className="text-[11px] text-slate-600">You can name a trusted representative to manage your data rights if you are unable to do so.</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 pt-2">
                  To use any of these rights, simply email us directly at <a href="mailto:support@zigza.in" className="text-[#3A3564] font-bold underline">support@zigza.in</a>.
                </p>
              </div>
            </article>

            {/* SECTION 12 */}
            <article id="section-12" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  12
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 12.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Questions &amp; Contact Information
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  If you have questions about your data, need help with privacy, or want to request a data export, the only way to contact us is through our official email:
                </p>

                {/* Contact Card */}
                <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-3 font-mono text-xs shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Support &amp; Privacy Email:</span>
                      <a href="mailto:support@zigza.in" className="font-bold text-[#3A3564] text-base hover:underline block pt-0.5">
                        support@zigza.in
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Platform:</span>
                      <span className="font-bold text-slate-900 text-sm">Zigza MES</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                    <span>Response Time: <strong>Within 48 hours</strong></span>
                    <span>Issue Resolution: <strong>Within 30 days</strong></span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 text-[11px] text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">Appeals:</p>
                  <p>
                    If any privacy concern is not resolved to your satisfaction, Indian law allows you to escalate your complaint directly to the <strong>Data Protection Board of India</strong> under Section 18 of the DPDPA 2023.
                  </p>
                </div>
              </div>
            </article>

            {/* Back to Top */}
            <div className="pt-4 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-2xs font-mono"
              >
                <span>&larr; Return to Workspace Hub</span>
              </Link>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-black/10 bg-white hover:bg-[#FAF7F0] text-xs font-mono font-bold text-slate-700 shadow-2xs cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" />
                <span>Back to Top</span>
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* 5. ENTERPRISE FOOTER (MATCHES HOMEPAGE EXACTLY) */}
      <footer className="bg-[#FDFBF7] text-slate-600 pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
            
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="inline-block group">
                <img 
                  src="/z i g z a (8).png" 
                  alt="Zigza" 
                  className="h-10 sm:h-12 w-auto object-contain group-hover:opacity-90 transition-opacity duration-150"
                />
              </Link>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm font-normal">
                Manufacturing Execution System engineered for modern apparel factories. Replacing manual paper registers with real-time floor synchronization.
              </p>
            </div>

            {/* Platform Column */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                Platform
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/#modules" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Store &amp; Fabric GRN
                  </Link>
                </li>
                <li>
                  <Link href="/#modules" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Cutting Lot Matrix
                  </Link>
                </li>
                <li>
                  <Link href="/#modules" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Bundle Allotments
                  </Link>
                </li>
                <li>
                  <Link href="/#modules" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    3-Stage QC Audit
                  </Link>
                </li>
                <li>
                  <Link href="/#modules" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Dispatch Bay
                  </Link>
                </li>
              </ul>
            </div>

            {/* Roles Column */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                Roles
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/#roles" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Factory Heads &amp; MDs
                  </Link>
                </li>
                <li>
                  <Link href="/#roles" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Cutting Masters
                  </Link>
                </li>
                <li>
                  <Link href="/#roles" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Store Managers
                  </Link>
                </li>
                <li>
                  <Link href="/#roles" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Linemen &amp; Tailors
                  </Link>
                </li>
                <li>
                  <Link href="/#roles" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    QC Inspectors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Access & Contact Column */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                Access
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link 
                    href="/login" 
                    className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Staff Portal Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/#pricing" 
                    className="text-slate-600 hover:text-slate-900 transition-colors inline-block"
                  >
                    Subscription Plans
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:support@zigza.in" 
                    className="text-slate-600 hover:text-slate-900 transition-colors inline-block font-medium text-[#3A3564] hover:underline"
                  >
                    support@zigza.in
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/?text=Hi,%20I%20would%20like%20to%20request%20a%20live%20demo%20of%20Zigza%20MES." 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#1F9D63] hover:text-emerald-700 transition-colors inline-block font-bold"
                  >
                    WhatsApp Consultation
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Divider & Proudly Made in India Bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">
                  Proudly Made in India
                </span>
                <IndiaFlag className="w-5 h-3.5 rounded-xs shrink-0" />
              </div>
              <p className="text-xs text-slate-500">© {new Date().getFullYear()} Zigza. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <Link href="/privacy" className="text-[#3A3564] font-medium hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
              <Link href="/security" className="hover:text-slate-900 transition-colors">Security Standards</Link>
              <a href="mailto:support@zigza.in" className="hover:text-slate-900 transition-colors">Contact Support</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}

export default PrivacyClient
