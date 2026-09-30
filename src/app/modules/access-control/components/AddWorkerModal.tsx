'use client'

import React, { useState, useEffect } from 'react'
import { X, User, Briefcase, Clock, Loader2, Lock } from 'lucide-react'
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
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('')
  const [shift, setShift] = useState('General')

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const defaultRoute = initialDivisionRoute && allowedDivisions.includes(initialDivisionRoute)
      ? initialDivisionRoute
      : (purchasedCatalog[0]?.route || '/cutting')
    setDivisionRoute(defaultRoute)
    setName('')
    setPhone('')
    setPassword('')
    setConfirmPassword('')
    setRole('')
    setShift('General')
    setError(null)
  }, [initialDivisionRoute, isOpen, allowedDivisions])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (!name.trim()) {
      setError('Please enter worker name.')
      return
    }
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!password || password.length < 6) {
      setError('Worker password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const res = await addFloorWorkerAction({
      divisionRoute,
      worker_name: name.trim(),
      phone_number: cleanPhone,
      password: password,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#0B1220] tracking-tight font-[family-name:var(--font-heading)]">
              Register <span className="text-[#1D4ED8]">Shop Floor Worker</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Department Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Assigned Department <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={divisionRoute}
              onChange={(e) => setDivisionRoute(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-bold text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all cursor-pointer"
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
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Worker Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter worker name"
                className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
              />
            </div>
          </div>

          {/* Mobile Phone with Pre-filled +91 */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex rounded-xl border border-slate-200 focus-within:border-[#0B1220] focus-within:ring-2 focus-within:ring-[#0B1220]/10 overflow-hidden bg-[#F8FAFC] transition-all">
              <div className="px-3.5 py-3 bg-slate-100/90 border-r border-slate-200/80 text-sm font-mono font-bold text-slate-700 flex items-center select-none">
                +91
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit number"
                className="w-full px-3.5 py-3 bg-transparent text-sm sm:text-base font-mono font-medium text-[#0B1220] outline-none"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Used for mobile number login.</p>
          </div>

          {/* Password (min 6 chars) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAFC] focus:bg-white text-sm font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Retype Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAFC] focus:bg-white text-sm font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Designation & Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Designation / Role
              </label>
              <div className="relative flex items-center">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Enter worker role / designation"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Work Shift
              </label>
              <div className="relative flex items-center">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] focus:bg-white text-sm sm:text-base font-medium text-[#0B1220] border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all cursor-pointer"
                >
                  <option value="General">General (9AM - 6PM)</option>
                  <option value="Morning">Morning Shift</option>
                  <option value="Evening">Evening Shift</option>
                  <option value="Night">Night Shift</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-5 bg-[#0B1220] hover:bg-[#162032] text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Worker</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
