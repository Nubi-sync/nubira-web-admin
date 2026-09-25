'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  KeyRound,
  Building2,
  Loader2,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { registerFreeTrialAction } from './actions'
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

const ALL_12_MODULES = [
  { code: '01', name: 'Design & Tech-Pack Studio', route: '/design', desc: 'CAD measurements, bill of materials, and tech pack approvals' },
  { code: '02', name: 'Merchandising & Sourcing', route: '/merchandising', desc: 'Purchase orders, consumption formulas, and costings' },
  { code: '03', name: 'Cutting & Lay Floor', route: '/cutting', desc: 'Marker ratios, fabric lay sheets, and bundle tracking' },
  { code: '04', name: 'Screen & Digital Printing', route: '/printing', desc: 'Strike-off signoffs, color approvals, and printing lots' },
  { code: '05', name: 'Multi-Head Embroidery', route: '/embroidery', desc: 'DST stitch runs, thread wastage, and head allocations' },
  { code: '06', name: 'Stitching & Sewing Floor', route: '/stitching-sewing', desc: 'Lineman tickets, bundle handovers, and tailor piece wages' },
  { code: '07', name: 'Industrial Washing & Dyeing', route: '/washing', desc: 'Recipe timing, garment shrinkage, and shade clearance' },
  { code: '08', name: 'Steam Pressing & Ironing', route: '/iron', desc: 'Station allotments, finishing outputs, and defect sorting' },
  { code: '09', name: 'Ready Goods & Packing', route: '/ready-goods', desc: 'Master cartons, gross weight checks, and AQL 2.5 audit' },
  { code: '10', name: 'Alteration & Quality Clinic', route: '/alter', desc: 'Defect intake, tailor repair routing, and reinspection' },
  { code: '11', name: 'Central Store Godown', route: '/store', desc: 'Fabric roll inwarding, ASTM 4-point QC, and trims vault' },
  { code: '12', name: 'Dispatch & Logistics', route: '/dispatch', desc: 'Gate pass clearance, transporter LR, and export dispatch' }
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
  
  // Step 2 Fields: Pre-select all 12 modules
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(
    ALL_12_MODULES.map(m => m.route)
  )

  // Status & Submission States
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdCompany, setCreatedCompany] = useState<string>('')
  const [trialExpiresAt, setTrialExpiresAt] = useState<string>('')

  // Derive Industry Name from First Name
  const cleanFirst = fullName.trim().split(/\s+/)[0] || 'Apparel'
  const computedFirstName = cleanFirst.charAt(0).toUpperCase() + cleanFirst.slice(1).toLowerCase()
  const derivedIndustryName = `${computedFirstName} Industries`

  // Format 10-digit mobile number input
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '')
    setPhone(raw.slice(0, 10))
  }

  // Handle Step 1 Validation -> Proceed to Step 2
  const handleStep1Next = (e: React.FormEvent) => {
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

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter to confirm.')
      return
    }

    setCurrentStep(2)
  }

  // Toggle Module Selection
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
      
      // Broadcast update to sync local admin tenant directory if viewed in this browser session
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
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#FAFAF8] text-[#14140F] relative overflow-x-hidden p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#3A3564] selection:text-white">
      
      {/* Background Layer: Authentic Indian Factory Floor Line-Art Sketch (identical to /login) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-60 mix-blend-multiply bg-center bg-cover"
        style={{ backgroundImage: "url('/factory_bg_tinted_sketch.jpg')" }}
      />

      {/* Top Header / Navigation Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 sm:py-3 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-block group">
            <img 
              src="/z i g z a (8).png" 
              alt="Zigza" 
              className="h-10 sm:h-12 w-auto object-contain transition-opacity group-hover:opacity-85"
            />
          </Link>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full border border-black/10 bg-white text-xs font-mono font-bold uppercase tracking-wider text-[#3A3564] shadow-2xs">
            7-DAY FREE TRIAL
          </span>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to zigza.in</span>
        </Link>
      </header>

      {/* Centered Modal Card with Black Outline */}
      <main className="z-10 w-full max-w-xl my-auto py-4 sm:py-6 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border-2 border-black/85 shadow-2xl overflow-hidden p-6 sm:p-9 relative">
          
          {/* Multi-Step Stepper Header */}
          <div className="mb-6 pb-5 border-b border-slate-100">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564] mb-3">
              STEP {currentStep} OF 3
            </div>

            <div className="flex items-center justify-between relative">
              {/* Stepper Connecting Line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
              <div 
                className="absolute top-4 left-6 h-0.5 bg-[#3A3564] transition-all duration-500 -z-0"
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
              />

              {/* Step 1 Pill */}
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  currentStep >= 1 ? 'bg-[#3A3564] text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                }`}>
                  1
                </div>
                <span className={`text-[11px] font-bold ${currentStep === 1 ? 'text-[#3A3564]' : 'text-slate-500'}`}>
                  Account Setup
                </span>
              </div>

              {/* Step 2 Pill */}
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  currentStep >= 2 ? 'bg-[#3A3564] text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                }`}>
                  2
                </div>
                <span className={`text-[11px] font-bold ${currentStep === 2 ? 'text-[#3A3564]' : 'text-slate-500'}`}>
                  Choose Modules
                </span>
              </div>

              {/* Step 3 Pill */}
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  currentStep === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                }`}>
                  {currentStep === 3 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                </div>
                <span className={`text-[11px] font-bold ${currentStep === 3 ? 'text-emerald-700' : 'text-slate-500'}`}>
                  Trial Ready
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STEP 1: ACCOUNT SETUP                                          */}
          {/* ============================================================== */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                  Account Setup
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Enter your contact details to begin your 7-day free trial.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Field 1: Contact Person Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  Contact Person Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sumit Shaw"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Field 2: Work Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="team.anga9@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                  />
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  This will be your Super Admin credential to sign in.
                </span>
              </div>

              {/* Field 3: Mobile Phone Number with +91 prefilled */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  Mobile Phone Number *
                </label>
                <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all bg-white shadow-2xs">
                  <div className="flex items-center gap-1.5 px-3.5 bg-slate-50 border-r border-slate-200 text-slate-700 font-mono font-bold text-xs sm:text-sm select-none shrink-0">
                    <IndiaFlag className="w-4 h-3" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="8877445633"
                    maxLength={10}
                    className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent font-mono font-medium"
                  />
                </div>
              </div>

              {/* Field 4: Set Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  Set Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 5: Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  Confirm Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#3A3564] hover:bg-[#2c284e] text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>Next: Choose Modules</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-[#3A3564] hover:underline cursor-pointer">
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
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                  Choose Modules to Try Out
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Select your preferred units. All 12 enterprise options are pre-selected for your trial.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Industry Name Preview Banner */}
              <div className="p-3.5 bg-[#FAF7F0] border border-black/10 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                    Auto-Assigned Plant Name
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block truncate">
                    {derivedIndustryName}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    (Fully editable in your Profile anytime)
                  </span>
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <span className="text-slate-700 font-mono">
                  {selectedDivisions.length} of 12 Modules Selected
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={selectAllDivisions}
                    className="text-[#3A3564] hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={clearAllDivisions}
                    className="text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* 12 Modules Selectable List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[310px] overflow-y-auto pr-1">
                {ALL_12_MODULES.map((mod) => {
                  const isSelected = selectedDivisions.includes(mod.route)
                  return (
                    <div
                      key={mod.code}
                      onClick={() => toggleDivision(mod.route)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-[#3A3564] bg-[#FAF7F0]/60 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-400 opacity-60'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                        isSelected ? 'bg-[#3A3564] border-[#3A3564] text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {mod.code}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {mod.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                          {mod.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons: Back + Continue */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  disabled={isPending}
                  className="px-4 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isPending}
                  className="flex-1 py-3.5 rounded-xl bg-[#3A3564] hover:bg-[#2c284e] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating 7-Day Trial...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue & Start 7-Day Trial</span>
                      <ArrowRight className="w-4 h-4" />
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
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 border border-emerald-300 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  7-Day Trial Plan Activated
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                  Welcome, {createdCompany}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Your enterprise apparel MES account is now active with full access to your selected divisions.
                </p>
              </div>

              {/* Account Confirmation Details Card */}
              <div className="p-4 bg-[#FAF7F0] border border-black/10 rounded-2xl text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <span className="text-slate-500 font-medium">Factory Name</span>
                  <span className="font-bold text-slate-900">{createdCompany}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <span className="text-slate-500 font-medium">Super Admin</span>
                  <span className="font-semibold text-slate-900">{fullName}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <span className="text-slate-500 font-medium">Admin Email</span>
                  <span className="font-mono text-slate-700">{email}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <span className="text-slate-500 font-medium">Registered Phone</span>
                  <span className="font-mono text-slate-700">+91 {phone}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <span className="text-slate-500 font-medium">Active Divisions</span>
                  <span className="font-bold text-[#3A3564]">{selectedDivisions.length} of 12 Units Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Trial Validity</span>
                  <span className="font-bold text-emerald-700 font-mono">7 Days Remaining</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200/70 rounded-xl text-left text-[11.5px] text-blue-800 leading-relaxed">
                💡 <span className="font-bold">Factory Name Notice:</span> Your industry name has been initialized as <span className="font-bold">{createdCompany}</span> based on your first name, and can be edited anytime under your <Link href="/modules/profile" className="underline font-bold">Profile</Link>.
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Link
                  href="/cutting"
                  className="w-full py-3.5 rounded-xl bg-[#3A3564] hover:bg-[#2c284e] text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch Floor Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                >
                  Sign in with Credentials
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-3 flex items-center justify-between text-xs text-slate-500 z-10 border-t border-black/10">
        <div className="flex items-center gap-2">
          <span>Proudly Made in India</span>
          <IndiaFlag className="w-4 h-3 rounded-2xs shrink-0" />
        </div>
        <span>© {new Date().getFullYear()} Zigza MES Platform</span>
      </footer>

    </div>
  )
}
