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

/**
 * Normalizes an object key by removing special characters, underscores, and extra spaces.
 */
function cleanKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file and maps data to Challan form structures.
 * Supports Sir's simplified format seamlessly with in-modal live preview.
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

  let grandOrderQty = 0
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
    if (!challanNo) challanNo = getVal('Challan No', 'Job / Challan No', 'Job No', 'Challan', 'Job')
    if (!brand) brand = getVal('Brand / Party', 'Brand', 'Party', 'Client', 'Customer')
    if (!fabricType) fabricType = getVal('Fabric Type', 'Fabric', 'Material Type')
    if (!notes) notes = getVal('Special Remarks', 'Remarks', 'Notes', 'Special Notes', 'Status')
    
    const rawChallanDate = getVal('Date', 'Challan Date (YYYY-MM-DD)', 'Challan Date')
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

    // Extract Article Line Fields
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

    // Only add if at least Art No or Color or Size or Quantity is present
    if (artNo || colorPattern || sizeRange || challanQtyStr) {
      const orderQtyNum = orderQtyStr !== '' ? (parseInt(orderQtyStr, 10) || '') : ''
      const setsNum = setsStr !== '' ? (parseInt(setsStr, 10) || '') : ''
      const pcsPerSetNum = pcsPerSetStr !== '' ? (parseInt(pcsPerSetStr, 10) || '') : ''
      
      let calcTotal: number | string = ''
      if (challanQtyStr !== '') {
        calcTotal = parseInt(challanQtyStr, 10) || ''
      } else if (typeof setsNum === 'number' && typeof pcsPerSetNum === 'number') {
        calcTotal = setsNum * pcsPerSetNum
      }

      if (typeof orderQtyNum === 'number') grandOrderQty += orderQtyNum
      if (typeof setsNum === 'number') grandSets += setsNum
      if (typeof calcTotal === 'number') grandPcs += calcTotal

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
      category: '',
      product: '',
      description: '',
      color_pattern: '',
      size_range: '',
      order_qty: '' as any,
      sets: '' as any,
      pcs_per_set: '' as any,
      total_pcs: '' as any,
      assigned_lineman_id: '',
      status: 'RUNNING'
    }],
    bomItems,
    summary: {
      lineCount: articleLines.length,
      totalOrderQty: grandOrderQty,
      totalSets: grandSets,
      totalPcs: grandPcs
    }
  }
}

/**
 * Formats Excel dates (handles serial numbers, DD-MM-YYYY, DD/MM/YYYY, and standard ISO formats).
 */
function formatExcelDate(dateVal: any): string {
  if (!dateVal) return ''

  // If number (Excel serial date number)
  if (typeof dateVal === 'number' || (!isNaN(Number(dateVal)) && !String(dateVal).includes('-') && !String(dateVal).includes('/'))) {
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
