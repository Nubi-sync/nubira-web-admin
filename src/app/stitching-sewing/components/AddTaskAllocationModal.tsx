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
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'
import { StitchingWorker, StitchingTaskAllocation } from '../types/stitching'
import { saveStitchingTaskAllocation } from '../utils/stitchingFloorStorage'
import { saveStitchingTaskAllocationAction } from '../actions'

interface AddTaskAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  workers: StitchingWorker[]
  onSuccess?: (task: StitchingTaskAllocation) => void
  onOpenAddWorkerModal?: () => void
  companyName?: string
}

const SEWING_OPERATIONS = [
  'Full Garment Assembly',
  'Collar Making & Neck Attachment',
  'Sleeve Hem & Armhole Join',
  'Side Seam & Bottom Hemming',
  'Placket & Front Button Tack',
  'Cuff & Pocket Attachment',
  'Waistband Elastic Join & Kansai',
  'Overlock Seam Reinforcement',
  'Care Label & Brand Loop Stitch'
]

const MACHINES = [
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

export function AddTaskAllocationModal({
  isOpen,
  onClose,
  workers,
  onSuccess,
  onOpenAddWorkerModal,
  companyName
}: AddTaskAllocationModalProps) {
  const [workerId, setWorkerId] = useState('')
  const [lotNumber, setLotNumber] = useState('LOT-2026-081')
  const [articleName, setArticleName] = useState('Classic Polo / Premium Tee')
  const [operationType, setOperationType] = useState('Full Garment Assembly')
  const [machineType, setMachineType] = useState('Single Needle Lockstitch (SNLS)')
  const [targetQty, setTargetQty] = useState('450')
  const [pieceRate, setPieceRate] = useState('14.50')
  const [allotedHours, setAllotedHours] = useState('8.0')
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true
      if (workers.length > 0) {
        setWorkerId(workers[0].id)
        if (workers[0].piece_rate_inr) {
          setPieceRate(String(workers[0].piece_rate_inr))
        }
      }
      setLotNumber(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`)
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      setDueDate(tomorrow)
    } else if (!isOpen) {
      wasOpenRef.current = false
    }
  }, [isOpen, workers])

  if (!isOpen) return null

  const selectedWorkerObj = workers.find(w => w.id === workerId) || workers[0]

  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setWorkerId(id)
    const matched = workers.find(w => w.id === id)
    if (matched?.piece_rate_inr) {
      setPieceRate(String(matched.piece_rate_inr))
    }
    if (matched?.machine_specialty) {
      setMachineType(matched.machine_specialty)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (workers.length === 0) {
      toast.error('Please register at least one tailor first.')
      onOpenAddWorkerModal?.()
      return
    }

    const parsedQty = parseInt(targetQty)
    if (isNaN(parsedQty) || parsedQty <= 0) {
      toast.error('Please enter a valid target piece quantity.')
      return
    }

    const parsedRate = parseFloat(pieceRate) || 12
    const parsedHours = parseFloat(allotedHours) || 8

    setIsSubmitting(true)

    try {
      const taskRef = `STK-${Date.now().toString().slice(-6)}`
      const newTask: StitchingTaskAllocation = {
        id: `stk-${Date.now()}`,
        task_ref: taskRef,
        lot_number: lotNumber.trim() || 'LOT-DEFAULT',
        article_name: articleName.trim() || 'Standard Article',
        operation_type: operationType,
        machine_type: machineType,
        target_quantity: parsedQty,
        completed_quantity: 0,
        rejected_quantity: 0,
        piece_rate_inr: parsedRate,
        alloted_hours: parsedHours,
        worker_id: selectedWorkerObj?.id || workerId,
        worker_name: selectedWorkerObj?.worker_name || 'Tailor',
        worker_phone: selectedWorkerObj?.phone_number,
        status: 'PENDING',
        due_date: dueDate || undefined,
        priority,
        company_name: companyName,
        notes: notes.trim() || undefined,
        created_at: new Date().toISOString()
      }

      // Save locally for instant UI response
      saveStitchingTaskAllocation(newTask, companyName)

      // Save to database
      const res = await saveStitchingTaskAllocationAction(newTask)

      if (res.success) {
        toast.success(`Allocated ${parsedQty} pcs to tailor "${selectedWorkerObj?.worker_name}"!`)
        onSuccess?.(res.data || newTask)
      } else {
        toast.success(`Task allocation saved locally!`)
        onSuccess?.(newTask)
      }

      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to allocate stitching task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shadow-xs">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Assign Sewing & Stitching Task
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Allocate production bundle & piece-rate quota to tailoring operator
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Tailor Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Assigned Tailor / Operator <span className="text-rose-500">*</span>
              </label>
              {workers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenAddWorkerModal?.()
                  }}
                  className="text-[11px] font-bold text-[#3A3564] hover:underline cursor-pointer"
                >
                  + Add New Tailor
                </button>
              )}
            </div>

            {workers.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 flex items-center justify-between">
                <span className="text-xs text-amber-800 font-medium">No tailors registered on this floor yet.</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenAddWorkerModal?.()
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#3A3564] rounded-lg cursor-pointer"
                >
                  Register First Tailor
                </button>
              </div>
            ) : (
              <select
                value={workerId}
                onChange={handleWorkerChange}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-medium text-slate-900 cursor-pointer"
              >
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.worker_name} — {w.machine_specialty || w.role || 'Tailor'} (+91 {w.phone_number})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Lot & Article Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Lot / Cut Bundle # <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="e.g. LOT-2026-081"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Article / Style Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={articleName}
                onChange={(e) => setArticleName(e.target.value)}
                placeholder="e.g. Mens Polo Shirt 220 GSM"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Operation & Machine Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Sewing Operation
              </label>
              <select
                value={operationType}
                onChange={(e) => setOperationType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-medium text-slate-900 cursor-pointer"
              >
                {SEWING_OPERATIONS.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Machine Type
              </label>
              <select
                value={machineType}
                onChange={(e) => setMachineType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-medium text-slate-900 cursor-pointer"
              >
                {MACHINES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Qty & Piece Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Quantity (pcs) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={targetQty}
                onChange={(e) => setTargetQty(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Piece Rate (₹/pc)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={pieceRate}
                  onChange={(e) => setPieceRate(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Shift Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={allotedHours}
                onChange={(e) => setAllotedHours(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
              />
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Floor Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['NORMAL', 'HIGH', 'URGENT'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                      priority === p
                        ? p === 'URGENT'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                          : p === 'HIGH'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                            : 'bg-[#3A3564] text-white border-[#3A3564] shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Workstation Instructions / Quality Spec
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Ensure SPI 11-12 on collar, check needle tension before bulk run."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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
                  <span>Assigning Quota...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Allocate Sewing Task</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
