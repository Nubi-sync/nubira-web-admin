'use client'

import React, { useState, useEffect } from 'react'
import { X, User, Phone, Mail, Lock, ArrowRight, ArrowLeft, Loader2, Layers, CheckSquare, Square, Shield, Eye } from 'lucide-react'
import { appointOrUpdateDepartmentHeadAction, DepartmentHeadItem } from '../actions'
import { DEPARTMENT_HEADS_CATALOG } from '@/lib/access-control'

interface AppointDepartmentHeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
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

  // Step 2: Department & Permissions
  const [primaryRoute, setPrimaryRoute] = useState('')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [selectedTabs, setSelectedTabs] = useState<string[]>(['all-modules'])

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only allow divisions the company has purchased
  const purchasedCatalog = DEPARTMENT_HEADS_CATALOG.filter(d => allowedDivisions.includes(d.route))

  useEffect(() => {
    if (existingHead) {
      setName(existingHead.displayName || existingHead.username)
      setPhone(existingHead.phone || '')
      setPhone2(existingHead.phone2 || '')
      setEmail(existingHead.email?.endsWith('.local') ? '' : (existingHead.email || ''))
      setPassword('')
      setConfirmPassword('')
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
      const defaultRoute = initialDivisionRoute && allowedDivisions.includes(initialDivisionRoute)
        ? initialDivisionRoute
        : (purchasedCatalog[0]?.route || '/cutting')
      setPrimaryRoute(defaultRoute)
      setSelectedModules([defaultRoute])
      setSelectedTabs(['all-modules'])
    }
    setStep(1)
    setError(null)
  }, [existingHead, initialDivisionRoute, isOpen])

  if (!isOpen) return null

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const cleanPhone2 = phone2.replace(/\D/g, '').slice(-10)

    if (!name.trim()) {
      setError('Please enter the full name.')
      return
    }
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit primary mobile number.')
      return
    }
    if (phone2 && cleanPhone2.length !== 10) {
      setError('Secondary phone number must be 10 digits.')
      return
    }

    if (!isEditing) {
      if (!password || password.length < 6) {
        setError('Initial password must be at least 6 characters.')
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
    if (tabId === 'all-modules') return // all-modules is always present
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
      onSuccess()
      onClose()
    } else {
      setError(res.error || 'Failed to save Department Head')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#14C8B4] text-[#0B1220]">
                Level 3 Authority
              </span>
              <span className="text-[11px] font-mono text-slate-400">Step {step} of 2</span>
            </div>
            <h3 className="text-base font-extrabold text-[#0B1220] tracking-tight mt-1 font-[family-name:var(--font-heading)]">
              {isEditing ? 'Edit Department Head' : 'Assign Department Head'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Step Progress */}
        <div className="grid grid-cols-2 gap-1 px-6 pt-3 shrink-0">
          <div className={`h-1 rounded-full transition-all ${step >= 1 ? 'bg-[#14C8B4]' : 'bg-slate-200'}`} />
          <div className={`h-1 rounded-full transition-all ${step >= 2 ? 'bg-[#14C8B4]' : 'bg-slate-200'}`} />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Verma"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium text-[#0B1220] border border-slate-200 focus:border-[#14C8B4] focus:ring-2 focus:ring-[#14C8B4]/20 rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              {/* 1 or 2 Phone Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Primary Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit number"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-mono font-medium text-[#0B1220] border border-slate-200 focus:border-[#14C8B4] focus:ring-2 focus:ring-[#14C8B4]/20 rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Second Phone</label>
                    <span className="text-[10px] text-slate-400 font-mono">Optional</span>
                  </div>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone2}
                      onChange={(e) => setPhone2(e.target.value.replace(/\D/g, ''))}
                      placeholder="Alternate phone"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-mono font-medium text-[#0B1220] border border-slate-200 focus:border-[#14C8B4] focus:ring-2 focus:ring-[#14C8B4]/20 rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <span className="text-[10px] text-slate-400 font-mono">Optional</span>
                </div>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. head@factory.com (optional)"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium text-[#0B1220] border border-slate-200 focus:border-[#14C8B4] focus:ring-2 focus:ring-[#14C8B4]/20 rounded-xl outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isEditing ? 'New Password' : 'Password'} {!isEditing && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      required={!isEditing}
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isEditing ? 'Keep unchanged' : 'Min 6 chars'}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium text-[#0B1220] border border-slate-200 focus:border-[#14C8B4] focus:ring-2 focus:ring-[#14C8B4]/20 rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Retype Password {!isEditing && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      required={!isEditing || !!password}
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={isEditing ? 'Confirm if changed' : 'Repeat password'}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium text-[#0B1220] border border-slate-200 focus:border-[#14C8B4] focus:ring-2 focus:ring-[#14C8B4]/20 rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>Continue to Permissions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Primary Department Selection (Purchased only) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Primary Department <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={primaryRoute}
                  onChange={(e) => handlePrimaryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-[#0B1220] border border-slate-200 focus:border-[#14C8B4] focus:ring-2 focus:ring-[#14C8B4]/20 rounded-xl outline-none transition-all cursor-pointer"
                >
                  {purchasedCatalog.map(div => (
                    <option key={div.route} value={div.route}>
                      {div.name} ({div.defaultDesignation})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Only includes modules purchased by your organization.
                </p>
              </div>

              {/* Modules Visible in Modules Hub */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Visible Modules in Hub
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedModules.length} Selected
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                  {purchasedCatalog.map(div => {
                    const isChecked = selectedModules.includes(div.route)
                    const isPrimary = div.route === primaryRoute

                    return (
                      <button
                        key={div.route}
                        type="button"
                        onClick={() => toggleModule(div.route)}
                        disabled={isPrimary}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium transition-all ${
                          isChecked
                            ? 'bg-white border border-[#14C8B4]/40 text-[#0B1220] shadow-2xs'
                            : 'text-slate-500 hover:bg-white/60 border border-transparent'
                        } ${isPrimary ? 'opacity-90' : 'cursor-pointer'}`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#14C8B4] shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className="truncate">{div.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Top Navigation Tabs Visibility */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Top Navigation Tabs Visibility
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedTabs.length} of {ALL_TOP_TABS.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                  {ALL_TOP_TABS.map(tab => {
                    const isChecked = selectedTabs.includes(tab.id)
                    const isMandatory = tab.id === 'all-modules'

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => toggleTab(tab.id)}
                        disabled={isMandatory}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium transition-all ${
                          isChecked
                            ? 'bg-white border border-[#0B1220]/20 text-[#0B1220] shadow-2xs font-semibold'
                            : 'text-slate-400 hover:bg-white/60 border border-transparent'
                        } ${isMandatory ? 'opacity-80' : 'cursor-pointer'}`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#0B1220] shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className="truncate">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Limits the top horizontal bar to only these selected tabs.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Update Department Head' : 'Assign Department Head'}</span>
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
