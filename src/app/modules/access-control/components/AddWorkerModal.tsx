'use client'

import React, { useState, useEffect } from 'react'
import { X, User, Phone, Briefcase, Clock, Loader2, ArrowRight } from 'lucide-react'
import { addFloorWorkerAction } from '../actions'
import { DEPARTMENT_HEADS_CATALOG } from '@/lib/access-control'

interface AddWorkerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  allowedDivisions: string[]
  initialDivisionRoute?: string
}

export function AddWorkerModal({
  isOpen,
  onClose,
  onSuccess,
  allowedDivisions,
  initialDivisionRoute
}: AddWorkerModalProps) {
  const purchasedCatalog = DEPARTMENT_HEADS_CATALOG.filter(d => allowedDivisions.includes(d.route))

  const [divisionRoute, setDivisionRoute] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [shift, setShift] = useState('Morning')

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const defaultRoute = initialDivisionRoute && allowedDivisions.includes(initialDivisionRoute)
      ? initialDivisionRoute
      : (purchasedCatalog[0]?.route || '/cutting')
    setDivisionRoute(defaultRoute)
    setName('')
    setPhone('')
    setRole('')
    setShift('Morning')
    setError(null)
  }, [initialDivisionRoute, isOpen, allowedDivisions])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (!name.trim()) {
      setError('Worker name is required.')
      return
    }
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setIsSubmitting(true)
    const res = await addFloorWorkerAction({
      divisionRoute,
      worker_name: name.trim(),
      phone_number: cleanPhone,
      role: role.trim() || undefined,
      shift
    })
    setIsSubmitting(false)

    if (res.success) {
      onSuccess()
      onClose()
    } else {
      setError(res.error || 'Failed to add floor worker')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
              Level 4 Authority
            </span>
            <h3 className="text-base font-extrabold text-[#0B1220] tracking-tight mt-1 font-[family-name:var(--font-heading)]">
              Add Shop Floor Worker
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Assigned Department <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={divisionRoute}
              onChange={(e) => setDivisionRoute(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all cursor-pointer"
            >
              {purchasedCatalog.map(div => (
                <option key={div.route} value={div.route}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>

          {/* Worker Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Worker Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mukesh Kumar"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-mono font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
              />
            </div>
          </div>

          {/* Role / Skill & Shift */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Skill / Role
              </label>
              <div className="relative flex items-center">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Tailor, Helper"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] rounded-xl outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Shift
              </label>
              <div className="relative flex items-center">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] rounded-xl outline-none transition-all cursor-pointer"
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Worker</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
