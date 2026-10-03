'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Layers,
  KeyRound,
  Building2,
  Loader2,
  Check,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  registerFreeTrialAction, 
  checkEmailAvailabilityAction, 
  checkPhoneAvailabilityAction,
  sendTrialPhoneOtpAction,
  verifyTrialPhoneOtpAction
} from './actions'
import { PLATFORM_UPDATE_EVENT } from '../platform-admin/utils/platformStorage'

function IndiaFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
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

const STEP1_CACHE_KEY = 'zigza_trial_step1_draft_v1'

const ALL_12_MODULES = [
  { code: '01', name: 'Design & Tech-Pack', route: '/design' },
  { code: '02', name: 'Merchandising & Sourcing', route: '/merchandising' },
  { code: '03', name: 'Cutting & Lay Floor', route: '/cutting' },
  { code: '04', name: 'Screen & Digital Printing', route: '/printing' },
  { code: '05', name: 'Multi-Head Embroidery', route: '/embroidery' },
  { code: '06', name: 'Stitching & Sewing Floor', route: '/stitching-sewing' },
  { code: '07', name: 'Industrial Washing & Dyeing', route: '/washing' },
  { code: '08', name: 'Steam Pressing & Ironing', route: '/iron' },
  { code: '09', name: 'Quality Clinic & Packing', route: '/ready-goods' },
  { code: '10', name: 'Central Store Godown', route: '/store' },
  { code: '11', name: 'Dispatch & Logistics', route: '/dispatch' }
]

