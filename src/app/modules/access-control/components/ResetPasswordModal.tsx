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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-black/10 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 flex items-center justify-center shadow-2xs">
            <KeyRound className="w-5 h-5 stroke-[2.2] text-[#0B1220]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Reset Staff Password
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {headName} {phone ? `(+91 ${phone})` : username ? `(${username})` : ''}
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 flex items-center justify-center mx-auto shadow-2xs">
              <Check className="w-6 h-6 stroke-[2.5] text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-slate-900">Password Updated Successfully!</p>
            <p className="text-xs text-slate-500 font-mono">New credentials are now active.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  New Password *
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] text-[#1D4ED8] hover:underline font-bold cursor-pointer"
                >
                  Generate Strong
                </button>
              </div>
              <div className="relative flex items-center rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-[#0B1220] focus-within:border-[#0B1220] overflow-hidden bg-white shadow-2xs">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-20 py-3 text-base font-mono font-bold text-[#0B1220] placeholder-slate-400 focus:outline-none"
                />
                <div className="absolute right-0 top-0 bottom-0 flex items-center bg-white">
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

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newPassword}
                className="min-h-[44px] px-6 py-2.5 bg-[#0B1220] hover:bg-[#162032] disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
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
  )
}
