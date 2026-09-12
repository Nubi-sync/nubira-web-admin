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
import { provisionNewTenant } from '../utils/platformStorage'

interface ProvisionTenantModalProps {
  isOpen: boolean
  onClose: () => void
  inquiry: DemoRequestInquiry | null
}

export function ProvisionTenantModal({
  isOpen,
  onClose,
  inquiry
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDivisions.length === 0) {
      alert('Please select at least 1 division module for this factory.')
      return
    }

    setIsSubmitting(true)
    try {
      provisionNewTenant({
        companyName,
        adminName,
        adminEmail,
        initialPassword,
        phone,
        cityState,
        subscriptionTier,
        monthlyBillingInr,
        selectedDivisions,
        demoRequestId: inquiry?.id
      })
      setProvisionedSuccess(true)
    } catch (err) {
      console.error('Failed to provision tenant:', err)
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

  const copyActivationSlip = () => {
    navigator.clipboard.writeText(activationSlipText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564]/10 text-[#3A3564] flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Provision Factory Super Admin
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Grant New Client Tenant Infrastructure & Division Modules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-black/10 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {provisionedSuccess ? (
          /* Success Activation Slip State */
          <div className="space-y-4">
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-950">
                  Tenant Infrastructure Provisioned Successfully!
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  The Super Admin credentials have been generated and the {selectedDivisions.length} divisions are activated.
                </p>
              </div>
            </div>

            {/* Formatted Activation Slip */}
            <div className="bg-[#FAF7F0] p-4 rounded-xl border border-black/10 font-mono text-xs text-slate-800 space-y-1.5 relative">
              <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-2 font-bold">
                <span className="text-[#3A3564] uppercase tracking-wider">Access Activation Credentials</span>
                <button
                  type="button"
                  onClick={copyActivationSlip}
                  className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-[#3A3564] hover:text-white text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Activation Slip'}</span>
                </button>
              </div>

              <div><strong>Company:</strong> {companyName}</div>
              <div><strong>Admin Name:</strong> {adminName}</div>
              <div><strong>Login Email:</strong> <span className="text-[#3A3564] font-bold">{adminEmail}</span></div>
              <div><strong>Password:</strong> <span className="bg-white px-2 py-0.5 rounded border border-black/10 font-black">{initialPassword}</span></div>
              <div><strong>Plan Tier:</strong> {subscriptionTier.replace(/_/g, ' ')} (₹{monthlyBillingInr.toLocaleString()}/mo)</div>
              <div><strong>Active Units:</strong> {selectedDivisions.length} of 11 Divisions Granted</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-mono font-bold hover:bg-[#2e2a52] transition-colors shadow-xs cursor-pointer"
              >
                Done / Back to Leads
              </button>
            </div>
          </div>
        ) : (
          /* Provisioning Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                  Company / Factory Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Knits India Pvt. Ltd."
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                  Plant Head / Owner Name *
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rao"
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                  Tenant Super Admin Email *
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="owner@factory.com"
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                  Initial Login Password *
                </label>
                <input
                  type="text"
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  placeholder="@Factory2026!"
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                  Location (City, State)
                </label>
                <input
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="Tirupur, Tamil Nadu"
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={subscriptionTier}
                  onChange={(e) => handlePlanChange(e.target.value as SubscriptionPlanTier)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564] cursor-pointer"
                >
                  <option value="FULL_PLANT_AI">Full Access + Zigza AI (₹4,999)</option>
                  <option value="MODULAR">Modular Floor (₹1,999)</option>
                  <option value="CUSTOM">Custom Enterprise (₹9,999)</option>
                </select>
              </div>
            </div>

            {/* Division Modules Selection Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black uppercase text-[#3A3564] tracking-wider">
                  Select Active Manufacturing Divisions ({selectedDivisions.length}/11)
                </span>
                <button
                  type="button"
                  onClick={selectAllDivisions}
                  className="text-[11px] font-mono font-bold text-[#3A3564] hover:underline cursor-pointer"
                >
                  Select All 11 Units
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-[#FAF7F0] rounded-xl border border-black/10">
                {ENTERPRISE_DIVISIONS_CATALOG.map((div) => {
                  const isChecked = selectedDivisions.includes(div.route)
                  return (
                    <label
                      key={div.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
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
                        {div.code}. {div.name.split(' ')[0]}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-mono font-bold hover:bg-[#2e2a52] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>{isSubmitting ? 'Provisioning...' : 'Provision Super Admin Access'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  )
}
