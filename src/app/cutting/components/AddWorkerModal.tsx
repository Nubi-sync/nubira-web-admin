'use client'

import React, { useState } from 'react'
import { X, UserPlus, Phone, Lock, Eye, EyeOff, Shield, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { CuttingWorker, CuttingWorkerRole } from '../types/cutting'
import { saveCuttingWorker } from '../utils/cuttingStorage'

interface AddWorkerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (worker: CuttingWorker) => void
}

const ROLES: { value: CuttingWorkerRole; label: string; desc: string }[] = [
  { value: 'CUTTING_MASTER', label: 'Cutting Master', desc: 'Oversees spread plans, marker placement & cut approvals' },
  { value: 'SPREADING_OPERATOR', label: 'Spreading Operator', desc: 'Manual & automatic fabric roll spreading across vacuum beds' },
  { value: 'KNIFE_CUTTER', label: 'Knife Cutter (CNC / Band-Knife)', desc: 'Executes vacuum knife slicing & precision panel cutting' },
  { value: 'BUNDLER', label: 'QR Bundler & QC Lead', desc: 'Panel bundling, QR tagging & route dispatch' },
  { value: 'TABLE_LEAD', label: 'Vacuum Station Lead', desc: 'Table utilization, suction pressure & maintenance' }
]

export function AddWorkerModal({ isOpen, onClose, onSuccess }: AddWorkerModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<CuttingWorkerRole>('KNIFE_CUTTER')
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw.length <= 10) {
      setPhone(raw)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter worker full name.')
      return
    }

    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    if (!password.trim() || password.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }

    setIsSubmitting(true)

    try {
      const newWorker: CuttingWorker = {
        id: `cw-${Date.now()}`,
        worker_name: name.trim(),
        phone_number: phone.trim(),
        role,
        shift,
        status: 'ACTIVE',
        assigned_pieces: 0,
        completed_pieces: 0,
        created_at: new Date().toISOString()
      }

      saveCuttingWorker(newWorker)
      toast.success(`Worker ${newWorker.worker_name} registered successfully! Login: +91 ${phone}`)
      
      if (onSuccess) onSuccess(newWorker)
      
      // Reset form
      setName('')
      setPhone('')
      setPassword('')
      setRole('KNIFE_CUTTER')
      setShift('MORNING')
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to register worker.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Onboard Cutting Floor Worker
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Create worker credentials for cutting floor portal access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-black/10 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto">
          
          {/* Worker Full Name */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Worker Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 focus:bg-white text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#3A3564] transition-all"
            />
          </div>

          {/* Phone Number with fixed +91 */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mobile Phone Number (Login ID) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex rounded-xl border border-black/10 bg-slate-50 focus-within:bg-white focus-within:border-[#3A3564] transition-all overflow-hidden">
              <span className="inline-flex items-center px-3.5 bg-[#FAF7F0] border-r border-black/10 text-xs font-mono font-bold text-[#3A3564] shrink-0">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="98765 43210"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 bg-transparent focus:outline-hidden"
              />
              <div className="pr-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Enter 10-digit phone number. This will act as the worker's unique login ID.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Portal Password <span className="text-red-500">*</span>
            </label>
            <div className="relative flex rounded-xl border border-black/10 bg-slate-50 focus-within:bg-white focus-within:border-[#3A3564] transition-all overflow-hidden">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters password"
                className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-900 bg-transparent focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Floor Role & Specialization <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as CuttingWorkerRole)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 focus:bg-white text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#3A3564] transition-all cursor-pointer"
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Selection */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Shift Assignment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'MORNING', label: 'Morning', hours: '06:00 - 14:00' },
                { id: 'EVENING', label: 'Evening', hours: '14:00 - 22:00' },
                { id: 'NIGHT', label: 'Night', hours: '22:00 - 06:00' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShift(s.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    shift === s.id
                      ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-xs'
                      : 'bg-[#FAF7F0] text-slate-700 border-black/10 hover:bg-white'
                  }`}
                >
                  <div className="text-xs font-bold font-mono uppercase">{s.label}</div>
                  <div className={`text-[10px] font-mono mt-0.5 ${shift === s.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {s.hours}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-mono font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Worker'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
