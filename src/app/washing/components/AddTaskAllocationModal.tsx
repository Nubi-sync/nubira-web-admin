'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  X, 
  Plus, 
  Waves, 
  User, 
  Clock, 
  Layers, 
  CheckCircle2, 
  TableProperties
} from 'lucide-react'
import { toast } from 'sonner'
import { WashingWorker, WashingTaskAllocation } from '../types/washing'
import { saveWashingTaskAllocation } from '../utils/washingFloorStorage'
import { saveWashingTaskAllocationAction } from '../actions'

interface AddTaskAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  workers: WashingWorker[]
  selectedBuyer?: any
  availableArticles?: Array<{ style_number: string; category?: string; fabric_composition?: string }>
  inHandPieces?: number
  onSuccess?: (task: WashingTaskAllocation) => void
  onOpenAddWorkerModal?: () => void
  companyName?: string
}

export function AddTaskAllocationModal({
  isOpen,
  onClose,
  workers,
  selectedBuyer,
  availableArticles = [],
  inHandPieces = 0,
  onSuccess,
  onOpenAddWorkerModal,
  companyName
}: AddTaskAllocationModalProps) {
  const [workerId, setWorkerId] = useState('')
  const [articleStyle, setArticleStyle] = useState('')
  const [pieces, setPieces] = useState<string>('500')
  const [allotedHours, setAllotedHours] = useState<string>('4.0')
  const [tableNumber, setTableNumber] = useState('Washer 01 (Tumbler 600kg)')
  const [washRecipe, setWashRecipe] = useState('Bio-Enzyme Wash 55°C')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true

      if (workers.length > 0) {
        setWorkerId(workers[0].id)
      }
      if (selectedBuyer?.linked_article_number) {
        setArticleStyle(selectedBuyer.linked_article_number)
      } else if (availableArticles.length > 0) {
        setArticleStyle(availableArticles[0].style_number)
      } else {
        setArticleStyle('WASH-101-07')
      }

      const initialQty = inHandPieces > 0 ? String(Math.min(inHandPieces, 1000)) : '500'
      setPieces(initialQty)
      setAllotedHours('4.0')
      setNotes('')
    } else if (!isOpen) {
      wasOpenRef.current = false
    }
  }, [isOpen])

  if (!isOpen) return null

  const selectedWorkerObj = workers.find(w => w.id === workerId) || workers[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (workers.length === 0) {
      toast.error('Please register at least one washing operator first.')
      onOpenAddWorkerModal?.()
      return
    }

    const parsedPieces = parseInt(pieces)
    if (isNaN(parsedPieces) || parsedPieces <= 0) {
      toast.error('Please enter a valid piece quantity greater than 0.')
      return
    }

    const parsedHours = parseFloat(allotedHours)
    if (isNaN(parsedHours) || parsedHours <= 0) {
      toast.error('Please enter valid alloted hours.')
      return
    }

    setIsSubmitting(true)

    try {
      const now = new Date()
      const dueTime = new Date(now.getTime() + parsedHours * 3600 * 1000).toISOString()
      const taskRef = `WSH-${Date.now().toString().slice(-6)}`

      const newTask: WashingTaskAllocation = {
        id: `wtask-${Date.now()}`,
        task_ref: taskRef,
        buyer_id: selectedBuyer?.id || null,
        buyer_name: selectedBuyer?.buyer_name || 'Direct Buyer',
        article_number: articleStyle.trim().toUpperCase() || 'WASH-101-07',
        article_name: selectedBuyer?.linked_article_name || null,
        worker_id: selectedWorkerObj?.id || null,
        worker_name: selectedWorkerObj?.worker_name || 'Washer Operator',
        worker_phone: selectedWorkerObj?.phone_number || null,
        table_number: tableNumber,
        machine_number: tableNumber,
        pieces_to_wash: parsedPieces,
        completed_pieces: 0,
        alloted_hours: parsedHours,
        due_time: dueTime,
        wash_recipe: washRecipe,
        notes: notes.trim() || null,
        company_name: companyName,
        status: 'ASSIGNED',
        assigned_at: now.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }

      // Save locally
      saveWashingTaskAllocation(newTask)

      // Save to server
      const res = await saveWashingTaskAllocationAction(newTask)
      if (res.success) {
        toast.success(`Task #${taskRef} created! ${parsedPieces.toLocaleString('en-IN')} pcs assigned to ${selectedWorkerObj?.worker_name}.`)
        onSuccess?.(res.data || newTask)
      } else {
        toast.success(`Task #${taskRef} assigned on floor!`)
        onSuccess?.(newTask)
      }

      onClose()
    } catch (err: any) {
      console.error('Failed to create washing task:', err)
      toast.error(err.message || 'Failed to create washing task.')
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
        className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-lg w-full overflow-hidden transition-all flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FAF7F0] border-b border-black/10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <TableProperties className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Assign Washing Floor Task
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Allocate garment washing quotas &amp; set shift deadline
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">

          {/* Buyer Contract Banner */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-mono text-[11px] font-bold text-slate-400 uppercase">
                Active Buyer Contract
              </div>
              <div className="font-bold text-slate-900 mt-0.5">
                {selectedBuyer ? selectedBuyer.buyer_name : 'Direct Buyer Floor Queue'}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[11px] font-bold text-slate-400 uppercase">
                In Hand Pieces
              </div>
              <div className="font-mono font-bold text-[#3A3564]">
                {inHandPieces.toLocaleString('en-IN')} pcs
              </div>
            </div>
          </div>

          {/* Worker Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Designated Washer Operator <span className="text-rose-500">*</span>
              </label>
              {workers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenAddWorkerModal?.()
                  }}
                  className="text-[11px] font-mono font-bold text-[#3A3564] hover:underline cursor-pointer"
                >
                  + Add New Worker
                </button>
              )}
            </div>

            {workers.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-center">
                <p className="text-xs text-amber-800 font-semibold mb-2">
                  No washing operators enrolled for this factory yet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenAddWorkerModal?.()
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3A3564] text-white text-xs font-mono font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register First Operator</span>
                </button>
              </div>
            ) : (
              <select
                required
                value={workerId}
                onChange={e => setWorkerId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-[#3A3564] font-semibold"
              >
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.worker_name} (+91 {w.phone_number}) • {w.assigned_machine || w.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Article & Recipe Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Article Style No. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={articleStyle}
                onChange={e => setArticleStyle(e.target.value)}
                placeholder="e.g. WASH-101-07"
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50/50 focus:bg-white focus:outline-hidden font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Wash Recipe / Cycle
              </label>
              <select
                value={washRecipe}
                onChange={e => setWashRecipe(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50/50 focus:bg-white focus:outline-hidden font-semibold"
              >
                <option value="Bio-Enzyme Wash 55°C">Bio-Enzyme Wash 55°C</option>
                <option value="Silicon Softening Wash">Silicon Softening Wash</option>
                <option value="Vintage Stone / Acid Wash">Vintage Stone / Acid Wash</option>
                <option value="Desize & Neutralize 45°C">Desize & Neutralize 45°C</option>
                <option value="Normal Garment Wash">Normal Garment Wash</option>
              </select>
            </div>
          </div>

          {/* Pieces & Hours Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Pieces to Wash <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={pieces}
                onChange={e => setPieces(e.target.value)}
                placeholder="500"
                className="w-full px-3 py-2 text-sm rounded-xl border border-black/10 bg-slate-50/50 focus:bg-white focus:outline-hidden font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Alloted Shift Hours <span className="text-rose-500">*</span>
              </label>
              <select
                value={allotedHours}
                onChange={e => setAllotedHours(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50/50 focus:bg-white focus:outline-hidden font-mono font-bold"
              >
                <option value="2.0">2.0 Hours</option>
                <option value="4.0">4.0 Hours (Half Shift)</option>
                <option value="8.0">8.0 Hours (Full Shift)</option>
                <option value="12.0">12.0 Hours (Rush Cycle)</option>
              </select>
            </div>
          </div>

          {/* Machine / Tumbler Unit */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
              Industrial Washer / Tumbler Unit
            </label>
            <select
              value={tableNumber}
              onChange={e => setTableNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden font-semibold"
            >
              <option value="Washer 01 (Tumbler 600kg)">Washer 01 (Tumbler 600kg)</option>
              <option value="Washer 02 (Hydro 400kg)">Washer 02 (Hydro 400kg)</option>
              <option value="Washer 03 (Front Load 300kg)">Washer 03 (Front Load 300kg)</option>
              <option value="Dryer 01 (Steam Tumbler)">Dryer 01 (Steam Tumbler)</option>
              <option value="Dryer 02 (Electric Tumbler)">Dryer 02 (Electric Tumbler)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
              Floor Instructions / Recipe Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Maintain 1:5.0 liquor ratio, neutral pH 5.5"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-black/10 bg-slate-50/50 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Submit Buttons */}
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
              disabled={isSubmitting || workers.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Assign Floor Task</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
