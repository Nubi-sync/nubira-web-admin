'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  PackageCheck,
  Boxes,
  Users,
  Building2,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import {
  FinishingInspectionTask,
  ReadyGoodsWorker,
  PackingAssignment
} from '../types/readyGoods'
import { savePackingAssignment } from '../utils/readyGoodsStorage'
import { broadcastFloorEvent } from '@/utils/floorRealtime'

interface AssignPackingModalProps {
  isOpen: boolean
  onClose: () => void
  passedTasks: FinishingInspectionTask[]
  workers: ReadyGoodsWorker[]
  companyName?: string
  onAssignmentCreated: () => void
}

export function AssignPackingModal({
  isOpen,
  onClose,
  passedTasks,
  workers,
  companyName,
  onAssignmentCreated
}: AssignPackingModalProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('')
  const [cartonsCount, setCartonsCount] = useState<number>(5)
  const [piecesPerCarton, setPiecesPerCarton] = useState<number>(20)
  const [cartonPrefix, setCartonPrefix] = useState<string>('CTN-EXP')
  const [targetBay, setTargetBay] = useState<'BAY_3' | 'BAY_4' | 'BAY_5'>('BAY_3')
  const [grossWeightKg, setGrossWeightKg] = useState<number>(12.5)
  const [notes, setNotes] = useState<string>('Standard 1:1 polybag packing, silica pouch enclosed')

  // Filter packers or both
  const packerWorkers = workers.filter(w => w.role === 'PACKER' || w.role === 'BOTH')

  useEffect(() => {
    if (passedTasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(passedTasks[0].id)
      const lot = passedTasks[0]
      const totalPcs = lot.pieces_count || 100
      const defaultCtns = Math.max(1, Math.round(totalPcs / 20))
      setCartonsCount(defaultCtns)
      setPiecesPerCarton(Math.round(totalPcs / defaultCtns))
      setCartonPrefix(`CTN-${lot.order_number || 'EXP'}`)
    }
  }, [passedTasks, isOpen])

  useEffect(() => {
    if (packerWorkers.length > 0 && !selectedWorkerId) {
      setSelectedWorkerId(packerWorkers[0].id)
    } else if (workers.length > 0 && !selectedWorkerId) {
      setSelectedWorkerId(workers[0].id)
    }
  }, [packerWorkers, workers, isOpen])

  if (!isOpen) return null

  const selectedLot = passedTasks.find(t => t.id === selectedTaskId) || passedTasks[0]
  const assignedWorker = workers.find(w => w.id === selectedWorkerId) || packerWorkers[0] || workers[0]
  const totalPackedPieces = cartonsCount * piecesPerCarton

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedLot) {
      toast.error('No approved lot selected for packing.')
      return
    }

    if (!assignedWorker) {
      toast.error('Please assign a floor packing worker.')
      return
    }

    if (cartonsCount <= 0 || piecesPerCarton <= 0) {
      toast.error('Please specify valid carton and piece counts.')
      return
    }

    const assignmentId = `pkg-asn-${Date.now().toString().slice(-6)}`
    const assignmentCode = `PKG-${selectedLot.order_number || 'LOT'}-${Math.floor(100 + Math.random() * 900)}`

    // Generate individual carton numbers
    const cartonNumbers: string[] = []
    for (let i = 1; i <= cartonsCount; i++) {
      const pad = String(i).padStart(2, '0')
      cartonNumbers.push(`${cartonPrefix}-${pad}`)
    }

    const newAssignment: PackingAssignment = {
      id: assignmentId,
      assignment_code: assignmentCode,
      inspection_task_id: selectedLot.id,
      task_code: selectedLot.task_code,
      order_number: selectedLot.order_number,
      buyer: selectedLot.buyer,
      style_name: selectedLot.style_name,
      color: selectedLot.color,
      size: selectedLot.size,
      total_pieces: totalPackedPieces,
      cartons_count: cartonsCount,
      pieces_per_carton: piecesPerCarton,
      packer_worker_id: assignedWorker.id,
      packer_worker_name: assignedWorker.worker_name,
      carton_prefix: cartonPrefix,
      carton_numbers: cartonNumbers,
      target_godown_bay: targetBay,
      gross_weight_per_carton_kg: grossWeightKg,
      status: 'IN_PACKING',
      notes,
      created_at: new Date().toISOString()
    }

    savePackingAssignment(newAssignment)

    broadcastFloorEvent({
      eventType: 'TASK_ALLOCATED',
      sourceModule: 'ready-goods',
      companyName,
      title: 'Carton Packing Task Assigned',
      message: `${cartonsCount} cartons (${totalPackedPieces} pcs) of ${selectedLot.style_name} assigned to ${assignedWorker.worker_name}.`,
      workerName: assignedWorker.worker_name,
      pieces: totalPackedPieces,
      taskRef: assignmentCode
    })

    toast.success(`Packing task #${assignmentCode} created! Assigned to ${assignedWorker.worker_name}.`)
    onAssignmentCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Assign Packing Task
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Allocate approved QC garments into export cartons with worker assignment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-black/10 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Select Approved Lot */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Approved Garment Lot (From QC Clearance)
            </label>
            {passedTasks.length === 0 ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
                No approved lots waiting in queue. Check and approve lots in Alteration &amp; QC first.
              </div>
            ) : (
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  setSelectedTaskId(e.target.value)
                  const lot = passedTasks.find(t => t.id === e.target.value)
                  if (lot) {
                    setCartonPrefix(`CTN-${lot.order_number}`)
                  }
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-black/15 bg-white text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
              >
                {passedTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    #{t.task_code} • {t.buyer} • {t.style_name} ({t.pieces_count} pcs • {t.color} • Size {t.size})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Select Packer Worker */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Assign Floor Packer Worker
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-black/15 bg-white text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
            >
              {packerWorkers.length === 0 ? (
                <option value="">No registered packers found (Add worker first)</option>
              ) : (
                packerWorkers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.worker_name} ({w.role === 'BOTH' ? 'Checker & Packer' : 'Packer'}) • {w.assigned_station}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Cartons and Pieces Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-black/10">
            <div>
              <label className="block font-mono font-bold text-slate-700 uppercase text-[11px] mb-1">
                Number of Cartons
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={cartonsCount}
                onChange={(e) => setCartonsCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-black/15 bg-white text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-slate-700 uppercase text-[11px] mb-1">
                Pieces per Carton
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={piecesPerCarton}
                onChange={(e) => setPiecesPerCarton(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-black/15 bg-white text-slate-900"
                required
              />
            </div>

            <div className="col-span-2 pt-2 border-t border-black/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">TOTAL CALCULATED PIECES:</span>
              <span className="text-sm font-mono font-extrabold text-[#3A3564]">
                {totalPackedPieces.toLocaleString('en-IN')} pcs
              </span>
            </div>
          </div>

          {/* Barcode Prefix & Destination Bay */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 uppercase text-[11px] mb-1">
                Carton Barcode Prefix
              </label>
              <input
                type="text"
                value={cartonPrefix}
                onChange={(e) => setCartonPrefix(e.target.value.toUpperCase())}
                placeholder="CTN-EXP-7714"
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-black/15 bg-white text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-slate-700 uppercase text-[11px] mb-1">
                Target Godown Bay
              </label>
              <select
                value={targetBay}
                onChange={(e) => setTargetBay(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-black/15 bg-white text-slate-900"
              >
                <option value="BAY_3">Bay 3 (Export Clearance)</option>
                <option value="BAY_4">Bay 4 (Domestic Hold)</option>
                <option value="BAY_5">Bay 5 (Staging Buffer)</option>
              </select>
            </div>
          </div>

          {/* Gross Weight & Notes */}
          <div>
            <label className="block font-mono font-bold text-slate-700 uppercase text-[11px] mb-1">
              Packing Instructions / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Standard 1:1 polybag packing, moisture desiccant enclosed"
              className="w-full px-3 py-2 text-xs rounded-lg border border-black/15 bg-white text-slate-900"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={passedTasks.length === 0}
              className="w-full py-3 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Create Packing Assignment ({cartonsCount} Cartons)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
