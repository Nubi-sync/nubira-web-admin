'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Plus,
  Scissors,
  User,
  Clock,
  Layers,
  CheckCircle2,
  Calendar,
  Building2,
  Sparkles,
  Printer,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { StitchingWorker, StitchingTaskAllocation } from '../types/stitching'
import { saveStitchingTaskAllocation } from '../utils/stitchingFloorStorage'
import { saveStitchingTaskAllocationAction } from '../actions'

interface AddTaskAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  workers: StitchingWorker[]
  selectedBuyer?: any
  availableBuyers?: any[]
  availableArticles?: Array<{ style_number: string; category?: string }>
  inHandPieces?: number
  sourceDepartment?: string
  routeBadge?: string
  onSuccess?: (task: StitchingTaskAllocation) => void
  onOpenAddWorkerModal?: () => void
  companyName?: string
}

export function AddTaskAllocationModal({
  isOpen,
  onClose,
  workers,
  selectedBuyer,
  availableBuyers = [],
  availableArticles = [],
  inHandPieces = 0,
  sourceDepartment = 'Cutting Floor',
  routeBadge = 'Direct Cut & Sew',
  onSuccess,
  onOpenAddWorkerModal,
  companyName
}: AddTaskAllocationModalProps) {
  const [workerId, setWorkerId] = useState('')
  const [activeBuyerId, setActiveBuyerId] = useState('')
  const [lotNumber, setLotNumber] = useState('LOT-2026-081')
  const [articleStyle, setArticleStyle] = useState('')
  const [targetQty, setTargetQty] = useState('500')
  const [allotedHours, setAllotedHours] = useState('4.0')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true

      if (workers.length > 0) {
        setWorkerId(workers[0].id)
      }

      if (selectedBuyer) {
        setActiveBuyerId(selectedBuyer.id || '')
        setArticleStyle(selectedBuyer.linked_article_number || selectedBuyer.buyer_code || 'ART-DIRECT')
      } else if (availableBuyers.length > 0) {
        setActiveBuyerId(availableBuyers[0].id || '')
        setArticleStyle(availableBuyers[0].linked_article_number || availableBuyers[0].buyer_code || 'ART-DIRECT')
      } else if (availableArticles.length > 0) {
        setArticleStyle(availableArticles[0].style_number)
      } else {
        setArticleStyle('DEMO-101-06')
      }

      setLotNumber(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`)
      const initialQty = inHandPieces > 0 ? String(Math.min(inHandPieces, 1000)) : '500'
      setTargetQty(initialQty)
      setAllotedHours('4.0')
      
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      setDueDate(tomorrow)
      setNotes('')
    } else if (!isOpen) {
      wasOpenRef.current = false
    }
  }, [isOpen, selectedBuyer, availableBuyers, inHandPieces])

  if (!isOpen) return null

  const selectedWorkerObj = workers.find(w => w.id === workerId) || workers[0]
  const matchedBuyer = availableBuyers.find(b => b.id === activeBuyerId) || selectedBuyer
  const parsedQty = parseInt(targetQty) || 0
  const parsedHours = parseFloat(allotedHours) || 4.0
  const isZeroInHand = inHandPieces <= 0
  const isExceedingInHand = inHandPieces > 0 && parsedQty > inHandPieces

  const handleBuyerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setActiveBuyerId(id)
    const b = availableBuyers.find(buyer => buyer.id === id)
    if (b) {
      if (b.linked_article_number) {
        setArticleStyle(b.linked_article_number)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (workers.length === 0) {
      toast.error('Please register at least one tailor first.')
      onOpenAddWorkerModal?.()
      return
    }

    if (!selectedWorkerObj) {
      toast.error('Please select an assigned tailor.')
      return
    }

    if (parsedQty <= 0) {
      toast.error('Please enter a valid piece quantity.')
      return
    }

    setIsSubmitting(true)

    try {
      const taskRef = `STK-${Date.now().toString().slice(-6)}`
      const buyerName = matchedBuyer?.buyer_name || matchedBuyer?.brand_name || 'Standard Production'
      
      const newTask: StitchingTaskAllocation = {
        id: `stk-${Date.now()}`,
        task_ref: taskRef,
        lot_number: lotNumber.trim() || 'LOT-DEFAULT',
        po_number: matchedBuyer?.po_number || undefined,
        buyer_id: matchedBuyer?.id,
        buyer_name: buyerName,
        article_name: articleStyle.trim() || 'Standard Article',
        style_number: articleStyle.trim() || undefined,
        source_department: sourceDepartment,
        operation_type: 'Full Garment Assembly',
        machine_type: 'Single Needle Lockstitch (SNLS)',
        target_quantity: parsedQty,
        completed_quantity: 0,
        rejected_quantity: 0,
        alloted_hours: parsedHours,
        worker_id: selectedWorkerObj.id,
        worker_name: selectedWorkerObj.worker_name,
        worker_phone: selectedWorkerObj.phone_number,
        status: 'PENDING',
        due_date: dueDate || new Date(Date.now() + parsedHours * 3600 * 1000).toISOString(),
        priority: 'NORMAL',
        company_name: companyName,
        notes: notes.trim() || undefined,
        created_at: new Date().toISOString()
      }

      // Save locally for instant UI update
      saveStitchingTaskAllocation(newTask, companyName)

      // Sync to database via server action
      await saveStitchingTaskAllocationAction(newTask)

      toast.success(`Allocated ${parsedQty} pcs of ${newTask.article_name} to ${newTask.worker_name}!`)
      onSuccess?.(newTask)
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to allocate sewing task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#FAF7F0] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shadow-xs">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Assign Sewing Task / Lot
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Allocate incoming cut/embellished garment panels to tailor
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Upstream Route & In-Hand Stock Info Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#3A3564] shrink-0">
                {sourceDepartment.includes('Print') ? (
                  <Printer className="w-4 h-4 text-emerald-600" />
                ) : sourceDepartment.includes('Embroidery') ? (
                  <Sparkles className="w-4 h-4 text-purple-600" />
                ) : (
                  <Scissors className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    Source: {sourceDepartment}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-bold">
                    {routeBadge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Pieces routed according to article tech pack specifications
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] font-semibold uppercase text-slate-400">In-Hand Available</div>
              <div className={`text-base font-bold font-mono ${inHandPieces > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                {inHandPieces.toLocaleString('en-IN')} <span className="text-[11px] font-normal text-slate-400">pcs</span>
              </div>
            </div>
          </div>

          {/* Buyer Contract & Article Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Buyer / Brand Contract
              </label>
              <div className="relative">
                <select
                  value={activeBuyerId}
                  onChange={handleBuyerSelect}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-medium text-slate-900 cursor-pointer"
                >
                  {availableBuyers.length > 0 ? (
                    availableBuyers.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.buyer_name || b.brand_name} {b.buyer_code ? `(${b.buyer_code})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="">Standard Direct Production</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Article Style Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ART-6064 / POLO-101"
                value={articleStyle}
                onChange={(e) => setArticleStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
              />
            </div>
          </div>

          {/* Lot Number & Target Pieces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Lot / Bundle Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LOT-2026-081"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Target Pieces (Pcs) <span className="text-rose-500">*</span>
                </label>
                {inHandPieces > 0 && (
                  <button
                    type="button"
                    onClick={() => setTargetQty(String(inHandPieces))}
                    className="text-[10px] font-bold text-[#3A3564] hover:underline cursor-pointer"
                  >
                    Max ({inHandPieces})
                  </button>
                )}
              </div>
              <input
                type="number"
                required
                min="1"
                value={targetQty}
                onChange={(e) => setTargetQty(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
              />
            </div>
          </div>

          {/* Assigned Tailor Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Assigned Sewing Tailor <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenAddWorkerModal?.()
                }}
                className="text-[11px] font-bold text-[#3A3564] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add New Tailor</span>
              </button>
            </div>

            {workers.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                <span>No tailors registered on floor roster yet.</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenAddWorkerModal?.()
                  }}
                  className="px-2.5 py-1 bg-[#3A3564] text-white rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  Register Now
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-medium text-slate-900 cursor-pointer"
                >
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.worker_name} (+91 {w.phone_number})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Allotted Hours & Target Delivery Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Allotted Hours
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.5"
                  value={allotedHours}
                  onChange={(e) => setAllotedHours(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Due Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Notes / Special Stitching Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Floor Notes & Assembly Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Ensure 12 SPI on collar band, double stitch pocket bag..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || workers.length === 0}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2C274E] rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Allocating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Allocation</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
