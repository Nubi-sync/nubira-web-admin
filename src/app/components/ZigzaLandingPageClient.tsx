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
  Check
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
          
          {/* Brand Logo with Smooth Scroll Transition */}
          <Link href="/" className="group relative flex items-center cursor-pointer select-none shrink-0">
            {/* Initial State (At Top): Rounded indigo badge with zigza_logo.png */}
            <div 
              className={`flex items-center transition-all duration-300 ease-in-out ${
                isScrolled 
                  ? 'opacity-0 scale-95 pointer-events-none' 
                  : 'opacity-100 scale-100'
              }`}
            >
              <img 
                src="/zigza_logo.png" 
                alt="zigza." 
                className="h-[36px] sm:h-[44px] w-auto object-contain rounded-md sm:rounded-lg overflow-hidden shadow-xs group-hover:opacity-95 transition-opacity"
              />
            </div>

            {/* Scrolled State: Clean wordmark with image.png */}
            <div 
              className={`absolute left-0 top-0 bottom-0 flex items-center transition-all duration-300 ease-in-out ${
                isScrolled 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <img 
                src="/image.png" 
                alt="zigza." 
                className="h-[36px] sm:h-[44px] w-auto object-contain mix-blend-multiply transition-transform group-hover:scale-[1.02]"
              />
            </div>
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

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#FAFAF8] border-b border-[#57564E]/15 px-5 pt-3 pb-6 space-y-4 shadow-lg">
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
                className="w-full py-3 rounded-md text-[15px] font-medium bg-[#3A3564] text-white hover:bg-[#2F2B52] transition-colors flex items-center justify-center gap-2"
              >
                <span>Request a Live Demo</span>
                <ArrowRight className="w-4 h-4 text-white/70" />
              </button>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-md text-[15px] font-medium text-[#14140F] border border-[#57564E]/25 bg-transparent hover:bg-[#14140F]/5 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-[#57564E]" />
                <span>Staff Portal Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =================================================================== */}
      {/* 2. HERO SECTION WITH PRODUCT EXECUTION SCREENSHOT PREVIEW           */}
      {/* =================================================================== */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-4xl mx-auto space-y-5">
          {/* Main Hero Headline: Display scale, Semibold, confident single Ink statement */}
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-semibold tracking-tight text-[#14140F] leading-[1.08]">
            The Manufacturing OS for Modern Garment Factories
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
          <div className="bg-white border-2 border-[var(--border,#E2E8F0)] rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
            
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
      <section className="py-14 sm:py-20 bg-white border-y border-[#57564E]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#14140F] tracking-tight">
              Why Garment Factories Are Switching from Paper to Zigza
            </h2>
            <p className="text-base sm:text-lg text-[#57564E] mt-3 leading-relaxed">
              Compare the friction of traditional manual paper registers with Zigza's digital execution platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            
            {/* Traditional Challenges Card: Muted Terracotta */}
            <div className="p-6 sm:p-7 rounded-xl border border-[#F2CAC5] bg-[#FDF2F0]/60 space-y-4">
              <div className="flex items-center gap-2.5 text-[#8A3B34]">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-lg sm:text-xl font-medium">Traditional manufacturing friction</h3>
              </div>
              <ul className="space-y-3.5 text-sm text-[#57564E]">
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-[#8A3B34] shrink-0 mt-0.5" />
                  <span><strong className="text-[#14140F] font-medium">Lost paper challans & slips:</strong> Supplier delivery slips get misplaced, causing raw fabric shortages and billing confusion.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-[#8A3B34] shrink-0 mt-0.5" />
                  <span><strong className="text-[#14140F] font-medium">Lineman wage disputes:</strong> Daily arguments over bundle piece counts and missing stitched units during wage payouts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-[#8A3B34] shrink-0 mt-0.5" />
                  <span><strong className="text-[#14140F] font-medium">Late QC defect discovery:</strong> Stains and stitching alterations discovered at packing bay, causing shipment delays.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-[#8A3B34] shrink-0 mt-0.5" />
                  <span><strong className="text-[#14140F] font-medium">WIP blind spots:</strong> Factory owners have zero real-time visibility into floor bottlenecks or cutting table pace.</span>
                </li>
              </ul>
            </div>

            {/* Zigza Digital Solution Card: Muted Sage */}
            <div className="p-6 sm:p-7 rounded-xl border border-[#C7E2D3] bg-[#EDF5F0]/60 space-y-4">
              <div className="flex items-center gap-2.5 text-[#2E6B4F]">
                <Check className="w-5 h-5 shrink-0" />
                <h3 className="text-lg sm:text-xl font-medium">The Zigza MES digital workflow</h3>
              </div>
              <ul className="space-y-3.5 text-sm text-[#57564E]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2E6B4F] shrink-0 mt-0.5" />
                  <span><strong className="text-[#14140F] font-medium">Digital gate inward (GRN):</strong> Supplier paper slips photographed on mobile and instantly reconciled with fabric roll lots.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2E6B4F] shrink-0 mt-0.5" />
                  <span><strong className="text-[#14140F] font-medium">1-Click Excel challan import:</strong> Raw buyer spreadsheets automatically map to cutting lot matrices and size tiers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2E6B4F] shrink-0 mt-0.5" />
                  <span><strong className="text-[#14140F] font-medium">Dispute-free piece-rate wages:</strong> Automated bundle allocation per lineman with live mobile app verification.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2E6B4F] shrink-0 mt-0.5" />
                  <span><strong className="text-[#14140F] font-medium">3-Stage live QC & alteration routing:</strong> Immediate defect tagging on mobile with instant supervisor rework dispatch.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. 6 CORE MODULAR ENGINES                                           */}
      {/* =================================================================== */}
      <section id="modules" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <p className="text-xs sm:text-[13px] font-normal text-[#57564E] mb-2.5">
            End-to-end modular architecture
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#14140F] tracking-tight">
            Specialized Engines Engineered for Floor Precision
          </h2>
          <p className="text-base sm:text-lg text-[#57564E] mt-3 leading-relaxed">
            Every department in your factory gets dedicated tools connected to a single live database.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          
          {/* Module 1: Store GRN */}
          <div className="p-6 sm:p-7 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl hover:border-[#57564E]/30 transition-colors group">
            <div className="w-11 h-11 rounded-lg border border-[#57564E]/20 bg-white text-[#3A3564] flex items-center justify-center mb-4.5">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-[#14140F] mb-2">
              Truck Inward & Store GRN
            </h3>
            <p className="text-sm sm:text-[15px] text-[#57564E] leading-relaxed font-normal">
              Capture delivery challan slips via mobile camera. Log fabric rolls (Sinker, Rib), lot barcodes, 
              trims, and track supplier pending accessories.
            </p>
          </div>

          {/* Module 2: Excel Challan Matrix */}
          <div className="p-6 sm:p-7 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl hover:border-[#57564E]/30 transition-colors group">
            <div className="w-11 h-11 rounded-lg border border-[#57564E]/20 bg-white text-[#3A3564] flex items-center justify-center mb-4.5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-[#14140F] mb-2">
              1-Click Excel Challan Ingestion
            </h3>
            <p className="text-sm sm:text-[15px] text-[#57564E] leading-relaxed font-normal">
              Upload buyer spreadsheets to instantly generate multi-article size matrices, 
              sets, and piece ratios without manual data entry.
            </p>
          </div>

          {/* Module 3: Piece-Rate Wages */}
          <div className="p-6 sm:p-7 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl hover:border-[#57564E]/30 transition-colors group">
            <div className="w-11 h-11 rounded-lg border border-[#57564E]/20 bg-white text-[#3A3564] flex items-center justify-center mb-4.5">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-[#14140F] mb-2">
              Smart Allotment & Piece-Rate Wages
            </h3>
            <p className="text-sm sm:text-[15px] text-[#57564E] leading-relaxed font-normal">
              Allot cutting lots entirely or split by color combinations across linemen. Automated wage 
              calculation with zero discrepancy.
            </p>
          </div>

          {/* Module 4: Floor Mobile App */}
          <div className="p-6 sm:p-7 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl hover:border-[#57564E]/30 transition-colors group">
            <div className="w-11 h-11 rounded-lg border border-[#57564E]/20 bg-white text-[#3A3564] flex items-center justify-center mb-4.5">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-[#14140F] mb-2">
              Mobile Floor Supervisor App
            </h3>
            <p className="text-sm sm:text-[15px] text-[#57564E] leading-relaxed font-normal">
              Android companion app with offline support. Supervisors record daily production, scan bundle QR 
              barcodes, and view active line targets.
            </p>
          </div>

          {/* Module 5: 3-Stage QC Gate */}
          <div className="p-6 sm:p-7 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl hover:border-[#57564E]/30 transition-colors group">
            <div className="w-11 h-11 rounded-lg border border-[#57564E]/20 bg-white text-[#3A3564] flex items-center justify-center mb-4.5">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-[#14140F] mb-2">
              3-Stage Quality Control Gate
            </h3>
            <p className="text-sm sm:text-[15px] text-[#57564E] leading-relaxed font-normal">
              Lightbox garment audit with passing vs defect classification (stain, stitch open, mending). 
              Instant floor alteration re-routing.
            </p>
          </div>

          {/* Module 6: Dispatch Bay */}
          <div className="p-6 sm:p-7 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl hover:border-[#57564E]/30 transition-colors group">
            <div className="w-11 h-11 rounded-lg border border-[#57564E]/20 bg-white text-[#3A3564] flex items-center justify-center mb-4.5">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-[#14140F] mb-2">
              Dispatch Bay & Carton Reconciliation
            </h3>
            <p className="text-sm sm:text-[15px] text-[#57564E] leading-relaxed font-normal">
              Carton packing lists, buyer delivery challan generation with transport metadata, and automated 
              finished goods inventory deductions.
            </p>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. 5-STEP FACTORY FLOW PIPELINE (ROADMAP)                          */}
      {/* =================================================================== */}
      <section id="workflow" className="py-14 sm:py-20 bg-white border-y border-[#57564E]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#14140F] tracking-tight">
              The 5-Step Synchronized Factory Pipeline
            </h2>
            <p className="text-base sm:text-lg text-[#57564E] mt-3 leading-relaxed">
              From raw cloth arrival to buyer truck dispatch — every milestone is tracked in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {/* Desktop Connecting Line behind step badges */}
            <div className="hidden lg:block absolute top-[30px] left-[10%] right-[10%] h-px bg-[#57564E]/20 -z-0" />
            
            {/* Step 1 */}
            <div className="p-4 sm:p-5 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#3A3564] text-white text-xs font-medium flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="text-base font-medium text-[#14140F]">Store GRN</h4>
              <p className="text-xs text-[#57564E] mt-1.5 leading-relaxed">
                Fabric roll barcoding and paper delivery slip photo capture.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 sm:p-5 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#3A3564] text-white text-xs font-medium flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="text-base font-medium text-[#14140F]">Excel Cutting Matrix</h4>
              <p className="text-xs text-[#57564E] mt-1.5 leading-relaxed">
                Automatic generation of size tiers (L/XXL, 22x26) from buyer Excel sheet.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 sm:p-5 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#3A3564] text-white text-xs font-medium flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="text-base font-medium text-[#14140F]">Lineman Allotment</h4>
              <p className="text-xs text-[#57564E] mt-1.5 leading-relaxed">
                Color-split bundle distribution with piece-rate rate tracking.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 sm:p-5 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#3A3564] text-white text-xs font-medium flex items-center justify-center mb-3">
                4
              </div>
              <h4 className="text-base font-medium text-[#14140F]">3-Stage QC Audit</h4>
              <p className="text-xs text-[#57564E] mt-1.5 leading-relaxed">
                Mobile garment passing and defect alteration routing.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 sm:p-5 bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#3A3564] text-white text-xs font-medium flex items-center justify-center mb-3">
                5
              </div>
              <h4 className="text-base font-medium text-[#14140F]">Buyer Dispatch</h4>
              <p className="text-xs text-[#57564E] mt-1.5 leading-relaxed">
                Carton packing verification and delivery challan issuance.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 6. SOLUTIONS TAILORED FOR FACTORY ROLES (INTERACTIVE TABS)          */}
      {/* =================================================================== */}
      <section id="roles" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#14140F] tracking-tight">
            Built for Every Stakeholder on the Factory Floor
          </h2>
          <p className="text-base sm:text-lg text-[#57564E] mt-3 leading-relaxed">
            Tailored interfaces engineered for the specific daily goals of each factory role.
          </p>

          {/* Role Switcher Tabs */}
          <div className="mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto">
            <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
              {(
                [
                  { key: 'MD', label: 'Factory Owners' },
                  { key: 'CUTTING', label: 'Cutting Masters' },
                  { key: 'STORE', label: 'Store Managers' },
                  { key: 'LINEMAN', label: 'Linemen' },
                  { key: 'QC', label: 'QC Inspectors' }
                ] as const
              ).map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveRoleTab(tab.key)}
                  className={`px-4 py-2 rounded-md text-xs sm:text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeRoleTab === tab.key
                      ? 'bg-[#3A3564] text-white shadow-xs'
                      : 'bg-[#FAFAF8] border border-[#57564E]/20 text-[#57564E] hover:text-[#14140F] hover:bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content Box: Flat bordered card, monochrome feature pills */}
        <div className="max-w-4xl mx-auto bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl p-6 sm:p-8">
          {activeRoleTab === 'MD' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#3A3564]">
                <Users className="w-5 h-5" />
                <h3 className="text-lg sm:text-xl font-medium text-[#14140F]">For Factory Managing Directors & Plant Heads</h3>
              </div>
              <p className="text-sm text-[#57564E] leading-relaxed">
                Gain 360-degree real-time visibility into active buyer job work, WIP throughput, and piece-rate 
                labor expenses across all lines. Stop relying on stale paper registers and eliminate ghost piece losses.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-[13px] font-medium text-[#14140F]">
                <div className="p-3 bg-white border border-[#57564E]/15 rounded-lg flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#57564E] shrink-0" />
                  <span>Real-time plant utilization & bottlenecks</span>
                </div>
                <div className="p-3 bg-white border border-[#57564E]/15 rounded-lg flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#57564E] shrink-0" />
                  <span>Accurate labor wage & piece accounting</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'CUTTING' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#3A3564]">
                <Scissors className="w-5 h-5" />
                <h3 className="text-lg sm:text-xl font-medium text-[#14140F]">For Cutting Masters & Table Supervisors</h3>
              </div>
              <p className="text-sm text-[#57564E] leading-relaxed">
                Upload raw buyer Excel sheets to instantly generate multi-article size grids. Never spend hours doing 
                manual ratio calculations (1:9, L/XXL, 22x26). Generate bundle allotment cards in 1 click.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-[13px] font-medium text-[#14140F]">
                <div className="p-3 bg-white border border-[#57564E]/15 rounded-lg flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#57564E] shrink-0" />
                  <span>1-Click Excel template & bulk upload</span>
                </div>
                <div className="p-3 bg-white border border-[#57564E]/15 rounded-lg flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#57564E] shrink-0" />
                  <span>Zero ratio calculation mistakes</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'STORE' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#3A3564]">
                <Truck className="w-5 h-5" />
                <h3 className="text-lg sm:text-xl font-medium text-[#14140F]">For Store Managers & Gate Keepers</h3>
              </div>
              <p className="text-sm text-[#57564E] leading-relaxed">
                Photograph supplier delivery slips at the truck bay and assign roll lot barcodes. Track pending trims 
                and accessories with automatic follow-up tags before cutting begins.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-[13px] font-medium text-[#14140F]">
                <div className="p-3 bg-white border border-[#57564E]/15 rounded-lg flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#57564E] shrink-0" />
                  <span>Delivery slip camera capture</span>
                </div>
                <div className="p-3 bg-white border border-[#57564E]/15 rounded-lg flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#57564E] shrink-0" />
                  <span>Supplier due accessory follow-up</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'LINEMAN' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#3A3564]">
                <Scissors className="w-5 h-5" />
                <h3 className="text-lg sm:text-xl font-medium text-[#14140F]">For Stitching Linemen & Operators</h3>
              </div>
              <p className="text-sm text-[#57564E] leading-relaxed">
                Clear transparency over daily stitched bundles and piece-rate earnings. No more lost piece counts or 
                conflicts at payout time. Every completed bundle is verifiable on mobile.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-[13px] font-medium text-[#14140F]">
                <div className="p-3 bg-white border border-[#57564E]/15 rounded-lg flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#57564E] shrink-0" />
                  <span>Transparent daily wage record</span>
                </div>
                <div className="p-3 bg-white border border-[#57564E]/15 rounded-lg flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#57564E] shrink-0" />
                  <span>Color & bundle breakdown</span>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'QC' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#3A3564]">
                <ClipboardCheck className="w-5 h-5" />
                <h3 className="text-lg sm:text-xl font-medium text-[#14140F]">For QC Inspectors & Finishing Supervisors</h3>
              </div>
              <p className="text-sm text-[#57564E] leading-relaxed">
                Log inspected pieces at lightbox checkpoints with 1 tap. Tag alterations with specific defect reasons 
                (oil stain, stitch open, measurement fault) and route them back to responsible lines immediately.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-[13px] font-medium text-[#14140F]">
                <div className="p-3 bg-white border border-[#57564E]/15 rounded-lg flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#57564E] shrink-0" />
                  <span>1-Tap pass & alteration logging</span>
                </div>
                <div className="p-3 bg-white border border-[#57564E]/15 rounded-lg flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#57564E] shrink-0" />
                  <span>Instant lineman alteration accountability</span>
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
          
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-xs sm:text-[13px] font-normal text-[#57564E] mb-2.5">
              Interactive ROI estimator
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#14140F] tracking-tight">
              Estimate Your Plant's Monthly Time & Error Savings
            </h2>
            <p className="text-base sm:text-lg text-[#57564E] mt-3 leading-relaxed">
              Adjust the sliders based on your factory's production volume to see estimated impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#FAFAF8] p-6 sm:p-8 rounded-xl border border-[#57564E]/15">
            
            {/* Sliders Area */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-[#14140F] mb-2">
                  <span>Monthly garment output:</span>
                  <span className="text-base font-medium text-[#14140F] font-mono tabular-nums">
                    {monthlyPieces.toLocaleString()} pieces
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={monthlyPieces}
                  onChange={e => setMonthlyPieces(Number(e.target.value))}
                  className="w-full h-2 bg-[#57564E]/20 rounded-lg appearance-none cursor-pointer accent-[#3A3564]"
                />
                <div className="flex justify-between text-[11px] text-[#57564E] font-mono tabular-nums mt-1">
                  <span>5,000 pcs</span>
                  <span>100,000 pcs</span>
                  <span>200,000+ pcs</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-[#14140F] mb-2">
                  <span>Active stitching linemen:</span>
                  <span className="text-base font-medium text-[#14140F] font-mono tabular-nums">
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
                  className="w-full h-2 bg-[#57564E]/20 rounded-lg appearance-none cursor-pointer accent-[#3A3564]"
                />
                <div className="flex justify-between text-[11px] text-[#57564E] font-mono tabular-nums mt-1">
                  <span>5 linemen</span>
                  <span>50 linemen</span>
                  <span>100+ linemen</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Card: Tabular numbers */}
            <div className="bg-white p-6 rounded-xl border border-[#57564E]/15 space-y-4">
              <span className="text-xs font-normal text-[#57564E]">
                Projected monthly savings
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#FAFAF8] border border-[#57564E]/15 rounded-lg">
                  <span className="text-xs font-normal text-[#57564E]">Floor hours saved</span>
                  <p className="text-2xl font-medium text-[#14140F] font-mono tabular-nums mt-1">
                    ~{estimatedHoursSaved} hrs/mo
                  </p>
                </div>

                <div className="p-3.5 bg-[#EDF5F0] border border-[#C7E2D3] rounded-lg">
                  <span className="text-xs font-normal text-[#2E6B4F]">Dispute reduction</span>
                  <p className="text-2xl font-medium text-[#2E6B4F] font-mono tabular-nums mt-1">
                    {disputeReductionRate}%
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FBF4E8] border border-[#F0DEC0] rounded-lg text-xs text-[#8C601A]">
                <span className="font-medium block mb-0.5">Zero mismatch guarantee</span>
                <p className="text-[11.5px] leading-relaxed text-[#8C601A]/90">
                  Every piece cut on table is reconciled across lineman bundles, QC pass counts, and dispatch cartons.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-2.5 bg-[#3A3564] hover:bg-[#2F2B52] text-white rounded-md text-[13px] font-medium transition-colors cursor-pointer"
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
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#14140F] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-[#57564E] mt-3 leading-relaxed">
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
                className="bg-[#FAFAF8] border border-[#57564E]/15 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-medium text-base sm:text-lg text-[#14140F] hover:text-[#3A3564] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#3A3564] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#57564E] shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-sm sm:text-base text-[#57564E] leading-relaxed border-t border-[#57564E]/10 animate-in fade-in duration-150">
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
      <section className="bg-[#1C1A2E] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* Left Text */}
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Transform Your Garment Factory with Zigza Today
            </h2>
            <p className="text-sm sm:text-base text-[#FAFAF8]/80 leading-relaxed font-normal">
              Book a personalized 20-minute live demonstration tailored to your plant capacity, 
              cutting tables, and floor workflow.
            </p>
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-3">
              <a
                href="https://wa.me/?text=Hi,%20I%20would%20like%20to%20request%20a%20live%20demo%20of%20Zigza%20MES%20for%20our%20garment%20factory."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#1F9D63] hover:bg-emerald-600 text-white text-[15px] font-medium transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Instant WhatsApp Consultation</span>
              </a>
            </div>
          </div>

          {/* Right Consultation Form Card: Consistent 6px radius and thin borders */}
          <div className="bg-white text-[#14140F] p-6 sm:p-7 rounded-xl border border-[#57564E]/20 shadow-sm">
            <h3 className="text-lg sm:text-xl font-medium text-[#14140F] mb-1">
              Request a Live Demonstration
            </h3>
            <p className="text-xs sm:text-[13px] text-[#57564E] mb-4">
              Enter your factory details for a customized walkthrough.
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-[#EDF5F0] rounded-lg border border-[#C7E2D3] text-center space-y-2.5">
                <Check className="w-10 h-10 text-[#2E6B4F] mx-auto" />
                <h4 className="text-sm font-medium text-[#2E6B4F]">Demo Request Received!</h4>
                <p className="text-xs text-[#57564E]">
                  Our plant solutions team will contact you within 24 hours to schedule your live walkthrough.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-2 text-xs font-medium text-[#3A3564] hover:underline cursor-pointer"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-normal text-[#57564E] mb-1">
                    Factory / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shree Garments / Ollypop Job Work"
                    value={demoForm.factoryName}
                    onChange={e => setDemoForm({ ...demoForm, factoryName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#57564E]/30 rounded-md text-sm text-[#14140F] focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-normal text-[#57564E] mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={demoForm.contactName}
                      onChange={e => setDemoForm({ ...demoForm, contactName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#57564E]/30 rounded-md text-sm text-[#14140F] focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-normal text-[#57564E] mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={demoForm.phone}
                      onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#57564E]/30 rounded-md text-sm text-[#14140F] focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-normal text-[#57564E] mb-1">
                    Monthly Output Volume
                  </label>
                  <select
                    value={demoForm.volume}
                    onChange={e => setDemoForm({ ...demoForm, volume: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#57564E]/30 rounded-md text-sm text-[#14140F] bg-white cursor-pointer focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
                  >
                    <option value="< 10,000 Pcs">Less than 10,000 Pieces / mo</option>
                    <option value="10,000 - 50,000 Pcs">10,000 - 50,000 Pieces / mo</option>
                    <option value="50,000 - 200,000 Pcs">50,000 - 200,000 Pieces / mo</option>
                    <option value="200,000+ Pcs">200,000+ Pieces / mo (Enterprise)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#3A3564] hover:bg-[#2F2B52] text-white rounded-md text-[15px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <Check className="w-4 h-4" />
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
      <footer className="bg-[#1C1A2E] text-[#9E9BAE] pt-14 pb-10 sm:pt-20 sm:pb-14 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
            
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="inline-block group">
                <img 
                  src="/zigza_white.png" 
                  alt="zigza." 
                  className="h-7 w-auto object-contain group-hover:opacity-80 transition-opacity duration-150"
                />
              </Link>
              <p className="text-sm text-[#9E9BAE] leading-relaxed max-w-sm font-normal">
                Manufacturing Execution System engineered for modern apparel factories. Replacing manual paper logs with real-time floor synchronization.
              </p>
            </div>

            {/* Platform Column: Sentence case, Small/Caption Slate */}
            <div className="space-y-3.5">
              <h5 className="text-[13px] font-medium text-[#9E9BAE]">
                Platform
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a 
                    href="#modules" 
                    onClick={(e) => scrollToSection(e, 'modules')}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    Store & Fabric GRN
                  </a>
                </li>
                <li>
                  <a 
                    href="#modules" 
                    onClick={(e) => scrollToSection(e, 'modules')}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    Cutting Lot Matrix
                  </a>
                </li>
                <li>
                  <a 
                    href="#modules" 
                    onClick={(e) => scrollToSection(e, 'modules')}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    Bundle Allotments
                  </a>
                </li>
                <li>
                  <a 
                    href="#modules" 
                    onClick={(e) => scrollToSection(e, 'modules')}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    3-Stage QC Audit
                  </a>
                </li>
                <li>
                  <a 
                    href="#modules" 
                    onClick={(e) => scrollToSection(e, 'modules')}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    Dispatch Bay
                  </a>
                </li>
              </ul>
            </div>

            {/* Solutions Column: Sentence case, Small/Caption Slate */}
            <div className="space-y-3.5">
              <h5 className="text-[13px] font-medium text-[#9E9BAE]">
                Roles
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a 
                    href="#roles" 
                    onClick={(e) => scrollToSection(e, 'roles')}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    Factory Heads & MDs
                  </a>
                </li>
                <li>
                  <a 
                    href="#roles" 
                    onClick={(e) => scrollToSection(e, 'roles')}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    Cutting Masters
                  </a>
                </li>
                <li>
                  <a 
                    href="#roles" 
                    onClick={(e) => scrollToSection(e, 'roles')}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    Store Managers
                  </a>
                </li>
                <li>
                  <a 
                    href="#roles" 
                    onClick={(e) => scrollToSection(e, 'roles')}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    Linemen & Tailors
                  </a>
                </li>
                <li>
                  <a 
                    href="#roles" 
                    onClick={(e) => scrollToSection(e, 'roles')}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    QC Inspectors
                  </a>
                </li>
              </ul>
            </div>

            {/* Access & Gateway Column: Sentence case, Small/Caption Slate */}
            <div className="space-y-3.5">
              <h5 className="text-[13px] font-medium text-[#9E9BAE]">
                Access
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link 
                    href="/login" 
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Staff Portal Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9E9BAE]" />
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(true)}
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    Schedule Live Demo
                  </button>
                </li>
                <li>
                  <a 
                    href="#roi" 
                    className="text-[#FAFAF8]/80 hover:text-white transition-colors inline-block"
                  >
                    ROI Estimator
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/?text=Hi,%20I%20would%20like%20to%20request%20a%20live%20demo%20of%20Zigza%20MES." 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-emerald-400 hover:text-emerald-300 transition-colors inline-block font-medium"
                  >
                    WhatsApp Consultation
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Divider & Minimal Legal Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9E9BAE]">
            <p>© {new Date().getFullYear()} Zigza MES. Built for modern apparel manufacturing.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-white transition-colors cursor-pointer">Security</span>
            </div>
          </div>

        </div>
      </footer>

      {/* =================================================================== */}
      {/* 11. INTERACTIVE REQUEST DEMO MODAL                                  */}
      {/* =================================================================== */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#1C1A2E]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-[#FAFAF8] rounded-t-xl sm:rounded-xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-[#57564E]/20 sm:my-auto relative max-h-[90vh] overflow-y-auto">
            
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-[#57564E] hover:text-[#14140F] hover:bg-[#14140F]/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <img 
                src="/zigza_dark.png" 
                alt="zigza." 
                className="h-7 w-auto object-contain"
              />
              <h3 className="text-lg font-medium text-[#14140F]">
                Request a Live Demo
              </h3>
            </div>
            <p className="text-xs sm:text-[13px] text-[#57564E] mb-4">
              Schedule a personalized walkthrough of the apparel MES platform.
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-[#EDF5F0] rounded-lg border border-[#C7E2D3] text-center space-y-3">
                <Check className="w-12 h-12 text-[#2E6B4F] mx-auto" />
                <h4 className="text-sm font-medium text-[#2E6B4F]">Demo Scheduled!</h4>
                <p className="text-xs text-[#57564E]">
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
                    className="px-4 py-2 bg-[#3A3564] text-white rounded-md text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-normal text-[#57564E] mb-1">
                    Factory / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ollypop Garment Unit"
                    value={demoForm.factoryName}
                    onChange={e => setDemoForm({ ...demoForm, factoryName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#57564E]/30 rounded-md text-sm text-[#14140F] focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-normal text-[#57564E] mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anil Gupta"
                      value={demoForm.contactName}
                      onChange={e => setDemoForm({ ...demoForm, contactName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#57564E]/30 rounded-md text-sm text-[#14140F] focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-normal text-[#57564E] mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={demoForm.phone}
                      onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#57564E]/30 rounded-md text-sm text-[#14140F] focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-normal text-[#57564E] mb-1">
                    Monthly Production Capacity
                  </label>
                  <select
                    value={demoForm.volume}
                    onChange={e => setDemoForm({ ...demoForm, volume: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#57564E]/30 rounded-md text-sm text-[#14140F] bg-white cursor-pointer focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
                  >
                    <option value="< 10,000 Pcs">Less than 10,000 Pcs/mo</option>
                    <option value="10,000 - 50,000 Pcs">10,000 - 50,000 Pcs/mo</option>
                    <option value="50,000 - 200,000 Pcs">50,000 - 200,000 Pcs/mo</option>
                    <option value="200,000+ Pcs">200,000+ Pcs/mo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-normal text-[#57564E] mb-1.5">
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
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#3A3564] text-white border-[#3A3564]'
                              : 'bg-white text-[#57564E] border-[#57564E]/25 hover:bg-[#FAFAF8]'
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
                  className="w-full py-3 bg-[#3A3564] hover:bg-[#2F2B52] text-white rounded-md text-[15px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 mt-3"
                >
                  <Check className="w-4 h-4" />
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
