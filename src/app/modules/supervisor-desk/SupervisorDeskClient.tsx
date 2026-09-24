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
  SlidersHorizontal,
  Building2
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
  adminIssueAllMaterials,
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
  production_order_no?: string
  client_challan_no?: string
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
  companyName?: string
}

// Helper to resolve accurate Challan, Article and Brand from allotment + material metadata
function getAllotmentDetails(item: AllotmentItem | null, companyFallback = 'Factory Brand') {
  if (!item) return { challanNo: '', articleNo: '', brand: companyFallback, noteMeta: {} }

  let noteMeta: any = {}
  if (item.allotment_materials && item.allotment_materials.length > 0) {
    for (const m of item.allotment_materials) {
      if (m.notes) {
        try {
          const parsed = JSON.parse(m.notes)
          if (parsed && typeof parsed === 'object') {
            noteMeta = { ...noteMeta, ...parsed }
          }
        } catch (_) {}
      }
    }
  }

  const challanNo =
    noteMeta.client_challan_no ||
    (item as any).client_challan_no ||
    item.challans?.challan_no ||
    noteMeta.production_order_no ||
    (item as any).production_order_no ||
    (item.articles?.art_no ? `${item.articles.art_no}` : '') ||
    `LOT-${item.id.slice(0, 6).toUpperCase()}`

  const articleNo =
    noteMeta.art_no ||
    (item as any).art_no ||
    item.articles?.art_no ||
    noteMeta.production_order_no ||
    (item as any).production_order_no ||
    'Standard Article'

  const brand =
    item.challans?.brand ||
    noteMeta.brand ||
    (item as any).brand ||
    companyFallback

  return { challanNo, articleNo, brand, noteMeta }
}

