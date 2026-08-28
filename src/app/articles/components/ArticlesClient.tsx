'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { 
  Tag,
  Trash2,
  Layers,
  Sparkles, 
  Plus, 
  Search, 
   
  Check, 
  X, 
  History, 
  Download, 
  Archive, 
  RotateCcw, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Clock
} from 'lucide-react'
import { 
  createArticle, 
  updateArticleRate, 
  toggleArticleArchive, 
  bulkArchiveArticles, 
  bulkRestoreArticles,
  getRateHistory 
} from '../actions'

type Article = {
  id: string
  art_no: string
  description?: string | null
  stitching_rate: number
  size_rates?: Record<string, number> | null
  is_active: boolean
  created_at: string
}

type RateHistoryItem = {
  id: string
  article_id: string
  old_rate: number
  new_rate: number
  created_at: string
}

interface ArticlesClientProps {
  articles: Article[]
  rateHistory: RateHistoryItem[]
}

type FilterTab = 'ALL' | 'ACTIVE' | 'ARCHIVED'
type SortField = 'art_no' | 'stitching_rate' | 'created_at'
type SortOrder = 'asc' | 'desc'



const SIZE_PRESETS: Record<string, { label: string; sizes: string[] }> = {
  ALPHA: { label: 'Adult Alpha (S-XXL)', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  NUMERIC: { label: 'Numeric Jeans (28-38)', sizes: ['28', '30', '32', '34', '36', '38'] },
  KIDS_AGE: { label: 'Kids Age (2-13Y)', sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'] },
  KIDS_NUM: { label: 'Kids Num (20-32)', sizes: ['20', '22', '24', '26', '28', '30', '32'] },
  UNIVERSAL: { label: 'Universal (Free Size)', sizes: ['Free Size'] },
}

function cleanArticleDesc(desc?: string | null) {
  if (!desc) return ''
  return desc.replace(/\s*\[.*?\]/g, '').trim()
}

function formatRateDate(dateStr?: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}


function renderArticleRateBadge(item: Article) {
  if (item.size_rates && Object.keys(item.size_rates).length > 0) {
    const rates = Object.values(item.size_rates).filter(r => !isNaN(r) && r > 0)
    if (rates.length > 0) {
      const min = Math.min(...rates)
      const max = Math.max(...rates)
      const label = min === max ? `₹${min.toFixed(2)}` : `₹${min.toFixed(2)} - ₹${max.toFixed(2)}`
      return (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-slate-800 text-[13px]">{label}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Size-Wise
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex flex-wrap gap-1 max-w-[220px]">
            {Object.entries(item.size_rates).map(([sz, rt]) => (
              <span key={sz} className="font-mono text-[10.5px] bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                {sz}:₹{rt}
              </span>
            ))}
          </div>
        </div>
      )
    }
  }
  return <span className="font-mono font-bold text-slate-800 text-[13px]">₹{item.stitching_rate.toFixed(2)}</span>
}

export function ArticlesClient({ articles, rateHistory }: ArticlesClientProps) {
  const [isPending, startTransition] = useTransition()
  
  // Toolbar State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTab, setFilterTab] = useState<FilterTab>('ACTIVE')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Sorting
  const [sortField, setSortField] = useState<SortField>('art_no')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUpdateRateModal, setShowUpdateRateModal] = useState(false)
  const [selectedArticleForRate, setSelectedArticleForRate] = useState<Article | null>(null)
  const [newRateValue, setNewRateValue] = useState('')
  const [rateUpdateError, setRateUpdateError] = useState<string | null>(null)

  // Rate History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyArticle, setHistoryArticle] = useState<Article | null>(null)
  const [specificHistoryList, setSpecificHistoryList] = useState<RateHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)


  // Rate Mode & Size-Wise State
  const [addRateMode, setAddRateMode] = useState<'FLAT' | 'SIZE_WISE'>('FLAT')
  const [addSizeRateRows, setAddSizeRateRows] = useState<Array<{ id: string; size: string; rate: string }>>([
    { id: '1', size: 'S', rate: '' },
    { id: '2', size: 'M', rate: '' },
    { id: '3', size: 'L', rate: '' },
    { id: '4', size: 'XL', rate: '' },
    { id: '5', size: 'XXL', rate: '' },
  ])
  const [updateRateMode, setUpdateRateMode] = useState<'FLAT' | 'SIZE_WISE'>('FLAT')
  const [updateSizeRateRows, setUpdateSizeRateRows] = useState<Array<{ id: string; size: string; rate: string }>>([])

  // Add Article Form State
  const [addArtNo, setAddArtNo] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addRate, setAddRate] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [addTouched, setAddTouched] = useState(false)

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false)
        setShowUpdateRateModal(false)
        setShowHistoryModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Map latest rate history per article
  const latestRateChangeMap = useMemo(() => {
    const map: Record<string, RateHistoryItem> = {}
    rateHistory.forEach(item => {
      if (!map[item.article_id]) {
        map[item.article_id] = item
      }
    })
    return map
  }, [rateHistory])

  // Filtered & Sorted Articles
  const filteredArticles = useMemo(() => {
    let list = articles.filter(item => {
      // Filter tab
      if (filterTab === 'ACTIVE' && !item.is_active) return false
      if (filterTab === 'ARCHIVED' && item.is_active) return false

      // Search term
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
      if (sortField === 'art_no') {
        return sortOrder === 'asc' 
          ? a.art_no.localeCompare(b.art_no)
          : b.art_no.localeCompare(a.art_no)
      } else if (sortField === 'stitching_rate') {
        return sortOrder === 'asc'
          ? a.stitching_rate - b.stitching_rate
          : b.stitching_rate - a.stitching_rate
      } else {
        const dA = new Date(a.created_at).getTime()
        const dB = new Date(b.created_at).getTime()
        return sortOrder === 'asc' ? dA - dB : dB - dA
      }
    })

    return list
  }, [articles, filterTab, searchTerm, sortField, sortOrder])

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
      setSortOrder('asc')
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

  // Bulk Actions
  const handleBulkExportCSV = () => {
    const selectedArticles = articles.filter(a => selectedIds.includes(a.id))
    const headers = ['Article No', 'Description', 'Stitching Rate (INR)', 'Status', 'Created At']
    const rows = selectedArticles.map(a => [
      a.art_no,
      '"' + (a.description || '').replace(/"/g, '""') + '"',
      a.stitching_rate.toFixed(2),
      a.is_active ? 'Active' : 'Archived',
      a.created_at
    ])

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

  // Add Article Submit (Supporting Flat and Size-Wise Tiered Rates)
  const handleCreateArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddTouched(true)
    setAddError(null)

    if (!addArtNo.trim()) {
      setAddError('Please enter a valid Article Number (Art No).')
      return
    }

    let finalBaseRate = 0
    let sizeRatesMap: Record<string, number> = {}

    if (addRateMode === 'SIZE_WISE') {
      const validRows = addSizeRateRows.filter(r => r.size.trim() && !isNaN(parseFloat(r.rate)) && parseFloat(r.rate) > 0)
      if (validRows.length === 0) {
        setAddError('Please enter at least 1 valid size name and a rate greater than ₹0.00')
        return
      }
      validRows.forEach(r => {
        sizeRatesMap[r.size.trim()] = parseFloat(r.rate)
      })
      const ratesList = Object.values(sizeRatesMap)
      finalBaseRate = Math.min(...ratesList)
    } else {
      finalBaseRate = parseFloat(addRate)
      if (isNaN(finalBaseRate) || finalBaseRate <= 0) {
        setAddError('Please enter a valid stitching rate greater than ₹0.00')
        return
      }
    }

    const formData = new FormData()
    formData.append('art_no', addArtNo.trim().toUpperCase())
    formData.append('description', addDescription.trim())
    formData.append('stitching_rate', finalBaseRate.toString())
    if (Object.keys(sizeRatesMap).length > 0) {
      formData.append('size_rates', JSON.stringify(sizeRatesMap))
    }

    startTransition(async () => {
      const res = await createArticle(formData)
      if (res?.error) {
        setAddError(res.error)
      } else {
        setShowAddModal(false)
        setAddArtNo('')
        setAddDescription('')
        setAddRate('')
        setAddRateMode('FLAT')
        setAddTouched(false)
      }
    })
  }

  // Update Rate Submit (Supporting Flat and Size-Wise Tiered Rates)
  const handleUpdateRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedArticleForRate) return
    setRateUpdateError(null)

    let finalRate = 0
    let sizeRatesMap: Record<string, number> = {}

    if (updateRateMode === 'SIZE_WISE') {
      const validRows = updateSizeRateRows.filter(r => r.size.trim() && !isNaN(parseFloat(r.rate)) && parseFloat(r.rate) > 0)
      if (validRows.length === 0) {
        setRateUpdateError('Please enter at least 1 valid size and rate greater than ₹0.00')
        return
      }
      validRows.forEach(r => {
        sizeRatesMap[r.size.trim()] = parseFloat(r.rate)
      })
      finalRate = Math.min(...Object.values(sizeRatesMap))
    } else {
      finalRate = parseFloat(newRateValue)
      if (isNaN(finalRate) || finalRate <= 0) {
        setRateUpdateError('Please enter a valid stitching rate greater than ₹0.00')
        return
      }
    }

    startTransition(async () => {
      const res = await updateArticleRate(
        selectedArticleForRate.id, 
        selectedArticleForRate.stitching_rate, 
        finalRate,
        Object.keys(sizeRatesMap).length > 0 ? sizeRatesMap : undefined
      )
      if (res?.error) {
        setRateUpdateError(res.error)
      } else {
        setShowUpdateRateModal(false)
        setSelectedArticleForRate(null)
        setNewRateValue('')
      }
    })
  }


  // Open Update Rate Modal with Size-Wise Pre-fill
  const openUpdateRateModal = (article: Article) => {
    setSelectedArticleForRate(article)
    setNewRateValue(article.stitching_rate.toString())
    setRateUpdateError(null)
    if (article.size_rates && Object.keys(article.size_rates).length > 0) {
      setUpdateRateMode('SIZE_WISE')
      const rows = Object.entries(article.size_rates).map(([sz, rt], idx) => ({
        id: (idx + 1).toString(),
        size: sz,
        rate: rt.toString()
      }))
      setUpdateSizeRateRows(rows)
    } else {
      setUpdateRateMode('FLAT')
      setUpdateSizeRateRows([
        { id: '1', size: 'S', rate: article.stitching_rate.toString() },
        { id: '2', size: 'M', rate: article.stitching_rate.toString() },
        { id: '3', size: 'L', rate: article.stitching_rate.toString() },
        { id: '4', size: 'XL', rate: (article.stitching_rate + 2).toString() },
        { id: '5', size: 'XXL', rate: (article.stitching_rate + 4).toString() },
      ])
    }
    setShowUpdateRateModal(true)
  }

  // View Rate History Modal
  const openRateHistoryModal = async (art: Article) => {
    setHistoryArticle(art)
    setShowHistoryModal(true)
    setLoadingHistory(true)
    const { data } = await getRateHistory(art.id)
    if (data) {
      setSpecificHistoryList(data)
    } else {
      setSpecificHistoryList([])
    }
    setLoadingHistory(false)
  }

  return (
    <div className="space-y-5">
      
      {/* 1. Sticky Page Header Card */}
      <div 
        className="sticky top-[14px] z-20 bg-white p-4 sm:p-5 rounded-[11px] border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
        style={{ borderColor: 'var(--border, #E2E8F0)' }}
      >
        {/* Left Side: 40x40 Badge + Title + Subtitle */}
        <div className="flex items-center gap-3.5">
          <div 
            className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: 'var(--steel, #2B4C7E)', color: '#FFFFFF' }}
          >
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h1 
              className="text-[18px] sm:text-[19px] font-bold font-[family-name:var(--font-heading)] leading-tight"
              style={{ color: 'var(--ink, #1C2733)' }}
            >
              Articles & Rates
            </h1>
            <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Manage Art No. and Stitching Rates
            </p>
          </div>
        </div>

        {/* Right Side: Add Article Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          

          <button
            type="button"
            onClick={() => {
              setAddError(null)
              setAddTouched(false)
              setShowAddModal(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Article</span>
          </button>
        </div>
      </div>

      {/* 2. Table Toolbar & Bulk Action Bar */}
      <div 
        className="bg-white rounded-[11px] border shadow-xs overflow-hidden"
        style={{ borderColor: 'var(--border, #E2E8F0)' }}
      >
        
        {/* Bulk Action Bar (Visible when >= 1 row selected) */}
        {selectedIds.length > 0 && (
          <div 
            className="p-3 px-4 border-b flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150"
            style={{ 
              backgroundColor: 'var(--steel-mist, #EEF3FA)', 
              borderColor: 'var(--steel-tint, #DBE6F5)' 
            }}
          >
            <div className="text-xs font-semibold" style={{ color: 'var(--steel-dark, #1F3A63)' }}>
              {selectedIds.length} {selectedIds.length === 1 ? 'article' : 'articles'} selected
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkExportCSV}
                className="flex items-center gap-1 px-3 py-1 rounded-[6px] text-xs font-semibold border bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                style={{ borderColor: 'var(--steel, #2B4C7E)', color: 'var(--steel, #2B4C7E)' }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Selected</span>
              </button>

              {filterTab === 'ARCHIVED' ? (
                <button
                  type="button"
                  onClick={handleBulkRestore}
                  disabled={isPending}
                  className="flex items-center gap-1 px-3 py-1 rounded-[6px] text-xs font-semibold border bg-white hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer text-emerald-700 border-emerald-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Selected</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBulkArchive}
                  disabled={isPending}
                  className="flex items-center gap-1 px-3 py-1 rounded-[6px] text-xs font-semibold border bg-white hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer text-rose-700 border-rose-300"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive Selected</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Toolbar Header Row */}
        <div 
          className="p-3.5 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5">
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
                  className={`px-3 py-1 rounded-[6px] text-xs font-semibold border transition-colors outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--steel-mist,#EEF3FA)] border-[var(--steel,#2B4C7E)] text-[var(--steel-dark,#1F3A63)]'
                      : 'bg-white border-[var(--border,#E2E8F0)] text-[var(--ink-soft,#5B6B7C)] hover:text-[var(--ink,#1C2733)]'
                  }`}
                >
                  {labelMap[tab]} ({count})
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Art No or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-white border rounded-[7px] text-xs outline-none transition-colors"
              style={{ borderColor: 'var(--border, #E2E8F0)' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'}
            />
          </div>
        </div>

        {/* 3. Full-Width Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-[11px] uppercase tracking-wider font-bold" style={{ borderColor: 'var(--border, #E2E8F0)', color: 'var(--ink-soft, #5B6B7C)' }}>
                
                {/* Select All Checkbox */}
                <th className="w-10 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[var(--steel,#2B4C7E)] cursor-pointer"
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
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" /> : <ArrowDown className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </th>

                <th className="px-4 py-3.5 font-bold">Description</th>

                {/* Sortable Stitching Rate */}
                <th 
                  onClick={() => handleSort('stitching_rate')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stitching Rate (₹)</span>
                    {sortField === 'stitching_rate' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" /> : <ArrowDown className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </th>

                <th className="px-4 py-3.5 font-bold text-center">Status</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Tag className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">
                        {searchTerm ? 'No articles found matching "' + searchTerm + '"' : 'No articles in this view.'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Click "+ Add Article" in the top bar to register a new article style.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((article) => {
                  const isChecked = selectedIds.includes(article.id)
                  const isArchived = !article.is_active
                  const latestHistory = latestRateChangeMap[article.id]

                  return (
                    <tr 
                      key={article.id} 
                      className={`transition-colors ${
                        isArchived 
                          ? 'bg-[var(--ink-gray-mist,#F1F4F8)] text-[var(--ink-faint,#8B9AAB)]' 
                          : 'hover:bg-slate-50/50 text-[var(--ink,#1C2733)]'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(article.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[var(--steel,#2B4C7E)] cursor-pointer"
                        />
                      </td>

                      {/* Art No */}
                      <td className="px-4 py-3.5 font-bold" style={{ color: isArchived ? 'var(--ink-faint, #8B9AAB)' : 'var(--steel, #2B4C7E)' }}>
                        {article.art_no}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5">
                        <span className={isArchived ? 'text-[var(--ink-faint,#8B9AAB)]' : 'text-slate-600 font-medium'}>
                          {article.description || '-'}
                        </span>
                      </td>

                      {/* Stitching Rate with Size-Wise Breakdown */}
                      <td className="px-4 py-3.5">
                        {renderArticleRateBadge(article)}
                        <div className="text-[10.5px] font-[family-name:var(--font-jetbrains-mono)] mt-1" style={{ color: 'var(--ink-faint, #8B9AAB)' }}>
                          {latestHistory 
                            ? 'was ₹' + latestHistory.old_rate.toFixed(2) + ' · ' + formatRateDate(latestHistory.created_at)
                            : 'unchanged since creation'
                          }
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 text-center">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold"
                          style={{
                            backgroundColor: article.is_active ? 'var(--green-mist, #E6F6EE)' : 'var(--ink-gray-mist, #F1F4F8)',
                            color: article.is_active ? 'var(--green, #1F9D63)' : 'var(--ink-faint, #8B9AAB)'
                          }}
                        >
                          {article.is_active ? 'Active' : 'Archived'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Rate History Clock Button */}
                          <button
                            type="button"
                            onClick={() => openRateHistoryModal(article)}
                            className="p-1 rounded-[6px] transition-colors cursor-pointer"
                            style={{ color: 'var(--ink-faint, #8B9AAB)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--steel, #2B4C7E)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-faint, #8B9AAB)'}
                            title="View Rate History"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Update Rate / Restore Link */}
                          {article.is_active ? (
                            <button
                              type="button"
                              onClick={() => openUpdateRateModal(article)}
                              className="text-xs font-semibold px-2.5 py-1 rounded-[6px] border bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                              style={{ borderColor: 'var(--border, #E2E8F0)', color: 'var(--steel, #2B4C7E)' }}
                            >
                              Update Rate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                startTransition(async () => {
                                  await toggleArticleArchive(article.id, false)
                                })
                              }}
                              className="text-xs font-semibold px-2.5 py-1 rounded-[6px] border bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                              style={{ borderColor: 'var(--border, #E2E8F0)', color: 'var(--ink-soft, #5B6B7C)' }}
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Numbered Pagination Footer */}
        {totalItems > 0 && (
          <div 
            className="p-4 border-t bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" 
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span>–<span className="font-semibold">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> articles
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-[6px] border bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ borderColor: 'var(--border, #E2E8F0)' }}
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
                    className={`w-7 h-7 rounded-[6px] text-xs font-semibold border transition-colors cursor-pointer ${
                      isActive
                        ? 'text-white border-transparent'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-[var(--border,#E2E8F0)]'
                    }`}
                    style={{
                      backgroundColor: isActive ? 'var(--steel, #2B4C7E)' : '#FFFFFF'
                    }}
                  >
                    {pg}
                  </button>
                )
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-[6px] border bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ borderColor: 'var(--border, #E2E8F0)' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW ARTICLE (CENTERED 420px MODAL)          */}
      {/* ======================================================== */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ backgroundColor: 'rgba(28,39,51,0.45)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false)
          }}
        >
          <div 
            className="w-full max-w-[540px] my-6 bg-white rounded-[13px] p-[24px] shadow-2xl border relative space-y-4 animate-in fade-in zoom-in-95 duration-150"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
                >
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 
                    className="text-[17px] font-bold font-[family-name:var(--font-heading)] leading-tight"
                    style={{ color: 'var(--ink, #1C2733)' }}
                  >
                    Add New Article
                  </h3>
                  <p className="text-[11px] text-slate-400">Register new style & size-wise stitching rates</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-[28px] h-[28px] rounded-[6px] border flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ borderColor: 'var(--border, #E2E8F0)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateArticleSubmit} className="space-y-4 text-xs">
              
              {/* Art No & Description Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                    Article Number (Art No) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. A2045"
                    value={addArtNo}
                    onChange={(e) => setAddArtNo(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-[7px] text-xs font-mono font-bold uppercase outline-none focus:bg-white"
                    style={{ borderColor: 'var(--border, #E2E8F0)' }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Blue Denim Jacket"
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-[7px] text-xs outline-none focus:bg-white"
                    style={{ borderColor: 'var(--border, #E2E8F0)' }}
                  />
                </div>
              </div>

              {/* Rate Mode Toggle */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                    Stitching Rate Structure <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10.5px] text-slate-400">Choose flat or size-wise rates</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-[9px] border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAddRateMode('FLAT')}
                    className={`py-1.5 px-3 rounded-[7px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      addRateMode === 'FLAT'
                        ? 'bg-white text-[var(--steel,#2B4C7E)] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Flat Rate (All Sizes Same)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddRateMode('SIZE_WISE')}
                    className={`py-1.5 px-3 rounded-[7px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      addRateMode === 'SIZE_WISE'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Size-Wise / Tiered Rates</span>
                  </button>
                </div>
              </div>

              {/* Mode A: Flat Rate Input */}
              {addRateMode === 'FLAT' && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Piece Rate for All Sizes (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 20.00"
                      value={addRate}
                      onChange={(e) => setAddRate(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border rounded-[7px] text-xs font-mono font-bold outline-none focus:bg-white"
                      style={{ borderColor: 'var(--border, #E2E8F0)' }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Same rate applied to all sizes stitched by workers.</p>
                </div>
              )}

              {/* Mode B: Dynamic Size-Wise Rate Editor */}
              {addRateMode === 'SIZE_WISE' && (
                <div className="space-y-3 pt-1">
                  {/* Quick Preset Buttons */}
                  <div>
                    <span className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Quick Fill Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(SIZE_PRESETS).map(([key, preset]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            const newRows = preset.sizes.map((sz, idx) => ({
                              id: (idx + 1).toString(),
                              size: sz,
                              rate: addSizeRateRows.find(r => r.size === sz)?.rate || ''
                            }))
                            setAddSizeRateRows(newRows)
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold border border-slate-200 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Rate Table / Rows */}
                  <div className="border rounded-[8px] overflow-hidden" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                    <div className="bg-slate-50 px-3 py-2 border-b grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-600 uppercase" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                      <div className="col-span-5">Size Name (Editable)</div>
                      <div className="col-span-6">Stitching Rate (₹)</div>
                      <div className="col-span-1 text-center"></div>
                    </div>

                    <div className="divide-y max-h-[190px] overflow-y-auto" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                      {addSizeRateRows.map((row, idx) => (
                        <div key={row.id} className="p-2 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/50">
                          {/* Size Name Input */}
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={row.size}
                              onChange={(e) => {
                                const updated = [...addSizeRateRows]
                                updated[idx].size = e.target.value
                                setAddSizeRateRows(updated)
                              }}
                              placeholder="e.g. XXL / 34 / S-L"
                              className="w-full px-2.5 py-1.5 bg-white border rounded text-xs font-mono font-bold outline-none"
                              style={{ borderColor: 'var(--border, #E2E8F0)' }}
                            />
                          </div>

                          {/* Rate Input */}
                          <div className="col-span-6 relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={row.rate}
                              onChange={(e) => {
                                const updated = [...addSizeRateRows]
                                updated[idx].rate = e.target.value
                                setAddSizeRateRows(updated)
                              }}
                              placeholder="0.00"
                              className="w-full pl-6 pr-2 py-1.5 bg-white border rounded text-xs font-mono font-bold outline-none text-indigo-900"
                              style={{ borderColor: 'var(--border, #E2E8F0)' }}
                            />
                          </div>

                          {/* Delete Button */}
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (addSizeRateRows.length > 1) {
                                  setAddSizeRateRows(addSizeRateRows.filter(r => r.id !== row.id))
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Row Button */}
                    <div className="p-2 bg-slate-50/80 border-t flex justify-between items-center" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const nextId = Date.now().toString()
                          setAddSizeRateRows([...addSizeRateRows, { id: nextId, size: '', rate: '' }])
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 rounded text-xs font-bold border border-indigo-200 flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Custom Size Rate
                      </button>
                      <span className="text-[10.5px] text-slate-500 font-mono">
                        {addSizeRateRows.length} sizes configured
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {addError && (
                <div 
                  className="p-3 rounded-[7px] text-[11.5px] font-medium flex items-center gap-2"
                  style={{ backgroundColor: 'var(--red-mist, #FBEAE8)', color: 'var(--red, #C0392B)' }}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 px-4 rounded-[8px] text-xs font-semibold border bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border, #E2E8F0)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2.5 px-4 rounded-[8px] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isPending ? 'Saving...' : 'Save Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: UPDATE RATE MODAL (WITH SIZE-WISE SUPPORT)      */}
      {/* ======================================================== */}
      {showUpdateRateModal && selectedArticleForRate && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ backgroundColor: 'rgba(28,39,51,0.45)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUpdateRateModal(false)
          }}
        >
          <div 
            className="w-full max-w-[500px] my-6 bg-white rounded-[13px] p-[24px] shadow-2xl border relative space-y-4 animate-in fade-in zoom-in-95 duration-150"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
              <div>
                <h3 className="text-base font-bold font-[family-name:var(--font-heading)]" style={{ color: 'var(--ink, #1C2733)' }}>
                  Update Stitching Rate
                </h3>
                <p className="text-xs text-slate-500 font-mono font-bold text-[var(--steel,#2B4C7E)]">
                  {selectedArticleForRate.art_no} ({selectedArticleForRate.description || 'Standard'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpdateRateModal(false)}
                className="w-7 h-7 rounded-[6px] border flex items-center justify-center text-slate-400 hover:text-slate-700"
                style={{ borderColor: 'var(--border, #E2E8F0)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRateSubmit} className="space-y-4 text-xs">
              
              {/* Rate Mode Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-[9px] border border-slate-200">
                <button
                  type="button"
                  onClick={() => setUpdateRateMode('FLAT')}
                  className={`py-1.5 px-3 rounded-[7px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    updateRateMode === 'FLAT'
                      ? 'bg-white text-[var(--steel,#2B4C7E)] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Flat Rate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateRateMode('SIZE_WISE')}
                  className={`py-1.5 px-3 rounded-[7px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    updateRateMode === 'SIZE_WISE'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Size-Wise Rates</span>
                </button>
              </div>

              {/* Mode A: Flat Rate */}
              {updateRateMode === 'FLAT' && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                    New Stitching Rate (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newRateValue}
                      onChange={(e) => setNewRateValue(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border rounded-[7px] text-xs font-mono font-bold outline-none focus:bg-white"
                      style={{ borderColor: 'var(--border, #E2E8F0)' }}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Mode B: Size-Wise Rates */}
              {updateRateMode === 'SIZE_WISE' && (
                <div className="space-y-3">
                  {/* Quick Preset Buttons */}
                  <div>
                    <span className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Quick Fill Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(SIZE_PRESETS).map(([key, preset]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            const newRows = preset.sizes.map((sz, idx) => ({
                              id: (idx + 1).toString(),
                              size: sz,
                              rate: updateSizeRateRows.find(r => r.size === sz)?.rate || selectedArticleForRate.stitching_rate.toString()
                            }))
                            setUpdateSizeRateRows(newRows)
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold border border-slate-200 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border rounded-[8px] overflow-hidden" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                    <div className="bg-slate-50 px-3 py-2 border-b grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-600 uppercase" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                      <div className="col-span-5">Size</div>
                      <div className="col-span-6">Rate (₹)</div>
                      <div className="col-span-1"></div>
                    </div>

                    <div className="divide-y max-h-[180px] overflow-y-auto" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                      {updateSizeRateRows.map((row, idx) => (
                        <div key={row.id} className="p-2 grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={row.size}
                              onChange={(e) => {
                                const updated = [...updateSizeRateRows]
                                updated[idx].size = e.target.value
                                setUpdateSizeRateRows(updated)
                              }}
                              className="w-full px-2 py-1 bg-white border rounded text-xs font-mono font-bold outline-none"
                              style={{ borderColor: 'var(--border, #E2E8F0)' }}
                            />
                          </div>
                          <div className="col-span-6 relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={row.rate}
                              onChange={(e) => {
                                const updated = [...updateSizeRateRows]
                                updated[idx].rate = e.target.value
                                setUpdateSizeRateRows(updated)
                              }}
                              className="w-full pl-6 pr-2 py-1 bg-white border rounded text-xs font-mono font-bold outline-none text-indigo-900"
                              style={{ borderColor: 'var(--border, #E2E8F0)' }}
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (updateSizeRateRows.length > 1) {
                                  setUpdateSizeRateRows(updateSizeRateRows.filter(r => r.id !== row.id))
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 bg-slate-50 border-t flex justify-between items-center" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const nextId = Date.now().toString()
                          setUpdateSizeRateRows([...updateSizeRateRows, { id: nextId, size: '', rate: '' }])
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 rounded text-xs font-bold border border-indigo-200 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Size Rate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {rateUpdateError && (
                <div className="p-2.5 rounded-[7px] text-[11.5px] font-medium" style={{ backgroundColor: 'var(--red-mist, #FBEAE8)', color: 'var(--red, #C0392B)' }}>
                  {rateUpdateError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateRateModal(false)}
                  className="w-full py-2 px-3 rounded-[8px] text-xs font-semibold border bg-white hover:bg-slate-50 text-slate-700"
                  style={{ borderColor: 'var(--border, #E2E8F0)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2 px-3 rounded-[8px] text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
                  style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
                >
                  {isPending ? 'Updating...' : 'Update & Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: RATE CHANGE HISTORY MODAL                       */}
      {/* ======================================================== */}
      {showHistoryModal && historyArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(28,39,51,0.45)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHistoryModal(false)
          }}
        >
          <div 
            className="w-full max-w-[440px] bg-white rounded-[13px] p-[24px] shadow-2xl border relative space-y-4 animate-in fade-in zoom-in-95 duration-150"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
                >
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)]" style={{ color: 'var(--ink, #1C2733)' }}>
                    Rate History
                  </h3>
                  <p className="text-xs text-slate-500 font-mono font-bold">
                    {historyArticle.art_no} • Current: ₹{historyArticle.stitching_rate.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-7 h-7 rounded-[6px] border flex items-center justify-center text-slate-400 hover:text-slate-700"
                style={{ borderColor: 'var(--border, #E2E8F0)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* History Feed */}
            <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
              {loadingHistory ? (
                <div className="p-8 text-center text-slate-400">Loading history...</div>
              ) : specificHistoryList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-1">
                  <Clock className="w-6 h-6 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">No previous rate changes.</p>
                  <p className="text-[11px]">This article has maintained its initial creation rate of ₹{historyArticle.stitching_rate.toFixed(2)}/pc.</p>
                </div>
              ) : (
                specificHistoryList.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-[8px] border flex items-center justify-between"
                    style={{ borderColor: 'var(--border, #E2E8F0)' }}
                  >
                    <div>
                      <div className="font-medium text-slate-700 font-mono">
                        ₹{item.old_rate.toFixed(2)} → <span className="font-bold text-[var(--steel,#2B4C7E)]">₹{item.new_rate.toFixed(2)}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-400 mt-0.5 font-[family-name:var(--font-jetbrains-mono)]">
                        Effective {formatRateDate(item.created_at)}
                      </div>
                    </div>
                    <span className="text-[10.5px] px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-600">
                      Logged
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-[7px] text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