export default function RegisterFreeTrialPage() {
  const router = useRouter()
  
  // Multi-step State (1: Account Setup, 2: Choose Modules, 3: Activated)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  
  // Step 1 Fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Real-time Availability States for Email & Phone
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'error'>('idle')
  const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null)

  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'available' | 'error'>('idle')
  const [phoneErrorMsg, setPhoneErrorMsg] = useState<string | null>(null)
  
  // Phone OTP Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [isOtpBoxOpen, setIsOtpBoxOpen] = useState(false)
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend OTP Countdown Timer
  useEffect(() => {
    if (otpCountdown <= 0) return
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [otpCountdown])

  // Step 2 Fields: Pre-select all modules
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(
    ALL_12_MODULES.map(m => m.route)
  )

  // Status & Submission States
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdCompany, setCreatedCompany] = useState<string>('')
  const [trialExpiresAt, setTrialExpiresAt] = useState<string>('')
  const [userNavigatedBack, setUserNavigatedBack] = useState(false)

  // Derive Industry Name from First Name
  const cleanFirst = fullName.trim().split(/\s+/)[0] || 'Apparel'
  const computedFirstName = cleanFirst.charAt(0).toUpperCase() + cleanFirst.slice(1).toLowerCase()
  const derivedIndustryName = `${computedFirstName} Industries`

  // Format 10-digit mobile number input & trigger check immediately on 10th digit
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 10)
    setPhone(raw)
    setErrorMsg(null)

    // Reset phone verification if number is changed
    if (isPhoneVerified || isOtpBoxOpen) {
      setIsPhoneVerified(false)
      setIsOtpBoxOpen(false)
      setOtpValues(['', '', '', '', '', ''])
      setOtpError(null)
      setVerificationToken(null)
    }

    if (raw.length < 10) {
      setPhoneStatus('idle')
      setPhoneErrorMsg(null)
    } else if (raw.length === 10) {
      triggerPhoneCheck(raw)
    }
  }

  const triggerPhoneCheck = async (digits: string) => {
    setPhoneStatus('checking')
    setPhoneErrorMsg(null)
    try {
      const res = await checkPhoneAvailabilityAction(digits)
      if (res.available) {
        setPhoneStatus('available')
        setPhoneErrorMsg(null)
      } else {
        setPhoneStatus('error')
        setPhoneErrorMsg(res.error || 'Mobile number already registered. Please sign in.')
      }
    } catch (_) {
      setPhoneStatus('available')
    }
  }

  // Send OTP Trigger
  const handleSendOtp = async () => {
    if (phone.length !== 10 || phoneStatus !== 'available' || isSendingOtp) return

    setIsSendingOtp(true)
    setOtpError(null)
    try {
      const res = await sendTrialPhoneOtpAction(phone)
      if (res.success) {
        if (res.verificationToken) {
          setVerificationToken(res.verificationToken)
        }
        setIsOtpBoxOpen(true)
        setOtpValues(['', '', '', '', '', ''])
        setOtpCountdown(30)
        toast.success(`Verification code sent to +91 ${phone}`)
        setTimeout(() => {
          otpInputRefs.current[0]?.focus()
        }, 150)
      } else {
        setOtpError(res.error || 'Failed to send OTP. Please try again.')
        toast.error(res.error || 'Failed to send OTP')
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Failed to send OTP. Please try again.')
      toast.error('Failed to send OTP')
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Handle Individual OTP Digit Input
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const newValues = [...otpValues]
    newValues[index] = digit
    setOtpValues(newValues)
    setOtpError(null)

    // Auto-advance to next box if digit typed
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }

    // Auto-verify if all 6 digits completed
    if (digit && index === 5) {
      const full = newValues.join('')
      if (full.length === 6) {
        handleVerifyOtp(full)
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newValues = [...otpValues]
    for (let i = 0; i < 6; i++) {
      newValues[i] = pasted[i] || ''
    }
    setOtpValues(newValues)
    setOtpError(null)

    const focusIdx = Math.min(pasted.length, 5)
    otpInputRefs.current[focusIdx]?.focus()

    if (pasted.length === 6) {
      handleVerifyOtp(pasted)
    }
  }

  // Verify OTP Trigger
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otpValues.join('')
    if (fullCode.length !== 6) {
      setOtpError('Please enter the full 6-digit OTP.')
      return
    }

    setIsVerifyingOtp(true)
    setOtpError(null)
    try {
      const res = await verifyTrialPhoneOtpAction(phone, fullCode, verificationToken || undefined)
      if (res.success) {
        setIsPhoneVerified(true)
        setIsOtpBoxOpen(false)
        setOtpError(null)
        toast.success('Mobile number verified successfully!')
      } else {
        setOtpError(res.error || 'Invalid or expired OTP. Please try again.')
        toast.error(res.error || 'Invalid OTP code')
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Verification failed. Please try again.')
      toast.error('Verification failed')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // Check email availability on blur (when clicked outside or switching fields)
  const handleEmailBlur = async () => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setEmailStatus('idle')
      setEmailErrorMsg(null)
      return
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEmailStatus('error')
      setEmailErrorMsg('Enter a valid email address.')
      return
    }

    setEmailStatus('checking')
    setEmailErrorMsg(null)
    try {
      const res = await checkEmailAvailabilityAction(cleanEmail)
      if (res.available) {
        setEmailStatus('available')
        setEmailErrorMsg(null)
      } else {
        setEmailStatus('error')
        setEmailErrorMsg(res.error || 'Email already registered. Please sign in.')
      }
    } catch (_) {
      setEmailStatus('available')
    }
  }

  const handleEmailChange = (val: string) => {
    setEmail(val)
    setErrorMsg(null)
    if (emailStatus !== 'idle') {
      setEmailStatus('idle')
      setEmailErrorMsg(null)
    }
  }

  // Live Password Evaluation & 5-Word Recommendations
  const hasMinLength = password.length >= 6
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  let strengthScore = 0
  if (password.length > 0) {
    if (!hasMinLength) {
      strengthScore = 1
    } else {
      const extraMet = (hasUppercase ? 1 : 0) + (hasLowercase ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSymbol ? 1 : 0)
      if (extraMet <= 1) strengthScore = 1
      else if (extraMet === 2) strengthScore = 2
      else if (extraMet === 3) strengthScore = 3
      else strengthScore = 4
    }
  }

  let strengthLabel = ''
  let strengthTextColor = ''
  let strengthBarColor = ''

  if (strengthScore === 1) {
    strengthLabel = hasMinLength ? 'Weak' : 'Too Short'
    strengthTextColor = 'text-rose-600'
    strengthBarColor = 'bg-rose-500'
  } else if (strengthScore === 2) {
    strengthLabel = 'Fair'
    strengthTextColor = 'text-amber-600'
    strengthBarColor = 'bg-amber-500'
  } else if (strengthScore === 3) {
    strengthLabel = 'Good'
    strengthTextColor = 'text-blue-600'
    strengthBarColor = 'bg-blue-600'
  } else if (strengthScore === 4) {
    strengthLabel = 'Strong'
    strengthTextColor = 'text-emerald-600'
    strengthBarColor = 'bg-emerald-600'
  }

  // Exactly 5-word recommendations
  const get5WordRecommendation = () => {
    if (password.length === 0) return 'Use at least 6 characters'
    if (!hasMinLength) return 'Needs at least 6 characters'
    if (!hasUppercase && !hasNumber && !hasSymbol) return 'Add uppercase, numbers, and symbols'
    if (!hasUppercase && !hasNumber) return 'Add uppercase letters and numbers'
    if (!hasUppercase && !hasSymbol) return 'Add uppercase letters and symbols'
    if (!hasNumber && !hasSymbol) return 'Add numbers and special symbols'
    if (!hasUppercase) return 'Add uppercase letters to strengthen'
    if (!hasNumber) return 'Add numbers to improve strength'
    if (!hasSymbol) return 'Add symbols to improve strength'
    if (!hasLowercase) return 'Add lowercase letters to strengthen'
    return 'Great! Your password is secure'
  }

  const recommendationTip = get5WordRecommendation()

  // Live Password Matching
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  // Restore cached Step 1 draft from localStorage on initial mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STEP1_CACHE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return

      if (parsed.fullName) setFullName(parsed.fullName)
      if (parsed.email) setEmail(parsed.email)
      if (parsed.phone) setPhone(parsed.phone)
      if (parsed.password) setPassword(parsed.password)
      if (parsed.confirmPassword) setConfirmPassword(parsed.confirmPassword)
      if (parsed.userNavigatedBack) setUserNavigatedBack(true)

      // Always start fresh at Step 1 on page open/refresh so uncompleted sessions require phone re-verification
      setCurrentStep(1)
      setIsPhoneVerified(false)
      setIsOtpBoxOpen(false)
      setOtpValues(['', '', '', '', '', ''])

      if (parsed.phone && typeof parsed.phone === 'string' && parsed.phone.length === 10) {
        triggerPhoneCheck(parsed.phone)
      }
    } catch (_) {}
  }, [])

  // Auto-sync form field values to draft (step is never saved as 2 so tab close requires re-verification)
  useEffect(() => {
    if (fullName || email || phone || password || confirmPassword) {
      try {
        const draft = {
          fullName,
          email,
          phone,
          password,
          confirmPassword,
          step: 1, // Always 1 in draft: never allow bypassing OTP verification upon reopening
          userNavigatedBack,
          savedAt: Date.now()
        }
        localStorage.setItem(STEP1_CACHE_KEY, JSON.stringify(draft))
      } catch (_) {}
    }
  }, [fullName, email, phone, password, confirmPassword, userNavigatedBack])

  // Handle Step 1 Validation -> Proceed to Step 2
  const handleStep1Next = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full contact person name.')
      return
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid work email address.')
      return
    }

    if (phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    if (!isPhoneVerified) {
      setErrorMsg('Please verify your mobile number with OTP before continuing.')
      toast.error('Please verify your mobile number with OTP')
      if (!isOtpBoxOpen && phoneStatus === 'available') {
        handleSendOtp()
      }
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter to confirm.')
      return
    }

    if (emailStatus === 'error') {
      setErrorMsg(emailErrorMsg || 'Please use a different work email.')
      return
    }

    if (phoneStatus === 'error') {
      setErrorMsg(phoneErrorMsg || 'Please use a different mobile number.')
      return
    }

    if (emailStatus !== 'available') {
      setEmailStatus('checking')
      const emailRes = await checkEmailAvailabilityAction(cleanEmail)
      if (!emailRes.available) {
        setEmailStatus('error')
        setEmailErrorMsg(emailRes.error || 'Email already registered. Please sign in.')
        setErrorMsg(emailRes.error || 'Email already registered. Please sign in.')
        return
      }
      setEmailStatus('available')
    }

    if (phoneStatus !== 'available') {
      setPhoneStatus('checking')
      const phoneRes = await checkPhoneAvailabilityAction(phone)
      if (!phoneRes.available) {
        setPhoneStatus('error')
        setPhoneErrorMsg(phoneRes.error || 'Mobile number already registered. Please sign in.')
        setErrorMsg(phoneRes.error || 'Mobile number already registered. Please sign in.')
        return
      }
      setPhoneStatus('available')
    }

    setUserNavigatedBack(false)

    try {
      const draft = {
        fullName: fullName.trim(),
        email: cleanEmail,
        phone,
        password,
        confirmPassword,
        step: 2,
        userNavigatedBack: false,
        savedAt: Date.now()
      }
      localStorage.setItem(STEP1_CACHE_KEY, JSON.stringify(draft))
    } catch (_) {}

    setCurrentStep(2)
  }

  const handleBackToStep1 = () => {
    setErrorMsg(null)
    setUserNavigatedBack(true)
    setCurrentStep(1)
    try {
      const raw = localStorage.getItem(STEP1_CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        parsed.step = 1
        parsed.userNavigatedBack = true
        localStorage.setItem(STEP1_CACHE_KEY, JSON.stringify(parsed))
      }
    } catch (_) {}
  }

  const toggleDivision = (route: string) => {
    setSelectedDivisions(prev => 
      prev.includes(route) 
        ? prev.filter(r => r !== route) 
        : [...prev, route]
    )
  }

  const selectAllDivisions = () => {
    setSelectedDivisions(ALL_12_MODULES.map(m => m.route))
  }

  const clearAllDivisions = () => {
    setSelectedDivisions([])
  }

  // Handle Final Submission (Step 2 -> Step 3)
  const handleFinalSubmit = async () => {
    if (selectedDivisions.length === 0) {
      setErrorMsg('Please select at least 1 production module to test during your trial.')
      return
    }

    setIsPending(true)
    setErrorMsg(null)

    try {
      const res = await registerFreeTrialAction({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone,
        password,
        confirmPassword,
        selectedDivisions
      })

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed. Please try again.')
        setIsPending(false)
        return
      }

      setCreatedCompany(res.companyName || derivedIndustryName)
      setTrialExpiresAt(res.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      
      try {
        localStorage.removeItem(STEP1_CACHE_KEY)
      } catch (_) {}

      try {
        if (typeof window !== 'undefined') {
          const rawTenants = localStorage.getItem('zigza_platform_tenants_v1')
          const existingTenants = rawTenants ? JSON.parse(rawTenants) : []
          const newTenantObj = {
            id: res.tenantId || `ten-${Date.now().toString().slice(-4)}`,
            companyName: res.companyName || derivedIndustryName,
            plantSlug: (res.companyName || derivedIndustryName).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            adminEmail: email.trim().toLowerCase(),
            adminName: fullName.trim(),
            phone: `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`,
            cityState: 'Surat, Gujarat',
            subscriptionTier: 'FULL_PLANT_AI',
            accessType: 'DEMO_TRIAL',
            monthlyBillingInr: 0,
            activeDivisionsCount: selectedDivisions.length,
            status: 'ACTIVE',
            allowedDivisions: selectedDivisions,
            provisionedAt: new Date().toISOString(),
            expiresAt: res.expiresAt,
            lastActiveAt: new Date().toISOString()
          }
          localStorage.setItem('zigza_platform_tenants_v1', JSON.stringify([newTenantObj, ...existingTenants]))
          window.dispatchEvent(new CustomEvent(PLATFORM_UPDATE_EVENT))
        }
      } catch (_) {}

      toast.success('7-Day Free Trial Activated successfully!')
      setCurrentStep(3)
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden p-3 sm:p-5 lg:px-8 lg:py-3.5 font-sans selection:bg-[#0B1220] selection:text-[#14C8B4]">
      
      {/* Background Layer: Authentic Indian Factory Floor Line-Art Sketch (identical to /login) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-multiply bg-center bg-cover"
        style={{ backgroundImage: "url('/factory_bg_tinted_sketch.jpg')" }}
      />

      {/* Top Header / Navigation Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 sm:py-3 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2.5 sm:gap-3 group">
            <img 
              src="/new icon.png" 
              alt="" 
              className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
            />
            <img 
              src="/zigza new logo.png" 
              alt="Zigza" 
              className="h-6 sm:h-7.5 w-auto object-contain transition-opacity group-hover:opacity-85 shrink-0"
            />
          </Link>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full border border-[#14C8B4]/30 bg-[#F0FDFA] text-xs font-mono font-bold uppercase tracking-wider text-[#0B1220] shadow-2xs">
            7-DAY FREE TRIAL
          </span>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back<span className="hidden sm:inline"> to zigza.in</span></span>
        </Link>
      </header>

      {/* Centered Modal Card with Vertical Single-Card Layout */}
      <main className="z-10 w-full max-w-xl my-auto py-3 sm:py-6 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-4 sm:p-8 relative">
          
          {/* Multi-Step Stepper Header */}
          <div className="mb-4 sm:mb-6 pb-3 sm:pb-5 border-b border-slate-100">
            {/* Desktop / Tablet Stepper with Step Circles */}
            <div className="hidden sm:block">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B1220] mb-3">
                STEP {currentStep} OF 3
              </div>
              <div className="flex items-center justify-between relative px-2">
                {/* Stepper Connecting Line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                <div 
                  className="absolute top-4 left-6 h-0.5 bg-[#1D4ED8] transition-all duration-500 -z-0"
                  style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
                  }}
                />

                {/* Step 1 Pill */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                    currentStep >= 1 ? 'bg-[#1D4ED8] text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                  }`}>
                    1
                  </div>
                  <span className={`text-[11px] font-bold ${currentStep === 1 ? 'text-[#1D4ED8]' : 'text-slate-500'}`}>
                    Account Setup
                  </span>
                </div>

                {/* Step 2 Pill */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                    currentStep >= 2 ? 'bg-[#1D4ED8] text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                  }`}>
                    2
                  </div>
                  <span className={`text-[11px] font-bold ${currentStep === 2 ? 'text-[#1D4ED8]' : 'text-slate-500'}`}>
                    Choose Modules
                  </span>
                </div>

                {/* Step 3 Pill */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                    currentStep === 3 ? 'bg-[#1D4ED8] text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {currentStep === 3 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                  </div>
                  <span className={`text-[11px] font-bold ${currentStep === 3 ? 'text-[#1D4ED8]' : 'text-slate-500'}`}>
                    Trial Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile View Stepper: Compact 1-Line Progress Bar */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B1220]">
                  STEP {currentStep} OF 3
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {currentStep === 1 && 'Account Setup'}
                  {currentStep === 2 && 'Choose Modules'}
                  {currentStep === 3 && 'Trial Ready'}
                </span>
              </div>

              {/* Sleek Stepper Progress Bar */}
              <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#1D4ED8] rounded-full transition-all duration-500"
                  style={{ width: currentStep === 1 ? '33.33%' : currentStep === 2 ? '66.66%' : '100%' }}
                />
              </div>
            </div>
          </div>

          {/* STEP 1: ACCOUNT SETUP */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-3 sm:space-y-3.5 animate-in fade-in duration-300">
              <div className="mb-2 sm:mb-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0B1220] tracking-tight leading-tight">
                  Create <span className="text-[#1D4ED8]">Factory Account</span>
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-600 mt-0.5">
                  Enter your details to begin your 7-day free trial.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Contact Person Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                  Contact Person Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number & OTP Verification */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Mobile Number *
                  </label>
                  {isPhoneVerified ? (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Verified
                    </span>
                  ) : phoneStatus === 'checking' ? (
                    <span className="text-[10.5px] text-[#0B1220] font-medium flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-[#14C8B4]" /> Checking...
                    </span>
                  ) : phoneStatus === 'available' ? (
                    <span className="text-[10.5px] text-emerald-600 font-medium">Available</span>
                  ) : null}
                </div>

                <div className={`flex items-center rounded-xl border bg-slate-50/70 focus-within:bg-white transition-all shadow-2xs overflow-hidden ${
                  phoneStatus === 'error'
                    ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10'
                    : isPhoneVerified
                    ? 'border-emerald-400 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10'
                    : phoneStatus === 'available'
                    ? 'border-blue-300 focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/10'
                    : 'border-slate-200 focus-within:border-[#0B1220] focus-within:ring-2 focus-within:ring-[#0B1220]/10'
                }`}>
                  <div className="flex items-center gap-1.5 px-3 py-2.5 sm:py-3 bg-[#F0FDFA] border-r border-slate-200 text-[#0B1220] font-mono font-bold text-xs select-none shrink-0">
                    <IndiaFlag className="w-4 h-3 rounded-xs shrink-0" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                    disabled={isPhoneVerified}
                    className="w-full px-3 py-2.5 sm:py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent font-mono disabled:opacity-80"
                  />
                  
                  {/* Right Action: Send OTP Button or Verified Status */}
                  <div className="flex items-center pr-2 shrink-0">
                    {isPhoneVerified ? (
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold select-none">
                        <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {phoneStatus === 'checking' && (
                          <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin mr-1" />
                        )}
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={phone.length !== 10 || phoneStatus !== 'available' || isSendingOtp}
                          className={`text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 select-none shrink-0 ${
                            phone.length === 10 && phoneStatus === 'available' && !isSendingOtp
                              ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs cursor-pointer active:scale-95'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/70'
                          }`}
                        >
                          {isSendingOtp ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : isOtpBoxOpen ? (
                            <span>Resend OTP</span>
                          ) : (
                            <span>Send OTP</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Messages */}
                {phoneStatus === 'error' && phoneErrorMsg && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-200">
                    <X className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{phoneErrorMsg}</span>
                  </p>
                )}
                {isPhoneVerified && (
                  <div className="flex items-center justify-between mt-1 text-[11px] text-emerald-600 font-medium animate-in fade-in duration-200">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600 shrink-0" />
                      Phone authenticated with OTP
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhoneVerified(false)
                        setPhone('')
                        setPhoneStatus('idle')
                      }}
                      className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* 6-Digit OTP Box (Appears directly below when Send OTP is clicked) */}
                {isOtpBoxOpen && !isPhoneVerified && (
                  <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl border border-blue-200/90 bg-blue-50/50 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-[#1D4ED8]" />
                        <span className="text-xs font-bold text-slate-800">
                          Enter 6-Digit Verification Code
                        </span>
                      </div>
                      {otpCountdown > 0 ? (
                        <span className="text-[11px] font-mono text-slate-500 font-medium">
                          Resend in <strong className="text-slate-700">{otpCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="text-[11px] font-bold text-[#1D4ED8] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          {isSendingOtp ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <p className="text-[11.5px] text-slate-600">
                      We sent a 6-digit SMS code to <span className="font-semibold text-slate-900 font-mono">+91 {phone}</span>
                    </p>

                    {/* 6 Individual Digit Boxes */}
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                      {otpValues.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { otpInputRefs.current[idx] = el }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          className={`w-9 h-11 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-bold font-mono rounded-lg border bg-white text-slate-900 shadow-2xs focus:outline-none transition-all ${
                            digit
                              ? 'border-[#1D4ED8] ring-1 ring-[#1D4ED8]'
                              : 'border-slate-300 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20'
                          }`}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-[11.5px] text-rose-600 font-medium flex items-center justify-center gap-1 text-center animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{otpError}</span>
                      </p>
                    )}

                    {/* Verify OTP Button */}
                    <button
                      type="button"
                      onClick={() => handleVerifyOtp()}
                      disabled={otpValues.join('').length !== 6 || isVerifyingOtp}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none ${
                        otpValues.join('').length === 6 && !isVerifyingOtp
                          ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs cursor-pointer active:scale-98'
                          : 'bg-slate-200/90 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isVerifyingOtp ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Verify OTP</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Work Email Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Work Email *
                  </label>
                  {emailStatus === 'checking' ? (
                    <span className="text-[10.5px] text-[#0B1220] font-medium flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-[#14C8B4]" /> Checking...
                    </span>
                  ) : (
                    <span className="text-[10.5px] text-slate-400 font-medium hidden sm:inline">
                      Will be your Super Admin sign-in
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="Enter your work email"
                    className={`w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border bg-slate-50/70 focus:bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-2xs transition-all ${
                      emailStatus === 'error'
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : emailStatus === 'available'
                        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                        : 'border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10'
                    }`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                    {emailStatus === 'checking' && (
                      <Loader2 className="w-4 h-4 text-[#0B1220] animate-spin" />
                    )}
                    {emailStatus === 'available' && (
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    )}
                    {emailStatus === 'error' && (
                      <X className="w-4 h-4 text-rose-500 stroke-[3]" />
                    )}
                  </div>
                </div>
                {emailStatus === 'error' && emailErrorMsg && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-200">
                    <X className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{emailErrorMsg}</span>
                  </p>
                )}
              </div>

              {/* Set Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Set Password *
                  </label>
                  {password.length > 0 && (
                    <span className={`text-[10.5px] font-extrabold ${strengthTextColor}`}>
                      {strengthLabel}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 shadow-2xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Confirm Password *
                  </label>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[10.5px] font-bold ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {passwordsMatch ? '✓ Match' : '✗ No match'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 shadow-2xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Compact Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <div className="grid grid-cols-4 gap-1.5 h-1 w-full">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 1 ? strengthBarColor : 'bg-slate-200'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 2 ? strengthBarColor : 'bg-slate-200'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 3 ? strengthBarColor : 'bg-slate-200'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 4 ? strengthBarColor : 'bg-slate-200'}`} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{recommendationTip}</span>
                    <span className="font-mono text-[10px]">{password.length} chars (min 6)</span>
                  </div>
                </div>
              )}

              {/* Next Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-bold transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] group"
                >
                  <span>Next: Choose Modules</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="text-center pt-1.5">
                <span className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-[#1D4ED8] hover:underline cursor-pointer">
                    Sign in
                  </Link>
                </span>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* STEP 2: CHOOSE MODULES TO TRY OUT                              */}
          {/* ============================================================== */}
          {currentStep === 2 && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold text-[#0B1220] tracking-tight">
                  Choose Modules to <span className="text-[#1D4ED8]">Try Out</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  All {ALL_12_MODULES.length} enterprise units are pre-selected for your trial. Click any to toggle.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Unified Factory Workspace Strip & Active Counter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 bg-[#F0FDFA] border border-[#14C8B4]/30 rounded-xl text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-[#0B1220] shrink-0" />
                  <div className="flex items-baseline gap-1.5 min-w-0 truncate">
                    <span className="font-bold text-slate-900 truncate">
                      {derivedIndustryName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      (Auto-Assigned)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs shrink-0">
                  <span className="font-mono text-[11px] font-bold text-[#0B1220]">
                    {selectedDivisions.length} of {ALL_12_MODULES.length} Active
                  </span>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-2 font-semibold">
                    <button
                      type="button"
                      onClick={selectAllDivisions}
                      className="text-[#0B1220] hover:text-[#1D4ED8] hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={clearAllDivisions}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* 12 Modules: Clean 1-Line Chips in a 2-Column Grid (Zero Scrollbar) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_12_MODULES.map((mod) => {
                  const isSelected = selectedDivisions.includes(mod.route)
                  return (
                    <div
                      key={mod.code}
                      onClick={() => toggleDivision(mod.route)}
                      className={`px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 select-none ${
                        isSelected
                          ? 'border-[#0B1220] bg-[#F0FDFA] text-slate-900 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        isSelected ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                        {mod.code}
                      </span>
                      <span className="text-xs font-bold truncate">
                        {mod.name}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons: Back + Continue */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  disabled={isPending}
                  className="px-5 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isPending}
                  className="flex-1 py-3.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99] group"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Activating 7-Day Trial...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue & Start 7-Day Trial</span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: SUCCESS & TRIAL ACTIVATED                              */}
          {/* ============================================================== */}
          {currentStep === 3 && (
            <div className="text-center py-2 space-y-5 animate-in fade-in zoom-in-95 duration-400">
              <div className="w-16 h-16 rounded-3xl bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-[#14C8B4] stroke-[2.2]" />
              </div>

              <div>
                <p className="text-xs font-semibold text-emerald-600 mb-1">
                  7 Days Activated
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1220] tracking-tight">
                  Welcome, <span className="text-[#1D4ED8]">{createdCompany}</span>!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Your enterprise apparel MES account is now active with full access to your selected divisions.
                </p>
              </div>

              {/* Minimal Account Confirmation Slip (Only Necessary Info) */}
              <div className="p-3.5 bg-[#F0FDFA] border border-[#14C8B4]/30 rounded-xl text-left text-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Admin Email</span>
                  <span className="font-mono font-bold text-slate-900">{email}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Active Divisions</span>
                  <span className="font-bold text-[#0B1220]">{selectedDivisions.length} of {ALL_12_MODULES.length} Units Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Trial Validity</span>
                  <span className="font-bold text-emerald-700 font-mono">7 Days Remaining</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Link
                  href="/cutting"
                  className="w-full py-3.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-bold transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Launch Floor Workspace</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all flex items-center justify-center cursor-pointer"
                >
                  Sign in with Credentials
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Minimal Footer Signature Bar (matching login page exactly) */}
      <footer className="w-full max-w-5xl py-4 border-t border-slate-200/80 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 sm:text-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-proudly-india-black">
              Proudly Made in India
            </span>
            <IndiaFlag className="w-5 h-3.5 rounded-xs shrink-0" />
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 sm:text-slate-900 font-medium sm:font-semibold">
            <Link href="/privacy" className="hover:text-slate-900 hover:underline transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 hover:underline transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-slate-900 hover:underline transition-colors">Security</Link>
          </div>

          <p suppressHydrationWarning className="text-slate-500 sm:text-slate-900 font-medium sm:font-semibold">© {new Date().getFullYear()} Zigza. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
