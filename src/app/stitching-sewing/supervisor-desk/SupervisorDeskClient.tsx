'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Scissors,
  Wrench,
  ShieldCheck,
  Warehouse,
  Truck,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  User,
  Calendar,
  Tag,
  Clock,
  ArrowLeft,
  ChevronRight,
  Send,
  Check,
  X,
  Plus,
  PackageCheck,
  FileText,
  ChevronDown,
  UserCheck,
  Sparkles,
  ExternalLink,
  Flame,
  Zap,
  Activity,
  SlidersHorizontal
} from 'lucide-react'
import {
  adminAdvanceToMending,
  adminHandoverToQc,
  adminPassQc,
  adminSendToAlteration,
  adminStoreInward,
  adminCompleteLinemanBundle,
  adminReassignLineman,
  adminIssueMaterial,
  adminDispatchAllotment
} from './actions'

type StationType = 'LINEMAN' | 'MENDING' | 'QC' | 'STORE' | 'DISPATCH'

interface Profile {
  id: string
  username: string
  role: string
}

interface AllotmentVariant {
  id: string
  allotment_id: string
  color: string
  size: string
  quantity: number
  completed_qty: number
}

interface AllotmentMaterial {
  id: string
  allotment_id: string
  item_name: string
  required_qty: number
  admin_issued?: boolean
  notes?: string
}

interface AllotmentItem {
  id: string
  challan_id?: string
  lineman_id?: string
  article_id?: string
  target_qty: number
  status: string
  allotment_date?: string
  priority?: string
  mending_status?: string
  mending_total_counted?: number
  mending_supervisor_name?: string
  handed_to_mending_by?: string
  handed_to_mending_at?: string
  mending_handover_notes?: string
  qc_status?: string
  qc_total_passed?: number
  qc_total_alter?: number
  qc_supervisor_name?: string
  handed_to_qc_by?: string
  handed_to_qc_at?: string
  qc_handover_notes?: string
  store_inward_status?: string
  total_bags_packed?: number
  created_at?: string
  profiles?: Profile | null
  articles?: { id: string; art_no: string; description?: string } | null
  challans?: { id: string; challan_no: string; brand?: string; fabric_type?: string } | null
  allotment_variants?: AllotmentVariant[]
  allotment_materials?: AllotmentMaterial[]
}

interface SupervisorDeskClientProps {
  initialAllotments: AllotmentItem[]
  linemenProfiles: Profile[]
  allProfiles: Profile[]
  currentUserEmail: string
  currentUserName: string
  currentUserRole: string
}

