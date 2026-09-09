'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { 
  Tag,
  Trash2,
  Plus, 
  Search, 
  X, 
  Download, 
  Archive, 
  RotateCcw, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  User,
  History,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Truck,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react'
import { TvViewButton } from '@/components/ui/TvViewButton'
import { 
  createArticle, 
  toggleArticleArchive, 
  bulkArchiveArticles, 
  bulkRestoreArticles,
  deleteArticle,
  bulkDeleteArticles
} from '../actions'

type Article = {
  id: string
  art_no: string
  description?: string | null
  stitching_rate?: number
  size_rates?: Record<string, any> | null
  is_active: boolean
  created_at: string
}

type AllotmentRecord = {
  id: string
  challan_id?: string | null
  article_id?: string | null
  lineman_id?: string | null
  target_qty?: number | null
  status?: string | null
  allotment_date?: string | null
  created_at?: string | null
  profiles?: {
    id: string
    username: string
    full_name?: string | null
    role?: string | null
  } | null
  articles?: {
    id: string
    art_no: string
  } | null
  challans?: {
    id: string
    challan_no: string
    brand?: string | null
    fabric_type?: string | null
  } | null
}

type ChallanRecord = {
  id: string
  challan_no: string
  brand?: string | null
  fabric_type?: string | null
  challan_date?: string | null
  notes?: string | null
  created_at?: string | null
}

type ProfileRecord = {
  id: string
  username: string
  full_name?: string | null
  role?: string | null
}

interface ArticlesClientProps {
  articles: Article[]
  allotments?: AllotmentRecord[]
  challans?: ChallanRecord[]
  profiles?: ProfileRecord[]
}

type FilterTab = 'ALL' | 'ACTIVE' | 'ARCHIVED'
type SortField = 'art_no' | 'created_at' | 'total_pcs'
type SortOrder = 'asc' | 'desc'

