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
  CheckCircle2
} from 'lucide-react'
import { DemoRequestInquiry, SubscriptionPlanTier } from '../types/platform'
import { ENTERPRISE_DIVISIONS_CATALOG } from '../data/initialPlatformData'
import { provisionTenantFactoryAction } from '../actions'

interface ProvisionTenantModalProps {
  isOpen: boolean
  onClose: () => void
  inquiry: DemoRequestInquiry | null
  onSuccess?: () => void
}

export function ProvisionTenantModal({
  isOpen,
  onClose,
  inquiry,
  onSuccess
}: ProvisionTenantModalProps) {
  const [companyName, setCompanyName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [initialPassword, setInitialPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [cityState, setCityState] = useState('')
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionPlanTier>('FULL_PLANT_AI')
  const [monthlyBillingInr, setMonthlyBillingInr] = useState(4999)
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(
    ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route)
  )

  const [provisionedSuccess, setProvisionedSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (inquiry) {
      setCompanyName(inquiry.companyName)
      setAdminName(inquiry.applicantName)
      setAdminEmail(inquiry.email)
      setPhone(inquiry.phone)
      setCityState(inquiry.cityState || 'India')
      setSubscriptionTier(inquiry.preferredPlan || 'FULL_PLANT_AI')
      setMonthlyBillingInr(inquiry.preferredPlan === 'MODULAR' ? 1999 : 4999)
      
      const cleanCompanySlug = inquiry.companyName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')
      setInitialPassword(`@${cleanCompanySlug || 'Zigza'}2026!`)
      setProvisionedSuccess(false)
    } else {
      setCompanyName('')
      setAdminName('')
      setAdminEmail('')
      setInitialPassword(`@Zigza${Math.floor(1000 + Math.random() * 9000)}!`)
      setPhone('')
      setCityState('')
      setSubscriptionTier('FULL_PLANT_AI')
      setMonthlyBillingInr(4999)
      setSelectedDivisions(ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route))
      setProvisionedSuccess(false)
    }
  }, [inquiry, isOpen])

  if (!isOpen) return null

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
        adminEmail,
        initialPassword,
        phone,
        cityState,
        subscriptionTier,
        monthlyBillingInr,
        selectedDivisions
      })

      if (res.success) {
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

  const activationSlipText = `===========================================
ZIGZA MES - CLIENT SUPER ADMIN ACTIVATION
===========================================
Factory / Company : ${companyName}
Super Admin Name  : ${adminName}
Login Portal URL  : https://app.zigza.in/login
Login Email       : ${adminEmail}
Initial Password  : ${initialPassword}
Subscription Plan : ${subscriptionTier.replace(/_/g, ' ')} (₹${monthlyBillingInr.toLocaleString()}/mo)
Allocated Units   : ${selectedDivisions.length} Manufacturing Divisions
===========================================`

  const copySlip = () => {
    navigator.clipboard.writeText(activationSlipText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
              Infrastructure Provisioning
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
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
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950 font-[family-name:var(--font-heading)]">
                  Factory Tenant Successfully Provisioned
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  The infrastructure has been allocated. Send this slip to the plant head to initiate on-floor setup.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF7F0] p-5 rounded-2xl border border-black/10 font-mono text-xs text-slate-800 space-y-2 relative">
              <div className="flex items-center justify-between border-b border-black/10 pb-2.5 mb-2.5">
                <span className="font-bold text-[#3A3564] uppercase tracking-wider text-[11px]">
                  Official Activation Credentials
                </span>
                <button
                  type="button"
                  onClick={copySlip}
                  className="px-3 py-1.5 rounded-xl bg-white border border-black/10 hover:bg-[#3A3564] hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Activation Slip'}</span>
                </button>
              </div>

              <div><strong>Company / Plant :</strong> {companyName}</div>
              <div><strong>Plant Head     :</strong> {adminName}</div>
              <div><strong>Login URL      :</strong> <span className="text-[#3A3564] font-bold">https://app.zigza.in/login</span></div>
              <div><strong>Admin Email    :</strong> <span className="text-slate-900 font-bold">{adminEmail}</span></div>
              <div><strong>Password       :</strong> <span className="bg-white px-2 py-0.5 rounded border border-black/15 font-bold text-slate-900">{initialPassword}</span></div>
              <div><strong>Plan & Billing :</strong> {subscriptionTier.replace(/_/g, ' ')} (₹{monthlyBillingInr.toLocaleString()}/mo)</div>
              <div><strong>Units Allotted :</strong> {selectedDivisions.length} Active Factory Modules</div>
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
            <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs sm:text-[13px]">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Factory / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Vardhman Textiles Garment Division"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Plant Head / Super Admin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Ashok Singhania"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Super Admin Login Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@vardhman.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98140 00112"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Plant Location (City, State)
                  </label>
                  <input
                    type="text"
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    placeholder="e.g. Tirupur, Tamil Nadu"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Plan Tiers */}
              <div className="pt-2">
                <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#3A3564] font-mono mb-2">
                  Subscription Package Tier
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handlePlanChange('FULL_PLANT_AI')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      subscriptionTier === 'FULL_PLANT_AI'
                        ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/20 shadow-2xs'
                        : 'bg-white border-black/10 hover:border-black/30'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block font-[family-name:var(--font-heading)]">Full Access + AI</span>
                    <span className="text-sm font-bold font-mono text-[#3A3564] block mt-0.5">₹4,999/mo</span>
                    <span className="text-[10px] text-slate-500 block">All 11 Divisions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanChange('MODULAR')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      subscriptionTier === 'MODULAR'
                        ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/20 shadow-2xs'
                        : 'bg-white border-black/10 hover:border-black/30'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block font-[family-name:var(--font-heading)]">Modular Floor</span>
                    <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">₹1,999/mo</span>
                    <span className="text-[10px] text-slate-500 block">1 to 3 Units</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanChange('CUSTOM')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      subscriptionTier === 'CUSTOM'
                        ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/20 shadow-2xs'
                        : 'bg-white border-black/10 hover:border-black/30'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block font-[family-name:var(--font-heading)]">Custom Enterprise</span>
                    <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">₹9,999/mo</span>
                    <span className="text-[10px] text-slate-500 block">Hardware & Telemetry</span>
                  </button>
                </div>
              </div>

              {/* Manufacturing Divisions Allocation */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#3A3564] font-mono">
                    Allot Manufacturing Divisions ({selectedDivisions.length} / 11)
                  </label>
                  <button
                    type="button"
                    onClick={selectAllDivisions}
                    className="text-xs font-mono font-bold text-[#3A3564] hover:underline cursor-pointer"
                  >
                    Select All 11
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-[#FAF7F0] rounded-2xl border border-black/10 max-h-48 overflow-y-auto">
                  {ENTERPRISE_DIVISIONS_CATALOG.map((div) => {
                    const isChecked = selectedDivisions.includes(div.route)
                    return (
                      <label
                        key={div.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-white border-[#3A3564] font-bold text-slate-900 shadow-2xs'
                            : 'bg-white/60 border-black/5 text-slate-500 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDivision(div.route)}
                          className="rounded border-slate-300 text-[#3A3564] focus:ring-[#3A3564] cursor-pointer"
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
                className="px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Provisioning Infra...' : 'Confirm & Allot Access'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
