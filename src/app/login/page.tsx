'use client'

import { useState } from 'react'
import { login, requestPasswordReset } from './actions'
import { ArrowRight, X, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState<string | null>(null)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [isForgotPending, setIsForgotPending] = useState(false)

  async function clientAction(formData: FormData) {
    setIsPending(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  async function handleForgotSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsForgotPending(true)
    setForgotError(null)
    setForgotStatus(null)

    const formData = new FormData()
    formData.append('email', forgotEmail)

    const res = await requestPasswordReset(formData)
    if (res?.error) {
      setForgotError(res.error)
    } else if (res?.success) {
      setForgotStatus(res.message || 'Password reset link sent! Check your inbox.')
    }
    setIsForgotPending(false)
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
        
        {/* 1. Logo Mark (56x56px, rounded 14px, steel background, subtle shadow) */}
        <div 
          className="w-14 h-14 rounded-[14px] flex items-center justify-center mb-4 transition-transform duration-200 hover:scale-[1.02]"
          style={{
            backgroundColor: 'var(--steel, #2B4C7E)',
            boxShadow: '0 8px 20px -6px rgba(31, 58, 99, 0.45)',
          }}
        >
          {/* TODO: replace with actual Nubira Creation logo file */}
          <svg 
            className="w-7 h-7 text-white" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.75" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Needle and Thread / Garment Craft Icon */}
            <path d="M12 2v20" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            <circle cx="12" cy="4" r="1.2" fill="currentColor" />
          </svg>
        </div>

        {/* 2. Brand Block */}
        <div className="text-center mb-7 flex flex-col items-center">
          <h1 
            className="text-[30px] leading-tight font-bold tracking-tight font-[family-name:var(--font-fraunces)]"
            style={{ color: 'var(--ink, #1C2733)' }}
          >
            Nubira Factory
          </h1>

          {/* Dashed stitch divider rule (120px wide, 6px dash / 5px gap) */}
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

        {/* 3. Login Card (380px wide max, 12px radius, stitched top edge) */}
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
      {/* FORGOT PASSWORD MODAL (SUPABASE AUTH INTEGRATED)          */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-[400px] bg-white border rounded-[14px] p-6 sm:p-7 shadow-2xl relative"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
              >
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 
                  className="text-lg font-bold font-[family-name:var(--font-fraunces)] leading-tight"
                  style={{ color: 'var(--ink, #1C2733)' }}
                >
                  Reset Password
                </h3>
                <p className="text-xs text-slate-500">Supabase Secure Recovery</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Enter your registered account email address. We will send you an official secure link to reset your password.
            </p>

            {forgotStatus ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-[9px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Check Your Email Inbox</span>
                    <span>{forgotStatus}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 px-4 rounded-[7px] text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
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
                    placeholder="e.g. admin@nubira.local"
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
                    onClick={() => setShowForgotModal(false)}
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
                    {isForgotPending ? 'Sending...' : 'Send Reset Link'}
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
          NUBIRA CREATION · v2.4.1
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
