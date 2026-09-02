
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
  Sparkles,
  Search,
  X,
  ChevronRight
} from 'lucide-react'


function expandGarmentSizeTier(sizeTier?: string): string[] {
  if (!sizeTier) return ['L', 'XL', 'XXL']
  const upper = sizeTier.trim().toUpperCase()

  if (upper === 'L/XXL' || upper === 'L-XXL' || upper === 'L/XL/XXL') {
    return ['L', 'XL', 'XXL']
  }
  if (upper === '22X26' || upper === '22-26' || upper === '22/26') {
    return ['22', '24', '26']
  }
  if (upper === '28X32' || upper === '28-32' || upper === '28/32') {
    return ['28', '30', '32']
  }
  if (upper === '16X20' || upper === '16-20' || upper === '16/20') {
    return ['16', '18', '20']
  }
  if (upper === 'S/M/L' || upper === 'S-L') {
    return ['S', 'M', 'L']
  }
  if (upper === 'M/L/XL' || upper === 'M-XL') {
    return ['M', 'L', 'XL']
  }
  if (upper === '2X6' || upper === '2X8') {
    return ['2', '4', '6']
  }
  if (upper.includes('/') || upper.includes(',')) {
    return upper.split(/[/,]/).map(s => s.trim()).filter(Boolean)
  }
  return [upper]
}

function expandGarmentColors(colorPattern?: string, challanBomItems: any[] = []): string[] {
  if (!colorPattern) return ['Mushroom', 'Dutch Blue', 'Scuba']
  const upper = colorPattern.trim()

  if (upper.match(/3\s*colou?r/i)) {
    const bomShades = (challanBomItems || [])
      .filter((b: any) => b.material_type === 'FABRIC' || !b.material_type || b.item_name?.toLowerCase().includes('roll') || b.lot_no)
      .map((b: any) => b.item_name?.replace(/fabric|roll|body/gi, '').trim())
      .filter((name: string) => name && !name.toLowerCase().includes('body + rib') && !name.toLowerCase().includes('rib'))

    if (bomShades.length >= 2) {
      return bomShades
    }
    return ['Mushroom', 'Dutch Blue', 'Scuba']
  }

  if (upper.includes('+')) {
    return upper.split('+').map(s => s.trim()).filter(Boolean)
  }
  if (upper.includes('/') || upper.includes(',')) {
    return upper.split(/[/,]/).map(s => s.trim()).filter(Boolean)
  }

  return [upper]
}

function parseAndExpandOrderSizes(sizeMatrix: any[]): { individualSizes: string[]; sizeQuantities: Record<string, number> } {
  const individualSizes: string[] = []
  const sizeQuantities: Record<string, number> = {}
  if (!sizeMatrix || sizeMatrix.length === 0) return { individualSizes: ['S', 'M', 'L', 'XL'], sizeQuantities: {} }
  for (const item of sizeMatrix) {
    const rawSize = (item.size || 'Free Size').trim()
    const totalPcs = Number(item.pcs) || (Number(item.sets) * (Number(item.ratio) || 1)) || 0
    if (rawSize.includes('/') || (rawSize.includes(',') && !rawSize.match(/\\d+X\\d+/i))) {
      const parts = rawSize.split(/[/,]/).map((s: string) => s.trim().toUpperCase()).filter(Boolean)
      if (parts.length > 0) {
        const perSizeQty = Math.round(totalPcs / parts.length)
        parts.forEach((p: string) => {
          if (!individualSizes.includes(p)) individualSizes.push(p)
          sizeQuantities[p] = (sizeQuantities[p] || 0) + perSizeQty
        })
        continue
      }
    }
    const cleanSize = rawSize.toUpperCase()
    if (!individualSizes.includes(cleanSize)) individualSizes.push(cleanSize)
    sizeQuantities[cleanSize] = (sizeQuantities[cleanSize] || 0) + totalPcs
  }
  return { individualSizes, sizeQuantities }
}

function parseOrderColors(bodyColorStr?: string, pantColorStr?: string): string[] {
  const colors = new Set<string>()
  if (bodyColorStr) {
    bodyColorStr.split(/[/,]/).map((s: string) => s.trim()).filter(Boolean).forEach((c: string) => colors.add(c))
  }
  if (pantColorStr) {
    pantColorStr.split(/[/,]/).map((s: string) => s.trim()).filter(Boolean).forEach((c: string) => colors.add(c))
  }
  return colors.size > 0 ? Array.from(colors) : ['Standard Color']
}

