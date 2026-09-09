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
  AlertCircle
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

interface ArticlesClientProps {
  articles: Article[]
}

type FilterTab = 'ALL' | 'ACTIVE' | 'ARCHIVED'
type SortField = 'art_no' | 'created_at'
type SortOrder = 'asc' | 'desc'

export function ArticlesClient({ articles }: ArticlesClientProps) {
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
  const [addArtNo, setAddArtNo] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false)
        setShowDeleteModal(false)
        setShowBulkDeleteModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
    const headers = ['Article No', 'Description', 'Status', 'Created At']
    const rows = selectedArticles.map(a => [
      a.art_no,
      '"' + (a.description || '').replace(/"/g, '""') + '"',
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
    <div className="space-y-6">
      
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
            <h1 
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Articles
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Manage Art No. and Production Articles Catalog
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

      {/* 2. Table Toolbar & Bulk Action Bar */}
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

        {/* Toolbar Header Row */}
        <div 
          className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50"
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

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Art No or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* 3. Full-Width Table */}
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

                <th className="px-4 py-3.5 font-bold text-center">Status</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Tag className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">
                        {searchTerm ? 'No articles found matching "' + searchTerm + '"' : 'No articles in this view.'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Click &quot;Add Article&quot; in the top bar to register a new article style.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((article) => {
                  const isChecked = selectedIds.includes(article.id)
                  const isArchived = !article.is_active

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

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Restore Button (if archived) */}
                          {!article.is_active && (
                            <button
                              type="button"
                              onClick={() => {
                                startTransition(async () => {
                                  await toggleArticleArchive(article.id, false)
                                })
                              }}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs"
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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

        {/* 4. Numbered Pagination Footer */}
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
      {/* MODAL 2: CONFIRM SINGLE ARTICLE DELETE                    */}
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
      {/* MODAL 3: CONFIRM BULK DELETE ARTICLES                     */}
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
