'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Lock,
  Server,
  Database,
  Key,
  Cpu,
  Smartphone,
  EyeOff,
  CheckCircle2,
  Search,
  Printer,
  Share2,
  ArrowRight,
  ArrowUp,
  Check,
  Building2,
  Layers,
  Users,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  FileCheck
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
    title: 'Security Overview & Philosophy',
    icon: ShieldCheck,
    summary: 'Our defense-in-depth approach to keeping garment factory designs, BOM costs, and worker wages safe from unauthorized access.',
    keywords: ['overview', 'philosophy', 'defense', 'protection', 'factory', 'confidentiality']
  },
  {
    id: 'section-2',
    number: '02',
    title: 'Bank-Grade Encryption Everywhere',
    icon: Lock,
    summary: 'Modern TLS 1.3 encryption for all web and mobile traffic, combined with AES-256 for all stored database records and backups.',
    keywords: ['encryption', 'tls', 'aes-256', 'cryptography', 'transit', 'storage', 'rest']
  },
  {
    id: 'section-3',
    number: '03',
    title: 'Keeping Competing Brands Separate',
    icon: Building2,
    summary: 'How PostgreSQL Row-Level Security (RLS) guarantees that competing buyers (like Zara, Ollypop, or private labels) never see each other’s styles.',
    keywords: ['rls', 'row-level security', 'multi-tenant', 'isolation', 'brands', 'buyers', 'separation']
  },
  {
    id: 'section-4',
    number: '04',
    title: 'Floor App & Offline Bundle Security',
    icon: Smartphone,
    summary: 'How worker tablets and mobile scanners cache bundle tickets safely during Wi-Fi drops and prevent duplicate wage claims.',
    keywords: ['mobile', 'offline', 'tablets', 'bundles', 'scanners', 'android', 'tamper-proof']
  },
  {
    id: 'section-5',
    number: '05',
    title: 'Indian Sovereign Cloud Hosting',
    icon: Server,
    summary: 'All primary production clusters and automated backups reside physically inside the Republic of India (AWS Mumbai ap-south-1).',
    keywords: ['cloud', 'mumbai', 'aws', 'residency', 'india', 'sovereign', 'servers']
  },
  {
    id: 'section-6',
    number: '06',
    title: 'Factory Role-Based Access Control',
    icon: Users,
    summary: 'Restricting sensitive financial metrics and tech packs so operators only scan bundles while managers approve payroll.',
    keywords: ['rbac', 'roles', 'permissions', 'access control', 'staff', 'management']
  },
  {
    id: 'section-7',
    number: '07',
    title: 'Zigza AI & Zero-Model-Training',
    icon: Cpu,
    summary: 'Our strict binding guarantee: Your factory tech packs, costing sheets, and designs are never used to train public AI models.',
    keywords: ['ai', 'zigza ai', 'model', 'training', 'zero-retention', 'rag', 'llm']
  },
  {
    id: 'section-8',
    number: '08',
    title: 'Automated Backups & Disaster Recovery',
    icon: RefreshCw,
    summary: 'Continuous daily snapshots replicated to secondary facilities in Hyderabad with fast recovery time objectives.',
    keywords: ['backups', 'disaster recovery', 'snapshots', 'continuity', 'hyderabad', 'recovery']
  },
  {
    id: 'section-9',
    number: '09',
    title: 'Vulnerability Testing & Monitoring',
    icon: EyeOff,
    summary: 'Continuous 24/7 automated security scanning, penetration testing, and real-time anomaly detection across API endpoints.',
    keywords: ['vulnerability', 'penetration testing', 'monitoring', 'audit', 'alerts', 'ddos']
  },
  {
    id: 'section-10',
    number: '10',
    title: 'Physical & Network Defenses',
    icon: Key,
    summary: 'Tier-4 data center physical security, biometric entry controls, DDoS mitigation, and encrypted private VPC tunnels.',
    keywords: ['physical', 'network', 'firewall', 'vpc', 'datacenter', 'biometrics', 'ddos']
  },
  {
    id: 'section-11',
    number: '11',
    title: 'Internal Access & Audit Logging',
    icon: FileCheck,
    summary: 'Strict principle of least privilege: Zigza employees cannot view your proprietary patterns or costs without written approval.',
    keywords: ['internal access', 'audit log', 'least privilege', 'security log', 'compliance']
  },
  {
    id: 'section-12',
    number: '12',
    title: 'Security Questions & Reporting Issues',
    icon: HelpCircle,
    summary: 'Direct contact info for our technical security team at support@zigza.in for responsible disclosure and security inquiries.',
    keywords: ['reporting', 'disclosure', 'contact', 'security', 'support', 'vulnerability']
  }
]

