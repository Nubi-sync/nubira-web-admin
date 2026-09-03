'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, sendPasswordResetOtp, verifyRecoveryOtp, setNewPassword } from './actions'
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff,
  Sparkles,
  Loader2
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

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // 3-Step Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1) // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [newPassword, setNewPasswordVal] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotStatus, setForgotStatus] = useState<string | null>(null)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [isForgotPending, setIsForgotPending] = useState(false)
  const [isResetSuccess, setIsResetSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
        setIsSuccess(false)
      } else {
        setIsSuccess(true)
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) {
        setIsSuccess(true)
        return
      }
      setError(err?.message || 'Failed to sign in')
      setIsPending(false)
    }
  }

  // STEP 1: Send OTP to Email
  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsForgotPending(true)
    setForgotError(null)
    setForgotStatus(null)

    const formData = new FormData()
    formData.append('email', forgotEmail)

    const res = await sendPasswordResetOtp(formData)
    if (res?.error) {
      setForgotError(res.error)
    } else if (res?.success) {
      setForgotStatus('6-digit OTP has been sent to your email.')
      setForgotStep(2)
    }
    setIsForgotPending(false)
  }

  // STEP 2: Verify OTP Only
  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsForgotPending(true)
    setForgotError(null)

    const formData = new FormData()
    formData.append('email', forgotEmail)
    formData.append('token', otpToken)

    const res = await verifyRecoveryOtp(formData)
    if (res?.error) {
      setForgotError(res.error)
    } else if (res?.success) {
      setForgotStep(3)
    }
    setIsForgotPending(false)
  }

  // STEP 3: Set New Password
  async function handleSetNewPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsForgotPending(true)
    setForgotError(null)

    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.')
      setIsForgotPending(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.')
      setIsForgotPending(false)
      return
    }

    const formData = new FormData()
    formData.append('password', newPassword)
    formData.append('confirm_password', confirmPassword)

    const res = await setNewPassword(formData)
    if (res?.error) {
      setForgotError(res.error)
    } else if (res?.success) {
      setIsResetSuccess(true)
      setIsForgotPending(false)
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  }

  function resetModalState() {
    setShowForgotModal(false)
    setForgotStep(1)
    setForgotEmail('')
    setOtpToken('')
    setNewPasswordVal('')
    setConfirmPassword('')
    setForgotStatus(null)
    setForgotError(null)
    setIsResetSuccess(false)
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#FAFAF8] text-[#14140F] relative overflow-x-hidden p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#3A3564] selection:text-white">
      
      {/* Background Layer: Indian Factory Floor Line-Art Sketch with subtle watercolor tints (Web Login exclusive) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-60 mix-blend-multiply bg-center bg-cover"
        style={{ backgroundImage: "url('/factory_bg_tinted_sketch.jpg')" }}
      />

      {/* Top Header / Back Navigation Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-3 z-10">
        <div className="flex items-center gap-3.5">
          <Link href="/" className="inline-block group">
            <img 
              src="/z i g z a (1) copy.png" 
              alt="zigza." 
              className="h-10 sm:h-12 w-auto object-contain rounded-xl overflow-hidden transition-opacity group-hover:opacity-85"
            />
          </Link>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full border border-black bg-white text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564]">
            STAFF PORTAL
          </span>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-black bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to zigza.in</span>
        </Link>
      </header>

      {/* Centered Login Card: Minimal Plain Black Outline, No Shadow */}
      <main className="z-10 w-full max-w-5xl my-auto py-6 sm:py-8 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-black overflow-hidden p-5 sm:p-7 lg:p-9 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Vintage Indian Factory Newspaper / Editorial Handshake Artwork */}
          <div className="lg:col-span-6 w-full flex flex-col justify-center">
            <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[460px] rounded-2xl overflow-hidden border border-black bg-[#FAF7F0] group">
              <img 
                src="/factory_handshake_art.jpg" 
                alt="Indian Garment Manufacturing Floor Partnership" 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </div>

          {/* Right Column: High-Contrast Email & Password Form */}
          <div className="lg:col-span-6 w-full flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Staff Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                Sign in with your registered work email and password to manage factory floor allotments.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Work Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide"
                >
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email ID"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    id="remember"
                    name="remember"
                    defaultChecked
                    className="w-4 h-4 rounded text-[#3A3564] accent-[#3A3564] cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Keep me signed in
                  </span>
                </label>

                <button 
                  type="button"
                  onClick={() => {
                    setForgotError(null)
                    setForgotStatus(null)
                    setForgotStep(1)
                    setShowForgotModal(true)
                  }}
                  className="text-xs font-bold text-[#3A3564] hover:underline transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-xl text-xs font-medium bg-rose-50 border border-rose-200 text-rose-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending || isSuccess}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2F2B52] flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-85 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Bottom Onboarding Note */}
              <p className="text-center text-xs text-slate-500 pt-2">
                Need enterprise factory access?{' '}
                <Link href="/#contact" className="text-[#3A3564] font-bold hover:underline">
                  Request a live demo
                </Link>
              </p>

            </form>
          </div>

        </div>
      </main>

      {/* 3-Step OTP & Password Reset Modal (100% Functionality Preserved) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1A2E]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-[420px] bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
            
            {/* Close Button */}
            <button 
              onClick={resetModalState}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3A3564] flex items-center justify-center shrink-0">
                {forgotStep === 1 && <KeyRound className="w-5 h-5" />}
                {forgotStep === 2 && <ShieldCheck className="w-5 h-5" />}
                {forgotStep === 3 && <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {forgotStep === 1 && 'Reset Password'}
                  {forgotStep === 2 && 'Verify OTP'}
                  {forgotStep === 3 && 'New Password'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step {forgotStep} of 3 · Factory Security Verification
                </p>
              </div>
            </div>

            {/* Status & Error Alerts */}
            {forgotStatus && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotStatus}</span>
              </div>
            )}
            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered factory email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotPending}
                  className="w-full py-3 bg-[#3A3564] text-white rounded-xl text-sm font-bold hover:bg-[#2F2B52] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isForgotPending ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              </form>
            )}

            {/* STEP 2: Enter OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.trim())}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-center tracking-widest font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotPending}
                  className="w-full py-3 bg-[#3A3564] text-white rounded-xl text-sm font-bold hover:bg-[#2F2B52] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isForgotPending ? 'Verifying OTP...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {/* STEP 3: Enter New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                {isResetSuccess ? (
                  <div className="py-6 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                    <h4 className="font-bold text-slate-900">Password Updated!</h4>
                    <p className="text-xs text-slate-500">Redirecting to login dashboard...</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isForgotPending}
                      className="w-full py-3 bg-[#3A3564] text-white rounded-xl text-sm font-bold hover:bg-[#2F2B52] transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {isForgotPending ? 'Saving Password...' : 'Set New Password'}
                    </button>
                  </>
                )}
              </form>
            )}

          </div>
        </div>
      )}

      {/* Minimal Footer Signature Bar */}
      <footer className="w-full max-w-5xl py-4 border-t border-slate-200/80 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <IndiaFlag className="w-5 h-3.5 rounded-xs" />
            <span className="text-proudly-india-black">
              Proudly Made in India
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-slate-900 transition-colors">Security</Link>
          </div>

          <p>© {new Date().getFullYear()} Zigza MES. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
