'use client'

import React, { useState } from 'react'
import { X, UserPlus, Phone, Lock, Eye, EyeOff, Check, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { WashingWorker, WashingWorkerRole } from '../types/washing'
import { saveWashingWorker } from '../utils/washingFloorStorage'
import { registerWashingWorkerAction } from '../actions'

interface AddWorkerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (worker: WashingWorker) => void
  companyName?: string
}

const AVAILABLE_ROLES: { id: WashingWorkerRole; label: string }[] = [
  { id: 'WASH_MASTER', label: 'Washing Master / Head Chemist' },
  { id: 'HYDRO_EXTRACTOR', label: 'Hydro Extraction Operator' },
  { id: 'TUMBLER_OPERATOR', label: 'Industrial Tumbler Dryer Operator' },
  { id: 'CHEMICAL_MIXER', label: 'Chemical & Enzyme Dosing Specialist' },
  { id: 'SHRINKAGE_INSPECTOR', label: 'Shrinkage & Shade QC Inspector' },
  { id: 'FINISHING_LOADER', label: 'Wet Goods Conveyor & Loader' }
]

export function AddWorkerModal({ isOpen, onClose, onSuccess, companyName }: AddWorkerModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<WashingWorkerRole[]>(['WASH_MASTER'])
  const [assignedMachine, setAssignedMachine] = useState('Washer 01 (Tumbler 600kg)')
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw.length <= 10) {
      setPhone(raw)
    }
  }

  const toggleRole = (roleId: WashingWorkerRole) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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

      const newWorker: WashingWorker = {
        id: `ww-${Date.now()}`,
        worker_name: name.trim(),
        phone_number: phone.trim(),
        roles: selectedRoles,
        role: primaryRoleLabel,
        assigned_machine: assignedMachine,
        shift,
        status: 'ACTIVE',
        assigned_pieces: 0,
        completed_pieces: 0,
        company_name: companyName,
        created_at: new Date().toISOString()
      }

      // Save locally for instant UI response
      saveWashingWorker(newWorker)

      // Provision Auth User & database row via server action
      const res = await registerWashingWorkerAction({
        worker_name: name.trim(),
        phone_number: phone.trim(),
        password: password.trim(),
        roles: selectedRoles,
        assigned_machine: assignedMachine,
        shift,
        company_name: companyName
      })

      if (res.success && res.worker) {
        toast.success(`Washing Operator "${name}" registered successfully with phone +91 ${phone}!`)
        onSuccess?.(res.worker)
      } else {
        toast.success(`Washing Operator "${name}" saved to floor roster!`)
        onSuccess?.(newWorker)
      }

      onClose()
    } catch (err: any) {
      console.error('Error saving worker:', err)
      toast.error(err.message || 'Failed to save worker.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-lg w-full overflow-hidden transition-all flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#FAF7F0] border-b border-black/10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Register Washing Operator
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Create operator profile and floor access login
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {/* Worker Full Name */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
              Operator Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Mondal"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-[#3A3564] transition-all font-semibold"
            />
          </div>

          {/* 10-Digit Mobile Phone */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
              Mobile Phone Number (Login ID) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                className="w-full pl-12 pr-3.5 py-2 text-sm rounded-xl border border-black/10 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-[#3A3564] transition-all font-mono font-bold"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used as operator phone login credential
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
              Workstation Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters (e.g. wash@123)"
                className="w-full pl-3.5 pr-10 py-2 text-sm rounded-xl border border-black/10 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-[#3A3564] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Machine & Shift Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Primary Machine
              </label>
              <select
                value={assignedMachine}
                onChange={e => setAssignedMachine(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden font-semibold"
              >
                <option value="Washer 01 (Tumbler 600kg)">Washer 01 (Tumbler 600kg)</option>
                <option value="Washer 02 (Hydro 400kg)">Washer 02 (Hydro 400kg)</option>
                <option value="Washer 03 (Front Load 300kg)">Washer 03 (Front Load 300kg)</option>
                <option value="Dryer 01 (Steam Tumbler)">Dryer 01 (Steam Tumbler)</option>
                <option value="Dryer 02 (Electric Tumbler)">Dryer 02 (Electric Tumbler)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Floor Shift
              </label>
              <select
                value={shift}
                onChange={e => setShift(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden font-semibold"
              >
                <option value="MORNING">Morning (08:00 AM - 04:00 PM)</option>
                <option value="EVENING">Evening (04:00 PM - 12:00 AM)</option>
                <option value="NIGHT">Night (12:00 AM - 08:00 AM)</option>
              </select>
            </div>
          </div>

          {/* Floor Roles Selector */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
              Floor Roles &amp; Skill Competencies <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5">
              {AVAILABLE_ROLES.map(role => {
                const isSelected = selectedRoles.includes(role.id)
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF7F0] border-[#3A3564] text-[#3A3564] shadow-2xs font-bold'
                        : 'bg-white border-black/10 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">{role.label}</span>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#3A3564] border-[#3A3564] text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Operator</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
