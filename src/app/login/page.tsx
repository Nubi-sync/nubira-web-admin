'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, sendPasswordResetOtp, verifyRecoveryOtp, setNewPassword } from './actions'
import { ArrowRight, X, KeyRound, CheckCircle2, AlertCircle, ShieldCheck, Lock } from 'lucide-react'

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
    <div 
      className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-x-hidden p-4 font-[family-name:var(--font-public-sans)]"
      style={{
        backgroundColor: 'var(--bg, #EEF1F5)',
        backgroundImage: [
          'radial-gradient(circle at 1px 1px, var(--bg-line, #E2E7EE) 1px, transparent 1px)',
          'repeating-linear-gradient(0deg, rgba(43, 76, 126, 0.05) 0px, rgba(43, 76, 126, 0.05) 1px, transparent 1px, transparent 120px)',
          'repeating-linear-gradient(90deg, rgba(43, 76, 126, 0.05) 0px, rgba(43, 76, 126, 0.05) 1px, transparent 1px, transparent 120px)'
        ].join(','),
        backgroundSize: '28px 28px, 120px 120px, 120px 120px',
      }}
    >
      {/* Centered Content Container */}
      <div className="z-10 w-full max-w-[380px] flex flex-col items-center">
        
        {/* 1. Logo Mark */}
        <div 
          className="w-14 h-14 rounded-[14px] flex items-center justify-center mb-4 transition-transform duration-200 hover:scale-[1.02]"
          style={{
            backgroundColor: 'var(--steel, #2B4C7E)',
            boxShadow: '0 8px 20px -6px rgba(31, 58, 99, 0.45)',
          }}
        >
          {/* Zigza Logo Mark */}
          <svg 
            className="w-7 h-7 text-white" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M4 4h16l-12 16h12" />
          </svg>
        </div>

        {/* 2. Brand Block */}
        <div className="text-center mb-7 flex flex-col items-center">
          <h1 
            className="text-[32px] leading-tight font-black tracking-tight font-[family-name:var(--font-heading)]"
            style={{ color: 'var(--ink, #1C2733)' }}
          >
            Zigza ERP
          </h1>

          <div 
            className="w-[120px] h-[2px] my-2.5"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, var(--stitch, #C8802B) 0px, var(--stitch, #C8802B) 6px, transparent 6px, transparent 11px)',
            }}
          />

          <p 
            className="text-[11px] font-semibold tracking-[3px] uppercase"
            style={{ color: 'var(--ink-soft, #5B6B7C)' }}
          >
            WEB ADMIN PANEL
          </p>
        </div>

        {/* 3. Login Card */}
        <div 
          className="w-full relative bg-white border rounded-[12px] p-6 sm:p-[34px_34px_30px]"
          style={{
            borderColor: 'var(--border, #E2E8F0)',
            boxShadow: '0 24px 48px -20px rgba(31, 58, 99, 0.18), 0 2px 6px rgba(31, 58, 99, 0.05)',
          }}
        >
          {/* Stitched top edge decoration */}
          <div 
            className="absolute top-0 left-5 right-5 h-[1px] opacity-50"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, var(--steel, #2B4C7E) 0px, var(--steel, #2B4C7E) 5px, transparent 5px, transparent 9px)',
            }}
          />

          <form action={clientAction} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="email" 
                className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@nubira.local"
                className="w-full py-[11px] px-[13px] text-[13.5px] rounded-[7px] border transition-colors outline-none"
                style={{
                  backgroundColor: '#FBFCFD',
                  borderColor: 'var(--border, #E2E8F0)',
                  color: 'var(--ink, #1C2733)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--steel-mist, #EEF3FA)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="password" 
                className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full py-[11px] px-[13px] text-[13.5px] rounded-[7px] border transition-colors outline-none"
                style={{
                  backgroundColor: '#FBFCFD',
                  borderColor: 'var(--border, #E2E8F0)',
                  color: 'var(--ink, #1C2733)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--steel-mist, #EEF3FA)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
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
                  className="w-3.5 h-3.5 rounded cursor-pointer transition-colors"
                  style={{ accentColor: 'var(--steel, #2B4C7E)' }}
                />
                <span 
                  className="text-[12.5px]"
                  style={{ color: 'var(--ink-soft, #5B6B7C)' }}
                >
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
                className="text-[12.5px] font-semibold hover:underline transition-colors bg-transparent border-none p-0 cursor-pointer"
                style={{ color: 'var(--steel, #2B4C7E)' }}
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="p-3 rounded-[7px] text-[13px] font-medium border flex items-start"
                style={{
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FECACA',
                  color: '#DC2626',
                }}
              >
                <span>{error}</span>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-[12px] px-4 rounded-[7px] text-[14.5px] font-semibold text-white flex items-center justify-center gap-[8px] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'var(--steel, #2B4C7E)',
              }}
              onMouseEnter={(e) => {
                if (!isPending) e.currentTarget.style.backgroundColor = 'var(--steel-dark, #1F3A63)'
              }}
              onMouseLeave={(e) => {
                if (!isPending) e.currentTarget.style.backgroundColor = 'var(--steel, #2B4C7E)'
              }}
            >
              {isPending ? (
                <span>Signing in...</span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-[15px] h-[15px]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3-STEP OTP & PASSWORD RESET MODAL                        */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-[400px] bg-white border rounded-[14px] p-6 sm:p-7 shadow-2xl relative"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            {/* Close Button */}
            <button 
              onClick={resetModalState}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
              >
                {forgotStep === 1 && <KeyRound className="w-5 h-5" />}
                {forgotStep === 2 && <ShieldCheck className="w-5 h-5" />}
                {forgotStep === 3 && <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h3 
                  className="text-lg font-bold font-[family-name:var(--font-heading)] leading-tight"
                  style={{ color: 'var(--ink, #1C2733)' }}
                >
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
              /* ======================================================== */
              /* STEP 1: ENTER EMAIL                                      */
              /* ======================================================== */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered email address. We will send you a 6-digit OTP code to verify your identity.
                </p>

                <div className="space-y-1.5">
                  <label 
                    htmlFor="forgot-email" 
                    className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                    style={{ color: 'var(--ink-soft, #5B6B7C)' }}
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
                    className="w-full py-[11px] px-[13px] text-[13.5px] rounded-[7px] border transition-colors outline-none"
                    style={{
                      backgroundColor: '#FBFCFD',
                      borderColor: 'var(--border, #E2E8F0)',
                      color: 'var(--ink, #1C2733)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--steel-mist, #EEF3FA)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {forgotError && (
                  <div className="p-3 rounded-[7px] text-xs font-medium bg-rose-50 border border-rose-200 text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetModalState}
                    className="flex-1 py-2.5 px-3 rounded-[7px] text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotPending}
                    className="flex-2 py-2.5 px-4 rounded-[7px] text-xs font-bold text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
                  >
                    {isForgotPending ? 'Sending OTP...' : 'Send 6-Digit OTP'}
                  </button>
                </div>
              </form>
            ) : forgotStep === 2 ? (
              /* ======================================================== */
              /* STEP 2: ENTER OTP ONLY                                   */
              /* ======================================================== */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-[9px] bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold block">OTP Sent to:</span>
                    <span className="font-bold text-blue-700">{forgotEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-[11px] font-bold text-blue-600 hover:underline shrink-0"
                  >
                    Change Email
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label 
                    htmlFor="otp-token" 
                    className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                    style={{ color: 'var(--ink-soft, #5B6B7C)' }}
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
                    className="w-full py-[12px] px-[13px] text-center tracking-[6px] font-mono text-lg font-bold rounded-[7px] border transition-colors outline-none"
                    style={{
                      backgroundColor: '#FBFCFD',
                      borderColor: 'var(--border, #E2E8F0)',
                      color: 'var(--steel, #2B4C7E)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--steel-mist, #EEF3FA)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {forgotError && (
                  <div className="p-3 rounded-[7px] text-xs font-medium bg-rose-50 border border-rose-200 text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="flex-1 py-2.5 px-3 rounded-[7px] text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotPending}
                    className="flex-2 py-2.5 px-4 rounded-[7px] text-xs font-bold text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
                  >
                    {isForgotPending ? 'Verifying OTP...' : 'Verify OTP Code'}
                  </button>
                </div>
              </form>
            ) : (
              /* ======================================================== */
              /* STEP 3: SET NEW PASSWORD                                 */
              /* ======================================================== */
              <form onSubmit={handleSetNewPassword} className="space-y-3.5">
                <div className="p-2.5 rounded-[9px] bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">OTP Verified! Create your new password.</span>
                </div>

                <div className="space-y-1">
                  <label 
                    htmlFor="new-password" 
                    className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                    style={{ color: 'var(--ink-soft, #5B6B7C)' }}
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
                    className="w-full py-[10px] px-[13px] text-[13.5px] rounded-[7px] border transition-colors outline-none"
                    style={{
                      backgroundColor: '#FBFCFD',
                      borderColor: 'var(--border, #E2E8F0)',
                      color: 'var(--ink, #1C2733)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--steel-mist, #EEF3FA)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label 
                    htmlFor="confirm-password" 
                    className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                    style={{ color: 'var(--ink-soft, #5B6B7C)' }}
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
                    className="w-full py-[10px] px-[13px] text-[13.5px] rounded-[7px] border transition-colors outline-none"
                    style={{
                      backgroundColor: '#FBFCFD',
                      borderColor: 'var(--border, #E2E8F0)',
                      color: 'var(--ink, #1C2733)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--steel-mist, #EEF3FA)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {forgotError && (
                  <div className="p-3 rounded-[7px] text-xs font-medium bg-rose-50 border border-rose-200 text-rose-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isForgotPending}
                    className="w-full py-2.5 px-4 rounded-[7px] text-xs font-bold text-white transition-colors disabled:opacity-60 shadow-sm"
                    style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
                  >
                    {isForgotPending ? 'Updating Password...' : 'Save Password & Sign In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. Fixed Viewport Footer */}
      <footer className="w-full fixed bottom-0 left-0 right-0 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-none z-10">
        <div 
          className="text-[11px] font-[family-name:var(--font-jetbrains-mono)] opacity-70 pointer-events-auto"
          style={{ color: 'var(--ink-soft, #5B6B7C)' }}
        >
          ZIGZA GARMENT ERP · v2.4.1
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <span 
            className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
            style={{ backgroundColor: '#2E9E5B' }}
          />
          <span 
            className="text-[12px] font-medium"
            style={{ color: 'var(--ink-soft, #5B6B7C)' }}
          >
            All systems operational
          </span>
        </div>
      </footer>
    </div>
  )
}
