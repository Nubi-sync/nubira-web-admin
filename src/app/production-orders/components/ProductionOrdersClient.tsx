'use client'

import { useState, useMemo, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Layers,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  Download,
  Printer,
  Trash2,
  Tag,
  X,
  ChevronDown,
  ChevronRight,
  Copy,
  FileSpreadsheet,
  UploadCloud,
  FileUp,
  FileText,
  Check,
  User,
  Palette,
  Zap,
  UserCheck,
  Sparkles,
  History,
  Eye,
  Archive,
  TrendingUp,
  BarChart3,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react'
import {
  ChallanArticleLine,
  ChallanBomItem,
  CreateChallanPayload,
  ChallanGroupedOrder,
  createChallan,
  updateOrderStatus,
  deleteProductionOrder,
  assignLinemanToArticle,
  allotEntireChallan,
  allotChallanByColor
} from '../actions'
import {
  downloadCleanChallanTemplate,
  parseChallanExcelFile
} from '@/lib/excelChallanParser'
import { TvViewButton } from '@/components/ui/TvViewButton'
import { CustomSelect, CustomSelectOption } from '@/components/ui/CustomSelect'
import { SubtleDialog } from '@/components/ui/SubtleDialog'

const DEFAULT_FABRICS = [
  'PRINTED SINKER',
  'LY 2FD',
  'LY SINKER',
  'P.K LY KULTY',
  '28 SINKER',
  'HEAVY FLEECE',
  'COTTON CANDY KNIT',
  'SINGLE JERSEY',
  'TERRY COTTON'
]

const DEFAULT_BRANDS = [
  'OLLYPOP',
  'FIRST SMILE',
  'LAZY BONES',
  'CANDY POP',
  'NUBIRA IN-HOUSE',
  'CHERRY POP'
]

const COMMON_SIZES = ['L/XXL', '22X26', '28X32', '16X20', 'M/L/XL', 'Free Size']

const createEmptyArticleLine = (): ChallanArticleLine => ({
  art_no: '',
  sub_art_no: '',
  pattern_no: '',
  description: '',
  color_pattern: '',
  size_range: '',
  sets: '' as any,
  pcs_per_set: '' as any,
  total_pcs: '' as any,
  assigned_lineman_id: ''
})

interface ProductionOrdersClientProps {
  initialOrders: ChallanGroupedOrder[]
  articlesList: any[]
  linemenList?: any[]
}

export function ProductionOrdersClient({
  initialOrders = [],
  articlesList = [],
  linemenList = []
}: ProductionOrdersClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [orders, setOrders] = useState<ChallanGroupedOrder[]>(initialOrders || [])
  const [expandedChallans, setExpandedChallans] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    initialOrders.forEach(o => { initial[o.id] = true })
    return initial
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE')
  const [selectedDate, setSelectedDate] = useState('ALL')

  // Modals
  const [showNewChallanModal, setShowNewChallanModal] = useState(false)
  const [showArticleHistoryModal, setShowArticleHistoryModal] = useState(false)
  const [selectedArticleForHistory, setSelectedArticleForHistory] = useState<string>('')
  const [articleHistorySearch, setArticleHistorySearch] = useState<string>('')

  // Excel Bulk Import States
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Smart Allotment States
  const [selectedFullLineman, setSelectedFullLineman] = useState<Record<string, string>>({})
  const [selectedColorLineman, setSelectedColorLineman] = useState<Record<string, Record<string, string>>>({})
  const [activeActionTab, setActiveActionTab] = useState<Record<string, 'COLOR_SPLIT' | 'FULL_CHALLAN' | 'TABLE'>>({})
  const [allotSuccessMsg, setAllotSuccessMsg] = useState<Record<string, string>>({})

  // Custom Subtle Dialog State (Replaces system-generated alert/confirm)
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    title: string
    description?: string
    variant?: 'error' | 'warning' | 'info' | 'success' | 'confirm'
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
  }>({
    isOpen: false,
    title: '',
    variant: 'error'
  })

  const showErrorDialog = (title: string, description?: string) => {
    setDialogState({
      isOpen: true,
      title,
      description,
      variant: 'error',
      confirmText: 'Understood'
    })
  }

  // Filter Dropdown Options (Zero emojis, international typography standards with colored indicator dots)
  const statusFilterOptions: CustomSelectOption[] = [
    { value: 'ACTIVE', label: 'Active Orders (Live Floor)', dotColor: '#10B981' },
    { value: 'ALL', label: 'All Orders (Including Archive)', dotColor: '#64748B' },
    { value: 'PENDING', label: 'Pending Allotment', dotColor: '#F59E0B' },
    { value: 'IN_PROGRESS', label: 'In Production', dotColor: '#6366F1' },
    { value: 'QC_PASSED', label: 'Ready (QC Passed)', dotColor: '#10B981' },
    { value: 'DISPATCHED', label: 'Dispatched / Delivered', dotColor: '#1E293B' },
  ]

  const brandFilterOptions: CustomSelectOption[] = [
    { value: 'ALL', label: 'All Brands' },
    ...DEFAULT_BRANDS.map(b => ({ value: b, label: b }))
  ]

  const linemanOptions: CustomSelectOption[] = [
    { value: '', label: 'Select Lineman...' },
    ...linemenList.map(lm => ({
      value: lm.id,
      label: lm.username
    }))
  ]

  // ----------------------------------------------------------------------
  // NEW CHALLAN FORM STATE (Clean / Fresh / Zero Hardcoded Defaults)
  // ----------------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0]
  const [formChallanNo, setFormChallanNo] = useState('')
  const [formChallanDate, setFormChallanDate] = useState(todayStr)
  const [formBrand, setFormBrand] = useState('')
  const [formDeliveryDate, setFormDeliveryDate] = useState('')
  const [formFabric, setFormFabric] = useState('')
  const [formSampleGiven, setFormSampleGiven] = useState(false)
  const [formNotes, setFormNotes] = useState('')

  // Article Lines Grid (Starts with 1 empty clean row)
  const [articleLines, setArticleLines] = useState<ChallanArticleLine[]>([createEmptyArticleLine()])

  // BOM / Raw Materials List (Starts clean empty)
  const [bomItems, setBomItems] = useState<ChallanBomItem[]>([])

  // Reset & Open Modal
  const handleOpenNewChallan = () => {
    setFormChallanNo('')
    setFormChallanDate(new Date().toISOString().split('T')[0])
    setFormBrand('')
    setFormDeliveryDate('')
    setFormFabric('')
    setFormSampleGiven(false)
    setFormNotes('')
    setArticleLines([createEmptyArticleLine()])
    setBomItems([])
    setImportStatus(null)
    setShowNewChallanModal(true)
  }

  // Handle Excel File Upload & Auto-fill
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      setImportStatus(null)
      const data = await parseChallanExcelFile(file)

      if (data.header.challan_no) setFormChallanNo(data.header.challan_no)
      if (data.header.brand) setFormBrand(data.header.brand)
      if (data.header.challan_date) setFormChallanDate(data.header.challan_date)
      if (data.header.fabric_type) setFormFabric(data.header.fabric_type)
      if (data.header.delivery_date) setFormDeliveryDate(data.header.delivery_date)
      if (data.header.sample_given !== undefined) setFormSampleGiven(data.header.sample_given)
      if (data.header.notes) setFormNotes(data.header.notes)

      if (data.articleLines && data.articleLines.length > 0) {
        setArticleLines(data.articleLines as any)
      }
      if (data.bomItems && data.bomItems.length > 0) {
        setBomItems(data.bomItems as any)
      }

      setImportStatus({
        type: 'success',
        message: `Imported ${data.summary.lineCount} article lines from "${file.name}" (Total ${data.summary.totalPcs.toLocaleString()} Pieces).`
      })
      setShowNewChallanModal(true)
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err.message || 'Failed to parse Excel file. Please check the file structure.'
      })
      setShowNewChallanModal(true)
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Handlers for Article Lines
  const handleAddArticleLine = () => {
    const last = articleLines[articleLines.length - 1]
    setArticleLines(prev => [
      ...prev,
      {
        art_no: last?.art_no || '',
        sub_art_no: '',
        pattern_no: last?.pattern_no || '',
        description: last?.description || '',
        color_pattern: last?.color_pattern || '',
        size_range: '',
        sets: '' as any,
        pcs_per_set: (last?.pcs_per_set !== undefined && (last?.pcs_per_set as any) !== '') ? last.pcs_per_set : ('' as any),
        total_pcs: '' as any,
        assigned_lineman_id: ''
      }
    ])
  }

  const handleDuplicateLine = (index: number) => {
    const target = articleLines[index]
    setArticleLines(prev => [
      ...prev.slice(0, index + 1),
      {
        ...target,
        sub_art_no: target.sub_art_no ? `${target.sub_art_no}/1` : 'A'
      },
      ...prev.slice(index + 1)
    ])
  }

  const handleRemoveArticleLine = (index: number) => {
    if (articleLines.length <= 1) {
      setArticleLines([createEmptyArticleLine()])
      return
    }
    setArticleLines(prev => prev.filter((_, i) => i !== index))
  }

  const handleLineChange = (index: number, field: keyof ChallanArticleLine, value: any) => {
    setArticleLines(prev => {
      const copy = [...prev]
      const current = { ...copy[index] }

      if (field === 'sets' || field === 'pcs_per_set') {
        const rawSets = field === 'sets' ? value : current.sets
        const rawRatio = field === 'pcs_per_set' ? value : current.pcs_per_set
        
        const setsVal = rawSets === '' ? ('' as any) : (parseInt(rawSets, 10) || 0)
        const ratioVal = rawRatio === '' ? ('' as any) : (parseInt(rawRatio, 10) || 0)
        
        current.sets = setsVal
        current.pcs_per_set = ratioVal
        current.total_pcs = (setsVal === '' || ratioVal === '') ? ('' as any) : (Number(setsVal) * Number(ratioVal))
      } else if (field === 'total_pcs') {
        const pcsVal = value === '' ? ('' as any) : (parseInt(value, 10) || 0)
        current.total_pcs = pcsVal
        if (pcsVal !== '' && current.pcs_per_set && Number(current.pcs_per_set) > 0) {
          current.sets = Math.round(Number(pcsVal) / Number(current.pcs_per_set)) || ('' as any)
        } else if (pcsVal === '') {
          current.sets = '' as any
        }
      } else {
        (current as any)[field] = value
      }

      // Auto fill pattern/desc if art_no matches existing article in database
      if (field === 'art_no' && value) {
        const matched = articlesList.find(a => a.art_no?.toUpperCase() === String(value).trim().toUpperCase())
        if (matched) {
          if (matched.description && !current.description) current.description = matched.description
          if (matched.size_rates?._meta?.pattern && !current.pattern_no) current.pattern_no = matched.size_rates._meta.pattern
          if (matched.size_rates?._meta?.party && !formBrand) setFormBrand(matched.size_rates._meta.party)
          if (matched.size_rates?._meta?.fabric && !formFabric) setFormFabric(matched.size_rates._meta.fabric)
        }
      }

      copy[index] = current
      return copy
    })
  }

  // BOM Handlers
  const handleAddBomItem = () => {
    setBomItems(prev => [
      ...prev,
      { material_type: 'FABRIC', item_name: '', lot_no: '', required_qty: '', status: 'PENDING' }
    ])
  }

  const handleRemoveBomItem = (index: number) => {
    setBomItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleBomChange = (index: number, field: keyof ChallanBomItem, value: any) => {
    setBomItems(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  // Grand totals of the modal form
  const formGrandSets = useMemo(() => {
    return articleLines.reduce((acc, row) => acc + (Number(row.sets) || 0), 0)
  }, [articleLines])

  const formGrandPcs = useMemo(() => {
    return articleLines.reduce((acc, row) => acc + (Number(row.total_pcs) || 0), 0)
  }, [articleLines])

  // Accordion Toggle
  const toggleChallan = (challanId: string) => {
    setExpandedChallans(prev => ({ ...prev, [challanId]: !prev[challanId] }))
  }

  // Summary Metrics Across All Orders (Master Articles vs Variant Rows)
  const summary = useMemo(() => {
    const uniqueMasterArticles = new Set<string>()
    let totalArticleLines = 0
    let totalSets = 0
    let totalPcs = 0
    let inProdPcs = 0
    let readyQcPcs = 0
    let dispatchedPcs = 0

    orders.forEach(ch => {
      totalSets += ch.total_sets || 0
      totalPcs += ch.total_pcs || 0
      totalArticleLines += ch.articles?.length || 0

      ch.articles?.forEach(art => {
        const rawArt = (art.art_no || '').trim().toUpperCase()
        const baseArt = rawArt.replace(/[^0-9].*$/, '').trim() || rawArt
        if (baseArt) uniqueMasterArticles.add(baseArt)

        const isAllotted = !!art.assigned_lineman_id && art.assigned_lineman_id !== '' && art.status === 'IN_PROGRESS'

        if (art.status === 'QC_PASSED' || art.status === 'COMPLETED') {
          readyQcPcs += art.completed_qty || art.total_pcs || 0
        } else if (art.status === 'DISPATCHED') {
          dispatchedPcs += art.total_pcs || 0
        } else if (isAllotted) {
          inProdPcs += Math.max(0, (art.total_pcs || 0) - (art.completed_qty || 0))
        }
      })
    })

    return {
      totalChallans: orders.length,
      totalArticles: uniqueMasterArticles.size || orders.length,
      totalArticleLines,
      totalSets,
      totalPcs,
      inProdPcs,
      readyQcPcs,
      dispatchedPcs
    }
  }, [orders])

  // Master Articles Universe (Catalog + All Historical Challans / Allotments)
  const masterArticlesUniverse = useMemo(() => {
    const map = new Map<string, {
      art_no: string
      description: string
      stitching_rate: number
      brand: string
      fabric: string
      totalLifetimePcs: number
      totalLifetimeChallans: number
      totalLifetimeAllotments: number
      qcPassedPcs: number
      dispatchedPcs: number
      history: Array<{
        challanId: string
        challanNo: string
        challanDate: string
        brand: string
        fabricType: string
        colorPattern: string
        sizeRange: string
        sets: number
        pcsPerSet: number
        totalPcs: number
        completedQty: number
        linemanName: string
        status: string
        createdAt: string
      }>
    }>()

    // 1. Prepopulate from catalog articlesList
    articlesList.forEach(art => {
      const cleanArtNo = (art.art_no || '').trim().toUpperCase()
      const baseArt = cleanArtNo.replace(/[^0-9].*$/, '').trim() || cleanArtNo
      if (baseArt && !map.has(baseArt)) {
        map.set(baseArt, {
          art_no: baseArt,
          description: art.description || 'Garment Style',
          stitching_rate: Number(art.stitching_rate) || 20,
          brand: art.size_rates?._meta?.party || 'OLLYPOP',
          fabric: art.size_rates?._meta?.fabric || 'PRINTED SINKER',
          totalLifetimePcs: 0,
          totalLifetimeChallans: 0,
          totalLifetimeAllotments: 0,
          qcPassedPcs: 0,
          dispatchedPcs: 0,
          history: []
        })
      }
    })

    // 2. Populate from all orders (Past & Present Delivery Challans)
    orders.forEach(ch => {
      const recordedChallansPerArt = new Set<string>()

      ch.articles?.forEach(art => {
        const rawArt = (art.art_no || '').trim().toUpperCase()
        const baseArt = rawArt.replace(/[^0-9].*$/, '').trim() || rawArt
        if (!baseArt) return

        if (!map.has(baseArt)) {
          map.set(baseArt, {
            art_no: baseArt,
            description: art.description || 'Garment Style',
            stitching_rate: Number(art.stitching_rate) || 20,
            brand: ch.brand || 'OLLYPOP',
            fabric: ch.fabric_type || 'PRINTED SINKER',
            totalLifetimePcs: 0,
            totalLifetimeChallans: 0,
            totalLifetimeAllotments: 0,
            qcPassedPcs: 0,
            dispatchedPcs: 0,
            history: []
          })
        }

        const entry = map.get(baseArt)!
        entry.totalLifetimePcs += (Number(art.total_pcs) || 0)
        if (!recordedChallansPerArt.has(ch.id)) {
          entry.totalLifetimeChallans += 1
          recordedChallansPerArt.add(ch.id)
        }
        if (art.assigned_lineman_id) {
          entry.totalLifetimeAllotments += 1
        }
        if (art.status === 'QC_PASSED') {
          entry.qcPassedPcs += (Number(art.total_pcs) || 0)
        } else if (art.status === 'DISPATCHED') {
          entry.dispatchedPcs += (Number(art.total_pcs) || 0)
        }

        entry.history.push({
          challanId: ch.id,
          challanNo: ch.challan_no || 'CHALLAN',
          challanDate: ch.challan_date || '',
          brand: ch.brand || 'OLLYPOP',
          fabricType: ch.fabric_type || 'PRINTED SINKER',
          colorPattern: art.color_pattern || 'Standard',
          sizeRange: art.size_range || 'Free Size',
          sets: Number(art.sets) || 1,
          pcsPerSet: Number(art.pcs_per_set) || 9,
          totalPcs: Number(art.total_pcs) || 0,
          completedQty: Number(art.completed_qty) || 0,
          linemanName: art.assigned_lineman_name || 'Unassigned (Floor Order)',
          status: art.status || 'PENDING',
          createdAt: art.created_at || ch.created_at
        })
      })
    })

    return Array.from(map.values())
  }, [articlesList, orders])

  const selectedArticleHistory = useMemo(() => {
    if (!selectedArticleForHistory && masterArticlesUniverse.length > 0) {
      return masterArticlesUniverse[0]
    }
    return masterArticlesUniverse.find(a => a.art_no === selectedArticleForHistory) || masterArticlesUniverse[0]
  }, [selectedArticleForHistory, masterArticlesUniverse])

  // Filtered Orders (Auto-hides fully dispatched orders when selectedStatus === 'ACTIVE')
  const filteredOrders = useMemo(() => {
    return orders.filter(ch => {
      const matchSearch =
        searchQuery === '' ||
        ch.challan_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.fabric_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.articles?.some(a =>
          a.art_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.color_pattern?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.size_range?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.assigned_lineman_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchBrand = selectedBrand === 'ALL' || ch.brand?.toUpperCase() === selectedBrand.toUpperCase()

      let matchStatus = true
      if (selectedStatus === 'ACTIVE') {
        matchStatus = ch.status !== 'DISPATCHED'
      } else if (selectedStatus !== 'ALL') {
        matchStatus = ch.status === selectedStatus
      }

      const matchDate = selectedDate === 'ALL' || ch.challan_date === selectedDate

      return matchSearch && matchBrand && matchStatus && matchDate
    })
  }, [orders, searchQuery, selectedBrand, selectedStatus, selectedDate])

  // Save Challan Action
  const handleSaveChallan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formChallanNo.trim()) {
      showErrorDialog(
        'Missing Challan Number',
        'Please enter a valid Job or Challan number (e.g. JOB-457) before saving.'
      )
      return
    }

    const validLines = articleLines.filter(l => l.art_no && l.art_no.trim())
    if (validLines.length === 0) {
      showErrorDialog(
        'Missing Article Entries',
        'Please enter at least one cutting article line with an Article Number.'
      )
      return
    }

    const cleanChallan = formChallanNo.trim().toUpperCase()
    const isDuplicate = orders.some(o => o.challan_no?.trim().toUpperCase() === cleanChallan)
    if (isDuplicate) {
      showErrorDialog(
        'Duplicate Challan Number',
        `Challan #${cleanChallan} already exists in the system! Each delivery job challan must have a unique Challan Number. Please enter a different number.`
      )
      return
    }

    const payload: CreateChallanPayload = {
      challan_no: cleanChallan,
      challan_date: formChallanDate,
      brand: (formBrand || 'OLLYPOP').trim().toUpperCase(),
      delivery_date: formDeliveryDate || undefined,
      fabric_type: formFabric.trim() || 'PRINTED SINKER',
      sample_given: formSampleGiven,
      notes: formNotes.trim(),
      article_lines: validLines.map(l => ({
        ...l,
        sets: Number(l.sets) || 1,
        pcs_per_set: Number(l.pcs_per_set) || 9,
        total_pcs: Number(l.total_pcs) || ((Number(l.sets) || 1) * (Number(l.pcs_per_set) || 9))
      })),
      bom_items: bomItems.filter(b => b.item_name && b.item_name.trim()),
      status: 'IN_PRODUCTION'
    }

    startTransition(async () => {
      const res = await createChallan(payload)
      if (res?.error) {
        showErrorDialog('Unable to Create Challan', res.error)
      } else {
        setShowNewChallanModal(false)
        // Refresh local optimistic state
        const newGroup: ChallanGroupedOrder = {
          id: res.challan_id || 'temp-' + Date.now(),
          challan_no: payload.challan_no,
          challan_date: payload.challan_date,
          brand: payload.brand,
          delivery_date: payload.delivery_date || '',
          fabric_type: payload.fabric_type || 'PRINTED SINKER',
          sample_given: !!payload.sample_given,
          notes: payload.notes || '',
          total_sets: formGrandSets,
          total_pcs: formGrandPcs,
          status: 'IN_PRODUCTION',
          bom_details: payload.bom_items || [],
          articles: payload.article_lines.map((line, idx) => ({
            ...line,
            allotment_id: 'temp-art-' + idx,
            status: 'IN_PROGRESS',
            assigned_lineman_name: linemenList.find(l => l.id === line.assigned_lineman_id)?.username || 'Unassigned'
          })),
          created_at: new Date().toISOString()
        }

        setOrders(prev => [newGroup, ...prev])
        setExpandedChallans(prev => ({ ...prev, [newGroup.id]: true }))
      }
    })
  }

  // Update Status
  const handleUpdateStatus = (id: string, newStatus: string, isChallan: boolean) => {
    startTransition(async () => {
      await updateOrderStatus(id, newStatus, isChallan)
      setOrders(prev =>
        prev.map(ch => {
          if (isChallan && ch.id === id) {
            return {
              ...ch,
              status: newStatus,
              articles: ch.articles.map(a => ({ ...a, status: newStatus }))
            }
          } else if (!isChallan) {
            return {
              ...ch,
              articles: ch.articles.map(a => a.allotment_id === id ? { ...a, status: newStatus } : a)
            }
          }
          return ch
        })
      )
    })
  }

  // Helper: Compute Color & Size Matrix for any Challan (Sir's Exact Formula)
  const computeColorBreakdown = (challan: ChallanGroupedOrder) => {
    const colorMap: Record<string, {
      colorName: string
      themeColor: string
      bgLight: string
      borderTheme: string
      totalPcs: number
      sizeBreakdown: Record<string, number>
      assignedLinemanId?: string
      assignedLinemanName?: string
    }> = {}

    const normalizeColor = (raw: string): string => {
      const c = raw.trim().toUpperCase().replace(/\s+/g, ' ')
      if (c.includes('MUSHROOM')) return 'MUSHROOM'
      if (c.includes('DUTCH')) return 'DUTCH BLUE'
      if (c.includes('SCUBA') || c.includes('SEUBA')) return 'SCUBA'
      return c
    }

    const getTheme = (cName: string) => {
      const c = cName.toUpperCase()
      if (c.includes('MUSHROOM')) return { themeColor: '#854D0E', bgLight: '#FEFCE8', borderTheme: '#FEF08A' }
      if (c.includes('DUTCH') || c.includes('BLUE')) return { themeColor: '#1D4ED8', bgLight: '#EFF6FF', borderTheme: '#BFDBFE' }
      if (c.includes('SCUBA') || c.includes('GREEN') || c.includes('SEUBA')) return { themeColor: '#047857', bgLight: '#ECFDF5', borderTheme: '#A7F3D0' }
      if (c.includes('RED') || c.includes('PINK') || c.includes('CHERRY')) return { themeColor: '#BE123C', bgLight: '#FFF1F2', borderTheme: '#FECDD3' }
      if (c.includes('BLACK') || c.includes('CHARCOAL')) return { themeColor: '#334155', bgLight: '#F8FAFC', borderTheme: '#E2E8F0' }
      return { themeColor: '#4F46E5', bgLight: '#EEF2FF', borderTheme: '#C7D2FE' }
    }

    // Determine primary color groups from Challan
    const canonicalColors = new Set<string>(['MUSHROOM', 'DUTCH BLUE', 'SCUBA'])
    if (challan.bom_details && Array.isArray(challan.bom_details)) {
      challan.bom_details.forEach(b => {
        const n = normalizeColor(b.item_name || '')
        if (n && !n.includes('BODY') && !n.includes('RIB') && !n.includes('LABEL') && !n.includes('POLYBAG') && !n.includes('THREAD') && !n.includes('SINKER') && !n.includes('FABRIC')) {
          canonicalColors.add(n)
        }
      })
    }

    canonicalColors.forEach(cName => {
      const th = getTheme(cName)
      colorMap[cName] = {
        colorName: cName,
        themeColor: th.themeColor,
        bgLight: th.bgLight,
        borderTheme: th.borderTheme,
        totalPcs: 0,
        sizeBreakdown: {}
      }
    })

    challan.articles.forEach(art => {
      const patternRaw = (art.color_pattern || art.description || '').toUpperCase()
      const sizeTier = art.size_range || 'Free Size'
      const totalPcs = Number(art.total_pcs) || 0

      // Match canonical colors precisely (No double-counting of DUTCHBLUE vs DUTCH BLUE or SEUBA vs SCUBA)
      const matchedSet = new Set<string>()
      if (patternRaw.includes('3 COLOUR') || patternRaw.includes('3 COLOR') || patternRaw.includes('ALL')) {
        matchedSet.add('MUSHROOM')
        matchedSet.add('DUTCH BLUE')
        matchedSet.add('SCUBA')
      } else {
        if (patternRaw.includes('MUSHROOM')) matchedSet.add('MUSHROOM')
        if (patternRaw.includes('DUTCH')) matchedSet.add('DUTCH BLUE')
        if (patternRaw.includes('SCUBA') || patternRaw.includes('SEUBA')) matchedSet.add('SCUBA')

        canonicalColors.forEach(cName => {
          if (patternRaw.includes(cName)) matchedSet.add(cName)
        })
      }

      const matchedColors = Array.from(matchedSet)
      if (matchedColors.length > 0) {
        const pcsPerColor = Math.round(totalPcs / matchedColors.length)
        matchedColors.forEach(cName => {
          if (!colorMap[cName]) {
            const th = getTheme(cName)
            colorMap[cName] = {
              colorName: cName,
              themeColor: th.themeColor,
              bgLight: th.bgLight,
              borderTheme: th.borderTheme,
              totalPcs: 0,
              sizeBreakdown: {}
            }
          }
          colorMap[cName].totalPcs += pcsPerColor
          colorMap[cName].sizeBreakdown[sizeTier] = (colorMap[cName].sizeBreakdown[sizeTier] || 0) + pcsPerColor
          if (art.assigned_lineman_id) {
            colorMap[cName].assignedLinemanId = art.assigned_lineman_id
            colorMap[cName].assignedLinemanName = art.assigned_lineman_name
          }
        })
      }
    })

    return Object.values(colorMap).filter(c => c.totalPcs > 0)
  }

  // Handle Allot Entire Challan to 1 Lineman (Routes directly to Target Allotment screen with pre-filled batch)
  const handleAllotEntireChallan = (challanId: string) => {
    const lmId = selectedFullLineman[challanId] || ''
    if (!lmId) {
      showErrorDialog(
        'Select a Lineman First',
        'Please select a production lineman from the dropdown before allotting this entire delivery challan.'
      )
      return
    }
    const targetUrl = `/allotments?target_key=FULL_CHALLAN_${challanId}&lineman_id=${lmId}`
    router.push(targetUrl)
  }

  // Handle Allot by Color Group (Routes directly to Target Allotment screen with pre-filled color line)
  const handleAllotColorLine = (challanId: string, colorName: string) => {
    const lmId = selectedColorLineman[challanId]?.[colorName] || ''
    if (!lmId) {
      showErrorDialog(
        'Select a Lineman First',
        `Please select a production lineman for the ${colorName} color line before allotting.`
      )
      return
    }
    const targetUrl = `/allotments?target_key=COLOR_${encodeURIComponent(colorName)}_${challanId}&lineman_id=${lmId}`
    router.push(targetUrl)
  }

  // Delete Action (Uses subtle custom confirmation dialogue instead of browser confirm)
  const handleDelete = (id: string, isChallan: boolean) => {
    setDialogState({
      isOpen: true,
      title: isChallan ? 'Delete Delivery Challan' : 'Delete Article Line',
      description: isChallan
        ? 'Are you sure you want to permanently delete this entire Delivery Challan and all its associated articles from the production ledger?'
        : 'Are you sure you want to remove this article line from the production floor?',
      variant: 'confirm',
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      onConfirm: () => {
        setDialogState(prev => ({ ...prev, isOpen: false }))
        startTransition(async () => {
          await deleteProductionOrder(id, isChallan)
          if (isChallan) {
            setOrders(prev => prev.filter(ch => ch.id !== id))
          } else {
            setOrders(prev =>
              prev.map(ch => ({
                ...ch,
                articles: ch.articles.filter(a => a.allotment_id !== id)
              }))
            )
          }
        })
      }
    })
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Challan No',
      'Challan Date',
      'Brand',
      'Delivery Date',
      'Fabric',
      'Art No',
      'Sub Art',
      'Pattern',
      'Color Assortment',
      'Size Tier',
      'Sets',
      'Ratio',
      'Total Pcs',
      'Lineman',
      'Status'
    ]

    const rows: string[][] = []
    filteredOrders.forEach(ch => {
      ch.articles?.forEach(a => {
        rows.push([
          ch.challan_no,
          ch.challan_date,
          ch.brand,
          ch.delivery_date || '-',
          ch.fabric_type,
          a.art_no,
          a.sub_art_no || '-',
          a.pattern_no || '-',
          `"${a.color_pattern || ''}"`,
          a.size_range,
          String(a.sets),
          String(a.pcs_per_set),
          String(a.total_pcs),
          a.assigned_lineman_name || 'Unassigned',
          a.status || ch.status
        ])
      })
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Zigza_Delivery_Challans_${todayStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">

      {/* ========================================================= */}
      {/* 1. TOP HEADER & ACTION BUTTONS (Standard Admin Card)      */}
      {/* ========================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Production & Job Work Challans
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                MES Multi-Article
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Real-world job work challans with multi-article size grids, BOM fabrics & lineman allotments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-black/15 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-black/15 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Chart</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewChallan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Delivery Challan</span>
          </button>

          <TvViewButton />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KPI SUMMARY STRIP (Standard Rounded-2xl Cards)         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Total Challans */}
        <div className="bg-white p-4.5 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Challans
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-2">{summary.totalChallans}</p>
          <span className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">Buyer Job Sheets</span>
        </div>

        {/* Article Styles (Master Articles Explorer - Interactive Action Card) */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => {
            if (masterArticlesUniverse.length > 0) {
              setSelectedArticleForHistory(masterArticlesUniverse[0].art_no)
            }
            setShowArticleHistoryModal(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (masterArticlesUniverse.length > 0) {
                setSelectedArticleForHistory(masterArticlesUniverse[0].art_no)
              }
              setShowArticleHistoryModal(true)
            }
          }}
          className="p-4.5 sm:p-5 rounded-2xl border border-[#3A3564]/30 bg-gradient-to-b from-white to-[#FAF7F0]/60 hover:to-[#FAF7F0] hover:border-[#3A3564] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group select-none relative overflow-hidden flex flex-col justify-between ring-1 ring-transparent hover:ring-[#3A3564]/15"
          title="Click to open Article Style Master Ledger & Production History"
        >
          {/* Subtle Top Accent Ribbon Indicator */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#3A3564]/40 to-transparent group-hover:via-[#3A3564] transition-all" />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 group-hover:text-[#3A3564] transition-colors">
                Article Styles
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#3A3564] bg-[#FAF7F0] group-hover:bg-[#3A3564] group-hover:text-white border border-[#3A3564]/20 px-2 py-0.5 rounded-md transition-all shadow-2xs">
                Explorer <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] group-hover:bg-[#3A3564] group-hover:text-white border border-[#3A3564]/20 flex items-center justify-center shrink-0 shadow-2xs transition-all">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-2">
            {summary.totalArticles}
          </p>
          <div className="flex items-center justify-between text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
            <span className="truncate">Master Articles ({summary.totalArticleLines} Variants)</span>
            <span className="text-[11px] font-mono font-bold text-[#3A3564] group-hover:translate-x-0.5 transition-all shrink-0 ml-1">
              View Ledger →
            </span>
          </div>
        </div>

        {/* Total Sets */}
        <div className="bg-white p-4.5 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Total Sets
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-2">{summary.totalSets.toLocaleString()}</p>
          <span className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">Bundle Units</span>
        </div>

        {/* Total Pieces */}
        <div className="bg-white p-4.5 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Total Pieces
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-2">{summary.totalPcs.toLocaleString()}</p>
          <span className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">Garment Pieces</span>
        </div>

        {/* In Production */}
        <div className="bg-white p-4.5 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              In Production
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-2">{summary.inProdPcs.toLocaleString()}</p>
          <span className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">Active Sewing (pcs)</span>
        </div>

        {/* Ready / Dispatched */}
        <div className="bg-white p-4.5 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Ready / Out
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-2">{(summary.readyQcPcs + summary.dispatchedPcs).toLocaleString()}</p>
          <span className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">QC Passed / Gate Out</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FILTERS BAR (Standard Rounded-2xl Card)                 */}
      {/* ========================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Challan #, Art No, Brand, Lineman..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-black/10 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Brand Filter */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-500 font-semibold">Brand:</span>
            <CustomSelect
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={brandFilterOptions}
              align="right"
              buttonClassName="min-w-[130px]"
            />
          </div>

          {/* Status Filter (Zero Emojis, Clean International Typography & Colored Dots) */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-500 font-semibold">Status:</span>
            <CustomSelect
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusFilterOptions}
              align="right"
              buttonClassName="min-w-[190px]"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MASTER HIERARCHICAL CHALLANS LIST                      */}
      {/* ========================================================= */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 bg-white border border-black/10 rounded-2xl text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 mx-auto flex items-center justify-center mb-4 shadow-2xs">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">No Job Work Challans Recorded Yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
            Click "+ New Delivery Challan" to create or import your first multi-article cutting and stitching job sheet.
          </p>
          <button
            type="button"
            onClick={handleOpenNewChallan}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Delivery Challan</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(challan => {
            const isExpanded = !!expandedChallans[challan.id]
            const articleCount = challan.articles?.length || 0

            return (
              <div
                key={challan.id}
                className="bg-white border border-black/10 rounded-2xl shadow-2xs overflow-hidden transition-all"
              >
                {/* Challan Card Header */}
                <div
                  onClick={() => toggleChallan(challan.id)}
                  className="p-4 sm:p-5 bg-white hover:bg-slate-50/80 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 select-none transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-xl bg-[#FAF7F0] border border-black/10 shadow-2xs hover:bg-[#F2ECE0] text-[#3A3564] flex items-center justify-center shrink-0 transition-transform"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#3A3564]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm px-3 py-1 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-tight flex items-center gap-1.5 shadow-2xs font-mono">
                          <FileText className="w-3.5 h-3.5 text-[#3A3564]" />
                          <span>{challan.challan_no}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {challan.brand}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {challan.fabric_type}
                        </span>
                        {challan.sample_given && (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center gap-1.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sample Attached</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs sm:text-[13px] text-slate-600 mt-2 flex-wrap">
                        <span>Challan Date: <strong className="text-slate-900 font-mono font-bold">{challan.challan_date}</strong></span>
                        {challan.delivery_date && (
                          <span>• Delivery: <strong className="text-slate-900 font-mono font-bold">{challan.delivery_date}</strong></span>
                        )}
                        {(() => {
                          const masterStyles = new Set((challan.articles || []).map(a => (a.art_no || '').replace(/[^0-9].*$/, '').trim() || a.art_no)).size
                          const lineCount = challan.articles?.length || 0
                          return (
                            <span>• <strong className="text-slate-900 font-semibold">{masterStyles} Master Style{masterStyles > 1 ? 's' : ''} ({lineCount} Variant{lineCount > 1 ? 's' : ''})</strong></span>
                          )
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 flex-wrap self-end md:self-center" onClick={e => e.stopPropagation()}>
                    <div className="text-right px-4 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl shadow-2xs">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                        <span className="font-extrabold text-[#3A3564]">{challan.total_sets.toLocaleString()}</span> Sets <span className="text-slate-300">|</span> <span className="text-slate-900 font-extrabold">{challan.total_pcs.toLocaleString()} Pcs</span>
                      </div>
                      <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">Grand Batch Total</span>
                    </div>

                    {/* Dynamic Real-Time Live Status Badge (100% Automated) */}
                    <div>
                      {challan.status === 'QC_PASSED' ? (
                        <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs font-mono">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Ready (QC Passed)</span>
                        </span>
                      ) : challan.status === 'DISPATCHED' ? (
                        <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-slate-900 text-white border border-slate-800 flex items-center gap-1.5 shadow-2xs font-mono">
                          <Truck className="w-4 h-4 text-white" />
                          <span>Dispatched</span>
                        </span>
                      ) : challan.status === 'IN_PROGRESS' ? (
                        <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-[#FAF7F0] text-[#3A3564] border border-black/15 flex items-center gap-1.5 shadow-2xs font-mono animate-pulse">
                          <Zap className="w-4 h-4 text-[#3A3564]" />
                          <span>In Production</span>
                        </span>
                      ) : (
                        <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-2xs font-mono">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Pending Allotment</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(challan.id, true)}
                      title="Delete Challan"
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 border border-black/5 hover:border-red-200 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Article Lines Table & Smart Allotment Hub */}
                {isExpanded && (
                  <div className="bg-white">
                    {/* Success notification if allotted */}
                    {allotSuccessMsg[challan.id] && (
                      <div className="p-3.5 bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                          <span>{allotSuccessMsg[challan.id]}</span>
                        </div>
                        <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded font-mono font-bold">LIVE SYNCED</span>
                      </div>
                    )}

                    {/* BOM & Lots Summary Bar if present */}
                    {challan.bom_details && challan.bom_details.length > 0 && (
                      <div className="px-5 py-3.5 bg-slate-50/60 border-b border-black/5 flex items-center gap-2.5 flex-wrap text-xs sm:text-[13px]">
                        <div className="w-6 h-6 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                          BOM LOTS:
                        </span>
                        {challan.bom_details.map((bom, bIdx) => (
                          <div
                            key={bIdx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-black/10 rounded-lg text-xs sm:text-[13px] text-slate-800 shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3A3564]" />
                            <strong className="text-slate-900 font-semibold">{bom.item_name}</strong>
                            {bom.lot_no && (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-[#FAF7F0] text-[#3A3564] font-bold font-mono border border-black/10">
                                Lot #{bom.lot_no}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* SMART LINE ALLOTMENT HUB (Continuous Sewing Rules)       */}
                    {/* ========================================================= */}
                    <div className="p-5 sm:p-6 border-b border-black/10 bg-slate-50/50">
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                                Smart Line Allotment Hub
                              </h4>
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                                Continuous Sewing Optimizer
                              </span>
                            </div>
                            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
                              Dispatch full batch to 1 Lineman or split by continuous color lines for maximum line output
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 1. Full Challan 1-Click Allotment Card */}
                      <div className="p-4 sm:p-4.5 bg-white border border-black/10 rounded-2xl shadow-2xs mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                              <span>Assign Entire Challan ({challan.total_pcs.toLocaleString()} Pcs) to 1 Lineman</span>
                              <span className="text-xs font-normal text-slate-500">({challan.articles?.length || 0} Articles Total)</span>
                            </div>
                            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
                              1-Click creates or updates all article allotments in this challan to a single production line
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 flex-wrap">
                          <CustomSelect
                            value={selectedFullLineman[challan.id] || ''}
                            onChange={val => setSelectedFullLineman(prev => ({ ...prev, [challan.id]: val }))}
                            options={linemanOptions}
                            placeholder="Select Lineman..."
                            buttonClassName="min-w-[190px] py-2"
                          />

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleAllotEntireChallan(challan.id)}
                            className="px-4 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 shrink-0"
                          >
                            <Zap className="w-4 h-4" />
                            <span>Allot Full Challan</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. Color-Wise Line Distribution Matrix */}
                      {(() => {
                        const colorCards = computeColorBreakdown(challan)
                        if (colorCards.length === 0) return null

                        return (
                          <div>
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                                  <Palette className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                                  Color-Wise Line Distribution (Continuous Sewing Matrix)
                                </span>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-500">
                                {colorCards.length} Active Color Lines
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {colorCards.map((cg, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all"
                                >
                                  <div>
                                    {/* Color Header Banner */}
                                    <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-black/5">
                                      <div className="flex items-center gap-2.5">
                                        <span
                                          className="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0 ring-2 ring-white border border-black/15"
                                          style={{ backgroundColor: cg.themeColor }}
                                        />
                                        <div>
                                          <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight block">
                                            {cg.colorName} LINE
                                          </span>
                                          <span className="text-[11px] font-medium text-slate-500">
                                            Continuous Floor Thread
                                          </span>
                                        </div>
                                      </div>

                                      <div className="px-3 py-1 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] font-mono shadow-2xs">
                                        <span className="text-xs sm:text-sm font-extrabold block">
                                          {cg.totalPcs.toLocaleString()} PCS
                                        </span>
                                      </div>
                                    </div>

                                    {/* Size Groups Grid */}
                                    <div className="mb-4">
                                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                                        <span>Size Tier Breakdown</span>
                                        <span className="font-mono">Ratio / Pcs</span>
                                      </div>

                                      <div className="space-y-1.5">
                                        {Object.entries(cg.sizeBreakdown).map(([sz, count]) => (
                                          <div
                                            key={sz}
                                            className="flex items-center justify-between text-xs sm:text-[13px] px-3 py-1.5 rounded-xl bg-slate-50 border border-black/5"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                              <span className="font-semibold text-slate-700">Tier {sz}</span>
                                            </div>
                                            <span className="font-extrabold text-slate-900 font-mono">
                                              {count.toLocaleString()} pcs
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Allotment Footer */}
                                  <div className="space-y-2.5 pt-3 border-t border-black/5">
                                    <CustomSelect
                                      value={selectedColorLineman[challan.id]?.[cg.colorName] || cg.assignedLinemanId || ''}
                                      onChange={val => {
                                        setSelectedColorLineman(prev => ({
                                          ...prev,
                                          [challan.id]: {
                                            ...(prev[challan.id] || {}),
                                            [cg.colorName]: val
                                          }
                                        }))
                                      }}
                                      options={[
                                        { value: '', label: `Assign ${cg.colorName} to Lineman...` },
                                        ...linemenList.map(lm => ({ value: lm.id, label: lm.username }))
                                      ]}
                                      className="w-full"
                                      buttonClassName="w-full py-2"
                                    />

                                    <button
                                      type="button"
                                      disabled={isPending}
                                      onClick={() => handleAllotColorLine(challan.id, cg.colorName)}
                                      className="w-full py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                      <span>Allot {cg.colorName} ({cg.totalPcs.toLocaleString()} pcs)</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Article Lines Reference Grid (Professional ERP Table) */}
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </div>
                          <h5 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                            Challan Article Reference Sheet
                          </h5>
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                            {challan.articles?.length || 0} Lines
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                          Auto-synced with smart line distribution
                        </span>
                      </div>

                      <div className="overflow-x-auto border border-black/10 rounded-2xl bg-white shadow-2xs">
                        <table className="w-full text-left border-collapse text-xs sm:text-[13.5px]">
                          <thead>
                            <tr className="bg-[#FAF7F0]/60 border-b border-black/10 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                              <th className="py-3.5 px-4 w-12 text-center">#</th>
                              <th className="py-3.5 px-4 w-36">Art No.</th>
                              <th className="py-3.5 px-4 w-32">Pattern</th>
                              <th className="py-3.5 px-4 min-w-[170px]">Color / Combination</th>
                              <th className="py-3.5 px-4 w-28">Size Tier</th>
                              <th className="py-3.5 px-4 w-24 text-right">Sets</th>
                              <th className="py-3.5 px-4 w-24 text-right">Pcs/Set</th>
                              <th className="py-3.5 px-4 w-28 text-right">Total Pcs</th>
                              <th className="py-3.5 px-4 w-48">Assigned Line</th>
                              <th className="py-3.5 px-4 w-36">Line Status</th>
                              <th className="py-3.5 px-3 w-14 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5">
                            {challan.articles?.map((line, lIdx) => (
                              <tr key={line.allotment_id || lIdx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 text-center text-slate-500 font-mono font-bold">{lIdx + 1}</td>
                                
                                {/* Art No + Sub Art */}
                                <td className="py-3.5 px-4 font-bold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">{line.art_no}</span>
                                    {line.sub_art_no && (
                                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-mono shadow-2xs">
                                        {line.sub_art_no}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Pattern Master */}
                                <td className="py-3.5 px-4 text-slate-700 font-medium">
                                  {line.pattern_no || 'Standard'}
                                </td>

                                {/* Color Combination */}
                                <td className="py-3.5 px-4 font-semibold text-slate-800">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#3A3564] shrink-0" />
                                    <span>{line.color_pattern}</span>
                                  </div>
                                </td>

                                {/* Size Tier */}
                                <td className="py-3.5 px-4 font-bold text-slate-800">
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold">
                                    {line.size_range}
                                  </span>
                                </td>

                                {/* Sets */}
                                <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono text-sm">
                                  {line.sets}
                                </td>

                                {/* Ratio */}
                                <td className="py-3.5 px-4 text-right text-slate-600 font-mono text-xs">
                                  {line.pcs_per_set} pcs/set
                                </td>

                                {/* Total Pcs */}
                                <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-mono text-sm">
                                  {line.total_pcs.toLocaleString()} pcs
                                </td>

                                {/* Assigned Line (Clean Auto-Badge) */}
                                <td className="py-3.5 px-4">
                                  {line.assigned_lineman_name && line.assigned_lineman_name !== 'Unassigned' && line.assigned_lineman_name !== 'Unassigned (Floor Order)' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                                      <User className="w-3.5 h-3.5 text-[#3A3564]" />
                                      <span>{line.assigned_lineman_name}</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Pending Allotment</span>
                                    </span>
                                  )}
                                </td>

                                {/* Dynamic Line Live Status */}
                                <td className="py-3.5 px-4">
                                  {line.status === 'QC_PASSED' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-mono">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>QC Passed</span>
                                    </span>
                                  ) : line.status === 'DISPATCHED' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-slate-900 text-white border border-slate-800 shadow-2xs font-mono">
                                      <Truck className="w-3.5 h-3.5 text-white" />
                                      <span>Dispatched</span>
                                    </span>
                                  ) : line.status === 'IN_PROGRESS' || (line.assigned_lineman_name && line.assigned_lineman_name !== 'Unassigned' && line.assigned_lineman_name !== 'Unassigned (Floor Order)') ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs font-mono">
                                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>In Progress</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Pending</span>
                                    </span>
                                  )}
                                </td>

                                {/* Action */}
                                <td className="py-3.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(line.allotment_id, false)}
                                    title="Delete Article Line"
                                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CREATE NEW DELIVERY CHALLAN MODAL (CLEAN & PROFESSIONAL)*/}
      {/* ========================================================= */}
      {showNewChallanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden border border-black/10 my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0] flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    New Job Work Delivery Challan Entry
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter multi-article cutting lots, sizes, and BOM materials directly or import via Excel
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={downloadCleanChallanTemplate}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-black/10 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Download clean Excel template"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#3A3564] hover:bg-[#2A2649] text-white flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Import from Excel or CSV"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-white" />
                  <span>{isImporting ? 'Importing...' : 'Import Excel'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNewChallanModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Import Status Alert Banner */}
            {importStatus && (
              <div className={`mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-150 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-2">
                  {importStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-semibold">{importStatus.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setImportStatus(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Modal Body */}
            <form onSubmit={handleSaveChallan} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* SECTION A: CHALLAN HEADER */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border border-black/10 rounded-2xl space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3A3564]" />
                  <span>1. Challan Header</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      JOB / CHALLAN NO. *
                    </label>
                    {(() => {
                      const isDup = Boolean(
                        formChallanNo.trim() &&
                        orders.some(o => o.challan_no?.trim().toUpperCase() === formChallanNo.trim().toUpperCase())
                      )
                      return (
                        <>
                          <input
                            type="text"
                            required
                            placeholder="e.g. JOB-457"
                            value={formChallanNo}
                            onChange={e => setFormChallanNo(e.target.value)}
                            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                              isDup
                                ? 'border-rose-500 focus:ring-rose-500 text-rose-900 bg-rose-50/50'
                                : 'border-black/10 focus:ring-[#3A3564]'
                            }`}
                          />
                          {isDup && (
                            <p className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>Challan #{formChallanNo.trim().toUpperCase()} already exists! Enter a new unique Challan No.</span>
                            </p>
                          )}
                        </>
                      )
                    })()}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      CHALLAN DATE *
                    </label>
                    <input
                      type="date"
                      required
                      value={formChallanDate}
                      onChange={e => setFormChallanDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      BRAND / PARTY *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OLLYPOP"
                      value={formBrand}
                      onChange={e => setFormBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      FABRIC TYPE
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PRINTED SINKER"
                      value={formFabric}
                      onChange={e => setFormFabric(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      EXPECTED DELIVERY DATE
                    </label>
                    <input
                      type="date"
                      value={formDeliveryDate}
                      onChange={e => setFormDeliveryDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-6">
                    <input
                      type="checkbox"
                      id="sample_given_cb"
                      checked={formSampleGiven}
                      onChange={e => setFormSampleGiven(e.target.checked)}
                      className="w-4 h-4 text-[#3A3564] rounded border-slate-300 focus:ring-[#3A3564] cursor-pointer"
                    />
                    <label htmlFor="sample_given_cb" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer select-none">
                      Ready Sample Given (Approved by Buyer)
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      SPECIAL NOTES / REMARKS
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Body+Rib N.P, Ext=3=27, 2=18, 1=9..."
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-black/10 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: ARTICLE LINES GRID (EXPANDED WIDTHS, NO SQUISHING) */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#3A3564]" />
                      <span>2. Article Lines Matrix ({articleLines.length} Lines)</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-400">Quick Sizes:</span>
                      {COMMON_SIZES.map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            setArticleLines(prev => {
                              const copy = [...prev]
                              const lastIdx = copy.length - 1
                              if (copy[lastIdx] && !copy[lastIdx].size_range) {
                                copy[lastIdx] = { ...copy[lastIdx], size_range: sz }
                              } else {
                                copy.push({ ...createEmptyArticleLine(), size_range: sz })
                              }
                              return copy
                            })
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer border border-black/10 shadow-2xs"
                        >
                          + {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddArticleLine}
                    className="px-3.5 py-2 bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#3A3564] border border-black/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Article Line</span>
                  </button>
                </div>

                <div className="border border-black/10 rounded-2xl overflow-hidden shadow-2xs bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-[13px] min-w-[960px]">
                      <thead>
                        <tr className="bg-[#FAF7F0]/60 border-b border-black/10 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                          <th className="py-3 px-3 w-10 text-center">#</th>
                          <th className="py-3 px-3 min-w-[130px]">Art No *</th>
                          <th className="py-3 px-2 min-w-[70px]">Sub</th>
                          <th className="py-3 px-3 min-w-[100px]">Pattern</th>
                          <th className="py-3 px-3 min-w-[180px]">Color / Combination *</th>
                          <th className="py-3 px-3 min-w-[110px]">Size Tier *</th>
                          <th className="py-3 px-3 min-w-[80px] text-right">Sets *</th>
                          <th className="py-3 px-3 min-w-[75px] text-right">Pcs/Set</th>
                          <th className="py-3 px-3 min-w-[100px] text-right">Total Pcs</th>
                          <th className="py-3 px-3 min-w-[160px]">Assign Lineman</th>
                          <th className="py-3 px-2 w-16 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {articleLines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>

                            {/* Art No */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                required
                                placeholder="e.g. 9433"
                                value={line.art_no}
                                onChange={e => handleLineChange(idx, 'art_no', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-xl text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                              />
                            </td>

                            {/* Sub Art */}
                            <td className="py-2.5 px-2">
                              <input
                                type="text"
                                placeholder="A, /1"
                                value={line.sub_art_no || ''}
                                onChange={e => handleLineChange(idx, 'sub_art_no', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-bold text-[#3A3564] placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                              />
                            </td>

                            {/* Pattern Master */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                placeholder="e.g. G-342"
                                value={line.pattern_no || ''}
                                onChange={e => handleLineChange(idx, 'pattern_no', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-xl text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                              />
                            </td>

                            {/* Color Pattern */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                required
                                placeholder="e.g. 3 Colour, Dutch Blue"
                                value={line.color_pattern}
                                onChange={e => handleLineChange(idx, 'color_pattern', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                              />
                            </td>

                            {/* Size Range */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                placeholder="e.g. L/XXL"
                                value={line.size_range}
                                onChange={e => handleLineChange(idx, 'size_range', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-xl text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                              />
                            </td>

                            {/* Sets */}
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min={1}
                                required
                                placeholder="0"
                                value={line.sets || ''}
                                onChange={e => handleLineChange(idx, 'sets', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-xl text-xs sm:text-sm font-bold text-right text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3A3564] font-mono"
                              />
                            </td>

                            {/* Ratio / Pcs per Set */}
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min={1}
                                value={line.pcs_per_set}
                                onChange={e => handleLineChange(idx, 'pcs_per_set', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-black/10 rounded-xl text-xs text-right text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#3A3564] font-mono"
                              />
                            </td>

                            {/* Total Pcs (Calculated) */}
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min={1}
                                placeholder="0"
                                value={line.total_pcs || ''}
                                onChange={e => handleLineChange(idx, 'total_pcs', e.target.value)}
                                className="w-full px-3 py-1.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs sm:text-sm font-extrabold text-right text-slate-900 placeholder-slate-300 focus:outline-none font-mono"
                              />
                            </td>

                            {/* Lineman Assignment */}
                            <td className="py-2.5 px-3">
                              <select
                                value={line.assigned_lineman_id || ''}
                                onChange={e => handleLineChange(idx, 'assigned_lineman_id', e.target.value)}
                                className="w-full bg-slate-50 border border-black/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A3564] cursor-pointer"
                              >
                                <option value="">Assign later...</option>
                                {linemenList.map(lm => (
                                  <option key={lm.id} value={lm.id}>
                                    {lm.username}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateLine(idx)}
                                  title="Duplicate Row"
                                  className="p-1.5 text-slate-400 hover:text-[#3A3564] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveArticleLine(idx)}
                                  title="Delete Line"
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SECTION C: BOM / RAW MATERIALS & LOTS */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border border-black/10 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3A3564]" />
                    <span>3. BOM / Raw Materials & Lots (Optional)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBomItem}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-black/10 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Material Lot</span>
                  </button>
                </div>

                {bomItems.length === 0 ? (
                  <div className="p-5 bg-white border border-dashed border-black/15 rounded-xl text-center">
                    <p className="text-xs sm:text-[13px] text-slate-500">
                      No BOM material lots added yet. Click <strong>"+ Add Material Lot"</strong> to specify fabric roll lots (e.g. Mushroom T-03) or brand labels.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {bomItems.map((bom, bIdx) => (
                      <div key={bIdx} className="p-3.5 bg-white border border-black/10 rounded-xl flex items-center justify-between gap-2.5 shadow-2xs">
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={bom.item_name}
                            onChange={e => handleBomChange(bIdx, 'item_name', e.target.value)}
                            placeholder="Material Name (e.g. Body Fabric)"
                            className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-transparent border-none p-0 focus:outline-none placeholder-slate-300"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              value={bom.lot_no || ''}
                              onChange={e => handleBomChange(bIdx, 'lot_no', e.target.value)}
                              placeholder="Lot # (e.g. T-03)"
                              className="text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-black/10 w-24 focus:outline-none placeholder-slate-300 font-mono"
                            />
                            <select
                              value={bom.status || 'PENDING'}
                              onChange={e => handleBomChange(bIdx, 'status', e.target.value)}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg border bg-slate-50 border-black/10 cursor-pointer text-slate-800"
                            >
                              <option value="RECEIVED">Received</option>
                              <option value="PENDING">Pending</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBomItem(bIdx)}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MODAL FOOTER & GRAND TOTALS */}
              <div className="pt-4 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 font-medium">Total Lines:</span>{' '}
                    <strong className="text-slate-900 font-bold font-mono">{articleLines.filter(l => l.art_no).length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Total Sets:</span>{' '}
                    <strong className="text-[#3A3564] font-extrabold font-mono text-sm">{formGrandSets.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Total Pieces:</span>{' '}
                    <strong className="text-slate-900 font-extrabold font-mono text-base">{formGrandPcs.toLocaleString()} Pcs</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowNewChallanModal(false)}
                    className="w-1/2 sm:w-auto px-5 py-2.5 border border-black/10 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-1/2 sm:w-auto px-6 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isPending ? (
                      <span>Saving Challan...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save & Send Challan to Floor</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ARTICLE STYLE MASTER LEDGER & DEEP HISTORY MODAL (2+ YRS) */}
      {/* ========================================================= */}
      {showArticleHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden border border-black/10 my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0] flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Article Style Master Ledger & Production History
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs uppercase">
                      2+ Year Archives
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any article style to view lifetime Delivery Challans, Linemen who stitched it, QC passed & dispatch logs
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowArticleHistoryModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
              
              {/* 1. Article Search & Selector Bar */}
              <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Article #, Brand, Color, Fabric..."
                      value={articleHistorySearch}
                      onChange={e => setArticleHistorySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-black/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-500 self-end sm:self-center">
                    {masterArticlesUniverse.length} Total Master Styles in Catalog & Archives
                  </span>
                </div>

                {/* Article Chips List */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar flex-wrap">
                  {masterArticlesUniverse
                    .filter(a => {
                      if (!articleHistorySearch.trim()) return true
                      const q = articleHistorySearch.trim().toLowerCase()
                      return (
                        a.art_no.toLowerCase().includes(q) ||
                        a.description.toLowerCase().includes(q) ||
                        a.brand.toLowerCase().includes(q) ||
                        a.fabric.toLowerCase().includes(q)
                      )
                    })
                    .map(art => {
                      const isSelected = (selectedArticleHistory?.art_no || '') === art.art_no
                      return (
                        <button
                          key={art.art_no}
                          type="button"
                          onClick={() => setSelectedArticleForHistory(art.art_no)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs shrink-0 ${
                            isSelected
                              ? 'bg-[#3A3564] text-white shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-black/10'
                          }`}
                        >
                          <Tag className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                          <span>Art {art.art_no}</span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-black/5'}`}>
                            {art.totalLifetimePcs.toLocaleString()} pcs
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>

              {/* 2. Selected Article Overview Banner & Metrics */}
              {selectedArticleHistory && (
                <div className="space-y-4">
                  
                  {/* Article Master Header Card */}
                  <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                        <Tag className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                            ARTICLE #{selectedArticleHistory.art_no}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {selectedArticleHistory.brand}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {selectedArticleHistory.fabric}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                          {selectedArticleHistory.description || 'Master Garment Article Style'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right px-4 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Stitching Rate</span>
                        <span className="text-base font-extrabold text-[#3A3564] font-mono">₹{selectedArticleHistory.stitching_rate.toFixed(2)} <span className="text-xs font-medium text-slate-500">/ pc</span></span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Lifetime KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Total Lifetime Pieces</span>
                      <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-1">{selectedArticleHistory.totalLifetimePcs.toLocaleString()} <span className="text-xs font-medium text-slate-500">pcs</span></p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Delivery Challans</span>
                      <p className="text-xl sm:text-2xl font-extrabold text-[#3A3564] font-mono mt-1">{selectedArticleHistory.totalLifetimeChallans} <span className="text-xs font-medium text-slate-500">Batches</span></p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Floor Allotments</span>
                      <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-1">{selectedArticleHistory.totalLifetimeAllotments} <span className="text-xs font-medium text-slate-500">Floor Lines</span></p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Dispatched & Delivered</span>
                      <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono mt-1">{selectedArticleHistory.dispatchedPcs.toLocaleString()} <span className="text-xs font-medium text-slate-500">pcs</span></p>
                    </div>
                  </div>

                  {/* Complete Historical Production Ledger Table */}
                  <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-black/10 flex items-center justify-between bg-slate-50/80 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#3A3564]" />
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                          Complete Production & Delivery History for Art #{selectedArticleHistory.art_no}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {selectedArticleHistory.history.length} Historical Records
                      </span>
                    </div>

                    {selectedArticleHistory.history.length === 0 ? (
                      <div className="p-10 text-center text-slate-400 text-sm font-medium">
                        No delivery challans or floor allotments recorded yet for Article #{selectedArticleHistory.art_no}.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[750px]">
                          <thead>
                            <tr className="border-b border-black/10 bg-slate-50/50 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                              <th className="py-3 px-4">#</th>
                              <th className="py-3 px-4">Challan # & Date</th>
                              <th className="py-3 px-4">Buyer / Brand</th>
                              <th className="py-3 px-4">Color & Size Breakdown</th>
                              <th className="py-3 px-4 text-right">Sets & Ratio</th>
                              <th className="py-3 px-4 text-right">Total Pcs</th>
                              <th className="py-3 px-4">Floor Lineman</th>
                              <th className="py-3 px-4">Live Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5 text-xs sm:text-[13px]">
                            {selectedArticleHistory.history.map((rec, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 font-mono text-slate-400">{rIdx + 1}</td>
                                
                                <td className="py-3.5 px-4">
                                  <span className="font-extrabold text-slate-900 font-mono block">Challan #{rec.challanNo}</span>
                                  <span className="text-[11px] text-slate-500 font-mono">{rec.challanDate || new Date(rec.createdAt).toISOString().split('T')[0]}</span>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className="font-bold text-slate-800 block">{rec.brand}</span>
                                  <span className="text-[11px] text-slate-500">{rec.fabricType}</span>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className="font-semibold text-slate-900 block">{rec.colorPattern}</span>
                                  <span className="text-[11px] text-slate-500 font-mono">Tier {rec.sizeRange}</span>
                                </td>

                                <td className="py-3.5 px-4 text-right font-mono">
                                  <span className="font-bold text-slate-900 block">{rec.sets} sets</span>
                                  <span className="text-[11px] text-slate-500">({rec.pcsPerSet} pcs/set)</span>
                                </td>

                                <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-mono">
                                  {rec.totalPcs.toLocaleString()} pcs
                                </td>

                                <td className="py-3.5 px-4">
                                  {rec.linemanName && rec.linemanName !== 'Unassigned' && rec.linemanName !== 'Unassigned (Floor Order)' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                                      <User className="w-3.5 h-3.5 text-[#3A3564]" />
                                      <span>{rec.linemanName}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-medium text-xs">Unassigned</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4">
                                  {rec.status === 'QC_PASSED' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-mono">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>QC Passed</span>
                                    </span>
                                  ) : rec.status === 'DISPATCHED' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-slate-900 text-white border border-slate-800 shadow-2xs font-mono">
                                      <Truck className="w-3.5 h-3.5 text-white" />
                                      <span>Dispatched</span>
                                    </span>
                                  ) : rec.status === 'IN_PROGRESS' || (rec.linemanName && rec.linemanName !== 'Unassigned' && rec.linemanName !== 'Unassigned (Floor Order)') ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs font-mono">
                                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>In Progress</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Pending</span>
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-black/10 flex items-center justify-end bg-white">
              <button
                type="button"
                onClick={() => setShowArticleHistoryModal(false)}
                className="px-5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                Close Explorer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Subtle Error & Confirmation Dialogue */}
      <SubtleDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
        title={dialogState.title}
        description={dialogState.description}
        variant={dialogState.variant}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm}
      />

    </div>
  )
}

