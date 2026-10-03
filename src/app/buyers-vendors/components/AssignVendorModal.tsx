'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Building2,
  User,
  Phone,
  Layers,
  CheckCircle2,
  FileText,
  Trash2,
  Loader2
} from 'lucide-react'
import { ModuleVendorItem, assignModuleVendorAction, removeModuleVendorAction } from '../actions'

interface AssignVendorModalProps {
  isOpen: boolean
  moduleItem: ModuleVendorItem | null
  onClose: () => void
  onSuccess: (updatedModule: ModuleVendorItem) => void
  onRemoveSuccess: (moduleRoute: string) => void
}

export function AssignVendorModal({
  isOpen,
  moduleItem,
  onClose,
  onSuccess,
  onRemoveSuccess
}: AssignVendorModalProps) {
  const [companyName, setCompanyName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (moduleItem) {
      if (moduleItem.assignedVendor) {
        setCompanyName(moduleItem.assignedVendor.companyName || '')
        setContactPerson(moduleItem.assignedVendor.contactPerson || '')
        setPhone(moduleItem.assignedVendor.phone || '')
        setNotes(moduleItem.assignedVendor.notes || '')
      } else {
        setCompanyName('')
        setContactPerson('')
        setPhone('')
        setNotes('')
      }
      setError(null)
    }
  }, [moduleItem, isOpen])

  if (!isOpen || !moduleItem) return null

  const isEditing = Boolean(moduleItem.assignedVendor)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanCompany = companyName.trim()
    const cleanPerson = contactPerson.trim()
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10)

    if (!cleanCompany) {
      setError('Please enter Company / Vendor Name.')
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

    setIsSubmitting(true)
    try {
      const res = await assignModuleVendorAction({
        moduleRoute: moduleItem.moduleRoute,
        moduleName: moduleItem.moduleName,
        companyName: cleanCompany,
        contactPerson: cleanPerson,
        phone: cleanPhone,
        notes: notes.trim()
      })

      if (res.success) {
        const updated: ModuleVendorItem = {
          ...moduleItem,
          assignedVendor: {
            id: res.data?.id || `vnd-${Date.now()}`,
            companyName: cleanCompany,
            contactPerson: cleanPerson,
            phone: cleanPhone,
            notes: notes.trim(),
            isActive: true
          }
        }
        onSuccess(updated)
        onClose()
      } else {
        setError(res.error || 'Failed to save vendor assignment')
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm(`Are you sure you want to remove the vendor assigned to ${moduleItem.moduleName}?`)) {
      return
    }

    setIsSubmitting(true)
    try {
      const res = await removeModuleVendorAction(moduleItem.moduleRoute)
      if (res.success) {
        onRemoveSuccess(moduleItem.moduleRoute)
        onClose()
      } else {
        setError(res.error || 'Failed to remove vendor')
      }
    } catch (err: any) {
      setError(err?.message || 'Error removing vendor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#F8FAFC] border-b border-slate-200/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                Module {moduleItem.moduleCode}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Vendor Assignment
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)]">
              {isEditing ? 'Edit Module Vendor' : 'Assign Module Vendor'}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {moduleItem.moduleName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-[#0B1220] hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-[#0B1220]">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {/* 1. Company Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
              Vendor Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Apex Tex Job Work Unit / Sunrise Mills"
              className="min-h-[44px] w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs"
            />
          </div>

          {/* 2. Contact Person Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#14C8B4]" />
              Contact Person Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              className="min-h-[44px] w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs"
            />
          </div>

          {/* 3. Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="min-h-[44px] px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-700 flex items-center justify-center shrink-0">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="min-h-[44px] flex-1 px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-mono font-bold border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* 4. Notes / Instructions (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Special Notes / Work Scope <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Handles all bulk reactive printing jobs with 48h turnaround..."
              className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {isEditing ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isSubmitting}
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Vendor</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="min-h-[42px] px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[42px] px-5 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isEditing ? 'Update Vendor' : 'Assign Vendor'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
