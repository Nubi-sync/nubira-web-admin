'use client'

import React, { useState } from 'react'
import { X, UserPlus, Phone, Lock, Eye, EyeOff, Check, CheckCircle2, Scissors, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { StitchingWorker, StitchingWorkerRole, MachineSpecialty } from '../types/stitching'
import { saveStitchingWorker } from '../utils/stitchingFloorStorage'
import { registerStitchingWorkerAction } from '../actions'

interface AddWorkerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (worker: StitchingWorker) => void
  companyName?: string
}

const AVAILABLE_ROLES: { id: StitchingWorkerRole; label: string }[] = [
  { id: 'TAILOR', label: 'Master Tailor / Assembly Operator' },
  { id: 'SINGLE_NEEDLE', label: 'Single Needle Lockstitch Specialist' },
  { id: 'OVERLOCK_OPERATOR', label: 'Overlock / Safety Stitch Operator' },
  { id: 'FLATLOCK_OPERATOR', label: 'Flatlock / Coverstitch Specialist' },
  { id: 'KANSAI_SPECIALIST', label: 'Kansai / Multi-Needle Operator' },
  { id: 'FEED_OFF_ARM', label: 'Feed-off-the-arm Lap Seamer' },
  { id: 'QUALITY_INSPECTOR', label: 'Inline Floor QC Tailor' },
  { id: 'FINISHING_HELPER', label: 'Sewing Floor Helper / Trimmer' }
]

const MACHINE_OPTIONS: MachineSpecialty[] = [
  'Single Needle Lockstitch (SNLS)',
  '4-Thread Overlock (Safety Stitch)',
  '5-Thread Overlock',
  'Flatlock (Coverstitch / Hemming)',
  'Kansai Special (Waistband & Multi-needle)',
  'Feed-off-the-arm (Lap Seaming)',
  'Button Hole & Button Stitch',
  'Bar-tacking Machine',
  'Manual Assembly / Helper'
]

export function AddWorkerModal({ isOpen, onClose, onSuccess, companyName }: AddWorkerModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<StitchingWorkerRole[]>(['TAILOR'])
  const [assignedMachine, setAssignedMachine] = useState<MachineSpecialty>('Single Needle Lockstitch (SNLS)')
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING')
  const [pieceRate, setPieceRate] = useState('14.50')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw.length <= 10) {
      setPhone(raw)
    }
  }

  const toggleRole = (roleId: StitchingWorkerRole) => {
    if (selectedRoles.includes(roleId)) {
      if (selectedRoles.length === 1) {
        toast.info('Tailor must have at least one assigned skill.')
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
      toast.error('Please enter tailor/operator full name.')
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

    const rateNum = parseFloat(pieceRate) || 12

    setIsSubmitting(true)

    try {
      const primaryRoleLabel = selectedRoles
        .map(r => AVAILABLE_ROLES.find(ar => ar.id === r)?.label || r)
        .join(', ')

      const newWorker: StitchingWorker = {
        id: `sw-${Date.now()}`,
        worker_name: name.trim(),
        phone_number: phone.trim(),
        roles: selectedRoles,
        role: primaryRoleLabel,
        assigned_machine: assignedMachine,
        machine_specialty: assignedMachine,
        shift,
        status: 'ACTIVE',
        assigned_pieces: 0,
        completed_pieces: 0,
        piece_rate_inr: rateNum,
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
        roles: selectedRoles,
        assigned_machine: assignedMachine,
        machine_specialty: assignedMachine,
        shift,
        piece_rate_inr: rateNum,
        company_name: companyName
      })

      if (res.success && res.worker) {
        toast.success(`Sewing Operator "${name}" registered with phone +91 ${phone}!`)
        onSuccess?.(res.worker as any)
      } else {
        toast.success(`Sewing Operator "${name}" added to floor roster!`)
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
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Register Sewing Tailor / Operator
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Issue floor workstation credentials for stitching assembly line
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[80vh] overflow-y-auto">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Operator Full Name <span className="text-rose-500">*</span>
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
              Operator logs in at <span className="font-mono text-slate-600">/login</span> using their 10-digit mobile number.
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

          {/* Machine Assignment & Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Machine Specialty
              </label>
              <select
                value={assignedMachine}
                onChange={(e) => setAssignedMachine(e.target.value as MachineSpecialty)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-medium text-slate-900 cursor-pointer"
              >
                {MACHINE_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Default Piece Rate (₹/pc)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={pieceRate}
                  onChange={(e) => setPieceRate(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Shift Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Floor Shift
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['MORNING', 'EVENING', 'NIGHT'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShift(s)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    shift === s
                      ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Roles / Skills Multi-select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Sewing Operations & Skills
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {AVAILABLE_ROLES.map(role => {
                const isSelected = selectedRoles.includes(role.id)
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF7F0] border-[#3A3564] text-[#3A3564] font-bold shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/60 font-medium'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isSelected ? 'bg-[#3A3564] border-[#3A3564] text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{role.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