export function SupervisorDeskClient({
  initialAllotments = [],
  linemenProfiles = [],
  allProfiles = [],
  currentUserEmail,
  currentUserName,
  currentUserRole
}: SupervisorDeskClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Master Station Tabs
  const [activeStation, setActiveStation] = useState<StationType>('LINEMAN')
  const [storeSubTab, setStoreSubTab] = useState<'INWARD' | 'TRIMS'>('INWARD')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLinemanFilter, setSelectedLinemanFilter] = useState<string>('ALL')

  // Expanded variant cards state (set of allotment IDs)
  const [expandedLots, setExpandedLots] = useState<Record<string, boolean>>({})

  const toggleLotExpansion = (id: string) => {
    setExpandedLots(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Modals
  const [selectedAllotmentForMendingAdvance, setSelectedAllotmentForMendingAdvance] = useState<AllotmentItem | null>(null)
  const [targetMendingSupervisorId, setTargetMendingSupervisorId] = useState<string>('')
  const [mendingAdvanceNotes, setMendingAdvanceNotes] = useState<string>('')

  const [selectedAllotmentForMending, setSelectedAllotmentForMending] = useState<AllotmentItem | null>(null)
  const [mendingCountInput, setMendingCountInput] = useState<number>(0)
  const [targetQcSupervisorId, setTargetQcSupervisorId] = useState<string>('')
  const [mendingNotesInput, setMendingNotesInput] = useState<string>('')
  const [mendingChecklist, setMendingChecklist] = useState({
    threadTrimmed: true,
    seamChecked: true,
    measurementChecked: true
  })

  const [selectedAllotmentForQc, setSelectedAllotmentForQc] = useState<AllotmentItem | null>(null)
  const [qcPassedInput, setQcPassedInput] = useState<number>(0)
  const [qcAlterInput, setQcAlterInput] = useState<number>(0)
  const [qcDefectType, setQcDefectType] = useState<string>('STITCHING_ALTER')
  const [qcNotesInput, setQcNotesInput] = useState<string>('')

  const [reassignModalAllotment, setReassignModalAllotment] = useState<AllotmentItem | null>(null)
  const [targetLinemanId, setTargetLinemanId] = useState<string>('')

  const [dispatchModalAllotment, setDispatchModalAllotment] = useState<AllotmentItem | null>(null)
  const [dispatchChallanNo, setDispatchChallanNo] = useState<string>('')
  const [dispatchBags, setDispatchBags] = useState<number>(1)

  // Supervisor groups
  const mendingSupervisors = useMemo(() => {
    return allProfiles.filter(p => (p.role || '').toUpperCase() === 'MENDING')
  }, [allProfiles])

  const qcSupervisors = useMemo(() => {
    return allProfiles.filter(p => (p.role || '').toUpperCase() === 'QC')
  }, [allProfiles])

  // Precise stage matching rules (100% parity with mobile app dashboards)
  const isLinemanStage = (item: AllotmentItem) => {
    const mStatus = item.mending_status || ''
    if (mStatus === 'WITH_LINEMAN_FOR_REPAIR') return true
    return item.status === 'IN_PROGRESS' && (mStatus === 'PENDING_STITCHING' || !mStatus)
  }

  const isMendingStage = (item: AllotmentItem) => {
    const mStatus = item.mending_status || ''
    return (
      mStatus === 'PENDING_MENDING' ||
      mStatus === 'MENDING_IN_PROGRESS' ||
      mStatus === 'MENDING_RECEIVED' ||
      (item.status === 'COMPLETED' && mStatus !== 'QC_PENDING' && mStatus !== 'COUNTING_VERIFIED' && mStatus !== 'WITH_LINEMAN_FOR_REPAIR')
    )
  }

  const isQcStage = (item: AllotmentItem) => {
    const mStatus = item.mending_status || ''
    const qStatus = item.qc_status || ''
    return (
      (mStatus === 'QC_PENDING' || mStatus === 'COUNTING_VERIFIED' || qStatus === 'QC_PENDING' || qStatus === 'IN_QC_CHECKING') &&
      qStatus !== 'APPROVED_FOR_STORE' &&
      mStatus !== 'WITH_LINEMAN_FOR_REPAIR'
    )
  }

  const isStoreStage = (item: AllotmentItem) => {
    const qStatus = item.qc_status || ''
    const sStatus = item.store_inward_status || ''
    return (qStatus === 'APPROVED_FOR_STORE' || qStatus === 'READY_FOR_STORE') && sStatus !== 'INWARDED'
  }

  const isDispatchStage = (item: AllotmentItem) => {
    const sStatus = item.store_inward_status || ''
    const qStatus = item.qc_status || ''
    return (sStatus === 'INWARDED' || qStatus === 'APPROVED_FOR_STORE') && item.status !== 'DISPATCHED'
  }

  // Real-time KPI counts
  const kpis = useMemo(() => {
    const activeLines = initialAllotments.filter(isLinemanStage).length
    const mendingQueue = initialAllotments.filter(isMendingStage).length
    const qcQueue = initialAllotments.filter(isQcStage).length
    const storeQueue = initialAllotments.filter(isStoreStage).length
    const readyDispatch = initialAllotments.filter(isDispatchStage).length

    return { activeLines, mendingQueue, qcQueue, storeQueue, readyDispatch }
  }, [initialAllotments])

  // Filtered allotments for active station
  const filteredAllotments = useMemo(() => {
    return initialAllotments.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const challan = item.challans?.challan_no?.toLowerCase() || ''
        const art = item.articles?.art_no?.toLowerCase() || ''
        const brand = item.challans?.brand?.toLowerCase() || ''
        const lineman = item.profiles?.username?.toLowerCase() || ''
        if (!challan.includes(q) && !art.includes(q) && !brand.includes(q) && !lineman.includes(q)) {
          return false
        }
      }

      // Station specific filtering
      if (activeStation === 'LINEMAN') {
        if (selectedLinemanFilter !== 'ALL' && item.lineman_id !== selectedLinemanFilter) {
          return false
        }
        return isLinemanStage(item)
      }

      if (activeStation === 'MENDING') {
        return isMendingStage(item)
      }

      if (activeStation === 'QC') {
        return isQcStage(item)
      }

      if (activeStation === 'STORE') {
        if (storeSubTab === 'INWARD') {
          return isStoreStage(item)
        }
        return item.status === 'IN_PROGRESS' && item.allotment_materials && item.allotment_materials.length > 0
      }

      if (activeStation === 'DISPATCH') {
        return isDispatchStage(item)
      }

      return true
    })
  }, [initialAllotments, activeStation, storeSubTab, searchQuery, selectedLinemanFilter])

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  const handleOpenMendingAdvanceModal = (item: AllotmentItem) => {
    setSelectedAllotmentForMendingAdvance(item)
    setTargetMendingSupervisorId(mendingSupervisors[0]?.id || '')
    setMendingAdvanceNotes('')
  }

  const handleSubmitMendingAdvance = () => {
    if (!selectedAllotmentForMendingAdvance) return
    const sup = mendingSupervisors.find(s => s.id === targetMendingSupervisorId)
    startTransition(async () => {
      const res = await adminAdvanceToMending({
        allotment_id: selectedAllotmentForMendingAdvance.id,
        mending_supervisor_id: targetMendingSupervisorId,
        mending_supervisor_name: sup?.username || 'MENDING',
        handover_notes: mendingAdvanceNotes,
        operator_name: currentUserName
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Lot #${selectedAllotmentForMendingAdvance.challans?.challan_no || selectedAllotmentForMendingAdvance.id.slice(0, 8)} stitched & forwarded to Mending Floor.`)
        setSelectedAllotmentForMendingAdvance(null)
        router.refresh()
      }
    })
  }

  const handleOpenMendingModal = (item: AllotmentItem) => {
    setSelectedAllotmentForMending(item)
    setMendingCountInput(item.mending_total_counted || item.target_qty || 0)
    setTargetQcSupervisorId(qcSupervisors[0]?.id || '')
    setMendingNotesInput('')
  }

  const handleSubmitMending = () => {
    if (!selectedAllotmentForMending) return
    const sup = qcSupervisors.find(s => s.id === targetQcSupervisorId)
    startTransition(async () => {
      const res = await adminHandoverToQc({
        allotment_id: selectedAllotmentForMending.id,
        counted_qty: mendingCountInput,
        qc_supervisor_id: targetQcSupervisorId,
        qc_supervisor_name: sup?.username || 'CHECKING',
        handover_notes: mendingNotesInput,
        operator_name: currentUserName
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Lot verified (${mendingCountInput} pcs) & handed over to QC Floor.`)
        setSelectedAllotmentForMending(null)
        router.refresh()
      }
    })
  }

  const handleOpenQcModal = (item: AllotmentItem) => {
    setSelectedAllotmentForQc(item)
    const target = item.mending_total_counted || item.target_qty || 0
    setQcPassedInput(target)
    setQcAlterInput(0)
    setQcNotesInput('')
  }

  const handleSubmitQcPass = () => {
    if (!selectedAllotmentForQc) return
    startTransition(async () => {
      const res = await adminPassQc({
        allotment_id: selectedAllotmentForQc.id,
        passed_qty: qcPassedInput,
        alter_qty: qcAlterInput,
        defect_notes: qcNotesInput,
        operator_name: currentUserName
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Lot QC APPROVED (${qcPassedInput} pcs passed). Forwarded to Store Godown Inward.`)
        setSelectedAllotmentForQc(null)
        router.refresh()
      }
    })
  }

  const handleSubmitQcAlter = () => {
    if (!selectedAllotmentForQc) return
    startTransition(async () => {
      const res = await adminSendToAlteration({
        allotment_id: selectedAllotmentForQc.id,
        alter_qty: qcAlterInput,
        defect_type: qcDefectType,
        defect_notes: qcNotesInput,
        operator_name: currentUserName
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.warning(`Flagged ${qcAlterInput} pcs for alteration. Alert dispatched to Lineman Floor.`)
        setSelectedAllotmentForQc(null)
        router.refresh()
      }
    })
  }

  const handleExecuteStoreInward = (item: AllotmentItem) => {
    startTransition(async () => {
      const res = await adminStoreInward({
        allotment_id: item.id,
        quantity: item.qc_total_passed || item.target_qty,
        operator_name: currentUserName
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Lot #${item.challans?.challan_no || item.id.slice(0, 8)} inwarded to Godown Stock!`)
        router.refresh()
      }
    })
  }

  const handleCompleteBundle = (allotmentId: string) => {
    startTransition(async () => {
      const res = await adminCompleteLinemanBundle({
        allotment_id: allotmentId,
        completed_qty: 0,
        advance_to_mending: false,
        operator_name: currentUserName
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Bundle completion updated for tailors.')
        router.refresh()
      }
    })
  }

  const handleExecuteReassign = () => {
    if (!reassignModalAllotment || !targetLinemanId) return
    const targetLineman = linemenProfiles.find(l => l.id === targetLinemanId)
    startTransition(async () => {
      const res = await adminReassignLineman({
        allotment_id: reassignModalAllotment.id,
        new_lineman_id: targetLinemanId,
        new_lineman_name: targetLineman?.username || 'Lineman'
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(res.message || 'Line reassigned successfully.')
        setReassignModalAllotment(null)
        router.refresh()
      }
    })
  }

  const handleIssueMaterial = (materialId: string, allotmentId: string) => {
    startTransition(async () => {
      const res = await adminIssueMaterial({
        material_id: materialId,
        allotment_id: allotmentId,
        operator_name: currentUserName
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Raw material issued & logged in inventory.')
        router.refresh()
      }
    })
  }

  const handleExecuteDispatch = () => {
    if (!dispatchModalAllotment) return
    startTransition(async () => {
      const res = await adminDispatchAllotment({
        allotment_id: dispatchModalAllotment.id,
        challan_no: dispatchChallanNo || dispatchModalAllotment.challans?.challan_no,
        bags_packed: dispatchBags,
        operator_name: currentUserName
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Lot successfully dispatched with Gate Pass.')
        setDispatchModalAllotment(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* 1. EXECUTIVE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Link
              href="/modules"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace Hub</span>
            </Link>
            <span className="text-slate-300 font-mono text-xs">/</span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Operations Override
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Supervisor Operations & Absentee Override Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Centralized factory floor control for Linemen, Mending, Quality Check, Store, and Dispatch gates.
          </p>
        </div>

        {/* Live Operator Presence Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-black/10 shadow-2xs shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-slate-900 leading-tight">
                {currentUserName}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                {currentUserRole}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                Floor Override Mode Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHRONOLOGICAL WORKFLOW STAGES (STEP PIPELINE) */}
      <div className="bg-white p-2 rounded-2xl border border-black/10 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          
          {/* Stage 1: Lineman */}
          <button
            type="button"
            onClick={() => setActiveStation('LINEMAN')}
            className={`flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
              activeStation === 'LINEMAN'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-[#FAF7F0] text-slate-700 border border-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeStation === 'LINEMAN' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
              }`}>
                <Scissors className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono uppercase opacity-75 font-semibold">Stage 1</p>
                <p className="text-xs sm:text-sm font-black truncate">Lineman Lines</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 ml-1 ${
              activeStation === 'LINEMAN' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
            }`}>
              {kpis.activeLines}
            </span>
          </button>

          {/* Stage 2: Mending */}
          <button
            type="button"
            onClick={() => setActiveStation('MENDING')}
            className={`flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
              activeStation === 'MENDING'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-[#FAF7F0] text-slate-700 border border-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeStation === 'MENDING' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono uppercase opacity-75 font-semibold">Stage 2</p>
                <p className="text-xs sm:text-sm font-black truncate">Mending Desk</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 ml-1 ${
              activeStation === 'MENDING' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {kpis.mendingQueue}
            </span>
          </button>

          {/* Stage 3: QC */}
          <button
            type="button"
            onClick={() => setActiveStation('QC')}
            className={`flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
              activeStation === 'QC'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-[#FAF7F0] text-slate-700 border border-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeStation === 'QC' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono uppercase opacity-75 font-semibold">Stage 3</p>
                <p className="text-xs sm:text-sm font-black truncate">QC Inspection</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 ml-1 ${
              activeStation === 'QC' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
            }`}>
              {kpis.qcQueue}
            </span>
          </button>

          {/* Stage 4: Store */}
          <button
            type="button"
            onClick={() => setActiveStation('STORE')}
            className={`flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
              activeStation === 'STORE'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-[#FAF7F0] text-slate-700 border border-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeStation === 'STORE' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
              }`}>
                <Warehouse className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono uppercase opacity-75 font-semibold">Stage 4</p>
                <p className="text-xs sm:text-sm font-black truncate">Store Godown</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 ml-1 ${
              activeStation === 'STORE' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {kpis.storeQueue}
            </span>
          </button>

          {/* Stage 5: Dispatch */}
          <button
            type="button"
            onClick={() => setActiveStation('DISPATCH')}
            className={`col-span-2 sm:col-span-1 flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
              activeStation === 'DISPATCH'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'bg-slate-50 hover:bg-[#FAF7F0] text-slate-700 border border-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeStation === 'DISPATCH' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono uppercase opacity-75 font-semibold">Stage 5</p>
                <p className="text-xs sm:text-sm font-black truncate">Dispatch Gate</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 ml-1 ${
              activeStation === 'DISPATCH' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {kpis.readyDispatch}
            </span>
          </button>

        </div>
      </div>

      {/* 3. EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Active Stitching
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-2xs">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-3">
            {kpis.activeLines}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Running on {linemenProfiles.length} floor lines
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Mending Queue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-2xs">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-3">
            {kpis.mendingQueue}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Awaiting counting & trim
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              QC Inspection
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-3">
            {kpis.qcQueue}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Ready for quality check
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Godown Inward
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-2xs">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-3">
            {kpis.storeQueue}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            QC approved finished stock
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Dispatch Ready
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-3">
            {kpis.readyDispatch}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gate pass ready lots
          </p>
        </div>
      </div>

      {/* 4. CLEAN TOOLBAR (ZERO HORIZONTAL SCROLLBAR CLUTTER) */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Challan #, Style, Lineman..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-black/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>

        {/* Dynamic Context Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          
          {/* Lineman Line Selector Dropdown (Replaces ugly horizontal scrollbar) */}
          {activeStation === 'LINEMAN' && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-slate-500 font-semibold font-mono text-xs">Floor Line:</span>
              <div className="relative">
                <select
                  value={selectedLinemanFilter}
                  onChange={e => setSelectedLinemanFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 bg-slate-50 hover:bg-white border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A3564] cursor-pointer"
                >
                  <option value="ALL">All Floor Lines ({linemenProfiles.length})</option>
                  {linemenProfiles.map(l => (
                    <option key={l.id} value={l.id}>
                      Line: {l.username}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Store Desk Sub-tabs */}
          {activeStation === 'STORE' && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-black/5">
              <button
                type="button"
                onClick={() => setStoreSubTab('INWARD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  storeSubTab === 'INWARD'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Finished Goods Inward ({kpis.storeQueue})
              </button>
              <button
                type="button"
                onClick={() => setStoreSubTab('TRIMS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  storeSubTab === 'TRIMS'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trims & BOM Issuance
              </button>
            </div>
          )}

          {/* Real-time Sync */}
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-mono font-bold text-slate-700 transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
            <span>Sync Floor</span>
          </button>
        </div>
      </div>

      {/* 5. MASTER BATCH CARDS (EXECUTIVE DESIGN) */}
      {filteredAllotments.length === 0 ? (
        <div className="p-12 bg-white border border-black/10 rounded-2xl text-center shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 mx-auto flex items-center justify-center shadow-2xs">
            <CheckCircle2 className="w-7 h-7 text-[#3A3564]" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            Station Queue Clear
          </h3>
          <p className="text-xs font-mono text-slate-500 max-w-sm mx-auto">
            All floor lots have been processed for this station. Switch to another stage tab above to review active production.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredAllotments.map(item => {
            const challanNo = item.challans?.challan_no
            const artNo = item.articles?.art_no || 'Standard'
            const brand = item.challans?.brand
            const fabric = item.challans?.fabric_type
            const linemanName = item.profiles?.username || 'Unassigned Line'
            const targetQty = item.target_qty || 0
            const isCritical = item.priority === 'CRITICAL'
            const isRush = item.priority === 'RUSH'
            const isAlteration = item.mending_status === 'WITH_LINEMAN_FOR_REPAIR'
            const isExpanded = !!expandedLots[item.id]

            // Calculate distinct colors
            const variantColors = Array.from(
              new Set((item.allotment_variants || []).map(v => v.color).filter(Boolean))
            )

            return (
              <div
                key={item.id}
                className="bg-white border border-black/10 rounded-2xl shadow-2xs hover:border-black/20 transition-all overflow-hidden"
              >
                {/* Card Main Bar */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Metadata Block */}
                  <div className="space-y-2.5">
                    
                    {/* Top Badges Line */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {challanNo ? (
                        <span className="font-extrabold text-xs sm:text-sm px-3 py-1 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-tight flex items-center gap-1.5 shadow-2xs font-mono">
                          <FileText className="w-3.5 h-3.5 text-[#3A3564]" />
                          <span>Challan #{challanNo}</span>
                        </span>
                      ) : (
                        <span className="font-extrabold text-xs px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 tracking-tight font-mono">
                          Direct Floor Allotment
                        </span>
                      )}

                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-mono">
                        Style: {artNo}
                      </span>

                      {brand && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {brand}
                        </span>
                      )}

                      {fabric && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                          {fabric}
                        </span>
                      )}

                      {isCritical && (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 shadow-2xs">
                          <Flame className="w-3.5 h-3.5 text-red-600" />
                          <span>Critical Priority</span>
                        </span>
                      )}

                      {isRush && (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 shadow-2xs">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Rush Order</span>
                        </span>
                      )}

                      {isAlteration && (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Alteration Required ({item.qc_total_alter || 0} Pcs)</span>
                        </span>
                      )}
                    </div>

                    {/* Secondary Line: Lineman Line & Target Metric */}
                    <div className="flex items-center gap-4 text-xs sm:text-[13px] text-slate-600 flex-wrap">
                      <div className="flex items-center gap-1.5 font-mono">
                        <UserCheck className="w-3.5 h-3.5 text-[#3A3564]" />
                        <span>Line: <strong className="text-slate-900 font-bold">{linemanName}</strong></span>
                      </div>

                      <span className="text-slate-300">•</span>

                      <div className="flex items-center gap-1.5 font-mono">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Target: <strong className="text-slate-900 font-bold">{targetQty.toLocaleString()} Pcs</strong></span>
                      </div>

                      {item.mending_total_counted ? (
                        <>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-1.5 text-amber-700 font-mono font-bold">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Counted: {item.mending_total_counted.toLocaleString()} Pcs</span>
                          </div>
                        </>
                      ) : null}

                      {item.qc_total_passed ? (
                        <>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-mono font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>QC Passed: {item.qc_total_passed.toLocaleString()} Pcs</span>
                          </div>
                        </>
                      ) : null}
                    </div>

                    {/* Color Summary Bar (Clean, no tag soup) */}
                    {variantColors.length > 0 && (
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[11px] font-mono text-slate-500 font-semibold">
                          Colors ({variantColors.length}):
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {variantColors.map(c => (
                            <span
                              key={c}
                              className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {c}
                            </span>
                          ))}
                          {item.allotment_variants && item.allotment_variants.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleLotExpansion(item.id)}
                              className="text-[11px] font-mono font-bold text-[#3A3564] hover:underline cursor-pointer ml-1"
                            >
                              {isExpanded ? 'Hide Sizes' : `View Sizes (${item.allotment_variants.length})`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Right Action Block (Hierarchical, single primary + sleek secondary) */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap self-end lg:self-center">
                    
                    {/* LINEMAN STAGE ACTIONS */}
                    {activeStation === 'LINEMAN' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setReassignModalAllotment(item)
                            setTargetLinemanId(item.lineman_id || '')
                          }}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Reassign Line</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCompleteBundle(item.id)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Log Bundles</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenMendingAdvanceModal(item)}
                          disabled={isPending}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <span>Handover to Mending</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* MENDING STAGE ACTIONS */}
                    {activeStation === 'MENDING' && (
                      <button
                        type="button"
                        onClick={() => handleOpenMendingModal(item)}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <Wrench className="w-4 h-4 text-amber-300" />
                        <span>Verify & Handover to QC</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* QC STAGE ACTIONS */}
                    {activeStation === 'QC' && (
                      <button
                        type="button"
                        onClick={() => handleOpenQcModal(item)}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Inspect & Grade Pieces</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* STORE STAGE ACTIONS */}
                    {activeStation === 'STORE' && (
                      <>
                        {storeSubTab === 'INWARD' ? (
                          <button
                            type="button"
                            onClick={() => handleExecuteStoreInward(item)}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                          >
                            <PackageCheck className="w-4 h-4" />
                            <span>Inward to Godown ({item.qc_total_passed || item.target_qty} Pcs)</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.allotment_materials && item.allotment_materials.length > 0 ? (
                              item.allotment_materials.map(m => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => handleIssueMaterial(m.id, item.id)}
                                  disabled={isPending || m.admin_issued}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                    m.admin_issued
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                                      : 'bg-white border border-black/15 hover:bg-slate-50 text-slate-800'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{m.item_name}: {m.admin_issued ? 'Issued' : 'Issue Now'}</span>
                                </button>
                              ))
                            ) : (
                              <span className="text-xs font-mono text-slate-400">All materials issued</span>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* DISPATCH STAGE ACTIONS */}
                    {activeStation === 'DISPATCH' && (
                      <button
                        type="button"
                        onClick={() => {
                          setDispatchModalAllotment(item)
                          setDispatchChallanNo(item.challans?.challan_no || '')
                          setDispatchBags(item.total_bags_packed || 1)
                        }}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Generate Gate Pass & Dispatch</span>
                      </button>
                    )}

                  </div>
                </div>

                {/* Collapsible Color & Size Matrix Drawer */}
                {isExpanded && item.allotment_variants && item.allotment_variants.length > 0 && (
                  <div className="bg-[#FAF7F0] p-4 border-t border-black/10">
                    <p className="text-xs font-mono font-bold text-slate-700 mb-2">
                      Breakdown by Color & Size:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {item.allotment_variants.map(v => (
                        <div
                          key={v.id}
                          className="bg-white p-2.5 rounded-xl border border-black/10 shadow-2xs font-mono text-center"
                        >
                          <span className="text-[10px] text-slate-500 font-bold uppercase block truncate">
                            {v.color} ({v.size})
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                            {v.completed_qty || 0} / {v.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: ADVANCE LINEMAN STITCHING LOT TO MENDING TABLE             */}
      {/* =================================================================== */}
      {selectedAllotmentForMendingAdvance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-2xs">
                  <Scissors className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Handover to Mending Floor
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    {selectedAllotmentForMendingAdvance.challans?.challan_no ? `Challan #${selectedAllotmentForMendingAdvance.challans.challan_no} • ` : ''}
                    Style {selectedAllotmentForMendingAdvance.articles?.art_no || 'Garment'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAllotmentForMendingAdvance(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-black/10 space-y-1.5">
                <p className="text-slate-600">
                  Target Stitched Pieces: <strong className="text-slate-900">{selectedAllotmentForMendingAdvance.target_qty} Pcs</strong>
                </p>
                <p className="text-slate-600">
                  Stitching Line: <strong className="text-slate-900">{selectedAllotmentForMendingAdvance.profiles?.username || 'Lineman'}</strong>
                </p>
                <p className="text-[11px] text-emerald-700 font-bold">
                  Override Operator: {currentUserName} ({currentUserRole})
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Receiving Mending Supervisor
                </label>
                <div className="relative">
                  <select
                    value={targetMendingSupervisorId}
                    onChange={e => setTargetMendingSupervisorId(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-black/15 bg-white text-slate-900 font-mono text-xs focus:ring-2 focus:ring-[#3A3564]/20 focus:outline-none"
                  >
                    {mendingSupervisors.length > 0 ? (
                      mendingSupervisors.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.username} (Mending Desk)
                        </option>
                      ))
                    ) : (
                      <option value="">General Mending Floor</option>
                    )}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Floor Handover Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes for Mending finishing table (e.g. all bundles checked)..."
                  value={mendingAdvanceNotes}
                  onChange={e => setMendingAdvanceNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-[#3A3564]/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setSelectedAllotmentForMendingAdvance(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitMendingAdvance}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm Handover to Mending</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: MENDING VERIFY & HANDOVER TO QC                            */}
      {/* =================================================================== */}
      {selectedAllotmentForMending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-2xs">
                  <Wrench className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Mending Floor Verification Desk
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    {selectedAllotmentForMending.challans?.challan_no ? `Challan #${selectedAllotmentForMending.challans.challan_no} • ` : ''}
                    Style {selectedAllotmentForMending.articles?.art_no}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAllotmentForMending(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-black/10 space-y-1.5">
                <p className="text-slate-600">
                  Target Stitched Pieces: <strong className="text-slate-900">{selectedAllotmentForMending.target_qty} Pcs</strong>
                </p>
                <p className="text-slate-600">
                  Origin Line: <strong className="text-slate-900">{selectedAllotmentForMending.profiles?.username || 'Lineman'}</strong>
                </p>
                <p className="text-[11px] text-emerald-700 font-bold">
                  Operator: {currentUserName} (Admin Absentee Override)
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Total Counted Pieces (Physical Count)
                </label>
                <input
                  type="number"
                  value={mendingCountInput}
                  onChange={e => setMendingCountInput(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/15 bg-white text-slate-900 font-mono text-sm focus:ring-2 focus:ring-[#3A3564]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Target QC Supervisor</label>
                <div className="relative">
                  <select
                    value={targetQcSupervisorId}
                    onChange={e => setTargetQcSupervisorId(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-black/15 bg-white text-slate-900 font-mono text-xs focus:ring-2 focus:ring-[#3A3564]/20 focus:outline-none"
                  >
                    {qcSupervisors.length > 0 ? (
                      qcSupervisors.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.username} (QC Floor)
                        </option>
                      ))
                    ) : (
                      <option value="">General QC Pool</option>
                    )}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-slate-700 font-bold">Finishing Floor Checklist</label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mendingChecklist.threadTrimmed}
                    onChange={e => setMendingChecklist(prev => ({ ...prev, threadTrimmed: e.target.checked }))}
                    className="rounded border-black/20 text-[#3A3564]"
                  />
                  <span>Loose threads trimmed & cleaned</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mendingChecklist.seamChecked}
                    onChange={e => setMendingChecklist(prev => ({ ...prev, seamChecked: e.target.checked }))}
                    className="rounded border-black/20 text-[#3A3564]"
                  />
                  <span>Minor seams & needle snags repaired</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mendingChecklist.measurementChecked}
                    onChange={e => setMendingChecklist(prev => ({ ...prev, measurementChecked: e.target.checked }))}
                    className="rounded border-black/20 text-[#3A3564]"
                  />
                  <span>Bundle count matches cutting lay sheet</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Handover Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes for QC inspection floor..."
                  value={mendingNotesInput}
                  onChange={e => setMendingNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-[#3A3564]/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setSelectedAllotmentForMending(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitMending}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Verify & Handover to QC Floor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: QC INSPECT & PASS                                         */}
      {/* =================================================================== */}
      {selectedAllotmentForQc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Quality Inspection & QC Pass Desk
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    {selectedAllotmentForQc.challans?.challan_no ? `Challan #${selectedAllotmentForQc.challans.challan_no} • ` : ''}
                    Style {selectedAllotmentForQc.articles?.art_no}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAllotmentForQc(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <label className="block text-emerald-900 font-bold mb-1">
                    Passed Pieces (A-Grade)
                  </label>
                  <input
                    type="number"
                    value={qcPassedInput}
                    onChange={e => setQcPassedInput(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-emerald-950 font-bold text-sm"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
                  <label className="block text-amber-900 font-bold mb-1">
                    Alteration / Defective
                  </label>
                  <input
                    type="number"
                    value={qcAlterInput}
                    onChange={e => setQcAlterInput(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-amber-950 font-bold text-sm"
                  />
                </div>
              </div>

              {qcAlterInput > 0 && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Defect Classification
                  </label>
                  <select
                    value={qcDefectType}
                    onChange={e => setQcDefectType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/15 bg-white text-slate-900 font-mono text-xs"
                  >
                    <option value="STITCHING_ALTER">Stitching Alter / Seam Open</option>
                    <option value="BROKEN_STITCH">Broken Stitch / Thread Cut</option>
                    <option value="SKIP_STITCH">Skip Stitch / Seam Miss</option>
                    <option value="UNEVEN_HEM">Uneven Hem / Alignment</option>
                    <option value="FABRIC_STAIN">Fabric Stain / Spot</option>
                    <option value="SIZING_ISSUE">Sizing / Measurement Off</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Quality Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on garment finish, tags, packaging..."
                  value={qcNotesInput}
                  onChange={e => setQcNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-[#3A3564]/20 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-slate-600 text-[11px] font-mono">
                Verified by: <strong>{currentUserName} (Plant Admin QC Override)</strong>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-black/10">
              {qcAlterInput > 0 ? (
                <button
                  type="button"
                  onClick={handleSubmitQcAlter}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Send Alter to Lineman
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAllotmentForQc(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitQcPass}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve for Store Godown</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: REASSIGN LINEMAN                                           */}
      {/* =================================================================== */}
      {reassignModalAllotment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="text-base font-black text-slate-900">
                Reassign Floor Stitching Line
              </h3>
              <button
                type="button"
                onClick={() => setReassignModalAllotment(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <p className="text-slate-600">
                Transfer {reassignModalAllotment.challans?.challan_no ? `Challan #${reassignModalAllotment.challans.challan_no}` : 'Allotment'} to an active floor lineman:
              </p>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Target Lineman Line</label>
                <div className="relative">
                  <select
                    value={targetLinemanId}
                    onChange={e => setTargetLinemanId(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-black/15 bg-white text-slate-900 font-mono text-sm focus:ring-2 focus:ring-[#3A3564]/20 focus:outline-none"
                  >
                    <option value="">Select Lineman Line...</option>
                    {linemenProfiles.map(l => (
                      <option key={l.id} value={l.id}>
                        Line: {l.username}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setReassignModalAllotment(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReassign}
                disabled={isPending || !targetLinemanId}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Line Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: DISPATCH & GATE PASS                                       */}
      {/* =================================================================== */}
      {dispatchModalAllotment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="text-base font-black text-slate-900">
                Dispatch & Gate Pass Out
              </h3>
              <button
                type="button"
                onClick={() => setDispatchModalAllotment(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Buyer Delivery Challan #</label>
                <input
                  type="text"
                  value={dispatchChallanNo}
                  onChange={e => setDispatchChallanNo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/15 bg-white text-slate-900 font-mono text-sm focus:ring-2 focus:ring-[#3A3564]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Total Bags / Cartons Packed</label>
                <input
                  type="number"
                  value={dispatchBags}
                  onChange={e => setDispatchBags(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/15 bg-white text-slate-900 font-mono text-sm focus:ring-2 focus:ring-[#3A3564]/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setDispatchModalAllotment(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDispatch}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Mark Dispatched</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
