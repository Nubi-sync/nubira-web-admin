'use client'

import React, { useState } from 'react'
import { X, KeyRound, Loader2, Check, Copy, Eye, EyeOff } from 'lucide-react'
import { resetStaffPasswordAction } from '../actions'

interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  headId: string
  headName: string
  username?: string
  phone?: string
  onSuccess: () => void
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  headId,
  headName,
  username,
  phone,
  onSuccess
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const generateRandomPassword = () => {
    const slug = headName.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'Zigza'
    const cap = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase()
    const num = Math.floor(1000 + Math.random() * 9000)
    setNewPassword(`@${cap}${num}!`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await resetStaffPasswordAction(headId, newPassword, phone)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2200)
      } else {
        setError(res.error || 'Failed to reset password')
      }
    } catch (err: any) {
      setError(err?.message || 'Server error while resetting password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-[family-name:var(--font-public-sans)]">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 stroke-[2.2] text-[#0F766E]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[#0B1220] tracking-tight font-[family-name:var(--font-heading)] leading-tight">
                Reset <span className="text-[#1D4ED8]">Staff Password</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate tabular-nums mt-0.5">
                {headName} {phone ? `(+91 ${phone})` : username ? `(${username})` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
        {success ? (
          <div className="py-5 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 flex items-center justify-center mx-auto shadow-2xs">
              <Check className="w-6 h-6 stroke-[2.5] text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-[#0B1220] font-[family-name:var(--font-heading)]">Password Updated Successfully!</p>
            <p className="text-xs text-slate-500 font-medium">New credentials are now active.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-600">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs text-[#1D4ED8] hover:underline font-bold cursor-pointer"
                >
                  Generate Strong
                </button>
              </div>
              <div className="relative flex items-center rounded-xl border border-slate-200 focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/15 overflow-hidden bg-[#F8FAFC] focus-within:bg-white transition-all">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-20 py-3 bg-transparent text-sm sm:text-base font-bold text-[#0B1220] placeholder-slate-400 tabular-nums focus:outline-none"
                />
                <div className="absolute right-0 top-0 bottom-0 flex items-center bg-transparent">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {newPassword && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 border-l border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer h-full"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-700 font-semibold">
                {error}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newPassword}
                className="min-h-[44px] px-6 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  )
}
