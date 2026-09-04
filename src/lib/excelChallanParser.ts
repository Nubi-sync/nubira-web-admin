import * as XLSX from 'xlsx'

export interface ParsedChallanData {
  header: {
    challan_no: string
    brand: string
    challan_date: string
    fabric_type: string
    delivery_date: string
    sample_given: boolean
    notes: string
  }
  articleLines: Array<{
    art_no: string
    sub_art_no: string
    pattern_no: string
    category: string
    product: string
    description: string
    color_pattern: string
    size_range: string
    order_qty: number | string
    sets: number | string
    pcs_per_set: number | string
    total_pcs: number | string
    assigned_lineman_id: string
    status: string
  }>
  bomItems: Array<{
    material_type: string
    item_name: string
    lot_no: string
    required_qty: number | string
    unit?: string
    status: string
  }>
  summary: {
    lineCount: number
    totalOrderQty: number
    totalSets: number
    totalPcs: number
  }
}

/**
 * Generates and triggers download of Sir's clean Delivery Challan Excel template (.xlsx)
 * Features exact 9 columns: DATE, CHALLAN NO, ART NO, COLOUR, CATEGORY, PRODUCT, SIZE, ORDER QNTY, CHALLAN QNTY, STATUS
 * Includes clean prefilled sample rows matching factory production lots.
 */
export function downloadCleanChallanTemplate() {
  const headers = [
    'DATE',
    'CHALLAN NO',
    'ART NO',
    'COLOUR',
    'CATEGORY',
    'PRODUCT',
    'SIZE',
    'ORDER QNTY',
    'CHALLAN QNTY',
    'STATUS'
  ]

  // 100% Clean Template: Zero dummy/mock data, ready for immediate data entry
  const templateRows = [
    headers,
    ['', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '']
  ]

  const ws = XLSX.utils.aoa_to_sheet(templateRows)

  // Set professional column widths
  ws['!cols'] = [
    { wch: 14 }, // DATE
    { wch: 16 }, // CHALLAN NO
    { wch: 14 }, // ART NO
    { wch: 18 }, // COLOUR
    { wch: 16 }, // CATEGORY
    { wch: 16 }, // PRODUCT
    { wch: 12 }, // SIZE
    { wch: 14 }, // ORDER QNTY
    { wch: 16 }, // CHALLAN QNTY
    { wch: 14 }  // STATUS
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Delivery Challan Entry')

  XLSX.writeFile(wb, 'Delivery_Challan_Template.xlsx')
}

export interface ParsedSingleArticleLine {
  art_no: string
  sub_art_no: string
  pattern_no: string
  category: string
  product: string
  description: string
  color_pattern: string
  size_range: string
  order_qty: number | string
  sets: number | string
  pcs_per_set: number | string
  total_pcs: number | string
  assigned_lineman_id: string
  status: string
}

export interface ParsedSingleBomItem {
  material_type: string
  item_name: string
  lot_no: string
  required_qty: number | string
  unit?: string
  status: string
}

export interface ParsedMultiChallanGroup {
  challan_no: string
  challan_date: string
  brand: string
  fabric_type: string
  delivery_date: string
  sample_given: boolean
  notes: string
  total_sets: number
  total_pcs: number
  articles_summary: string[]
  colors_summary: string[]
  articleLines: ParsedSingleArticleLine[]
  bomItems: ParsedSingleBomItem[]
}

export interface ParsedMultiChallanResult {
  isMultiChallan: boolean
  challans: ParsedMultiChallanGroup[]
  totalChallans: number
  grandTotalPcs: number
  grandTotalLines: number
}

/**
 * Normalizes an object key by removing special characters, underscores, and extra spaces.
 */
function cleanKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Formats Excel dates (handles serial numbers, DD-MM-YYYY, DD/MM/YYYY, and standard ISO formats).
 */
function formatExcelDate(dateVal: any): string {
  if (!dateVal) return ''

  // If number (Excel serial date number)
  const num = typeof dateVal === 'number' ? dateVal : Number(dateVal)
  if (!isNaN(num) && (typeof dateVal === 'number' || (!String(dateVal).includes('-') && !String(dateVal).includes('/')))) {
    if (num > 20000 && num < 70000) {
      const date = new Date(Math.round((num - 25569) * 86400 * 1000))
      if (!isNaN(date.getTime())) {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        if (y >= 1990 && y <= 2099) {
          return `${y}-${m}-${d}`
        }
      }
    }
  }

  const str = String(dateVal).trim()
  if (!str) return ''

  // If already YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10)
    const m = isoMatch[2].padStart(2, '0')
    const d = isoMatch[3].padStart(2, '0')
    if (y >= 1990 && y <= 2099) {
      return `${y}-${m}-${d}`
    }
  }

  // If DD-MM-YYYY or DD/MM/YYYY
  const parts = str.split(/[-/.]/)
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      const d = parts[0]
      const m = parts[1]
      const y = parseInt(parts[2], 10)
      if (y >= 1990 && y <= 2099) {
        return `${y}-${m}-${d}`
      }
    }
    if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
      const y = parseInt(parts[0], 10)
      const m = parts[1]
      const d = parts[2]
      if (y >= 1990 && y <= 2099) {
        return `${y}-${m}-${d}`
      }
    }
  }

  const parsed = new Date(str)
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear()
    const m = String(parsed.getMonth() + 1).padStart(2, '0')
    const d = String(parsed.getDate()).padStart(2, '0')
    if (y >= 1990 && y <= 2099) {
      return `${y}-${m}-${d}`
    }
  }

  return ''
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file and groups data by CHALLAN NO.
 * Seamlessly handles single or multi-challan master sheets with multiple articles and color matrices.
 */
