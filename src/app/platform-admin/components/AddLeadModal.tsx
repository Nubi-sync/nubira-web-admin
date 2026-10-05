'use client'

import { useState } from 'react'
import { X, Building2, User, Phone, Mail, MapPin, Cpu, FileText, AlertCircle, Loader2, PlusCircle } from 'lucide-react'
import { SubscriptionPlanTier } from '../types/platform'
import { addManualLeadAction } from '../actions'

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {
  const [companyName, setCompanyName] = useState('')
  const [applicantName, setApplicantName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [cityState, setCityState] = useState('')
  const [preferredPlan, setPreferredPlan] = useState<SubscriptionPlanTier>('FULL_PLANT_AI')
  const [estimatedMachines, setEstimatedMachines] = useState<number>(25)
  const [notes, setNotes] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!companyName.trim()) {
      setError('Company / Factory Name is required.')
      return
    }
    if (!applicantName.trim()) {
      setError('Contact Person Name is required.')
      return
    }
    const cleanPhoneDigits = phone.replace(/\D/g, '')
    if (cleanPhoneDigits.slice(-10).length < 10) {
      setError('Please provide a valid 10-digit phone number.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }

    setIsLoading(true)
    try {
      const res = await addManualLeadAction({
        companyName: companyName.trim(),
        applicantName: applicantName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        cityState: cityState.trim() || 'India',
        preferredPlan,
        estimatedMachines: Number(estimatedMachines) || 0,
        notes: notes.trim()
      })

      if (!res.success) {
        setError(res.error || 'Failed to add lead.')
        setIsLoading(false)
        return
      }

      // Reset & close
      setCompanyName('')
      setApplicantName('')
      setPhone('')
      setEmail('')
      setCityState('')
      setNotes('')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
              <PlusCircle className="w-5 h-5 text-[#0B1220]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B1220]">Add Manual Inbound Lead</h2>
              <p className="text-xs text-slate-500 font-medium">Record a new prospective factory inquiry or phone lead</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-start gap-2.5 font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Factory / Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Factory / Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Vardhman Textiles"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 focus:border-[#0B1220] font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={e => setApplicantName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 focus:border-[#0B1220] font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="10-digit mobile (e.g. 98201 23456)"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 focus:border-[#0B1220] font-mono text-slate-900"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@factory.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 focus:border-[#0B1220] font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Plant Location (City, State)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cityState}
                  onChange={e => setCityState(e.target.value)}
                  placeholder="e.g. Surat, Gujarat"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 focus:border-[#0B1220] text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Estimated Machines */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Sewing Machines
              </label>
              <div className="relative">
                <Cpu className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={estimatedMachines}
                  onChange={e => setEstimatedMachines(Number(e.target.value))}
                  placeholder="25"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 focus:border-[#0B1220] text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Preferred Plan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interested MES Plan
            </label>
            <select
              value={preferredPlan}
              onChange={e => setPreferredPlan(e.target.value as SubscriptionPlanTier)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 focus:border-[#0B1220] text-slate-900 font-medium cursor-pointer"
            >
              <option value="FULL_PLANT_AI">Full Plant MES (All 12 Divisions - ₹4,999/mo)</option>
              <option value="MODULAR">Modular Plan (Pick &amp; Choose Modules)</option>
              <option value="CUSTOM">Custom Enterprise Setup</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Requirement / Floor Notes
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Specific floor challenges, machine types, or discussion notes..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 focus:border-[#0B1220] text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating &amp; Saving...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Save Inbound Lead</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
