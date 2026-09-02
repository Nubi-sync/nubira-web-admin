'use client'

import { useState, useEffect, useId } from 'react'
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
  MessageSquareCheck,
  Menu,
  Check,
  Mail
} from 'lucide-react'

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

interface ZigzaLandingPageClientProps {
  isAuthenticated?: boolean
  userEmail?: string
}

export function ZigzaLandingPageClient({
  isAuthenticated = false,
  userEmail = ''
}: ZigzaLandingPageClientProps) {
  // Navigation & Interactive States
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const [activeRoleTab, setActiveRoleTab] = useState<'MD' | 'CUTTING' | 'STORE' | 'LINEMAN' | 'QC'>('MD')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

  // Scroll listener for logo morph transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Sequential 5-Step Factory Pipeline Animation (1.2s per box)
  const [activePipelineStep, setActivePipelineStep] = useState(0)
  useEffect(() => {
    const pipelineTimer = setInterval(() => {
      setActivePipelineStep(prev => (prev + 1) % 5)
    }, 1200)
    return () => clearInterval(pipelineTimer)
  }, [])

  // ROI Calculator State
  const [monthlyPieces, setMonthlyPieces] = useState<number>(35000)
  const [linemenCount, setLinemenCount] = useState<number>(24)

  // Demo Form State: Company Name, Owner Name, Phone, Business Email
  const [demoForm, setDemoForm] = useState({
    companyName: '',
    ownerName: '',
    phone: '',
    email: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Calculated ROI Metrics
  const estimatedHoursSaved = Math.round((monthlyPieces / 1000) * 4.5)
  const estimatedPaperSavings = Math.round((monthlyPieces / 100) * 35)
  const disputeReductionRate = 100

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)

    const subject = `Zigza Live Demo Request - ${demoForm.companyName || 'New Factory'}`
    const body = `Hi Sumit,

I would like to request a live demo walkthrough of Zigza MES for our garment manufacturing unit.

Details:
• Company / Factory Name: ${demoForm.companyName}
• Owner / Plant Head Name: ${demoForm.ownerName}
• Phone / WhatsApp Number: ${demoForm.phone}
• Business Email ID: ${demoForm.email}

Please contact us to schedule the live walkthrough.

Best regards,
${demoForm.ownerName}`

    const mailtoUrl = `mailto:shawsumit6286@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    try {
      window.location.href = mailtoUrl
    } catch {
      // Fallback handled by direct link in UI
    }
  }

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 95
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#14140F] font-sans antialiased selection:bg-[#3A3564] selection:text-white">
      
      {/* =================================================================== */}
      {/* 1. STICKY ENTERPRISE HEADER                                         */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#57564E]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[64px] sm:h-[84px] flex items-center justify-between gap-3">
          
          {/* Brand Logo: Single new_logo.png without scroll switching */}
          <Link href="/" className="group flex items-center cursor-pointer select-none shrink-0">
            <img 
              src="/z i g z a (1).png" 
              alt="zigza." 
              className="h-[36px] sm:h-[44px] w-auto object-contain rounded-md sm:rounded-lg overflow-hidden shadow-xs transition-transform duration-150 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links — Slate text, Indigo hover/active underline */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-[15px] font-medium text-[#57564E]">
            <a 
              href="#modules"
              onClick={(e) => scrollToSection(e, 'modules')}
              className="group relative px-2.5 lg:px-3 py-2 text-[#57564E] hover:text-[#14140F] transition-colors duration-150 cursor-pointer"
            >
              <span>Modules</span>
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#3A3564] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out origin-left" />
            </a>
            <a 
              href="#workflow"
              onClick={(e) => scrollToSection(e, 'workflow')}
              className="group relative px-2.5 lg:px-3 py-2 text-[#57564E] hover:text-[#14140F] transition-colors duration-150 cursor-pointer"
            >
              <span>Floor Workflow</span>
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#3A3564] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out origin-left" />
            </a>
            <a 
              href="#roles"
              onClick={(e) => scrollToSection(e, 'roles')}
              className="group relative px-2.5 lg:px-3 py-2 text-[#57564E] hover:text-[#14140F] transition-colors duration-150 cursor-pointer"
            >
              <span>Solutions</span>
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#3A3564] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out origin-left" />
            </a>
            <a 
              href="#roi"
              onClick={(e) => scrollToSection(e, 'roi')}
              className="group relative px-2.5 lg:px-3 py-2 text-[#57564E] hover:text-[#14140F] transition-colors duration-150 cursor-pointer"
            >
              <span>ROI Estimator</span>
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#3A3564] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out origin-left" />
            </a>
            <a 
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="group relative px-2.5 lg:px-3 py-2 text-[#57564E] hover:text-[#14140F] transition-colors duration-150 cursor-pointer"
            >
              <span>FAQ</span>
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#3A3564] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out origin-left" />
            </a>
          </nav>

          {/* Desktop Action: Sign In plain text link + Request Demo Deep Indigo button */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {isAuthenticated ? (
              <Link
                href="/production-orders"
                className="px-5 py-2.5 rounded-md text-[15px] font-medium bg-[#3A3564] text-white hover:bg-[#2F2B52] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[15px] font-medium text-[#57564E] hover:text-[#14140F] transition-colors cursor-pointer py-1"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="px-5 py-2.5 rounded-md text-[15px] font-medium bg-[#3A3564] text-white hover:bg-[#2F2B52] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>Request a Demo</span>
                  <ArrowRight className="w-4 h-4 text-white/70" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-md border border-[#57564E]/25 text-[#14140F] hover:bg-[#14140F]/5 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer with Sliding Opening Transition */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#FAFAF8] ${
            isMobileMenuOpen
              ? 'max-h-[520px] opacity-100 translate-y-0 border-b border-[#57564E]/15 shadow-lg'
              : 'max-h-0 opacity-0 -translate-y-2 border-b-0 pointer-events-none'
          }`}
        >
          <div className="px-5 pt-3 pb-6 space-y-4">
            <nav className="flex flex-col space-y-1">
              {[
                { id: 'modules', label: 'Modules' },
                { id: 'workflow', label: 'Floor Workflow' },
                { id: 'roles', label: 'Role Solutions' },
                { id: 'roi', label: 'ROI Estimator' },
                { id: 'faq', label: 'FAQ' },
              ].map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    scrollToSection(e, item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className="px-4 py-3 rounded-md text-[15px] font-medium text-[#14140F] hover:bg-[#14140F]/5 active:bg-[#14140F]/10 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-[#57564E]/15 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsDemoModalOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="w-full py-3 rounded-md text-[15px] font-medium bg-[#3A3564] text-white hover:bg-[#2F2B52] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Request a Live Demo</span>
                <ArrowRight className="w-4 h-4 text-white/70" />
              </button>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-md text-[15px] font-medium text-[#14140F] border border-[#57564E]/25 bg-transparent hover:bg-[#14140F]/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#57564E]" />
                <span>Staff Portal Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. HERO SECTION WITH PRODUCT EXECUTION SCREENSHOT PREVIEW           */}
      {/* =================================================================== */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-4xl mx-auto space-y-5">
          {/* Main Hero Headline: Restored keyword underline on Garment Factories */}
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-semibold tracking-tight text-[#14140F] leading-[1.08]">
            The Manufacturing OS for Modern <span className="text-[#3A3564] underline decoration-[#C8802B] decoration-4 underline-offset-8">Garment Factories</span>
          </h1>

          {/* Subtitle: Body Large, Slate, capped line length */}
          <p className="text-base sm:text-lg text-[#57564E] max-w-2xl mx-auto leading-relaxed font-normal">
            Connect fabric roll inward, automated cutting matrices, smart lineman piece-rate allotments, 
            live 3-stage QC, and buyer dispatch challans into one synchronized floor.
          </p>

          {/* Hero Action Buttons: Deep Indigo primary + quiet Slate outline secondary */}
          <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 px-4 sm:px-0">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto group px-6 py-3 sm:py-3.5 rounded-md text-[15px] font-medium bg-[#3A3564] text-white hover:bg-[#2F2B52] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Request a Live Demo</span>
              <ArrowRight className="w-4 h-4 text-white/70 transition-transform group-hover:translate-x-0.5" />
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-md text-[15px] font-medium border border-[#57564E]/30 bg-transparent text-[#14140F] hover:bg-[#14140F]/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#57564E]" />
              <span>Staff Login to Portal</span>
            </Link>
          </div>

          {/* Key Metric Feature Flags: Monochrome thin-line check icons, Slate color */}
          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-[13px] font-normal text-[#57564E]">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#57564E]" />
              <span>1-Click Excel challan ingestion</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#57564E]" />
              <span>Android mobile floor companion</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#57564E]" />
              <span>Automated piece-rate wage ledger</span>
            </div>
          </div>
        </div>

        {/* Live MES Interactive Visual Dashboard Mockup */}
        <div className="mt-8 sm:mt-12 max-w-5xl mx-auto">
          <div className="bg-white border border-black rounded-xl sm:rounded-2xl overflow-hidden">
            
            {/* Mockup Header Bar */}
            <div className="bg-[var(--steel-dark,#1F3A63)] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between text-white border-b border-slate-700">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold tracking-tight text-slate-300 ml-1 sm:ml-2 truncate">
                  Zigza MES • Live Plant Operations Control Center
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Floor Active</span>
                <span className="sm:hidden">Active</span>
              </div>
            </div>

            {/* Mockup Body Content */}
            <div className="p-3 sm:p-6 bg-[var(--bg,#EEF1F5)] space-y-3 sm:space-y-5">
              
              {/* Top Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3.5">
                <div className="p-2.5 sm:p-3.5 bg-white border border-[var(--border,#E2E8F0)] rounded-lg sm:rounded-xl shadow-2xs">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-[var(--ink-soft,#5B6B7C)]">Active Job Work</span>
                  <p className="text-base sm:text-xl font-black text-[var(--ink,#1C2733)] mt-0.5 sm:mt-1">JOB-457</p>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[var(--steel,#2B4C7E)]">OLLYPOP Kids 2-Pc</span>
                </div>

                <div className="p-2.5 sm:p-3.5 bg-white border border-[var(--border,#E2E8F0)] rounded-lg sm:rounded-xl shadow-2xs">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-[var(--ink-soft,#5B6B7C)]">Cutting Sets</span>
                  <p className="text-base sm:text-xl font-black text-[var(--steel,#2B4C7E)] mt-0.5 sm:mt-1">1,650 Sets</p>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[var(--ink-soft,#5B6B7C)]">14,850 Pieces</span>
                </div>

                <div className="p-2.5 sm:p-3.5 bg-white border border-[var(--border,#E2E8F0)] rounded-lg sm:rounded-xl shadow-2xs">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-[var(--ink-soft,#5B6B7C)]">QC Pass Rate</span>
                  <p className="text-base sm:text-xl font-black text-[var(--green,#1F9D63)] mt-0.5 sm:mt-1">98.4%</p>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[var(--green,#1F9D63)]">14,612 Passed</span>
                </div>

                <div className="p-2.5 sm:p-3.5 bg-white border border-[var(--border,#E2E8F0)] rounded-lg sm:rounded-xl shadow-2xs">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-[var(--ink-soft,#5B6B7C)]">Linemen Active</span>
                  <p className="text-base sm:text-xl font-black text-[var(--amber,#C8802B)] mt-0.5 sm:mt-1">24 Stations</p>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[var(--amber,#C8802B)]">Piece Rate Synced</span>
                </div>
              </div>

              {/* Multi-Article Size Grid Simulation — hidden on very small screens, horizontal scroll on medium */}
              <div className="bg-white border border-[var(--border,#E2E8F0)] rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2 sm:mb-2.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileSpreadsheet className="w-4 h-4 text-[var(--steel,#2B4C7E)] shrink-0" />
                    <span className="text-[10px] sm:text-xs font-black text-[var(--ink,#1C2733)] uppercase tracking-wider truncate">
                      Cutting Lot Size Breakdown Matrix
                    </span>
                  </div>
                  <span className="hidden sm:inline text-[10px] font-bold bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)] px-2 py-0.5 rounded shrink-0">
                    Ratio 1:9 Auto-Calculated
                  </span>
                </div>

                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-[10px] sm:text-[11px] text-left min-w-[480px]">
                    <thead>
                      <tr className="border-b border-[var(--border,#E2E8F0)] text-[var(--ink-soft,#5B6B7C)]">
                        <th className="py-1.5 px-2 font-bold">Art No</th>
                        <th className="py-1.5 px-2 font-bold">Sub</th>
                        <th className="py-1.5 px-2 font-bold">Color</th>
                        <th className="py-1.5 px-2 font-bold">Size</th>
                        <th className="py-1.5 px-2 font-bold text-right">Sets</th>
                        <th className="py-1.5 px-2 font-bold text-right">Pcs</th>
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
                          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-extrabold bg-[var(--green-mist,#E6F6EE)] text-[var(--green,#1F9D63)]">
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
                          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-extrabold bg-blue-50 text-blue-700">
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
                          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-extrabold bg-amber-50 text-amber-700">
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
      <section className="py-14 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Why Garment Factories Are Switching from Paper to Zigza
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
              Compare traditional manual paper registers with Zigza's synchronized floor execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            
            {/* Traditional Challenges Card: Darker Rose Outline with Generous Spacing */}
            <div className="bg-white rounded-2xl border-2 border-rose-400 p-6 sm:p-8">
              {/* Card Header */}
              <div className="flex items-center gap-2.5 pb-4 border-b border-rose-200 mb-6">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Traditional Factory Friction</h3>
              </div>

              {/* 4 Pain Points - Proper Spacing for Readability */}
              <div className="space-y-6">
                <div className="flex items-start gap-3.5">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Lost Paper Challans & Slips</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Misplaced slips cause fabric shortages, billing confusion, and supplier disputes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Lineman Wage Disputes</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Daily arguments at payout time over bundle piece counts and missing stitched units.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Late QC Defect Discovery</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Defects caught late at packing bay, causing emergency rework and delayed buyer dispatch.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Zero Real-Time WIP Visibility</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Owners lack live visibility into cutting pace and floor bottlenecks during the shift.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Zigza Digital Solution Card: Darker Emerald Outline with Generous Spacing */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 sm:p-8">
              {/* Card Header */}
              <div className="flex items-center gap-2.5 pb-4 border-b border-emerald-200 mb-6">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">The Zigza Digital Solution</h3>
              </div>

              {/* 4 Solutions - Proper Spacing for Readability */}
              <div className="space-y-6">
                <div className="flex items-start gap-3.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Digital Gate Inward (Store GRN)</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Photograph paper challans on mobile and reconcile cloth roll barcodes instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">1-Click Excel Challan Import</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Buyer sheets auto-map to size breakdown matrices without manual calculation errors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Dispute-Free Piece-Rate Wages</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Automated bundle credits per lineman with transparent mobile app verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">3-Stage Live QC Routing</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Tag defects on mobile at audit checkpoints and dispatch instant rework to tailors.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. 6 CORE MODULAR ENGINES                                           */}
      {/* =================================================================== */}
      <section id="modules" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Specialized Engines Engineered for Floor Precision
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Every department in your garment factory gets dedicated tools connected to one live database.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* Module 1: Store GRN */}
          <div className="bg-white rounded-2xl border border-slate-200 hover:border-black p-6 sm:p-7 transition-colors flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-3 pb-3 mb-5 border-b-2 border-[#3A3564]">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Truck Inward & Store GRN
                </h3>
                <Truck className="w-5 h-5 text-[#3A3564] shrink-0" />
              </div>

              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Photo capture for supplier delivery challans</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Fabric roll barcode tracking (Sinker, Rib, Lycra)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Live trims & accessories balance reconciliation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Module 2: Excel Ingestion */}
          <div className="bg-white rounded-2xl border border-slate-200 hover:border-black p-6 sm:p-7 transition-colors flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-3 pb-3 mb-5 border-b-2 border-[#3A3564]">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  1-Click Excel Ingestion
                </h3>
                <FileSpreadsheet className="w-5 h-5 text-[#3A3564] shrink-0" />
              </div>

              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Direct import of buyer purchase spreadsheets</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Auto-calculated size & color breakdown matrix</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Zero manual entry errors or ratio mismatches</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Module 3: Smart Allotment & Wages */}
          <div className="bg-white rounded-2xl border border-slate-200 hover:border-black p-6 sm:p-7 transition-colors flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-3 pb-3 mb-5 border-b-2 border-[#3A3564]">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Smart Allotment & Wages
                </h3>
                <Scissors className="w-5 h-5 text-[#3A3564] shrink-0" />
              </div>

              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Lot allotment across linemen by color & size</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Real-time QR barcode scan per stitched unit</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Automated, dispute-free piece-rate wage ledger</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Module 4: Mobile Floor Supervisor */}
          <div className="bg-white rounded-2xl border border-slate-200 hover:border-black p-6 sm:p-7 transition-colors flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-3 pb-3 mb-5 border-b-2 border-[#3A3564]">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Mobile Floor Supervisor
                </h3>
                <Smartphone className="w-5 h-5 text-[#3A3564] shrink-0" />
              </div>

              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Fast scanner companion for Android smartphones</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Continuous offline logging during WiFi dropouts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Live line output pace & bottleneck alerts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Module 5: 3-Stage Quality Control */}
          <div className="bg-white rounded-2xl border border-slate-200 hover:border-black p-6 sm:p-7 transition-colors flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-3 pb-3 mb-5 border-b-2 border-[#3A3564]">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  3-Stage Quality Control
                </h3>
                <ClipboardCheck className="w-5 h-5 text-[#3A3564] shrink-0" />
              </div>

              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>1-Tap defect tagging at lightbox checkpoints</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Instant alteration routing directly back to tailors</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Operator defect tracking & pass-rate analytics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Module 6: Carton Packing & Dispatch */}
          <div className="bg-white rounded-2xl border border-slate-200 hover:border-black p-6 sm:p-7 transition-colors flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-3 pb-3 mb-5 border-b-2 border-[#3A3564]">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Carton Packing & Dispatch
                </h3>
                <PackageCheck className="w-5 h-5 text-[#3A3564] shrink-0" />
              </div>

              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Auto-generated carton packing lists & piece counts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Buyer delivery challans with transport metadata</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Finished goods inventory deducted at gate exit</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. 5-STEP FACTORY FLOW PIPELINE (ROADMAP)                          */}
      {/* =================================================================== */}
      {/* =================================================================== */}
      {/* 5. 5-STEP FACTORY FLOW PIPELINE (FLOW CHART)                       */}
      {/* =================================================================== */}
      <section id="workflow" className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              The 5-Step Synchronized Factory Pipeline
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
              From raw cloth arrival to buyer truck exit — every milestone is verified in real time.
            </p>
          </div>

          {/* Connected Process Track with Flowing Animation */}
          <div className="relative">
            
            {/* Continuous Black Connecting Line running across all 5 boxes */}
            <div className="hidden lg:block absolute top-[36px] left-[5%] right-[5%] h-[1.5px] bg-black z-0 pointer-events-none">
              {/* Traveling Bead gliding along the line from box to box */}
              <div 
                className="absolute -top-[5px] w-3.5 h-3.5 rounded-full bg-[#3A3564] border-2 border-white shadow-md transition-all duration-[600ms] ease-in-out z-20"
                style={{ left: `calc(${activePipelineStep * 20 + 10}% - 7px)` }}
              />
            </div>

            {/* 5 Connected Boxes with Sequential Spin & Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 items-stretch relative z-10">
              {[
                {
                  step: '01',
                  title: 'Store Inward',
                  desc: 'Photo OCR capture of supplier paper challans and fabric roll barcode tagging.'
                },
                {
                  step: '02',
                  title: 'Cutting Matrix',
                  desc: 'Auto-converts buyer order Excel sheets into size lay ratios in 1 click.'
                },
                {
                  step: '03',
                  title: 'Line Allotment',
                  desc: 'Color-split bundle assignment to linemen with live piece-rate wage sync.'
                },
                {
                  step: '04',
                  title: 'Quality Audit',
                  desc: '1-Tap lightbox pass and defect logging with instant tailor rework routing.'
                },
                {
                  step: '05',
                  title: 'Carton Dispatch',
                  desc: 'Piece-count carton packing reconciliation and official delivery challans.'
                }
              ].map((stage, idx) => {
                const isActive = activePipelineStep === idx;
                return (
                  <div
                    key={stage.step}
                    onClick={() => setActivePipelineStep(idx)}
                    className={`cursor-pointer bg-white rounded-2xl border border-black p-5 sm:p-6 transition-all duration-500 flex flex-col justify-between ${
                      isActive
                        ? 'shadow-lg ring-1 ring-black -translate-y-1 bg-[#FCFBF9]'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Number Circle (cream bg, indigo text, slim black outline) + Header beside it */}
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          key={isActive ? `active-${idx}` : `idle-${idx}`}
                          className={`w-8 h-8 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/80 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                            isActive ? 'animate-spin-once ring-2 ring-[#3A3564]/30' : ''
                          }`}
                        >
                          {stage.step}
                        </span>
                        <h3 className="text-[15px] sm:text-base font-bold text-slate-900 tracking-tight">
                          {stage.title}
                        </h3>
                      </div>

                      {/* Clear Description (No truncation) */}
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 6. SOLUTIONS TAILORED FOR FACTORY ROLES (INTERACTIVE TABS)          */}
      {/* =================================================================== */}
      <section id="roles" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Built for Every Stakeholder on the Factory Floor
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Tailored interfaces engineered for the specific daily goals of each factory role.
          </p>

          {/* Tactile Segmented Role Switcher Buttons */}
          <div className="mt-8 sm:mt-10 flex justify-center">
            <div className="inline-flex p-1.5 bg-[#EAE8DF] border border-black/20 rounded-2xl shadow-inner max-w-full overflow-x-auto gap-1.5">
              {(
                [
                  { key: 'MD', label: 'Factory Owners', icon: Users },
                  { key: 'CUTTING', label: 'Cutting Masters', icon: Scissors },
                  { key: 'STORE', label: 'Store Managers', icon: Truck },
                  { key: 'LINEMAN', label: 'Stitching Linemen', icon: Layers },
                  { key: 'QC', label: 'QC Inspectors', icon: ClipboardCheck }
                ] as const
              ).map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveRoleTab(tab.key)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    activeRoleTab === tab.key
                      ? 'bg-white text-slate-950 shadow-md border border-black/15 scale-[1.02] ring-1 ring-black/5'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/50 border border-transparent'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeRoleTab === tab.key ? 'text-[#3A3564]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Role Showcase Card: Slim black outline, 2-column layout with real floor UI mockup */}
        <div className="max-w-5xl mx-auto bg-white border border-black rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm transition-all">
          {activeRoleTab === 'MD' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564] bg-[#FAF7F0] border border-black/15 px-3 py-1 rounded-md">
                  Executive Suite · Plant Leadership
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  360° Real-Time Floor Visibility From Cloth to Cash
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  Gain live visibility into active buyer orders, machine line throughput, and piece-rate labor 
                  expenses across all factory floors. Eliminate morning paper register disputes and ghost piece losses.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      Live WIP piece count tracking & bottleneck line alerts
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      Automated daily payroll sync without paper register loss
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side UI Preview: Executive Dashboard Snapshot */}
              <div className="lg:col-span-5 bg-[#FAF7F0] border border-black/15 rounded-xl p-5 shadow-xs font-mono">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    PLANT OVERVIEW
                  </span>
                  <span className="text-slate-500 text-[11px]">SHIFT 1 ACTIVE</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-black/10 flex items-center justify-between">
                    <span className="text-slate-600 font-sans">WIP on Floor:</span>
                    <span className="font-bold text-slate-900">14,820 Pcs (98.8%)</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-black/10 flex items-center justify-between">
                    <span className="text-slate-600 font-sans">Stitched Today:</span>
                    <span className="font-bold text-emerald-700">4,120 Units</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-black/10 flex items-center justify-between">
                    <span className="text-slate-600 font-sans">Active Bottleneck:</span>
                    <span className="font-bold text-amber-700">Line 4 (Collar)</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-black/10 text-[11px] text-slate-600 font-sans flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#3A3564] stroke-[2.5]" />
                  <span>Real-time payroll & order delivery sync</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'CUTTING' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564] bg-[#FAF7F0] border border-black/15 px-3 py-1 rounded-md">
                  Cutting Department · Lay Planning
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  1-Click Excel Order Ingestion & Size Lay Matrix
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  Upload raw buyer spreadsheets to auto-generate multi-article lay plans in seconds. Eliminate hours 
                  of manual ratio math (1:9, L/XXL, 22x26) and generate barcode bundle allotment cards in 1 click.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      Instant size & color ratio breakdown without calculator math
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      Automated bundle ticket generation for linemen
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side UI Preview: Cutting Lay Matrix Mockup */}
              <div className="lg:col-span-5 bg-[#FAF7F0] border border-black/15 rounded-xl p-5 shadow-xs font-mono">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#3A3564]" />
                    LAY MATRIX ENGINE
                  </span>
                  <span className="text-slate-500 text-[11px]">ORDER #Z-8419</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Article / Plies:</span>
                    <span className="font-bold text-slate-900">Polo Shirt • 24 Plies</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
                    <div className="bg-white p-1.5 rounded border border-black/10">
                      <div className="text-slate-400">S</div>
                      <div className="font-bold text-slate-900">120</div>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-black/10">
                      <div className="text-slate-400">M</div>
                      <div className="font-bold text-slate-900">240</div>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-black/10">
                      <div className="text-slate-400">L</div>
                      <div className="font-bold text-slate-900">240</div>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-black/10">
                      <div className="text-slate-400">XL</div>
                      <div className="font-bold text-slate-900">120</div>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Bundles Ready:</span>
                    <span className="font-bold text-emerald-700">12 Bundles (720 Pcs)</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-black/10 text-[11px] text-slate-600 font-sans flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#3A3564] stroke-[2.5]" />
                  <span>0 Manual ratio mistakes • Ready for linemen</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'STORE' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564] bg-[#FAF7F0] border border-black/15 px-3 py-1 rounded-md">
                  Warehouse & Gate · Store Inward
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Mobile Delivery Slip OCR & Fabric Roll Barcoding
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  Photograph supplier paper challans directly at the truck gate. Automatically tag fabric rolls 
                  with unique barcode labels (Sinker, Rib, Fleece) and flag missing accessories before production begins.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      Camera capture converts paper challan slips into inventory
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      Automatic trim and accessory due follow-up tracking
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side UI Preview: Gate Inward GRN Card */}
              <div className="lg:col-span-5 bg-[#FAF7F0] border border-black/15 rounded-xl p-5 shadow-xs font-mono">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#3A3564]" />
                    GATE INWARD GRN
                  </span>
                  <span className="text-slate-500 text-[11px]">CHALLAN #1042</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Mill Supplier:</span>
                    <span className="font-bold text-slate-900">Vardhman Mills</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Fabric / Weight:</span>
                    <span className="font-bold text-slate-900">Sinker 180 GSM • 42.5 Kg</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Pending Trims:</span>
                    <span className="font-bold text-amber-700">2,400 Mtr Elastic Due</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-black/10 text-[11px] text-slate-600 font-sans flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#3A3564] stroke-[2.5]" />
                  <span>Barcode printed & inventory updated live</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'LINEMAN' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564] bg-[#FAF7F0] border border-black/15 px-3 py-1 rounded-md">
                  Sewing Floor · Linemen & Operators
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Transparent Daily Wage Records & Zero Ticket Disputes
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  Give operators full visibility into completed bundles and daily earnings right on their mobile phone. 
                  Eliminate lost paper tickets and conflicting piece accounts at weekly salary payout.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      Real-time piece-rate earnings ledger verified on supervisor scan
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      Color-split bundle assignment without missing pieces
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side UI Preview: Lineman Wage Portal Screen */}
              <div className="lg:col-span-5 bg-[#FAF7F0] border border-black/15 rounded-xl p-5 shadow-xs font-mono">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#3A3564]" />
                    OPERATOR WAGE PORTAL
                  </span>
                  <span className="text-slate-500 text-[11px]">LINE 3 • SHIFT 1</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Operator Name:</span>
                    <span className="font-bold text-slate-900">Ramesh Kumar</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Bundles Stitched:</span>
                    <span className="font-bold text-slate-900">18 Bundles (540 Pcs)</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Today's Earnings:</span>
                    <span className="font-bold text-emerald-700">₹1,512.00 (₹2.80/pc)</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-black/10 text-[11px] text-slate-600 font-sans flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#3A3564] stroke-[2.5]" />
                  <span>Mobile verified • No salary dispute at week-end</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'QC' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564] bg-[#FAF7F0] border border-black/15 px-3 py-1 rounded-md">
                  Finishing & Quality · Audit Checkpoints
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  1-Tap Lightbox Audit & Instant Defect Routing
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  Log passed garments and categorize defects (oil stains, open seams, tension faults) with 1 tap at 
                  lightbox inspection stations. Instantly re-route alteration tickets back to the responsible operator.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      1-Tap pass logging and defect category tagging
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      Instant tailor accountability for speedy rework
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side UI Preview: Lightbox Audit Screen */}
              <div className="lg:col-span-5 bg-[#FAF7F0] border border-black/15 rounded-xl p-5 shadow-xs font-mono">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5 text-[#3A3564]" />
                    LIGHTBOX AUDIT BAY 2
                  </span>
                  <span className="text-slate-500 text-[11px]">LOT #819</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Inspection Status:</span>
                    <span className="font-bold text-emerald-700">138 Passed (97.2%)</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Defects Logged:</span>
                    <span className="font-bold text-red-600">4 Alterations</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-black/10 flex justify-between">
                    <span className="text-slate-600 font-sans">Auto Re-Routed:</span>
                    <span className="font-bold text-slate-900">Tailor #8 (Line 2)</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-black/10 text-[11px] text-slate-600 font-sans flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#3A3564] stroke-[2.5]" />
                  <span>1-Tap defect tagging • Real-time re-work cycle</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </section>

      {/* =================================================================== */}
      {/* 7. INTERACTIVE ROI & COST SAVINGS CALCULATOR                        */}
      {/* =================================================================== */}
      <section id="roi" className="py-14 sm:py-20 bg-white border-y border-[#57564E]/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Estimate Your Plant's Monthly Time & Error Savings
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
              Adjust the sliders based on your factory's production volume to see estimated impact.
            </p>
          </div>

          {/* Outer ROI Box with Slim Black Outline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch bg-white p-6 sm:p-8 lg:p-10 rounded-2xl border border-black shadow-sm">
            
            {/* Sliders Area (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              
              {/* Slider 1: Garment Output */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm sm:text-base font-bold text-slate-900">
                    Monthly Garment Output
                  </label>
                  <span className="px-3 py-1 rounded-lg bg-[#FAF7F0] border border-black/15 text-slate-900 font-mono font-bold text-sm sm:text-base tabular-nums">
                    {monthlyPieces.toLocaleString()} pcs
                  </span>
                </div>
                
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={monthlyPieces}
                  onChange={e => setMonthlyPieces(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#3A3564] border border-black/10"
                />
                
                <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums mt-1.5">
                  <span>5,000 pcs</span>
                  <span>50,000 pcs</span>
                  <span>100,000 pcs</span>
                  <span>200,000+ pcs</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <span className="text-xs text-slate-400 mr-1">Quick presets:</span>
                  {[15000, 35000, 75000, 150000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMonthlyPieces(val)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
                        monthlyPieces === val
                          ? 'bg-[#3A3564] text-white shadow-xs'
                          : 'bg-[#FAF7F0] border border-black/10 text-slate-600 hover:text-black hover:border-black/30'
                      }`}
                    >
                      {(val / 1000)}k pcs
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 2: Linemen Count */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm sm:text-base font-bold text-slate-900">
                    Active Stitching Linemen
                  </label>
                  <span className="px-3 py-1 rounded-lg bg-[#FAF7F0] border border-black/15 text-slate-900 font-mono font-bold text-sm sm:text-base tabular-nums">
                    {linemenCount} operators
                  </span>
                </div>
                
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={linemenCount}
                  onChange={e => setLinemenCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#3A3564] border border-black/10"
                />
                
                <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums mt-1.5">
                  <span>5 linemen</span>
                  <span>25 linemen</span>
                  <span>50 linemen</span>
                  <span>100+ linemen</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <span className="text-xs text-slate-400 mr-1">Quick presets:</span>
                  {[12, 24, 48, 80].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLinemenCount(val)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
                        linemenCount === val
                          ? 'bg-[#3A3564] text-white shadow-xs'
                          : 'bg-[#FAF7F0] border border-black/10 text-slate-600 hover:text-black hover:border-black/30'
                      }`}
                    >
                      {val} lines
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Calculated Output Card (5 Cols) */}
            <div className="lg:col-span-5 bg-[#FAF7F0] p-6 sm:p-7 rounded-2xl border border-black/15 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3A3564]">
                    Estimated Monthly Savings
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    PER FACTORY SHIFT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Metric 1 */}
                  <div className="bg-white p-3.5 rounded-xl border border-black/10">
                    <span className="text-[11px] font-medium text-slate-500 block">Floor Hours Saved</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
                      ~{estimatedHoursSaved}h
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">per month</span>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-white p-3.5 rounded-xl border border-black/10">
                    <span className="text-[11px] font-medium text-slate-500 block">Payout Disputes</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#3A3564] font-mono tabular-nums mt-1">
                      0%
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">100% reconciled</span>
                  </div>
                </div>

                {/* Zero Mismatch Guarantee Note */}
                <div className="bg-white p-3.5 rounded-xl border border-black/10">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3A3564]" />
                    Zero Ghost Piece Guarantee
                  </span>
                  <p className="text-[11.5px] leading-relaxed text-slate-600">
                    Every garment cut on table is reconciled across lineman bundle tickets, QC lightboxes, and dispatch cartons.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-3.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Schedule Free Factory Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (ACCORDION FAQ)                       */}
      {/* =================================================================== */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Google FAQPage Structured Data Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Can we import our existing buyer Excel challans directly into Zigza?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Zigza includes a 1-Click Excel Template and Bulk Ingestion module. You can download our standard template or upload your existing spreadsheets (.xlsx, .xls, .csv). Zigza automatically maps article numbers, size tiers (L/XXL, 22x26, 28x32), and piece ratios."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does Zigza require expensive hardware on the factory floor?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Zigza is designed to run on standard Android smartphones and budget tablets for supervisors and QC stations. The admin control center runs in any standard web browser on PCs and laptops."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does Zigza handle lineman piece-rate wage calculation?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can allot cutting lots to linemen either as full challans or split across color combinations. As garments are completed and inspected, the system automatically credits each lineman at their defined piece rate, producing a clear, transparent wage ledger with zero arguments."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What happens if internet connectivity drops on the floor?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The Zigza Android mobile companion app has offline-resilient local caching. Supervisors and inspectors can continue logging production and bundle scans without disruption. Data synchronizes automatically as soon as internet connection is restored."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is data isolated for different brands and job-work buyers?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Zigza enforces multi-brand partitioning. You can track separate production lines and dispatch challans for Ollypop, First Smile, Lazy Bones, or your own in-house brands with complete data isolation."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How fast can a garment factory go live with Zigza?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Most factories complete master setup (articles, rates, lineman profiles) and go live on their first cutting lot within 24 to 48 hours of onboarding."
                  }
                }
              ]
            })
          }}
        />

        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
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
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-black shadow-sm ring-1 ring-black/5' : 'border-slate-200 hover:border-black/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <span className={`font-bold text-base sm:text-lg transition-colors ${
                    isOpen ? 'text-[#3A3564]' : 'text-slate-900 group-hover:text-[#3A3564]'
                  }`}>
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isOpen ? 'bg-[#3A3564] text-white rotate-180 shadow-xs' : 'bg-[#FAF7F0] border border-black/10 text-slate-500 rotate-0'
                  }`}>
                    <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                  </div>
                </button>

                {/* Sliding Height Transition via CSS Grid rows */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 9. BOTTOM CALL TO ACTION BANNER & REQUEST DEMO FORM                 */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto bg-[#FAF7F0] border border-black rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Text */}
            <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564] bg-white border border-black/15 px-3 py-1 rounded-md">
                Fast Onboarding · 24-48 Hour Go-Live
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Transform Your Garment Factory Today
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Book a personalized 20-minute live demonstration tailored to your plant capacity, 
                cutting tables, and floor workflow.
              </p>

              {/* Trust Points */}
              <div className="space-y-3 pt-2 text-xs sm:text-sm font-semibold text-slate-800 text-left">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0" />
                  <span>Zero commitment — test with your live buyer Excel sheet</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0" />
                  <span>Direct walkthrough with an apparel MES operations engineer</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0" />
                  <span>Full lineman wage ledger & QC alteration setup included</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-3">
                <a
                  href="https://wa.me/?text=Hi,%20I%20would%20like%20to%20request%20a%20live%20demo%20of%20Zigza%20MES%20for%20our%20garment%20factory."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1F9D63] hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Instant WhatsApp Consultation</span>
                </a>
              </div>
            </div>

            {/* Right Consultation Form Card: Generous Spacing & Clean Stacked Inputs */}
            <div className="lg:col-span-6 bg-white text-slate-900 p-7 sm:p-9 rounded-2xl border border-black shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                Request a Live Demonstration
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Enter your factory details for a customized walkthrough.
              </p>

              {isSubmitted ? (
                <div className="p-6 bg-[#FAF7F0] rounded-xl border border-black/15 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Demo Request Prepared!</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                    Your email application has been opened with your pre-filled request.
                  </p>
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=shawsumit6286@gmail.com&su=${encodeURIComponent(`Live Demo Request - ${demoForm.companyName || 'Apparel Factory'}`)}&body=${encodeURIComponent(`Hi Sumit,\n\nI would like to request a live demo of Zigza MES for our garment manufacturing unit.\n\nDetails:\n• Company: ${demoForm.companyName}\n• Owner / Plant Head: ${demoForm.ownerName}\n• Phone / WhatsApp: ${demoForm.phone}\n• Business Email: ${demoForm.email}\n\nPlease contact us to schedule the walkthrough.\n\nBest regards,\n${demoForm.ownerName}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open in Gmail Web</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="px-3.5 py-2 bg-white border border-black/15 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer hover:text-black"
                    >
                      Reset Form
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Company / Factory Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shree Garments / Ollypop Unit"
                      value={demoForm.companyName}
                      onChange={e => setDemoForm({ ...demoForm, companyName: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Owner / Plant Head Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma / Anil Gupta"
                      value={demoForm.ownerName}
                      onChange={e => setDemoForm({ ...demoForm, ownerName: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={demoForm.phone}
                      onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Business Email ID *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="owner@factory.com"
                      value={demoForm.email}
                      onChange={e => setDemoForm({ ...demoForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 mt-5"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>Send Demo Request</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 10. ENTERPRISE FOOTER (LIGHT MODERN PALETTE)                       */}
      {/* =================================================================== */}
      <footer className="bg-[#FDFBF7] text-slate-600 pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
            
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="inline-block group">
                <img 
                  src="/z i g z a (1).png" 
                  alt="zigza." 
                  className="h-8 sm:h-9 w-auto object-contain rounded-md sm:rounded-lg overflow-hidden group-hover:opacity-90 transition-opacity duration-150"
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
                  <a 
                    href="#modules" 
                    onClick={(e) => scrollToSection(e, 'modules')}
                    className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block cursor-pointer"
                  >
                    Store & Fabric GRN
                  </a>
                </li>
                <li>
                  <a 
                    href="#modules" 
                    onClick={(e) => scrollToSection(e, 'modules')}
                    className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block cursor-pointer"
                  >
                    Cutting Lot Matrix
                  </a>
                </li>
                <li>
                  <a 
                    href="#modules" 
                    onClick={(e) => scrollToSection(e, 'modules')}
                    className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block cursor-pointer"
                  >
                    Bundle Allotments
                  </a>
                </li>
                <li>
                  <a 
                    href="#modules" 
                    onClick={(e) => scrollToSection(e, 'modules')}
                    className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block cursor-pointer"
                  >
                    3-Stage QC Audit
                  </a>
                </li>
                <li>
                  <a 
                    href="#modules" 
                    onClick={(e) => scrollToSection(e, 'modules')}
                    className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block cursor-pointer"
                  >
                    Dispatch Bay
                  </a>
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
                  <a 
                    href="#roles" 
                    onClick={(e) => scrollToSection(e, 'roles')}
                    className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block cursor-pointer"
                  >
                    Factory Heads & MDs
                  </a>
                </li>
                <li>
                  <a 
                    href="#roles" 
                    onClick={(e) => scrollToSection(e, 'roles')}
                    className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block cursor-pointer"
                  >
                    Cutting Masters
                  </a>
                </li>
                <li>
                  <a 
                    href="#roles" 
                    onClick={(e) => scrollToSection(e, 'roles')}
                    className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block cursor-pointer"
                  >
                    Store Managers
                  </a>
                </li>
                <li>
                  <a 
                    href="#roles" 
                    onClick={(e) => scrollToSection(e, 'roles')}
                    className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block cursor-pointer"
                  >
                    Linemen & Tailors
                  </a>
                </li>
                <li>
                  <a 
                    href="#roles" 
                    onClick={(e) => scrollToSection(e, 'roles')}
                    className="text-slate-600 hover:text-slate-900 hover:underline transition-colors inline-block cursor-pointer"
                  >
                    QC Inspectors
                  </a>
                </li>
              </ul>
            </div>

            {/* Access & Gateway Column */}
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
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(true)}
                    className="text-slate-600 hover:text-slate-900 transition-colors inline-block cursor-pointer"
                  >
                    Schedule Live Demo
                  </button>
                </li>
                <li>
                  <a 
                    href="#roi" 
                    className="text-slate-600 hover:text-slate-900 transition-colors inline-block"
                  >
                    ROI Estimator
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
                <IndiaFlag className="w-5 h-3.5 rounded-xs" />
                <span className="text-proudly-india-black">
                  Proudly Made in India
                </span>
              </div>
              <p className="text-xs text-slate-500">© {new Date().getFullYear()} Zigza. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
              <Link href="/security" className="hover:text-slate-900 transition-colors">Security Standards</Link>
            </div>
          </div>

        </div>
      </footer>

      {/* =================================================================== */}
      {/* 11. INTERACTIVE REQUEST DEMO MODAL                                  */}
      {/* =================================================================== */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#1C1A2E]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 sm:my-auto relative max-h-[90vh] overflow-y-auto">
            
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <img 
                src="/z i g z a (1).png" 
                alt="zigza." 
                className="h-7 w-auto object-contain rounded-md overflow-hidden"
              />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Request a Live Demo
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Schedule a personalized walkthrough of the apparel MES platform.
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-[#FAF7F0] rounded-2xl border border-black/15 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Demo Request Prepared!</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Your email application has been opened with your pre-filled request.
                </p>
                <div className="p-3 bg-white border border-black/10 rounded-xl text-left text-xs space-y-1 font-mono">
                  <div className="text-slate-500 font-sans">Details being sent:</div>
                  <div className="text-slate-800"><strong>Company:</strong> {demoForm.companyName}</div>
                  <div className="text-slate-800"><strong>Owner:</strong> {demoForm.ownerName}</div>
                  <div className="text-slate-800"><strong>Phone:</strong> {demoForm.phone}</div>
                  <div className="text-slate-800"><strong>Email:</strong> {demoForm.email}</div>
                </div>
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=shawsumit6286@gmail.com&su=${encodeURIComponent(`Live Demo Request - ${demoForm.companyName || 'Apparel Factory'}`)}&body=${encodeURIComponent(`Hi Sumit,\n\nI would like to request a live demo of Zigza MES for our garment manufacturing unit.\n\nDetails:\n• Company Name: ${demoForm.companyName}\n• Owner / Contact Name: ${demoForm.ownerName}\n• Phone / WhatsApp: ${demoForm.phone}\n• Business Email: ${demoForm.email}\n\nPlease contact us to schedule the live walkthrough.\n\nBest regards,\n${demoForm.ownerName}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open in Gmail Web</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false)
                      setIsDemoModalOpen(false)
                    }}
                    className="px-4 py-2 bg-white border border-black/15 text-slate-700 hover:text-black rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Company / Factory Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shree Garments / Ollypop Unit"
                    value={demoForm.companyName}
                    onChange={e => setDemoForm({ ...demoForm, companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Owner / Plant Head Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma / Anil Gupta"
                    value={demoForm.ownerName}
                    onChange={e => setDemoForm({ ...demoForm, ownerName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={demoForm.phone}
                    onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Business Email ID *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@factory.com"
                    value={demoForm.email}
                    onChange={e => setDemoForm({ ...demoForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 mt-5"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>Send Demo Request</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
