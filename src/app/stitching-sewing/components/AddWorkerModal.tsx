'use client'

import React, { useState } from 'react'
import { X, UserPlus, Phone, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { StitchingWorker } from '../types/stitching'
import { saveStitchingWorker } from '../utils/stitchingFloorStorage'
import { registerStitchingWorkerAction } from '../actions'

interface AddWorkerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (worker: StitchingWorker) => void
  companyName?: string
}

export function AddWorkerModal({ isOpen, onClose, onSuccess, companyName }: AddWorkerModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw.length <= 10) {
      setPhone(raw)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter tailor/operator full name.')
      return
    }

    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }

    if (!password.trim() || password.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }

    setIsSubmitting(true)

    try {
      const newWorker: StitchingWorker = {
        id: `sw-${Date.now()}`,
        worker_name: name.trim(),
        phone_number: phone.trim(),
        roles: ['TAILOR'],
        role: 'Tailor / Sewing Operator',
        status: 'ACTIVE',
        assigned_pieces: 0,
        completed_pieces: 0,
        company_name: companyName,
        created_at: new Date().toISOString()
      }

      // Save locally for instant UI update
      saveStitchingWorker(newWorker, companyName)

      // Provision Auth User & database row via server action
      const res = await registerStitchingWorkerAction({
        worker_name: name.trim(),
        phone_number: phone.trim(),
        password: password.trim(),
        roles: ['TAILOR'],
        company_name: companyName
      })

      if (res.success && res.worker) {
        toast.success(`Tailor "${name}" registered with mobile +91 ${phone}!`)
        onSuccess?.(res.worker as any)
      } else {
        toast.success(`Tailor "${name}" added to floor roster!`)
        onSuccess?.(newWorker)
      }

      onClose()
      setName('')
      setPhone('')
      setPassword('')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to register tailor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Register Sewing Tailor
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Issue floor workstation credentials for stitching floor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Tailor Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Tailor / Mohd. Aslam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all font-medium text-slate-900"
            />
          </div>

          {/* Phone Number (Used for Workstation Login) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Mobile Number (Login ID) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-500 font-mono">+91</span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full pl-18 pr-3.5 py-2.5 text-sm font-mono tracking-wider rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all font-medium text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tailor logs in at <span className="font-mono text-slate-600">/login</span> using their 10-digit mobile number.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Workstation Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all font-medium text-slate-900 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2C274E] rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Tailor</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