export function SupervisorDeskClient({
  initialAllotments,
  linemenProfiles,
  allProfiles,
  currentUserEmail,
  currentUserName,
  currentUserRole,
  companyName = 'Enterprise Factory'
}: SupervisorDeskClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Navigation & Station State
  const [activeStation, setActiveStation] = useState<StationType>('LINEMAN')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLinemanFilter, setSelectedLinemanFilter] = useState<string>('ALL')
  const [storeSubTab, setStoreSubTab] = useState<'INWARD' | 'MATERIAL_ISSUE'>('INWARD')

  // Modals state
  const [selectedAllotmentForMendingAdvance, setSelectedAllotmentForMendingAdvance] = useState<AllotmentItem | null>(null)
  const [targetMendingSupervisorId, setTargetMendingSupervisorId] = useState<string>('')
  const [mendingAdvanceNotes, setMendingAdvanceNotes] = useState<string>('')

  const [selectedAllotmentForMending, setSelectedAllotmentForMending] = useState<AllotmentItem | null>(null)
  const [mendingCountInput, setMendingCountInput] = useState<number>(0)
  const [targetQcSupervisorId, setTargetQcSupervisorId] = useState<string>('')
  const [mendingNotesInput, setMendingNotesInput] = useState<string>('')

  const [selectedAllotmentForQc, setSelectedAllotmentForQc] = useState<AllotmentItem | null>(null)
  const [qcPassedInput, setQcPassedInput] = useState<number>(0)
  const [qcAlterInput, setQcAlterInput] = useState<number>(0)
  const [qcDefectType, setQcDefectType] = useState<string>('STITCHING_ALTER')
  const [qcNotesInput, setQcNotesInput] = useState<string>('')

  const [reassignModalAllotment, setReassignModalAllotment] = useState<AllotmentItem | null>(null)
  const [selectedNewLinemanId, setSelectedNewLinemanId] = useState<string>('')

  const [bundleCompleteModalAllotment, setBundleCompleteModalAllotment] = useState<AllotmentItem | null>(null)

  const [dispatchModalAllotment, setDispatchModalAllotment] = useState<AllotmentItem | null>(null)
  const [dispatchChallanNo, setDispatchChallanNo] = useState<string>('')
  const [dispatchGatePass, setDispatchGatePass] = useState<string>('')
  const [dispatchBags, setDispatchBags] = useState<number>(1)

  // Supervisor Profiles helpers
  const mendingSupervisors = useMemo(() => {
    return allProfiles.filter(p =>
      p.role?.toUpperCase() === 'MENDING' ||
      p.role?.toUpperCase() === 'ALTERATION' ||
      p.role?.toUpperCase() === 'SUPERADMIN' ||
      p.role?.toUpperCase() === 'ADMIN'
    )
  }, [allProfiles])

  const qcSupervisors = useMemo(() => {
    return allProfiles.filter(p =>
      p.role?.toUpperCase() === 'QC' ||
      p.role?.toUpperCase() === 'SUPERADMIN' ||
      p.role?.toUpperCase() === 'ADMIN'
    )
  }, [allProfiles])

  // Station Stage Classifiers
  const isLinemanStage = (item: AllotmentItem) => {
    const mStatus = item.mending_status || ''
    const qStatus = item.qc_status || ''
    return (
      (item.status === 'IN_PROGRESS' || item.status === 'PENDING') &&
      mStatus !== 'COUNTING_VERIFIED' &&
      mStatus !== 'QC_PENDING' &&
      qStatus !== 'APPROVED_FOR_STORE'
    )
  }

  const isMendingStage = (item: AllotmentItem) => {
    const mStatus = item.mending_status || ''
    return (
      mStatus === 'PENDING_MENDING' ||
      mStatus === 'MENDING_IN_PROGRESS' ||
      (item.status === 'COMPLETED' && (!mStatus || mStatus === 'PENDING'))
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
        const { challanNo, articleNo, brand } = getAllotmentDetails(item, companyName)
        const lineman = (item.profiles?.username || '').toLowerCase()
        if (
          !challanNo.toLowerCase().includes(q) &&
          !articleNo.toLowerCase().includes(q) &&
          !brand.toLowerCase().includes(q) &&
          !lineman.includes(q)
        ) {
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
  }, [initialAllotments, activeStation, storeSubTab, searchQuery, selectedLinemanFilter, companyName])

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
    const { challanNo, articleNo } = getAllotmentDetails(selectedAllotmentForMendingAdvance, companyName)
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
        toast.success(`Lot Challan #${challanNo} (${articleNo}) stitched and forwarded to Mending Floor.`)
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
        toast.success(`Lot verified (${mendingCountInput} pcs) and handed over to QC Floor.`)
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

  const handleStoreInward = (item: AllotmentItem) => {
    startTransition(async () => {
      const res = await adminStoreInward({
        allotment_id: item.id,
        quantity: item.qc_total_passed || item.target_qty,
        operator_name: currentUserName,
        notes: 'Inwarded via Supervisor Operations Hub'
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Finished lot inwarded to Godown inventory (${item.qc_total_passed || item.target_qty} pcs).`)
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
        toast.success('Production material issued and stock deducted.')
        router.refresh()
      }
    })
  }

  const handleIssueAllMaterials = (allotmentId: string) => {
    startTransition(async () => {
      const res = await adminIssueAllMaterials({
        allotment_id: allotmentId,
        operator_name: currentUserName
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(res.message || 'All production materials handed over to Lineman!')
        router.refresh()
      }
    })
  }

  const handleOpenReassignModal = (item: AllotmentItem) => {
    setReassignModalAllotment(item)
    setSelectedNewLinemanId(linemenProfiles[0]?.id || '')
  }

  const handleSubmitReassign = () => {
    if (!reassignModalAllotment || !selectedNewLinemanId) return
    const target = linemenProfiles.find(l => l.id === selectedNewLinemanId)
    startTransition(async () => {
      const res = await adminReassignLineman({
        allotment_id: reassignModalAllotment.id,
        new_lineman_id: selectedNewLinemanId,
        new_lineman_name: target?.username || 'New Lineman'
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(res.message || 'Lineman reassigned successfully.')
        setReassignModalAllotment(null)
        router.refresh()
      }
    })
  }

  const handleOpenBundleModal = (item: AllotmentItem) => {
    setBundleCompleteModalAllotment(item)
  }

  const handleCompleteAllBundles = (allotmentId: string, advanceToMending: boolean) => {
    startTransition(async () => {
      const res = await adminCompleteLinemanBundle({
        allotment_id: allotmentId,
        completed_qty: 0,
        advance_to_mending: advanceToMending,
        operator_name: currentUserName
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(advanceToMending ? 'All bundles logged and lot forwarded to Mending.' : 'All bundle tickets marked complete.')
        setBundleCompleteModalAllotment(null)
        router.refresh()
      }
    })
  }

  const handleOpenDispatchModal = (item: AllotmentItem) => {
    setDispatchModalAllotment(item)
    const { challanNo } = getAllotmentDetails(item, companyName)
    setDispatchChallanNo(`DC-${challanNo}`)
    setDispatchGatePass(`GP-${Math.floor(1000 + Math.random() * 9000)}`)
    setDispatchBags(item.total_bags_packed || 1)
  }

  const handleSubmitDispatch = () => {
    if (!dispatchModalAllotment) return
    startTransition(async () => {
      const res = await adminDispatchAllotment({
        allotment_id: dispatchModalAllotment.id,
        challan_no: dispatchChallanNo || dispatchModalAllotment.challans?.challan_no,
        gate_pass_no: dispatchGatePass,
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
      
      {/* 1. EXECUTIVE BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <Link
              href="/modules"
              className="text-[#57564E] hover:text-[#14140F] transition-colors"
            >
              Workspace Hub
            </Link>
            <span className="text-[#57564E]/40">/</span>
            <Link
              href="/stitching-sewing/dashboard"
              className="text-[#57564E] hover:text-[#14140F] transition-colors"
            >
              Sewing Floor
            </Link>
            <span className="text-[#57564E]/40">/</span>
            <span className="text-[#14140F] font-bold">
              Supervisor Desk
            </span>
            <span className="text-[#57564E]/40">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Building2 className="w-3.5 h-3.5" />
              {companyName}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14140F]">
            Supervisor Operations & Absentee Override Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#57564E] font-normal">
            Centralized factory floor control for Linemen, Mending, Quality Check, Store, and Dispatch gates.
          </p>
        </div>

        {/* Live Operator Presence Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-black/10 shadow-2xs shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-[#14140F] leading-tight">
                {currentUserName}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-bold">
                {currentUserRole}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E6B4F] animate-pulse" />
              <p className="text-[10px] font-mono text-[#2E6B4F] font-bold uppercase tracking-wider">
                Floor Override Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHRONOLOGICAL WORKFLOW STAGES (COHESIVE PALETTE) */}
      <div className="bg-white p-2 rounded-2xl border border-black/10 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          
          {/* Stage 1: Lineman */}
          <button
            type="button"
            onClick={() => setActiveStation('LINEMAN')}
            className={`flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
              activeStation === 'LINEMAN'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'bg-white hover:bg-[#FAF7F0] text-[#57564E] border border-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeStation === 'LINEMAN' ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
              }`}>
                <Scissors className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono uppercase opacity-75 font-semibold">Stage 1</p>
                <p className="text-xs sm:text-sm font-bold truncate">Lineman Lines</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md tabular-nums shrink-0 ml-1 ${
              activeStation === 'LINEMAN' ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
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
                : 'bg-white hover:bg-[#FAF7F0] text-[#57564E] border border-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeStation === 'MENDING' ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
              }`}>
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono uppercase opacity-75 font-semibold">Stage 2</p>
                <p className="text-xs sm:text-sm font-bold truncate">Mending Desk</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md tabular-nums shrink-0 ml-1 ${
              activeStation === 'MENDING' ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
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
                : 'bg-white hover:bg-[#FAF7F0] text-[#57564E] border border-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeStation === 'QC' ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono uppercase opacity-75 font-semibold">Stage 3</p>
                <p className="text-xs sm:text-sm font-bold truncate">QC Inspection</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md tabular-nums shrink-0 ml-1 ${
              activeStation === 'QC' ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
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
                : 'bg-white hover:bg-[#FAF7F0] text-[#57564E] border border-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeStation === 'STORE' ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
              }`}>
                <Warehouse className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono uppercase opacity-75 font-semibold">Stage 4</p>
                <p className="text-xs sm:text-sm font-bold truncate">Store Godown</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md tabular-nums shrink-0 ml-1 ${
              activeStation === 'STORE' ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
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
                : 'bg-white hover:bg-[#FAF7F0] text-[#57564E] border border-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeStation === 'DISPATCH' ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
              }`}>
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono uppercase opacity-75 font-semibold">Stage 5</p>
                <p className="text-xs sm:text-sm font-bold truncate">Dispatch Gate</p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md tabular-nums shrink-0 ml-1 ${
              activeStation === 'DISPATCH' ? 'bg-white/20 text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
            }`}>
              {kpis.readyDispatch}
            </span>
          </button>

        </div>
      </div>

      {/* 3. EXECUTIVE KPI CARDS (CLEAN ZIGZA AESTHETIC) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#57564E]">
              Active Stitching
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#14140F]">
              {kpis.activeLines}
            </span>
            <p className="text-xs text-[#57564E]/80 mt-0.5">
              Running on {linemenProfiles.length} floor lines
            </p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#57564E]">
              Mending Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#14140F]">
              {kpis.mendingQueue}
            </span>
            <p className="text-xs text-[#57564E]/80 mt-0.5">
              Awaiting counting & trim
            </p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#57564E]">
              QC Inspection
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#14140F]">
              {kpis.qcQueue}
            </span>
            <p className="text-xs text-[#57564E]/80 mt-0.5">
              Ready for quality check
            </p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#57564E]">
              Godown Inward
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#14140F]">
              {kpis.storeQueue}
            </span>
            <p className="text-xs text-[#57564E]/80 mt-0.5">
              QC approved finished stock
            </p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#57564E]">
              Dispatch Ready
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#14140F]">
              {kpis.readyDispatch}
            </span>
            <p className="text-xs text-[#57564E]/80 mt-0.5">
              Gate pass ready lots
            </p>
          </div>
        </div>
      </div>

      {/* 4. STATION CONTROLS & FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57564E]/60" />
            <input
              type="text"
              placeholder="Search by Challan #, Article #, Lineman..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-black/10 rounded-lg text-xs font-mono text-[#14140F] placeholder-[#57564E]/60 focus:outline-none focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564]"
            />
          </div>

          {activeStation === 'LINEMAN' && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-[#57564E] hidden md:inline">Floor Line:</span>
              <select
                value={selectedLinemanFilter}
                onChange={e => setSelectedLinemanFilter(e.target.value)}
                className="bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-medium text-[#14140F] focus:outline-none focus:border-[#3A3564]"
              >
                <option value="ALL">All Floor Lines ({linemenProfiles.length})</option>
                {linemenProfiles.map(lp => (
                  <option key={lp.id} value={lp.id}>Line: {lp.username}</option>
                ))}
              </select>
            </div>
          )}

          {activeStation === 'STORE' && (
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F0] border border-black/10 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setStoreSubTab('INWARD')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  storeSubTab === 'INWARD'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'text-[#57564E] hover:text-[#14140F]'
                }`}
              >
                Inward Finished ({kpis.storeQueue})
              </button>
              <button
                type="button"
                onClick={() => setStoreSubTab('MATERIAL_ISSUE')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  storeSubTab === 'MATERIAL_ISSUE'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'text-[#57564E] hover:text-[#14140F]'
                }`}
              >
                Trims & BOM Issuance
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FAF7F0] text-[#14140F] border border-black/10 rounded-lg text-xs font-medium transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#57564E] ${isPending ? 'animate-spin' : ''}`} />
            <span>Sync Floor</span>
          </button>
        </div>
      </div>

      {/* 5. ALLOTMENT EXECUTION CARDS / EMPTY QUEUE */}
      {filteredAllotments.length === 0 ? (
        <div className="bg-white rounded-xl border border-black/10 p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] mx-auto shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#14140F]">
              Station Queue Clear
            </h3>
            <p className="text-xs sm:text-sm text-[#57564E] max-w-md mx-auto mt-1">
              All floor lots have been processed for this station. Switch to another stage tab above to review active production, or release a new production order.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/stitching-sewing/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/10 rounded-lg text-xs font-bold transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sewing Floor</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAllotments.map(item => {
            const { challanNo, articleNo, brand } = getAllotmentDetails(item, companyName)
            const lineman = item.profiles?.username || 'Unassigned'
            const target = item.target_qty || 0
            const variants = item.allotment_variants || []
            const materials = item.allotment_materials || []

            const unissuedMaterials = materials.filter(m => !m.admin_issued)
            const isStoreHandoverPending = materials.length > 0 && unissuedMaterials.length > 0

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-black/10 p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                      <FileText className="w-3.5 h-3.5" />
                      Challan #{challanNo}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-bold">
                      Article: {articleNo}
                    </span>
                    {brand && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {brand}
                      </span>
                    )}
                    {item.priority === 'HIGH' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold uppercase">
                        High Priority
                      </span>
                    )}

                    {/* Store Handover Status Tag */}
                    {activeStation === 'LINEMAN' && (
                      isStoreHandoverPending ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Waiting for Store Handover ({unissuedMaterials.length} items pending)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Materials Handed Over
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#57564E]">Target:</span>
                    <span className="text-sm font-bold font-mono text-[#14140F] tabular-nums">
                      {target.toLocaleString()} Pcs
                    </span>
                  </div>
                </div>

                {/* Lineman Floor Alert Banner if Store Handover is Pending */}
                {activeStation === 'LINEMAN' && isStoreHandoverPending && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold block sm:inline">Store Material Handover Required:</span>
                        <span className="text-amber-800 sm:ml-1">
                          Trims & BOM have not been released from Store yet for Lineman <strong>{lineman}</strong>.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleIssueAllMaterials(item.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>1-Click Handover All ({unissuedMaterials.length} Items)</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#57564E]/70 block">Assigned Lineman</span>
                    <span className="font-bold text-[#14140F]">{lineman}</span>
                  </div>
                  <div>
                    <span className="text-[#57564E]/70 block">Current Floor Stage</span>
                    <span className="font-bold text-[#3A3564]">
                      {activeStation === 'LINEMAN' && (
                        isStoreHandoverPending ? (
                          <span className="text-amber-700">Awaiting Store Handover</span>
                        ) : (
                          'Lineman Floor Sewing'
                        )
                      )}
                      {activeStation === 'MENDING' && 'Mending Audit Queue'}
                      {activeStation === 'QC' && '3-Stage Quality Check'}
                      {activeStation === 'STORE' && (storeSubTab === 'INWARD' ? 'Godown Inward' : 'Trims Issuance')}
                      {activeStation === 'DISPATCH' && 'Dispatch Gate Pass'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#57564E]/70 block">Variants / Sizes</span>
                    <span className="font-bold text-[#14140F]">
                      {variants.length > 0 ? `${variants.length} Size Cuts` : 'Single Ratio'}
                    </span>
                  </div>
                </div>

                {/* Assigned Color & Size Ratio Breakdown */}
                {variants.length > 0 && (
                  <div className="p-3 bg-[#FAF7F0] border border-black/10 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                      <div className="flex items-center gap-1.5 font-bold text-[#14140F]">
                        <Layers className="w-3.5 h-3.5 text-[#3A3564]" />
                        <span>Assigned Color & Size Breakdown:</span>
                      </div>
                      <span className="text-[11px] text-[#57564E] font-semibold">
                        Total: {variants.reduce((sum, v) => sum + (v.quantity || 0), 0)} Pcs
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {variants.map((v) => {
                        const isComplete = (v.completed_qty || 0) >= v.quantity && v.quantity > 0
                        return (
                          <div
                            key={v.id}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                              isComplete
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : 'bg-white text-slate-800 border-black/10 shadow-2xs'
                            }`}
                          >
                            {v.color && (
                              <span className="font-bold text-[#3A3564] uppercase">
                                {v.color}
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-extrabold text-slate-700">
                              {v.size}
                            </span>
                            <span className="font-bold tabular-nums">
                              {v.quantity} pcs
                            </span>
                            {v.completed_qty > 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                                ✓ {v.completed_qty}/{v.quantity}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* STATION SPECIFIC OVERRIDE ACTIONS */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 flex-wrap">
                  {activeStation === 'LINEMAN' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenReassignModal(item)}
                        className="px-3.5 py-2 bg-white hover:bg-[#FAF7F0] text-[#14140F] border border-black/10 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                      >
                        Reassign Line
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenBundleModal(item)}
                        className="px-3.5 py-2 bg-white hover:bg-[#FAF7F0] text-[#14140F] border border-black/10 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                      >
                        Log Bundles
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenMendingAdvanceModal(item)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                          isStoreHandoverPending
                            ? 'bg-[#3A3564]/80 hover:bg-[#3A3564]'
                            : 'bg-[#3A3564] hover:bg-[#2B274C]'
                        }`}
                      >
                        <span>Handover to Mending</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {activeStation === 'MENDING' && (
                    <button
                      type="button"
                      onClick={() => handleOpenMendingModal(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3A3564] hover:bg-[#2B274C] text-white rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                    >
                      <span>Verify Count & Handover to QC</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {activeStation === 'QC' && (
                    <button
                      type="button"
                      onClick={() => handleOpenQcModal(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3A3564] hover:bg-[#2B274C] text-white rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                    >
                      <span>Inspect & Pass QC</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {activeStation === 'STORE' && (
                    storeSubTab === 'INWARD' ? (
                      <button
                        type="button"
                        onClick={() => handleStoreInward(item)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3A3564] hover:bg-[#2B274C] text-white rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Inward to Godown</span>
                      </button>
                    ) : (
                      <div className="w-full space-y-3 pt-1">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-black/10">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#14140F]">
                                BOM & Trims Material Handover
                              </span>
                              {unissuedMaterials.length > 0 ? (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                                  {unissuedMaterials.length} Pending Handover
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                                  100% Handed Over
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-[#57564E]">
                              Target Lineman: <strong className="text-[#14140F]">{lineman}</strong>
                            </p>
                          </div>

                          {unissuedMaterials.length > 0 ? (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleIssueAllMaterials(item.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2E6B4F] hover:bg-[#24533D] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>1-Click Handover All to {lineman}</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>All Materials Issued to Lineman</span>
                            </div>
                          )}
                        </div>

                        {/* List of Material Items */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {materials.map(mat => (
                            <button
                              key={mat.id}
                              type="button"
                              disabled={mat.admin_issued}
                              onClick={() => handleIssueMaterial(mat.id, item.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                                mat.admin_issued
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                  : 'bg-white hover:bg-[#FAF7F0] text-[#14140F] border border-black/15 shadow-2xs cursor-pointer'
                              }`}
                            >
                              {mat.admin_issued ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                              )}
                              <span>{mat.item_name} ({mat.required_qty})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  {activeStation === 'DISPATCH' && (
                    <button
                      type="button"
                      onClick={() => handleOpenDispatchModal(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3A3564] hover:bg-[#2B274C] text-white rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Issue Delivery Gate Pass</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          OVERRIDE ACTION MODALS
      ------------------------------------------------------------------------ */}

      {/* Modal: Advance to Mending */}
      {selectedAllotmentForMendingAdvance && (
        <div className="fixed inset-0 bg-[#1C1A2E]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="text-base font-bold text-[#14140F]">
                Handover to Mending Desk
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAllotmentForMendingAdvance(null)}
                className="p-1 rounded-lg hover:bg-[#FAF7F0] text-[#57564E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#57564E]">
              Confirm advancement of Challan #{getAllotmentDetails(selectedAllotmentForMendingAdvance, companyName).challanNo} ({getAllotmentDetails(selectedAllotmentForMendingAdvance, companyName).articleNo}) to Mending Floor.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                  Mending Supervisor:
                </label>
                <select
                  value={targetMendingSupervisorId}
                  onChange={e => setTargetMendingSupervisorId(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-mono text-[#14140F]"
                >
                  {mendingSupervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.username} ({s.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                  Handover Notes:
                </label>
                <textarea
                  value={mendingAdvanceNotes}
                  onChange={e => setMendingAdvanceNotes(e.target.value)}
                  placeholder="e.g. Completed on Line 2, all bundles verified"
                  className="w-full bg-white border border-black/10 rounded-lg p-2.5 text-xs font-mono text-[#14140F]"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setSelectedAllotmentForMendingAdvance(null)}
                className="px-4 py-2 bg-white border border-black/10 text-xs font-medium text-[#14140F] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSubmitMendingAdvance}
                className="px-4 py-2 bg-[#3A3564] hover:bg-[#2B274C] text-white text-xs font-medium rounded-lg"
              >
                {isPending ? 'Advancing...' : 'Confirm Handover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mending Count & Handover to QC */}
      {selectedAllotmentForMending && (
        <div className="fixed inset-0 bg-[#1C1A2E]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="text-base font-bold text-[#14140F]">
                Verify Physical Count & Handover to QC
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAllotmentForMending(null)}
                className="p-1 rounded-lg hover:bg-[#FAF7F0] text-[#57564E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                  Physical Counted Pieces:
                </label>
                <input
                  type="number"
                  value={mendingCountInput}
                  onChange={e => setMendingCountInput(Number(e.target.value))}
                  className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm font-mono text-[#14140F]"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                  Target QC Supervisor:
                </label>
                <select
                  value={targetQcSupervisorId}
                  onChange={e => setTargetQcSupervisorId(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-mono text-[#14140F]"
                >
                  {qcSupervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.username} ({s.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                  Counting Remarks:
                </label>
                <textarea
                  value={mendingNotesInput}
                  onChange={e => setMendingNotesInput(e.target.value)}
                  placeholder="e.g. 100% count verified, no shortages detected"
                  className="w-full bg-white border border-black/10 rounded-lg p-2.5 text-xs font-mono text-[#14140F]"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setSelectedAllotmentForMending(null)}
                className="px-4 py-2 bg-white border border-black/10 text-xs font-medium text-[#14140F] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSubmitMending}
                className="px-4 py-2 bg-[#3A3564] hover:bg-[#2B274C] text-white text-xs font-medium rounded-lg"
              >
                {isPending ? 'Verifying...' : 'Submit to QC'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inspect & Pass QC */}
      {selectedAllotmentForQc && (
        <div className="fixed inset-0 bg-[#1C1A2E]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="text-base font-bold text-[#14140F]">
                QC Inspection Decision
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAllotmentForQc(null)}
                className="p-1 rounded-lg hover:bg-[#FAF7F0] text-[#57564E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono font-medium text-[#2E6B4F] block mb-1">
                  Passed Pieces:
                </label>
                <input
                  type="number"
                  value={qcPassedInput}
                  onChange={e => setQcPassedInput(Number(e.target.value))}
                  className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm font-mono text-[#14140F]"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-medium text-[#8A3B34] block mb-1">
                  Alteration Pcs:
                </label>
                <input
                  type="number"
                  value={qcAlterInput}
                  onChange={e => setQcAlterInput(Number(e.target.value))}
                  className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm font-mono text-[#14140F]"
                />
              </div>
            </div>
            {qcAlterInput > 0 && (
              <div>
                <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                  Defect Category:
                </label>
                <select
                  value={qcDefectType}
                  onChange={e => setQcDefectType(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-mono text-[#14140F]"
                >
                  <option value="STITCHING_ALTER">Stitching / Seam Defect</option>
                  <option value="BROKEN_STITCH">Broken Stitch</option>
                  <option value="MEASUREMENT_OUT">Measurement Spec Deviation</option>
                  <option value="OIL_SPOT">Oil Spot / Soil</option>
                  <option value="FABRIC_HOLE">Fabric Damage / Hole</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                Inspection Remarks:
              </label>
              <textarea
                value={qcNotesInput}
                onChange={e => setQcNotesInput(e.target.value)}
                placeholder="e.g. Visual inspection AQL 2.5 compliant"
                className="w-full bg-white border border-black/10 rounded-lg p-2.5 text-xs font-mono text-[#14140F]"
                rows={2}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              {qcAlterInput > 0 ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSubmitQcAlter}
                  className="px-4 py-2 bg-[#8A3B34] hover:bg-[#6D2E28] text-white text-xs font-medium rounded-lg"
                >
                  Flag Alteration ({qcAlterInput} Pcs)
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSubmitQcPass}
                  className="px-4 py-2 bg-[#3A3564] hover:bg-[#2B274C] text-white text-xs font-medium rounded-lg"
                >
                  Approve QC & Forward to Store
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reassign Lineman */}
      {reassignModalAllotment && (
        <div className="fixed inset-0 bg-[#1C1A2E]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="text-base font-bold text-[#14140F]">
                Reassign Lineman Floor Line
              </h3>
              <button
                type="button"
                onClick={() => setReassignModalAllotment(null)}
                className="p-1 rounded-lg hover:bg-[#FAF7F0] text-[#57564E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                Select Floor Lineman:
              </label>
              <select
                value={selectedNewLinemanId}
                onChange={e => setSelectedNewLinemanId(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-mono text-[#14140F]"
              >
                {linemenProfiles.map(l => (
                  <option key={l.id} value={l.id}>{l.username}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setReassignModalAllotment(null)}
                className="px-4 py-2 bg-white border border-black/10 text-xs font-medium text-[#14140F] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSubmitReassign}
                className="px-4 py-2 bg-[#3A3564] hover:bg-[#2B274C] text-white text-xs font-medium rounded-lg"
              >
                {isPending ? 'Updating...' : 'Confirm Reassignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bundle Log Override */}
      {bundleCompleteModalAllotment && (
        <div className="fixed inset-0 bg-[#1C1A2E]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="text-base font-bold text-[#14140F]">
                Log All Bundle Tickets
              </h3>
              <button
                type="button"
                onClick={() => setBundleCompleteModalAllotment(null)}
                className="p-1 rounded-lg hover:bg-[#FAF7F0] text-[#57564E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#57564E]">
              Mark all cut ratio bundle tickets complete for Challan #{getAllotmentDetails(bundleCompleteModalAllotment, companyName).challanNo} ({getAllotmentDetails(bundleCompleteModalAllotment, companyName).articleNo}).
            </p>

            {/* List Variants in Modal */}
            {bundleCompleteModalAllotment.allotment_variants && bundleCompleteModalAllotment.allotment_variants.length > 0 && (
              <div className="p-3 bg-[#FAF7F0] border border-black/10 rounded-xl space-y-2 max-h-48 overflow-y-auto">
                <span className="text-[11px] font-mono font-bold text-[#57564E] block">
                  Assigned Cut Bundles ({bundleCompleteModalAllotment.allotment_variants.length} Size Cuts):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {bundleCompleteModalAllotment.allotment_variants.map(v => (
                    <span
                      key={v.id}
                      className="px-2 py-1 rounded bg-white border border-black/10 text-xs font-mono font-bold text-[#14140F]"
                    >
                      {v.color ? `${v.color} • ` : ''}{v.size}: {v.quantity} pcs
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleCompleteAllBundles(bundleCompleteModalAllotment.id, false)}
                className="px-4 py-2 bg-white border border-black/10 text-xs font-medium text-[#14140F] rounded-lg"
              >
                Mark Complete Only
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleCompleteAllBundles(bundleCompleteModalAllotment.id, true)}
                className="px-4 py-2 bg-[#3A3564] hover:bg-[#2B274C] text-white text-xs font-medium rounded-lg"
              >
                Complete & Advance to Mending
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gate Pass Dispatch */}
      {dispatchModalAllotment && (
        <div className="fixed inset-0 bg-[#1C1A2E]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="text-base font-bold text-[#14140F]">
                Issue Delivery Gate Pass
              </h3>
              <button
                type="button"
                onClick={() => setDispatchModalAllotment(null)}
                className="p-1 rounded-lg hover:bg-[#FAF7F0] text-[#57564E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                  Delivery Challan No:
                </label>
                <input
                  type="text"
                  value={dispatchChallanNo}
                  onChange={e => setDispatchChallanNo(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-mono text-[#14140F]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                    Gate Pass No:
                  </label>
                  <input
                    type="text"
                    value={dispatchGatePass}
                    onChange={e => setDispatchGatePass(e.target.value)}
                    className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-mono text-[#14140F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-medium text-[#57564E] block mb-1">
                    Bags / Cartons:
                  </label>
                  <input
                    type="number"
                    value={dispatchBags}
                    onChange={e => setDispatchBags(Number(e.target.value))}
                    className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-mono text-[#14140F]"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setDispatchModalAllotment(null)}
                className="px-4 py-2 bg-white border border-black/10 text-xs font-medium text-[#14140F] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSubmitDispatch}
                className="px-4 py-2 bg-[#3A3564] hover:bg-[#2B274C] text-white text-xs font-medium rounded-lg"
              >
                {isPending ? 'Issuing...' : 'Authorize & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
