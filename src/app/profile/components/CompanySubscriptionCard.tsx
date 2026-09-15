'use client'

import { useState, useTransition } from 'react'
import {
  CreditCard,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Lock
} from 'lucide-react'
import { upgradeTenantSubscriptionAction } from '../actions'

interface CompanySubscriptionCardProps {
  companyName: string
  accessType?: 'DEMO_TRIAL' | 'FULL_ACCESS'
  subscriptionTier?: string
  provisionedAt?: string
  expiresAt?: string
  isExpired?: boolean
  tenantStatus?: string
  monthlyBillingInr?: number
  isExpiredUrlParam?: boolean
}

export function CompanySubscriptionCard({
  companyName,
  accessType = 'DEMO_TRIAL',
  subscriptionTier = 'FULL_PLANT_AI',
  provisionedAt = '2026-09-15T00:00:00.000Z',
  expiresAt = '2026-09-22T00:00:00.000Z',
  isExpired = false,
  tenantStatus = 'ACTIVE',
  monthlyBillingInr = 4999,
  isExpiredUrlParam = false
}: CompanySubscriptionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'FULL_PLANT_AI' | 'MODULAR'>(
    subscriptionTier === 'MODULAR' ? 'MODULAR' : 'FULL_PLANT_AI'
  )
  const [selectedDuration, setSelectedDuration] = useState<number>(1) // months
  const [isPending, startTransition] = useTransition()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isTrial = accessType === 'DEMO_TRIAL'
  const isAccountExpired = isExpired || isExpiredUrlParam

  // Compute Days Remaining
  const now = Date.now()
  const expiryTime = expiresAt ? new Date(expiresAt).getTime() : 0
  const daysLeft = expiryTime ? Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24)) : 0

  // Format Dates
  const issueDateStr = provisionedAt ? new Date(provisionedAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : '15-Sep-2026'

  const expiryDateStr = expiresAt ? new Date(expiresAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : 'Continuous / Perpetual'

  // Pricing Calculation
  const baseMonthlyPrice = selectedTier === 'FULL_PLANT_AI' ? 4999 : 1999
  const totalAmount = selectedDuration === 12
    ? baseMonthlyPrice * 10 // 2 months free
    : (selectedDuration === 3 ? Math.round(baseMonthlyPrice * 3 * 0.9) : baseMonthlyPrice * selectedDuration)

  const handleUpgrade = () => {
    setErrorMsg(null)
    setSuccessMsg(null)

    startTransition(async () => {
      const res = await upgradeTenantSubscriptionAction({
        planTier: selectedTier,
        durationMonths: selectedDuration,
        paymentMethod: 'IN_APP_UPGRADE',
        transactionRef: `TXN-${Date.now().toString().slice(-6)}`
      })

      if (res.success) {
        setSuccessMsg(res.message || 'Subscription successfully updated!')
        setTimeout(() => {
          setIsModalOpen(false)
          setSuccessMsg(null)
          window.location.reload()
        }, 1500)
      } else {
        setErrorMsg(res.error || 'Failed to update subscription.')
      }
    })
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden transition-all">
        {/* Expired / Warning Banner */}
        {isAccountExpired && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-3.5 flex items-center justify-between gap-3 text-rose-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold">
                  Evaluation / Subscription Expired
                </p>
                <p className="text-[11px] sm:text-xs text-rose-700">
                  Access to operational manufacturing divisions is paused. Please renew or upgrade to continue.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-2xs cursor-pointer shrink-0 transition-colors"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* Card Content */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                    Subscription & License Status
                  </h2>
                  <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs">
                    {isTrial ? '7-DAY TRIAL' : 'ACTIVE PLAN'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  License entitlement, validity cycle, and operational module coverage for {companyName}
                </p>
              </div>
            </div>

            {/* Action Trigger */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs transition-all cursor-pointer w-fit self-start sm:self-center"
            >
              {isTrial ? 'Activate Subscription' : 'Renew Subscription'}
            </button>
          </div>

          {/* Details 4-Column Grid matching AdminIdentityCard reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5 pt-1">
            {/* 1. Plan Tier */}
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#3A3564]/30 hover:shadow-xs transition-all">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shrink-0 text-[#3A3564] border border-slate-200 shadow-2xs">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Plan Tier
                </span>
                <span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 mt-1 block truncate">
                  {subscriptionTier === 'FULL_PLANT_AI'
                    ? 'Full Plant AI (12 Div)'
                    : (subscriptionTier === 'MODULAR' ? 'Modular Plan' : 'Enterprise Custom')}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block font-medium">
                  ₹{monthlyBillingInr.toLocaleString('en-IN')}/month
                </span>
              </div>
            </div>

            {/* 2. Start Date */}
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#3A3564]/30 hover:shadow-xs transition-all">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shrink-0 text-[#3A3564] border border-slate-200 shadow-2xs">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Start Date
                </span>
                <span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 mt-1 block font-mono">
                  {issueDateStr}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block font-medium">
                  Account Initialized
                </span>
              </div>
            </div>

            {/* 3. Valid Until */}
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#3A3564]/30 hover:shadow-xs transition-all">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shrink-0 text-[#3A3564] border border-slate-200 shadow-2xs">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Valid Until
                </span>
                <span className={`text-xs sm:text-sm md:text-base font-bold mt-1 block font-mono ${isAccountExpired ? 'text-rose-600' : 'text-slate-900'}`}>
                  {expiryDateStr}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block font-medium">
                  {isTrial ? '7-Day Evaluation' : 'Active Cycle'}
                </span>
              </div>
            </div>

            {/* 4. Status */}
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#3A3564]/30 hover:shadow-xs transition-all">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs ${
                isAccountExpired ? 'text-rose-600' : (daysLeft <= 3 && isTrial ? 'text-amber-600' : 'text-emerald-600')
              }`}>
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Account Status
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  {isAccountExpired ? (
                    <span className="text-xs sm:text-sm md:text-base font-bold text-rose-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      Expired (Locked)
                    </span>
                  ) : daysLeft <= 3 && isTrial ? (
                    <span className="text-xs sm:text-sm md:text-base font-bold text-amber-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'} Left
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm md:text-base font-bold text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      {isTrial ? `${daysLeft} Days Trial Left` : 'Active'}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 mt-0.5 block font-medium">
                  {isAccountExpired ? 'Renewal Required' : 'All Divisions Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Upgrade / Renewal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-black/10 my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {isTrial ? 'Activate Full Enterprise License' : 'Renew Subscription Plan'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select your plan tier and duration for {companyName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isPending}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error / Success Notifications */}
            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Modal Form Body */}
            <div className="space-y-4 pt-4">
              {/* 1. Select Plan Tier */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Select License Tier
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedTier('FULL_PLANT_AI')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedTier === 'FULL_PLANT_AI'
                        ? 'border-[#3A3564] bg-[#FAF7F0] shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3A3564]">Full Plant AI</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                        12 Divisions
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 mt-1">
                      ₹4,999<span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-tight">
                      Complete end-to-end MES from Design to Central Store.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedTier('MODULAR')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedTier === 'MODULAR'
                        ? 'border-[#3A3564] bg-[#FAF7F0] shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3A3564]">Modular Plan</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                        Core Units
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 mt-1">
                      ₹1,999<span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-tight">
                      Cutting, Stitching, and Packing floor essentials.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Select Duration */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Select Billing Period
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDuration(1)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedDuration === 1
                        ? 'border-[#3A3564] bg-[#FAF7F0] text-[#3A3564] font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">1 Month</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Standard</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDuration(3)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedDuration === 3
                        ? 'border-[#3A3564] bg-[#FAF7F0] text-[#3A3564] font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">3 Months</div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-0.5">Save 10%</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDuration(12)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedDuration === 12
                        ? 'border-[#3A3564] bg-[#FAF7F0] text-[#3A3564] font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">1 Year</div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-0.5">2 Months Free</div>
                  </button>
                </div>
              </div>

              {/* 3. Order Summary Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>Selected License:</span>
                  <span className="font-bold text-slate-900">
                    {selectedTier === 'FULL_PLANT_AI' ? 'Full Plant AI' : 'Modular Plan'} ({selectedDuration} Mo)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>Factory:</span>
                  <span className="font-bold text-slate-900">{companyName}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 text-sm">Total Payable:</span>
                  <span className="font-mono font-extrabold text-[#3A3564] text-base">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Info Note */}
              <div className="text-[11px] text-slate-500 leading-relaxed bg-[#FAF7F0] p-3 rounded-xl border border-black/10">
                <p className="font-bold text-slate-800 mb-0.5">Direct Corporate Activation:</p>
                Confirming updates your workspace license immediately. Invoices are dispatched to your registered billing email with GST input credit details.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-2xs cursor-pointer transition-all disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating License...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Confirm & Activate (₹{totalAmount.toLocaleString('en-IN')})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
