'use client'

import React, { useState } from 'react'
import {
  X,
  Layers,
  Scissors,
  Printer,
  Sparkles,
  Boxes,
  Waves,
  Flame,
  Store,
  Truck,
  Wrench,
  Palette,
  Briefcase,
  Building2,
  User,
  Phone,
  FileText,
  Loader2,
  CheckCircle2,
  Plus
} from 'lucide-react'
import { ModuleVendorItem, createCustomModuleAction } from '../actions'

const AVAILABLE_ICONS = [
  { name: 'Layers', label: 'Assembly', icon: Layers },
  { name: 'Scissors', label: 'Cutting', icon: Scissors },
  { name: 'Wrench', label: 'Mechanical', icon: Wrench },
  { name: 'Boxes', label: 'Packaging', icon: Boxes },
  { name: 'Sparkles', label: 'Detailing', icon: Sparkles },
  { name: 'Printer', label: 'Printing', icon: Printer },
  { name: 'Flame', label: 'Heat/Iron', icon: Flame },
  { name: 'Waves', label: 'Wash/Wet', icon: Waves },
  { name: 'Store', label: 'Storage', icon: Store },
  { name: 'Truck', label: 'Logistics', icon: Truck },
  { name: 'Palette', label: 'Design', icon: Palette },
  { name: 'Briefcase', label: 'Commercial', icon: Briefcase }
]

interface AddCustomModuleModalProps {
  isOpen: boolean
  companyName: string
  onClose: () => void
  onSuccess: (newModule: ModuleVendorItem) => void
}