export async function parseMultiChallanExcelFile(file: File): Promise<ParsedMultiChallanResult> {
  const arrayBuffer = await file.arrayBuffer()
  const wb = XLSX.read(arrayBuffer, { type: 'array' })

  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new Error('The selected Excel file contains no sheets.')
  }

  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The Excel file is empty. Please enter data before importing.')
  }

  // Map to group rows by Challan No while preserving order
  const challanGroupsMap = new Map<string, {
    challanNo: string
    rawRows: Record<string, any>[]
  }>()

  let lastActiveChallanNo = ''

  for (const rawRow of rawRows) {
    // Create normalized key map
    const rowMap: Record<string, any> = {}
    let hasAnyData = false
    for (const [key, val] of Object.entries(rawRow)) {
      const cK = cleanKey(key)
      rowMap[cK] = val
      if (val !== undefined && val !== '') hasAnyData = true
    }

    if (!hasAnyData) continue

    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        const cleaned = cleanKey(k)
        if (rowMap[cleaned] !== undefined && rowMap[cleaned] !== '') {
          return String(rowMap[cleaned]).trim()
        }
      }
      return ''
    }

    let rowChallanNo = getVal('Challan No', 'Job / Challan No', 'Job No', 'Challan', 'Job')
    
    // Check if row has article data
    const artNo = getVal('Art No', 'Article No', 'Art', 'Article', 'Style No', 'Style')
    const color = getVal('Colour', 'Color', 'Color / Combination', 'Color Pattern', 'Combination', 'Shade')
    const size = getVal('Size', 'Size Tier', 'Size Range', 'Sizes')
    const qty = getVal('Order Qnty', 'Order Qty', 'Challan Qnty', 'Challan Qnty', 'Total Pcs', 'Qty')

    if (!artNo && !color && !size && !qty && !rowChallanNo) {
      continue
    }

    if (rowChallanNo) {
      lastActiveChallanNo = rowChallanNo.toUpperCase()
    } else if (lastActiveChallanNo) {
      rowChallanNo = lastActiveChallanNo
    } else {
      rowChallanNo = 'JOB-01'
      lastActiveChallanNo = rowChallanNo
    }

    if (!challanGroupsMap.has(rowChallanNo)) {
      challanGroupsMap.set(rowChallanNo, {
        challanNo: rowChallanNo,
        rawRows: []
      })
    }

    challanGroupsMap.get(rowChallanNo)!.rawRows.push(rowMap)
  }

  if (challanGroupsMap.size === 0) {
    throw new Error('No valid article lines or challan data found in the Excel file.')
  }

  const resultChallans: ParsedMultiChallanGroup[] = []
  let totalGrandPcs = 0
  let totalGrandLines = 0

  for (const [chNo, group] of challanGroupsMap.entries()) {
    let brand = ''
    let challanDate = new Date().toISOString().split('T')[0]
    let fabricType = ''
    let deliveryDate = ''
    let sampleGiven = false
    let notes = ''

    const articleLines: ParsedSingleArticleLine[] = []
    const bomItems: ParsedSingleBomItem[] = []
    const uniqueArtNos = new Set<string>()
    const uniqueColors = new Set<string>()

    let chTotalPcs = 0
    let chTotalSets = 0

    for (const rowMap of group.rawRows) {
      const getVal = (...keys: string[]): string => {
        for (const k of keys) {
          const cleaned = cleanKey(k)
          if (rowMap[cleaned] !== undefined && rowMap[cleaned] !== '') {
            return String(rowMap[cleaned]).trim()
          }
        }
        return ''
      }

      if (!brand) brand = getVal('Brand / Party', 'Brand', 'Party', 'Client', 'Customer')
      if (!fabricType) fabricType = getVal('Fabric Type', 'Fabric', 'Material Type')
      if (!notes) notes = getVal('Special Remarks', 'Remarks', 'Notes', 'Special Notes', 'Status')
      
      const rawDate = getVal('Date', 'Challan Date (YYYY-MM-DD)', 'Challan Date')
      if (rawDate) {
        const parsedChDate = formatExcelDate(rawDate)
        if (parsedChDate) challanDate = parsedChDate
      }

      const rawDeliveryDate = getVal('Expected Delivery Date (YYYY-MM-DD)', 'Expected Delivery Date', 'Delivery Date')
      if (rawDeliveryDate) {
        const parsedDelDate = formatExcelDate(rawDeliveryDate)
        if (parsedDelDate) deliveryDate = parsedDelDate
      }

      const rawSampleGiven = getVal('Ready Sample Given (YES/NO)', 'Ready Sample Given', 'Sample Given')
      if (rawSampleGiven) {
        const u = rawSampleGiven.toUpperCase()
        if (u === 'YES' || u === 'Y' || u === 'TRUE' || u === '1') sampleGiven = true
      }

      // Article Line Fields
      const artNo = getVal('Art No', 'Article No', 'Art', 'Article', 'Style No', 'Style')
      const subArtNo = getVal('Sub Art No', 'Sub Art', 'Sub', 'Sub No')
      const colorPattern = getVal('Colour', 'Color', 'Color / Combination', 'Color Pattern', 'Combination', 'Shade')
      const category = getVal('Category', 'Cat', 'Item Category')
      const product = getVal('Product', 'Pattern No', 'Pattern', 'Item', 'Garment')
      const sizeRange = getVal('Size', 'Size Tier', 'Size Range', 'Sizes')
      const orderQtyStr = getVal('Order Qnty', 'Order Qty', 'Order', 'Ordered Qty')
      const challanQtyStr = getVal('Challan Qnty', 'Challan Qty', 'Total Pcs', 'Total Pieces', 'Cutting Qty', 'Qty', 'Pcs')
      const setsStr = getVal('Sets', 'Set', 'Total Sets')
      const pcsPerSetStr = getVal('Pcs Per Set', 'Pcs/Set', 'Pcs Per Sets', 'Ratio')
      const rowStatus = getVal('Status', 'Line Status')

      if (artNo || colorPattern || sizeRange || orderQtyStr || challanQtyStr) {
        const orderQtyNum = orderQtyStr !== '' ? (parseInt(orderQtyStr, 10) || '') : ''
        const setsNum = setsStr !== '' ? (parseInt(setsStr, 10) || '') : ''
        const pcsPerSetNum = pcsPerSetStr !== '' ? (parseInt(pcsPerSetStr, 10) || '') : ''

        let calcTotal: number | string = ''
        if (challanQtyStr !== '') {
          calcTotal = parseInt(challanQtyStr, 10) || ''
        } else if (orderQtyNum !== '') {
          calcTotal = orderQtyNum
        } else if (typeof setsNum === 'number' && typeof pcsPerSetNum === 'number') {
          calcTotal = setsNum * pcsPerSetNum
        }

        if (typeof setsNum === 'number') chTotalSets += setsNum
        if (typeof calcTotal === 'number') chTotalPcs += calcTotal

        if (artNo) uniqueArtNos.add(artNo.toUpperCase())
        if (colorPattern) uniqueColors.add(colorPattern.toUpperCase())

        articleLines.push({
          art_no: artNo,
          sub_art_no: subArtNo,
          pattern_no: product,
          category: category,
          product: product,
          description: category && product ? `${category} - ${product}` : (category || product || ''),
          color_pattern: colorPattern,
          size_range: sizeRange,
          order_qty: orderQtyNum,
          sets: setsNum,
          pcs_per_set: pcsPerSetNum,
          total_pcs: calcTotal,
          assigned_lineman_id: '',
          status: rowStatus || 'RUNNING'
        })
      }

      // BOM Item
      const bomMatName = getVal('BOM Material Name', 'BOM Material', 'Material Name', 'BOM Item')
      const bomLotNo = getVal('BOM Lot No', 'Lot No', 'BOM Lot', 'Lot')
      const bomQtyStr = getVal('BOM Required Qty', 'BOM Quantity', 'Required Qty', 'BOM Qty')
      const bomUnit = getVal('BOM Unit', 'Unit')

      if (bomMatName || bomLotNo || bomQtyStr) {
        bomItems.push({
          material_type: 'FABRIC',
          item_name: bomMatName,
          lot_no: bomLotNo,
          required_qty: bomQtyStr !== '' ? (parseFloat(bomQtyStr) || '') : '',
          unit: bomUnit || 'kg',
          status: 'PENDING'
        })
      }
    }

    if (articleLines.length > 0) {
      resultChallans.push({
        challan_no: chNo,
        challan_date: challanDate,
        brand: brand || '',
        fabric_type: fabricType || '',
        delivery_date: deliveryDate,
        sample_given: sampleGiven,
        notes: notes,
        total_sets: chTotalSets,
        total_pcs: chTotalPcs,
        articles_summary: Array.from(uniqueArtNos),
        colors_summary: Array.from(uniqueColors),
        articleLines,
        bomItems
      })

      totalGrandPcs += chTotalPcs
      totalGrandLines += articleLines.length
    }
  }

  return {
    isMultiChallan: resultChallans.length > 1,
    challans: resultChallans,
    totalChallans: resultChallans.length,
    grandTotalPcs: totalGrandPcs,
    grandTotalLines: totalGrandLines
  }
}

/**
 * Backwards compatible single-challan parser
 */
export async function parseChallanExcelFile(file: File): Promise<ParsedChallanData> {
  const multiResult = await parseMultiChallanExcelFile(file)
  if (multiResult.challans.length === 0) {
    throw new Error('No challans found in the Excel file.')
  }
  const first = multiResult.challans[0]
  return {
    header: {
      challan_no: first.challan_no,
      brand: first.brand,
      challan_date: first.challan_date,
      fabric_type: first.fabric_type,
      delivery_date: first.delivery_date,
      sample_given: first.sample_given,
      notes: first.notes
    },
    articleLines: first.articleLines,
    bomItems: first.bomItems,
    summary: {
      lineCount: first.articleLines.length,
      totalOrderQty: first.articleLines.reduce((acc, l) => acc + (Number(l.order_qty) || 0), 0),
      totalSets: first.total_sets,
      totalPcs: first.total_pcs
    }
  }
}