export function ArticlesClient({ 
  articles = [], 
  allotments = [], 
  challans = [], 
  profiles = [] 
}: ArticlesClientProps) {
  const [isPending, startTransition] = useTransition()
  
  // Toolbar State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTab, setFilterTab] = useState<FilterTab>('ACTIVE')
  const [selectedLineman, setSelectedLineman] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Sorting
  const [sortField, setSortField] = useState<SortField>('art_no')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [addArtNo, setAddArtNo] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Lineman Article Detail History Modal State
  const [historyModalState, setHistoryModalState] = useState<{
    isOpen: boolean
    artNo: string
    description: string
    linemanName: string
    totalPcs: number
    records: Array<{
      challanNo: string
      challanDate: string
      colorPattern: string
      sizeRange: string
      quantity: number
      status: string
      brand?: string
    }>
  } | null>(null)

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false)
        setShowDeleteModal(false)
        setShowBulkDeleteModal(false)
        setHistoryModalState(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // =========================================================================
  // 1. LINEMAN ALLOTMENT & ARTICLE AGGREGATION ENGINE
  // Combines both database `allotments` table & `challans.notes` planned lines
  // =========================================================================
  const { linemanStatsMap, articleStatsMap, activeLinemenList } = useMemo(() => {
    // Lookup profiles for usernames
    const profileLookup = new Map<string, string>()
    profiles.forEach(p => {
      if (p.id && p.username) {
        profileLookup.set(p.id, p.username.trim())
        profileLookup.set(p.username.trim().toLowerCase(), p.username.trim())
      }
    })

    // Map: linemanId/normalizedName -> { id, name, totalPcs, totalChallans: Set, articlesMap: Map<artNo, ArticleLinemanEntry> }
    const lmMap = new Map<string, {
      id: string
      name: string
      totalPcs: number
      challansSet: Set<string>
      articlesMap: Map<string, {
        artNo: string
        totalPcs: number
        allotmentCount: number
        records: Array<{
          challanNo: string
          challanDate: string
          colorPattern: string
          sizeRange: string
          quantity: number
          status: string
          brand?: string
        }>
      }>
    }>()

    // Map: artNo -> { totalPcs, totalChallans: Set, linemanNames: Set, records: [...] }
    const artMap = new Map<string, {
      artNo: string
      totalPcs: number
      challansSet: Set<string>
      linemanNames: Set<string>
      records: Array<{
        linemanName: string
        challanNo: string
        challanDate: string
        colorPattern: string
        sizeRange: string
        quantity: number
        status: string
        brand?: string
      }>
    }>()

    // Helper: Register record into aggregation
    const registerRecord = (params: {
      linemanKey: string
      linemanDisplayName: string
      artNo: string
      qty: number
      challanNo: string
      challanDate: string
      colorPattern: string
      sizeRange: string
      status: string
      brand?: string
    }) => {
      const { linemanKey, linemanDisplayName, artNo, qty, challanNo, challanDate, colorPattern, sizeRange, status, brand } = params
      if (!artNo || !linemanKey) return

      const cleanArt = artNo.trim().toUpperCase()
      const cleanLmKey = linemanKey.trim()

      // 1. Lineman Map
      if (!lmMap.has(cleanLmKey)) {
        lmMap.set(cleanLmKey, {
          id: cleanLmKey,
          name: linemanDisplayName,
          totalPcs: 0,
          challansSet: new Set(),
          articlesMap: new Map()
        })
      }

      const lm = lmMap.get(cleanLmKey)!
      lm.totalPcs += qty
      if (challanNo) lm.challansSet.add(challanNo)

      if (!lm.articlesMap.has(cleanArt)) {
        lm.articlesMap.set(cleanArt, {
          artNo: cleanArt,
          totalPcs: 0,
          allotmentCount: 0,
          records: []
        })
      }

      const artEntry = lm.articlesMap.get(cleanArt)!
      artEntry.totalPcs += qty
      artEntry.allotmentCount += 1
      artEntry.records.push({
        challanNo: challanNo || 'Direct Allotment',
        challanDate: challanDate || '',
        colorPattern: colorPattern || 'Standard',
        sizeRange: sizeRange || 'Free Size',
        quantity: qty,
        status: status || 'IN_PROGRESS',
        brand: brand || ''
      })

      // 2. Global Article Map
      if (!artMap.has(cleanArt)) {
        artMap.set(cleanArt, {
          artNo: cleanArt,
          totalPcs: 0,
          challansSet: new Set(),
          linemanNames: new Set(),
          records: []
        })
      }

      const gArt = artMap.get(cleanArt)!
      gArt.totalPcs += qty
      if (challanNo) gArt.challansSet.add(challanNo)
      if (linemanDisplayName) gArt.linemanNames.add(linemanDisplayName)
      gArt.records.push({
        linemanName: linemanDisplayName,
        challanNo: challanNo || 'Direct Allotment',
        challanDate: challanDate || '',
        colorPattern: colorPattern || 'Standard',
        sizeRange: sizeRange || 'Free Size',
        quantity: qty,
        status: status || 'IN_PROGRESS',
        brand: brand || ''
      })
    }

    // A. Ingest from database `allotments` table
    const recordedAllotmentIds = new Set<string>()
    allotments.forEach(al => {
      recordedAllotmentIds.add(al.id)
      const lmId = al.lineman_id || ''
      const lmName = al.profiles?.username || profileLookup.get(lmId) || 'Lineman'
      const artNo = al.articles?.art_no || ''
      const qty = Number(al.target_qty) || 0
      const chNo = al.challans?.challan_no || ''
      const chDate = al.allotment_date || (al.created_at ? al.created_at.split('T')[0] : '')

      if (lmId && artNo) {
        registerRecord({
          linemanKey: lmId,
          linemanDisplayName: lmName,
          artNo,
          qty,
          challanNo: chNo,
          challanDate: chDate,
          colorPattern: 'Allotted Batch',
          sizeRange: 'Multi-Size',
          status: al.status || 'IN_PROGRESS',
          brand: al.challans?.brand || undefined
        })
      }
    })

    // B. Ingest from `challans.notes` (for challans or lines with assigned lineman)
    challans.forEach(ch => {
      if (!ch.notes) return
      try {
        const parsed = JSON.parse(ch.notes)
        const lines = parsed.article_lines || parsed
        if (Array.isArray(lines)) {
          lines.forEach((line: any) => {
            const rawLm = (line.assigned_lineman_name || line.lineman_name || '').trim()
            const lmId = line.assigned_lineman_id || (rawLm ? profileLookup.get(rawLm.toLowerCase()) : '')
            
            // Skip unassigned floor lines
            if (!rawLm || rawLm.toLowerCase().includes('unassigned') || rawLm.toLowerCase().includes('floor order')) {
              return
            }

            const cleanLmName = rawLm || profileLookup.get(lmId) || 'Lineman'
            const key = lmId || cleanLmName.toUpperCase()
            const artNo = line.art_no || ''
            const qty = Number(line.total_pcs) || ((Number(line.sets) || 1) * (Number(line.pcs_per_set) || 9))

            // Only add if not duplicate allotment
            registerRecord({
              linemanKey: key,
              linemanDisplayName: cleanLmName,
              artNo,
              qty,
              challanNo: ch.challan_no,
              challanDate: ch.challan_date || (ch.created_at ? ch.created_at.split('T')[0] : ''),
              colorPattern: line.color_pattern || 'Standard',
              sizeRange: line.size_range || 'Free Size',
              status: line.stage_status || line.status || 'IN_PROGRESS',
              brand: ch.brand || undefined
            })
          })
        }
      } catch (_) {}
    })

    // Prepare sorted list of active linemen for dropdown options
    const activeList = Array.from(lmMap.values()).map(lm => ({
      id: lm.id,
      name: lm.name,
      totalPcs: lm.totalPcs,
      distinctArticleCount: lm.articlesMap.size,
      totalChallansCount: lm.challansSet.size
    })).sort((a, b) => b.totalPcs - a.totalPcs)

    return {
      linemanStatsMap: lmMap,
      articleStatsMap: artMap,
      activeLinemenList: activeList
    }
  }, [allotments, challans, profiles])

  // Selected Lineman Stats (if a specific lineman is selected)
  const selectedLinemanData = useMemo(() => {
    if (selectedLineman === 'ALL') return null
    return activeLinemenList.find(lm => lm.id === selectedLineman) || null
  }, [selectedLineman, activeLinemenList])

  // Filtered & Sorted Articles
  const filteredArticles = useMemo(() => {
    let list = articles.filter(item => {
      // 1. Filter Tab (Active / Archived)
      if (filterTab === 'ACTIVE' && !item.is_active) return false
      if (filterTab === 'ARCHIVED' && item.is_active) return false

      // 2. Lineman Filter
      if (selectedLineman !== 'ALL') {
        const lm = linemanStatsMap.get(selectedLineman)
        if (!lm) return false
        const upperArt = item.art_no.trim().toUpperCase()
        if (!lm.articlesMap.has(upperArt)) return false
      }

      // 3. Search Term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        return (
          item.art_no.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        )
      }

      return true
    })

    // Sort
    list.sort((a, b) => {
      const artA = a.art_no.trim().toUpperCase()
      const artB = b.art_no.trim().toUpperCase()

      if (sortField === 'total_pcs') {
        let pcsA = 0
        let pcsB = 0
        if (selectedLineman !== 'ALL') {
          const lm = linemanStatsMap.get(selectedLineman)
          pcsA = lm?.articlesMap.get(artA)?.totalPcs || 0
          pcsB = lm?.articlesMap.get(artB)?.totalPcs || 0
        } else {
          pcsA = articleStatsMap.get(artA)?.totalPcs || 0
          pcsB = articleStatsMap.get(artB)?.totalPcs || 0
        }
        return sortOrder === 'asc' ? pcsA - pcsB : pcsB - pcsA
      } else if (sortField === 'art_no') {
        return sortOrder === 'asc' 
          ? a.art_no.localeCompare(b.art_no)
          : b.art_no.localeCompare(a.art_no)
      } else {
        const dA = new Date(a.created_at).getTime()
        const dB = new Date(b.created_at).getTime()
        return sortOrder === 'asc' ? dA - dB : dB - dA
      }
    })

    return list
  }, [articles, filterTab, selectedLineman, linemanStatsMap, articleStatsMap, searchTerm, sortField, sortOrder])

  // Pagination Slice
  const totalItems = filteredArticles.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredArticles.slice(start, start + pageSize)
  }, [filteredArticles, currentPage, pageSize])

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder(field === 'total_pcs' ? 'desc' : 'asc')
    }
  }

  // Handle Select All Checkbox
  const allCurrentPageSelected = useMemo(() => {
    if (paginatedArticles.length === 0) return false
    return paginatedArticles.every(a => selectedIds.includes(a.id))
  }, [paginatedArticles, selectedIds])

  const toggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const pageIds = paginatedArticles.map(a => a.id)
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)))
    } else {
      const pageIds = paginatedArticles.map(a => a.id)
      const merged = Array.from(new Set([...selectedIds, ...pageIds]))
      setSelectedIds(merged)
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Open Lineman History Detail Modal
  const openArticleHistoryDetail = (article: Article) => {
    const cleanArt = article.art_no.trim().toUpperCase()

    if (selectedLineman !== 'ALL') {
      const lm = linemanStatsMap.get(selectedLineman)
      const entry = lm?.articlesMap.get(cleanArt)
      if (entry) {
        setHistoryModalState({
          isOpen: true,
          artNo: article.art_no,
          description: article.description || 'Garment Style',
          linemanName: lm?.name || 'Lineman',
          totalPcs: entry.totalPcs,
          records: entry.records
        })
        return
      }
    }

    // If All Linemen view, show global article records
    const gArt = articleStatsMap.get(cleanArt)
    setHistoryModalState({
      isOpen: true,
      artNo: article.art_no,
      description: article.description || 'Garment Style',
      linemanName: gArt && gArt.linemanNames.size > 0 ? Array.from(gArt.linemanNames).join(', ') : 'All Linemen',
      totalPcs: gArt?.totalPcs || 0,
      records: gArt?.records || []
    })
  }

  // Bulk Actions
  const handleBulkExportCSV = () => {
    const selectedArticles = articles.filter(a => selectedIds.includes(a.id))
    const headers = ['Article No', 'Description', 'Status', 'Total Production Pcs', 'Created At']
    const rows = selectedArticles.map(a => {
      const cleanArt = a.art_no.trim().toUpperCase()
      const totalPcs = articleStatsMap.get(cleanArt)?.totalPcs || 0
      return [
        a.art_no,
        '"' + (a.description || '').replace(/"/g, '""') + '"',
        a.is_active ? 'Active' : 'Archived',
        totalPcs,
        a.created_at
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'articles_export_' + new Date().toISOString().split('T')[0] + '.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return
    startTransition(async () => {
      await bulkArchiveArticles(selectedIds)
      setSelectedIds([])
    })
  }

  const handleBulkRestore = () => {
    if (selectedIds.length === 0) return
    startTransition(async () => {
      await bulkRestoreArticles(selectedIds)
      setSelectedIds([])
    })
  }

  const handleDeleteArticleConfirm = () => {
    if (!articleToDelete) return
    setDeleteError(null)
    startTransition(async () => {
      const res = await deleteArticle(articleToDelete.id)
      if (res?.error) {
        setDeleteError(res.error)
      } else {
        setShowDeleteModal(false)
        setSelectedIds(prev => prev.filter(id => id !== articleToDelete.id))
        setArticleToDelete(null)
      }
    })
  }

  const handleBulkDeleteConfirm = () => {
    if (selectedIds.length === 0) return
    setDeleteError(null)
    startTransition(async () => {
      const res = await bulkDeleteArticles(selectedIds)
      if (res?.error) {
        setDeleteError(res.error)
      } else {
        setShowBulkDeleteModal(false)
        setSelectedIds([])
      }
    })
  }

  // Add Article Submit
  const handleCreateArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError(null)

    if (!addArtNo.trim()) {
      setAddError('Please enter a valid Article Number (Art No).')
      return
    }

    const formData = new FormData()
    formData.append('art_no', addArtNo.trim().toUpperCase())
    formData.append('description', addDescription.trim())
    formData.append('stitching_rate', '0')

    startTransition(async () => {
      const res = await createArticle(formData)
      if (res?.error) {
        setAddError(res.error)
      } else {
        setShowAddModal(false)
        setAddArtNo('')
        setAddDescription('')
      }
    })
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* 1. Page Header Card */}
      <div 
        className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
      >
        {/* Left Side: Badge + Title + Subtitle */}
        <div className="flex items-center gap-3.5">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10"
          >
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
              >
                Articles
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs">
                {articles.length} Catalog Styles
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Master Garment Articles, Production Allotments & Lineman History
            </p>
          </div>
        </div>

        {/* Right Side: TV View & Add Article Button */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <TvViewButton />

          <button
            type="button"
            onClick={() => {
              setAddError(null)
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Article</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE LINEMAN HISTORY SUMMARY BANNER (Shows when Lineman Filter is active) */}
      {selectedLinemanData && (
        <div className="p-4 sm:p-5 bg-white border border-black/10 rounded-2xl shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
              <User className="w-6 h-6 text-[#3A3564]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  {selectedLinemanData.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Floor Lineman
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                  Lifetime Production History
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Found <strong>{selectedLinemanData.distinctArticleCount} distinct articles</strong> given to {selectedLinemanData.name} across <strong>{selectedLinemanData.totalChallansCount} production delivery challans</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap self-stretch md:self-auto justify-between md:justify-end">
            <div className="px-4 py-2 bg-slate-50 border border-black/5 rounded-xl text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Articles Allotted</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">{selectedLinemanData.distinctArticleCount}</span>
            </div>
            <div className="px-4 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-[#3A3564] uppercase tracking-wider block">Total Pieces</span>
              <span className="text-base font-extrabold text-[#3A3564] font-mono">{selectedLinemanData.totalPcs.toLocaleString()} pcs</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-black/5 rounded-xl text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Challans</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">{selectedLinemanData.totalChallansCount}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLineman('ALL')}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* 3. Table Toolbar & Bulk Action Bar */}
      <div 
        className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden"
      >
        
        {/* Bulk Action Bar (Visible when >= 1 row selected) */}
        {selectedIds.length > 0 && (
          <div 
            className="p-3 px-4 border-b flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150 bg-[#FAF7F0] border-black/10"
          >
            <div className="text-xs font-bold text-[#3A3564]">
              {selectedIds.length} {selectedIds.length === 1 ? 'article' : 'articles'} selected
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-black/15 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer text-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Selected</span>
              </button>

              {filterTab === 'ARCHIVED' ? (
                <button
                  type="button"
                  onClick={handleBulkRestore}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-white hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer text-emerald-700 border-emerald-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Selected</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBulkArchive}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-white hover:bg-amber-50 transition-colors shadow-2xs cursor-pointer text-amber-700 border-amber-300"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive Selected</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setDeleteError(null)
                  setShowBulkDeleteModal(true)
                }}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-white hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer text-rose-700 border-rose-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* Toolbar Header Row: Tabs + Lineman Filter + Search Box */}
        <div 
          className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50/50"
        >
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['ACTIVE', 'ARCHIVED', 'ALL'] as FilterTab[]).map((tab) => {
              const isSelected = filterTab === tab
              const labelMap: Record<FilterTab, string> = {
                ACTIVE: 'Active',
                ARCHIVED: 'Archived',
                ALL: 'All Articles'
              }
              const count = tab === 'ALL' 
                ? articles.length 
                : tab === 'ACTIVE' 
                  ? articles.filter(a => a.is_active).length 
                  : articles.filter(a => !a.is_active).length

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setFilterTab(tab)
                    setCurrentPage(1)
                    setSelectedIds([])
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-[#3A3564] text-white border-transparent shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {labelMap[tab]} ({count})
                </button>
              )
            })}
          </div>

          {/* Right Side: Lineman Filter Dropdown + Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            
            {/* Lineman Filter Dropdown */}
            <div className="relative min-w-[220px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-[#3A3564]" />
              </div>
              <select
                value={selectedLineman}
                onChange={e => {
                  setSelectedLineman(e.target.value)
                  setCurrentPage(1)
                  setSelectedIds([])
                }}
                className={`w-full pl-9 pr-8 py-2 border rounded-xl text-xs sm:text-sm font-bold outline-none transition-all cursor-pointer shadow-2xs appearance-none ${
                  selectedLineman !== 'ALL'
                    ? 'bg-[#FAF7F0] border-[#3A3564] text-[#3A3564] ring-2 ring-[#3A3564]/10'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
                title="Filter articles allotted to a specific production lineman"
              >
                <option value="ALL">All Linemen (All Styles)</option>
                {activeLinemenList.map(lm => (
                  <option key={lm.id} value={lm.id}>
                    {lm.name} ({lm.distinctArticleCount} Articles • {lm.totalPcs.toLocaleString()} Pcs)
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Art No or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* 4. Full-Width Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
                
                {/* Select All Checkbox */}
                <th className="w-10 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-[#3A3564] focus:ring-[#3A3564] cursor-pointer"
                  />
                </th>

                {/* Sortable Art No */}
                <th 
                  onClick={() => handleSort('art_no')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Art No</span>
                    {sortField === 'art_no' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </th>

                <th className="px-4 py-3.5 font-bold">Description</th>

                {/* Allotted Pieces to Selected Lineman / Total Lifetime Production */}
                <th 
                  onClick={() => handleSort('total_pcs')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
                >
                  <div className="flex items-center gap-1.5">
                    <span>
                      {selectedLineman !== 'ALL' ? 'Pieces to Lineman' : 'Total Allotted Pcs'}
                    </span>
                    {sortField === 'total_pcs' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </th>

                {/* Challans Count */}
                <th className="px-4 py-3.5 font-bold">
                  {selectedLineman !== 'ALL' ? 'Challans Allotted' : 'Challan Lots'}
                </th>

                <th className="px-4 py-3.5 font-bold text-center">Status</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Tag className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">
                        {selectedLineman !== 'ALL' 
                          ? `No articles found for ${selectedLinemanData?.name || 'this lineman'}.`
                          : searchTerm ? `No articles found matching "${searchTerm}".` : 'No articles in this view.'
                        }
                      </p>
                      {selectedLineman !== 'ALL' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedLineman('ALL')}
                          className="text-xs text-[#3A3564] font-bold hover:underline"
                        >
                          Clear Lineman Filter to view all articles
                        </button>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Click &quot;Add Article&quot; in the top bar to register a new article style.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((article) => {
                  const isChecked = selectedIds.includes(article.id)
                  const isArchived = !article.is_active
                  const cleanArt = article.art_no.trim().toUpperCase()

                  // Determine allotment stats for this article
                  let linePcs = 0
                  let challansCount = 0
                  let historyCount = 0

                  if (selectedLineman !== 'ALL') {
                    const lm = linemanStatsMap.get(selectedLineman)
                    const entry = lm?.articlesMap.get(cleanArt)
                    if (entry) {
                      linePcs = entry.totalPcs
                      challansCount = entry.allotmentCount
                      historyCount = entry.records.length
                    }
                  } else {
                    const gEntry = articleStatsMap.get(cleanArt)
                    if (gEntry) {
                      linePcs = gEntry.totalPcs
                      challansCount = gEntry.challansSet.size
                      historyCount = gEntry.records.length
                    }
                  }

                  return (
                    <tr 
                      key={article.id} 
                      className={`transition-colors ${
                        isArchived 
                          ? 'bg-slate-50/70 text-slate-400' 
                          : 'hover:bg-slate-50/60 text-slate-900'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(article.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#3A3564] focus:ring-[#3A3564] cursor-pointer"
                        />
                      </td>

                      {/* Art No */}
                      <td className="px-4 py-3.5 font-bold font-mono text-sm" style={{ color: isArchived ? '#94A3B8' : '#3A3564' }}>
                        {article.art_no}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5">
                        <span className={isArchived ? 'text-slate-400' : 'text-slate-600 font-medium'}>
                          {article.description || '-'}
                        </span>
                      </td>

                      {/* Pieces Allotted (Highlighting Quantity Given to Lineman) */}
                      <td className="px-4 py-3.5">
                        {linePcs > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold font-mono text-slate-900 text-sm">
                              {linePcs.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">pcs</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">0 pcs</span>
                        )}
                      </td>

                      {/* Challans Count */}
                      <td className="px-4 py-3.5">
                        {challansCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                            <FileSpreadsheet className="w-3 h-3 text-[#3A3564]" />
                            <span>{challansCount} {challansCount === 1 ? 'Challan' : 'Challans'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 text-center">
                        <span 
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            article.is_active 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {article.is_active ? 'Active' : 'Archived'}
                        </span>
                      </td>

                      {/* Actions: View Lineman History & Delete */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* View Allotment History Button */}
                          {historyCount > 0 && (
                            <button
                              type="button"
                              onClick={() => openArticleHistoryDetail(article)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 hover:bg-[#F2ECE0] transition-colors cursor-pointer shadow-2xs"
                              title={`View full history of article #${article.art_no}`}
                            >
                              <History className="w-3.5 h-3.5 text-[#3A3564]" />
                              <span>History ({historyCount})</span>
                            </button>
                          )}

                          {/* Restore Button (if archived) */}
                          {!article.is_active && (
                            <button
                              type="button"
                              onClick={() => {
                                startTransition(async () => {
                                  await toggleArticleArchive(article.id, false)
                                })
                              }}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs"
                            >
                              Restore
                            </button>
                          )}

                          {/* Delete Article Trash Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setArticleToDelete(article)
                              setDeleteError(null)
                              setShowDeleteModal(true)
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Numbered Pagination Footer */}
        {totalItems > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-[13px]">
            <div className="text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span>–<span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-bold text-slate-900">{totalItems}</span> articles
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                const isActive = currentPage === pg
                return (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#3A3564] text-white border-transparent shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {pg}
                  </button>
                )
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW ARTICLE                                  */}
      {/* ======================================================== */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false)
          }}
        >
          <div 
            className="w-full max-w-md my-6 bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-black/10 relative space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs"
                >
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 
                    className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] leading-tight text-slate-900"
                  >
                    Add New Article
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">Register new style in master catalog</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateArticleSubmit} className="space-y-4 text-xs sm:text-[13px]">
              
              <div>
                <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                  Article Number (Art No) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.G. A2045, 9437"
                  value={addArtNo}
                  onChange={(e) => setAddArtNo(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold uppercase text-[#3A3564] outline-none shadow-2xs transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blue Denim Jacket, Night Suit, T-Shirt"
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                />
              </div>

              {addError && (
                <div className="p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-xs bg-[#3A3564] hover:bg-[#2A2649] disabled:opacity-50 active:scale-[0.98]"
                >
                  {isPending ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: LINEMAN ARTICLE ALLOTMENT HISTORY BREAKDOWN      */}
      {/* ======================================================== */}
      {historyModalState && historyModalState.isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setHistoryModalState(null)
          }}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-black/10 relative space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs"
                >
                  <History className="w-5 h-5 text-[#3A3564]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                      Article #{historyModalState.artNo}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                      {historyModalState.totalPcs.toLocaleString()} pcs total
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {historyModalState.description} • Allotted to <strong>{historyModalState.linemanName}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setHistoryModalState(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Timeline Table */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Lifetime Allotment Log ({historyModalState.records.length} records)
              </div>

              {historyModalState.records.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No detailed allotment records found for this article.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FAF7F0] border-b border-black/10 font-mono uppercase font-bold text-slate-700">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Challan #</th>
                        <th className="py-2.5 px-3">Color / Pattern</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historyModalState.records.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {rec.challanDate || '—'}
                          </td>
                          <td className="py-2.5 px-3 font-bold font-mono text-[#3A3564]">
                            {rec.challanNo}
                            {rec.brand && (
                              <span className="text-[10px] text-slate-400 font-normal block">
                                {rec.brand}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 font-medium">
                            {rec.colorPattern}
                          </td>
                          <td className="py-2.5 px-3 text-right font-extrabold font-mono text-slate-900">
                            {rec.quantity.toLocaleString()} pcs
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {rec.status === 'QC_PASSED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>QC Passed</span>
                              </span>
                            ) : rec.status === 'DISPATCHED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-900 text-white border border-slate-800">
                                <Truck className="w-3 h-3 text-white" />
                                <span>Dispatched</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                                <Zap className="w-3 h-3 text-indigo-600" />
                                <span>In Production</span>
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

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500">
                Grand Total: {historyModalState.totalPcs.toLocaleString()} Pieces
              </span>
              <button
                type="button"
                onClick={() => setHistoryModalState(null)}
                className="px-4 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CONFIRM SINGLE ARTICLE DELETE                    */}
      {/* ======================================================== */}
      {showDeleteModal && articleToDelete && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false)
              setArticleToDelete(null)
            }
          }}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-rose-200/80 relative space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Header with Danger Badge */}
            <div className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs"
              >
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900">
                  Delete Article
                </h3>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">Permanent action • Cannot be undone</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setArticleToDelete(null)
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-3 text-xs sm:text-[13px]">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Article Number:</span>
                  <span className="font-mono font-bold text-sm text-[#3A3564]">{articleToDelete.art_no}</span>
                </div>
                {articleToDelete.description && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Description:</span>
                    <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">{articleToDelete.description}</span>
                  </div>
                )}
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">
                Are you sure you want to permanently delete this article? All associated worker assignments and linked production records will be removed.
              </p>

              {deleteError && (
                <div className="p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setArticleToDelete(null)
                }}
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteArticleConfirm}
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer bg-rose-600 hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isPending ? 'Deleting...' : 'Delete Article'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CONFIRM BULK DELETE ARTICLES                     */}
      {/* ======================================================== */}
      {showBulkDeleteModal && selectedIds.length > 0 && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBulkDeleteModal(false)
          }}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-rose-200/80 relative space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs"
              >
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900">
                  Delete {selectedIds.length} {selectedIds.length === 1 ? 'Article' : 'Articles'}
                </h3>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">Permanent bulk delete • Cannot be undone</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-3 text-xs sm:text-[13px]">
              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/60 space-y-1">
                <p className="font-bold text-rose-950">
                  You have selected {selectedIds.length} {selectedIds.length === 1 ? 'article' : 'articles'} to delete.
                </p>
                <p className="text-xs text-rose-700">
                  All corresponding allotments and worker assignments for these articles will be permanently deleted from the system.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteConfirm}
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer bg-rose-600 hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isPending ? 'Deleting...' : `Delete All (${selectedIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
