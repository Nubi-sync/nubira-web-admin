'use client'

import React, { useState, useEffect } from 'react'
import { X, User, Mail, Lock, ArrowRight, ArrowLeft, Loader2, CheckSquare, Square, Eye, EyeOff, Check } from 'lucide-react'
import { appointOrUpdateDepartmentHeadAction, checkPhoneNumberAvailabilityAction, DepartmentHeadItem } from '../actions'
import { DEPARTMENT_HEADS_CATALOG } from '@/lib/access-control'

interface AppointDepartmentHeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (head?: DepartmentHeadItem) => void
  existingHead?: DepartmentHeadItem | null
  allowedDivisions: string[]
  initialDivisionRoute?: string
}

const ALL_TOP_TABS = [
  { id: 'all-modules', label: 'All Modules' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'buyers-vendors', label: 'Buyers & Vendors' },
  { id: 'supervisor-workers', label: 'Supervisor & Workers' },
  { id: 'all-designs', label: 'All Designs' },
  { id: 'fabric-store', label: 'Fabric & Store' },
  { id: 'reports', label: 'Reports' },
  { id: 'company-profile', label: 'Company Profile' },
]

export function AppointDepartmentHeadModal({
  isOpen,
  onClose,
  onSuccess,
  existingHead,
  allowedDivisions,
  initialDivisionRoute
}: AppointDepartmentHeadModalProps) {
  const isEditing = Boolean(existingHead)
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1: Contact & Credentials
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phone2, setPhone2] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 2: Department & Permissions
  const [primaryRoute, setPrimaryRoute] = useState('')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [selectedTabs, setSelectedTabs] = useState<string[]>(['all-modules'])

  const [error, setError] = useState<string | null>(null)
  const [isCheckingPhone, setIsCheckingPhone] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only allow divisions the company has purchased
  const purchasedCatalog = DEPARTMENT_HEADS_CATALOG.filter(d => allowedDivisions.includes(d.route))

  const isPasswordMatch = Boolean(password && confirmPassword && password.length >= 6 && password === confirmPassword)

  useEffect(() => {
    if (existingHead) {
      setName(existingHead.displayName || existingHead.username)
      setPhone(existingHead.phone || '')
      setPhone2(existingHead.phone2 || '')
      setEmail(existingHead.email?.endsWith('.local') ? '' : (existingHead.email || ''))
      setPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      const primary = existingHead.primaryDivisionRoute || existingHead.allowedModules[0] || purchasedCatalog[0]?.route || '/cutting'
      setPrimaryRoute(primary)
      setSelectedModules(existingHead.allowedModules.length > 0 ? existingHead.allowedModules : [primary])
      setSelectedTabs(existingHead.allowedTabs && existingHead.allowedTabs.length > 0 ? existingHead.allowedTabs : ['all-modules'])
    } else {
      setName('')
      setPhone('')
      setPhone2('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      const defaultRoute = initialDivisionRoute && allowedDivisions.includes(initialDivisionRoute)
        ? initialDivisionRoute
        : (purchasedCatalog[0]?.route || '/cutting')
      setPrimaryRoute(defaultRoute)
      setSelectedModules([defaultRoute])
      setSelectedTabs(['all-modules'])
    }
    setStep(1)
    setError(null)
  }, [existingHead, initialDivisionRoute, isOpen, allowedDivisions])

  if (!isOpen) return null

  const handleStep1Next = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const cleanPhone2 = phone2.replace(/\D/g, '').slice(-10)

    if (!name.trim()) {
      setError('Please enter full name.')
      return
    }
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (phone2 && cleanPhone2.length !== 10) {
      setError('Secondary phone number must be 10 digits.')
      return
    }

    if (!isEditing) {
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    } else if (password) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setIsCheckingPhone(true)
    const checkRes1 = await checkPhoneNumberAvailabilityAction(cleanPhone, existingHead?.id)
    if (!checkRes1.isAvailable) {
      setIsCheckingPhone(false)
      setError(checkRes1.message || 'Primary mobile number is already registered in the system.')
      return
    }

    if (cleanPhone2) {
      const checkRes2 = await checkPhoneNumberAvailabilityAction(cleanPhone2, existingHead?.id)
      if (!checkRes2.isAvailable) {
        setIsCheckingPhone(false)
        setError(checkRes2.message || 'Secondary mobile number is already registered in the system.')
        return
      }
    }
    setIsCheckingPhone(false)

    setStep(2)
  }

  const toggleModule = (route: string) => {
    if (route === primaryRoute) return // primary cannot be unchecked
    if (selectedModules.includes(route)) {
      setSelectedModules(selectedModules.filter(m => m !== route))
    } else {
      setSelectedModules([...selectedModules, route])
    }
  }

  const toggleTab = (tabId: string) => {
    if (tabId === 'all-modules') return
    if (selectedTabs.includes(tabId)) {
      setSelectedTabs(selectedTabs.filter(t => t !== tabId))
    } else {
      setSelectedTabs([...selectedTabs, tabId])
    }
  }

  const handlePrimaryChange = (route: string) => {
    setPrimaryRoute(route)
    if (!selectedModules.includes(route)) {
      setSelectedModules([...selectedModules, route])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!primaryRoute) {
      setError('Please select a primary department.')
      return
    }

    setIsSubmitting(true)
    const res = await appointOrUpdateDepartmentHeadAction({
      headId: existingHead?.id,
      name: name.trim(),
      phone: phone.trim(),
      phone2: phone2.trim() || undefined,
      email: email.trim() || undefined,
      password: password || undefined,
      primaryDivisionRoute: primaryRoute,
      allowedModules: Array.from(new Set([primaryRoute, ...selectedModules])),
      allowedTabs: Array.from(new Set(['all-modules', ...selectedTabs]))
    })
    setIsSubmitting(false)

    if (res.success) {
      onSuccess(res.head)
      onClose()
    } else {
      setError(res.error || 'Failed to save Department Head')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC] shrink-0">
          <div>
            <div className="text-xs font-semibold text-slate-500">Step {step} of 2</div>
            <h3 className="text-lg sm:text-xl font-bold text-[#0B1220] tracking-tight mt-0.5 font-[family-name:var(--font-heading)]">
              {isEditing ? (
                <>Edit <span className="text-[#1D4ED8]">Department Head</span></>
              ) : (
                <>Appoint <span className="text-[#1D4ED8]">Department Head</span></>
              )}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Step Progress */}
        <div className="grid grid-cols-2 gap-1.5 px-6 pt-4 shrink-0">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-[#0B1220]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-[#0B1220]' : 'bg-slate-200'}`} />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
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
                    placeholder="Enter department head name"
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              {/* 1 or 2 Phone Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Primary Phone <span className="text-rose-500">*</span>
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
                  <p className="text-xs text-slate-500 mt-1">Used for login.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-slate-800">Second Phone</label>
                    <span className="text-xs text-slate-400 font-mono">Optional</span>
                  </div>
                  <div className="flex rounded-xl border border-slate-200 focus-within:border-[#0B1220] focus-within:ring-2 focus-within:ring-[#0B1220]/10 overflow-hidden bg-[#F8FAFC] transition-all">
                    <div className="px-3.5 py-3 bg-slate-100/90 border-r border-slate-200/80 text-sm font-mono font-bold text-slate-700 flex items-center select-none">
                      +91
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone2}
                      onChange={(e) => setPhone2(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter alternate number"
                      className="w-full px-3.5 py-3 bg-transparent text-sm sm:text-base font-mono font-medium text-[#0B1220] outline-none"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Backup number.</p>
                </div>
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
                    placeholder="Enter email address (optional)"
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-800">
                    {isEditing ? 'New Password' : 'Create Password'} {!isEditing && <span className="text-rose-500">*</span>}
                  </label>
                  {isEditing && <span className="text-xs text-slate-400 font-mono">Leave blank to keep unchanged</span>}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!isEditing}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 6 characters)"
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

              {(password || !isEditing) && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-slate-800">
                      Retype Password <span className="text-rose-500">*</span>
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
                      required={!isEditing || Boolean(password)}
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
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isCheckingPhone}
                  className="w-full py-3 px-5 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {isCheckingPhone ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Mobile Numbers...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Department Access</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Primary Department */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Primary Department <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={primaryRoute}
                  onChange={(e) => handlePrimaryChange(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-bold text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all cursor-pointer"
                >
                  {purchasedCatalog.map(div => (
                    <option key={div.route} value={div.route}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Module Visibility */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Allowed Department Access
                </label>
                <p className="text-xs text-slate-500 mb-2.5">
                  Select which factory departments this in-charge can view and manage.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {purchasedCatalog.map(div => {
                    const isPrimary = div.route === primaryRoute
                    const isChecked = isPrimary || selectedModules.includes(div.route)
                    return (
                      <button
                        type="button"
                        key={div.route}
                        onClick={() => toggleModule(div.route)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#F0FDFA] border-[#14C8B4]/40 text-[#0B1220]'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#0B1220] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs sm:text-sm font-bold leading-tight line-clamp-1">
                          {div.name}
                        </span>
                        {isPrimary && (
                          <span className="text-[10px] font-bold bg-[#0B1220] text-white px-1.5 py-0.5 rounded-sm ml-auto shrink-0">
                            Primary
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Allowed Top Tabs */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Navigation Tab Visibility
                </label>
                <p className="text-xs text-slate-500 mb-2.5">
                  Select which tabs appear in this in-charge's top navigation bar.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_TOP_TABS.map(tab => {
                    const isMandatory = tab.id === 'all-modules'
                    const isChecked = isMandatory || selectedTabs.includes(tab.id)
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => toggleTab(tab.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#F0FDFA] border-[#14C8B4]/40 text-[#0B1220]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#0B1220] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs font-semibold leading-tight line-clamp-1">
                          {tab.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Update In-charge Details' : 'Appoint Department Head'}</span>
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