export function SecurityClient() {
  const [activeSection, setActiveSection] = useState<string>('section-1')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const lastAudited = "September 2026"

  // Scrollspy to update active section in sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180

      for (let i = SECTIONS_METADATA.length - 1; i >= 0; i--) {
        const sectionId = SECTIONS_METADATA[i].id
        const el = document.getElementById(sectionId)
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionId)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS_METADATA
    const q = searchQuery.toLowerCase()
    return SECTIONS_METADATA.filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.keywords.some(k => k.includes(q))
    )
  }, [searchQuery])

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + '/security')
      setIsCopied(true)
      toast.success('Security link copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

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
              Security Standards
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-500">
              Audit Baseline: <strong className="text-slate-800 font-semibold">{lastAudited}</strong> · Multi-Tier Cryptographic Architecture for Apparel Floor Intelligence
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
              At Zigza, we recognize that pre-season garment designs, fabric roll allocations, cutting marker yields, and worker piece rates are critical commercial secrets. This document outlines the cryptographic and operational safeguards protecting your factory data.
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
                placeholder="Search security topics (e.g. encryption, RLS, offline, AWS, AI, backups, audit)..."
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

      {/* 3. EXECUTIVE COMMITMENTS STRIP (4 HIGHLIGHTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3.5">
          Executive Summary · Core Security Guarantees
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Bank-Grade Encryption</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              TLS 1.3 in transit and AES-256 for all PostgreSQL storage, Tech Pack PDF renders, and daily snapshots.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Row-Level Security (RLS)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Database rows are locked by factory ID so competing brands (Zara, Ollypop, etc.) can never see each other&rsquo;s orders.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Stored Safely in India</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% of production servers and backups reside physically inside India (AWS Mumbai ap-south-1).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Zero AI Model Training</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zigza AI answers floor questions without ever using your patterns, tech packs, or costs to train public models.
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

              {/* Navigation Items List */}
              <nav className="space-y-1 max-h-[58vh] overflow-y-auto pr-1">
                {filteredSections.map(s => {
                  const isActive = activeSection === s.id
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
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
                  <span>{isCopied ? 'Copied' : 'Share Security'}</span>
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 1.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Security Overview &amp; Philosophy
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Zigza is designed with a simple security principle: <strong>Defense-in-Depth</strong>. We understand that in garment manufacturing, your pre-season styles, buyer pricing, cutting efficiencies, and operator piece rates are confidential trade secrets that must be guarded against accidental leaks and malicious access.
                </p>
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-2 mt-3">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564]" />
                    <span>Our Security Commitments</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                    <li>Strict separation of customer databases so competing buyers can never cross-contaminate.</li>
                    <li>Zero storage of plain-text passwords or unprotected credentials.</li>
                    <li>Bank-grade encryption applied automatically to all data moving across the web or stored on servers.</li>
                    <li>Complete data residency on sovereign Indian soil under the DPDPA 2023.</li>
                  </ul>
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 2.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Bank-Grade Encryption Everywhere
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  We protect all factory information with high-grade cryptography across both movement and long-term storage:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#3A3564]" />
                      <span>Data In Transit (TLS 1.3)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      All connections between your web browsers, supervisor tablets, mobile scanners, and our cloud servers use modern TLS 1.3 with SHA-256 cipher suites.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#3A3564]" />
                      <span>Data At Rest (AES-256)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      All PostgreSQL database storage volumes, uploaded Tech Pack PDFs, marker graphics, and system backups are encrypted using AES-256.
                    </p>
                  </div>
                </div>
                <p>
                  Cryptographic keys are managed and rotated using Hardware Security Modules (HSMs), preventing unauthorized access even in the unlikely event of physical server loss.
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 3.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Keeping Competing Brands Separate
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Many factories run orders for competing buyer brands (e.g. Ollypop, Zara, Urban Outfitters, or private labels) at the same time. Zigza guarantees complete database separation:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>PostgreSQL Row-Level Security (RLS):</strong> Every table in our database—including orders, style sketches, cutting bundles, and wage books—is tagged with your factory&rsquo;s verified account ID. Database queries can only return rows that match your active session.</li>
                  <li><strong>Cryptographic Isolation:</strong> Even if a developer or user makes an unexpected query, the database itself denies access to rows belonging to any other factory or brand.</li>
                  <li><strong>Order Segregation:</strong> Cut pieces, bundles, and fabric rolls meant for Buyer A cannot be assigned to Buyer B without manager overrides that are permanently logged.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 4 */}
            <article id="section-4" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  04
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 4.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Floor App &amp; Offline Bundle Security
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Apparel sheds often experience dead Wi-Fi zones. Our companion mobile app provides offline functionality with strong local protection:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Encrypted Local Storage:</strong> When workers scan bundles in offline zones, the records are buffered in encrypted local storage on the phone.</li>
                  <li><strong>Tamper-Proof Timestamps:</strong> Scans include cryptographically signed device timestamps to prevent date or time manipulation.</li>
                  <li><strong>Duplicate Prevention:</strong> Upon network reconnection, the server reconciles all buffered scans using strict First-Scan-Wins logic, preventing duplicate bundle payouts.</li>
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 5.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Indian Sovereign Cloud Hosting
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  In compliance with Section 16 of the Digital Personal Data Protection Act (DPDPA), 2023, your factory data never leaves the territory of India:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Primary Cloud Zone</div>
                    <p className="text-[11px] text-slate-600">
                      Production PostgreSQL databases and application nodes are hosted in Tier-4 Amazon Web Services (AWS) facilities in <strong>Mumbai (ap-south-1), India</strong>.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Secondary Standby Zone</div>
                    <p className="text-[11px] text-slate-600">
                      Disaster recovery backups synchronously mirror to secondary secure facilities in <strong>Hyderabad, India</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* SECTION 6 */}
            <article id="section-6" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  06
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 6.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Factory Role-Based Access Control
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Not everyone on the factory floor needs to see every piece of information. Zigza enforces strict Role-Based Access Control (RBAC):
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Floor Operators:</strong> Can only scan assigned bundle tickets and view their immediate task instructions.</li>
                  <li><strong>Cutting Masters:</strong> Can manage lay lengths and cut ratios, but cannot view buyer margins or company-wide profit summaries.</li>
                  <li><strong>Store In-Charge:</strong> Can view fabric roll weights and allocations, but cannot alter tech pack measurements.</li>
                  <li><strong>Factory Admins:</strong> Hold sole management authority over user permissions, subscription billing, and 1-click Excel exports.</li>
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 7.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Zigza AI &amp; Zero-Model-Training
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Zigza includes an AI floor assistant to help production managers quickly analyze bottlenecks and fabric consumption.
                </p>
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#3A3564]" />
                    <span>Binding Zero-Model-Training Guarantee</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We maintain a strict promise: <strong>No customer factory designs, pattern measurements, BOM costings, or worker wages are ever used to train, tune, or improve public or commercial AI models.</strong>
                  </p>
                </div>
                <p>
                  When you ask a question, the assistant only searches your private factory database in temporary memory. As soon as your chat session ends, all prompt context is immediately deleted.
                </p>
              </div>
            </article>

            {/* SECTION 8 */}
            <article id="section-8" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  08
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 8.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Automated Backups &amp; Disaster Recovery
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  To protect your factory from accidental data loss or hardware outages, Zigza runs automated backup routines:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Daily Snapshots:</strong> Encrypted database backups are taken automatically every day and stored redundantly.</li>
                  <li><strong>Point-in-Time Recovery:</strong> Transaction logs are continuously preserved so records can be restored to the exact minute in the event of an emergency.</li>
                  <li><strong>Fast Restoration (RTO &lt; 2 Hours):</strong> In the rare event of a primary cloud center outage, operations can be restored within 2 hours.</li>
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 9.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Vulnerability Testing &amp; Monitoring
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Security is not a one-time setup; it is an ongoing practice:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Continuous Code Scans:</strong> Every software update undergoes automated static code analysis to catch vulnerabilities before going live.</li>
                  <li><strong>Third-Party Penetration Tests:</strong> We conduct periodic vulnerability assessments and penetration tests to verify our defenses against common web threats (OWASP Top 10).</li>
                  <li><strong>24/7 Anomaly Alerts:</strong> Automated monitors track unusual traffic spikes or failed login attempts and alert our security team instantly.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 10 */}
            <article id="section-10" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  10
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 10.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Physical &amp; Network Defenses
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Our cloud servers are hosted in ISO 27001-certified and SOC 2 Type II-audited facilities:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Physical Controls:</strong> Biometric scanners, 24/7 armed security patrols, and video surveillance protect server halls.</li>
                  <li><strong>DDoS Mitigation:</strong> Enterprise edge firewalls shield all endpoints from distributed denial-of-service (DDoS) attempts.</li>
                  <li><strong>Private Virtual Cloud (VPC):</strong> Database clusters are hosted on private subnets with no direct public internet exposure.</li>
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 11.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Internal Access &amp; Audit Logging
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  We treat our internal access controls with the highest scrutiny:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Principle of Least Privilege:</strong> Zigza personnel do not have access to your factory&rsquo;s operational data unless you explicitly request technical troubleshooting.</li>
                  <li><strong>Mandatory 2FA:</strong> All internal administrative tools require hardware or authenticator-based two-factor authentication.</li>
                  <li><strong>Immutable Audit Trails:</strong> Sensitive system events, permission updates, and data exports are logged in an immutable audit trail for complete accountability.</li>
                </ul>
              </div>
            </article>

            {/* SECTION 12 */}
            <article id="section-12" className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                  12
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Section 12.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Security Questions &amp; Reporting Issues
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  We encourage security researchers and factory IT teams to contact us directly with any security questions or vulnerability reports:
                </p>

                {/* Contact Card */}
                <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-3 font-mono text-xs shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Security &amp; Vulnerability Contact:</span>
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
                    <span>Response Time: <strong>Within 24-48 hours</strong></span>
                    <span>Responsible Disclosure: <strong>Safe Harbor Recognized</strong></span>
                  </div>
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
      <footer className="bg-[#FDFBF7] text-slate-600 pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
            
            {/* Brand Column */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-4">
              <Link href="/" className="inline-block group">
                <img 
                  src="/z i g z a (8).png" 
                  alt="Zigza" 
                  className="h-10 sm:h-12 w-auto object-contain group-hover:opacity-90 transition-opacity duration-150"
                />
              </Link>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm font-normal">
                Manufacturing Execution System engineered for modern apparel factories. Cloud-native floor synchronization, cutting optimization, piece-rate tracking, and dispatch control.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-[11px] font-mono text-slate-500 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span>AWS Mumbai (ap-south-1) • Supabase RLS Protected</span>
              </div>
            </div>

            {/* Column 1: Platform */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                Platform
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/#modules" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Floor Modules
                  </Link>
                </li>
                <li>
                  <Link href="/#workflow" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    8-Step Pipeline
                  </Link>
                </li>
                <li>
                  <Link href="/#roles" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Role Solutions
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Subscription Plans
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Frequently Asked Questions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Trust & Governance */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                Trust &amp; Governance
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/privacy" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Privacy Policy (DPDPA)
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-[#3A3564] font-medium hover:underline inline-block">
                    Security Standards
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block">
                    Indian Data Residency
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Access & Support */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                Access &amp; Support
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link 
                    href="/login" 
                    className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 font-medium"
                  >
                    <span>Staff Portal Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/register" 
                    className="text-slate-600 hover:text-slate-900 transition-colors inline-block"
                  >
                    Start 14-Day Free Trial
                  </Link>
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
                <li>
                  <a 
                    href="mailto:support@zigza.in" 
                    className="text-slate-500 hover:text-slate-800 transition-colors inline-block text-xs"
                  >
                    support@zigza.in
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Divider & Proudly Made in India Bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="text-proudly-india-black">
                  Proudly Made in India
                </span>
                <IndiaFlag className="w-5 h-3.5 rounded-xs shrink-0" />
              </div>
              <p className="text-xs text-slate-500">© {new Date().getFullYear()} Zigza. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
              <Link href="/security" className="text-[#3A3564] font-medium hover:underline">Security Standards</Link>
              <a href="mailto:support@zigza.in" className="hover:text-slate-900 transition-colors">Contact Support</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}

export default SecurityClient
