'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Check,
  Building2,
  Key,
  ShieldCheck,
  Copy,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Mail,
  AlertTriangle
} from 'lucide-react'
import { DemoRequestInquiry, SubscriptionPlanTier, AccessType } from '../types/platform'
import { ENTERPRISE_DIVISIONS_CATALOG } from '../data/initialPlatformData'
import { provisionTenantFactoryAction } from '../actions'

interface ProvisionTenantModalProps {
  isOpen: boolean
  onClose: () => void
  inquiry: DemoRequestInquiry | null
  onSuccess?: () => void
}

function deriveUsername(company: string) {
  const clean = company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return clean ? `${clean}_admin` : 'client_admin'
}

function deriveInitialPassword(company: string) {
  const cleanSlug = company.trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')
  const cap = cleanSlug ? cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1).toLowerCase() : 'Zigza'
  return `@${cap}2026!`
}

export function ProvisionTenantModal({
  isOpen,
  onClose,
  inquiry,
  onSuccess
}: ProvisionTenantModalProps) {
  const [companyName, setCompanyName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [customUsername, setCustomUsername] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [initialPassword, setInitialPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [cityState, setCityState] = useState('')
  const [accessType, setAccessType] = useState<AccessType>('DEMO_TRIAL')
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionPlanTier>('FULL_PLANT_AI')
  const [monthlyBillingInr, setMonthlyBillingInr] = useState(4999)
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(
    ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route)
  )

  const [provisionedSuccess, setProvisionedSuccess] = useState(false)
  const [emailDispatchResult, setEmailDispatchResult] = useState<{
    sent: boolean
    simulated?: boolean
    error?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (inquiry) {
      setCompanyName(inquiry.companyName)
      setAdminName(inquiry.applicantName)
      setCustomUsername(deriveUsername(inquiry.companyName))
      setAdminEmail(inquiry.email)
      setPhone(inquiry.phone)
      setCityState(inquiry.cityState || 'India')
      setAccessType('DEMO_TRIAL')
      setSubscriptionTier(inquiry.preferredPlan || 'FULL_PLANT_AI')
      setMonthlyBillingInr(inquiry.preferredPlan === 'MODULAR' ? 1999 : 4999)
      setInitialPassword(deriveInitialPassword(inquiry.companyName))
      setSelectedDivisions(ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route))
      setProvisionedSuccess(false)
      setEmailDispatchResult(null)
    } else {
      setCompanyName('')
      setAdminName('')
      setCustomUsername('client_admin')
      setAdminEmail('')
      setInitialPassword(`@Zigza${Math.floor(1000 + Math.random() * 9000)}!`)
      setPhone('')
      setCityState('')
      setAccessType('FULL_ACCESS')
      setSubscriptionTier('FULL_PLANT_AI')
      setMonthlyBillingInr(4999)
      setSelectedDivisions(ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route))
      setProvisionedSuccess(false)
      setEmailDispatchResult(null)
    }
  }, [inquiry, isOpen])

  if (!isOpen) return null

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value)
    // Only auto-update custom username and password if user hasn't explicitly customized it
    if (!customUsername || customUsername.endsWith('_admin')) {
      setCustomUsername(deriveUsername(value))
    }
    if (!initialPassword || initialPassword.startsWith('@')) {
      setInitialPassword(deriveInitialPassword(value))
    }
  }

  const toggleDivision = (route: string) => {
    setSelectedDivisions(prev =>
      prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]
    )
  }

  const selectAllDivisions = () => {
    setSelectedDivisions(ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route))
  }

  const handlePlanChange = (plan: SubscriptionPlanTier) => {
    setSubscriptionTier(plan)
    if (plan === 'FULL_PLANT_AI') {
      setMonthlyBillingInr(4999)
      selectAllDivisions()
    } else if (plan === 'MODULAR') {
      setMonthlyBillingInr(1999)
      setSelectedDivisions(['/cutting', '/stitching-sewing', '/ready-goods'])
    } else {
      setMonthlyBillingInr(9999)
      selectAllDivisions()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDivisions.length === 0) {
      alert('Please select at least 1 production division to allocate.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await provisionTenantFactoryAction({
        demoRequestId: inquiry?.id,
        companyName,
        adminName,
        customUsername,
        adminEmail,
        initialPassword,
        phone,
        cityState,
        accessType,
        subscriptionTier,
        monthlyBillingInr,
        selectedDivisions
      })

      if (res.success) {
        setEmailDispatchResult(res.emailStatus || null)
        setProvisionedSuccess(true)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        alert(res.error || 'Failed to provision tenant')
      }
    } catch (err: any) {
      console.error('Provisioning error:', err)
      alert('An unexpected error occurred while provisioning tenant.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const trialExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const activationSlipText = `===========================================
ZIGZA MES - CLIENT SUPER ADMIN ACTIVATION
===========================================
Factory / Company : ${companyName}
Super Admin Name  : ${adminName}
Access Model      : ${accessType === 'DEMO_TRIAL' ? `7-Day Demo Trial (Expires: ${trialExpiryDate})` : 'Full Enterprise Access'}
Custom Username   : ${customUsername}
Login Email       : ${adminEmail}
Initial Password  : ${initialPassword}
Login Portal URL  : https://app.zigza.in/login
Subscription Plan : ${subscriptionTier.replace(/_/g, ' ')} (₹${monthlyBillingInr.toLocaleString()}/mo)
Allocated Units   : ${selectedDivisions.length} of ${ENTERPRISE_DIVISIONS_CATALOG.length} Manufacturing Divisions
===========================================`

  const copySlip = () => {
    navigator.clipboard.writeText(activationSlipText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
              Access Management
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight font-[family-name:var(--font-heading)]">
              {provisionedSuccess ? 'Access Activation Slip Ready' : 'Provision Client Super Admin'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {provisionedSuccess ? (
          /* Success Activation Slip View */
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950 font-[family-name:var(--font-heading)]">
                  Factory Tenant Successfully Provisioned
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                  Infrastructure allocated. Official activation credentials have been generated.
                </p>
              </div>
            </div>

            {/* Resend Email Status Box */}
            {emailDispatchResult?.simulated ? (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-amber-950">Email Delivery Simulated:</div>
                  <div className="text-amber-800 mt-0.5 leading-relaxed font-sans text-xs">
                    RESEND_API_KEY is not configured in .env.local, so no live email was sent to <span className="font-mono font-semibold">{adminEmail}</span>. The tenant account has been provisioned in the database. Copy the activation credentials below or configure RESEND_API_KEY for live delivery.
                  </div>
                </div>
              </div>
            ) : emailDispatchResult?.sent ? (
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-emerald-950">Live Activation Email Dispatched:</div>
                  <div className="text-emerald-800 mt-0.5 leading-relaxed font-sans text-xs">
                    Activation credentials have been successfully transmitted to <span className="font-mono font-semibold">{adminEmail}</span> via Resend.
                  </div>
                </div>
              </div>
            ) : emailDispatchResult?.error ? (
              <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-start gap-3 text-xs text-rose-900 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-rose-950">Email Dispatch Notice:</div>
                  <div className="text-rose-800 mt-0.5 leading-relaxed font-sans text-xs">
                    {emailDispatchResult.error}. Use the activation slip below for manual credential delivery.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center gap-3 text-xs text-slate-800 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-white border border-black/10 text-[#3A3564] flex items-center justify-center shrink-0 shadow-2xs">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900">Resend Automated Notification:</div>
                  <div className="text-slate-600 truncate mt-0.5 font-mono text-xs">
                    Credentials generated. Ready to deliver to {adminEmail}.
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#FAF7F0] p-5 rounded-2xl border border-black/10 font-mono text-xs text-slate-800 space-y-2.5 relative">
              <div className="flex items-center justify-between border-b border-black/10 pb-2.5 mb-2.5">
                <span className="font-bold text-[#3A3564] uppercase tracking-wider text-xs">
                  Official Activation Credentials
                </span>
                <button
                  type="button"
                  onClick={copySlip}
                  className="px-3 py-1.5 rounded-xl bg-white border border-black/10 hover:bg-[#3A3564] hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Activation Slip'}</span>
                </button>
              </div>

              <div><strong>Company / Plant :</strong> {companyName}</div>
              <div><strong>Plant Head     :</strong> {adminName}</div>
              <div><strong>Access Model   :</strong> <span className={accessType === 'DEMO_TRIAL' ? 'text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200' : 'text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200'}>{accessType === 'DEMO_TRIAL' ? `7-Day Demo Trial (Expires: ${trialExpiryDate})` : 'Full Enterprise Access'}</span></div>
              <div><strong>Custom Username:</strong> <span className="text-[#3A3564] font-bold bg-white px-2 py-0.5 rounded border border-black/15">{customUsername}</span></div>
              <div><strong>Login URL      :</strong> <span className="text-[#3A3564] font-bold">https://app.zigza.in/login</span></div>
              <div><strong>Login Email    :</strong> <span className="text-slate-900 font-bold">{adminEmail}</span></div>
              <div><strong>Password       :</strong> <span className="bg-white px-2 py-0.5 rounded border border-black/15 font-bold text-slate-900">{initialPassword}</span></div>
              <div><strong>Plan & Billing :</strong> {subscriptionTier.replace(/_/g, ' ')} (₹{monthlyBillingInr.toLocaleString()}/mo)</div>
              <div><strong>Units Allotted :</strong> {selectedDivisions.length} of {ENTERPRISE_DIVISIONS_CATALOG.length} Active Factory Modules</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer active:scale-[0.98]"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit}>
            <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4.5 text-sm">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Factory / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    placeholder="Vardhman Textiles Garment Division"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Plant Head / Super Admin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Ashok Singhania"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Custom Username & Client Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Custom Username (Generated) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="vardhman_admin"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-[#3A3564] outline-none shadow-2xs transition-all"
                  />
                  <span className="text-xs text-slate-500 mt-1 block font-medium">
                    Derived from company name. Client can sign in with this or email.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Super Admin Email (Recipient) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@vardhman.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                  />
                  <span className="text-xs text-slate-500 mt-1 block font-medium">
                    Resend will dispatch credentials here from noreply@zigza.in.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Initial Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex bg-slate-50/70 hover:bg-white focus-within:bg-white border border-slate-200 focus-within:border-[#3A3564] focus-within:ring-2 focus-within:ring-[#3A3564]/10 rounded-xl overflow-hidden shadow-2xs transition-all">
                    <div className="flex items-center justify-center px-3 bg-slate-100/80 border-r border-slate-200 text-slate-700 font-mono font-bold text-xs select-none shrink-0">
                      +91
                    </div>
                    <input
                      type="text"
                      required
                      value={phone.replace(/^\+91\s*/, '')}
                      onChange={(e) => {
                        let digits = e.target.value.replace(/\D/g, '')
                        if (digits.length > 10 && digits.startsWith('91')) {
                          digits = digits.slice(2)
                        }
                        if (digits.length > 10 && digits.startsWith('0')) {
                          digits = digits.slice(1)
                        }
                        digits = digits.slice(0, 10)
                        let formatted = digits
                        if (digits.length > 5) {
                          formatted = `${digits.slice(0, 5)} ${digits.slice(5)}`
                        }
                        setPhone(formatted ? `+91 ${formatted}` : '')
                      }}
                      placeholder="98140 00112"
                      className="w-full px-3.5 py-2.5 bg-transparent text-sm font-mono font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Plant Location (City, State)
                </label>
                <input
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="Tirupur, Tamil Nadu"
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                />
              </div>

              {/* Access Tier Model Selection */}
              <div className="pt-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Access Tier Model <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccessType('DEMO_TRIAL')}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      accessType === 'DEMO_TRIAL'
                        ? 'bg-[#FAF7F0] border-amber-400 ring-2 ring-amber-400/20 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-amber-950 font-[family-name:var(--font-heading)]">
                        7-Day Demo Trial
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                        Revocable
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/80 mt-1 leading-relaxed font-medium">
                      7 days trial access. Free evaluation. Can be revoked anytime if payment is not completed.
                    </p>
                    <span className="text-[11px] font-mono font-bold text-amber-800 block mt-2.5">
                      Auto-expires in 7 days ({trialExpiryDate})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessType('FULL_ACCESS')}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      accessType === 'FULL_ACCESS'
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-950 font-[family-name:var(--font-heading)]">
                        Full Access (Paid)
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                        Contracted
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed font-medium">
                      Unrestricted production manufacturing access. Regular monthly billing active.
                    </p>
                    <span className="text-[11px] font-mono font-bold text-emerald-800 block mt-2.5">
                      Active Enterprise Contract
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Tiers */}
              <div className="pt-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Subscription Package Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePlanChange('FULL_PLANT_AI')}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      subscriptionTier === 'FULL_PLANT_AI'
                        ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/20 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-900 block font-[family-name:var(--font-heading)]">Full Access + AI</span>
                    <span className="text-sm font-extrabold font-mono text-[#3A3564] block mt-0.5">₹4,999/mo</span>
                    <span className="text-xs text-slate-500 block mt-0.5 font-medium">All 12 Divisions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanChange('MODULAR')}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      subscriptionTier === 'MODULAR'
                        ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/20 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-900 block font-[family-name:var(--font-heading)]">Modular Floor</span>
                    <span className="text-sm font-extrabold font-mono text-slate-900 block mt-0.5">₹1,999/mo</span>
                    <span className="text-xs text-slate-500 block mt-0.5 font-medium">1 to 3 Units</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanChange('CUSTOM')}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      subscriptionTier === 'CUSTOM'
                        ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/20 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-900 block font-[family-name:var(--font-heading)]">Custom Enterprise</span>
                    <span className="text-sm font-extrabold font-mono text-slate-900 block mt-0.5">₹9,999/mo</span>
                    <span className="text-xs text-slate-500 block mt-0.5 font-medium">Hardware & Telemetry</span>
                  </button>
                </div>
              </div>

              {/* Manufacturing Divisions Allocation */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Allot Manufacturing Divisions ({selectedDivisions.length} / {ENTERPRISE_DIVISIONS_CATALOG.length})
                  </label>
                  <button
                    type="button"
                    onClick={selectAllDivisions}
                    className="text-xs font-bold text-[#3A3564] hover:underline cursor-pointer"
                  >
                    Select All {ENTERPRISE_DIVISIONS_CATALOG.length}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 bg-[#FAF7F0] rounded-2xl border border-black/10 max-h-52 overflow-y-auto">
                  {ENTERPRISE_DIVISIONS_CATALOG.map((div) => {
                    const isChecked = selectedDivisions.includes(div.route)
                    return (
                      <label
                        key={div.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-white border-[#3A3564] font-bold text-slate-900 shadow-2xs'
                            : 'bg-white/60 border-black/5 text-slate-500 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDivision(div.route)}
                          className="w-4 h-4 rounded border-slate-300 text-[#3A3564] focus:ring-[#3A3564] cursor-pointer"
                        />
                        <span className="truncate">
                          {div.code}. {div.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Provisioning Infra...' : 'Confirm & Allot Access'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
