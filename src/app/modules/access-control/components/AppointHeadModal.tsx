'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  UserCheck,
  Building2,
  Lock,
  Layers,
  Sparkles,
  Phone,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  Scissors,
  Store,
  Printer,
  Boxes,
  Waves,
  Flame,
  Wrench,
  Truck,
  Briefcase,
  Palette
} from 'lucide-react'
import { DEPARTMENT_HEADS_CATALOG, DepartmentHeadDefinition } from '@/lib/access-control'
import { appointOrUpdateDepartmentHeadAction, DepartmentHeadItem, DivisionWithHeadStatus } from '../actions'

interface AppointHeadModalProps {
  isOpen: boolean
  onClose: () => void
  division: DivisionWithHeadStatus | null
  existingHead?: DepartmentHeadItem | null
  allowedDivisions?: string[]
  tenantName: string
  onSuccess: () => void
}

const DIVISION_ICON_LOOKUP: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Briefcase,
  Scissors,
  Printer,
  Sparkles,
  Layers,
  Waves,
  Flame,
  Boxes,
  Wrench,
  Store,
  Truck
}

export function AppointHeadModal({
  isOpen,
  onClose,
  division,
  existingHead,
  allowedDivisions,
  tenantName,
  onSuccess
}: AppointHeadModalProps) {
  const isEditing = !!existingHead

  const availableDivisions = useMemo<DepartmentHeadDefinition[]>(() => {
    if (!allowedDivisions || allowedDivisions.length === 0) {
      return DEPARTMENT_HEADS_CATALOG
    }
    return DEPARTMENT_HEADS_CATALOG.filter(div => allowedDivisions.includes(div.route))
  }, [allowedDivisions])

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [designation, setDesignation] = useState('')
  const [phone, setPhone] = useState('')
  const [allowedModules, setAllowedModules] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (existingHead) {
      setDisplayName(existingHead.displayName || existingHead.username)
      setUsername(existingHead.username)
      setPassword('')
      setDesignation(existingHead.designation || '')
      const fallbackRoute = availableDivisions[0]?.route || '/stitching-sewing'
      const initialMods = existingHead.allowedModules.length > 0 ? existingHead.allowedModules : (division ? [division.route] : [fallbackRoute])
      setAllowedModules(initialMods)
    } else if (division) {
      setDisplayName('')
      const defaultUser = `${division.name.split(' ')[0].toLowerCase()}_head`
      setUsername(defaultUser)
      setDesignation(division.defaultDesignation)
      setPhone('')
      setAllowedModules([division.route])
      generateRandomPassword(division.name)
    } else {
      setDisplayName('')
      setUsername('')
      setDesignation('')
      setPhone('')
      setAllowedModules([])
      generateRandomPassword('Factory')
    }
    setError(null)
    setSuccess(false)
  }, [division, existingHead, isOpen])

  if (!isOpen) return null

  function generateRandomPassword(prefix = 'Factory') {
    const slug = prefix.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'Factory'
    const cap = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase()
    const num = Math.floor(1000 + Math.random() * 9000)
    setPassword(`@${cap}${num}!`)
  }

  const handleNameChange = (val: string) => {
    setDisplayName(val)
    if (!isEditing && (!username || username.endsWith('_head') || username === 'staff_user')) {
      const clean = val.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      if (clean) {
        const divSuffix = division ? division.code : 'head'
        setUsername(`${clean}_${divSuffix}`)
      }
    }
  }

  const selectSingleModule = (route: string) => {
    const isCurrentlyChecked = allowedModules.includes(route)
    if (isCurrentlyChecked) {
      setAllowedModules([])
      if (!isEditing) setDesignation('')
    } else {
      setAllowedModules([route])
      if (!isEditing) {
        const divDef = DEPARTMENT_HEADS_CATALOG.find(d => d.route === route)
        if (divDef) {
          setDesignation(divDef.defaultDesignation)
          if (displayName.trim() && (!username || username.endsWith('_head') || username.match(/_\d{2}$/))) {
            const clean = displayName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
            if (clean) setUsername(`${clean}_${divDef.code}`)
          }
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || !username.trim()) {
      setError('Please provide Head Name and Login Username')
      return
    }
    if (!isEditing && (!password || password.length < 6)) {
      setError('Initial Password must be at least 6 characters')
      return
    }
    if (allowedModules.length === 0) {
      setError('Please assign at least 1 manufacturing division to this Head')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await appointOrUpdateDepartmentHeadAction({
        headId: existingHead?.id,
        primaryDivisionRoute: division?.route || allowedModules[0],
        displayName,
        username,
        password: password || undefined,
        designation,
        allowedModules,
        phone
      })

      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(res.error || 'Failed to save Department Head')
      }
    } catch (err: any) {
      setError(err?.message || 'Server error while saving Department Head')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-black/10 relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <UserCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                {isEditing ? 'EDIT HEAD' : division ? `DIVISION ${division.code}` : 'APPOINT HEAD'}
              </span>
              <span className="text-xs font-mono font-medium text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">{tenantName}</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {isEditing ? `Edit ${existingHead.displayName}` : division ? `Appoint Head: ${division.name}` : 'Appoint Department Head'}
            </h3>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs sm:text-[13px]">

          {/* Row 1: Full Name & Official Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                Head Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mohd. Aslam"
                value={displayName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                Login Username / ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. aslam_cutting"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 2: Designation & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                Official Designation *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cutting Master / CAD Head"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                Phone / WhatsApp (Optional)
              </label>
              <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#3A3564] focus-within:ring-2 focus-within:ring-[#3A3564]/10 transition-all overflow-hidden">
                <div className="flex items-center px-3 bg-slate-100 text-slate-600 font-mono text-xs border-r border-slate-200 select-none">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-mono text-slate-900 bg-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Initial / New Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                {isEditing ? 'Update Password (leave blank to keep unchanged)' : 'Initial Password *'}
              </label>
              <button
                type="button"
                onClick={() => generateRandomPassword(displayName || (division ? division.name : 'Factory'))}
                className="text-[11px] text-[#3A3564] hover:underline font-bold"
              >
                Auto-Generate Strong
              </button>
            </div>
            <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#3A3564] focus-within:ring-2 focus-within:ring-[#3A3564]/10 transition-all overflow-hidden">
              <input
                type="text"
                required={!isEditing}
                placeholder={isEditing ? 'Enter only if resetting password' : 'Min 6 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-900 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Department Authority (Single Select Division) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono block">
                  Department / Unit Assignment ({allowedModules.length > 0 ? '1 Selected' : '0 Selected'})
                </span>
                <span className="text-[11px] text-slate-500">
                  Select the manufacturing unit this Department Head will lead:
                </span>
              </div>
              {allowedModules.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAllowedModules([])
                    if (!isEditing) setDesignation('')
                  }}
                  className="text-[10px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 bg-slate-50/70 rounded-xl border border-slate-200">
              {availableDivisions.map(div => {
                const isChecked = allowedModules.includes(div.route)
                const IconComponent = DIVISION_ICON_LOOKUP[div.iconName] || Layers

                return (
                  <div
                    key={div.id}
                    onClick={() => selectSingleModule(div.route)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        selectSingleModule(div.route)
                      }
                    }}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'bg-[#FAF7F0] border-[#3A3564] text-slate-900 shadow-2xs ring-1 ring-[#3A3564]/30'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        isChecked
                          ? 'border-[#3A3564] bg-white ring-2 ring-[#3A3564]/20'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <div className="w-2 h-2 rounded-full bg-[#3A3564]" />}
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-white border border-black/10 text-[#3A3564] flex items-center justify-center shrink-0 shadow-2xs">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate leading-tight text-slate-900">
                        {div.code}. {div.name.split('&')[0].trim()}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {div.route}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Notification */}
          {success && (
            <div className="p-3 bg-[#FAF7F0] border border-black/15 rounded-xl text-xs text-[#3A3564] font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-[#3A3564] shrink-0" />
              <span>Department Head Appointed & Credentials Saved!</span>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Head...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Head Changes' : 'Confirm & Appoint Head'}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
