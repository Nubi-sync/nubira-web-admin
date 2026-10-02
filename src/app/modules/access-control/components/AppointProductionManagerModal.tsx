'use client'

import React, { useState } from 'react'
import { X, User, Mail, Lock, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff, Check } from 'lucide-react'
import { appointProductionManagerAction, checkPhoneNumberAvailabilityAction, ProductionManagerItem } from '../actions'

interface AppointProductionManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (pm?: ProductionManagerItem) => void
}

export function AppointProductionManagerModal({
  isOpen,
  onClose,
  onSuccess
}: AppointProductionManagerModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isCheckingPhone, setIsCheckingPhone] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const isPasswordMatch = password.length >= 6 && password === confirmPassword

  const handleStep1Next = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (!name.trim()) {
      setError('Please enter full name.')
      return
    }
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setIsCheckingPhone(true)
    const checkRes = await checkPhoneNumberAvailabilityAction(cleanPhone)
    setIsCheckingPhone(false)

    if (!checkRes.isAvailable) {
      setError(checkRes.message || 'This mobile number is already registered in the system.')
      return
    }

    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const res = await appointProductionManagerAction({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      password: password
    })
    setIsSubmitting(false)

    if (res.success) {
      onSuccess(res.pm)
      handleClose()
    } else {
      setError(res.error || 'Failed to appoint Production Manager')
    }
  }

  const handleClose = () => {
    setStep(1)
    setName('')
    setPhone('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <div className="text-xs font-semibold text-slate-500">Step {step} of 2</div>
            <h3 className="text-lg sm:text-xl font-bold text-[#0B1220] tracking-tight mt-0.5 font-[family-name:var(--font-heading)]">
              Appoint <span className="text-[#1D4ED8]">Production Manager</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Step Progress Indicator */}
        <div className="grid grid-cols-2 gap-1.5 px-6 pt-4">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-[#0B1220]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-[#0B1220]' : 'bg-slate-200'}`} />
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-200 focus-within:border-[#0B1220] focus-within:ring-2 focus-within:ring-[#0B1220]/10 overflow-hidden bg-[#F8FAFC] transition-all">
                  <div className="px-3.5 py-3 bg-slate-100/90 border-r border-slate-200/80 text-sm font-mono font-bold text-slate-700 flex items-center select-none">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full px-3.5 py-3 bg-transparent text-sm sm:text-base font-mono font-medium text-[#0B1220] outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Used for mobile number login.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-800">Email Address</label>
                  <span className="text-xs text-slate-400 font-mono">Optional</span>
                </div>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isCheckingPhone}
                  className="w-full py-3 px-5 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {isCheckingPhone ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Mobile Number...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Password</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Create New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-800">
                    Retype New Password <span className="text-rose-500">*</span>
                  </label>
                  {confirmPassword && (
                    <span className="flex items-center gap-1 text-xs font-semibold">
                      {isPasswordMatch ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-500">Passwords do not match</span>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full pl-10 pr-16 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-medium text-[#0B1220] border rounded-xl outline-none transition-all ${
                      confirmPassword && isPasswordMatch
                        ? 'border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10'
                        : confirmPassword && !isPasswordMatch
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10'
                    }`}
                  />
                  <div className="absolute right-3 flex items-center gap-1">
                    {isPasswordMatch && (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 text-xs sm:text-sm text-slate-700 space-y-1.5">
                <div className="font-bold text-[#0B1220]">Access Rights:</div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#14C8B4] shrink-0" />
                  <span>Can appoint Department Heads &amp; assign floor workers</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#14C8B4] shrink-0" />
                  <span>Full access to all factory departments</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Appointing...</span>
                    </>
                  ) : (
                    <span>Appoint Production Manager</span>
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
