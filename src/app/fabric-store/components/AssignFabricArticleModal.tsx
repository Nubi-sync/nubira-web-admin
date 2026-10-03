'use client'

import React, { useState, useEffect } from 'react'
import { X, Layers, CheckCircle2, AlertCircle } from 'lucide-react'
import { FabricAllocationItem, updateFabricArticleAllocationAction } from '../actions'

interface AssignFabricArticleModalProps {
  fabric: FabricAllocationItem | null
  activeArticles: Array<{ artNo: string; label: string }>
  isOpen: boolean
  onClose: () => void
  onSuccess: (fabricId: string, articleNo: string, bookedMeters: number) => void
  companyName: string
}

export function AssignFabricArticleModal({
  fabric,
  activeArticles,
  isOpen,
  onClose,
  onSuccess,
  companyName
}: AssignFabricArticleModalProps) {
  const [selectedArticle, setSelectedArticle] = useState<string>('')
  const [customArticle, setCustomArticle] = useState<string>('')
  const [allocatedMeters, setAllocatedMeters] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (fabric) {
      setSelectedArticle(fabric.bookedForArticle || (activeArticles[0]?.artNo || ''))
      setCustomArticle('')
      setAllocatedMeters(fabric.bookedMeters || fabric.totalMeters)
      setErrorMsg(null)
    }
  }, [fabric, activeArticles])

  if (!isOpen || !fabric) return null

  const targetArticle = selectedArticle === 'CUSTOM' ? customArticle.trim() : selectedArticle.trim()
  const totalMeters = fabric.totalMeters || 0
  const freeMeters = Math.max(0, totalMeters - allocatedMeters)
  const allocPercent = totalMeters > 0 ? Math.min(100, Math.round((allocatedMeters / totalMeters) * 100)) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (allocatedMeters < 0) {
      setErrorMsg('Allocated meters cannot be negative.')
      return
    }

    if (allocatedMeters > totalMeters) {
      setErrorMsg(`Cannot allocate ${allocatedMeters}m. Only ${totalMeters}m available in store.`)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await updateFabricArticleAllocationAction({
        inventoryId: fabric.id,
        articleNo: targetArticle,
        bookedMeters: allocatedMeters,
        companyName
      })

      if (res.error) {
        setErrorMsg(res.error)
      } else {
        onSuccess(fabric.id, targetArticle, allocatedMeters)
        onClose()
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update article allocation')
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
              <Layers className="w-5 h-5 text-[#0B1220]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-[#0B1220]">
                Assign Cloth to Article
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {fabric.fabricType} • {fabric.color}
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

          {/* Current Cloth Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Total Cloth in Store</span>
              <span className="text-base font-bold font-mono text-[#0B1220]">
                {totalMeters.toLocaleString()} <span className="text-xs font-normal text-slate-500">meters</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium block">Godown Location</span>
              <span className="font-mono font-bold text-slate-700">{fabric.rackLocation}</span>
            </div>
          </div>

          {/* Target Article Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Article / Style
            </label>
            <select
              value={selectedArticle}
              onChange={(e) => setSelectedArticle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all cursor-pointer"
            >
              <option value="">-- No Article (Free Godown Stock) --</option>
              {activeArticles.map(art => (
                <option key={art.artNo} value={art.artNo}>
                  {art.label}
                </option>
              ))}
              <option value="CUSTOM">+ Enter Custom Article / PO...</option>
            </select>
          </div>

          {selectedArticle === 'CUSTOM' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Custom Article Code / PO
              </label>
              <input
                type="text"
                value={customArticle}
                onChange={(e) => setCustomArticle(e.target.value)}
                placeholder="e.g. ART-2026-99"
                className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm font-medium border border-slate-300 rounded-xl focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all"
                required
              />
            </div>
          )}

          {/* Allocation Meters */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Meters to Assign to Article
              </label>
              <button
                type="button"
                onClick={() => setAllocatedMeters(totalMeters)}
                className="text-[11px] font-bold text-[#1D4ED8] hover:underline cursor-pointer"
              >
                Allocate 100% ({totalMeters}m)
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="0"
                max={totalMeters}
                step="1"
                value={allocatedMeters}
                onChange={(e) => setAllocatedMeters(Math.max(0, Math.min(totalMeters, Number(e.target.value) || 0)))}
                className="w-full pl-3.5 pr-14 py-2.5 bg-white text-base font-bold font-mono border border-slate-300 rounded-xl focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all"
              />
              <span className="absolute right-3.5 text-xs font-semibold text-slate-400 pointer-events-none">
                meters
              </span>
            </div>
          </div>

          {/* Allocation Calculation Preview */}
          <div className="p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-[#14C8B4] bg-white space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">
                Assigned to {targetArticle || 'Unassigned'}:
              </span>
              <span className="text-xs font-extrabold font-mono px-2 py-0.5 rounded-full shadow-2xs text-[#0B1220] bg-[#F0FDFA] border border-[#14C8B4]/40 shrink-0">
                {allocPercent}%
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-900">
              <span>{allocatedMeters.toLocaleString()} meters assigned</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#1D4ED8] h-full rounded-full transition-all duration-500"
                style={{ width: `${allocPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-0.5">
              <span>Remaining Free in Store:</span>
              <span className="font-mono font-bold text-slate-900">
                {freeMeters.toLocaleString()} meters
              </span>
            </div>
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
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Saving...' : 'Confirm Allocation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