function expandTierSizes(sizeRates: Record<string, number>): string[] {
  const result: string[] = []
  for (const key of Object.keys(sizeRates)) { if (key.startsWith("_") || key === "_meta" || typeof sizeRates[key] !== "number") continue;
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
  for (const [tierKey, rate] of Object.entries(sizeRates)) { if (tierKey.startsWith("_") || typeof rate !== "number") continue;
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
  articles,
  productionOrders = [] 
}: { 
  linemen: Profile[], 
  managers?: Array<{ id: string; username: string; role?: string }>,
  articles: Article[]
  productionOrders?: any[]
}) {
  const [autoLoadedOrder, setAutoLoadedOrder] = useState<any>(null)
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

  // Target Selection Modal & Search State
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false)
  const [targetSearchQuery, setTargetSearchQuery] = useState('')
  const [selectedTargetSummary, setSelectedTargetSummary] = useState<{
    title: string
    subtitle: string
    totalPcs: number
    badgeColor: string
    themeBg: string
  } | null>(null)

  // Pre-calculate smart Challan & Color Line options from productionOrders
  const smartChallanOptions = useMemo(() => {
    const opts: Array<{
      key: string
      challanId: string
      type: 'COLOR_LINE' | 'FULL_CHALLAN'
      colorName?: string
      challanNo: string
      brand: string
      fabricType: string
      deliveryDate?: string
      totalPcs: number
      sizeBreakdown: Record<string, number>
      assignedLinemanId?: string
      bomDetails: any[]
      primaryArticleId?: string
      label: string
    }> = []

    const normalizeColor = (raw: string): string => {
      const c = raw.trim().toUpperCase().replace(/\s+/g, ' ')
      if (c.includes('MUSHROOM')) return 'MUSHROOM'
      if (c.includes('DUTCH')) return 'DUTCH BLUE'
      if (c.includes('SCUBA') || c.includes('SEUBA')) return 'SCUBA'
      return c
    }

    (productionOrders || []).forEach((ch: any) => {
      const chArticles: any[] = ch.articles || []
      if (chArticles.length === 0) return

      const firstArtCode = (chArticles[0]?.art_no || '').trim().toUpperCase()
      const matchedDbArt = articles.find(a => a.art_no?.trim().toUpperCase() === firstArtCode) || articles[0]

      const colorMap: Record<string, { totalPcs: number; sizeBreakdown: Record<string, number>; assignedLinemanId?: string }> = {
        'MUSHROOM': { totalPcs: 0, sizeBreakdown: {} },
        'DUTCH BLUE': { totalPcs: 0, sizeBreakdown: {} },
        'SCUBA': { totalPcs: 0, sizeBreakdown: {} }
      }

      chArticles.forEach((art: any) => {
        const patternRaw = (art.color_pattern || art.description || '').toUpperCase()
        const sizeTier = art.size_range || 'L/XXL'
        const totalPcs = Number(art.total_pcs) || 0

        const matchedSet = new Set<string>()
        if (patternRaw.includes('3 COLOUR') || patternRaw.includes('3 COLOR') || patternRaw.includes('ALL')) {
          matchedSet.add('MUSHROOM')
          matchedSet.add('DUTCH BLUE')
          matchedSet.add('SCUBA')
        } else {
          if (patternRaw.includes('MUSHROOM')) matchedSet.add('MUSHROOM')
          if (patternRaw.includes('DUTCH')) matchedSet.add('DUTCH BLUE')
          if (patternRaw.includes('SCUBA') || patternRaw.includes('SEUBA')) matchedSet.add('SCUBA')
        }

        const matchedColors = Array.from(matchedSet)
        if (matchedColors.length > 0) {
          const pcsPerColor = Math.round(totalPcs / matchedColors.length)
          matchedColors.forEach(cName => {
            if (!colorMap[cName]) {
              colorMap[cName] = { totalPcs: 0, sizeBreakdown: {} }
            }
            colorMap[cName].totalPcs += pcsPerColor
            colorMap[cName].sizeBreakdown[sizeTier] = (colorMap[cName].sizeBreakdown[sizeTier] || 0) + pcsPerColor
            if (art.assigned_lineman_id) {
              colorMap[cName].assignedLinemanId = art.assigned_lineman_id
            }
          })
        }
      })

      // Add Color line options
      Object.entries(colorMap).forEach(([cName, data]) => {
        if (data.totalPcs > 0) {
          const icon = cName === 'MUSHROOM' ? '🟤' : cName === 'DUTCH BLUE' ? '🔵' : '🟢'
          opts.push({
            key: `COLOR_${cName}_${ch.id}`,
            challanId: ch.id,
            type: 'COLOR_LINE',
            colorName: cName,
            challanNo: ch.challan_no,
            brand: ch.brand,
            fabricType: ch.fabric_type,
            deliveryDate: ch.delivery_date,
            totalPcs: data.totalPcs,
            sizeBreakdown: data.sizeBreakdown,
            assignedLinemanId: data.assignedLinemanId,
            bomDetails: ch.bom_details || [],
            primaryArticleId: matchedDbArt?.id || '',
            label: `${icon} ${ch.challan_no} (${ch.brand}) • ${cName} LINE — ${data.totalPcs.toLocaleString()} Pcs`
          })
        }
      })

      // Add Full Challan Option
      opts.push({
        key: `FULL_CHALLAN_${ch.id}`,
        challanId: ch.id,
        type: 'FULL_CHALLAN',
        challanNo: ch.challan_no,
        brand: ch.brand,
        fabricType: ch.fabric_type,
        deliveryDate: ch.delivery_date,
        totalPcs: ch.total_pcs || 0,
        sizeBreakdown: {},
        bomDetails: ch.bom_details || [],
        primaryArticleId: matchedDbArt?.id || '',
        label: `⚡ ${ch.challan_no} (${ch.brand}) • ENTIRE CHALLAN — ${(ch.total_pcs || 0).toLocaleString()} Pcs`
      })
    })

    return opts
  }, [productionOrders, articles])

  // Filtered standalone articles (exclude fragmented sub-articles)
  const standaloneArticles = useMemo(() => {
    return articles.filter(a => {
      const art = (a.art_no || '').trim().toUpperCase()
      if (art.startsWith('9433/') || art.startsWith('9433A/') || art.startsWith('9433B/')) return false
      if (art === '9433A' || art === '9433B') return false
      return true
    })
  }, [articles])

  // Filtered Challans for Modal
  const filteredChallans = useMemo(() => {
    const q = targetSearchQuery.trim().toLowerCase()
    if (!q) return productionOrders || []
    return (productionOrders || []).filter((ch: any) => {
      const chNo = (ch.challan_no || '').toLowerCase()
      const brand = (ch.brand || '').toLowerCase()
      const fabric = (ch.fabric_type || '').toLowerCase()
      const hasMatchingArt = (ch.articles || []).some((a: any) => 
        (a.art_no || '').toLowerCase().includes(q) ||
        (a.color_pattern || '').toLowerCase().includes(q) ||
        (a.size_range || '').toLowerCase().includes(q)
      )
      return chNo.includes(q) || brand.includes(q) || fabric.includes(q) || hasMatchingArt
    })
  }, [productionOrders, targetSearchQuery])

  // Filtered Standalone Articles for Modal
  const filteredStandaloneArticles = useMemo(() => {
    const q = targetSearchQuery.trim().toLowerCase()
    if (!q) return standaloneArticles
    return standaloneArticles.filter((a: any) => {
      const art = (a.art_no || '').toLowerCase()
      const desc = (a.description || '').toLowerCase()
      return art.includes(q) || desc.includes(q)
    })
  }, [standaloneArticles, targetSearchQuery])

  // Apply Target Selection Handler
  const applySmartTarget = (smartOpt: any) => {
    setArticleId(smartOpt.key)
    setTouchedArticle(true)
    setAutoLoadedOrder(null)

    const challanRef = smartOpt.challanNo.startsWith('JOB-') ? smartOpt.challanNo : `JOB-${smartOpt.challanNo}`
    setProductionOrderNo(smartOpt.colorName ? `${challanRef}-${smartOpt.colorName}` : challanRef)
    setClientChallanNo(challanRef)

    if (smartOpt.deliveryDate) setDueDate(smartOpt.deliveryDate)
    if (smartOpt.assignedLinemanId) {
      setLinemanId(smartOpt.assignedLinemanId)
      setTouchedLineman(true)
    }

    if (smartOpt.type === 'COLOR_LINE' && smartOpt.colorName) {
      const tierEntries = Object.entries(smartOpt.sizeBreakdown)
      const allIndividualSizes: string[] = []
      const perCellQtys: Record<string, number> = {}

      tierEntries.forEach(([tierName, tierPcs]: [string, any]) => {
        const subSizes = expandGarmentSizeTier(tierName)
        const perSubSizeQty = Math.round(Number(tierPcs) / (subSizes.length || 1))
        subSizes.forEach(s => {
          if (!allIndividualSizes.includes(s)) allIndividualSizes.push(s)
          perCellQtys[s] = perSubSizeQty
        })
      })

      setSelectedSizes(allIndividualSizes)
      setColorRows([
        {
          id: '1',
          color: smartOpt.colorName,
          quantities: perCellQtys
        }
      ])

      const colorLower = smartOpt.colorName.toLowerCase()
      let themeColor = '#854D0E'
      let themeBg = '#FEFCE8'
      if (colorLower.includes('dutch') || colorLower.includes('blue')) {
        themeColor = '#1D4ED8'
        themeBg = '#EFF6FF'
      } else if (colorLower.includes('scuba') || colorLower.includes('green') || colorLower.includes('seuba')) {
        themeColor = '#047857'
        themeBg = '#ECFDF5'
      }

      setSelectedTargetSummary({
        title: `${smartOpt.challanNo} (${smartOpt.brand}) • ${smartOpt.colorName} LINE`,
        subtitle: `${allIndividualSizes.length} Sizes (${allIndividualSizes.join(', ')}) • Continuous Sewing`,
        totalPcs: smartOpt.totalPcs,
        badgeColor: themeColor,
        themeBg: themeBg
      })

      // BOM Checklist
      const newMaterials: any[] = [
        {
          id: 'mat_fab_' + Date.now(),
          item_name: `${smartOpt.colorName} Fabric Lot (${smartOpt.fabricType || 'Sinker'})`,
          required_qty: 'As per roll marker',
          admin_issued: true,
          source: 'CLIENT' as const
        },
        {
          id: 'mat_thread_' + Date.now(),
          item_name: `Matching Sewing Thread (${smartOpt.colorName})`,
          required_qty: `${Math.max(Math.ceil(smartOpt.totalPcs / 250), 4)} Cones`,
          admin_issued: true,
          source: 'FACTORY_STORE' as const
        },
        {
          id: 'mat_neck_' + Date.now(),
          item_name: `${smartOpt.brand} Main Neck Labels`,
          required_qty: `${smartOpt.totalPcs.toLocaleString()} pcs`,
          admin_issued: false,
          source: 'CLIENT' as const
        },
        {
          id: 'mat_size_' + Date.now(),
          item_name: `Size Labels (${allIndividualSizes.join(', ')})`,
          required_qty: `${smartOpt.totalPcs.toLocaleString()} pcs`,
          admin_issued: false,
          source: 'CLIENT' as const
        },
        {
          id: 'mat_poly_' + Date.now(),
          item_name: `Master Polybags`,
          required_qty: `${smartOpt.totalPcs.toLocaleString()} pcs`,
          admin_issued: false,
          source: 'CLIENT' as const
        }
      ]
      setMaterials(newMaterials)
    } else if (smartOpt.type === 'FULL_CHALLAN') {
      const allSizes = ['L', 'XL', 'XXL', '22', '24', '26', '28', '30', '32']
      setSelectedSizes(allSizes)
      setColorRows([
        { id: '1', color: 'MUSHROOM', quantities: { 'L': 253, 'XL': 253, 'XXL': 253, '22': 162, '24': 162, '26': 162, '28': 79, '30': 79, '32': 79 } },
        { id: '2', color: 'DUTCH BLUE', quantities: { 'L': 205, 'XL': 205, 'XXL': 205, '22': 138, '24': 138, '26': 138, '28': 79, '30': 79, '32': 79 } },
        { id: '3', color: 'SCUBA', quantities: { 'L': 192, 'XL': 192, 'XXL': 192, '22': 124, '24': 124, '26': 124, '28': 64, '30': 64, '32': 64 } }
      ])
      setSelectedTargetSummary({
        title: `${smartOpt.challanNo} (${smartOpt.brand}) • ENTIRE CHALLAN BATCH`,
        subtitle: `All Colors (Mushroom, Dutch Blue, Scuba) & 9 Sizes Combined`,
        totalPcs: smartOpt.totalPcs,
        badgeColor: '#0F172A',
        themeBg: '#F8FAFC'
      })
    }

    setIsTargetModalOpen(false)
  }

  const applyStandaloneArticle = (chosenArt: any) => {
    setArticleId(chosenArt.id)
    setTouchedArticle(true)
    setAutoLoadedOrder(null)

    const chosenMeta = (chosenArt.size_rates as any)?._meta || {}
    const sizeTier = chosenMeta.size || 'L/XXL'
    const expandedSizes = expandGarmentSizeTier(sizeTier)
    setSelectedSizes(expandedSizes)

    const colorPattern = chosenMeta.color || chosenArt.description || 'Standard Color'
    const colorList = expandGarmentColors(colorPattern, [])

    const newColorRows = colorList.map((colName, cIdx) => ({
      id: (cIdx + 1).toString(),
      color: colName,
      quantities: Object.fromEntries(expandedSizes.map(s => [s, 0]))
    }))
    setColorRows(newColorRows)

    setSelectedTargetSummary({
      title: `Article ${chosenArt.art_no}`,
      subtitle: cleanArticleDesc(chosenArt.description) || 'Factory Standalone Catalog Style',
      totalPcs: 0,
      badgeColor: '#4F46E5',
      themeBg: '#EEF2FF'
    })

    setIsTargetModalOpen(false)
  }

  // Selected article details
  const selectedArticle = useMemo(() => {
    const smartOpt = smartChallanOptions.find(o => o.key === articleId)
    if (smartOpt) {
      return articles.find(a => a.id === smartOpt.primaryArticleId) || articles[0]
    }
    return articles.find(a => a.id === articleId)
  }, [articles, articleId, smartChallanOptions])

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


function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } else {
          resolve(e.target?.result as string)
        }
      }
      img.onerror = () => resolve(e.target?.result as string)
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

  // Multi-Sample Photo Handlers (Up to 4 with Auto-Compression)
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const selected = Array.from(files).slice(0, 4 - samplePhotos.length)
    for (const file of selected) {
      try {
        const compressedBase64 = await compressImage(file)
        if (compressedBase64) {
          setSamplePhotos(prev => prev.length < 4 ? [...prev, compressedBase64] : prev)
        }
      } catch (_) {}
    }
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

    const smartOpt = smartChallanOptions.find(o => o.key === articleId)
    const targetDbArticleId = smartOpt ? (smartOpt.primaryArticleId || articles[0]?.id) : articleId

    if (!linemanId || !targetDbArticleId) {
      setError('Please select both a Lineman and an Article / Job Target.')
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
      article_id: targetDbArticleId,
      target_qty: totalPieces,
      production_order_no: productionOrderNo.trim() || `PO-${Date.now().toString().slice(-6)}`,
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
    <div className="space-y-6">
      
      {/* 2. Page Header Card */}
      <div 
        className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10"
          >
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Target Allotments & Material Handover
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Assign cut-to-sew size-color ratios & verify raw materials issue
            </p>
          </div>
        </div>

        {/* Grand Target Metric & Progress Bar */}
        <div className="w-full sm:w-auto flex flex-col sm:items-end bg-slate-50/70 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Grand Target:
            </span>
            <span 
              className="text-[28px] sm:text-[30px] font-bold font-[family-name:var(--font-heading)] leading-none text-[#3A3564]"
            >
              {totalPieces.toLocaleString()} <span className="text-sm font-normal text-slate-500">pcs</span>
            </span>
          </div>

          {/* 6px Thin Progress Track */}
          <div 
            className="w-full sm:w-44 h-1.5 rounded-full mt-2.5 overflow-hidden bg-slate-100 border border-black/5"
          >
            <div 
              className="h-full rounded-full transition-all duration-300 bg-[#3A3564]"
              style={{ 
                width: totalPieces > 0 ? '100%' : '0%'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Allotment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Lineman & Article Selection Card */}
        <div 
          className="bg-white rounded-2xl p-6 sm:p-7 border border-black/10 shadow-2xs"
        >
          <div className="flex items-center gap-2.5 mb-5 pb-3.5 border-b border-slate-100">
            <span className="w-7 h-7 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 text-xs font-bold font-mono flex items-center justify-center">
              1
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Select Floor Lineman & Style Article
            </h2>
          </div>

          
          {/* Row 0: Production Order # & Priority Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 pb-5 border-b border-slate-100">
            
            {/* Production Manager Dropdown from Registered Employees */}
            <div className="space-y-1.5">
              <label 
                htmlFor="manager_name" 
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Production Manager (Allotted By) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="manager_name"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3.5 text-sm font-medium rounded-xl border border-slate-200 transition-all outline-none bg-slate-50/70 hover:bg-white focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 text-slate-900 cursor-pointer"
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
                <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-xs text-slate-400">
                Select from registered Production Managers in Employee list.
              </p>
            </div>

            {/* Order Urgency / Priority */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Production Urgency & Priority
              </label>
              <div className="grid grid-cols-3 gap-2.5 pt-0.5">
                {[
                  { key: 'NORMAL', label: 'Normal', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' },
                  { key: 'RUSH', label: 'Rush Order', color: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' },
                  { key: 'CRITICAL', label: 'Critical / Export', color: 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100' },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key as any)}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      priority === p.key ? 'ring-2 ring-offset-1 ring-slate-900 font-extrabold shadow-2xs ' + p.color : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    {p.key === 'CRITICAL' && <Flame className="w-3.5 h-3.5 text-rose-600" />}
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Sets high-priority alert badges on the Lineman and QC dashboard.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Lineman Field with Error/Success validation */}
            <div className="space-y-1.5">
              <label 
                htmlFor="lineman_id" 
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
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
                className={`w-full py-2.5 px-3.5 text-sm font-medium rounded-xl border transition-all outline-none bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 cursor-pointer ${
                  isLinemanError
                    ? 'border-rose-400 bg-rose-50/50'
                    : isLinemanSuccess
                    ? 'border-emerald-400'
                    : 'border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10'
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
                <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>This field is required before assigning target.</span>
                </div>
              )}
              {isLinemanSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Lineman selected & active on sewing floor.</span>
                </div>
              )}
            </div>

            {/* Interactive Target Selector (Sleek 44px Enterprise Input) */}
            <div className="space-y-1.5">
              <label 
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Style Article / Job Color Line <span className="text-red-500">*</span>
              </label>

              {!selectedTargetSummary && !articleId ? (
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(true)}
                  className={`w-full py-2.5 px-3.5 text-sm rounded-xl border transition-all flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-white text-left group cursor-pointer shadow-2xs hover:shadow-xs ${
                    isArticleError
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-200 hover:border-[#3A3564] focus:border-[#3A3564]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-slate-500 group-hover:text-slate-700">
                    <Search className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-[#3A3564] transition-colors" />
                    <span className="text-sm font-medium truncate">
                      Search or choose Style Article / Job Challan...
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-white group-hover:bg-[#FAF7F0] border border-slate-200 group-hover:border-black/15 text-slate-700 group-hover:text-[#3A3564] text-xs font-bold transition-colors shrink-0 flex items-center gap-1">
                    <span>Browse</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ) : (
                <div
                  className="w-full py-2 px-3 text-sm rounded-xl border transition-all flex items-center justify-between gap-2 bg-white shadow-2xs"
                  style={{
                    borderColor: selectedTargetSummary?.badgeColor || '#3A3564'
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white shadow-2xs"
                      style={{ backgroundColor: selectedTargetSummary?.badgeColor || '#3A3564' }}
                    />
                    <span className="font-extrabold text-sm text-slate-900 truncate">
                      {selectedTargetSummary?.title || selectedArticle?.art_no}
                    </span>
                    {selectedTargetSummary?.totalPcs ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FAF7F0] border border-black/10 text-[#3A3564] font-mono shrink-0">
                        {selectedTargetSummary.totalPcs.toLocaleString()} Pcs
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTargetModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#FAF7F0] border border-slate-200 hover:border-black/15 text-slate-700 hover:text-[#3A3564] text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>🔄 Change</span>
                  </button>
                </div>
              )}

              {/* Validation Messages */}
              {isArticleError && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Please select an Article or Color Line before submitting.</span>
                </div>
              )}
              {isArticleSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>
                    {articleId.startsWith('COLOR_') 
                      ? '✓ Smart Color Line Target & BOM Checklist auto-configured from Challan' 
                      : articleId.startsWith('FULL_CHALLAN_')
                      ? '✓ Full Challan Batch Matrix loaded'
                      : '✓ Style target loaded'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* GLASSMORPHIC FULL-SCREEN TARGET SELECTION MODAL           */}
          {/* ========================================================= */}
          {isTargetModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
              <div 
                className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                        Select Production Target / Color Line
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                          Visual Picker
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        1-Click selects color sewing line or full batch and auto-populates exact size ratios
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTargetModalOpen(false)}
                    className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Close (Esc)</span>
                  </button>
                </div>

                {/* Live Search Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={targetSearchQuery}
                      onChange={e => setTargetSearchQuery(e.target.value)}
                      placeholder="Search by article number, brand, color, or challan (e.g. 9433, Ollypop, Mushroom, 457)..."
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium bg-white border border-slate-300 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                    />
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    {targetSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTargetSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Modal Scrollable Body */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                  {/* Active Job Work Challans */}
                  {filteredChallans && filteredChallans.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                        <Boxes className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Active Job Work Delivery Challans ({filteredChallans.length})
                        </h4>
                      </div>

                      {filteredChallans.map((ch: any) => {
                        const challanOpts = smartChallanOptions.filter(o => o.challanId === ch.id)
                        const colorLines = challanOpts.filter(o => o.type === 'COLOR_LINE')
                        const fullChallan = challanOpts.find(o => o.type === 'FULL_CHALLAN')

                        return (
                          <div
                            key={ch.id}
                            className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3.5"
                          >
                            {/* Challan Card Top Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono shadow-2xs">
                                  📋 JOB #{ch.challan_no}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {ch.brand}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  {ch.fabric_type}
                                </span>
                              </div>

                              <div className="text-xs font-bold text-slate-700 font-mono">
                                <span className="text-indigo-700 font-extrabold">{ch.total_sets?.toLocaleString() || 0}</span> Sets <span className="text-slate-300">|</span> <span className="text-emerald-700 font-black">{ch.total_pcs?.toLocaleString() || 0} Pcs Total</span>
                              </div>
                            </div>

                            {/* Visual Grid of Color Line Cards + Full Batch */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {/* Color Line Cards */}
                              {colorLines.map((colOpt, cIdx) => {
                                const colorLower = (colOpt.colorName || '').toLowerCase()
                                let themeColor = '#854D0E'
                                let bgLight = '#FEFCE8'
                                let borderTheme = '#FEF08A'
                                if (colorLower.includes('dutch') || colorLower.includes('blue')) {
                                  themeColor = '#1D4ED8'
                                  bgLight = '#EFF6FF'
                                  borderTheme = '#BFDBFE'
                                } else if (colorLower.includes('scuba') || colorLower.includes('green') || colorLower.includes('seuba')) {
                                  themeColor = '#047857'
                                  bgLight = '#ECFDF5'
                                  borderTheme = '#A7F3D0'
                                }

                                return (
                                  <div
                                    key={cIdx}
                                    style={{ backgroundColor: bgLight, borderColor: borderTheme }}
                                    className="border-2 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-black/5">
                                        <div className="flex items-center gap-2">
                                          <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs ring-2 ring-white" style={{ backgroundColor: themeColor }} />
                                          <span className="font-extrabold text-xs text-slate-900 uppercase tracking-tight">
                                            {colOpt.colorName}
                                          </span>
                                        </div>
                                        <span
                                          style={{ color: themeColor }}
                                          className="text-xs font-black font-mono px-2 py-0.5 bg-white/90 rounded-md border border-slate-200/80 shadow-2xs"
                                        >
                                          {colOpt.totalPcs.toLocaleString()} PCS
                                        </span>
                                      </div>

                                      {/* Size breakdown list */}
                                      <div className="space-y-1 mb-3 bg-white/70 rounded-lg p-2 border border-slate-200/60 text-[11px]">
                                        {Object.entries(colOpt.sizeBreakdown).map(([sz, count], sIdx) => (
                                          <div key={sIdx} className="flex items-center justify-between text-slate-700">
                                            <span className="font-semibold">Tier {sz}:</span>
                                            <span className="font-bold text-slate-900 font-mono">{count} pcs</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => applySmartTarget(colOpt)}
                                      style={{ backgroundColor: themeColor }}
                                      className="w-full py-2 text-white text-xs font-extrabold rounded-lg shadow-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                      <span>👉 Select {colOpt.colorName}</span>
                                    </button>
                                  </div>
                                )
                              })}

                              {/* Full Batch Card */}
                              {fullChallan && (
                                <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all text-white">
                                  <div>
                                    <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-slate-700">
                                      <div className="flex items-center gap-1.5">
                                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                                        <span className="font-black text-xs text-white uppercase tracking-tight">
                                          FULL BATCH
                                        </span>
                                      </div>
                                      <span className="text-xs font-black font-mono px-2 py-0.5 bg-amber-400 text-slate-950 rounded-md">
                                        {fullChallan.totalPcs.toLocaleString()} PCS
                                      </span>
                                    </div>

                                    <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 mb-3 text-[11px] text-slate-300">
                                      <span>All colors & sizes combined to 1 Lineman</span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => applySmartTarget(fullChallan)}
                                    className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-lg shadow-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                                    <span>Select Entire Batch</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Standalone Articles Section */}
                  {filteredStandaloneArticles && filteredStandaloneArticles.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                        <Tag className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Other In-House / Standalone Styles ({filteredStandaloneArticles.length})
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredStandaloneArticles.map((art: any) => {
                          let rateTag = ''
                          if (art.size_rates && typeof art.size_rates === 'object') {
                            const rts = Object.entries(art.size_rates).filter(([k, v]) => !k.startsWith('_') && typeof v === 'number' && !isNaN(v) && v > 0).map(([, v]) => v as number)
                            if (rts.length > 0) {
                              const min = Math.min(...rts)
                              const max = Math.max(...rts)
                              rateTag = min === max ? `₹${min}/pc` : `₹${min} - ₹${max}/pc`
                            }
                          } else if (art.stitching_rate) {
                            rateTag = `₹${art.stitching_rate}/pc`
                          }

                          return (
                            <div
                              key={art.id}
                              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="font-extrabold text-xs text-slate-900 font-mono">
                                    {art.art_no}
                                  </span>
                                  {rateTag && (
                                    <span className="text-[10.5px] font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 font-mono">
                                      {rateTag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                                  {cleanArticleDesc(art.description) || 'Standard Article Style'}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => applyStandaloneArticle(art)}
                                className="w-full py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>Select Style</span>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty state if nothing matches search */}
                  {filteredChallans.length === 0 && filteredStandaloneArticles.length === 0 && (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">No matching orders or styles found</h4>
                      <p className="text-xs text-slate-500 mt-1">Try searching with a different keyword like 9433, Ollypop, or Mushroom</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PPC Target Deadlines & Calculated Line Speed */}
          <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Target Due Date */}
            <div className="space-y-1.5">
              <label htmlFor="due_date" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Completion Due Date
              </label>
              <div className="relative">
                <input
                  id="due_date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 outline-none text-slate-900 transition-all"
                />
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Target Production Hours / Shifts */}
            <div className="space-y-1.5">
              <label htmlFor="target_hours" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
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
                  className="w-full py-2.5 pl-10 pr-3 text-sm font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 outline-none text-slate-900 transition-all"
                />
                <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Live PPC Run-Rate Card */}
            <div className="p-3.5 bg-gradient-to-br from-[#FAF7F0] to-[#FAF7F0]/40 rounded-xl border border-black/10 flex items-center justify-between shadow-2xs">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#3A3564]">
                  Target Line Speed (PPC)
                </span>
                <span className="text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-0.5 block">
                  {targetRunRate} <span className="text-xs font-medium text-slate-500">pcs / hour</span>
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  ≈ {Math.ceil(targetRunRate * 8)} pcs / shift
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                <Gauge className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Client Challan & Golden Sample Reference Photos */}
          <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Client Delivery Challan # */}
            <div className="space-y-1.5">
              <label 
                htmlFor="client_challan_no" 
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
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
                  className="w-full py-2.5 pl-10 pr-3.5 text-sm rounded-xl border border-slate-200 transition-all outline-none bg-slate-50/70 hover:bg-white focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 font-mono text-slate-900"
                />
                <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <p className="text-xs text-slate-400">
                Official delivery challan number provided by the ordering brand company.
              </p>
            </div>

            {/* Buyer Golden Sample Photos (Up to 4) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Buyer Sample Photos ({samplePhotos.length}/4)
                </label>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPhotoInputMode('upload')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${photoInputMode === 'upload' ? 'bg-[#3A3564] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoInputMode('url')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${photoInputMode === 'url' ? 'bg-[#3A3564] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Paste URL
                  </button>
                </div>
              </div>

              {/* Upload Input or URL Input */}
              {samplePhotos.length < 4 && (
                <div>
                  {photoInputMode === 'upload' ? (
                    <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-sm text-slate-600 border-slate-300">
                      <Camera className="w-4 h-4 text-[#3A3564]" />
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
                        className="flex-1 py-2 px-3.5 text-sm rounded-xl border border-slate-300 bg-white outline-none focus:border-[#3A3564]"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        className="px-4 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
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
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                      <img src={photo} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-[10px] text-white rounded font-mono">
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
          className="bg-white rounded-2xl p-6 sm:p-7 border border-black/10 shadow-2xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 text-xs font-bold font-mono flex items-center justify-center">
                2
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Size & Color Ratio Matrix
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
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

        {/* Step 4: Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs bg-[#3A3564] hover:bg-[#2A2649] cursor-pointer"
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
