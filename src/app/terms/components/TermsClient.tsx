'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Server,
  DownloadCloud,
  Search,
  Printer,
  Share2,
  ArrowRight,
  ArrowUp,
  Check,
  Building2,
  Cpu,
  Smartphone,
  Layers,
  Users,
  CreditCard,
  Scale,
  Clock,
  HelpCircle,
  AlertTriangle
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
    title: 'What These Terms Cover',
    icon: FileText,
    summary: 'A simple overview of the agreement between your factory and Zigza for using our manufacturing execution platform.',
    keywords: ['scope', 'terms', 'agreement', 'service', 'factory', 'platform', 'mes', 'rules']
  },
  {
    id: 'section-2',
    number: '02',
    title: 'Factory Accounts & User Logins',
    icon: Users,
    summary: 'Rules for factory administrator accounts, manager access, line tablet logins, and keeping credentials safe.',
    keywords: ['account', 'login', 'admin', 'password', 'users', 'roles', 'security']
  },
  {
    id: 'section-3',
    number: '03',
    title: 'Subscription Plans & Fair Billing',
    icon: CreditCard,
    summary: 'How software subscriptions, monthly or annual fees, invoices, taxes (GST), and renewals work.',
    keywords: ['subscription', 'billing', 'pricing', 'payment', 'invoices', 'gst', 'fees', 'renewal']
  },
  {
    id: 'section-4',
    number: '04',
    title: 'Your Factory Data Belongs to You',
    icon: ShieldCheck,
    summary: 'Your factory retains 100% exclusive ownership of all tech packs, CAD markers, cutting yields, and worker wage ledgers.',
    keywords: ['ownership', 'ip', 'private', 'cad', 'markers', 'tech packs', 'bom', 'trade secret']
  },
  {
    id: 'section-5',
    number: '05',
    title: 'Floor Companion & Offline Mobile Use',
    icon: Smartphone,
    summary: 'Rules for operating the Android companion app, offline bundle ticket scanning, and hardware compatibility.',
    keywords: ['mobile', 'app', 'offline', 'companion', 'android', 'bundle', 'tablets', 'scanners']
  },
  {
    id: 'section-6',
    number: '06',
    title: 'System Uptime & Support Service Levels',
    icon: Server,
    summary: 'Our 99.9% uptime target, scheduled maintenance windows, and technical support response times.',
    keywords: ['uptime', 'sla', 'availability', 'maintenance', 'support', 'reliability', 'server']
  },
  {
    id: 'section-7',
    number: '07',
    title: 'Fair Use on the Factory Floor',
    icon: Scale,
    summary: 'What is expected when using Zigza: No reverse-engineering, no unauthorized access, and lawful industrial operations.',
    keywords: ['acceptable use', 'fair use', 'prohibited', 'abuse', 'law', 'compliance', 'security']
  },
  {
    id: 'section-8',
    number: '08',
    title: 'Third-Party Services & Integrations',
    icon: Layers,
    summary: 'How Zigza connects with cloud providers, barcode printers, weighing scales, and email systems.',
    keywords: ['integrations', 'third-party', 'printers', 'scales', 'cloud', 'supabase', 'aws']
  },
  {
    id: 'section-9',
    number: '09',
    title: 'Exporting Data & Closing Your Account',
    icon: DownloadCloud,
    summary: 'How you can export all your factory records into Excel (.xlsx) anytime, and the clean 60-day closure window.',
    keywords: ['export', 'cancel', 'closure', 'termination', 'excel', 'csv', 'download', 'lock-in']
  },
  {
    id: 'section-10',
    number: '10',
    title: 'Warranties & Clear Limits of Liability',
    icon: AlertTriangle,
    summary: 'Standard commercial limits on software liability, production contingencies, and our commitment to service quality.',
    keywords: ['warranty', 'liability', 'disclaimer', 'limits', 'damages', 'commercial']
  },
  {
    id: 'section-11',
    number: '11',
    title: 'Indian Law & Dispute Resolution',
    icon: Building2,
    summary: 'These terms are governed by the laws of India, with amicable dispute resolution through formal arbitration.',
    keywords: ['governing law', 'jurisdiction', 'india', 'arbitration', 'court', 'disputes']
  },
  {
    id: 'section-12',
    number: '12',
    title: 'Questions & Customer Support',
    icon: HelpCircle,
    summary: 'How to contact our official support team at support@zigza.in for account questions or billing assistance.',
    keywords: ['contact', 'support', 'help', 'email', 'questions', 'assistance']
  }
]

