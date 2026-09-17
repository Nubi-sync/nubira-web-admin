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
  Building2,
  TableProperties,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { CuttingWorker, CuttingTaskAllocation } from '../types/cutting'
import { saveCuttingTaskAllocation, getCuttingTables, saveCuttingTables } from '../utils/cuttingStorage'
import { saveCuttingTaskAllocationAction } from '../actions'

interface AddTaskAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  workers: CuttingWorker[]
  selectedBuyer?: any
  availableArticles?: Array<{ style_number: string; category?: string; fabric_composition?: string }>
  inHandPieces?: number
  onSuccess?: (task: CuttingTaskAllocation) => void
  onOpenAddWorkerModal?: () => void
}

export function AddTaskAllocationModal({
  isOpen,
  onClose,
  workers,
  selectedBuyer,
  availableArticles = [],
  inHandPieces = 0,
  onSuccess,
  onOpenAddWorkerModal
}: AddTaskAllocationModalProps) {
  const [workerId, setWorkerId] = useState('')
  const [articleStyle, setArticleStyle] = useState('')
  const [pieces, setPieces] = useState<string>('500')
  const [allotedHours, setAllotedHours] = useState<string>('4.0')
  const [tableNumber, setTableNumber] = useState('Table 01')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dynamic Tables List
  const [tablesList, setTablesList] = useState<string[]>(['Table 01', 'Table 02', 'Table 03', 'Table 04'])
  const [isAddingNewTable, setIsAddingNewTable] = useState(false)
  const [newTableInput, setNewTableInput] = useState('')

  const wasOpenRef = useRef(false)

  // Initialize form fields ONLY ONCE when modal is opened
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true

      // Load tables from storage or default
      const savedTables = getCuttingTables()
      if (savedTables && savedTables.length > 0) {
        setTablesList(savedTables.map(t => t.table_number || t.table_name))
      }

      if (workers.length > 0) {
        setWorkerId(workers[0].id)
      }
      if (selectedBuyer?.linked_article_number) {
        setArticleStyle(selectedBuyer.linked_article_number)
      } else if (availableArticles.length > 0) {
        setArticleStyle(availableArticles[0].style_number)
      } else {
        setArticleStyle('DEMO-101-03')
      }

      const initialQty = inHandPieces > 0 ? String(Math.min(inHandPieces, 1000)) : '500'
      setPieces(initialQty)
      setAllotedHours('4.0')
      setNotes('')
      setIsAddingNewTable(false)
      setNewTableInput('')
    } else if (!isOpen) {
      wasOpenRef.current = false
    }
  }, [isOpen])

  if (!isOpen) return null

  const selectedWorkerObj = workers.find(w => w.id === workerId) || workers[0]
  const parsedHours = parseFloat(allotedHours) || 4.0
  const piecesCount = parseInt(pieces) || 0

  // Calculate projected deadline
  const calculateDeadline = () => {
    const due = new Date(Date.now() + parsedHours * 3600 * 1000)
    return due.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) +
      `, ` + due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Handle adding a new table
  const handleAddNewTable = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    let nameToAdd = newTableInput.trim()

    if (!nameToAdd) {
      // Auto-generate next table number e.g. Table 05
      const tableCount = tablesList.length + 1
      nameToAdd = `Table ${tableCount.toString().padStart(2, '0')}`
    }

    if (!tablesList.includes(nameToAdd)) {
      const updated = [...tablesList, nameToAdd]
      setTablesList(updated)

      // Also persist to tables storage
      try {
        const existing = getCuttingTables()
        const newEntry = {
          id: `tbl-${Date.now()}`,
          table_number: nameToAdd,
          table_name: `Automated Vacuum ${nameToAdd}`,
          length_meters: 36,
          width_inches: 68,
          vacuum_type: 'Multi-Zone High Vacuum',
          auto_cutter_model: 'Gerber Paragon HX-500',
          status: 'IDLE' as const
        }
        saveCuttingTables([...existing, newEntry])
      } catch {}

      setTableNumber(nameToAdd)
      toast.success(`${nameToAdd} added and selected.`)
    } else {
      setTableNumber(nameToAdd)
    }

    setNewTableInput('')
    setIsAddingNewTable(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedWorkerObj) {
      toast.error('Please select or register a cutting floor worker.')
      return
    }

    if (!articleStyle.trim()) {
      toast.error('Please enter an article style reference.')
      return
    }

    if (isNaN(piecesCount) || piecesCount <= 0) {
      toast.error('Please specify a valid pieces count.')
      return
    }

    if (isNaN(parsedHours) || parsedHours <= 0) {
      toast.error('Please enter valid alloted hours.')
      return
    }

    setIsSubmitting(true)

    try {
      const dueTimestamp = new Date(Date.now() + parsedHours * 3600 * 1000).toISOString()
      const taskRef = `CUT-${Date.now().toString().slice(-4)}`
      const taskId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`

      const newTask: CuttingTaskAllocation = {
        id: taskId,
        task_ref: taskRef,
        buyer_id: selectedBuyer?.id,
        buyer_name: selectedBuyer?.buyer_name || 'Direct Buyer',
        article_number: articleStyle.trim(),
        article_name: selectedBuyer?.linked_article_name || `${articleStyle} Garment Cut Job`,
        worker_id: selectedWorkerObj.id,
        worker_name: selectedWorkerObj.worker_name,
        worker_phone: selectedWorkerObj.phone_number,
        table_number: tableNumber,
        pieces_to_cut: piecesCount,
        completed_pieces: 0,
        alloted_hours: parsedHours,
        due_time: dueTimestamp,
        notes: notes.trim(),
        status: 'ASSIGNED',
        created_at: new Date().toISOString()
      }

      saveCuttingTaskAllocation(newTask)
      const serverRes = await saveCuttingTaskAllocationAction(newTask)
      if (serverRes?.data?.id && serverRes.data.id !== newTask.id) {
        newTask.id = serverRes.data.id
        saveCuttingTaskAllocation(newTask)
      }

      toast.success(`Task #${taskRef} allocated to ${selectedWorkerObj.worker_name} (${piecesCount.toLocaleString('en-IN')} Pcs)!`)

      if (onSuccess) onSuccess(newTask)
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign cutting task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <TableProperties className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Assign Cutting Task Row
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Allocate article pieces to worker with strict timeline &amp; table assignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-black/10 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto">
          
          {/* Worker Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Select Floor Worker <span className="text-red-500">*</span>
              </label>
              {onOpenAddWorkerModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenAddWorkerModal()
                  }}
                  className="text-xs font-mono font-bold text-[#3A3564] hover:underline cursor-pointer"
                >
                  + Add New Worker
                </button>
              )}
            </div>

            {workers.length === 0 ? (
              <div className="p-3.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-xs text-amber-800 flex items-center justify-between">
                <span>No workers registered yet.</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    if (onOpenAddWorkerModal) onOpenAddWorkerModal()
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#3A3564] text-white font-mono font-bold text-[11px] cursor-pointer"
                >
                  Create Worker Now
                </button>
              </div>
            ) : (
              <select
                value={workerId}
                onChange={e => setWorkerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 focus:bg-white text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#3A3564] transition-all cursor-pointer"
              >
                {workers.map(w => {
                  const roleLabel = w.role || (w.roles && w.roles.length > 0 ? w.roles.map(r => r.replace(/_/g, ' ')).join(', ') : 'Knife Cutter')
                  return (
                    <option key={w.id} value={w.id}>
                      {w.worker_name} — +91 {w.phone_number} ({roleLabel})
                    </option>
                  )
                })}
              </select>
            )}
          </div>

          {/* Article & Style Reference (Read-Only Auto-Assigned) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Article Style Reference
              </label>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
                Contract Locked
              </span>
            </div>
            <input
              type="text"
              readOnly
              tabIndex={-1}
              value={articleStyle}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] text-sm font-mono font-bold text-slate-900 cursor-not-allowed select-none focus:outline-hidden shadow-2xs"
            />
            {selectedBuyer && (
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Contracted Buyer: <strong>{selectedBuyer.buyer_name}</strong>
              </p>
            )}
          </div>

          {/* Pieces & Alloted Hours in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Pieces to Cut (Fully Editable Input) */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Pieces to Cut <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={pieces}
                  onChange={e => setPieces(e.target.value)}
                  placeholder="Enter pieces count"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 focus:bg-white text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#3A3564] transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  Pcs
                </span>
              </div>
              {inHandPieces > 0 && (
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  In Hand Queue: <strong>{inHandPieces.toLocaleString('en-IN')} Pcs available</strong>
                </p>
              )}
            </div>

            {/* Time Alloted (Hours) */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Time Alloted (Hours) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={allotedHours}
                  onChange={e => setAllotedHours(e.target.value)}
                  placeholder="4.0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 focus:bg-white text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#3A3564] transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  Hrs
                </span>
              </div>
              <p className="text-[11px] text-slate-900 font-mono mt-1">
                Due: <strong>{calculateDeadline()}</strong>
              </p>
            </div>

          </div>

          {/* Table / Vacuum Station Allocation with Add Table Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Assigned Cutting Table / Vacuum Station
              </label>
              {!isAddingNewTable && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewTable(true)}
                  className="text-xs font-mono font-bold text-[#3A3564] hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Table</span>
                </button>
              )}
            </div>

            {isAddingNewTable && (
              <div className="mb-2.5 p-3 bg-[#FAF7F0] border border-black/10 rounded-xl flex items-center gap-2 animate-in fade-in">
                <input
                  type="text"
                  value={newTableInput}
                  onChange={e => setNewTableInput(e.target.value)}
                  placeholder={`e.g. Table ${tablesList.length + 1}`}
                  className="flex-1 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-black/10 rounded-lg focus:outline-hidden focus:border-[#3A3564]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleAddNewTable()}
                  className="px-3 py-1.5 bg-[#3A3564] text-white text-xs font-mono font-bold rounded-lg cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNewTable(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tablesList.map(tbl => (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => setTableNumber(tbl)}
                  className={`py-2 px-1 text-center rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer truncate ${
                    tableNumber === tbl
                      ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-xs'
                      : 'bg-[#FAF7F0] text-slate-700 border-black/10 hover:bg-white'
                  }`}
                  title={tbl}
                >
                  {tbl}
                </button>
              ))}

              {/* + Add Table Quick Button */}
              <button
                type="button"
                onClick={() => handleAddNewTable()}
                className="py-2 px-1 text-center rounded-xl border border-dashed border-black/20 bg-white hover:bg-[#FAF7F0] text-slate-600 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Table {tablesList.length + 1}</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Shift Instructions / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Ensure notch alignment on hood panels"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#3A3564] transition-all"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-mono font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || workers.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Allocating...' : 'Allocate Task'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
