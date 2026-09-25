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
  ChevronRight,
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

// Smooth Easing Animated Counter for Live Metrics
function AnimatedCounter({ 
  value, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  className = '',
  duration = 900
}: { 
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    let startVal = displayValue
    let endVal = value
    if (Math.abs(startVal - endVal) < 0.001) return

    let startTime: number | null = null
    let animId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic: smooth decelerating count-up
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = startVal + (endVal - startVal) * ease
      setDisplayValue(current)

      if (progress < 1) {
        animId = requestAnimationFrame(step)
      } else {
        setDisplayValue(endVal)
      }
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [value, duration])

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toLocaleString()

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}

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

  // Sequential 8-Step Factory Pipeline Animation (1.4s per box)
  const [activePipelineStep, setActivePipelineStep] = useState(0)
  useEffect(() => {
    const pipelineTimer = setInterval(() => {
      setActivePipelineStep(prev => (prev + 1) % 8)
    }, 1400)
    return () => clearInterval(pipelineTimer)
  }, [])


  // Interactive Hero Mockup: Active Department Tab & 10s Live Floor Simulation Cycle
  const [mockupTab, setMockupTab] = useState<'cutting' | 'sewing' | 'qc'>('cutting')
  const [mockupTick, setMockupTick] = useState(0)

  useEffect(() => {
    // 10-11 second total cycle: 3 event ticks spread evenly, then resets back to 0
    const tickTimer = setInterval(() => {
      setMockupTick(prev => (prev + 1) % 4)
    }, 2800)
    return () => clearInterval(tickTimer)
  }, [mockupTab])

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
          
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center cursor-pointer select-none shrink-0 py-1">
            <img 
              src="/z i g z a (8).png" 
              alt="Zigza" 
              className="h-[46px] sm:h-[58px] lg:h-[64px] w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02]"
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
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-md text-[15px] font-medium bg-[#3A3564] text-white hover:bg-[#2F2B52] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>Try For Free</span>
                  <ArrowRight className="w-4 h-4 text-white/70" />
                </Link>
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
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 rounded-md text-[15px] font-medium bg-[#3A3564] text-white hover:bg-[#2F2B52] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Try For Free</span>
                    <ArrowRight className="w-4 h-4 text-white/70" />
                  </Link>
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
          {/* Main Hero Headline: High-converting, relatable positioning */}
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-semibold tracking-tight text-[#14140F] leading-[1.08]">
            The Smarter Way to Run Your <span className="text-[#3A3564] underline decoration-[#C8802B] decoration-4 underline-offset-8">Garment Business</span>
          </h1>

          {/* Subtitle */}
          <div className="relative max-w-2xl mx-auto">
            {/* Subtitle: Clean, direct value proposition */}
            <p className="text-base sm:text-lg text-[#57564E] leading-relaxed font-normal">
              Replace messy paper slips and endless phone calls with one simple system. Get live order progress, cut fabric waste, and ship to buyers without last-minute panic.
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

          {/* Key Metric Feature Flags: Clear customer benefits */}
          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-[13px] font-normal text-[#57564E]">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#57564E]" />
              <span>Zero missing pieces across lines</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#57564E]" />
              <span>Works on any Android phone — no costly hardware</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#57564E]" />
              <span>Instant tailor wages with zero disputes</span>
            </div>
          </div>
        </div>

        {/* Live MES Interactive Visual Dashboard Mockup */}
        <div className="mt-8 sm:mt-12 max-w-5xl mx-auto">
          <div className="bg-white border border-[#3A3564]/15 rounded-2xl sm:rounded-3xl shadow-xl shadow-[#3A3564]/5 overflow-hidden transition-all duration-300">
            
            {/* macOS Dark Blue Window Header Bar */}
            <div className="bg-[#1B2A4A] px-4 sm:px-6 py-3 border-b border-slate-700/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* macOS Colored Window Control Dots */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 inline-block shadow-2xs" />
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 inline-block shadow-2xs" />
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 inline-block shadow-2xs" />
                </div>
                {/* Interactive Station Tabs (Linked to JOB-457 · OLLYPOP Kids 2-Pc) */}
                <div className="flex items-center gap-1 sm:gap-1.5 ml-1 sm:ml-3">
                  <button
                    type="button"
                    onClick={() => { setMockupTab('cutting'); setMockupTick(0) }}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      mockupTab === 'cutting'
                        ? 'bg-white/20 text-white shadow-2xs backdrop-blur-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Cutting & Inward
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMockupTab('sewing'); setMockupTick(0) }}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      mockupTab === 'sewing'
                        ? 'bg-white/20 text-white shadow-2xs backdrop-blur-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Sewing Lines
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMockupTab('qc'); setMockupTick(0) }}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      mockupTab === 'qc'
                        ? 'bg-white/20 text-white shadow-2xs backdrop-blur-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    QC & Packing
                  </button>
                </div>
              </div>

              {/* Real-Time Sync Indicator & 10s Loop Timer */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline font-medium">Live Floor Sync</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {mockupTick === 0 ? '· Synced' : `· +${mockupTick} Events`}
                </span>
              </div>
            </div>

            {/* Mockup Body Content */}
            <div className="p-4 sm:p-6 bg-[#FAFAF8] space-y-4 sm:space-y-5">
              {(() => {
                interface MetricItem {
                  label: string
                  value: string | number
                  sub: string
                  color: string
                  isNumeric: boolean
                  prefix?: string
                  suffix?: string
                  decimals?: number
                }

                const departmentMetrics: Record<'cutting' | 'sewing' | 'qc', MetricItem[]> = {
                  cutting: [
                    {
                      label: 'Active Cutting Lot',
                      value: 'LOT-2024-C8',
                      sub: 'Polo T-Shirt · 220 GSM Pique',
                      color: 'text-slate-900',
                      isNumeric: false
                    },
                    {
                      label: 'Total Pieces Cut',
                      value: 4850 + (mockupTick > 0 ? mockupTick * 30 : 0),
                      sub: '98.8% Fabric Utilization',
                      suffix: ' Pcs',
                      color: 'text-[#3A3564]',
                      isNumeric: true
                    },
                    {
                      label: 'Fabric Rolls Laid',
                      value: 24 + (mockupTick >= 2 ? 1 : 0),
                      sub: 'ASTM 4-Pt: Zero Defects',
                      suffix: ' Rolls',
                      color: 'text-[#D97706]',
                      isNumeric: true
                    },
                    {
                      label: 'Panel QC Pass',
                      value: 99.4 + (mockupTick >= 2 ? 0.2 : 0),
                      sub: '4,820 Panels Inspected',
                      decimals: 1,
                      suffix: '%',
                      color: 'text-emerald-600',
                      isNumeric: true
                    }
                  ],
                  sewing: [
                    {
                      label: 'Active Sewing Lines',
                      value: 'Line 01 & Line 02',
                      sub: '32 Stations Active',
                      color: 'text-slate-900',
                      isNumeric: false
                    },
                    {
                      label: 'Pieces Stitched Today',
                      value: 3420 + (mockupTick > 0 ? mockupTick * 35 : 0),
                      sub: 'Target: 3,800 Pcs · 90%',
                      suffix: ' Pcs',
                      color: 'text-[#3A3564]',
                      isNumeric: true
                    },
                    {
                      label: 'Line Pace & Speed',
                      value: 385 + (mockupTick > 0 ? mockupTick * 4 : 0),
                      sub: 'Overlock & Flatlock',
                      suffix: ' Pcs/Hr',
                      color: 'text-[#D97706]',
                      isNumeric: true
                    },
                    {
                      label: 'Piece Wages Earned',
                      value: 18450 + (mockupTick > 0 ? mockupTick * 180 : 0),
                      sub: 'Instant Tailor Ledger',
                      prefix: '₹',
                      color: 'text-emerald-600',
                      isNumeric: true
                    }
                  ],
                  qc: [
                    {
                      label: 'Inspection Audited',
                      value: 4210 + (mockupTick > 0 ? mockupTick * 30 : 0),
                      sub: 'Inline & End-Line Audit',
                      suffix: ' Pcs',
                      color: 'text-slate-900',
                      isNumeric: true
                    },
                    {
                      label: 'AQL 2.5 Pass Rate',
                      value: 99.2 + (mockupTick >= 2 ? 0.1 : 0),
                      sub: 'Zero Critical Defects',
                      decimals: 1,
                      suffix: '%',
                      color: 'text-emerald-600',
                      isNumeric: true
                    },
                    {
                      label: 'Master Cartons Packed',
                      value: 142 + (mockupTick >= 1 ? mockupTick : 0),
                      sub: 'Gross Weight Verified',
                      suffix: ' Cartons',
                      color: 'text-[#D97706]',
                      isNumeric: true
                    },
                    {
                      label: 'Ready for Dispatch',
                      value: 4260 + (mockupTick > 0 ? mockupTick * 36 : 0),
                      sub: 'Gate Pass Cleared',
                      suffix: ' Pcs',
                      color: 'text-[#3A3564]',
                      isNumeric: true
                    }
                  ]
                }

                const departmentBanners = {
                  cutting: {
                    icon: <FileSpreadsheet className="w-4 h-4 text-[#3A3564] shrink-0" />,
                    title: 'Fabric Lay Sheet & Marker Breakdown',
                    badge: 'Marker Ratio 1:2:2:1 (S-XL)',
                    col1: 'Lay Sheet',
                    col2: 'Fabric Lot & Color',
                    col3: 'Marker Ratio',
                    col4: 'Plies',
                    col5: 'Cut Pcs',
                    col6: 'Panel QC'
                  },
                  sewing: {
                    icon: <Scissors className="w-4 h-4 text-[#3A3564] shrink-0" />,
                    title: 'Tailor Piece-Rate Ledger & Operation Sync',
                    badge: '32 Stations Real-Time Ledger',
                    col1: 'Sewing Line',
                    col2: 'Tailor / Operator',
                    col3: 'Garment Operation',
                    col4: 'Bundle Lot',
                    col5: 'Done',
                    col6: 'Piece Wage'
                  },
                  qc: {
                    icon: <PackageCheck className="w-4 h-4 text-[#3A3564] shrink-0" />,
                    title: 'End-Line QC & Master Carton Packing Stream',
                    badge: 'AQL 2.5 & Weight-Check Verified',
                    col1: 'Carton #',
                    col2: 'Style & Color',
                    col3: 'Pack Size Breakdown',
                    col4: 'Pcs / Ctn',
                    col5: 'Gross Weight',
                    col6: 'AQL Audit'
                  }
                }

                const departmentRows = {
                  cutting: [
                    {
                      id: 'cut-row-1',
                      c1: mockupTick === 1 ? 'LAY-104-05' : 'LAY-104-04',
                      c2: mockupTick === 1 ? 'Heather Grey · Lot 5A' : 'Navy Blue · Lot 4A',
                      c2Color: 'text-slate-800',
                      c3: '1 : 2 : 2 : 1 (S-XL)',
                      c4: mockupTick === 1 ? '50 Plies' : '60 Plies',
                      c5: mockupTick === 1 ? '+300 Pcs' : '360 Pcs',
                      badge: mockupTick === 1 ? 'Lay Cut Verified' : 'Bundled & Cleared',
                      badgeCls: mockupTick === 1 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: mockupTick === 1
                    },
                    {
                      id: 'cut-row-2',
                      c1: 'LAY-104-03',
                      c2: 'Olive Green · Lot 2B',
                      c2Color: 'text-emerald-700',
                      c3: '1 : 2 : 2 : 1 (S-XL)',
                      c4: '60 Plies',
                      c5: mockupTick === 2 ? '+360 Pcs' : '360 Pcs',
                      badge: mockupTick === 2 ? 'Panel QC Cleared' : 'Bundled & Cleared',
                      badgeCls: mockupTick === 2 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: mockupTick === 2
                    },
                    {
                      id: 'cut-row-3',
                      c1: 'LAY-104-02',
                      c2: 'Mustard · Lot 1C',
                      c2Color: 'text-amber-700',
                      c3: '2 : 2 : 1 : 1 (S-XL)',
                      c4: '55 Plies',
                      c5: mockupTick === 3 ? '+330 Pcs' : '330 Pcs',
                      badge: mockupTick === 3 ? 'Plies Verified' : 'Bundled & Cleared',
                      badgeCls: mockupTick === 3 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: mockupTick === 3
                    },
                    {
                      id: 'cut-row-4',
                      c1: 'LAY-104-01',
                      c2: 'Charcoal · Lot 3D',
                      c2Color: 'text-slate-800',
                      c3: '1 : 2 : 2 : 1 (S-XL)',
                      c4: '60 Plies',
                      c5: '360 Pcs',
                      badge: 'Bundled & Cleared',
                      badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: false
                    }
                  ],
                  sewing: [
                    {
                      id: 'sew-row-1',
                      c1: 'Line 01',
                      c2: 'Aslam Khan (Tailor #12)',
                      c2Color: 'text-slate-900',
                      c3: 'Collar Rib & Neckband',
                      c4: 'BDL-104-09',
                      c5: mockupTick === 1 ? '+30 Pcs' : '30 Pcs',
                      badge: mockupTick === 1 ? '+₹165 Synced' : '₹165 Synced',
                      badgeCls: mockupTick === 1 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: mockupTick === 1
                    },
                    {
                      id: 'sew-row-2',
                      c1: 'Line 01',
                      c2: 'Ramesh Dev (Tailor #08)',
                      c2Color: 'text-slate-900',
                      c3: 'Shoulder Join & Topstitch',
                      c4: 'BDL-104-08',
                      c5: mockupTick === 2 ? '+30 Pcs' : '30 Pcs',
                      badge: mockupTick === 2 ? '+₹120 Synced' : '₹120 Synced',
                      badgeCls: mockupTick === 2 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: mockupTick === 2
                    },
                    {
                      id: 'sew-row-3',
                      c1: 'Line 02',
                      c2: 'Sunita Roy (Tailor #15)',
                      c2Color: 'text-slate-900',
                      c3: 'Sleeve Hemming & Attach',
                      c4: 'BDL-104-07',
                      c5: mockupTick === 3 ? '+30 Pcs' : '30 Pcs',
                      badge: mockupTick === 3 ? '+₹150 Synced' : '₹150 Synced',
                      badgeCls: mockupTick === 3 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: mockupTick === 3
                    },
                    {
                      id: 'sew-row-4',
                      c1: 'Line 02',
                      c2: 'Md. Parvez (Tailor #04)',
                      c2Color: 'text-slate-900',
                      c3: 'Side Seam & Bottom Hem',
                      c4: 'BDL-104-06',
                      c5: '30 Pcs',
                      badge: '₹180 Synced',
                      badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: false
                    }
                  ],
                  qc: [
                    {
                      id: 'qc-row-1',
                      c1: mockupTick === 1 ? 'CTN-0143' : 'CTN-0142',
                      c2: mockupTick === 1 ? 'Style 408 · Heather Grey' : 'Style 408 · Navy Blue',
                      c2Color: mockupTick === 1 ? 'text-slate-700' : 'text-blue-700',
                      c3: 'S:6 · M:12 · L:12 · XL:6',
                      c4: mockupTick === 1 ? '+36 Pcs' : '36 Pcs',
                      c5: mockupTick === 1 ? '11.42 kg' : '11.40 kg',
                      badge: mockupTick === 1 ? 'Weight Verified' : 'Carton Sealed',
                      badgeCls: mockupTick === 1 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: mockupTick === 1
                    },
                    {
                      id: 'qc-row-2',
                      c1: 'CTN-0141',
                      c2: 'Style 408 · Olive Green',
                      c2Color: 'text-emerald-700',
                      c3: 'S:6 · M:12 · L:12 · XL:6',
                      c4: '36 Pcs',
                      c5: '11.40 kg',
                      badge: mockupTick === 2 ? 'AQL 2.5 Pass' : 'Carton Sealed',
                      badgeCls: mockupTick === 2 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: mockupTick === 2
                    },
                    {
                      id: 'qc-row-3',
                      c1: 'CTN-0140',
                      c2: 'Style 408 · Mustard',
                      c2Color: 'text-amber-700',
                      c3: 'S:6 · M:12 · L:12 · XL:6',
                      c4: '36 Pcs',
                      c5: '11.45 kg',
                      badge: mockupTick === 3 ? 'Weight Checked' : 'AQL Passed',
                      badgeCls: mockupTick === 3 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                      isActive: mockupTick === 3
                    },
                    {
                      id: 'qc-row-4',
                      c1: 'CTN-0139',
                      c2: 'Style 408 · Charcoal',
                      c2Color: 'text-slate-800',
                      c3: 'S:6 · M:12 · L:12 · XL:6',
                      c4: '36 Pcs',
                      c5: '11.38 kg',
                      badge: 'Dispatch Bay',
                      badgeCls: 'bg-amber-50 text-amber-800 border-amber-200/60',
                      isActive: false
                    }
                  ]
                }

                const currentBanner = departmentBanners[mockupTab]
                const currentRows = departmentRows[mockupTab]

                return (
                  <>
                    {/* 4 Executive Metric Cards (Unified DOM structure to prevent reflow / blinking) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {departmentMetrics[mockupTab].map((metric, idx) => (
                        <div
                          key={`metric-${idx}`}
                          className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs hover:border-[#3A3564]/30 transition-all duration-300"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                            {metric.label}
                          </span>
                          <div className={`text-base sm:text-xl font-black mt-1 font-mono truncate ${metric.color}`}>
                            {metric.isNumeric ? (
                              <AnimatedCounter
                                value={metric.value as number}
                                prefix={metric.prefix}
                                suffix={metric.suffix}
                                decimals={metric.decimals}
                                duration={800}
                              />
                            ) : (
                              <span>{metric.value}</span>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 block truncate mt-0.5">
                            {metric.sub}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Dynamic Live Table (Fixed column widths prevent any horizontal layout shifts; stable keys prevent DOM thrashing) */}
                    <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs">
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {currentBanner.icon}
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {currentBanner.title}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 bg-[#FAF7F0] border border-[#3A3564]/10 px-2.5 py-0.5 rounded-full shrink-0">
                          {currentBanner.badge}
                        </span>
                      </div>

                      <div className="overflow-x-auto -mx-1">
                        <table className="w-full table-fixed text-xs text-left min-w-[620px]">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                              <th className="py-2.5 px-3 w-[18%] transition-colors duration-300">{currentBanner.col1}</th>
                              <th className="py-2.5 px-3 w-[24%] transition-colors duration-300">{currentBanner.col2}</th>
                              <th className="py-2.5 px-3 w-[22%] transition-colors duration-300">{currentBanner.col3}</th>
                              <th className="py-2.5 px-3 w-[11%] text-right transition-colors duration-300">{currentBanner.col4}</th>
                              <th className="py-2.5 px-3 w-[12%] text-right transition-colors duration-300">{currentBanner.col5}</th>
                              <th className="py-2.5 px-3 w-[13%] text-center transition-colors duration-300">{currentBanner.col6}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {currentRows.map((r) => (
                              <tr 
                                key={r.id} 
                                className={`transition-all duration-700 ease-out ${
                                  r.isActive 
                                    ? 'bg-emerald-50/70 border-l-2 border-emerald-500' 
                                    : 'hover:bg-[#FAF7F0]/40'
                                }`}
                              >
                                <td className="py-2.5 px-3 font-bold font-mono text-[#3A3564] truncate">
                                  <span className="flex items-center gap-1.5">
                                    {r.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block shrink-0" />}
                                    {r.c1}
                                  </span>
                                </td>
                                <td className={`py-2.5 px-3 font-semibold truncate ${r.c2Color}`}>{r.c2}</td>
                                <td className="py-2.5 px-3 font-mono text-slate-600 truncate">{r.c3}</td>
                                <td className="py-2.5 px-3 text-right font-mono font-semibold truncate">{r.c4}</td>
                                <td className={`py-2.5 px-3 text-right font-bold font-mono truncate ${r.isActive ? 'text-emerald-700' : 'text-slate-900'}`}>{r.c5}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] border transition-colors duration-500 inline-block truncate ${r.badgeCls}`}>
                                    {r.badge}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )
              })()}

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
              Compare traditional manual paper registers with Zigza's modern factory system.
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
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Traditional Paper Friction</h3>
              </div>

              {/* 4 Pain Points - Proper Spacing for Readability */}
              <div className="space-y-6">
                <div className="flex items-start gap-3.5">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Lost Paper Slips & Fabric Shortages</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Misplaced challans cause unrecorded fabric leaks, billing confusion, and supplier arguments.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Daily Tailor Wage Disputes</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Hours wasted arguing over lost paper coupons, unstitched bundles, and disputed piece counts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Defects Caught Late at Packing</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Stitching faults discovered right before dispatch, forcing emergency rework and delivery delays.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Zero Live Production Visibility</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Owners find out about floor bottlenecks and delayed orders only after shifts end.
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
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">The Zigza Digital System</h3>
              </div>

              {/* 4 Solutions - Proper Spacing for Readability */}
              <div className="space-y-6">
                <div className="flex items-start gap-3.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Digital Inward & Instant Roll Logs</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Snap supplier challans on phone to record fabric rolls instantly with zero paper loss.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Dispute-Free Piece-Rate Payouts</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Bundles credited automatically per tailor with full transparency and zero manual tallying.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Live Checkpoint Quality Control</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Catch and flag defects directly on the line so tailors fix them immediately.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-slate-900">Live Order Progress on Your Phone</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Track exact hourly production, line pace, and shipment readiness from anywhere, anytime.
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
            Everything You Need to Run Your Garment Factory
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Simple, powerful tools for every team on your floor — from fabric inward to final buyer dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {[
            {
              title: 'Fabric Inward & Trims Store',
              icon: Truck,
              features: [
                'Photo capture of supplier challans right at the gate',
                'Digital roll inwarding with lot and shade records',
                'Accurate stock counts for buttons, zippers, and threads',
              ],
            },
            {
              title: 'Buyer Orders & Tech Packs',
              icon: FileSpreadsheet,
              features: [
                'Store digital patterns, measurement specs, and tech packs',
                'Import buyer purchase orders and size tables in 1 click',
                'Automatic fabric consumption and target margin costing',
              ],
            },
            {
              title: 'Cutting Room & Lay Matrix',
              icon: Scissors,
              features: [
                '1-Click lay ratios based on actual fabric roll length',
                'Automatic bundle creation with printable cut-piece tags',
                'Prevent cutting errors and reduce fabric waste to a minimum',
              ],
            },
            {
              title: 'Stitching Lines & Wages',
              icon: Users,
              features: [
                'Smooth line loading with daily targets by color and size',
                'Quick mobile piece logging on standard Android smartphones',
                'Dispute-free piece-rate wages calculated automatically',
              ],
            },
            {
              title: 'Quality Checks & Alteration',
              icon: ClipboardCheck,
              features: [
                'Quick defect tagging directly at table and end-of-line checks',
                'Instant routing of rejected pieces back to the original tailor',
                'Identify line defects early to fix issues before packing',
              ],
            },
            {
              title: 'Carton Packing & Dispatch',
              icon: PackageCheck,
              features: [
                'Auto-generated carton packing lists with piece-count audits',
                'Zero-error buyer delivery challans and transport invoices',
                'Verified gate pass and truck exit confirmation on your phone',
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
      {/* =================================================================== */}
      {/* 5. 10-STEP FACTORY FLOW PIPELINE (END-TO-END APPAREL WORKFLOW)     */}
      {/* =================================================================== */}
      <section id="workflow" className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              The 8-Step Synchronized Factory Pipeline
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
              From CAD tech pack to buyer delivery truck — every garment milestone is verified in real time.
            </p>
          </div>

          {/* 8 Connected Process Boxes with Continuous Connecting Flow Lines */}
          <div className="flex flex-col">
            
            {/* ROW 1: Stages 01 to 04 (Pre-Production & Cutting) */}
            <div className="relative mb-6 lg:mb-0">
              {/* Continuous Horizontal Connecting Line (Running across gaps between cards at badge height) */}
              <div className="hidden lg:block absolute top-[44px] left-[6%] right-[6%] h-[2px] bg-slate-900/60 z-0 pointer-events-none" />

              {/* 4 Cards in Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch relative z-10">
                {[
                  {
                    step: '01',
                    title: 'Design & Sampling',
                    desc: 'CAD tech packs, digital pattern specs, and instant sample revisions.'
                  },
                  {
                    step: '02',
                    title: 'Merchandising & PO',
                    desc: 'Buyer purchase orders, fabric consumption, and target margin costing.'
                  },
                  {
                    step: '03',
                    title: 'Central Fabric Store',
                    desc: 'Digital roll inwarding, trim inventory, and lot-wise issue slips.'
                  },
                  {
                    step: '04',
                    title: 'Cutting & Lay Matrix',
                    desc: '1-Click Excel lay ratios and automated bundle tag generation.'
                  }
                ].map((stage, idx) => {
                  const isActive = activePipelineStep === idx;
                  return (
                    <div
                      key={stage.step}
                      onClick={() => setActivePipelineStep(idx)}
                      className={`cursor-pointer bg-white rounded-2xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between min-h-[175px] sm:min-h-[185px] ${
                        isActive
                          ? 'border-2 border-solid border-[#3A3564] shadow-md ring-1 ring-[#3A3564]/30 -translate-y-1 bg-[#FAF7F0]/40'
                          : 'border-2 border-dashed border-black/60 hover:border-black hover:shadow-2xs'
                      }`}
                    >
                      <div>
                        {/* Number Badge + Step Title */}
                        <div className="flex items-center gap-3 mb-3.5 sm:mb-4">
                          <span
                            key={isActive ? `active-${idx}` : `idle-${idx}`}
                            className={`w-8 h-8 rounded-full font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                              isActive 
                                ? 'bg-[#3A3564] text-white shadow-2xs animate-spin-once' 
                                : 'bg-[#FAF7F0] text-[#3A3564] border border-[#3A3564]/20'
                            }`}
                          >
                            {stage.step}
                          </span>
                          <h3 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight leading-snug">
                            {stage.title}
                          </h3>
                        </div>

                        {/* Spacious & Readable Micro-Copy */}
                        <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed font-normal">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Elegant Vector Connecting Line from Stage 04 (Row 1) to Stage 05 (Row 2) */}
            <div className="hidden lg:block relative w-full h-9 pointer-events-none z-0">
              <svg 
                className="w-full h-full overflow-visible" 
                viewBox="0 0 1000 36" 
                preserveAspectRatio="none"
              >
                <path
                  d="M 882 0 C 882 14, 860 18, 830 18 L 170 18 C 140 18, 118 22, 118 36"
                  fill="none"
                  stroke="rgba(15, 23, 42, 0.6)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            {/* ROW 2: Stages 05 to 08 (Floor Production & Logistics) */}
            <div className="relative">
              {/* Continuous Horizontal Connecting Line (Running across gaps between cards at badge height) */}
              <div className="hidden lg:block absolute top-[44px] left-[6%] right-[6%] h-[2px] bg-slate-900/60 z-0 pointer-events-none" />

              {/* 4 Cards in Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch relative z-10">
                {[
                  {
                    step: '05',
                    title: 'Printing & Embroidery',
                    desc: 'Job-work challans, machine allocation, and gate pass dispatch.'
                  },
                  {
                    step: '06',
                    title: 'Stitching Lines',
                    desc: 'Smooth line loading, mobile bundle logging, and piece-rate wages.'
                  },
                  {
                    step: '07',
                    title: 'Washing & Finishing',
                    desc: 'Wash formulas, shrinkage control, steam ironing, and hangtags.'
                  },
                  {
                    step: '08',
                    title: 'Packing & Dispatch',
                    desc: 'Carton piece-count audits, buyer packing lists, and verified truck exit.'
                  }
                ].map((stage, idx) => {
                  const globalIdx = idx + 4;
                  const isActive = activePipelineStep === globalIdx;
                  return (
                    <div
                      key={stage.step}
                      onClick={() => setActivePipelineStep(globalIdx)}
                      className={`cursor-pointer bg-white rounded-2xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between min-h-[175px] sm:min-h-[185px] ${
                        isActive
                          ? 'border-2 border-solid border-[#3A3564] shadow-md ring-1 ring-[#3A3564]/30 -translate-y-1 bg-[#FAF7F0]/40'
                          : 'border-2 border-dashed border-black/60 hover:border-black hover:shadow-2xs'
                      }`}
                    >
                      <div>
                        {/* Number Badge + Step Title */}
                        <div className="flex items-center gap-3 mb-3.5 sm:mb-4">
                          <span
                            key={isActive ? `active-${globalIdx}` : `idle-${globalIdx}`}
                            className={`w-8 h-8 rounded-full font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                              isActive 
                                ? 'bg-[#3A3564] text-white shadow-2xs animate-spin-once' 
                                : 'bg-[#FAF7F0] text-[#3A3564] border border-[#3A3564]/20'
                            }`}
                          >
                            {stage.step}
                          </span>
                          <h3 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight leading-snug">
                            {stage.title}
                          </h3>
                        </div>

                        {/* Spacious & Readable Micro-Copy */}
                        <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed font-normal">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* =================================================================== */}
      {/* 6. TRUSTED ACROSS APPAREL MANUFACTURING HUBS (NATIONWIDE MAP)       */}
      {/* =================================================================== */}
      <section id="roles" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Trusted Across India&apos;s Garment Hubs
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-normal">
            From local stitching lines to multi-tier export factories — Zigza simplifies daily production, piece-rate wages, and floor operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: 4 Core Trust Pillars with Dotted Borders */}
          <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
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
              },
              {
                id: 3,
                icon: CheckCircle2,
                title: 'Zero Ghost Pieces',
                desc: 'Every piece accounted for from cutting table to buyer carton with zero discrepancy.'
              }
            ].map((pillar) => (
              <div
                key={pillar.id}
                className="bg-white rounded-2xl border-2 border-dotted border-black/60 p-4 sm:p-5 flex items-start gap-4 transition-all duration-200 hover:border-black hover:shadow-xs"
              >
                {/* Outline Icon Badge */}
                <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] border border-black/15 text-[#3A3564] flex items-center justify-center shrink-0 mt-0.5">
                  <pillar.icon className="w-5 h-5" strokeWidth={1.8} />
                </div>

                <div className="flex-1">
                  <h3 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-sm sm:text-[14px] text-slate-600 mt-1 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Clean, Much Larger India Map with NO Green Handwriting */}
          <div className="lg:col-span-7 flex items-center justify-center">
            <div className="w-full max-w-[680px] lg:max-w-[720px] flex items-center justify-center p-2 sm:p-4">
              <img
                src="/india_outline_map.png"
                alt="India Garment Manufacturing Network"
                className="w-full h-auto max-h-[580px] object-contain mix-blend-multiply select-none pointer-events-none drop-shadow-xs"
                loading="lazy"
              />
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

            <div className="mb-6">
              <img 
                src="/z i g z a (8).png" 
                alt="Zigza" 
                className="h-9 sm:h-10 w-auto object-contain mb-3"
              />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Request a Live Demo
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Schedule a personalized walkthrough of the apparel MES platform.
              </p>
            </div>

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
