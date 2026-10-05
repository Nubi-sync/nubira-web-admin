'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  Zap,
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Loader2,
  Clock,
  ArrowRight,
  Layers
} from 'lucide-react'
import { toast } from 'sonner'
import { upgradeTenantSubscriptionAction } from '@/app/profile/actions'

interface RechargeModalProps {
  isOpen?: boolean
  onClose?: () => void
  companyName?: string
  daysLeft?: number
  monthlyRate?: number
}

export function RechargeModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  companyName = 'Apparel Factory',
  daysLeft = 7,
  monthlyRate = 4999
}: RechargeModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isVisible = propIsOpen !== undefined ? propIsOpen : internalOpen

  const [selectedDuration, setSelectedDuration] = useState<number>(1) // 1, 3, or 12 months
  const [isPending, startTransition] = useTransition()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleClose = () => {
    if (propOnClose) {
      propOnClose()
    } else {
      setInternalOpen(false)
    }
  }

  // Listen to global open event
  useEffect(() => {
    const handleOpenEvent = () => setInternalOpen(true)
    window.addEventListener('open-recharge-modal', handleOpenEvent)
    return () => window.removeEventListener('open-recharge-modal', handleOpenEvent)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isVisible])

  const totalAmount = selectedDuration === 12
    ? monthlyRate * 10 // 2 months free
    : (selectedDuration === 3 ? Math.round(monthlyRate * 3 * 0.9) : monthlyRate * selectedDuration)

  const handleRecharge = () => {
    setErrorMsg(null)
    setSuccessMsg(null)

    startTransition(async () => {
      const res = await upgradeTenantSubscriptionAction({
        planTier: 'FULL_PLANT_AI',
        durationMonths: selectedDuration,
        paymentMethod: 'IN_APP_RECHARGE',
        transactionRef: `REC-${Date.now().toString().slice(-6)}`
      })

      if (res.success) {
        setSuccessMsg(res.message || 'Workspace subscription activated successfully!')
        toast.success('Subscription Recharged!', {
          description: `Full Plant AI access is now unlocked for ${selectedDuration} month${selectedDuration > 1 ? 's' : ''}.`
        })
        setTimeout(() => {
          handleClose()
          setSuccessMsg(null)
          window.location.reload()
        }, 1200)
      } else {
        setErrorMsg(res.error || 'Failed to complete recharge. Please try again.')
        toast.error(res.error || 'Recharge failed')
      }
    })
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col font-[family-name:var(--font-public-sans)]">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-[#0B1220] to-blue-950 text-white flex items-start justify-between">
          <div className="flex items-start gap-3.5 min-w-0 pr-8">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/20 font-black">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {daysLeft > 0 ? `${daysLeft} Days Trial Left` : 'Trial Expired'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Full Plant AI (12 Divisions)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                Recharge <span className="text-blue-400">{companyName}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Keep all 12 manufacturing floors, AI copilot, and operator desks running seamlessly.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Plan Duration Selector Cards */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Select Subscription Duration
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {/* 1 Month */}
              <button
                type="button"
                onClick={() => setSelectedDuration(1)}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                  selectedDuration === 1
                    ? 'border-[#1D4ED8] bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-xs font-black text-slate-900">1 Month</div>
                <div className="text-base sm:text-lg font-extrabold text-[#1D4ED8] mt-1 font-mono">
                  ₹{monthlyRate.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Standard monthly</div>
              </button>

              {/* 3 Months */}
              <button
                type="button"
                onClick={() => setSelectedDuration(3)}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                  selectedDuration === 3
                    ? 'border-[#1D4ED8] bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="absolute -top-2.5 right-2 text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                  Save 10%
                </span>
                <div className="text-xs font-black text-slate-900">3 Months</div>
                <div className="text-base sm:text-lg font-extrabold text-[#1D4ED8] mt-1 font-mono">
                  ₹{Math.round(monthlyRate * 3 * 0.9).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">₹4,499 / mo</div>
              </button>

              {/* 12 Months */}
              <button
                type="button"
                onClick={() => setSelectedDuration(12)}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                  selectedDuration === 12
                    ? 'border-[#1D4ED8] bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="absolute -top-2.5 right-2 text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                  2 Mo Free
                </span>
                <div className="text-xs font-black text-slate-900">1 Year</div>
                <div className="text-base sm:text-lg font-extrabold text-[#1D4ED8] mt-1 font-mono">
                  ₹{(monthlyRate * 10).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">₹4,166 / mo</div>
              </button>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Included with Full Plant AI
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>All 12 Factory Divisions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zigza AI Assistant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Unlimited Staff Logins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Real-Time Floor Sync</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Total Payable</span>
            <span className="text-xl sm:text-2xl font-black text-[#0B1220] font-mono">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRecharge}
              disabled={isPending}
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current text-amber-300" />
                  <span>Recharge Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
