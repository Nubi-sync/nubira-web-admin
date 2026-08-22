'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, KeyRound } from 'lucide-react'
import { updatePassword } from '../login/actions'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setIsPending(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setIsPending(false)
      return
    }

    const res = await updatePassword(formData)
    if (res?.error) {
      setError(res.error)
      setIsPending(false)
    } else {
      setIsSuccess(true)
      setIsPending(false)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
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
      <div className="z-10 w-full max-w-[380px] flex flex-col items-center">
        
        {/* Key Icon Container */}
        <div 
          className="w-14 h-14 rounded-[14px] flex items-center justify-center mb-4 transition-transform duration-200"
          style={{
            backgroundColor: 'var(--steel, #2B4C7E)',
            boxShadow: '0 8px 20px -6px rgba(31, 58, 99, 0.45)',
          }}
        >
          <KeyRound className="w-7 h-7 text-white" />
        </div>

        {/* Brand Block */}
        <div className="text-center mb-7 flex flex-col items-center">
          <h1 
            className="text-[28px] leading-tight font-bold tracking-tight font-[family-name:var(--font-fraunces)]"
            style={{ color: 'var(--ink, #1C2733)' }}
          >
            Set New Password
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
            ACCOUNT SECURITY
          </p>
        </div>

        {/* Card */}
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

          {isSuccess ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Password Updated Successfully!</h3>
              <p className="text-xs text-slate-500">
                Your password has been securely updated. Redirecting you to the dashboard...
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline pt-2"
              >
                Go to Dashboard now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="password" 
                  className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                  style={{ color: 'var(--ink-soft, #5B6B7C)' }}
                >
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="confirm_password" 
                  className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                  style={{ color: 'var(--ink-soft, #5B6B7C)' }}
                >
                  Confirm Password
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  placeholder="Re-enter your new password"
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

              {/* Submit Button */}
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
                  <span>Updating Password...</span>
                ) : (
                  <>
                    Save Password & Continue
                    <ArrowRight className="w-[15px] h-[15px]" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-xs font-semibold hover:underline"
            style={{ color: 'var(--steel, #2B4C7E)' }}
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>

      {/* Footer */}
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
