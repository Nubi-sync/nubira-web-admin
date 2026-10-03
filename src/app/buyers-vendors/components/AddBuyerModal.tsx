'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { BuyerItem, createOrUpdateBuyerAction } from '../actions'

interface AddBuyerModalProps {
  isOpen: boolean
  buyer?: BuyerItem | null
  onClose: () => void
  onSuccess: () => void
}

export function AddBuyerModal({
  isOpen,
  buyer,
  onClose,
  onSuccess
}: AddBuyerModalProps) {
  const [brandName, setBrandName] = useState('')
  const [brandCode, setBrandCode] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [gstin, setGstin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (buyer) {
      setBrandName(buyer.brandName || '')
      setBrandCode(buyer.brandCode || '')
      setContactPerson(buyer.contactPerson || '')
      setPhone(buyer.phone || '')
      setEmail(buyer.email || '')
      setCity(buyer.city || '')
      setAddress(buyer.address || '')
      setGstin(buyer.gstin || '')
    } else {
      setBrandName('')
      setBrandCode('')
      setContactPerson('')
      setPhone('')
      setEmail('')
      setCity('Kolkata, WB')
      setAddress('')
      setGstin('')
    }
    setError(null)
  }, [buyer, isOpen])

  if (!isOpen) return null

  const isEditing = Boolean(buyer)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = brandName.trim().toUpperCase()
    const cleanPerson = contactPerson.trim()
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10)

    if (!cleanName) {
      setError('Please enter Buyer / Company Name.')
      return
    }
    if (!cleanPerson) {
      setError('Please enter Contact Person Name.')
      return
    }
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createOrUpdateBuyerAction({
        id: buyer?.id,
        brandName: cleanName,
        brandCode: brandCode.trim().toUpperCase() || cleanName.slice(0, 3),
        contactPerson: cleanPerson,
        phone: cleanPhone,
        email: email.trim(),
        city: city.trim() || 'Kolkata, WB',
        address: address.trim(),
        gstin: gstin.trim().toUpperCase()
      })

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || 'Failed to save buyer record')
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving buyer')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#F8FAFC] border-b border-slate-200/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)]">
              {isEditing ? 'Edit Buyer Profile' : 'Add New Buyer'}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Buyer / Client Master registration
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-[#0B1220] hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-[#0B1220]">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-700 font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                Buyer / Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. ZUDIO / MAX FASHION"
                className="min-h-[44px] w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs uppercase"
              />
            </div>

            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={brandCode}
                onChange={(e) => setBrandCode(e.target.value.toUpperCase())}
                placeholder="e.g. ZUD"
                className="min-h-[44px] w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-mono font-bold border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs uppercase text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#14C8B4]" />
                Contact Person <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Buyer Merchant / PO Head"
                className="min-h-[44px] w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile"
                className="min-h-[44px] w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-mono font-bold border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email ID <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="buyer@brand.com"
                className="min-h-[44px] w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kolkata, WB"
                className="min-h-[44px] w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
              GSTIN / Tax ID <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              maxLength={15}
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="15-digit GSTIN (e.g. 19ABCDE1234F1Z5)"
              className="min-h-[44px] w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-mono font-bold border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs uppercase"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[42px] px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[42px] px-5 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Update Buyer' : 'Save Buyer'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