export function TermsClient() {
  const [activeSection, setActiveSection] = useState<string>('section-1')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const lastUpdated = "September 2, 2026"

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
      navigator.clipboard.writeText(window.location.origin + '/terms')
      setIsCopied(true)
      toast.success('Terms link copied to clipboard')
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
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-500">
              Effective Date: <strong className="text-slate-800 font-semibold">{lastUpdated}</strong> · Commercial SaaS Agreement for Apparel Manufacturing
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
              These Terms of Service govern your factory&rsquo;s subscription to Zigza. They explain your rights, data ownership, subscription billing, and our commitment to keeping your floor operations running smoothly.
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
                placeholder="Search terms (e.g. billing, export, ownership, offline, support, cancel)..."
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
          Executive Summary · Core Commercial Terms
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">You Own All Factory Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every tech pack, CAD marker, cutting yield, piece-rate ledger, and costing sheet remains 100% your private property.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Zero Software Lock-In</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download all your production records into Microsoft Excel (.xlsx) or CSV with 1 click at any time without fees.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">99.9% Uptime Commitment</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reliable cloud infrastructure with offline companion sync ensures your sewing lines never stop when Wi-Fi drops.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2 hover:border-[#3A3564]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Clear & Fair Pricing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Simple subscription billing based on active factory lines. No surprise fees, no hidden penalties, and easy cancellation.
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
                  <span>{isCopied ? 'Copied' : 'Share Terms'}</span>
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
                    What These Terms Cover
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  These Terms of Service (&ldquo;Terms&rdquo;) form a binding commercial agreement between your business entity (&ldquo;Subscriber&rdquo; or &ldquo;Factory&rdquo;) and <strong>Zigza</strong> for the use of the Zigza Manufacturing Execution System.
                </p>
                <p>
                  By creating an account, accessing our supervisor web portals, installing our Android companion app, or deploying line tablets on your production floor, you agree to these Terms. If you are entering into this agreement on behalf of a garment factory, processing mill, or export company, you confirm that you have the authority to bind that entity.
                </p>
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-2 mt-3">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564]" />
                    <span>Purpose of the Service</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Zigza provides real-time production coordination software designed specifically for the apparel industry. This includes central fabric store inventory, cutting room matrices, bundle ticket QR printing, sewing floor line balancing, automated worker piece-rate tracking, 3-stage QC inspections, and packing dispatch challans.
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
                    Factory Accounts &amp; User Logins
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  To use Zigza, you will establish a primary factory administrator account. From this account, you can create and manage user logins for department heads, cutting masters, store supervisors, and floor operators.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your team&rsquo;s login credentials and passwords. Notify us immediately if you suspect unauthorized access.</li>
                  <li><strong>Accurate Factory Information:</strong> You agree to provide accurate company details, GST numbers (if applicable in India), and business contact emails.</li>
                  <li><strong>Role-Based Permissions:</strong> You control which factory staff can see costing sheets, edit cutting markers, or approve wage slips. We provide fine-grained permissions to keep sensitive financial details restricted to management.</li>
                </ul>
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
                    Subscription Plans &amp; Fair Billing
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Zigza is provided as a software subscription service. Our pricing plans are straightforward and structured around the size of your factory:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Transparent Pricing</div>
                    <p className="text-[11px] text-slate-600">
                      Fees are billed in Indian Rupees (INR) on a monthly or annual cycle. Applicable Goods and Services Tax (GST) is clearly listed on every invoice.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">No Sneaky Penalties</div>
                    <p className="text-[11px] text-slate-600">
                      You can upgrade, downgrade, or cancel your subscription plan at any time. There are no surprise termination penalties or hidden setup fees.
                    </p>
                  </div>
                </div>
                <p>
                  If an automatic subscription payment fails, we provide a generous 14-day grace period so your factory floor operations are never interrupted while your finance team updates payment details.
                </p>
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
                    Your Factory Data Belongs to You
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  We stand by an absolute, non-negotiable rule: <strong>Your factory owns 100% of all data you input or generate in Zigza.</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Your Proprietary IP:</strong> All Tech Pack sketches, graded POM size charts, CAD marker cut files, fabric consumption formulas, SAM line timings, and piece-rate ledgers remain exclusively yours.</li>
                  <li><strong>Zero Selling or Monetization:</strong> We do not sell, rent, commercialize, or share your factory metrics, buyer pricing, or production numbers with competing factories, retail brands, or marketing agencies.</li>
                  <li><strong>Limited License to Operate:</strong> You only grant Zigza the limited right to host and process your data strictly to provide you with the software service.</li>
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
                    Floor Companion &amp; Offline Mobile Use
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Zigza provides mobile and tablet companion applications for operators, checkers, and line supervisors:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Offline Functionality:</strong> When a worker scans barcode bundle tickets in a corner of the factory with poor Wi-Fi, the app safely buffers the scans locally.</li>
                  <li><strong>Automatic Sync:</strong> Once the device reconnects to Wi-Fi, all buffered scans are uploaded automatically with tamper-proof timestamps.</li>
                  <li><strong>Hardware Compatibility:</strong> Our apps run on standard Android tablets and smartphones. You are responsible for providing appropriate physical devices on your lines.</li>
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
                    System Uptime &amp; Support Service Levels
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Garment factories run on tight production deadlines, so software reliability is critical.
                </p>
                <div className="space-y-2 pt-1">
                  <div className="p-3 rounded-xl border border-black/10 bg-slate-50 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">99.9% Uptime Commitment</div>
                      <p className="text-[11px] text-slate-600">We target continuous 99.9% availability for all cloud production endpoints, excluding scheduled maintenance.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-black/10 bg-slate-50 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Scheduled Maintenance Notice</div>
                      <p className="text-[11px] text-slate-600">Routine server updates are scheduled during off-shift hours (typically Sunday nights) with advance notice in your dashboard.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-black/10 bg-slate-50 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Fast Technical Support</div>
                      <p className="text-[11px] text-slate-600">Our customer engineering team provides priority assistance for floor-critical questions within standard business hours.</p>
                    </div>
                  </div>
                </div>
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
                    Fair Use on the Factory Floor
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  To ensure a secure environment for all factories, you agree to use Zigza in a fair and lawful manner:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>You will not attempt to reverse engineer, decompile, or copy the source code of Zigza.</li>
                  <li>You will not use automated scripts or bots to overload our database servers.</li>
                  <li>You will not use Zigza to store or process content that is unlawful or violates any applicable labor regulations.</li>
                </ul>
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
                    Third-Party Services &amp; Integrations
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  Zigza integrates with trusted cloud infrastructure providers to deliver high performance:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Cloud Infrastructure:</strong> We use Supabase and Amazon Web Services (AWS) data centers located inside India (Mumbai) to store your records safely.</li>
                  <li><strong>Floor Hardware:</strong> Zigza works with standard thermal barcode printers (e.g. TSC, Zebra) and digital weighing scales for carton dispatch verification.</li>
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
                    Exporting Data &amp; Closing Your Account
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  We believe you should stay with Zigza because you love the software, not because you are locked in:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>1-Click Excel Export:</strong> You can download all your historical style sheets, cutting logs, worker wage slips, and dispatch records into <strong>Microsoft Excel (.xlsx)</strong> or <strong>CSV</strong> files directly from your dashboard at any time.</li>
                  <li><strong>Cancelling Your Plan:</strong> You can cancel your subscription at the end of any billing cycle directly through your account settings or by emailing support.</li>
                  <li><strong>60-Day Data Grace Period:</strong> If you close your account, we hold your records safely for 60 days so you have ample time to download complete backups. After 60 days, your data is permanently deleted from all active servers.</li>
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Clause 10.0</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Warranties &amp; Clear Limits of Liability
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  While we work diligently to provide reliable, state-of-the-art software for your garment lines, standard commercial limits apply:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Service As-Is:</strong> Zigza is provided on a commercial &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis with continuous improvements.</li>
                  <li><strong>Liability Cap:</strong> To the maximum extent permitted under applicable law, our total cumulative liability to your factory for any claims arising from the use of the service will never exceed the total subscription fees paid by you in the 12 months preceding the claim.</li>
                  <li><strong>Factory Decisions:</strong> Zigza is a production intelligence tool. Final manufacturing decisions, garment cutting approvals, and quality clearances remain under your management&rsquo;s supervision.</li>
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
                    Indian Law &amp; Dispute Resolution
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  These Terms are governed by and construed in accordance with the laws of the <strong>Republic of India</strong>, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
                </p>
                <p>
                  If any disagreement arises between us, both parties agree to first attempt to resolve the issue through good-faith mutual discussions. If unresolved, disputes will be settled through arbitration in India under the Arbitration and Conciliation Act, 1996.
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
                    Questions &amp; Customer Support
                  </h2>
                </div>
              </div>

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                <p>
                  If you have questions about these Terms, need assistance with your subscription, or want to speak with our support team, the only way to contact us is through our official email:
                </p>

                {/* Contact Card */}
                <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-3 font-mono text-xs shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Support &amp; Billing Email:</span>
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
                    <span>Support SLA: <strong>Within 48 hours</strong></span>
                    <span>Billing Assistance: <strong>Available Monday to Saturday</strong></span>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
            
            {/* Brand Column */}
            <div className="col-span-1 sm:col-span-2 md:col-span-2 space-y-3.5">
              <Link href="/" className="inline-block group">
                <img 
                  src="/z i g z a (8).png" 
                  alt="Zigza" 
                  className="h-10 sm:h-12 w-auto object-contain group-hover:opacity-90 transition-opacity duration-150"
                />
              </Link>
              <p className="text-[15px] sm:text-base text-slate-600 leading-relaxed max-w-sm font-normal">
                Simple, real-time software for garment manufacturers. Track fabric rolls, cut down wastage, monitor stitching targets, and ship orders on time.
              </p>
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

            {/* Column 2: Access & Support */}
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
                    Start 7-Day Free Trial
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
              <Link href="/terms" className="text-[#3A3564] font-medium hover:underline">Terms of Service</Link>
              <Link href="/security" className="hover:text-slate-900 transition-colors">Security Standards</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}

export default TermsClient
