'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Key,
  ChevronLeft,
  Building2,
  ShieldCheck,
  Check,
  Copy,
  Layers,
  Sparkles,
  ExternalLink,
  Zap,
  ArrowRight
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { SubscriptionPlanTier } from '../types/platform'
import { ENTERPRISE_DIVISIONS_CATALOG } from '../data/initialPlatformData'
import { provisionNewTenant } from '../utils/platformStorage'

export default function ProvisioningConsolePage() {
  const [companyName, setCompanyName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [initialPassword, setInitialPassword] = useState('@Factory2026!')
  const [phone, setPhone] = useState('')
  const [cityState, setCityState] = useState('Tirupur, Tamil Nadu')
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionPlanTier>('FULL_PLANT_AI')
  const [monthlyBillingInr, setMonthlyBillingInr] = useState(4999)
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(
    ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route)
  )

  const [provisionedSuccess, setProvisionedSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleDivision = (route: string) => {
    setSelectedDivisions(prev =>
      prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]
    )
  }

  const selectAllDivisions = () => {
    setSelectedDivisions(ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route))
  }

  const handlePlanSelect = (tier: SubscriptionPlanTier) => {
    setSubscriptionTier(tier)
    if (tier === 'FULL_PLANT_AI') {
      setMonthlyBillingInr(4999)
      selectAllDivisions()
    } else if (tier === 'MODULAR') {
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
      alert('Please select at least 1 division module.')
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
        selectedDivisions
      })
      setProvisionedSuccess(true)
    } catch (err) {
      console.error('Provisioning failed:', err)
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
    <PlatformAdminShell userEmail="admin@zigza.in">
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl w-full mx-auto select-none">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/platform-admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Platform Command</span>
          </Link>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Tenant Infrastructure Provisioning Gate
          </span>
        </div>

        {/* Header Banner */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#3A3564]/10 text-[#3A3564] border border-[#3A3564]/20">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Infrastructure Provisioning Console
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider">
                  Super Admin Credentials Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                Configure client factory credentials, allocate specific division units, and generate instant activation slips
              </p>
            </div>
          </div>

          <Link
            href="/platform-admin/tenants"
            className="px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-700 text-xs font-mono font-bold hover:bg-slate-50 transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>View All Tenants</span>
          </Link>
        </div>

        {provisionedSuccess ? (
          /* Activation Slip Success State */
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-black/10 shadow-2xs space-y-6">
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-950">
                  Factory Super Admin Successfully Provisioned!
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  The infrastructure has been allotted. Send this activation slip to the client plant head to initiate on-floor setup.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF7F0] p-6 rounded-xl border border-black/10 font-mono text-xs text-slate-800 space-y-2 relative">
              <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-3">
                <span className="font-bold text-[#3A3564] uppercase tracking-wider text-sm">
                  Official Access Activation Slip
                </span>
                <button
                  type="button"
                  onClick={copySlip}
                  className="px-3 py-1.5 rounded-lg bg-white border border-black/10 hover:bg-[#3A3564] hover:text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Activation Slip'}</span>
                </button>
              </div>

              <div><strong>Company / Factory Name :</strong> {companyName}</div>
              <div><strong>Designated Plant Head  :</strong> {adminName}</div>
              <div><strong>Sign-In Web Portal     :</strong> <span className="text-[#3A3564] font-bold">https://app.zigza.in/login</span></div>
              <div><strong>Registered Admin Email :</strong> <span className="text-slate-900 font-bold">{adminEmail}</span></div>
              <div><strong>Initial Setup Password :</strong> <span className="bg-white px-2 py-0.5 rounded border border-black/15 font-black text-slate-900">{initialPassword}</span></div>
              <div><strong>Subscription Package   :</strong> {subscriptionTier.replace(/_/g, ' ')} (₹{monthlyBillingInr.toLocaleString()} / month)</div>
              <div><strong>Allocated Divisions    :</strong> {selectedDivisions.length} Active Factory Modules</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setProvisionedSuccess(false)
                  setCompanyName('')
                  setAdminName('')
                  setAdminEmail('')
                }}
                className="px-4 py-2 rounded-xl border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Provision Another Factory
              </button>

              <Link
                href="/platform-admin"
                className="px-5 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-mono font-bold hover:bg-[#2e2a52] transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Back to Leads Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form Console */
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-black/10 shadow-2xs space-y-6">
            
            <div className="border-b border-black/5 pb-3">
              <h3 className="text-base font-black text-slate-900">
                1. Factory Details & Tenant Super Admin Identity
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Primary contact person and commercial organization
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Company / Factory Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Vardhman Textiles Garment Division"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Super Admin / Plant Head Name *
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Ashok Singhania"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Super Admin Login Email *
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@vardhman.com"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Initial Temporary Password *
                </label>
                <input
                  type="text"
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Phone / WhatsApp Contact *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98140 00112"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Plant Location (City, State)
                </label>
                <input
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="e.g. Baddi, Himachal Pradesh"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>
            </div>

            {/* Plan Tier Selection */}
            <div className="border-t border-black/5 pt-4">
              <label className="block text-xs font-mono font-black uppercase text-[#3A3564] tracking-wider mb-2">
                2. Select Subscription Package
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => handlePlanSelect('FULL_PLANT_AI')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    subscriptionTier === 'FULL_PLANT_AI'
                      ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/30 shadow-xs'
                      : 'bg-white border-black/10 hover:border-black/30'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">Full Access + Zigza AI</span>
                  <span className="text-lg font-black font-mono text-[#3A3564] block mt-1">₹4,999<span className="text-xs font-normal text-slate-500">/mo</span></span>
                  <span className="text-[11px] text-slate-500 block mt-1">All 11 Divisions + AI Floor Assistant</span>
                </div>

                <div
                  onClick={() => handlePlanSelect('MODULAR')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    subscriptionTier === 'MODULAR'
                      ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/30 shadow-xs'
                      : 'bg-white border-black/10 hover:border-black/30'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">Modular Floor</span>
                  <span className="text-lg font-black font-mono text-slate-900 block mt-1">₹1,999<span className="text-xs font-normal text-slate-500">/mo</span></span>
                  <span className="text-[11px] text-slate-500 block mt-1">Select 1 to 3 Production Units</span>
                </div>

                <div
                  onClick={() => handlePlanSelect('CUSTOM')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    subscriptionTier === 'CUSTOM'
                      ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/30 shadow-xs'
                      : 'bg-white border-black/10 hover:border-black/30'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">Custom Engineering</span>
                  <span className="text-lg font-black font-mono text-slate-900 block mt-1">₹9,999<span className="text-xs font-normal text-slate-500">/mo</span></span>
                  <span className="text-[11px] text-slate-500 block mt-1">Custom Telemetry & Hardware Sync</span>
                </div>
              </div>
            </div>

            {/* Division Modules Checklist */}
            <div className="border-t border-black/5 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black uppercase text-[#3A3564] tracking-wider">
                  3. Allot Manufacturing Divisions ({selectedDivisions.length} / 11 Selected)
                </span>
                <button
                  type="button"
                  onClick={selectAllDivisions}
                  className="text-xs font-mono font-bold text-[#3A3564] hover:underline cursor-pointer"
                >
                  Select All 11 Divisions
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 p-3 bg-[#FAF7F0] rounded-xl border border-black/10">
                {ENTERPRISE_DIVISIONS_CATALOG.map((div) => {
                  const isChecked = selectedDivisions.includes(div.route)
                  return (
                    <label
                      key={div.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
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

            {/* Submit Action */}
            <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-[#3A3564] text-white text-xs font-mono font-bold hover:bg-[#2e2a52] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>{isSubmitting ? 'Provisioning Infrastructure...' : 'Provision Client Super Admin'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </PlatformAdminShell>
  )
}
