'use client'

import React, { useState } from 'react'
import { X, Building2, Layers, DollarSign, User, Mail, Calendar, Sparkles } from 'lucide-react'
import { ActiveBuyer } from '../../types/merchandising'
import { saveActiveBuyer } from '../../utils/merchandisingStorage'

interface CreateBuyerModalProps {
  isOpen: boolean
  onClose: () => void
  onBuyerCreated: (buyer: ActiveBuyer) => void
}

export function CreateBuyerModal({ isOpen, onClose, onBuyerCreated }: CreateBuyerModalProps) {
  const [buyerName, setBuyerName] = useState('')
  const [buyerCode, setBuyerCode] = useState('')
  const [brandName, setBrandName] = useState('')
  const [contractedVolume, setContractedVolume] = useState<number | ''>(5000)
  const [pricePerPiece, setPricePerPiece] = useState<number | ''>(450)
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR')
  const [contactPerson, setContactPerson] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [targetSeason, setTargetSeason] = useState('AW26')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleNameChange = (val: string) => {
    setBuyerName(val)
    if (!buyerCode || buyerCode.startsWith('BYR-')) {
      const generatedCode = 'BYR-' + val.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
      setBuyerCode(generatedCode)
    }
  }

  const volumeNum = Number(contractedVolume) || 0
  const priceNum = Number(pricePerPiece) || 0
  const totalValue = volumeNum * priceNum
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!buyerName.trim() || volumeNum <= 0 || priceNum <= 0) return

    setIsSubmitting(true)
    const newBuyer: ActiveBuyer = {
      id: `BYR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      buyer_name: buyerName.trim(),
      buyer_code: buyerCode.trim() || `BYR-${Date.now().toString().slice(-4)}`,
      brand_name: brandName.trim() || buyerName.trim(),
      contact_person: contactPerson.trim() || undefined,
      contact_email: contactEmail.trim() || undefined,
      contracted_volume: volumeNum,
      price_per_piece: priceNum,
      currency,
      total_contract_value: totalValue,
      target_season: targetSeason.trim() || undefined,
      status: 'PENDING_LINK',
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString()
    }

    saveActiveBuyer(newBuyer)
    onBuyerCreated(newBuyer)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-[family-name:var(--font-heading)]">
                Contract New Active Buyer
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Record buyer volume, unit price, and commercial contract terms
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Buyer Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Buyer / Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Zara International"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Buyer Reference Code
              </label>
              <input
                type="text"
                value={buyerCode}
                onChange={e => setBuyerCode(e.target.value.toUpperCase())}
                placeholder="BYR-ZARA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564] transition-all"
              />
            </div>
          </div>

          {/* Brand Name & Season */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Brand / Label Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="e.g. Zara Man / Inditex"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Delivery Season
              </label>
              <input
                type="text"
                value={targetSeason}
                onChange={e => setTargetSeason(e.target.value)}
                placeholder="e.g. AW26 or Summer 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564] transition-all"
              />
            </div>
          </div>

          {/* Volume, Price & Currency */}
          <div className="bg-[#FAF7F0] p-4 rounded-xl border border-black/10 space-y-3.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564] block">
              Contract Volume &amp; Pricing Agreement
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Contracted Volume (Pcs) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={contractedVolume}
                  onChange={e => setContractedVolume(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="5000"
                  className="w-full px-3 py-2 rounded-lg border border-black/15 bg-white text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Offered Price / Pc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min={0.01}
                  value={pricePerPiece}
                  onChange={e => setPricePerPiece(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="450.00"
                  className="w-full px-3 py-2 rounded-lg border border-black/15 bg-white text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-black/15 bg-white text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Total Contracted Value Calculation Banner */}
            <div className="mt-2 pt-3 border-t border-black/10 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Total Contract Value:</span>
              <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900">
                {currencySymbol}{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Contact Person & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Buyer Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="buyer@brand.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Contract Terms / Internal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. FOB Mumbai terms, 45-day ex-factory window upon tech pack article linkage..."
              className="w-full px-3.5 py-2 rounded-xl border border-black/15 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-black/15 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !buyerName.trim() || volumeNum <= 0 || priceNum <= 0}
              className="px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Contracting...' : 'Create Active Buyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
