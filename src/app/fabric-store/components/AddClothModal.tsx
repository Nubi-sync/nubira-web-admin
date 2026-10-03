'use client'

import React, { useState } from 'react'
import { X, Plus, CheckCircle2, AlertCircle, Scissors } from 'lucide-react'
import { addFabricClothAction } from '../actions'

interface AddClothModalProps {
  activeArticles: Array<{ artNo: string; label: string }>
  isOpen: boolean
  onClose: () => void
  onSuccess: (newEntry: any) => void
  companyName: string
}

export function AddClothModal({
  activeArticles,
  isOpen,
  onClose,
  onSuccess,
  companyName
}: AddClothModalProps) {
  const [fabricType, setFabricType] = useState('')
  const [color, setColor] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [totalMeters, setTotalMeters] = useState<number | ''>('')
  const [totalRolls, setTotalRolls] = useState<number | ''>(1)
  const [rackLocation, setRackLocation] = useState('RACK-A-01')
  const [bookedArticle, setBookedArticle] = useState('')
  const [customArticle, setCustomArticle] = useState('')
  const [bookedMeters, setBookedMeters] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const targetArticle = bookedArticle === 'CUSTOM' ? customArticle.trim() : bookedArticle.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!fabricType.trim()) {
      setErrorMsg('Please enter Fabric Type / Composition.')
      return
    }
    if (!color.trim()) {
      setErrorMsg('Please specify fabric color.')
      return
    }
    if (!totalMeters || Number(totalMeters) <= 0) {
      setErrorMsg('Please enter valid total meters in store.')
      return
    }

    const tMeters = Number(totalMeters)
    const bMeters = bookedMeters ? Math.min(tMeters, Math.max(0, Number(bookedMeters))) : 0

    setIsSubmitting(true)
    try {
      const res = await addFabricClothAction({
        fabricType: fabricType.trim(),
        color: color.trim(),
        supplierName: supplierName.trim() || undefined,
        totalMeters: tMeters,
        totalRolls: totalRolls ? Number(totalRolls) : 1,
        rackLocation: rackLocation.trim() || 'RACK-01',
        bookedForArticle: targetArticle || undefined,
        bookedMeters: bMeters,
        notes: notes.trim() || undefined,
        companyName
      })

      if (res.error) {
        setErrorMsg(res.error)
      } else {
        onSuccess({
          id: `new-${Date.now()}`,
          fabricType: fabricType.trim(),
          color: color.trim(),
          supplierName: supplierName.trim() || 'Mill Sourcing',
          totalMeters: tMeters,
          totalRolls: totalRolls ? Number(totalRolls) : 1,
          totalWeightKg: 0,
          rackLocation: rackLocation.trim() || 'RACK-01',
          bookedForArticle: targetArticle || null,
          bookedMeters: bMeters,
          availableMeters: tMeters - bMeters,
          allocationPercentage: tMeters > 0 ? Math.round((bMeters / tMeters) * 100) : 0,
          notes: notes.trim() || undefined
        })
        onClose()
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to add cloth entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] text-[#0B1220] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
              <Scissors className="w-5 h-5 text-[#0B1220]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-[#0B1220]">
                Record Cloth Inward / Roll
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Add fabric stock balance and assign to an article.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Fabric Type & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cloth / Fabric Type *
              </label>
              <input
                type="text"
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                placeholder="e.g. Single Jersey 220 GSM"
                className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm font-medium border border-slate-300 rounded-xl focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Color *
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Olive Green / Navy"
                className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm font-medium border border-slate-300 rounded-xl focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Supplier & Rack Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Supplier / Mill Name
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Vardhman Textiles Ltd"
                className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm font-medium border border-slate-300 rounded-xl focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Godown Rack Location
              </label>
              <input
                type="text"
                value={rackLocation}
                onChange={(e) => setRackLocation(e.target.value)}
                placeholder="e.g. RACK-A-04"
                className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm font-medium border border-slate-300 rounded-xl focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Total Meters & Rolls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Total Meters Left in Store *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={totalMeters}
                onChange={(e) => setTotalMeters(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 5000"
                className="w-full px-3.5 py-2.5 bg-white text-base font-bold font-mono border border-slate-300 rounded-xl focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rolls Count
              </label>
              <input
                type="number"
                min="1"
                value={totalRolls}
                onChange={(e) => setTotalRolls(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 25"
                className="w-full px-3.5 py-2.5 bg-white text-base font-bold font-mono border border-slate-300 rounded-xl focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Article Allocation */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Article Allocation (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">
                  Assign to Article
                </label>
                <select
                  value={bookedArticle}
                  onChange={(e) => setBookedArticle(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-xs font-semibold border border-slate-300 rounded-xl focus:border-[#0B1220] outline-none cursor-pointer"
                >
                  <option value="">-- Leave as Free Stock --</option>
                  {activeArticles.map(art => (
                    <option key={art.artNo} value={art.artNo}>
                      {art.label}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Custom Article...</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">
                  Assigned Meters
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalMeters || undefined}
                  value={bookedMeters}
                  onChange={(e) => setBookedMeters(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 4000"
                  className="w-full px-3 py-2 bg-white text-xs font-bold font-mono border border-slate-300 rounded-xl focus:border-[#0B1220] outline-none"
                />
              </div>
            </div>

            {bookedArticle === 'CUSTOM' && (
              <input
                type="text"
                value={customArticle}
                onChange={(e) => setCustomArticle(e.target.value)}
                placeholder="Enter Article / PO code..."
                className="w-full px-3 py-2 bg-white text-xs font-medium border border-slate-300 rounded-xl focus:border-[#0B1220] outline-none"
              />
            )}
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-slate-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Saving...' : 'Add Cloth Inward'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
