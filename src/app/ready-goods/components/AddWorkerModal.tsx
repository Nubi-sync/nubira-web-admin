'use client'

import React, { useState } from 'react'
import { X, UserPlus, Phone, Lock, Eye, EyeOff, Check, CheckCircle2, ShieldCheck, Box, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { ReadyGoodsWorker, ReadyGoodsWorkerRole } from '../types/readyGoods'
import { saveReadyGoodsWorker } from '../utils/readyGoodsStorage'

interface AddWorkerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (worker: ReadyGoodsWorker) => void
  onWorkerAdded?: (worker: ReadyGoodsWorker) => void
  companyName?: string
}

const AVAILABLE_ROLES: {
  id: ReadyGoodsWorkerRole
  label: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    id: 'CHECKER',
    label: 'Quality Checker (Alteration & QC)',
    desc: 'Inspects post-wash/iron garments: cutting, printing, embroidery, washing, and iron quality.',
    icon: Scissors
  },
  {
    id: 'PACKER',
    label: 'Packing Goods Operator',
    desc: 'Responsible for hangtag barcode verification, polybag sealing, carton packing & weight.',
    icon: Box
  },
  {
    id: 'BOTH',
    label: 'Dual-Role Specialist (Checker & Packer)',
    desc: 'Authorized to operate both quality checking tables and final carton packing conveyors.',
    icon: ShieldCheck
  }
]

export function AddWorkerModal({ isOpen, onClose, onSuccess, onWorkerAdded, companyName }: AddWorkerModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<ReadyGoodsWorkerRole>('CHECKER')
  const [assignedStation, setAssignedStation] = useState('QC Inspection Table 01')
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING')
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

    setIsSubmitting(true)

    try {
      const newWorker: ReadyGoodsWorker = {
        id: `rgw-${Date.now()}`,
        worker_name: name.trim(),
        phone_number: phone.trim(),
        role: selectedRole,
        assigned_station: assignedStation,
        shift,
        status: 'ACTIVE',
        inspected_pieces: 0,
        packed_cartons: 0,
        company_name: companyName,
        created_at: new Date().toISOString()
      }

      saveReadyGoodsWorker(newWorker)
      toast.success(`Worker "${name.trim()}" registered successfully!`)
      if (onSuccess) onSuccess(newWorker)
      if (onWorkerAdded) onWorkerAdded(newWorker)
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save worker.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl border border-black shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564]/10 text-[#3A3564] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Floor Worker</h3>
              <p className="text-xs text-slate-500">Register quality checkers & packing operators</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Worker Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Worker Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar Patel"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
            />
          </div>

          {/* 10-Digit Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              10-Digit Mobile Number (Login ID) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                +91
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                maxLength={10}
                className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Worker PIN / Password (Min 6 chars) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter worker password"
                className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selection (Checker, Packer, Both) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Assigned Floor Role *
            </label>
            <div className="space-y-2">
              {AVAILABLE_ROLES.map((role) => {
                const isSelected = selectedRole === role.id
                const Icon = role.icon
                return (
                  <div
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role.id)
                      if (role.id === 'CHECKER') setAssignedStation('QC Inspection Table 01')
                      else if (role.id === 'PACKER') setAssignedStation('Conveyor Packing Line 02')
                      else setAssignedStation('Table 03 / Multi-Stage Station')
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#3A3564] bg-[#FAF7F0] ring-1 ring-[#3A3564]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#3A3564] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{role.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#3A3564] stroke-[3]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{role.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Station & Shift */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Station
              </label>
              <select
                value={assignedStation}
                onChange={(e) => setAssignedStation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#3A3564]"
              >
                <option value="QC Inspection Table 01">QC Inspection Table 01</option>
                <option value="QC Inspection Table 02">QC Inspection Table 02</option>
                <option value="Conveyor Packing Line 01">Conveyor Packing Line 01</option>
                <option value="Conveyor Packing Line 02">Conveyor Packing Line 02</option>
                <option value="Table 03 / Multi-Stage Station">Table 03 / Multi-Stage Station</option>
                <option value="Carton Bay 03">Carton Bay 03</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Working Shift
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#3A3564]"
              >
                <option value="MORNING">Morning (08:00 - 16:30)</option>
                <option value="EVENING">Evening (16:30 - 01:00)</option>
                <option value="NIGHT">Night (01:00 - 08:30)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Registering...' : 'Register Worker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