export function AddCustomModuleModal({
  isOpen,
  companyName,
  onClose,
  onSuccess
}: AddCustomModuleModalProps) {
  const [moduleName, setModuleName] = useState('')
  const [moduleCode, setModuleCode] = useState('')
  const [defaultDesignation, setDefaultDesignation] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('Layers')

  // Vendor Assignment toggle
  const [assignVendorNow, setAssignVendorNow] = useState(false)
  const [vendorCompanyName, setVendorCompanyName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [vendorNotes, setVendorNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Auto-generate code and designation when moduleName changes if not manually touched
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setModuleName(val)

    const cleaned = val.replace(/[^a-zA-Z0-9]/g, '')
    if (cleaned.length > 0) {
      setModuleCode(cleaned.slice(0, 4).toUpperCase())
      setDefaultDesignation(`${val} In-Charge`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = moduleName.trim()
    if (!cleanName) {
      setError('Please enter a valid Module Name (e.g., Kaj-Button Station, Button Hole Unit).')
      return
    }

    if (assignVendorNow) {
      const cleanVendorComp = vendorCompanyName.trim()
      const cleanPerson = contactPerson.trim()
      const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10)

      if (!cleanVendorComp) {
        setError('Please enter the Vendor Company Name or uncheck vendor assignment.')
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
    }

    setIsSubmitting(true)
    try {
      const res = await createCustomModuleAction({
        moduleName: cleanName,
        moduleCode: moduleCode.trim() || cleanName.slice(0, 4).toUpperCase(),
        defaultDesignation: defaultDesignation.trim() || `${cleanName} Master`,
        description: description.trim() || `${cleanName} operational workstation`,
        iconName: selectedIcon,
        vendorCompanyName: assignVendorNow ? vendorCompanyName.trim() : undefined,
        contactPerson: assignVendorNow ? contactPerson.trim() : undefined,
        phone: assignVendorNow ? phone.trim().replace(/\D/g, '').slice(-10) : undefined,
        vendorNotes: assignVendorNow ? vendorNotes.trim() : undefined,
        companyNameOverride: companyName
      })

      if (res.success && res.data) {
        const item: ModuleVendorItem = {
          id: res.data.id || `mod-${Date.now()}`,
          moduleRoute: res.data.module_route,
          moduleCode: res.data.module_code || moduleCode || cleanName.slice(0, 4).toUpperCase(),
          moduleName: cleanName,
          defaultDesignation: defaultDesignation.trim() || `${cleanName} In-Charge`,
          iconName: selectedIcon,
          description: description.trim() || `${cleanName} operational workstation`,
          isCustom: true,
          assignedVendor: assignVendorNow ? {
            id: res.data.id || `vnd-${Date.now()}`,
            companyName: vendorCompanyName.trim(),
            contactPerson: contactPerson.trim(),
            phone: phone.trim().replace(/\D/g, '').slice(-10),
            notes: vendorNotes.trim(),
            isActive: true,
            createdAt: new Date().toISOString()
          } : null
        }
        onSuccess(item)
        onClose()
      } else {
        setError(res.error || 'Failed to create custom module. Please try again.')
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error creating custom module.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-xs shrink-0">
              <Plus className="w-5 h-5 text-[#0B1220]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0B1220] tracking-tight font-[family-name:var(--font-heading)]">
                Add Custom Factory Module
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Create a specialized unit or jobwork station for {companyName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          {/* Module Basics */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Module / Station Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={moduleName}
                onChange={handleNameChange}
                placeholder="e.g., Kaj-Button Station, Button Hole Unit, Packaging Bay"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#1D4ED8] focus:bg-white rounded-xl font-medium outline-none transition-all shadow-2xs text-xs sm:text-sm"
                required
                autoFocus
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Give any operational name for your floor workflow or vendor scope.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Code
                </label>
                <input
                  type="text"
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="e.g. KAJB"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#1D4ED8] focus:bg-white rounded-xl font-mono font-bold outline-none transition-all shadow-2xs text-xs sm:text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Default In-Charge Title
                </label>
                <input
                  type="text"
                  value={defaultDesignation}
                  onChange={(e) => setDefaultDesignation(e.target.value)}
                  placeholder="e.g. Station Master"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#1D4ED8] focus:bg-white rounded-xl font-medium outline-none transition-all shadow-2xs text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Workstation Icon
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {AVAILABLE_ICONS.map((item) => {
                  const IconComp = item.icon
                  const isSelected = selectedIcon === item.name
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIcon(item.name)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-bold truncate max-w-full">
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Scope / Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jobwork details, quality checkpoints, machine sequence..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#1D4ED8] focus:bg-white rounded-xl font-medium outline-none transition-all shadow-2xs text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Optional Vendor Assignment Section */}
          <div className="pt-2 border-t border-slate-100">
            <div 
              onClick={() => setAssignVendorNow(!assignVendorNow)}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-all select-none"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#1D4ED8]" />
                <div>
                  <div className="font-bold text-[#0B1220] text-xs sm:text-sm">
                    Assign External Vendor / Job Worker
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Optional: You can create the module name now and assign vendor anytime later
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={assignVendorNow}
                onChange={() => {}}
                className="w-4 h-4 rounded text-[#1D4ED8] cursor-pointer"
              />
            </div>

            {assignVendorNow && (
              <div className="mt-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vendor / Contractor Company <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vendorCompanyName}
                    onChange={(e) => setVendorCompanyName(e.target.value)}
                    placeholder="e.g. Apex Stitching Solutions"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-[#1D4ED8] rounded-xl font-medium outline-none text-xs sm:text-sm"
                    required={assignVendorNow}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Person <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-[#1D4ED8] rounded-xl font-medium outline-none text-xs sm:text-sm"
                      required={assignVendorNow}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-[#1D4ED8] rounded-xl font-mono font-medium outline-none text-xs sm:text-sm"
                      required={assignVendorNow}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vendor Notes / Rate / Terms
                  </label>
                  <input
                    type="text"
                    value={vendorNotes}
                    onChange={(e) => setVendorNotes(e.target.value)}
                    placeholder="Rate per piece, jobwork terms, turn-around time..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-[#1D4ED8] rounded-xl font-medium outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Module...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Module</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
