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
  Mail,
  Settings,
  Zap,
  Building2,
  Loader2
} from 'lucide-react'
import { saveDemoRequest } from '../platform-admin/utils/platformStorage'
import { submitDemoRequestAction, checkContactInUseAction } from '../platform-admin/actions'

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

  // Subtle Ambient Cycle for Trust Pillar Cards (1.5s per card - faster tempo)
  const [activeTrustCard, setActiveTrustCard] = useState(0)
  useEffect(() => {
    const trustTimer = setInterval(() => {
      setActiveTrustCard(prev => (prev + 1) % 3)
    }, 1500)
    return () => clearInterval(trustTimer)
  }, [])

  // Demo Form State: Plan, Company Name, Plant Location, Owner Name, Phone, Business Email, Estimated Machines, Custom Requirements
  const [demoForm, setDemoForm] = useState({
    plan: 'FULL_PLANT_AI' as 'MODULAR' | 'FULL_PLANT_AI' | 'CUSTOM',
    companyName: '',
    cityState: '',
    ownerName: '',
    phone: '',
    email: '',
    estimatedMachines: '',
    customRequirements: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitAlreadyExists, setSubmitAlreadyExists] = useState(false)

  // Duplicate check state — only shown after form submit attempt
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)
  const [phoneDuplicate, setPhoneDuplicate] = useState<{ inUse: boolean; message?: string } | null>(null)
  const [emailDuplicate, setEmailDuplicate] = useState<{ inUse: boolean; message?: string } | null>(null)

  const handlePhoneChange = (val: string) => {
    // Strip non-digits
    let digits = val.replace(/\D/g, '')
    // If pasted with 91 prefix (12 digits), strip country code
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2)
    }
    // If starts with leading 0, strip it
    if (digits.length > 10 && digits.startsWith('0')) {
      digits = digits.slice(1)
    }
    // Limit to 10 digits
    digits = digits.slice(0, 10)
    
    // Format nicely as 5 digits + space + 5 digits
    let formatted = digits
    if (digits.length > 5) {
      formatted = `${digits.slice(0, 5)} ${digits.slice(5)}`
    }
    setDemoForm(prev => ({ ...prev, phone: formatted }))
    // Clear duplicate errors when user edits phone (they'll re-check on submit)
    if (phoneDuplicate) setPhoneDuplicate(null)
  }

  const handleEmailChange = (val: string) => {
    setDemoForm(prev => ({ ...prev, email: val }))
    // Clear duplicate errors when user edits email (they'll re-check on submit)
    if (emailDuplicate) setEmailDuplicate(null)
  }

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitAlreadyExists(false)
    setPhoneDuplicate(null)
    setEmailDuplicate(null)

    const rawDigits = demoForm.phone.replace(/\D/g, '')
    if (rawDigits.length !== 10) {
      setSubmitError('Please enter a valid 10-digit mobile number.')
      return
    }

    // Run duplicate check on submit
    setIsCheckingDuplicate(true)
    const cleanEmail = demoForm.email.trim().toLowerCase()
    const hasValidEmail = cleanEmail.includes('@') && cleanEmail.includes('.')

    try {
      const dupRes = await checkContactInUseAction(
        hasValidEmail ? cleanEmail : '',
        rawDigits
      )

      let hasDuplicate = false

      if (dupRes.phoneInUse) {
        const org = dupRes.phoneCompany ? ` for "${dupRes.phoneCompany}"` : ''
        setPhoneDuplicate({
          inUse: true,
          message: `This phone number (+91 ${demoForm.phone}) is already booked with us${org}. Kindly provide another phone number, or sign in to your portal.`
        })
        hasDuplicate = true
      }

      if (dupRes.emailInUse) {
        const org = dupRes.emailCompany ? ` for "${dupRes.emailCompany}"` : ''
        setEmailDuplicate({
          inUse: true,
          message: `This email address (${cleanEmail}) is already registered with us${org}. Kindly provide an alternate business email, or sign in.`
        })
        hasDuplicate = true
      }

      if (hasDuplicate) {
        setIsCheckingDuplicate(false)
        return
      }
    } catch (_) {
      // If duplicate check fails, proceed with submission anyway
    } finally {
      setIsCheckingDuplicate(false)
    }

    setIsSubmittingDemo(true)
    const formattedPhone = `+91 ${rawDigits.slice(0, 5)} ${rawDigits.slice(5)}`
    const cityStateValue = demoForm.cityState.trim() || 'Surat, Gujarat'

    try {
      const res = await submitDemoRequestAction({
        applicantName: demoForm.ownerName.trim() || 'Prospective Plant Head',
        companyName: demoForm.companyName.trim() || 'Apparel Factory Unit',
        phone: formattedPhone,
        email: demoForm.email.trim().toLowerCase(),
        preferredPlan: demoForm.plan,
        cityState: cityStateValue,
        estimatedMachines: demoForm.estimatedMachines ? parseInt(demoForm.estimatedMachines, 10) : undefined,
        notes: demoForm.customRequirements.trim() || (demoForm.plan === 'CUSTOM' ? 'Custom Enterprise Build Inquiry' : 'Inquiry submitted via introductory site live demo modal')
      })

      if (res.alreadyExists) {
        setSubmitAlreadyExists(true)
        setSubmitError(res.error || 'An inquiry is already registered with this email or phone number.')
        setIsSubmitted(true)
      } else if (res.success) {
        setSubmitAlreadyExists(false)
        setSubmitError(null)
        setIsSubmitted(true)
      } else {
        setSubmitError(res.error || 'Failed to submit demo request. Please try again.')
      }
    } catch (err: any) {
      console.error('Demo request submission error:', err)
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmittingDemo(false)
    }

    // Also trigger reactive client bus for instant UI reflection if in same session
    try {
      saveDemoRequest({
        applicantName: demoForm.ownerName.trim() || 'Prospective Plant Head',
        companyName: demoForm.companyName.trim() || 'Apparel Factory Unit',
        phone: formattedPhone,
        email: demoForm.email.trim().toLowerCase(),
        preferredPlan: demoForm.plan,
        cityState: cityStateValue,
        estimatedMachines: demoForm.estimatedMachines ? parseInt(demoForm.estimatedMachines, 10) : undefined,
        notes: demoForm.customRequirements.trim() || (demoForm.plan === 'CUSTOM' ? 'Custom Enterprise Build Inquiry' : 'Inquiry submitted via introductory site live demo modal')
      })
    } catch (_) {}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] sm:h-[88px] flex items-center justify-between gap-3">
          
          {/* Brand Logo: Single new_logo.png without scroll switching */}
          <Link href="/" className="group flex items-center cursor-pointer select-none shrink-0">
            <img 
              src="/z i g z a (2).png" 
              alt="zigza." 
              className="h-[42px] sm:h-[54px] lg:h-[60px] w-auto object-contain rounded-xl overflow-hidden shadow-xs transition-transform duration-150 group-hover:scale-[1.02]"
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
              href="#pricing"
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="group relative px-2.5 lg:px-3 py-2 text-[#57564E] hover:text-[#14140F] transition-colors duration-150 cursor-pointer"
            >
              <span>Subscription Plans</span>
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
                href="/modules"
                className="px-5 py-2.5 rounded-md text-[15px] font-medium bg-[#3A3564] text-white hover:bg-[#2F2B52] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Enter Workspace Hub</span>
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
                { id: 'pricing', label: 'Subscription Plans' },
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
              {isAuthenticated ? (
                <Link
                  href="/modules"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 rounded-md text-[15px] font-medium bg-[#3A3564] text-white hover:bg-[#2F2B52] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Enter Workspace Hub</span>
                  <ArrowRight className="w-4 h-4 text-white/70" />
                </Link>
              ) : (
                <>
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
                </>
              )}
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

          {/* Subtitle */}
          <div className="relative max-w-2xl mx-auto">
            {/* Subtitle: Body Large, Slate, capped line length */}
            <p className="text-base sm:text-lg text-[#57564E] leading-relaxed font-normal">
              Connect fabric roll inward, automated cutting matrices, smart lineman piece-rate allotments, 
              live 3-stage QC, and buyer dispatch challans into one synchronized floor.
            </p>
          </div>

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
      <section className="py-14 sm:py-20 bg-white border-y border-slate-200/80 relative overflow-hidden xl:overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Why Garment Factories Are Switching from Paper to Zigza
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
              Compare traditional manual paper registers with Zigza's synchronized floor execution.
            </p>
          </div>

          {/* Difference Table with Handwritten Pencil Notes & Curly Connecting Lines */}
          <div className="relative max-w-5xl mx-auto">
            {/* Red Handwritten Pencil Note & Curly Line on the Left (Desktop Only, Larger Readable Font + Sad Face Icon) */}
            <div 
              className="hidden xl:flex absolute -left-56 2xl:-left-64 top-6 flex-col items-end pointer-events-none select-none"
              aria-hidden="true"
            >
              <div className="w-52 text-right font-pencil text-[28px] 2xl:text-[34px] font-bold text-rose-600 leading-tight -rotate-3 drop-shadow-2xs">
                <span>Paper chaos & lost slips!</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-rose-600 shrink-0 inline-block align-middle ml-1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                  <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                </svg>
              </div>
              <svg width="120" height="65" viewBox="0 0 120 65" fill="none" className="mt-1 text-rose-500 overflow-visible">
                <path 
                  d="M 12 8 C 40 4, 55 30, 75 20 C 95 10, 85 50, 115 46" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M 105 40 L 117 46 L 110 56" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>

            {/* Green Handwritten Pencil Note & Curly Line on the Right (Desktop Only, Larger Readable Font + Happy Face Icon) */}
            <div 
              className="hidden xl:flex absolute -right-56 2xl:-right-64 top-6 flex-col items-start pointer-events-none select-none"
              aria-hidden="true"
            >
              <div className="w-52 text-left font-pencil text-[28px] 2xl:text-[34px] font-bold text-emerald-600 leading-tight rotate-2 drop-shadow-2xs">
                <span>Zero chaos, total sync!</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-emerald-600 shrink-0 inline-block align-middle ml-1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                  <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                </svg>
              </div>
              <svg width="120" height="65" viewBox="0 0 120 65" fill="none" className="mt-1 text-emerald-500 overflow-visible">
                <path 
                  d="M 108 8 C 80 4, 65 30, 45 20 C 25 10, 35 50, 5 46" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M 15 40 L 3 46 L 10 56" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
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
          {[
            {
              title: 'Truck Inward & Store GRN',
              icon: Truck,
              features: [
                'Photo capture for supplier delivery challans',
                'Fabric roll barcode tracking (Sinker, Rib, Lycra)',
                'Live trims & accessories balance reconciliation',
              ],
            },
            {
              title: '1-Click Excel Ingestion',
              icon: FileSpreadsheet,
              features: [
                'Direct import of buyer purchase spreadsheets',
                'Auto-calculated size & color breakdown matrix',
                'Zero manual entry errors or ratio mismatches',
              ],
            },
            {
              title: 'Smart Allotment & Wages',
              icon: Scissors,
              features: [
                'Lot allotment across linemen by color & size',
                'Real-time QR barcode scan per stitched unit',
                'Automated, dispute-free piece-rate wage ledger',
              ],
            },
            {
              title: 'Mobile Floor Supervisor',
              icon: Smartphone,
              features: [
                'Fast scanner companion for Android smartphones',
                'Continuous offline logging during WiFi dropouts',
                'Live line output pace & bottleneck alerts',
              ],
            },
            {
              title: '3-Stage Quality Control',
              icon: ClipboardCheck,
              features: [
                '1-Tap defect tagging at lightbox checkpoints',
                'Instant alteration routing directly back to tailors',
                'Operator defect tracking & pass-rate analytics',
              ],
            },
            {
              title: 'Carton Packing & Dispatch',
              icon: PackageCheck,
              features: [
                'Auto-generated carton packing lists & piece counts',
                'Buyer delivery challans with transport metadata',
                'Finished goods inventory deducted at gate exit',
              ],
            },
          ].map((engine) => {
            const Icon = engine.icon

            return (
              <div
                key={engine.title}
                className="group relative bg-white rounded-2xl border border-slate-200 hover:border-black/70 p-6 sm:p-7 transition-all duration-300 hover:shadow-md md:hover:-translate-y-1 flex flex-col justify-between h-full overflow-hidden cursor-default"
              >
                <div>
                  {/* Header with Expanding Seam Accent (Desktop Exclusive) */}
                  <div className="relative pb-3 mb-5 overflow-hidden">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        {engine.title}
                      </h3>
                      <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-black/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-[#3A3564] shrink-0 md:group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Expanding Seam Line: w-full on mobile, starts at 36px on desktop and expands to 100% on hover in 420ms */}
                    <div className="w-full h-[2.5px] bg-slate-200 rounded-full overflow-hidden relative">
                      <div className="h-full bg-[#3A3564] w-full md:w-9 md:group-hover:w-full transition-all duration-420 ease-out rounded-full" />
                    </div>
                  </div>

                  {/* Staggered Cascading Audit Checklist (Desktop Exclusive) */}
                  <ul className="space-y-3 text-sm text-slate-600">
                    {engine.features.map((feat, fIdx) => (
                      <li
                        key={feat}
                        className={`flex items-start gap-2.5 transition-transform duration-250 ${
                          fIdx === 0 ? 'delay-0' : fIdx === 1 ? 'delay-75' : 'delay-150'
                        } md:group-hover:translate-x-1.5`}
                      >
                        <Check className="w-4 h-4 text-[#3A3564] md:group-hover:scale-110 md:group-hover:text-emerald-600 transition-all duration-200 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
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
      {/* =================================================================== */}
      {/* 6. TRUSTED ACROSS APPAREL MANUFACTURING HUBS (NATIONWIDE MAP)       */}
      {/* =================================================================== */}
      <section id="roles" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Why Trust Zigza - High Contrast, Prominent Typography & Subtle Active State */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Trusted Across India&apos;s Garment Hubs
              </h2>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                From local stitching lines to multi-tier export factories — Zigza simplifies daily production, piece-rate wages, and floor tracking.
              </p>
            </div>

            {/* Core Trust Pillars with subtle ambient cycle animation */}
            <div className="space-y-3.5 pt-1">
              {[
                {
                  id: 0,
                  icon: Building2,
                  title: 'Floor-Ready Workflows',
                  desc: 'Pre-built for fabric lay ratios, job-work challans, and contractor piece rates.'
                },
                {
                  id: 1,
                  icon: ShieldCheck,
                  title: 'Strict Data Privacy',
                  desc: 'Buyer margins, worker payouts, and tech packs stay 100% confidential.'
                },
                {
                  id: 2,
                  icon: Zap,
                  title: 'Offline-First Sync',
                  desc: 'Log daily cuts and sewing handovers continuously, even during Wi-Fi drops.'
                }
              ].map((pillar, idx) => {
                const isCurrent = activeTrustCard === idx;
                return (
                  <div
                    key={pillar.id}
                    onClick={() => setActiveTrustCard(idx)}
                    onMouseEnter={() => setActiveTrustCard(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                      isCurrent
                        ? 'bg-white border-[#3A3564] shadow-md -translate-y-0.5 ring-1 ring-[#3A3564]/15'
                        : 'bg-white/80 border-slate-200 hover:border-slate-400 hover:bg-white'
                    }`}
                  >
                    {/* Outline Icon Badge */}
                    <div
                      className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5 ${
                        isCurrent
                          ? 'bg-[#FAF7F0] border-[#3A3564] text-[#3A3564] shadow-2xs scale-105'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      <pillar.icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight">
                          {pillar.title}
                        </h3>
                        {isCurrent && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3A3564] shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm sm:text-[14.5px] text-slate-600 mt-1 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Generated Minimalist Outline Map with Hand-Drawn Green Trust Notes */}
          <div className="lg:col-span-7 flex items-center justify-center relative">
            <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center">
              
              {/* Map Image */}
              <img
                src="/india_outline_map.png"
                alt="India Garment Manufacturing Network"
                className="w-full h-full object-contain mix-blend-multiply select-none pointer-events-none"
                loading="lazy"
              />

              {/* Green Handwritten Note 1 (Top-Left pointing to North line) */}
              <div className="absolute top-[2%] left-[2%] sm:top-[5%] sm:left-[6%] z-20 pointer-events-none select-none flex flex-col items-start -rotate-3">
                <span className="font-['Caveat',cursive] text-emerald-700 font-bold text-xl sm:text-2xl leading-tight tracking-wide drop-shadow-2xs">
                  Zero ghost pieces! ⚡
                </span>
                <svg className="w-14 h-8 sm:w-16 sm:h-9 text-emerald-600 mt-0.5 ml-4 overflow-visible" viewBox="0 0 70 40" fill="none">
                  <path
                    d="M 6 4 C 20 8, 38 16, 52 30"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 38 28 L 54 32 L 48 18"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Green Handwritten Note 2 (Top-Right pointing to East/Central) */}
              <div className="absolute top-[6%] right-[2%] sm:top-[8%] sm:right-[4%] z-20 pointer-events-none select-none flex flex-col items-end rotate-2">
                <span className="font-['Caveat',cursive] text-emerald-700 font-bold text-xl sm:text-2xl leading-tight tracking-wide drop-shadow-2xs text-right">
                  100% confidential! 🔒
                </span>
                <svg className="w-14 h-8 sm:w-16 sm:h-9 text-emerald-600 mt-0.5 mr-5 overflow-visible" viewBox="0 0 70 40" fill="none">
                  <path
                    d="M 62 4 C 48 8, 32 16, 16 30"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 18 18 L 14 32 L 30 28"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Green Handwritten Note 3 (Bottom-Left pointing to South wages) */}
              <div className="absolute bottom-[4%] left-[2%] sm:bottom-[8%] sm:left-[6%] z-20 pointer-events-none select-none flex flex-col items-start -rotate-2">
                <svg className="w-14 h-8 sm:w-16 sm:h-9 text-emerald-600 mb-0.5 ml-10 overflow-visible" viewBox="0 0 70 40" fill="none">
                  <path
                    d="M 8 32 C 22 24, 40 16, 54 6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 40 5 L 56 6 L 50 20"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-['Caveat',cursive] text-emerald-700 font-bold text-xl sm:text-2xl leading-tight tracking-wide drop-shadow-2xs">
                  Daily piece rates synced! ✓
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 7. INTERACTIVE ROI & COST SAVINGS CALCULATOR                        */}
      {/* =================================================================== */}
      {/* =================================================================== */}
      {/* 7. SUBSCRIPTION PLANS & PRODUCTION DEPLOYMENT PRICING               */}
      {/* =================================================================== */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-y border-[#57564E]/15 scroll-mt-20">
        <div id="roi" className="sr-only" /> {/* Legacy anchor fallback */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header (No pill badge) */}
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Predictable Plans for Modern Plants
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed max-w-2xl mx-auto">
              From modular floor units to complete synchronized AI operations and bespoke machine engineering.
            </p>
          </div>

          {/* Prominent Live Demo Request Banner near Subscription Boxes */}
          <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-[#FAF7F0] border border-[#3A3564]/20 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Need a Live Walkthrough with Your Plant Data?
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  See how all 12 production divisions map directly to your fabric rolls, cutting tables, and operator wage ledgers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDemoForm(prev => ({ ...prev, plan: 'FULL_PLANT_AI' }))
                setIsDemoModalOpen(true)
              }}
              className="px-6 py-3.5 rounded-xl bg-[#3A3564] hover:bg-[#2c284e] text-white text-xs sm:text-sm font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Request for a Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Clean & Spacious Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* TIER 1: MODULAR FLOOR */}
            <div className="flex flex-col justify-between p-7 sm:p-9 rounded-2xl bg-white border border-black/80 hover:border-black shadow-2xs hover:shadow-md transition-all duration-200">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center mb-6 shadow-2xs">
                  <Layers className="w-6 h-6 stroke-[2]" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  Modular Floor
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Select 1 to 3 production units tailored to your specific plant workflow.
                </p>

                {/* Price Block */}
                <div className="my-7 pt-6 border-t border-black/10">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-4xl font-extrabold font-mono text-slate-900">
                      ₹1,999
                    </span>
                    <span className="text-sm font-semibold font-mono text-slate-400 line-through">
                      ₹3,999
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      / module / mo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Pay only for the divisions you run • Special Discount
                  </p>
                </div>

                {/* Uncluttered Punchy Features */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 to 3 production units of your choice</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Operator bundle QR & barcode tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Daily cutting lots & piece-rate wage ledgers</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mobile floor app with real-time sync</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <X className="w-4 h-4 text-slate-300 shrink-0" />
                    <span>Zigza AI floor assistant not included</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-9 pt-6 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setDemoForm(prev => ({ ...prev, plan: 'MODULAR' }))
                    setIsDemoModalOpen(true)
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold bg-[#FAF7F0] text-slate-900 hover:bg-[#3A3564] hover:text-white border border-black transition-all shadow-2xs cursor-pointer"
                >
                  <span>Select Modular Units</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TIER 2: ALL-ACCESS + ZIGZA AI */}
            <div className="flex flex-col justify-between p-7 sm:p-9 rounded-2xl bg-[#FAF7F0] border-2 border-[#3A3564] shadow-sm transition-all duration-200">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#3A3564] text-white flex items-center justify-center mb-6 shadow-2xs">
                  <Zap className="w-6 h-6 stroke-[2]" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  Full Access + Zigza AI
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  All 12 divisions unified with real-time floor intelligence to maximize speed.
                </p>

                {/* Price Block */}
                <div className="my-7 pt-6 border-t border-black/10">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-4xl font-extrabold font-mono text-[#3A3564]">
                      ₹4,999
                    </span>
                    <span className="text-sm font-semibold font-mono text-[#3A3564]/50 line-through">
                      ₹8,999
                    </span>
                    <span className="text-xs font-semibold text-[#3A3564]/80">
                      / plant / mo
                    </span>
                  </div>
                  <p className="text-xs text-[#3A3564] mt-1 font-medium">
                    All 12 modules unlocked • Unlimited operators
                  </p>
                </div>

                {/* Uncluttered Punchy Features */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0" />
                    <span>All 12 production divisions unlocked</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0" />
                    <span>In-built Zigza AI floor assistant & audit</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0" />
                    <span>Zero Ghost Piece guarantee (100% matched)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0" />
                    <span>Cross-division automatic pipeline sync</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0" />
                    <span>Real-time line velocity & bottleneck alerts</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-9 pt-6 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setDemoForm(prev => ({ ...prev, plan: 'FULL_PLANT_AI' }))
                    setIsDemoModalOpen(true)
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold bg-[#3A3564] hover:bg-[#2A2649] text-white border border-black shadow-xs transition-all cursor-pointer"
                >
                  <span>Deploy Full Plant + AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TIER 3: CUSTOM ENGINEERING */}
            <div className="flex flex-col justify-between p-7 sm:p-9 rounded-2xl bg-white border border-black/80 hover:border-black shadow-2xs hover:shadow-md transition-all duration-200">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center mb-6 shadow-2xs">
                  <Building2 className="w-6 h-6 stroke-[2]" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  Custom Engineering
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Bespoke modules, custom machinery telemetry, and enterprise software scaling.
                </p>

                {/* Price Block */}
                <div className="my-7 pt-6 border-t border-black/10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold font-mono text-slate-900">
                      Custom
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      / tailored quote
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Dedicated roadmap & hardware link
                  </p>
                </div>

                {/* Uncluttered Punchy Features */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom division stages built to spec</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bi-directional SAP, Oracle & Tally sync</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Weighing scales, auto-cutters & RFID hooks</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-plant executive dashboard</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated solutions architect & 24/7 SLA</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-9 pt-6 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setDemoForm(prev => ({ ...prev, plan: 'CUSTOM' }))
                    setIsDemoModalOpen(true)
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold bg-[#FAF7F0] text-slate-900 hover:bg-[#3A3564] hover:text-white border border-black transition-all shadow-2xs cursor-pointer"
                >
                  <span>Request Custom Build</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
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
        <div className="relative max-w-5xl mx-auto bg-[#FAF7F0] border border-black md:hover:border-[#3A3564]/60 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm md:hover:shadow-md transition-all duration-300 overflow-hidden">
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
                Book a personalized live demonstration tailored to your plant capacity, 
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
                submitAlreadyExists ? (
                  <div className="p-6 sm:p-7 bg-[#FFFDF9] rounded-2xl border border-amber-300/90 text-left space-y-4 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                        <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900">Inquiry Already Registered</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                          {submitError || 'An active inquiry or account is already registered with this phone number or email address. Our engineering team is currently reviewing your factory parameters.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-white border border-amber-200/60 rounded-xl text-xs space-y-2 text-slate-700">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Organization</span>
                        <span className="font-semibold text-slate-900">{demoForm.companyName || 'Registered Factory'}</span>
                      </div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Registered Contact</span>
                        <span className="font-semibold text-slate-900">{demoForm.ownerName || 'Plant Head'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          In Queue / Review by Platform Operations
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      No further action is required from your side. Our enterprise deployment team will contact you directly to schedule your walkthrough and dispatch your credentials.
                    </p>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubmitted(false)
                          setSubmitAlreadyExists(false)
                          setSubmitError(null)
                        }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                      >
                        Modify Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 sm:p-7 bg-[#FAFAF8] rounded-2xl border border-slate-200 text-left space-y-4 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/80">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900">Demo Walkthrough Request Received</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                          Your factory walkthrough inquiry has been saved to our enterprise deployment queue.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-slate-200/80 rounded-xl text-xs space-y-2.5 text-slate-700">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Requested Plan</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#3A3564]/10 text-[#3A3564]">
                          {demoForm.plan === 'FULL_PLANT_AI' ? 'Full Plant + Zigza AI (12 Units)' : demoForm.plan === 'MODULAR' ? 'Modular Floor' : 'Custom Enterprise Build'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Organization / Plant</span>
                        <span className="font-semibold text-slate-900">{demoForm.companyName || 'Garment Factory'}</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Plant Location</span>
                        <span className="font-semibold text-slate-900">{demoForm.cityState || 'Surat, Gujarat'}</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Primary Contact</span>
                        <span className="font-semibold text-slate-900">{demoForm.ownerName || 'Plant Head'}</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Phone / WhatsApp</span>
                        <span className="font-mono font-semibold text-slate-800">{demoForm.phone.trim() ? `+91 ${demoForm.phone.trim()}` : '+91 98000 00000'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Delivery Email</span>
                        <span className="font-mono font-semibold text-slate-800">{demoForm.email}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-emerald-950">Next step: </span>
                      Our platform team will review your unit specifications and contact you to coordinate the live walkthrough. Following the walkthrough, factory credentials will be dispatched to <span className="font-semibold text-slate-900">{demoForm.email}</span>.
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubmitted(false)
                          setSubmitAlreadyExists(false)
                          setSubmitError(null)
                          setDemoForm({
                            plan: 'FULL_PLANT_AI',
                            companyName: '',
                            cityState: '',
                            ownerName: '',
                            phone: '',
                            email: '',
                            estimatedMachines: '',
                            customRequirements: ''
                          })
                        }}
                        className="px-5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  {/* Field 1: Type of Plan Desired */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Type of Plan Desired *
                    </label>
                    <select
                      value={demoForm.plan}
                      onChange={e => setDemoForm({ ...demoForm, plan: e.target.value as any })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all font-medium cursor-pointer"
                    >
                      <option value="FULL_PLANT_AI">Full Plant + Zigza AI (All 12 Units - ₹4,999/mo)</option>
                      <option value="MODULAR">Modular Floor (1-3 Units - ₹1,999/mo)</option>
                      <option value="CUSTOM">Custom Enterprise Build (Bespoke Requirements)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Company / Factory Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Enter company / factory name"
                        value={demoForm.companyName}
                        onChange={e => setDemoForm({ ...demoForm, companyName: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                      />
                      {demoForm.companyName.trim().length > 0 && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Plant Location / City */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Plant Location / City & State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter plant location / city & state"
                      value={demoForm.cityState}
                      onChange={e => setDemoForm({ ...demoForm, cityState: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Owner / Plant Head Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={demoForm.ownerName}
                        onChange={e => setDemoForm({ ...demoForm, ownerName: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                      />
                      {demoForm.ownerName.trim().length > 0 && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Phone Number *
                    </label>
                    <div className={`relative flex rounded-xl border transition-all overflow-hidden bg-white shadow-2xs ${
                      phoneDuplicate?.inUse 
                        ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-300' 
                        : 'border-slate-300 focus-within:ring-2 focus-within:ring-[#3A3564] focus-within:border-transparent'
                    }`}>
                      <div className="flex items-center justify-center px-3.5 bg-slate-50 border-r border-slate-200 text-slate-700 font-mono font-bold text-sm select-none shrink-0">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="Enter 10-digit mobile number"
                        value={demoForm.phone}
                        onChange={e => handlePhoneChange(e.target.value)}
                        maxLength={11}
                        className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent font-mono"
                      />
                      {phoneDuplicate?.inUse && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        </div>
                      )}
                    </div>
                    {phoneDuplicate?.inUse && (
                      <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 transition-all">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span>{phoneDuplicate.message}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                      Business Email ID *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="Enter business email ID"
                        value={demoForm.email}
                        onChange={e => handleEmailChange(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                          emailDuplicate?.inUse
                            ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-300'
                            : 'border-slate-300 focus:ring-2 focus:ring-[#3A3564] focus:border-transparent'
                        }`}
                      />
                      {emailDuplicate?.inUse && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        </div>
                      )}
                    </div>
                    {emailDuplicate?.inUse && (
                      <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 transition-all">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span>{emailDuplicate.message}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {demoForm.plan === 'CUSTOM' && (
                    <>
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                          Custom Engineering Requirements & Scope *
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Describe your custom engineering requirements and scope..."
                          value={demoForm.customRequirements}
                          onChange={e => setDemoForm({ ...demoForm, customRequirements: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                          Estimated Machines / Capacity (Optional)
                        </label>
                        <input
                          type="number"
                          placeholder="Enter estimated machines / capacity"
                          value={demoForm.estimatedMachines}
                          onChange={e => setDemoForm({ ...demoForm, estimatedMachines: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                        />
                      </div>
                    </>
                  )}

                  {submitError && !submitAlreadyExists && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingDemo || isCheckingDuplicate}
                    className="w-full py-3.5 bg-[#3A3564] hover:bg-[#2A2649] disabled:opacity-60 disabled:cursor-not-allowed md:hover:-translate-y-0.5 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 mt-5"
                  >
                    {isSubmittingDemo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Submitting Request...</span>
                      </>
                    ) : isCheckingDuplicate ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Verifying Contact Details...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 shrink-0" />
                        <span>Send Demo Request</span>
                      </>
                    )}
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
                  src="/z i g z a (2).png" 
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
                    href="#pricing" 
                    className="text-slate-600 hover:text-slate-900 transition-colors inline-block"
                  >
                    Subscription Plans
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
                src="/z i g z a (2).png" 
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
              submitAlreadyExists ? (
                <div className="p-6 bg-[#FFFDF9] rounded-2xl border border-amber-300/90 text-left space-y-4 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                      <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Inquiry Already Registered</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {submitError || 'An active inquiry or account is already registered with this phone number or email address. Our engineering team is currently reviewing your factory specifications.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white border border-amber-200/60 rounded-xl text-xs space-y-2 text-slate-700">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Organization</span>
                      <span className="font-semibold text-slate-900">{demoForm.companyName || 'Registered Factory'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Registered Contact</span>
                      <span className="font-semibold text-slate-900">{demoForm.ownerName || 'Plant Head'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Status</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        In Review by Platform Operations
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    No further action is required from your side. Our enterprise deployment team will contact you directly to schedule your walkthrough and dispatch your credentials.
                  </p>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false)
                        setSubmitAlreadyExists(false)
                        setSubmitError(null)
                        setIsDemoModalOpen(false)
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                    >
                      Done / Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#FAFAF8] rounded-2xl border border-slate-200 text-left space-y-4 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/80">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.4]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Demo Walkthrough Request Received</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Your factory walkthrough inquiry has been saved to our enterprise deployment queue.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200/80 rounded-xl text-xs space-y-2.5 text-slate-700">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Requested Plan</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#3A3564]/10 text-[#3A3564]">
                        {demoForm.plan === 'FULL_PLANT_AI' ? 'Full Plant + Zigza AI (12 Units)' : demoForm.plan === 'MODULAR' ? 'Modular Units' : 'Custom Enterprise Build'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Organization / Plant</span>
                      <span className="font-semibold text-slate-900">{demoForm.companyName || 'Garment Factory'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Plant Location</span>
                      <span className="font-semibold text-slate-900">{demoForm.cityState || 'Surat, Gujarat'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Primary Contact</span>
                      <span className="font-semibold text-slate-900">{demoForm.ownerName || 'Plant Head'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Phone / WhatsApp</span>
                      <span className="font-mono font-semibold text-slate-800">{demoForm.phone.trim() ? `+91 ${demoForm.phone.trim()}` : '+91 98000 00000'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Delivery Email</span>
                      <span className="font-mono font-semibold text-slate-800">{demoForm.email}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-emerald-950">Next step: </span>
                    Our platform team will review your unit specifications and contact you to coordinate the live walkthrough. Following the walkthrough, factory credentials will be dispatched to <span className="font-semibold text-slate-900">{demoForm.email}</span>.
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false)
                        setSubmitAlreadyExists(false)
                        setSubmitError(null)
                        setIsDemoModalOpen(false)
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                    >
                      Done / Close
                    </button>
                  </div>
                </div>
              )
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                {/* Field 1: Type of Plan Desired */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Type of Plan Desired *
                  </label>
                  <select
                    value={demoForm.plan}
                    onChange={e => setDemoForm({ ...demoForm, plan: e.target.value as any })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all font-medium cursor-pointer"
                  >
                    <option value="FULL_PLANT_AI">Full Plant + Zigza AI (All 12 Units - ₹4,999/mo)</option>
                    <option value="MODULAR">Modular Units (Selected Units - ₹1,999/mo)</option>
                    <option value="CUSTOM">Custom Enterprise Build (Bespoke Requirements)</option>
                  </select>
                </div>

                {/* Field 2: Company / Factory Name */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Company / Factory Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter company / factory name"
                    value={demoForm.companyName}
                    onChange={e => setDemoForm({ ...demoForm, companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                  />
                </div>

                {/* Field 3: Plant Location (City & State) */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Plant Location / City & State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter plant location / city & state"
                    value={demoForm.cityState}
                    onChange={e => setDemoForm({ ...demoForm, cityState: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                  />
                </div>

                {/* Field 4: Owner / Plant Head Name */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Owner / Plant Head Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={demoForm.ownerName}
                    onChange={e => setDemoForm({ ...demoForm, ownerName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                  />
                </div>

                {/* Field 5: Phone Number with Live Duplicate Feedback */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Phone Number *
                  </label>
                  <div className={`relative flex rounded-xl border transition-all overflow-hidden bg-white shadow-2xs ${
                    phoneDuplicate?.inUse 
                      ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-300' 
                      : 'border-slate-300 focus-within:ring-2 focus-within:ring-[#3A3564] focus-within:border-transparent'
                  }`}>
                    <div className="flex items-center justify-center px-3.5 bg-slate-50 border-r border-slate-200 text-slate-700 font-mono font-bold text-sm select-none shrink-0">
                      +91
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      value={demoForm.phone}
                      onChange={e => handlePhoneChange(e.target.value)}
                      maxLength={11}
                      className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent font-mono"
                    />
                    {phoneDuplicate?.inUse && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      </div>
                    )}
                  </div>
                  {phoneDuplicate?.inUse && (
                    <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 transition-all">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span>{phoneDuplicate.message}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Field 6: Business Email ID with Live Duplicate Feedback */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                    Business Email ID *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="Enter business email ID"
                      value={demoForm.email}
                      onChange={e => handleEmailChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                        emailDuplicate?.inUse
                          ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-300'
                          : 'border-slate-300 focus:ring-2 focus:ring-[#3A3564] focus:border-transparent'
                      }`}
                    />
                    {emailDuplicate?.inUse && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      </div>
                    )}
                  </div>
                  {emailDuplicate?.inUse && (
                    <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 transition-all">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span>{emailDuplicate.message}</span>
                      </div>
                    </div>
                  )}
                </div>

                {demoForm.plan === 'CUSTOM' && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Custom Engineering Requirements & Scope *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Enter custom engineering requirements & scope..."
                        value={demoForm.customRequirements}
                        onChange={e => setDemoForm({ ...demoForm, customRequirements: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                        Estimated Machines / Capacity (Optional)
                      </label>
                      <input
                        type="number"
                        placeholder="Enter estimated machines / capacity"
                        value={demoForm.estimatedMachines}
                        onChange={e => setDemoForm({ ...demoForm, estimatedMachines: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                {submitError && !submitAlreadyExists && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingDemo || isCheckingDuplicate}
                  className="w-full py-3.5 bg-[#3A3564] hover:bg-[#2A2649] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 mt-5"
                >
                  {isSubmittingDemo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Submitting Request...</span>
                    </>
                  ) : isCheckingDuplicate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Verifying Contact Details...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 shrink-0" />
                      <span>Send Demo Request</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
