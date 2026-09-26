'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  Box,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Check,
  ShieldCheck,
  Building2,
  Phone,
  Clock,
  Layers,
  Sparkles,
  Printer,
  Waves,
  Flame,
  ArrowRight,
  RefreshCw,
  Tag,
  PackageCheck,
  Wrench,
  X,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import {
  ReadyGoodsWorker,
  FinishingInspectionTask,
  InspectionChecklist,
  ReadyGoodsWorkerRole
} from '../../types/readyGoods'
import {
  getReadyGoodsWorkers,
  getFinishingInspectionTasks,
  submitQualityInspectionResult,
  updateFinishingInspectionStatus,
  saveReadyGoodsWorker,
  READY_GOODS_UPDATE_EVENT
} from '../../utils/readyGoodsStorage'
import { subscribeToFloorEvents, broadcastFloorEvent } from '@/utils/floorRealtime'

interface WorkerDashboardClientProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  workerIdParam?: string
  companyName?: string
}

export function WorkerDashboardClient({
  userEmail,
  userName,
  userPhone,
  workerIdParam,
  companyName
}: WorkerDashboardClientProps) {
  const [workers, setWorkers] = useState<ReadyGoodsWorker[]>([])
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('')
  const [tasks, setTasks] = useState<FinishingInspectionTask[]>([])
  const [activeTab, setActiveTab] = useState<'CHECKING' | 'PACKING' | 'LOGS'>('CHECKING')
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false)
  const [defectReason, setDefectReason] = useState('OPEN_SEAM')
  const [defectNotes, setDefectNotes] = useState('')
  const [defectStation, setDefectStation] = useState('Mending Station 01')

  // Live checklist state for current selected task
  const [currentChecklist, setCurrentChecklist] = useState<InspectionChecklist>({
    cutting_done_right: false,
    printing_done_right: false,
    embroidery_done_right: false,
    washing_done_right: false,
    iron_done_right: false
  })

  const reloadData = () => {
    const loadedWorkers = getReadyGoodsWorkers(companyName)
    setWorkers(loadedWorkers)

    if (loadedWorkers.length > 0) {
      if (workerIdParam && loadedWorkers.some(w => w.id === workerIdParam)) {
        setSelectedWorkerId(workerIdParam)
      } else if (!selectedWorkerId) {
        setSelectedWorkerId(loadedWorkers[0].id)
      }
    }

    const loadedTasks = getFinishingInspectionTasks(companyName)
    setTasks(loadedTasks)

    if (loadedTasks.length > 0 && !selectedTaskId) {
      const firstActive = loadedTasks.find(t => t.status === 'PENDING_CHECK' || t.status === 'IN_CHECKING')
      if (firstActive) {
        setSelectedTaskId(firstActive.id)
        setCurrentChecklist(firstActive.checklist)
      }
    }
  }

  useEffect(() => {
    reloadData()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', reloadData)
      window.addEventListener(READY_GOODS_UPDATE_EVENT, reloadData)
      return () => {
        window.removeEventListener('storage', reloadData)
        window.removeEventListener(READY_GOODS_UPDATE_EVENT, reloadData)
      }
    }
  }, [companyName, workerIdParam])

  // Real-time WebSocket sync
  useEffect(() => {
    const unsub = subscribeToFloorEvents({
      companyName,
      onRefresh: () => reloadData(),
      onEvent: (event) => {
        reloadData()
        if (event.eventType === 'TASK_ALLOCATED' || event.eventType === 'TASK_VERIFIED') {
          toast.info(event.title, { description: event.message })
        }
      }
    })

    return () => unsub()
  }, [companyName])

  const currentWorker = workers.find(w => w.id === selectedWorkerId) || workers[0]
  const currentTask = tasks.find(t => t.id === selectedTaskId)

  // Sync checklist when selected task changes
  useEffect(() => {
    if (currentTask) {
      setCurrentChecklist(currentTask.checklist)
    }
  }, [selectedTaskId])

  // Automatically adjust active tab if worker only has one role
  useEffect(() => {
    if (currentWorker) {
      if (currentWorker.role === 'CHECKER' && activeTab === 'PACKING') {
        setActiveTab('CHECKING')
      } else if (currentWorker.role === 'PACKER' && activeTab === 'CHECKING') {
        setActiveTab('PACKING')
      }
    }
  }, [selectedWorkerId])

  // Filter queues
  const checkingQueue = tasks.filter(t => t.status === 'PENDING_CHECK' || t.status === 'IN_CHECKING')
  const passedToPackingQueue = tasks.filter(t => t.status === 'PASSED_TO_PACKING')
  const alterationQueue = tasks.filter(t => t.status === 'REJECTED_TO_ALTERATION')
  const completedLog = tasks.filter(t => t.status === 'PASSED_TO_PACKING' || t.status === 'REJECTED_TO_ALTERATION' || t.status === 'PACKED_IN_CARTON')

  // Check if all applicable checklist items are checked
  const canApprove = () => {
    if (!currentTask) return false
    const { cutting_done_right, washing_done_right, iron_done_right, printing_done_right, embroidery_done_right } = currentChecklist
    if (!cutting_done_right || !washing_done_right || !iron_done_right) return false
    if (currentTask.has_printing && !printing_done_right) return false
    if (currentTask.has_embroidery && !embroidery_done_right) return false
    return true
  }

  // Handle Approve & Pass to Packing
  const handleApprove = () => {
    if (!currentTask || !currentWorker) return
    if (!canApprove()) {
      toast.error('Please verify and tick all applicable quality check items before approving.')
      return
    }

    submitQualityInspectionResult({
      taskId: currentTask.id,
      workerId: currentWorker.id,
      workerName: currentWorker.worker_name,
      checklist: currentChecklist,
      decision: 'APPROVE'
    })

    broadcastFloorEvent({
      eventType: 'TASK_VERIFIED',
      companyName,
      title: 'QC Inspection Passed',
      message: `${currentTask.pieces_count} pcs of ${currentTask.style_name} approved and sent to Packing line.`,
      sourceModule: 'ready-goods'
    })

    toast.success(`Lot #${currentTask.task_code} approved! Passed to Packing line.`)

    // Select next checking task if available
    const nextTask = checkingQueue.find(t => t.id !== currentTask.id)
    if (nextTask) {
      setSelectedTaskId(nextTask.id)
      setCurrentChecklist(nextTask.checklist)
    }
  }

  // Handle Reject & Route to Alteration
  const handleRejectToAlteration = () => {
    if (!currentTask || !currentWorker) return

    submitQualityInspectionResult({
      taskId: currentTask.id,
      workerId: currentWorker.id,
      workerName: currentWorker.worker_name,
      checklist: currentChecklist,
      decision: 'REJECT_TO_ALTER',
      defectCategory: defectReason,
      defectNotes: defectNotes.trim() || `Flagged at ${defectStation}: ${defectReason}`
    })

    broadcastFloorEvent({
      eventType: 'TASK_VERIFIED',
      companyName,
      title: 'Garment Flagged for Alteration',
      message: `${currentTask.pieces_count} pcs of ${currentTask.style_name} routed to Alteration Clinic (${defectReason}).`,
      sourceModule: 'alter'
    })

    toast.error(`Lot #${currentTask.task_code} flagged as defect -> Routed to ${defectStation}`)
    setIsDefectModalOpen(false)
    setDefectNotes('')

    const nextTask = checkingQueue.find(t => t.id !== currentTask.id)
    if (nextTask) {
      setSelectedTaskId(nextTask.id)
      setCurrentChecklist(nextTask.checklist)
    }
  }

  // Handle Packing action
  const handlePackGarment = (task: FinishingInspectionTask) => {
    if (!currentWorker) return

    updateFinishingInspectionStatus(task.id, 'PACKED_IN_CARTON', {
      packed_carton_id: 'CTN-PACKED-LIVE'
    })

    const updatedWorker = {
      ...currentWorker,
      packed_cartons: (currentWorker.packed_cartons || 0) + 1
    }
    saveReadyGoodsWorker(updatedWorker)

    toast.success(`Packed ${task.pieces_count} pcs of ${task.style_name} into export carton!`)
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-10">
      {/* Worker Terminal Top Bar */}
      <div className="bg-white rounded-2xl border border-black/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#3A3564] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
            {currentWorker ? currentWorker.worker_name.charAt(0).toUpperCase() : 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                {currentWorker?.worker_name || 'Floor Worker'}
              </span>
              {currentWorker?.role === 'CHECKER' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Quality Checker
                </span>
              )}
              {currentWorker?.role === 'PACKER' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  Packing Operator
                </span>
              )}
              {currentWorker?.role === 'BOTH' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Dual-Role (QC & Pack)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>{currentWorker?.assigned_station || 'Station 01'}</span>
              <span>•</span>
              <span className="font-mono">{currentWorker?.shift} SHIFT</span>
              <span>•</span>
              <span className="font-mono text-slate-600">ID: +91 {currentWorker?.phone_number}</span>
            </div>
          </div>
        </div>

        {/* Worker Switcher & Fast Links */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Terminal Switch</span>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#3A3564]"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.worker_name} ({w.role})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/ready-goods"
            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            Management Hub
          </Link>
        </div>
      </div>

      {/* Primary Workstation Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(currentWorker?.role === 'CHECKER' || currentWorker?.role === 'BOTH') && (
          <button
            type="button"
            onClick={() => setActiveTab('CHECKING')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'CHECKING'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Quality Checking Station</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white">
              {checkingQueue.length}
            </span>
          </button>
        )}

        {(currentWorker?.role === 'PACKER' || currentWorker?.role === 'BOTH') && (
          <button
            type="button"
            onClick={() => setActiveTab('PACKING')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'PACKING'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Packing Goods Station</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white">
              {passedToPackingQueue.length}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'LOGS'
              ? 'bg-[#3A3564] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Shift Activity & Alterations</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 text-slate-700">
            {alterationQueue.length} in rework
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. QUALITY CHECKING STATION VIEW                                */}
      {/* ============================================================== */}
      {activeTab === 'CHECKING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Incoming Post-Wash & Iron Queue */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Incoming Pieces from Wash & Iron ({checkingQueue.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Select lot to inspect</span>
            </div>

            {checkingQueue.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">All Lots Inspected!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  No garments waiting for quality check. Any incoming loads from Industrial Washing or Steam Ironing will display here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {checkingQueue.map((task) => {
                  const isSelected = selectedTaskId === task.id
                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id)
                        setCurrentChecklist(task.checklist)
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#3A3564] bg-[#FAF7F0] ring-1 ring-[#3A3564] shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-[#3A3564] bg-[#3A3564]/10 px-2 py-0.5 rounded-md">
                          #{task.task_code}
                        </span>
                        <span className="text-xs font-mono font-extrabold text-slate-900">
                          {task.pieces_count} pcs • Size {task.size}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 truncate">{task.style_name}</h4>
                      <p className="text-[11px] text-slate-500">{task.buyer} • {task.color}</p>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10.5px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Waves className="w-3 h-3 text-blue-500" />
                          <span>{task.wash_batch_ref}</span>
                        </span>
                        {task.origin_stage === 'REPAIRED_ALTERATION_REINSPECTION' && (
                          <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Re-Inspection
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Inspection Checklist Form */}
          <div className="lg:col-span-7">
            {currentTask ? (
              <div className="bg-white rounded-3xl border border-black p-5 sm:p-6 space-y-5">
                {/* Article Header & Tech Pack Embellishment Badges */}
                <div className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-[#3A3564]">
                      LOT: #{currentTask.task_code} • {currentTask.order_number}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {currentTask.pieces_count} Units to Check
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">{currentTask.style_name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Buyer: <span className="font-semibold text-slate-800">{currentTask.buyer}</span> • Color: {currentTask.color} • Size: {currentTask.size}
                  </p>

                  {/* Tech Pack Sequence Directive Badge */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">Tech-Pack Embellishment:</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      {currentTask.has_printing && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px]">
                          <Printer className="w-3 h-3" />
                          <span>Printing Required</span>
                        </span>
                      )}
                      {currentTask.has_embroidery && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px]">
                          <Sparkles className="w-3 h-3" />
                          <span>Embroidery Required</span>
                        </span>
                      )}
                      {!currentTask.has_printing && !currentTask.has_embroidery && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px]">
                          <span>No Printing or Embroidery</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* The Dynamic Tick Checklist */}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Quality Verification Criteria</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      Tick all passed checks to approve
                    </span>
                  </h3>

                  <div className="space-y-2.5">
                    {/* 1. Cutting Inspection (Always Required) */}
                    <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      currentChecklist.cutting_done_right
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={currentChecklist.cutting_done_right}
                        onChange={(e) => setCurrentChecklist({ ...currentChecklist, cutting_done_right: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-[#3A3564] rounded border-slate-300 focus:ring-[#3A3564]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-slate-600" />
                          <span className="text-xs font-bold text-slate-900">Cutting Done Right</span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">Mandatory</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Pattern symmetry, panel alignment, notch marks matching, and correct grain line balance.
                        </p>
                      </div>
                    </label>

                    {/* 2. Printing Inspection (ONLY SHOWN IF TECH PACK SAYS PRINTING) */}
                    {currentTask.has_printing && (
                      <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all animate-in fade-in duration-200 ${
                        currentChecklist.printing_done_right
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={currentChecklist.printing_done_right}
                          onChange={(e) => setCurrentChecklist({ ...currentChecklist, printing_done_right: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-[#3A3564] rounded border-slate-300 focus:ring-[#3A3564]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Printer className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-slate-900">Printing Done Right</span>
                            <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-100 px-1.5 py-0.2 rounded">Per Tech-Pack</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Strike-off color match, screen registration, no bleed/curing smudges, and sharp edge resolution.
                          </p>
                        </div>
                      </label>
                    )}

                    {/* 3. Embroidery Inspection (ONLY SHOWN IF TECH PACK SAYS EMBROIDERY) */}
                    {currentTask.has_embroidery && (
                      <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all animate-in fade-in duration-200 ${
                        currentChecklist.embroidery_done_right
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={currentChecklist.embroidery_done_right}
                          onChange={(e) => setCurrentChecklist({ ...currentChecklist, embroidery_done_right: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-[#3A3564] rounded border-slate-300 focus:ring-[#3A3564]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-bold text-slate-900">Embroidery Done Right</span>
                            <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded">Per Tech-Pack</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            DST stitch placement, correct thread tension, thread trims clean, and backing non-scratchy.
                          </p>
                        </div>
                      </label>
                    )}

                    {/* 4. Washing Inspection (Always Required) */}
                    <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      currentChecklist.washing_done_right
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={currentChecklist.washing_done_right}
                        onChange={(e) => setCurrentChecklist({ ...currentChecklist, washing_done_right: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-[#3A3564] rounded border-slate-300 focus:ring-[#3A3564]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Waves className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-bold text-slate-900">Washing Done Right</span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">Mandatory</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Enzyme / softener hand feel, shade clearance, shrinkage within tolerance, zero chemical odor.
                        </p>
                      </div>
                    </label>

                    {/* 5. Ironing Inspection (Always Required) */}
                    <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      currentChecklist.iron_done_right
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={currentChecklist.iron_done_right}
                        onChange={(e) => setCurrentChecklist({ ...currentChecklist, iron_done_right: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-[#3A3564] rounded border-slate-300 focus:ring-[#3A3564]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold text-slate-900">Ironing Done Right</span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">Mandatory</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Seams pressed flat, zero shine marks or fabric glazing, collar and cuffs crisp with zero wrinkles.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Decision Actions Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDefectModalOpen(true)}
                    className="px-4 py-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Flag Defect & Send to Alteration</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={!canApprove()}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Pass to Packing Line</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                Select an incoming garment lot on the left to begin quality inspection.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PACKING GOODS STATION VIEW                                  */}
      {/* ============================================================== */}
      {activeTab === 'PACKING' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Approved Goods Ready for Packing ({passedToPackingQueue.length})
              </h3>
              <p className="text-xs text-slate-500">
                Garments that passed cutting, printing, embroidery, wash, and iron inspection.
              </p>
            </div>
            <Link
              href="/ready-goods/carton-packing"
              className="text-xs font-bold text-[#3A3564] hover:underline flex items-center gap-1"
            >
              <span>Full Carton Manifest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {passedToPackingQueue.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <Box className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-900">No Goods Waiting for Packing</h4>
              <p className="text-xs text-slate-500 mt-1">
                When Quality Checkers approve incoming inspection lots, they immediately appear here for polybagging and carton packing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {passedToPackingQueue.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-black/15 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        QC PASSED
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {task.pieces_count} pcs • Size {task.size}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{task.style_name}</h4>
                    <p className="text-xs text-slate-500">{task.buyer} • {task.color}</p>

                    <div className="mt-3 p-2 rounded-xl bg-slate-50 text-[11px] space-y-1 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Inspector:</span>
                        <span className="font-semibold text-slate-900">{task.checked_by_worker_name || 'QC Lead'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Lot Ref:</span>
                        <span className="font-mono text-slate-800">{task.task_code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePackGarment(task)}
                      className="w-full py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Pack into Carton</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SHIFT ACTIVITY & ALTERATION REWORK LOG                      */}
      {/* ============================================================== */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Shift Quality History & Alteration Queue
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {alterationQueue.length} Lots in Alteration Clinic
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-black/15 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Lot Code</th>
                  <th className="py-3 px-4">Article & Buyer</th>
                  <th className="py-3 px-4">Pieces</th>
                  <th className="py-3 px-4">QC Verdict</th>
                  <th className="py-3 px-4">Inspector</th>
                  <th className="py-3 px-4">Defect / Destination</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedLog.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No shift records logged yet.
                    </td>
                  </tr>
                ) : (
                  completedLog.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                        #{task.task_code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{task.style_name}</span>
                        <span className="text-[10px] text-slate-400">{task.buyer} • {task.color}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        {task.pieces_count} pcs ({task.size})
                      </td>
                      <td className="py-3 px-4">
                        {task.status === 'PASSED_TO_PACKING' && (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-100 text-emerald-800">
                            Passed to Packing
                          </span>
                        )}
                        {task.status === 'PACKED_IN_CARTON' && (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-blue-800">
                            Packed in Carton
                          </span>
                        )}
                        {task.status === 'REJECTED_TO_ALTERATION' && (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-100 text-rose-800">
                            Routed to Alteration
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {task.checked_by_worker_name || 'Inspector'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {task.defect_category ? (
                          <span className="text-rose-700 font-semibold">
                            {task.defect_category}: {task.defect_notes}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">
                            Clean Inspection Pass
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[10.5px] text-slate-400">
                        {task.completed_at ? new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK DEFECT INTAKE MODAL (ROUTING TO ALTERATION CLINIC)        */}
      {/* ============================================================== */}
      {isDefectModalOpen && currentTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-black shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold">Route Lot to Alteration Clinic</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDefectModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">Lot: #{currentTask.task_code}</span>
                <span className="text-sm font-bold text-slate-900 block">{currentTask.style_name}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Defect Category *
                </label>
                <select
                  value={defectReason}
                  onChange={(e) => setDefectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#3A3564]"
                >
                  <option value="OPEN_SEAM">Seam Open / Broken Stitch</option>
                  <option value="SKIP_STITCH">Skip Stitch / Loose Thread Tension</option>
                  <option value="CUTTING_ASYMMETRY">Cutting Notch / Pattern Asymmetry</option>
                  <option value="PRINT_SMUDGE">Print Misalignment / Incomplete Curing</option>
                  <option value="EMBROIDERY_PULL">Embroidery Nesting / Thread Pulling</option>
                  <option value="WASH_STAIN">Washing Oil Blot / Uneven Shade</option>
                  <option value="IRON_GLAZE">Iron Glaze / Shine Mark on Seam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Route to Mending Station *
                </label>
                <select
                  value={defectStation}
                  onChange={(e) => setDefectStation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#3A3564]"
                >
                  <option value="Mending Station 01">Mending Station 01 (Collar & Neck Tailor)</option>
                  <option value="Mending Station 02">Mending Station 02 (Sleeve & Side Seams)</option>
                  <option value="Spot Cleaning Gun 05">Spot Cleaning Gun 05 (Chemical Stain Table)</option>
                  <option value="Secondary Inspection Table">Secondary Inspection Table</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Inspector Triage Notes
                </label>
                <textarea
                  rows={2}
                  value={defectNotes}
                  onChange={(e) => setDefectNotes(e.target.value)}
                  placeholder="e.g. Left sleeve cuff thread loose, requires re-stitching..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#3A3564]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDefectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectToAlteration}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Dispatch to Alteration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
