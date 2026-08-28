
'use client'

import { useState, useMemo } from 'react'
import { createDetailedAllotment, VariantPayload, MaterialPayload } from '../actions'
import { 
  ClipboardList,
  UserCheck,
  Clock,
  Calendar,
  Flame,
  Gauge,
  Building2,
  Boxes,
  FileCheck2,
  Zap,
  Camera,
  Image as ImageIcon,
  Upload,
  FileText,
  Tag, 
  Plus, 
  Trash2, 
  Layers, 
  PackageCheck, 
  Loader2, 
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react'


function expandTierSizes(sizeRates: Record<string, number>): string[] {
  const result: string[] = []
  for (const key of Object.keys(sizeRates)) {
    if (key.includes('/')) {
      const parts = key.split('/').map(s => s.trim()).filter(Boolean)
      result.push(...parts)
    } else if (key.includes(',')) {
      const parts = key.split(',').map(s => s.trim()).filter(Boolean)
      result.push(...parts)
    } else {
      result.push(key.trim())
    }
  }
  return Array.from(new Set(result))
}

function getRateForIndividualSize(size: string, sizeRates?: Record<string, number> | null, defaultRate?: number): number {
  if (!sizeRates || Object.keys(sizeRates).length === 0) return defaultRate || 0
  if (sizeRates[size] !== undefined) return sizeRates[size]
  for (const [tierKey, rate] of Object.entries(sizeRates)) {
    const parts = tierKey.split(/[/,-]/).map(s => s.trim().toUpperCase())
    if (parts.includes(size.toUpperCase())) {
      return rate
    }
  }
  return defaultRate || 0
}

function cleanArticleDesc(desc?: string) {
  if (!desc) return ''
  return desc.replace(/\s*\[.*?\]/g, '').trim()
}

type Profile = { id: string; username: string }
type Article = { id: string; art_no: string; description?: string; stitching_rate?: number; size_rates?: Record<string, number> | null }

// Preset size groups
const SIZE_PRESETS: Record<string, { label: string; sizes: string[] }> = {
  alpha: {
    label: 'Adult Alpha (XS-5XL)',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
  },
  numeric: {
    label: 'Jeans / Numeric (28-44)',
    sizes: ['28', '30', '32', '34', '36', '38', '40', '42', '44']
  },
  kids_age: {
    label: 'Kids Age (0M-16Y)',
    sizes: ['0-6M', '6-12M', '1-2Y', '2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-12Y', '14-16Y']
  },
  kids_num: {
    label: 'Kids Numbers (16-34)',
    sizes: ['16', '18', '20', '22', '24', '26', '28', '30', '32', '34']
  },
  free_size: {
    label: 'Universal (Free Size)',
    sizes: ['Free Size']
  }
}

export function CreateAllotmentForm({ 
  linemen, 
  managers = [],
  articles 
}: { 
  linemen: Profile[], 
  managers?: Array<{ id: string; username: string; role?: string }>,
  articles: Article[] 
}) {
  const [linemanId, setLinemanId] = useState('')
  const [articleId, setArticleId] = useState('')
  
  // Touched state for validation
  const [touchedLineman, setTouchedLineman] = useState(false)
  const [touchedArticle, setTouchedArticle] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Size Management
  const [activePreset, setActivePreset] = useState<string>('alpha')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL'])
  const [customSizeInput, setCustomSizeInput] = useState('')

  // Color Matrix Management
  const [colorRows, setColorRows] = useState<Array<{
    id: string
    color: string
    quantities: Record<string, number>
  }>>([
    { id: '1', color: 'Navy Blue', quantities: {} },
    { id: '2', color: 'Black', quantities: {} }
  ])

  // Client Challan & Multi-Sample Photos (Up to 4)

  // Production Order, Deadlines & Priority
  const [managerName, setManagerName] = useState('')
  const [productionOrderNo, setProductionOrderNo] = useState('')
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().split('T')[0]
  })
  const [targetHours, setTargetHours] = useState(16)
  const [priority, setPriority] = useState<'NORMAL' | 'RUSH' | 'CRITICAL'>('NORMAL')

  const [clientChallanNo, setClientChallanNo] = useState('')
  const [samplePhotos, setSamplePhotos] = useState<string[]>([])
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'url'>('upload')

  // Material Requirements Checklist with Sourcing Tag
  const [materials, setMaterials] = useState<Array<{
    id: string
    item_name: string
    required_qty: string
    admin_issued: boolean
    source: 'CLIENT' | 'FACTORY_STORE'
  }>>([
    { id: '1', item_name: 'Main Fabric Roll', required_qty: '500 Meters', admin_issued: false, source: 'CLIENT' },
    { id: '2', item_name: 'Matching Sewing Thread', required_qty: '12 Cones', admin_issued: false, source: 'FACTORY_STORE' },
    { id: '3', item_name: '18L 4-Hole Buttons', required_qty: '1500 pcs', admin_issued: false, source: 'CLIENT' },
    { id: '4', item_name: 'Main Brand Label', required_qty: '500 pcs', admin_issued: false, source: 'CLIENT' },
    { id: '5', item_name: 'Size Labels', required_qty: '500 pcs', admin_issued: false, source: 'CLIENT' },
  ])

  const [newMaterialName, setNewMaterialName] = useState('')
  const [newMaterialQty, setNewMaterialQty] = useState('')
  const [newMaterialSource, setNewMaterialSource] = useState<'CLIENT' | 'FACTORY_STORE'>('CLIENT')

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Selected article details
  const selectedArticle = useMemo(() => {
    return articles.find(a => a.id === articleId)
  }, [articles, articleId])

  // Calculate Grand Matrix Total Pieces
  const totalPieces = useMemo(() => {
    let sum = 0
    colorRows.forEach(row => {
      selectedSizes.forEach(size => {
        const q = row.quantities[size] || 0
        sum += q
      })
    })
    return sum
  }, [colorRows, selectedSizes])

  const targetRunRate = useMemo(() => {
    if (totalPieces <= 0) return 0
    return Math.ceil(totalPieces / (targetHours > 0 ? targetHours : 16))
  }, [totalPieces, targetHours])


  // Multi-Sample Photo Handlers (Up to 4)
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).slice(0, 4 - samplePhotos.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string
        if (base64) {
          setSamplePhotos(prev => prev.length < 4 ? [...prev, base64] : prev)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleAddPhotoUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPhotoUrl.trim() || samplePhotos.length >= 4) return
    setSamplePhotos(prev => [...prev, newPhotoUrl.trim()])
    setNewPhotoUrl('')
  }

  const removePhoto = (index: number) => {
    setSamplePhotos(samplePhotos.filter((_, i) => i !== index))
  }

  // Target progress percentage (capped at 100%)
  const targetProgress = totalPieces > 0 ? 100 : 0

  // Add / Remove Sizes
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length === 1) return // Keep at least one size
      setSelectedSizes(selectedSizes.filter(s => s !== size))
    } else {
      setSelectedSizes([...selectedSizes, size])
    }
  }

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = customSizeInput.trim().toUpperCase()
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes([...selectedSizes, trimmed])
      setCustomSizeInput('')
    }
  }

  // Add / Remove Color Rows
  const addColorRow = () => {
    const newId = Date.now().toString()
    setColorRows([...colorRows, { id: newId, color: '', quantities: {} }])
  }

  const removeColorRow = (id: string) => {
    if (colorRows.length === 1) return
    setColorRows(colorRows.filter(r => r.id !== id))
  }

  const updateColorName = (id: string, color: string) => {
    setColorRows(colorRows.map(r => r.id === id ? { ...r, color } : r))
  }

  const updateQuantity = (id: string, size: string, qty: number) => {
    setColorRows(colorRows.map(r => {
      if (r.id === id) {
        return {
          ...r,
          quantities: {
            ...r.quantities,
            [size]: isNaN(qty) || qty < 0 ? 0 : qty
          }
        }
      }
      return r
    }))
  }

  // Material Checklist Toggles
  const toggleMaterialIssued = (id: string) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, admin_issued: !m.admin_issued } : m))
  }

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id))
  }

  
  // Auto-Generate Size & Color BOM Calculation
  const handleAutoGenerateBOM = () => {
    const generated: Array<{
      id: string
      item_name: string
      required_qty: string
      admin_issued: boolean
      source: 'CLIENT' | 'FACTORY_STORE'
    }> = []

    // 1. Fabric Roll Estimate (approx 0.35 - 0.45 meters per piece)
    const approxMeters = Math.max(Math.ceil(totalPieces * 0.4), 10)
    generated.push({
      id: 'fab_' + Date.now(),
      item_name: 'Main Fabric Roll',
      required_qty: totalPieces > 0 ? `${approxMeters} Meters` : 'As required',
      admin_issued: false,
      source: 'CLIENT'
    })

    // 2. Matching Thread per Color (1 cone per 100 pcs, min 2 cones per active color)
    colorRows.forEach((row, idx) => {
      const colorName = row.color.trim() || `Color ${idx + 1}`
      const colorSum = selectedSizes.reduce((s, size) => s + (row.quantities[size] || 0), 0)
      const cones = Math.max(Math.ceil(colorSum / 100), 2)
      generated.push({
        id: `thread_${idx}_` + Date.now(),
        item_name: `Matching Sewing Thread (${colorName})`,
        required_qty: `${cones} Cones`,
        admin_issued: false,
        source: 'FACTORY_STORE'
      })
    })

    // 3. Size Labels per Size
    selectedSizes.forEach((size, idx) => {
      const sizeSum = colorRows.reduce((s, row) => s + (row.quantities[size] || 0), 0)
      if (sizeSum > 0 || totalPieces === 0) {
        generated.push({
          id: `lbl_size_${size}_` + Date.now(),
          item_name: `Size Labels (${size})`,
          required_qty: `${sizeSum > 0 ? sizeSum : 500} pcs`,
          admin_issued: false,
          source: 'CLIENT'
        })
      }
    })

    // 4. Main Brand Label & Polybags (Client Consignment)
    generated.push({
      id: 'lbl_brand_' + Date.now(),
      item_name: 'Main Brand Label & Neck Tag',
      required_qty: `${totalPieces > 0 ? totalPieces : 500} pcs`,
      admin_issued: false,
      source: 'CLIENT'
    })

    generated.push({
      id: 'poly_' + Date.now(),
      item_name: 'Polybags (10x14 Master)',
      required_qty: `${totalPieces > 0 ? totalPieces : 500} pcs`,
      admin_issued: false,
      source: 'CLIENT'
    })

    // Retain any existing custom items not matching generated names
    const existingCustom = materials.filter(m => 
      !m.item_name.includes('Sewing Thread') && 
      !m.item_name.includes('Size Labels') &&
      !m.item_name.includes('Main Fabric Roll') &&
      !m.item_name.includes('Main Brand Label') &&
      !m.item_name.includes('Polybags')
    )

    setMaterials([...generated, ...existingCustom.map(m => ({ ...m, source: m.source || 'CLIENT' }))])
  }

  const addCustomMaterial = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaterialName.trim()) return
    const newId = Date.now().toString()
    setMaterials([
      ...materials,
      {
        id: newId,
        item_name: newMaterialName.trim(),
        required_qty: newMaterialQty.trim() || 'As required',
        admin_issued: false,
        source: newMaterialSource
      }
    ])
    setNewMaterialName('')
    setNewMaterialQty('')
  }

  // Form Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setHasAttemptedSubmit(true)
    setError(null)
    setSuccess(false)

    if (!linemanId || !articleId) {
      setError('Please select both a Lineman and an Article.')
      return
    }

    if (totalPieces <= 0) {
      setError('Please enter at least 1 piece quantity in the Size & Color Ratio Matrix.')
      return
    }

    // Build payload variants
    const payloadVariants: VariantPayload[] = []
    colorRows.forEach(row => {
      const color = row.color.trim() || 'Default Color'
      selectedSizes.forEach(size => {
        const qty = row.quantities[size] || 0
        if (qty > 0) {
          payloadVariants.push({
            color,
            size,
            quantity: qty
          })
        }
      })
    })

    const payloadMaterials: MaterialPayload[] = materials.map(m => ({
      item_name: m.item_name,
      required_qty: m.required_qty,
      admin_issued: false,
      source: m.source
    }))

    setIsPending(true)
    const res = await createDetailedAllotment({
      lineman_id: linemanId,
      article_id: articleId,
      target_qty: totalPieces,
      production_order_no: `PO-${Date.now().toString().slice(-6)}`,
      manager_name: managerName.trim() || 'Production Manager',
      due_date: dueDate,
      target_hours: targetHours,
      priority: priority,
      client_challan_no: clientChallanNo.trim(),
      sample_photos: samplePhotos,
      variants: payloadVariants,
      materials: payloadMaterials
    })

    if (res?.error) {
      setError(res.error)
      setIsPending(false)
    } else {
      setSuccess(true)
      setIsPending(false)
      // Reset form fields
      setManagerName('')
      setProductionOrderNo('')
      setClientChallanNo('')
      setSamplePhotos([])
      setColorRows(colorRows.map(r => ({ ...r, quantities: {} })))
      setTimeout(() => setSuccess(false), 3500)
    }
  }

  // Field validation flags
  const isLinemanError = (touchedLineman || hasAttemptedSubmit) && !linemanId
  const isLinemanSuccess = Boolean(linemanId)

  const isArticleError = (touchedArticle || hasAttemptedSubmit) && !articleId
  const isArticleSuccess = Boolean(articleId)

  return (
    <div className="space-y-5">
      
      {/* 2. Sticky Page Header */}
      <div 
        className="sticky top-[14px] z-20 bg-white p-5 sm:p-6 rounded-[11px] border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
        style={{ borderColor: 'var(--border, #E2E8F0)' }}
      >
        <div className="flex items-center gap-3.5">
          <div 
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: 'var(--steel, #2B4C7E)', color: '#FFFFFF' }}
          >
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 
              className="text-[20px] sm:text-[22px] font-bold font-[family-name:var(--font-heading)] leading-tight"
              style={{ color: 'var(--ink, #1C2733)' }}
            >
              Target Allotments & Material Handover
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Assign cut-to-sew size-color ratios & verify raw materials issue
            </p>
          </div>
        </div>

        {/* Grand Target Metric & Progress Bar */}
        <div className="w-full sm:w-auto flex flex-col sm:items-end bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-200">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Grand Target:
            </span>
            <span 
              className="text-[22px] font-bold font-[family-name:var(--font-heading)] leading-none"
              style={{ color: 'var(--steel, #2B4C7E)' }}
            >
              {totalPieces.toLocaleString()} <span className="text-[12px] font-normal text-slate-500">pcs</span>
            </span>
          </div>

          {/* 5px Thin Progress Track */}
          <div 
            className="w-full sm:w-36 h-[5px] rounded-full mt-2 overflow-hidden"
            style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: totalPieces > 0 ? '100%' : '0%',
                backgroundColor: 'var(--steel, #2B4C7E)' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Allotment Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Step 1: Lineman & Article Selection Card */}
        <div 
          className="bg-white rounded-[11px] p-5 sm:p-6 border shadow-xs"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
            <span className="w-6 h-6 rounded-full bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)] text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-[15px] font-bold font-[family-name:var(--font-heading)]" style={{ color: 'var(--ink, #1C2733)' }}>
              Select Floor Lineman & Style Article
            </h2>
          </div>

          
          {/* Row 0: Production Order # & Priority Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 pb-5 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
            
            {/* Production Manager Dropdown from Registered Employees */}
            <div className="space-y-1.5">
              <label 
                htmlFor="manager_name" 
                className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Production Manager (Allotted By) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="manager_name"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full py-[10px] pl-9 pr-3 text-[13.5px] font-medium rounded-[8px] border transition-colors outline-none bg-white text-[var(--steel-dark,#1F3A63)] cursor-pointer"
                  style={{ borderColor: 'var(--border, #E2E8F0)' }}
                >
                  <option value="">-- Choose Production Manager --</option>
                  {managers && managers.length > 0 ? (
                    managers.map((m) => (
                      <option key={m.id} value={m.username}>
                        {m.username} ({m.role === 'ADMIN' ? 'Plant Admin' : 'Production Manager'})
                      </option>
                    ))
                  ) : (
                    <option value="admin">admin (Plant Admin)</option>
                  )}
                </select>
                <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[11.5px] text-slate-500">
                Select from registered Production Managers in Employee list.
              </p>
            </div>

            {/* Order Urgency / Priority */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Production Urgency & Priority
              </label>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {[
                  { key: 'NORMAL', label: 'Normal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                  { key: 'RUSH', label: 'Rush Order', color: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' },
                  { key: 'CRITICAL', label: 'Critical / Export', color: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100' },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key as any)}
                    className={`py-2 px-2 text-xs font-bold rounded-[8px] border transition-all text-center flex items-center justify-center gap-1.5 ${
                      priority === p.key ? 'ring-2 ring-offset-1 ring-slate-800 font-extrabold ' + p.color : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p.key === 'CRITICAL' && <Flame className="w-3.5 h-3.5 text-rose-600" />}
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-[11.5px] text-slate-500">
                Sets high-priority alert badges on the Lineman and QC dashboard.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Lineman Field with Error/Success validation */}
            <div className="space-y-1.5">
              <label 
                htmlFor="lineman_id" 
                className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Assign To Lineman <span className="text-red-500">*</span>
              </label>
              
              <select
                id="lineman_id"
                value={linemanId}
                onChange={(e) => {
                  setLinemanId(e.target.value)
                  setTouchedLineman(true)
                }}
                onBlur={() => setTouchedLineman(true)}
                className={`w-full py-[11px] px-[13px] text-[13.5px] rounded-[8px] border transition-colors outline-none bg-white ${
                  isLinemanError
                    ? 'border-[var(--red,#C0392B)] bg-[var(--red-mist,#FBEAE8)]'
                    : isLinemanSuccess
                    ? 'border-[var(--green,#1F9D63)]'
                    : 'border-[var(--border,#E2E8F0)] focus:border-[var(--steel,#2B4C7E)]'
                }`}
              >
                <option value="">-- Choose Floor Lineman --</option>
                {linemen.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.username} (Line Supervisor)
                  </option>
                ))}
              </select>

              {/* Validation Messages */}
              {isLinemanError && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--red, #C0392B)' }}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>This field is required before assigning target.</span>
                </div>
              )}
              {isLinemanSuccess && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--green, #1F9D63)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Lineman selected & active on sewing floor.</span>
                </div>
              )}
            </div>

            {/* Article Field with Error/Success validation & Stitching Rate */}
            <div className="space-y-1.5">
              <label 
                htmlFor="article_id" 
                className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Style Article (Art No.) <span className="text-red-500">*</span>
              </label>
              
              <select
                id="article_id"
                value={articleId}
                onChange={(e) => {
                  const val = e.target.value
                  setArticleId(val)
                  setTouchedArticle(true)
                  const chosen = articles.find(a => a.id === val)
                  if (chosen && chosen.size_rates && Object.keys(chosen.size_rates).length > 0) {
                    const expanded = expandTierSizes(chosen.size_rates)
                    if (expanded.length > 0) {
                      setSelectedSizes(expanded)
                    }
                  }
                }}
                onBlur={() => setTouchedArticle(true)}
                className={`w-full py-[11px] px-[13px] text-[13.5px] rounded-[8px] border transition-colors outline-none bg-white ${
                  isArticleError
                    ? 'border-[var(--red,#C0392B)] bg-[var(--red-mist,#FBEAE8)]'
                    : isArticleSuccess
                    ? 'border-[var(--green,#1F9D63)]'
                    : 'border-[var(--border,#E2E8F0)] focus:border-[var(--steel,#2B4C7E)]'
                }`}
              >
                <option value="">-- Choose Article Style --</option>
                {articles.map((a) => {
                  let rateTag = ''
                  if (a.size_rates && Object.keys(a.size_rates).length > 0) {
                    const rts = Object.values(a.size_rates).filter(r => !isNaN(r) && r > 0)
                    if (rts.length > 0) {
                      const min = Math.min(...rts)
                      const max = Math.max(...rts)
                      rateTag = min === max ? `(₹${min}/pc)` : `(₹${min} - ₹${max}/pc Size-Wise)`
                    }
                  } else if (a.stitching_rate) {
                    rateTag = `(₹${a.stitching_rate}/pc)`
                  }
                  return (
                    <option key={a.id} value={a.id}>
                      {a.art_no} {cleanArticleDesc(a.description) ? `- ${cleanArticleDesc(a.description)}` : ''} {rateTag}
                    </option>
                  )
                })}
              </select>

              {/* Validation Messages */}
              {isArticleError && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--red, #C0392B)' }}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>This field is required before assigning target.</span>
                </div>
              )}
              {isArticleSuccess && selectedArticle && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--green, #1F9D63)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {selectedArticle.size_rates && Object.keys(selectedArticle.size_rates).length > 0
                      ? `Size-Wise rates loaded: ${Object.entries(selectedArticle.size_rates).map(([k, v]) => `${k}: ₹${v}`).join(' · ')}`
                      : selectedArticle.stitching_rate 
                      ? `Stitching rate ₹${selectedArticle.stitching_rate}/pc loaded` 
                      : `${cleanArticleDesc(selectedArticle.description) || selectedArticle.art_no} loaded`}
                  </span>
                </div>
              )}
            </div>
          </div>


          
          {/* PPC Target Deadlines & Calculated Line Speed */}
          <div className="mt-5 pt-5 border-t grid grid-cols-1 md:grid-cols-3 gap-4" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
            
            {/* Target Due Date */}
            <div className="space-y-1.5">
              <label htmlFor="due_date" className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Target Completion Due Date
              </label>
              <div className="relative">
                <input
                  id="due_date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full py-[9px] pl-9 pr-3 text-[13px] rounded-[8px] border bg-white outline-none"
                  style={{ borderColor: 'var(--border, #E2E8F0)' }}
                />
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Target Production Hours / Shifts */}
            <div className="space-y-1.5">
              <label htmlFor="target_hours" className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Estimated Shift Hours
              </label>
              <div className="relative">
                <input
                  id="target_hours"
                  type="number"
                  min="1"
                  max="500"
                  value={targetHours || ''}
                  onChange={(e) => setTargetHours(parseInt(e.target.value, 10) || 16)}
                  placeholder="e.g. 16 (2 Days)"
                  className="w-full py-[9px] pl-9 pr-3 text-[13px] rounded-[8px] border bg-white font-mono font-bold outline-none"
                  style={{ borderColor: 'var(--border, #E2E8F0)' }}
                />
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Live PPC Run-Rate Card */}
            <div className="p-3 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-[10px] border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="block text-[10.5px] font-bold uppercase tracking-wider text-indigo-700">
                  Target Line Speed (PPC)
                </span>
                <span className="text-[17px] font-bold font-[family-name:var(--font-heading)] text-indigo-900">
                  {targetRunRate} <span className="text-xs font-normal text-indigo-600">pcs / hour</span>
                </span>
                <span className="block text-[11px] text-slate-500">
                  ≈ {Math.ceil(targetRunRate * 8)} pcs / shift
                </span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Gauge className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Client Challan & Golden Sample Reference Photos */}
          <div className="mt-5 pt-5 border-t grid grid-cols-1 md:grid-cols-2 gap-5" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
            
            {/* Client Delivery Challan # */}
            <div className="space-y-1.5">
              <label 
                htmlFor="client_challan_no" 
                className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Client / Buyer Delivery Challan # (Work Order)
              </label>
              <div className="relative">
                <input
                  id="client_challan_no"
                  type="text"
                  value={clientChallanNo}
                  onChange={(e) => setClientChallanNo(e.target.value)}
                  placeholder="e.g. CH-8921 / Buyer DC # / Order Ref"
                  className="w-full py-[10px] pl-9 pr-3 text-[13.5px] rounded-[8px] border transition-colors outline-none bg-white font-mono"
                  style={{ borderColor: 'var(--border, #E2E8F0)' }}
                />
                <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <p className="text-[11.5px] text-slate-500">
                Official delivery challan number provided by the ordering brand company.
              </p>
            </div>

            {/* Buyer Golden Sample Photos (Up to 4) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                  Buyer Sample Photos ({samplePhotos.length}/4)
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPhotoInputMode('upload')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${photoInputMode === 'upload' ? 'bg-[var(--steel,#2B4C7E)] text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoInputMode('url')}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${photoInputMode === 'url' ? 'bg-[var(--steel,#2B4C7E)] text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Paste URL
                  </button>
                </div>
              </div>

              {/* Upload Input or URL Input */}
              {samplePhotos.length < 4 && (
                <div>
                  {photoInputMode === 'upload' ? (
                    <label className="flex items-center justify-center gap-2 w-full py-2 px-3 border border-dashed rounded-[8px] cursor-pointer hover:bg-slate-50 transition-colors text-[12.5px] text-slate-600 border-slate-300">
                      <Camera className="w-4 h-4 text-[var(--steel,#2B4C7E)]" />
                      <span>Click to upload sample image (Front / Back / Label)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handlePhotoFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="https://... image link"
                        className="flex-1 py-1.5 px-3 text-[12.5px] rounded-[8px] border bg-white border-slate-300 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        className="px-3 py-1.5 bg-[var(--steel,#2B4C7E)] text-white text-xs font-medium rounded-[8px]"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Photos Gallery Thumbnails */}
              {samplePhotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {samplePhotos.map((photo, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                      <img src={photo} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="absolute bottom-0.5 left-0.5 px-1 py-0.2 bg-black/70 text-[9px] text-white rounded font-mono">
                        {idx === 0 ? 'Front' : idx === 1 ? 'Back' : idx === 2 ? 'Label' : 'Detail'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Step 2: Size & Color Ratio Matrix Card */}
        <div 
          className="bg-white rounded-[11px] p-5 sm:p-6 border shadow-xs space-y-5"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)] text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-[15px] font-bold font-[family-name:var(--font-heading)]" style={{ color: 'var(--ink, #1C2733)' }}>
                Size & Color Ratio Matrix
              </h2>
            </div>
            <span className="text-xs" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Configure cutting batch breakdown
            </span>
          </div>

          {/* Size Preset Selector */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Category Preset:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SIZE_PRESETS).map(([key, group]) => {
                const isSelected = activePreset === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActivePreset(key)
                      setSelectedSizes(group.sizes)
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-[6px] border transition-colors outline-none ${
                      isSelected
                        ? 'text-white border-transparent'
                        : 'bg-white text-[var(--ink-soft,#5B6B7C)] hover:text-[var(--ink,#1C2733)] border-[var(--border,#E2E8F0)]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--steel, #2B4C7E)' : '#FFFFFF'
                    }}
                  >
                    {group.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Size Chips & Custom Size Add */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Selected Sizes for this Article:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {selectedSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className="px-3 py-1 text-xs font-semibold rounded-[6px] border transition-colors outline-none flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'var(--steel-mist, #EEF3FA)',
                    borderColor: 'var(--steel, #2B4C7E)',
                    color: 'var(--steel-dark, #1F3A63)'
                  }}
                  title="Click to remove size"
                >
                  <span>{size}</span>
                  <span className="text-[10px] opacity-60">×</span>
                </button>
              ))}

              {/* Add Custom Size Inline Form */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  placeholder="+ Size"
                  className="w-20 px-2.5 py-1 text-xs border rounded-[6px] outline-none transition-colors"
                  style={{ borderColor: 'var(--border, #E2E8F0)' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomSize(e)
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-2.5 py-1 text-xs font-semibold rounded-[6px] border bg-slate-50 hover:bg-slate-100 text-slate-700"
                  style={{ borderColor: 'var(--border, #E2E8F0)' }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Color Rows & Matrix Table (Responsive with horizontal scroll under 900px) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Piece Matrix Breakdown:
              </label>

              {/* Add Color Button (Outline style in steel) */}
              <button
                type="button"
                onClick={addColorRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-semibold border transition-colors bg-white hover:bg-[var(--steel-mist,#EEF3FA)]"
                style={{
                  borderColor: 'var(--steel, #2B4C7E)',
                  color: 'var(--steel, #2B4C7E)'
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Color Row
              </button>
            </div>

            <div className="overflow-x-auto border rounded-[9px]" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-[11px] font-bold uppercase tracking-wider" style={{ borderColor: 'var(--border, #E2E8F0)', color: 'var(--ink-soft, #5B6B7C)' }}>
                    <th className="px-4 py-3 min-w-[160px]">Color / Shade</th>
                    {selectedSizes.map((size) => {
                      const szRate = getRateForIndividualSize(size, selectedArticle?.size_rates, selectedArticle?.stitching_rate)
                      return (
                        <th key={size} className="px-3 py-2.5 text-center min-w-[75px]">
                          <div className="font-bold text-slate-800">{size}</div>
                          {szRate > 0 && (
                            <div className="text-[10px] font-mono text-indigo-700 font-semibold mt-0.5">
                              ₹{szRate}/pc
                            </div>
                          )}
                        </th>
                      )
                    })}
                    <th className="px-4 py-3 text-right min-w-[90px]">Row Total</th>
                    <th className="px-3 py-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {colorRows.map((row) => {
                    const rowTotal = selectedSizes.reduce((acc, s) => acc + (row.quantities[s] || 0), 0)
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Color Input */}
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={row.color}
                            onChange={(e) => updateColorName(row.id, e.target.value)}
                            placeholder="e.g. Navy Blue, Black"
                            className="w-full px-2.5 py-1.5 border rounded-[6px] text-xs font-medium outline-none transition-colors"
                            style={{ borderColor: 'var(--border, #E2E8F0)' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'}
                            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'}
                          />
                        </td>

                        {/* Size Inputs */}
                        {selectedSizes.map((size) => (
                          <td key={size} className="px-3 py-2.5 text-center">
                            <input
                              type="number"
                              min="0"
                              value={row.quantities[size] || ''}
                              onChange={(e) => updateQuantity(row.id, size, parseInt(e.target.value, 10))}
                              placeholder="0"
                              className="w-16 px-2 py-1.5 border rounded-[6px] text-xs text-center font-bold font-mono outline-none transition-colors"
                              style={{ 
                                borderColor: 'var(--border, #E2E8F0)',
                                color: (row.quantities[size] || 0) > 0 ? 'var(--steel, #2B4C7E)' : 'var(--ink-soft, #5B6B7C)'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'
                                e.currentTarget.style.boxShadow = '0 0 0 2px var(--steel-mist, #EEF3FA)'
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'
                                e.currentTarget.style.boxShadow = 'none'
                              }}
                            />
                          </td>
                        ))}

                        {/* Row Subtotal */}
                        <td className="px-4 py-2.5 text-right font-bold font-mono text-[13px]" style={{ color: 'var(--steel, #2B4C7E)' }}>
                          {rowTotal} pcs
                        </td>

                        {/* Delete Row Button */}
                        <td className="px-3 py-2.5 text-center">
                          {colorRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeColorRow(row.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete color row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}

                  {/* Summary Totals Row */}
                  <tr className="bg-slate-50 font-bold border-t" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                    <td className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                      Total By Size:
                    </td>
                    {selectedSizes.map((size) => {
                      const colSum = colorRows.reduce((acc, r) => acc + (r.quantities[size] || 0), 0)
                      return (
                        <td key={size} className="px-3 py-3 text-center font-mono text-xs font-bold" style={{ color: 'var(--steel, #2B4C7E)' }}>
                          {colSum}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3 text-right font-bold font-mono text-sm" style={{ color: 'var(--steel-dark, #1F3A63)' }}>
                      {totalPieces} pcs
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Step 3: Material Checklist Card */}
        <div 
          className="bg-white rounded-[11px] p-5 sm:p-6 border shadow-xs space-y-4"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)] text-xs font-bold flex items-center justify-center">
                3
              </span>
              <div>
                <h2 className="text-[15px] font-bold font-[family-name:var(--font-heading)]" style={{ color: 'var(--ink, #1C2733)' }}>
                  BOM Raw Materials & Trims Checklist
                </h2>
                <p className="text-[11px] text-slate-500">
                  Specify material origin: Client / Buyer Consignment vs Factory In-House Sourcing
                </p>
                
            {/* Sourcing Summary Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                <Building2 className="w-3 h-3 text-sky-600" /> Client Supplied: {materials.filter(m => m.source !== 'FACTORY_STORE').length} items
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Boxes className="w-3 h-3 text-purple-600" /> Factory Sourced: {materials.filter(m => m.source === 'FACTORY_STORE').length} items
              </span>
            </div>

              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoGenerateBOM}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-bold transition-all shadow-xs cursor-pointer border"
              style={{
                backgroundColor: 'var(--green-mist, #E6F6EE)',
                borderColor: 'var(--green, #1F9D63)',
                color: 'var(--green, #1F9D63)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Calculate BOM from Matrix</span>
            </button>
          </div>

          {/* Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {materials.map((mat) => {
              const isChecked = mat.admin_issued
              return (
                <div
                  key={mat.id}
                  onClick={() => toggleMaterialIssued(mat.id)}
                  className={`p-3.5 rounded-[9px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-[var(--green-mist,#E6F6EE)] border-[var(--green,#1F9D63)]'
                      : 'bg-white border-[var(--border,#E2E8F0)] hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`block text-xs font-bold truncate ${isChecked ? 'text-slate-900' : 'text-slate-700'}`}>
                        {mat.item_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-medium text-slate-500">
                        Qty: <strong className="text-slate-700">{mat.required_qty}</strong>
                      </span>

                      {/* 1-Click Sourcing Toggle Badge */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMaterials(materials.map(m => m.id === mat.id ? { ...m, source: m.source === 'FACTORY_STORE' ? 'CLIENT' : 'FACTORY_STORE' } : m))
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[10.5px] font-semibold border transition-all cursor-pointer ${
                          mat.source === 'FACTORY_STORE'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                            : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                        }`}
                        title="Click to toggle between Client Supplied and Factory Sourced"
                      >
                        {mat.source === 'FACTORY_STORE' ? (
                          <>
                            <Boxes className="w-3 h-3 text-purple-600" />
                            <span>Factory Sourced</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3 text-sky-600" />
                            <span>Client Supplied</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        isChecked 
                          ? 'bg-[var(--green,#1F9D63)] text-white' 
                          : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeMaterial(mat.id)
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add Custom Material Inline Form & Quick Chips */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
                placeholder="Custom Material Name (e.g. Drawcord 45 inch, 18L Buttons, Neck Piping)"
                className="w-full sm:flex-5 px-3 py-2 text-xs border rounded-[7px] outline-none bg-white"
                style={{ borderColor: 'var(--border, #E2E8F0)' }}
              />
              <input
                type="text"
                value={newMaterialQty}
                onChange={(e) => setNewMaterialQty(e.target.value)}
                placeholder="Quantity / Unit (e.g. 3300 pcs, 25 kg, 200 Meters)"
                className="w-full sm:flex-3 px-3 py-2 text-xs border rounded-[7px] outline-none bg-white"
                style={{ borderColor: 'var(--border, #E2E8F0)' }}
              />
              <select
                value={newMaterialSource}
                onChange={(e) => setNewMaterialSource(e.target.value as any)}
                className="w-full sm:flex-3 px-2.5 py-2 text-xs font-semibold border rounded-[7px] bg-slate-50 outline-none cursor-pointer"
                style={{ borderColor: 'var(--border, #E2E8F0)' }}
              >
                <option value="CLIENT">Client Supplied (Buyer)</option>
                <option value="FACTORY_STORE">Factory Sourced (In-House)</option>
              </select>
              <button
                type="button"
                onClick={addCustomMaterial}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-[7px] border bg-white hover:bg-slate-50 transition-colors shrink-0 cursor-pointer shadow-xs"
                style={{ 
                  borderColor: 'var(--steel, #2B4C7E)',
                  color: 'var(--steel, #2B4C7E)'
                }}
              >
                + Add Custom Item
              </button>
            </div>

            {/* Quick Trim Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10.5px] text-slate-400 font-medium">Quick Presets:</span>
              {[
                { name: '18L 4-Hole Buttons', qty: totalPieces > 0 ? `${totalPieces * 4} pcs` : '1500 pcs' },
                { name: 'Elastic Waistband 1.5"', qty: totalPieces > 0 ? `${Math.ceil(totalPieces * 0.7)} Meters` : '300 Meters' },
                { name: 'Drawcord / Dori 45"', qty: totalPieces > 0 ? `${totalPieces} pcs` : '500 pcs' },
                { name: 'Metal Eyelets #4', qty: totalPieces > 0 ? `${totalPieces * 2} pcs` : '1000 pcs' },
                { name: 'Care & Wash Labels', qty: totalPieces > 0 ? `${totalPieces} pcs` : '500 pcs' },
                { name: 'Satin Neck Piping Tape', qty: '100 Meters' },
                { name: 'Desiccant Silica Gel', qty: totalPieces > 0 ? `${totalPieces} packets` : '500 packets' },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setNewMaterialName(preset.name)
                    setNewMaterialQty(preset.qty)
                  }}
                  className="px-2 py-0.5 rounded text-[10.5px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono transition-colors cursor-pointer"
                >
                  +{preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Alerts */}
        {error && (
          <div className="p-3.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Target allotment and BOM materials successfully issued to sewing floor!</span>
          </div>
        )}

        {/* Step 4: Submit Button (Solid Steel with checkmark icon) */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-3 rounded-[8px] text-[14.5px] font-semibold text-white flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: 'var(--steel, #2B4C7E)'
            }}
            onMouseEnter={(e) => {
              if (!isPending) e.currentTarget.style.backgroundColor = 'var(--steel-dark, #1F3A63)'
            }}
            onMouseLeave={(e) => {
              if (!isPending) e.currentTarget.style.backgroundColor = 'var(--steel, #2B4C7E)'
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assigning Target...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Assign Target ({totalPieces.toLocaleString()} pcs)</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
