'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, sendPasswordResetOtp, verifyRecoveryOtp, setNewPassword } from './actions'
import { ArrowRight, ArrowLeft, X, KeyRound, CheckCircle2, AlertCircle, ShieldCheck, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

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

  async function clientAction(formData: FormData) {
    setIsPending(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
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
      setIsForgotPending(false)
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
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#FAFAF8] text-[#14140F] relative overflow-x-hidden p-4 sm:p-6 font-sans">
      
      {/* Top Header / Back Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#57564E] hover:text-[#14140F] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-200/50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to zigza.in</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-[#57564E] font-medium hidden sm:inline">Secure Staff Access</span>
        </div>
      </header>

      {/* Centered Login Card Container */}
      <main className="z-10 w-full max-w-[420px] my-auto py-6 flex flex-col items-center">
        
        {/* Brand Logo & Presentation */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Link href="/" className="inline-block mb-3 group">
            <img 
              src="/new_logo.png" 
              alt="zigza." 
              className="h-10 sm:h-11 w-auto object-contain rounded-lg overflow-hidden shadow-xs transition-transform group-hover:scale-[1.02]"
            />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14140F] tracking-tight">
            Staff Portal Sign In
          </h1>
          <p className="text-xs sm:text-sm text-[#57564E] mt-1">
            Manufacturing Execution System for modern apparel plants
          </p>
        </div>

        {/* Login Form Card: Slim Black Outline without shadow */}
        <div className="w-full bg-white rounded-2xl border border-black p-6 sm:p-8">
          <form action={clientAction} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@nubira.local"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#14140F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all bg-white"
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#14140F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent transition-all bg-white"
              />
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
                className="text-xs font-semibold text-[#3A3564] hover:underline transition-colors bg-transparent border-none p-0 cursor-pointer"
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
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#3A3564] hover:bg-[#2F2B52] flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {isPending ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        </div>

      </main>

      {/* 3-Step OTP & Password Reset Modal */}
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
                  {forgotStep === 2 && 'Enter 6-Digit OTP'}
                  {forgotStep === 3 && 'Create New Password'}
                </h3>
                <p className="text-xs text-slate-500">
                  {forgotStep === 1 && 'Step 1 of 3: Registered Email'}
                  {forgotStep === 2 && 'Step 2 of 3: OTP Verification'}
                  {forgotStep === 3 && 'Step 3 of 3: Set Password'}
                </p>
              </div>
            </div>

            {/* SUCCESS STATE */}
            {isResetSuccess ? (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Password Updated Successfully!</h4>
                <p className="text-xs text-slate-500">
                  Your new password has been saved. Redirecting to dashboard...
                </p>
              </div>
            ) : forgotStep === 1 ? (
              /* STEP 1: ENTER EMAIL */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered email address. We will send you a 6-digit OTP code to verify your identity.
                </p>

                <div>
                  <label 
                    htmlFor="forgot-email" 
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Registered Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. team.anga9@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#14140F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent bg-white"
                  />
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl text-xs font-medium bg-rose-50 border border-rose-200 text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={resetModalState}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotPending}
                    className="flex-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#3A3564] hover:bg-[#2F2B52] transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
                  >
                    {isForgotPending ? 'Sending OTP...' : 'Send 6-Digit OTP'}
                  </button>
                </div>
              </form>
            ) : forgotStep === 2 ? (
              /* STEP 2: ENTER OTP ONLY */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold block">OTP Sent to:</span>
                    <span className="font-bold text-blue-700">{forgotEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-[11px] font-bold text-blue-600 hover:underline shrink-0 cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>

                <div>
                  <label 
                    htmlFor="otp-token" 
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    id="otp-token"
                    type="text"
                    required
                    maxLength={10}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    placeholder="• • • • • •"
                    className="w-full py-2.5 px-3.5 text-center tracking-[6px] font-mono text-lg font-bold rounded-xl border border-slate-200 text-[#3A3564] focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent bg-white"
                  />
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl text-xs font-medium bg-rose-50 border border-rose-200 text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotPending}
                    className="flex-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#3A3564] hover:bg-[#2F2B52] transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
                  >
                    {isForgotPending ? 'Verifying OTP...' : 'Verify OTP Code'}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 3: SET NEW PASSWORD */
              <form onSubmit={handleSetNewPassword} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">OTP Verified! Create your new password.</span>
                </div>

                <div>
                  <label 
                    htmlFor="new-password" 
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#14140F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent bg-white"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="confirm-password" 
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#14140F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564] focus:border-transparent bg-white"
                  />
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl text-xs font-medium bg-rose-50 border border-rose-200 text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isForgotPending}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#3A3564] hover:bg-[#2F2B52] transition-colors disabled:opacity-60 shadow-sm cursor-pointer"
                  >
                    {isForgotPending ? 'Updating Password...' : 'Save Password & Sign In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <footer className="w-full max-w-5xl py-3 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 pl-16 sm:pl-0">
        <div className="text-xs font-mono text-[#57564E]/80">
          ZIGZA GARMENT MES · v2.4.1
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-[#57564E]">
            All systems operational
          </span>
        </div>
      </footer>

    </div>
  )
}
