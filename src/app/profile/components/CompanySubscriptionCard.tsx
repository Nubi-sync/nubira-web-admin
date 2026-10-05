'use client'

import { useState, useTransition, useEffect } from 'react'
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
  accessType = 'FULL_ACCESS',
  subscriptionTier = 'FULL_PLANT_AI',
  provisionedAt,
  expiresAt,
  isExpired = false,
  tenantStatus = 'ACTIVE',
  monthlyBillingInr = 4999,
  isExpiredUrlParam = false
}: CompanySubscriptionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOpeningModal, setIsOpeningModal] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const activePlanTier = subscriptionTier === 'MODULAR' ? 'MODULAR' : 'FULL_PLANT_AI'
  const [selectedDuration, setSelectedDuration] = useState<number>(1) // months
  const [isPending, startTransition] = useTransition()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Trigger 3-second blinking border animation if redirected from "Click here to recharge" button
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const shouldHighlight = 
        url.searchParams.get('highlight') === 'subscription' || 
        window.location.hash === '#subscription'

      if (shouldHighlight) {
        setIsHighlighted(true)
        setTimeout(() => {
          document.getElementById('active-subscription-btn')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 150)

        const timer = setTimeout(() => {
          setIsHighlighted(false)
        }, 3000)

        return () => clearTimeout(timer)
      }
    }
  }, [])

  const isTrial = accessType === 'DEMO_TRIAL'
  const isAccountExpired = isExpired || isExpiredUrlParam

  const baseProvisionedTime = provisionedAt ? new Date(provisionedAt).getTime() : Date.now()
  const effectiveExpiresAt = expiresAt || (
    isTrial
      ? new Date(baseProvisionedTime + 7 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(baseProvisionedTime + 30 * 24 * 60 * 60 * 1000).toISOString()
  )

  // Compute Days Remaining
  const now = Date.now()
  const expiryTime = effectiveExpiresAt ? new Date(effectiveExpiresAt).getTime() : 0
  const daysLeft = expiryTime ? Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24)) : 0

  // Format Dates
  const issueDateStr = provisionedAt ? new Date(provisionedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const expiryDateStr = effectiveExpiresAt ? new Date(effectiveExpiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Continuous / Perpetual'

  // Pricing Calculation based on factory's active/requested tier
  const baseMonthlyPrice = monthlyBillingInr || (activePlanTier === 'FULL_PLANT_AI' ? 4999 : 1999)
  const totalAmount = selectedDuration === 12
    ? baseMonthlyPrice * 10 // 2 months free
    : (selectedDuration === 3 ? Math.round(baseMonthlyPrice * 3 * 0.9) : baseMonthlyPrice * selectedDuration)

  const handleUpgrade = () => {
    setErrorMsg(null)
    setSuccessMsg(null)

    startTransition(async () => {
      const res = await upgradeTenantSubscriptionAction({
        planTier: activePlanTier,
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all">
        {/* Expired / Warning Banner */}
        {isAccountExpired && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-extrabold">
                  Evaluation / Subscription Expired
                </p>
                <p className="text-xs sm:text-sm text-rose-700 font-medium">
                  Access to operational manufacturing divisions is paused. Please renew or upgrade to continue.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm sm:text-base font-bold hover:bg-rose-700 active:scale-[0.98] shadow-2xs cursor-pointer shrink-0 transition-all text-center"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* Card Content */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                <CreditCard className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1220] tracking-tight font-[family-name:var(--font-heading)]">
                    Subscription & <span className="text-[#1D4ED8]">License</span> Status
                  </h2>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs">
                    {isTrial ? '7-DAY TRIAL' : 'ACTIVE PLAN'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
                  License entitlement, validity cycle, and operational module coverage for {companyName}
                </p>
              </div>
            </div>

            {/* Action Trigger with 3-second outer border blinking animation */}
            <div className="relative inline-flex shrink-0 w-full sm:w-auto">
              {isHighlighted && (
                <span 
                  className="absolute -inset-1 rounded-2xl bg-[#1D4ED8] pointer-events-none"
                  style={{
                    animation: 'subBorderBlink 0.5s ease-in-out infinite alternate',
                    boxShadow: '0 0 12px rgba(29, 78, 216, 0.75)'
                  }}
                />
              )}
              <style jsx global>{`
                @keyframes subBorderBlink {
                  from {
                    opacity: 0.3;
                    transform: scale(0.98);
                    box-shadow: 0 0 0 2px #1D4ED8, 0 0 4px rgba(29, 78, 216, 0.4);
                  }
                  to {
                    opacity: 1;
                    transform: scale(1.05);
                    box-shadow: 0 0 0 5px #1D4ED8, 0 0 18px rgba(29, 78, 216, 0.9);
                  }
                }
              `}</style>
              <button
                id="active-subscription-btn"
                type="button"
                onClick={() => {
                  setIsOpeningModal(true)
                  setIsModalOpen(true)
                  setTimeout(() => setIsOpeningModal(false), 400)
                }}
                className={`relative z-10 min-h-[42px] px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.98] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all cursor-pointer w-full sm:w-auto text-center shrink-0 flex items-center justify-center gap-2 ${
                  isHighlighted ? 'ring-2 ring-white shadow-lg shadow-blue-600/50' : ''
                }`}
              >
                {isOpeningModal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Opening...</span>
                  </>
                ) : (
                  <span>{isTrial ? 'Activate Subscription' : 'Renew Subscription'}</span>
                )}
              </button>
            </div>
          </div>

          {/* Details 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5 pt-1">
            {/* 1. Plan Tier */}
            <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-black/20 hover:shadow-xs transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-black/15 shadow-2xs">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-600 block">
                  Plan Tier
                </span>
                <span className="text-base sm:text-lg md:text-xl font-bold text-[#0B1220] mt-1 block truncate">
                  {subscriptionTier === 'FULL_PLANT_AI'
                    ? 'Full Plant AI (12 Div)'
                    : (subscriptionTier === 'MODULAR' ? 'Modular Plan' : 'Enterprise Custom')}
                </span>
                <span className="text-xs sm:text-sm text-slate-600 mt-0.5 block font-medium">
                  ₹{monthlyBillingInr.toLocaleString('en-IN')}/month
                </span>
              </div>
            </div>

            {/* 2. Start Date */}
            <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-black/20 hover:shadow-xs transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-black/15 shadow-2xs">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-600 block">
                  Start Date
                </span>
                <span className="text-base sm:text-lg md:text-xl font-bold text-[#0B1220] mt-1 block font-mono">
                  {issueDateStr}
                </span>
                <span className="text-xs sm:text-sm text-slate-600 mt-0.5 block font-medium">
                  Account Initialized
                </span>
              </div>
            </div>

            {/* 3. Valid Until */}
            <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-black/20 hover:shadow-xs transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-black/15 shadow-2xs">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-600 block">
                  Valid Until
                </span>
                <span className={`text-base sm:text-lg md:text-xl font-bold mt-1 block font-mono ${isAccountExpired ? 'text-rose-600' : 'text-[#0B1220]'}`}>
                  {expiryDateStr}
                </span>
                <span className="text-xs sm:text-sm text-slate-600 mt-0.5 block font-medium">
                  {isTrial ? '7-Day Evaluation' : 'Active Cycle'}
                </span>
              </div>
            </div>

            {/* 4. Status */}
            <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-black/20 hover:shadow-xs transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 border border-black/15 text-[#0B1220] shadow-2xs">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-600 block">
                  Account Status
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  {isAccountExpired ? (
                    <span className="text-base sm:text-lg font-bold text-rose-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      Expired (Locked)
                    </span>
                  ) : daysLeft <= 3 && isTrial ? (
                    <span className="text-base sm:text-lg font-bold text-amber-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'} Left
                    </span>
                  ) : (
                    <span className="text-base sm:text-lg font-bold text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      {isTrial ? `${daysLeft} Days Trial Left` : 'Active'}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-slate-600 mt-0.5 block font-medium">
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
            className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-[#0B1220]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0B1220]">
                    {isTrial ? 'Activate Full Enterprise License' : 'Renew Subscription Plan'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Confirm your subscription duration for {companyName}
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
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Modal Form Body */}
            <div className="space-y-5 pt-5">
              {/* 1. Requested Plan Card */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
                  Requested License Plan
                </label>
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDFA] border border-black/15 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-[#0B1220]">
                      {activePlanTier === 'FULL_PLANT_AI' ? 'Full Plant AI' : 'Modular Plan'}
                    </span>
                    <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#0B1220] text-white">
                      {activePlanTier === 'FULL_PLANT_AI' ? '12 Divisions' : 'Core Units'}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-[#0B1220] mt-1.5">
                    ₹{baseMonthlyPrice.toLocaleString('en-IN')}<span className="text-sm font-normal text-slate-500"> / month</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {activePlanTier === 'FULL_PLANT_AI'
                      ? 'Complete end-to-end MES coverage from Design & Cutting through Stitching, Packing, and Finished Goods Vault.'
                      : 'Essential production floor tracking for cutting, sewing lines, and store logistics.'}
                  </p>
                </div>

                {/* Plan Switch Contact Prompt */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 mt-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="text-slate-600">
                    Need to modify division modules or discuss custom pricing?
                  </span>
                  <a
                    href="mailto:support@zigza.in?subject=Custom%20Plan%20Inquiry%20-%20Shaw%20Industries"
                    className="font-bold text-[#0B1220] hover:text-[#1D4ED8] hover:underline whitespace-nowrap shrink-0"
                  >
                    Contact Desk &rarr;
                  </a>
                </div>
              </div>

              {/* 2. Select Duration */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
                  Select Billing Period
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDuration(1)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      selectedDuration === 1
                        ? 'border-[#0B1220] bg-[#F0FDFA] text-[#0B1220] shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold">1 Month</div>
                    <div className="text-[11px] text-slate-500 mt-1">Standard Cycle</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDuration(3)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      selectedDuration === 3
                        ? 'border-[#0B1220] bg-[#F0FDFA] text-[#0B1220] shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold">3 Months</div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">Save 10%</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDuration(12)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      selectedDuration === 12
                        ? 'border-[#0B1220] bg-[#F0FDFA] text-[#0B1220] shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold">1 Year</div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">2 Months Free</div>
                  </button>
                </div>
              </div>

              {/* 3. Order Summary Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Selected License:</span>
                  <span className="font-bold text-slate-900">
                    {activePlanTier === 'FULL_PLANT_AI' ? 'Full Plant AI' : 'Modular Plan'} ({selectedDuration} {selectedDuration === 1 ? 'Month' : 'Months'})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Factory Account:</span>
                  <span className="font-bold text-slate-900">{companyName}</span>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 text-slate-900">
                  <span className="font-bold text-sm">Total Payable:</span>
                  <span className="font-mono font-extrabold text-[#0B1220] text-lg">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Info Note */}
              <div className="text-xs text-slate-600 leading-relaxed bg-[#F0FDFA] p-3.5 rounded-xl border border-black/15">
                <p className="font-bold text-[#0B1220] mb-0.5">Direct Corporate Activation:</p>
                Confirming updates your factory subscription immediately. Invoices with GST credit details are dispatched directly to your registered email.
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className="min-h-[42px] w-full sm:w-auto px-4.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={isPending}
                  className="min-h-[42px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] active:scale-[0.98] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 cursor-pointer transition-all disabled:opacity-50 text-center"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Activating License...</span>
                    </>
                  ) : (
                    <span>Confirm & Activate (₹{totalAmount.toLocaleString('en-IN')})</span>
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
