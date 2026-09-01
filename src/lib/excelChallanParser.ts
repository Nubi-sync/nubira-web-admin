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
    description: string
    color_pattern: string
    size_range: string
    sets: number | string
    pcs_per_set: number | string
    total_pcs: number | string
    assigned_lineman_id: string
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
    totalSets: number
    totalPcs: number
  }
}

/**
 * Generates and triggers download of a 100% clean Delivery Challan Excel template (.xlsx)
 * Contains zero dummy mock records; formatted with professional column headers.
 */
export function downloadCleanChallanTemplate() {
  const headers = [
    'Job / Challan No',
    'Brand / Party',
    'Challan Date (YYYY-MM-DD)',
    'Fabric Type',
    'Expected Delivery Date (YYYY-MM-DD)',
    'Ready Sample Given (YES/NO)',
    'Special Remarks',
    'Art No',
    'Sub Art No',
    'Pattern No',
    'Color / Combination',
    'Size Tier',
    'Sets',
    'Pcs Per Set',
    'Total Pcs',
    'BOM Material Name',
    'BOM Lot No',
    'BOM Required Qty',
    'BOM Unit'
  ]

  // Create empty template rows (Clean, no fake dummy data)
  const templateRows = [
    headers,
    // Row 1: Empty ready for data entry
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    // Row 2: Empty ready for data entry
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    // Row 3: Empty ready for data entry
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
  ]

  const ws = XLSX.utils.aoa_to_sheet(templateRows)

  // Set professional column widths
  ws['!cols'] = [
    { wch: 18 }, // Job / Challan No
    { wch: 18 }, // Brand / Party
    { wch: 22 }, // Challan Date
    { wch: 20 }, // Fabric Type
    { wch: 24 }, // Expected Delivery Date
    { wch: 24 }, // Ready Sample Given
    { wch: 30 }, // Special Remarks
    { wch: 14 }, // Art No
    { wch: 12 }, // Sub Art No
    { wch: 14 }, // Pattern No
    { wch: 22 }, // Color / Combination
    { wch: 14 }, // Size Tier
    { wch: 10 }, // Sets
    { wch: 12 }, // Pcs Per Set
    { wch: 12 }, // Total Pcs
    { wch: 22 }, // BOM Material Name
    { wch: 16 }, // BOM Lot No
    { wch: 16 }, // BOM Required Qty
    { wch: 12 }  // BOM Unit
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Delivery Challan Entry')

  XLSX.writeFile(wb, 'Delivery_Challan_Template.xlsx')
}

/**
 * Normalizes an object key by removing special characters, underscores, and extra spaces.
 */
function cleanKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file and maps data to Challan form structures.
 */
export async function parseChallanExcelFile(file: File): Promise<ParsedChallanData> {
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

  // Header extraction (Read from the first non-empty row)
  let challanNo = ''
  let brand = ''
  let challanDate = new Date().toISOString().split('T')[0]
  let fabricType = ''
  let deliveryDate = ''
  let sampleGiven = false
  let notes = ''

  const articleLines: ParsedChallanData['articleLines'] = []
  const bomItems: ParsedChallanData['bomItems'] = []

  let grandSets = 0
  let grandPcs = 0

  for (const rawRow of rawRows) {
    // Create a normalized key-value map for the row
    const rowMap: Record<string, any> = {}
    for (const [key, val] of Object.entries(rawRow)) {
      rowMap[cleanKey(key)] = val
    }

    // Helper to find value from multiple possible header names
    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        const cleaned = cleanKey(k)
        if (rowMap[cleaned] !== undefined && rowMap[cleaned] !== '') {
          return String(rowMap[cleaned]).trim()
        }
      }
      return ''
    }

    // Populate header if not already populated
    if (!challanNo) challanNo = getVal('Job / Challan No', 'Challan No', 'Job No', 'Challan', 'Job')
    if (!brand) brand = getVal('Brand / Party', 'Brand', 'Party', 'Client', 'Customer')
    if (!fabricType) fabricType = getVal('Fabric Type', 'Fabric', 'Material Type')
    if (!notes) notes = getVal('Special Remarks', 'Remarks', 'Notes', 'Special Notes')
    
    const rawChallanDate = getVal('Challan Date (YYYY-MM-DD)', 'Challan Date', 'Date')
    if (rawChallanDate) {
      challanDate = formatExcelDate(rawChallanDate)
    }

    const rawDeliveryDate = getVal('Expected Delivery Date (YYYY-MM-DD)', 'Expected Delivery Date', 'Delivery Date')
    if (rawDeliveryDate) {
      deliveryDate = formatExcelDate(rawDeliveryDate)
    }

    const rawSampleGiven = getVal('Ready Sample Given (YES/NO)', 'Ready Sample Given', 'Sample Given')
    if (rawSampleGiven) {
      const upper = rawSampleGiven.toUpperCase()
      if (upper === 'YES' || upper === 'Y' || upper === 'TRUE' || upper === '1') {
        sampleGiven = true
      }
    }

    // Extract Article Line
    const artNo = getVal('Art No', 'Article No', 'Art', 'Article', 'Style No', 'Style')
    const subArtNo = getVal('Sub Art No', 'Sub Art', 'Sub', 'Sub No')
    const patternNo = getVal('Pattern No', 'Pattern', 'Pattern Master')
    const colorPattern = getVal('Color / Combination', 'Color', 'Colour', 'Color Pattern', 'Combination', 'Shade')
    const sizeRange = getVal('Size Tier', 'Size', 'Size Range', 'Sizes')
    const setsStr = getVal('Sets', 'Set', 'Total Sets')
    const pcsPerSetStr = getVal('Pcs Per Set', 'Pcs/Set', 'Pcs Per Sets', 'Ratio')
    const totalPcsStr = getVal('Total Pcs', 'Total Pieces', 'Total')

    // Only add if at least Art No or Color or Sets is present
    if (artNo || colorPattern || setsStr) {
      const setsNum = setsStr !== '' ? (parseInt(setsStr, 10) || '') : ''
      const pcsPerSetNum = pcsPerSetStr !== '' ? (parseInt(pcsPerSetStr, 10) || '') : ''
      
      let calcTotal: number | string = ''
      if (totalPcsStr !== '') {
        calcTotal = parseInt(totalPcsStr, 10) || ''
      } else if (typeof setsNum === 'number' && typeof pcsPerSetNum === 'number') {
        calcTotal = setsNum * pcsPerSetNum
      }

      if (typeof setsNum === 'number') grandSets += setsNum
      if (typeof calcTotal === 'number') grandPcs += calcTotal

      articleLines.push({
        art_no: artNo,
        sub_art_no: subArtNo,
        pattern_no: patternNo,
        description: '',
        color_pattern: colorPattern,
        size_range: sizeRange,
        sets: setsNum,
        pcs_per_set: pcsPerSetNum,
        total_pcs: calcTotal,
        assigned_lineman_id: ''
      })
    }

    // Extract BOM Item if present
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

  return {
    header: {
      challan_no: challanNo,
      brand,
      challan_date: challanDate,
      fabric_type: fabricType,
      delivery_date: deliveryDate,
      sample_given: sampleGiven,
      notes
    },
    articleLines: articleLines.length > 0 ? articleLines : [{
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
    }],
    bomItems,
    summary: {
      lineCount: articleLines.length,
      totalSets: grandSets,
      totalPcs: grandPcs
    }
  }
}

/**
 * Formats Excel dates (handles both serial numbers and date strings).
 */
function formatExcelDate(dateVal: any): string {
  if (!dateVal) return ''

  // If number (Excel serial date number)
  if (typeof dateVal === 'number' || !isNaN(Number(dateVal))) {
    const num = Number(dateVal)
    if (num > 30000 && num < 60000) {
      const date = new Date(Math.round((num - 25569) * 86400 * 1000))
      return date.toISOString().split('T')[0]
    }
  }

  const str = String(dateVal).trim()

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str
  }

  // If DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0')
    const month = dmyMatch[2].padStart(2, '0')
    const year = dmyMatch[3]
    return `${year}-${month}-${day}`
  }

  // Fallback try Date parse
  try {
    const parsed = new Date(str)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }
  } catch {
    // Ignore
  }

  return str
}
