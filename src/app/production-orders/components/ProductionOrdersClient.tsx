'use client'

import { useState, useMemo, useTransition } from 'react'
import {
  Calendar,
  Layers,
  Plus,
  Search,
  CheckCircle2,
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
  FileSpreadsheet
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
  Palette,
  Zap,
  UserCheck,
  Sparkles
} from 'lucide-react'

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
  pcs_per_set: 9,
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
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('ALL')

  // Modals
  const [showNewChallanModal, setShowNewChallanModal] = useState(false)

  // Smart Allotment States
  const [selectedFullLineman, setSelectedFullLineman] = useState<Record<string, string>>({})
  const [selectedColorLineman, setSelectedColorLineman] = useState<Record<string, Record<string, string>>>({})
  const [activeActionTab, setActiveActionTab] = useState<Record<string, 'COLOR_SPLIT' | 'FULL_CHALLAN' | 'TABLE'>>({})
  const [allotSuccessMsg, setAllotSuccessMsg] = useState<Record<string, string>>({})

  // ----------------------------------------------------------------------
  // NEW CHALLAN FORM STATE (Clean / Fresh / No Hardcoded Defaults)
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
    setShowNewChallanModal(true)
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
        pcs_per_set: last?.pcs_per_set || 9,
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
        const ratioVal = rawRatio === '' ? 9 : (parseInt(rawRatio, 10) || 1)
        
        current.sets = setsVal
        current.pcs_per_set = ratioVal
        current.total_pcs = setsVal === '' ? ('' as any) : (Number(setsVal) * Number(ratioVal))
      } else if (field === 'total_pcs') {
        const pcsVal = value === '' ? ('' as any) : (parseInt(value, 10) || 0)
        current.total_pcs = pcsVal
        if (pcsVal !== '') {
          current.sets = Math.round(Number(pcsVal) / (current.pcs_per_set || 9)) || 1
        } else {
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

  // Summary Metrics Across All Orders
  const summary = useMemo(() => {
    let totalChallans = orders.length
    let totalArticles = 0
    let totalSets = 0
    let totalPcs = 0
    let inProdPcs = 0
    let readyQcPcs = 0
    let dispatchedPcs = 0

    orders.forEach(ch => {
      totalArticles += ch.articles?.length || 0
      totalSets += ch.total_sets || 0
      totalPcs += ch.total_pcs || 0

      ch.articles?.forEach(art => {
        if (art.status === 'QC_PASSED') readyQcPcs += art.total_pcs || 0
        else if (art.status === 'DISPATCHED') dispatchedPcs += art.total_pcs || 0
        else inProdPcs += art.total_pcs || 0
      })
    })

    return {
      totalChallans,
      totalArticles,
      totalSets,
      totalPcs,
      inProdPcs,
      readyQcPcs,
      dispatchedPcs
    }
  }, [orders])

  // Filtered Orders
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
      const matchStatus = selectedStatus === 'ALL' || ch.status === selectedStatus
      const matchDate = selectedDate === 'ALL' || ch.challan_date === selectedDate

      return matchSearch && matchBrand && matchStatus && matchDate
    })
  }, [orders, searchQuery, selectedBrand, selectedStatus, selectedDate])

  // Save Challan Action
  const handleSaveChallan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formChallanNo.trim()) {
      alert('Please enter a Challan / Job Number (e.g. JOB-457).')
      return
    }

    const validLines = articleLines.filter(l => l.art_no && l.art_no.trim())
    if (validLines.length === 0) {
      alert('Please enter at least one article with an Article Number.')
      return
    }

    const payload: CreateChallanPayload = {
      challan_no: formChallanNo.trim().toUpperCase(),
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
        alert(res.error)
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

    const standardColors = ['MUSHROOM', 'DUTCH BLUE', 'SCUBA']
    const detectedFromBom = (challan.bom_details || [])
      .map(b => b.item_name.toUpperCase())
      .filter(name => !name.includes('BODY') && !name.includes('RIB') && !name.includes('LABEL') && !name.includes('POLYBAG') && !name.includes('THREAD'))
    
    const activeColorNames = new Set<string>()
    standardColors.forEach(c => activeColorNames.add(c))
    detectedFromBom.forEach(c => activeColorNames.add(c))

    const getTheme = (cName: string) => {
      const c = cName.toUpperCase()
      if (c.includes('MUSHROOM')) return { themeColor: '#854D0E', bgLight: '#FEFCE8', borderTheme: '#FEF08A' }
      if (c.includes('DUTCH') || c.includes('BLUE')) return { themeColor: '#1D4ED8', bgLight: '#EFF6FF', borderTheme: '#BFDBFE' }
      if (c.includes('SCUBA') || c.includes('GREEN') || c.includes('SEUBA')) return { themeColor: '#047857', bgLight: '#ECFDF5', borderTheme: '#A7F3D0' }
      if (c.includes('RED') || c.includes('PINK') || c.includes('CHERRY')) return { themeColor: '#BE123C', bgLight: '#FFF1F2', borderTheme: '#FECDD3' }
      if (c.includes('BLACK') || c.includes('CHARCOAL')) return { themeColor: '#334155', bgLight: '#F8FAFC', borderTheme: '#E2E8F0' }
      return { themeColor: '#4F46E5', bgLight: '#EEF2FF', borderTheme: '#C7D2FE' }
    }

    activeColorNames.forEach(cName => {
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
      const patternUpper = (art.color_pattern || art.description || '').toUpperCase()
      const sizeTier = art.size_range || 'Free Size'
      const totalPcs = Number(art.total_pcs) || 0

      const matchedColors: string[] = []
      if (patternUpper.includes('3 COLOUR') || patternUpper.includes('3 COLOR') || patternUpper.includes('ALL')) {
        matchedColors.push('MUSHROOM', 'DUTCH BLUE', 'SCUBA')
      } else {
        activeColorNames.forEach(cName => {
          if (patternUpper.includes(cName) || (cName.includes('SCUBA') && patternUpper.includes('SEUBA'))) {
            matchedColors.push(cName)
          }
        })
      }

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

  // Handle Allot Entire Challan to 1 Lineman
  const handleAllotEntireChallan = (challanId: string) => {
    const lmId = selectedFullLineman[challanId]
    if (!lmId) {
      alert('Please select a Lineman first.')
      return
    }

    startTransition(async () => {
      const res = await allotEntireChallan(challanId, lmId)
      if (res?.error) {
        alert(res.error)
        return
      }

      const lmName = linemenList.find(l => l.id === lmId)?.username || 'Lineman'
      setOrders(prev =>
        prev.map(ch =>
          ch.id === challanId
            ? {
                ...ch,
                articles: ch.articles.map(a => ({
                  ...a,
                  assigned_lineman_id: lmId,
                  assigned_lineman_name: lmName,
                  status: 'IN_PROGRESS'
                }))
              }
            : ch
        )
      )

      setAllotSuccessMsg(prev => ({
        ...prev,
        [challanId]: `All ${orders.find(o => o.id === challanId)?.total_pcs.toLocaleString()} pieces allotted to ${lmName}!`
      }))
      setTimeout(() => {
        setAllotSuccessMsg(prev => ({ ...prev, [challanId]: '' }))
      }, 4000)
    })
  }

  // Handle Allot by Color Group
  const handleAllotColorLine = (challanId: string, colorName: string) => {
    const lmId = selectedColorLineman[challanId]?.[colorName]
    if (!lmId) {
      alert(`Please select a Lineman for ${colorName} line.`)
      return
    }

    startTransition(async () => {
      const res = await allotChallanByColor(challanId, colorName, lmId)
      if (res?.error) {
        alert(res.error)
        return
      }

      const lmName = linemenList.find(l => l.id === lmId)?.username || 'Lineman'
      setOrders(prev =>
        prev.map(ch => {
          if (ch.id !== challanId) return ch
          return {
            ...ch,
            articles: ch.articles.map(a => {
              const pUpper = (a.color_pattern || a.description || '').toUpperCase()
              if (pUpper.includes(colorName.toUpperCase()) || pUpper.includes('3 COLOUR') || pUpper.includes('3 COLOR')) {
                return {
                  ...a,
                  assigned_lineman_id: lmId,
                  assigned_lineman_name: lmName,
                  status: 'IN_PROGRESS'
                }
              }
              return a
            })
          }
        })
      )

      setAllotSuccessMsg(prev => ({
        ...prev,
        [challanId]: `${colorName} line successfully allotted to ${lmName}!`
      }))
      setTimeout(() => {
        setAllotSuccessMsg(prev => ({ ...prev, [challanId]: '' }))
      }, 4000)
    })
  }

  // Delete Action
  const handleDelete = (id: string, isChallan: boolean) => {
    const msg = isChallan
      ? 'Are you sure you want to delete this entire Challan and all its articles?'
      : 'Delete this article line from the floor?'
    if (!confirm(msg)) return

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
    link.setAttribute('download', `Nubira_Delivery_Challans_${todayStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">

      {/* ========================================================= */}
      {/* 1. TOP HEADER & ACTION BUTTONS                            */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Delivery Challans & Production Chart
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              MULTI-ARTICLE MES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-world job work challans with multi-article size grids, BOM fabrics & lineman allotments
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border bg-white shadow-2xs hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all cursor-pointer border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border bg-white shadow-2xs hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all cursor-pointer border-slate-200"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Chart</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewChallan}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 flex items-center gap-2 transition-all cursor-pointer bg-slate-900"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Delivery Challan</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KPI SUMMARY STRIP                                      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-3.5 bg-white border border-slate-200 rounded-[12px] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Challans</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary.totalChallans}</p>
          <span className="text-[10px] font-semibold text-slate-400">Buyer Job Sheets</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-[12px] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Article Lines</span>
          <p className="text-xl font-bold text-blue-600 mt-1">{summary.totalArticles}</p>
          <span className="text-[10px] font-semibold text-blue-500">Variants on Floor</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-[12px] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sets</span>
          <p className="text-xl font-bold text-indigo-600 mt-1">{summary.totalSets.toLocaleString()}</p>
          <span className="text-[10px] font-semibold text-indigo-500">Bundle Units</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-[12px] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pieces</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{summary.totalPcs.toLocaleString()}</p>
          <span className="text-[10px] font-semibold text-emerald-500">Garment Pieces</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-[12px] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Production</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{summary.inProdPcs.toLocaleString()} pcs</p>
          <span className="text-[10px] font-semibold text-amber-500">Active Sewing</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-[12px] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ready / Dispatched</span>
          <p className="text-xl font-bold text-purple-600 mt-1">{(summary.readyQcPcs + summary.dispatchedPcs).toLocaleString()} pcs</p>
          <span className="text-[10px] font-semibold text-purple-500">QC Passed / Gate Out</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FILTERS BAR                                            */}
      {/* ========================================================= */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-[12px] shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Challan #, Art No, Brand, Lineman..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Brand Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Brand:</span>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Brands</option>
              {DEFAULT_BRANDS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="QC_PASSED">Ready (QC Passed)</option>
              <option value="DISPATCHED">Dispatched</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MASTER HIERARCHICAL CHALLANS LIST                      */}
      {/* ========================================================= */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-[12px] text-center shadow-2xs">
          <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Job Work Challans Recorded Yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Click "+ New Delivery Challan" to enter your first multi-article job sheet.</p>
          <button
            type="button"
            onClick={handleOpenNewChallan}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 cursor-pointer"
          >
            + Create New Delivery Challan
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
                className="bg-white border border-slate-200 rounded-[12px] shadow-2xs overflow-hidden transition-all"
              >
                {/* Challan Card Header */}
                <div
                  onClick={() => toggleChallan(challan.id)}
                  className="p-4 bg-slate-50/80 hover:bg-slate-100/70 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 select-none"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-transform"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                          📋 {challan.challan_no}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800">
                          {challan.brand}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {challan.fabric_type}
                        </span>
                        {challan.sample_given && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Sample Given
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span>Challan Date: <strong>{challan.challan_date}</strong></span>
                        {challan.delivery_date && (
                          <span>• Expected Delivery: <strong>{challan.delivery_date}</strong></span>
                        )}
                        <span>• <strong>{articleCount} Articles</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap self-end md:self-center" onClick={e => e.stopPropagation()}>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        {challan.total_sets.toLocaleString()} Sets <span className="text-slate-400 font-normal">|</span> <span className="text-emerald-600 font-extrabold">{challan.total_pcs.toLocaleString()} Pcs</span>
                      </div>
                      <span className="text-[10.5px] font-semibold text-slate-400">Grand Batch Total</span>
                    </div>

                    <select
                      value={challan.status}
                      onChange={e => handleUpdateStatus(challan.id, e.target.value, true)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none ${
                        challan.status === 'QC_PASSED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : challan.status === 'DISPATCHED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="QC_PASSED">Ready (QC Passed)</option>
                      <option value="DISPATCHED">Dispatched</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDelete(challan.id, true)}
                      title="Delete Challan"
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Article Lines Table & Smart Allotment Hub */}
                {isExpanded && (
                  <div>
                    {/* Success notification if allotted */}
                    {allotSuccessMsg[challan.id] && (
                      <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{allotSuccessMsg[challan.id]}</span>
                      </div>
                    )}

                    {/* BOM & Lots Summary Bar if present */}
                    {challan.bom_details && challan.bom_details.length > 0 && (
                      <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-slate-400" /> BOM / Lots:
                        </span>
                        {challan.bom_details.map((bom, bIdx) => (
                          <span
                            key={bIdx}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-700"
                          >
                            <strong>{bom.item_name}</strong> {bom.lot_no ? `(Lot #${bom.lot_no})` : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* SMART LINE ALLOTMENT HUB (Sir's Exact Factory Rules)      */}
                    {/* ========================================================= */}
                    <div className="p-4 bg-slate-50/90 border-b border-slate-200">
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                            Smart Line Allotment Hub
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Fast Line Distribution
                          </span>
                        </div>
                      </div>

                      {/* 1. Full Challan 1-Click Allotment Bar */}
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Assign Entire Challan ({challan.total_pcs.toLocaleString()} Pcs) to 1 Lineman
                            </div>
                            <div className="text-[11px] text-slate-500">
                              1-Click assigns all {challan.articles?.length || 8} articles in this batch to a single production line
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={selectedFullLineman[challan.id] || ''}
                            onChange={e => setSelectedFullLineman(prev => ({ ...prev, [challan.id]: e.target.value }))}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none"
                          >
                            <option value="">Select Lineman...</option>
                            {linemenList.map(lm => (
                              <option key={lm.id} value={lm.id}>
                                👤 {lm.username}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleAllotEntireChallan(challan.id)}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Allot Full Challan</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. Color-Wise Line Distribution Matrix (Sir's Exact Formula Cards) */}
                      {(() => {
                        const colorCards = computeColorBreakdown(challan)
                        if (colorCards.length === 0) return null

                        return (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700">
                              <Palette className="w-3.5 h-3.5 text-slate-500" />
                              <span>Color-Wise Line Split (Continuous Color Sewing for Speed)</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {colorCards.map((cg, cIdx) => (
                                <div
                                  key={cIdx}
                                  style={{ backgroundColor: cg.bgLight, borderColor: cg.borderTheme }}
                                  className="border rounded-xl p-3.5 flex flex-col justify-between shadow-2xs"
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cg.themeColor }} />
                                        <span className="font-extrabold text-xs text-slate-900 uppercase">
                                          {cg.colorName} LINE
                                        </span>
                                      </div>
                                      <span
                                        style={{ color: cg.themeColor }}
                                        className="text-xs font-black font-mono px-2 py-0.5 bg-white/80 rounded-md border border-slate-200"
                                      >
                                        {cg.totalPcs.toLocaleString()} Pcs
                                      </span>
                                    </div>

                                    {/* Size Groups Breakdown */}
                                    <div className="bg-white/90 rounded-lg p-2 border border-slate-200/80 mb-3 space-y-1">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Size Groups Breakdown:
                                      </div>
                                      {Object.entries(cg.sizeBreakdown).map(([sz, count], sIdx) => (
                                        <div key={sIdx} className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                                          <span>Tier {sz}:</span>
                                          <span className="font-bold text-slate-900">{count} pcs</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                                    <select
                                      value={selectedColorLineman[challan.id]?.[cg.colorName] || cg.assignedLinemanId || ''}
                                      onChange={e => {
                                        const val = e.target.value
                                        setSelectedColorLineman(prev => ({
                                          ...prev,
                                          [challan.id]: {
                                            ...(prev[challan.id] || {}),
                                            [cg.colorName]: val
                                          }
                                        }))
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none"
                                    >
                                      <option value="">Assign {cg.colorName} to Lineman...</option>
                                      {linemenList.map(lm => (
                                        <option key={lm.id} value={lm.id}>
                                          👤 {lm.username}
                                        </option>
                                      ))}
                                    </select>

                                    <button
                                      type="button"
                                      disabled={isPending}
                                      onClick={() => handleAllotColorLine(challan.id, cg.colorName)}
                                      style={{ backgroundColor: cg.themeColor }}
                                      className="w-full py-1.5 text-white rounded-lg text-xs font-bold shadow-2xs hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>Allot {cg.colorName} ({cg.totalPcs} pcs)</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Article Lines Reference Grid (No manual row dropdowns) */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100/60 border-b border-slate-200 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="py-2.5 px-3 w-10 text-center">#</th>
                            <th className="py-2.5 px-3 w-32">Art No.</th>
                            <th className="py-2.5 px-3 w-28">Pattern</th>
                            <th className="py-2.5 px-3 min-w-[140px]">Color / Combination</th>
                            <th className="py-2.5 px-3 w-24">Size Tier</th>
                            <th className="py-2.5 px-3 w-20 text-right">Sets</th>
                            <th className="py-2.5 px-3 w-20 text-right">Pcs/Set</th>
                            <th className="py-2.5 px-3 w-24 text-right">Total Pcs</th>
                            <th className="py-2.5 px-3 w-40">Assigned Line</th>
                            <th className="py-2.5 px-3 w-28">Line Status</th>
                            <th className="py-2.5 px-2 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {challan.articles?.map((line, lIdx) => (
                            <tr key={line.allotment_id || lIdx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 text-center text-slate-400 font-semibold">{lIdx + 1}</td>
                              
                              {/* Art No + Sub Art */}
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                <div className="flex items-center gap-1.5">
                                  <span>{line.art_no}</span>
                                  {line.sub_art_no && (
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      {line.sub_art_no}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Pattern Master */}
                              <td className="py-2.5 px-3 text-slate-600 font-medium">
                                {line.pattern_no || '-'}
                              </td>

                              {/* Color Combination */}
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                  <span>{line.color_pattern}</span>
                                </div>
                              </td>

                              {/* Size Tier */}
                              <td className="py-2.5 px-3 font-bold text-slate-700">
                                {line.size_range}
                              </td>

                              {/* Sets */}
                              <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                                {line.sets}
                              </td>

                              {/* Ratio */}
                              <td className="py-2.5 px-3 text-right text-slate-500">
                                {line.pcs_per_set} pcs/set
                              </td>

                              {/* Total Pcs */}
                              <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">
                                {line.total_pcs.toLocaleString()} pcs
                              </td>

                              {/* Assigned Line (Clean Auto-Badge) */}
                              <td className="py-2.5 px-3">
                                {line.assigned_lineman_name && line.assigned_lineman_name !== 'Unassigned' && line.assigned_lineman_name !== 'Unassigned (Floor Order)' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    👤 {line.assigned_lineman_name}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 text-slate-500">
                                    ⏳ Pending Allotment
                                  </span>
                                )}
                              </td>

                              {/* Line Status */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={line.status || 'IN_PROGRESS'}
                                  onChange={e => handleUpdateStatus(line.allotment_id, e.target.value, false)}
                                  className="text-[10.5px] font-bold px-2 py-1 rounded-md border cursor-pointer focus:outline-none bg-white border-slate-200"
                                >
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="QC_PASSED">QC Passed</option>
                                  <option value="DISPATCHED">Dispatched</option>
                                </select>
                              </td>

                              {/* Action */}
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(line.allotment_id, false)}
                                  title="Delete Article Line"
                                  className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors"
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📋 New Job Work Delivery Challan Entry</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter multi-article cutting lots, sizes, and BOM materials directly from client delivery challan
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewChallanModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveChallan} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* SECTION A: CHALLAN HEADER */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <span>1. Challan Header</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      JOB / CHALLAN NO. *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JOB-457"
                      value={formChallanNo}
                      onChange={e => setFormChallanNo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      CHALLAN DATE *
                    </label>
                    <input
                      type="date"
                      required
                      value={formChallanDate}
                      onChange={e => setFormChallanDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      BRAND / PARTY *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OLLYPOP"
                      value={formBrand}
                      onChange={e => setFormBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      FABRIC TYPE
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PRINTED SINKER"
                      value={formFabric}
                      onChange={e => setFormFabric(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      EXPECTED DELIVERY DATE
                    </label>
                    <input
                      type="date"
                      value={formDeliveryDate}
                      onChange={e => setFormDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-6">
                    <input
                      type="checkbox"
                      id="sample_given_cb"
                      checked={formSampleGiven}
                      onChange={e => setFormSampleGiven(e.target.checked)}
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                    />
                    <label htmlFor="sample_given_cb" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                      Ready Sample Given (Approved by Buyer)
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      SPECIAL NOTES / REMARKS
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Body+Rib N.P, Ext=3=27, 2=18, 1=9..."
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: ARTICLE LINES GRID (EXPANDED WIDTHS, NO SQUISHING) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. Article Lines Matrix ({articleLines.length} Lines)
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10.5px] font-semibold text-slate-400">Quick Sizes:</span>
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
                          className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                        >
                          + {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddArticleLine}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Article Line</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs min-w-[960px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          <th className="py-3 px-2 w-8 text-center">#</th>
                          <th className="py-3 px-2 min-w-[120px]">Art No *</th>
                          <th className="py-3 px-2 min-w-[65px]">Sub</th>
                          <th className="py-3 px-2 min-w-[90px]">Pattern</th>
                          <th className="py-3 px-2 min-w-[170px]">Color / Combination *</th>
                          <th className="py-3 px-2 min-w-[110px]">Size Tier *</th>
                          <th className="py-3 px-2 min-w-[75px] text-right">Sets *</th>
                          <th className="py-3 px-2 min-w-[70px] text-right">Pcs/Set</th>
                          <th className="py-3 px-2 min-w-[95px] text-right">Total Pcs</th>
                          <th className="py-3 px-2 min-w-[145px]">Assign Lineman</th>
                          <th className="py-3 px-2 w-16 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {articleLines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-2 text-center text-slate-400 font-bold">{idx + 1}</td>

                            {/* Art No */}
                            <td className="py-2.5 px-2">
                              <input
                                type="text"
                                required
                                placeholder="e.g. 9433"
                                value={line.art_no}
                                onChange={e => handleLineChange(idx, 'art_no', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-slate-800"
                              />
                            </td>

                            {/* Sub Art */}
                            <td className="py-2.5 px-2">
                              <input
                                type="text"
                                placeholder="A, /1"
                                value={line.sub_art_no || ''}
                                onChange={e => handleLineChange(idx, 'sub_art_no', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-amber-700 placeholder-slate-300 focus:outline-none"
                              />
                            </td>

                            {/* Pattern Master */}
                            <td className="py-2.5 px-2">
                              <input
                                type="text"
                                placeholder="e.g. G-342"
                                value={line.pattern_no || ''}
                                onChange={e => handleLineChange(idx, 'pattern_no', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-300 focus:outline-none"
                              />
                            </td>

                            {/* Color Pattern */}
                            <td className="py-2.5 px-2">
                              <input
                                type="text"
                                required
                                placeholder="e.g. 3 Colour, Dutch Blue"
                                value={line.color_pattern}
                                onChange={e => handleLineChange(idx, 'color_pattern', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-300 focus:outline-none"
                              />
                            </td>

                            {/* Size Range */}
                            <td className="py-2.5 px-2">
                              <input
                                type="text"
                                placeholder="e.g. L/XXL"
                                value={line.size_range}
                                onChange={e => handleLineChange(idx, 'size_range', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                              />
                            </td>

                            {/* Sets */}
                            <td className="py-2.5 px-2 text-right">
                              <input
                                type="number"
                                min={1}
                                required
                                placeholder="0"
                                value={line.sets || ''}
                                onChange={e => handleLineChange(idx, 'sets', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right text-slate-900 placeholder-slate-300 focus:outline-none"
                              />
                            </td>

                            {/* Ratio / Pcs per Set */}
                            <td className="py-2.5 px-2 text-right">
                              <input
                                type="number"
                                min={1}
                                value={line.pcs_per_set}
                                onChange={e => handleLineChange(idx, 'pcs_per_set', e.target.value)}
                                className="w-full px-1.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-right text-slate-600 focus:outline-none"
                              />
                            </td>

                            {/* Total Pcs (Calculated) */}
                            <td className="py-2.5 px-2 text-right">
                              <input
                                type="number"
                                min={1}
                                placeholder="0"
                                value={line.total_pcs || ''}
                                onChange={e => handleLineChange(idx, 'total_pcs', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-extrabold text-right text-emerald-800 placeholder-slate-300 focus:outline-none"
                              />
                            </td>

                            {/* Lineman Assignment */}
                            <td className="py-2.5 px-2">
                              <select
                                value={line.assigned_lineman_id || ''}
                                onChange={e => handleLineChange(idx, 'assigned_lineman_id', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
                              >
                                <option value="">Assign later...</option>
                                {linemenList.map(lm => (
                                  <option key={lm.id} value={lm.id}>
                                    👤 {lm.username}
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
                                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveArticleLine(idx)}
                                  title="Delete Line"
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
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
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>3. BOM / Raw Materials & Lots (Optional)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBomItem}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Material Lot</span>
                  </button>
                </div>

                {bomItems.length === 0 ? (
                  <div className="p-4 bg-white border border-dashed border-slate-200 rounded-lg text-center">
                    <p className="text-xs text-slate-400">
                      No BOM material lots added yet. Click <strong>"+ Add Material Lot"</strong> to specify fabric roll lots (e.g. Mushroom T-03) or brand labels.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {bomItems.map((bom, bIdx) => (
                      <div key={bIdx} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={bom.item_name}
                            onChange={e => handleBomChange(bIdx, 'item_name', e.target.value)}
                            placeholder="Material Name (e.g. Body Fabric)"
                            className="w-full text-xs font-bold text-slate-800 bg-transparent border-none p-0 focus:outline-none placeholder-slate-300"
                          />
                          <div className="flex items-center gap-2 mt-1.5">
                            <input
                              type="text"
                              value={bom.lot_no || ''}
                              onChange={e => handleBomChange(bIdx, 'lot_no', e.target.value)}
                              placeholder="Lot # (e.g. T-03)"
                              className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 w-24 focus:outline-none placeholder-slate-300"
                            />
                            <select
                              value={bom.status || 'PENDING'}
                              onChange={e => handleBomChange(bIdx, 'status', e.target.value)}
                              className="text-[10.5px] font-bold px-2 py-0.5 rounded border bg-slate-50 border-slate-200 cursor-pointer"
                            >
                              <option value="RECEIVED">Received</option>
                              <option value="PENDING">Pending</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBomItem(bIdx)}
                          className="p-1 text-slate-300 hover:text-red-500 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MODAL FOOTER & GRAND TOTALS */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-5 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Total Lines:</span>{' '}
                    <strong className="text-slate-900 font-bold">{articleLines.filter(l => l.art_no).length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Total Sets:</span>{' '}
                    <strong className="text-blue-700 font-bold">{formGrandSets.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Total Pieces:</span>{' '}
                    <strong className="text-emerald-700 font-extrabold text-sm">{formGrandPcs.toLocaleString()} Pcs</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowNewChallanModal(false)}
                    className="w-1/2 sm:w-auto px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-1/2 sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isPending ? (
                      <span>Saving Challan...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save & Send Challan to Floor 🚀</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
