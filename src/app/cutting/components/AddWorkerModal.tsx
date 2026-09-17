'use client'

import React, { useState } from 'react'
import { X, UserPlus, Phone, Lock, Eye, EyeOff, Check, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { CuttingWorker, CuttingWorkerRole } from '../types/cutting'
import { saveCuttingWorker } from '../utils/cuttingStorage'

interface AddWorkerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (worker: CuttingWorker) => void
}

const AVAILABLE_ROLES: { id: CuttingWorkerRole; label: string }[] = [
  { id: 'CUTTING_MASTER', label: 'Cutting Master' },
  { id: 'SPREADING_OPERATOR', label: 'Spreading Operator' },
  { id: 'KNIFE_CUTTER', label: 'Knife Cutter' }
]

export function AddWorkerModal({ isOpen, onClose, onSuccess }: AddWorkerModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<CuttingWorkerRole[]>(['KNIFE_CUTTER'])
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw.length <= 10) {
      setPhone(raw)
    }
  }

  const toggleRole = (roleId: CuttingWorkerRole) => {
    if (selectedRoles.includes(roleId)) {
      if (selectedRoles.length === 1) {
        toast.info('Worker must have at least one floor role.')
        return
      }
      setSelectedRoles(selectedRoles.filter(r => r !== roleId))
    } else {
      setSelectedRoles([...selectedRoles, roleId])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter worker full name.')
      return
    }

    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number.')
      return
    }

    if (!password.trim() || password.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }

    if (selectedRoles.length === 0) {
      toast.error('Please select at least one floor role.')
      return
    }

    setIsSubmitting(true)

    try {
      const primaryRoleLabel = selectedRoles
        .map(r => AVAILABLE_ROLES.find(ar => ar.id === r)?.label || r)
        .join(', ')

      const newWorker: CuttingWorker = {
        id: `cw-${Date.now()}`,
        worker_name: name.trim(),
        phone_number: phone.trim(),
        roles: selectedRoles,
        role: primaryRoleLabel,
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
      setSelectedRoles(['KNIFE_CUTTER'])
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
                Add Floor Worker
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
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative flex rounded-xl border border-black/10 bg-slate-50 focus-within:bg-white focus-within:border-[#3A3564] transition-all overflow-hidden">
              <span className="inline-flex items-center px-3.5 bg-[#FAF7F0] border-r border-black/10 text-xs font-mono font-bold text-[#3A3564] shrink-0">
                +91
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter your phone number"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 bg-transparent focus:outline-hidden"
              />
              <div className="pr-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative flex rounded-xl border border-black/10 bg-slate-50 focus-within:bg-white focus-within:border-[#3A3564] transition-all overflow-hidden">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password (min. 6 characters)"
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

          {/* Floor Roles (Max 3, Multi-Select Tag Checkboxes) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Floor Roles (Select one or multiple) <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {selectedRoles.length} of 3 selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {AVAILABLE_ROLES.map(r => {
                const isChecked = selectedRoles.includes(r.id)
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRole(r.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-xs'
                        : 'bg-[#FAF7F0] text-slate-700 border-black/10 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono">{r.label}</span>
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-white text-[#3A3564] border-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                )
              })}
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
