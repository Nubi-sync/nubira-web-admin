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
    stitching_rate?: number
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
 * Generates and triggers download of clean Delivery Challan Excel template (.xlsx)
 * Features exact standard columns: DATE, CHALLAN NO, ART NO, COLOUR, CATEGORY, PRODUCT, SIZE, ORDER QNTY, CHALLAN QNTY, STATUS
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
    'RATE',
    'ORDER QNTY',
    'CHALLAN QNTY',
    'LINEMAN',
    'QC CHECKER',
    'MENDING',
    'STATUS',
    'BRAND',
    'VENDOR',
    'FABRIC TYPE',
    'EXPECTED DELIVERY DATE',
    'SPECIAL REMARKS'
  ]

  // Clean Template ready for immediate data entry with no dummy data
  const templateRows = [
    headers
  ]

  const ws = XLSX.utils.aoa_to_sheet(templateRows)

  // Set column widths
  ws['!cols'] = [
    { wch: 14 }, // DATE
    { wch: 16 }, // CHALLAN NO
    { wch: 14 }, // ART NO
    { wch: 18 }, // COLOUR
    { wch: 16 }, // CATEGORY
    { wch: 16 }, // PRODUCT
    { wch: 12 }, // SIZE
    { wch: 12 }, // RATE
    { wch: 14 }, // ORDER QNTY
    { wch: 16 }, // CHALLAN QNTY
    { wch: 18 }, // LINEMAN
    { wch: 18 }, // QC CHECKER
    { wch: 18 }, // MENDING
    { wch: 14 }, // STATUS
    { wch: 18 }, // BRAND
    { wch: 22 }, // VENDOR
    { wch: 20 }, // FABRIC TYPE
    { wch: 22 }, // EXPECTED DELIVERY DATE
    { wch: 26 }  // SPECIAL REMARKS
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Delivery Challans')

  XLSX.writeFile(wb, 'Delivery_Challans_Import_Template.xlsx')
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
  lineman_name?: string
  qc_name?: string
  mending_name?: string
  vendor_name?: string
  stage_status?: string
  status: string
  stitching_rate?: number
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
  vendor_name?: string
  vendor_id?: string
  fabric_type: string
  delivery_date: string
  sample_given: boolean
  notes: string
  total_sets: number
  total_pcs: number
  articles_summary: string[]
  colors_summary: string[]
  linemen_summary?: string[]
  qc_summary?: string[]
  mending_summary?: string[]
  articleLines: ParsedSingleArticleLine[]
  bomItems: ParsedSingleBomItem[]
}

export interface ParsedMultiChallanResult {
  isMultiChallan: boolean
  challans: ParsedMultiChallanGroup[]
  totalChallans: number
  grandTotalPcs: number
  grandTotalLines: number
  grandTotalSets: number
  uniqueStylesCount: number
}

/**
 * Normalizes an object key by removing special characters, underscores, spaces, dots, and hyphens.
 */
function cleanKey(key: string): string {
  return String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Safely parses numeric values (strips commas, units like 'pcs', 'kg', spaces)
 */
function parseNumeric(val: any): number | '' {
  if (val === undefined || val === null || val === '') return ''
  if (typeof val === 'number') return isNaN(val) ? '' : val

  const str = String(val).trim()
  if (!str) return ''

  // Clean commas, spaces, currency or qty suffixes
  const cleaned = str.replace(/,/g, '').replace(/[^\d.-]/g, '')
  if (!cleaned) return ''

  const num = parseFloat(cleaned)
  return isNaN(num) ? '' : num
}

/**
 * Formats Excel dates (handles Date objects, serial numbers, DD-MM-YYYY, DD/MM/YYYY, MM/DD/YYYY, and ISO formats).
 */
function formatExcelDate(dateVal: any): string {
  if (!dateVal) return ''

  // If already native Date object
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const y = dateVal.getFullYear()
    const m = String(dateVal.getMonth() + 1).padStart(2, '0')
    const d = String(dateVal.getDate()).padStart(2, '0')
    if (y >= 1990 && y <= 2099) {
      return `${y}-${m}-${d}`
    }
  }

  // If number (Excel serial date number)
  const num = typeof dateVal === 'number' ? dateVal : Number(dateVal)
  if (!isNaN(num) && (typeof dateVal === 'number' || (!String(dateVal).includes('-') && !String(dateVal).includes('/')))) {
    if (num > 20000 && num < 75000) {
      // 25569 = Days between 1899-12-30 and 1970-01-01
      const date = new Date(Math.round((num - 25569) * 86400 * 1000))
      if (!isNaN(date.getTime())) {
        const y = date.getUTCFullYear()
        const m = String(date.getUTCMonth() + 1).padStart(2, '0')
        const d = String(date.getUTCDate()).padStart(2, '0')
        if (y >= 1990 && y <= 2099) {
          return `${y}-${m}-${d}`
        }
      }
    }
  }

  const str = String(dateVal).trim()
  if (!str) return ''

  // If already YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
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
  if (parts.length >= 3) {
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

// Comprehensive synonym mapping for column headers
const COLUMN_SYNONYMS = {
  challan_no: [
    'challanno', 'jobchallanno', 'jobno', 'challan', 'job', 'chno', 'ch',
    'challannumber', 'billno', 'lotno', 'lotnumber', 'orderno', 'deliverychallanno',
    'dcno', 'cuttingno', 'batchno', 'batch', 'invoiceno', 'invoice', 'po', 'pono',
    'ponumber', 'orderid', 'challanid', 'jobid', 'deliveryno', 'challanref', 'docno'
  ],
  date: [
    'date', 'challandate', 'chdate', 'jobdate', 'cuttingdate', 'entrydate',
    'orderdate', 'deliverydate', 'challandateyyyymmdd'
  ],
  art_no: [
    'artno', 'articleno', 'art', 'article', 'styleno', 'style', 'designno',
    'design', 'itemcode', 'modelno', 'code', 'stylecode'
  ],
  sub_art_no: [
    'subartno', 'subart', 'sub', 'subno', 'part', 'partno', 'subpart', 'substyle'
  ],
  colour: [
    'colour', 'color', 'col', 'shade', 'colorpattern', 'colorcombination',
    'combination', 'print', 'colorprint', 'fabriccolor', 'shadecolor', 'colorname',
    'colors', 'colours', 'clr', 'shadename', 'shadeno', 'fabriccolour', 'colourname',
    'colourpattern', 'colourshade', 'itemcolor', 'itemcolour', 'colourcombo', 'colorcombo',
    'shadecombination', 'colorways', 'colorway'
  ],
  category: [
    'category', 'cat', 'itemcategory', 'group', 'itemgroup', 'type', 'garmenttype'
  ],
  product: [
    'product', 'prod', 'item', 'garment', 'patternno', 'pattern', 'description',
    'particulars', 'articledescription', 'styledescription'
  ],
  size: [
    'size', 'sizes', 'sizerange', 'sizetier', 'ratio', 'sizeratio', 'sizebreakdown', 'scale'
  ],
  rate: [
    'rate', 'stitchingrate', 'piecerate', 'stitchingcharge', 'rates', 'ratepc', 'ratepiece',
    'rateperpc', 'rateperpiece', 'jobrate', 'workrate', 'tailorrate', 'stitchrate'
  ],
  order_qty: [
    'orderqnty', 'orderqty', 'orderedqty', 'ordqty', 'ordqnty', 'order', 'targetqty',
    'bookedqty', 'poqty'
  ],
  challan_qty: [
    'challanqnty', 'challanqty', 'chqnty', 'chqty', 'cuttingqty', 'totalpcs',
    'totalpieces', 'pcs', 'qty', 'quantity', 'totalqty', 'deliveryqty',
    'dispatchqty', 'actualpcs', 'count', 'piececount'
  ],
  sets: [
    'sets', 'set', 'totalsets', 'noofsets', 'challansets'
  ],
  pcs_per_set: [
    'pcsunderset', 'pcsset', 'ratio', 'pcsperratio', 'setratio', 'ratioeach', 'pcsratio'
  ],
  brand: [
    'brandparty', 'brand', 'party', 'client', 'buyer', 'customer', 'partyname',
    'brandname', 'company', 'clientname', 'buyername'
  ],
  vendor: [
    'vendor', 'vendorunit', 'vendorname', 'jobworker', 'contractor', 'stitchingunit',
    'supplier', 'factory', 'unit', 'unitname', 'partyunit', 'karigar'
  ],
  fabric_type: [
    'fabrictype', 'fabric', 'materialtype', 'cloth', 'fabricname', 'quality',
    'fabricquality', 'yarn'
  ],
  delivery_date: [
    'expecteddeliverydate', 'deliverydate', 'expdate', 'duedate', 'targetdate',
    'expecteddelivery', 'dispatchexpected'
  ],
  sample_given: [
    'readysamplegiven', 'readysamplegivenyesno', 'samplegiven', 'sample',
    'sampleyesno', 'samplesent', 'approvedsample'
  ],
  lineman: [
    'lineman', 'supervisor', 'lineno', 'line', 'stitchingmaster', 'linesupervisor',
    'operator', 'sewingsupervisor', 'lineman_name', 'linemanname', 'assignedlineman',
    'worker', 'workername', 'tailor', 'artisan', 'assignedto', 'assignee', 'master'
  ],
  qc: [
    'qc', 'qcchecker', 'qcsupervisor', 'inspector', 'checkername', 'qcassigned',
    'qcofficer', 'qc_name', 'qcname', 'inspection'
  ],
  mending: [
    'mending', 'mender', 'mendingmaster', 'alteration', 'checker', 'mendingoperator',
    'mending_name', 'mendingname', 'alter'
  ],
  stage: [
    'stage', 'currentstage', 'stagestatus', 'status', 'linestatus', 'jobstatus', 'progress'
  ],
  notes: [
    'specialremarks', 'remarks', 'notes', 'specialnotes', 'comment', 'comments',
    'instruction', 'instructions'
  ],
  bom_name: [
    'bommaterialname', 'bommaterial', 'materialname', 'bomitem', 'trims',
    'accessories', 'itemname', 'fabricmaterial'
  ],
  bom_lot: [
    'bomlotno', 'lotno', 'bomlot', 'rollno', 'fabriclot', 'lot', 'roll'
  ],
  bom_qty: [
    'bomrequiredqty', 'bomquantity', 'requiredqty', 'bomqty', 'consumption',
    'fabricqty', 'trimsqty'
  ],
  bom_unit: [
    'bomunit', 'unit', 'uom', 'measuringunit'
  ]
}

/**
 * Fast Value extractor matching all known synonyms
 */
function getNormalizedField(rowMap: Record<string, any>, synonymList: string[]): any {
  for (const s of synonymList) {
    if (rowMap[s] !== undefined && rowMap[s] !== null && rowMap[s] !== '') {
      return rowMap[s]
    }
  }
  return ''
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file and groups data by CHALLAN NO.
 * Optimized for blazing-fast batch processing of 200 - 500+ Challans with 100% data accuracy.
 */
export async function parseMultiChallanExcelFile(file: File): Promise<ParsedMultiChallanResult> {
  const arrayBuffer = await file.arrayBuffer()
  
  // Fast SheetJS read options
  const wb = XLSX.read(arrayBuffer, {
    type: 'array',
    dense: true,
    cellDates: true,
    cellNF: false,
    cellText: false,
    raw: true
  })

  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new Error('The selected Excel file contains no sheets.')
  }

  // Map to group rows by Challan No while preserving exact sheet order
  const challanGroupsMap = new Map<string, {
    challanNo: string
    rawRows: Record<string, any>[]
  }>()

  let lastActiveChallanNo = ''
  let autoChallanCounter = 1

  // Process all sheets that contain data
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName]
    if (!sheet) continue

    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true })
    if (!rawRows || rawRows.length === 0) continue

    for (const rawRow of rawRows) {
      // Create fast normalized lowercase key map
      const rowMap: Record<string, any> = {}
      let hasAnyData = false

      for (const [key, val] of Object.entries(rawRow)) {
        if (val !== undefined && val !== null && val !== '') {
          const cK = cleanKey(key)
          rowMap[cK] = val
          hasAnyData = true
        }
      }

      if (!hasAnyData) continue

      let rowChallanNo = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.challan_no)).trim()
      const artNo = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.art_no)).trim()
      const color = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.colour)).trim()
      const size = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.size)).trim()
      const qty = getNormalizedField(rowMap, COLUMN_SYNONYMS.challan_qty) || getNormalizedField(rowMap, COLUMN_SYNONYMS.order_qty)
      const bomName = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.bom_name)).trim()

      // Skip non-data rows (e.g. empty rows, totals, repeated headers)
      if (!artNo && !color && !size && !qty && !rowChallanNo && !bomName) {
        continue
      }

      if (rowChallanNo) {
        lastActiveChallanNo = rowChallanNo.toUpperCase()
      } else if (lastActiveChallanNo) {
        rowChallanNo = lastActiveChallanNo
      } else {
        rowChallanNo = `JOB-${String(autoChallanCounter).padStart(2, '0')}`
        lastActiveChallanNo = rowChallanNo
        autoChallanCounter++
      }

      if (!challanGroupsMap.has(rowChallanNo)) {
        challanGroupsMap.set(rowChallanNo, {
          challanNo: rowChallanNo,
          rawRows: []
        })
      }

      challanGroupsMap.get(rowChallanNo)!.rawRows.push(rowMap)
    }
  }

  if (challanGroupsMap.size === 0) {
    throw new Error('No valid article lines or delivery challan records found in the Excel file.')
  }

  const resultChallans: ParsedMultiChallanGroup[] = []
  let totalGrandPcs = 0
  let totalGrandLines = 0
  let totalGrandSets = 0
  const globalMasterStyles = new Set<string>()

  const todayIso = new Date().toISOString().split('T')[0]

  for (const [chNo, group] of challanGroupsMap.entries()) {
    let brand = ''
    let vendorName = ''
    let challanDate = todayIso
    let fabricType = ''
    let deliveryDate = ''
    let sampleGiven = false
    let notes = ''

    const articleLines: ParsedSingleArticleLine[] = []
    const bomItems: ParsedSingleBomItem[] = []
    const uniqueArtNos = new Set<string>()
    const uniqueColors = new Set<string>()
    const uniqueLinemen = new Set<string>()
    const uniqueQc = new Set<string>()
    const uniqueMending = new Set<string>()

    let chTotalPcs = 0
    let chTotalSets = 0

    for (const rowMap of group.rawRows) {
      if (!brand) brand = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.brand)).trim()
      if (!vendorName) vendorName = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.vendor)).trim()
      if (!fabricType) fabricType = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.fabric_type)).trim()
      if (!notes) notes = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.notes)).trim()

      const rawDate = getNormalizedField(rowMap, COLUMN_SYNONYMS.date)
      if (rawDate) {
        const parsedChDate = formatExcelDate(rawDate)
        if (parsedChDate) challanDate = parsedChDate
      }

      const rawDeliveryDate = getNormalizedField(rowMap, COLUMN_SYNONYMS.delivery_date)
      if (rawDeliveryDate) {
        const parsedDelDate = formatExcelDate(rawDeliveryDate)
        if (parsedDelDate) deliveryDate = parsedDelDate
      }

      const rawSampleGiven = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.sample_given)).trim().toUpperCase()
      if (rawSampleGiven) {
        if (rawSampleGiven === 'YES' || rawSampleGiven === 'Y' || rawSampleGiven === 'TRUE' || rawSampleGiven === '1') {
          sampleGiven = true
        }
      }

      // Personnel fields
      const linemanName = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.lineman)).trim()
      const qcName = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.qc)).trim()
      const mendingName = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.mending)).trim()
      const stageStatus = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.stage)).trim().toUpperCase()

      // Article Line Fields
      const artNo = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.art_no)).trim()
      const subArtNo = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.sub_art_no)).trim()
      const colorPattern = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.colour)).trim()
      const category = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.category)).trim()
      const product = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.product)).trim()
      const sizeRange = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.size)).trim()
      const rateVal = parseNumeric(getNormalizedField(rowMap, COLUMN_SYNONYMS.rate))
      const orderQtyVal = parseNumeric(getNormalizedField(rowMap, COLUMN_SYNONYMS.order_qty))
      const challanQtyVal = parseNumeric(getNormalizedField(rowMap, COLUMN_SYNONYMS.challan_qty))
      const setsVal = parseNumeric(getNormalizedField(rowMap, COLUMN_SYNONYMS.sets))
      const pcsPerSetVal = parseNumeric(getNormalizedField(rowMap, COLUMN_SYNONYMS.pcs_per_set))
      const rowStatus = stageStatus || String(getNormalizedField(rowMap, COLUMN_SYNONYMS.notes)).trim()

      if (artNo || colorPattern || sizeRange || orderQtyVal !== '' || challanQtyVal !== '') {
        let calcTotal: number | string = ''
        if (typeof challanQtyVal === 'number' && !isNaN(challanQtyVal)) {
          calcTotal = Math.round(challanQtyVal)
        } else if (typeof orderQtyVal === 'number' && !isNaN(orderQtyVal)) {
          calcTotal = Math.round(orderQtyVal)
        } else if (typeof setsVal === 'number' && typeof pcsPerSetVal === 'number') {
          calcTotal = Math.round(setsVal * pcsPerSetVal)
        }

        const numericSets = typeof setsVal === 'number' ? setsVal : (typeof calcTotal === 'number' ? Math.max(1, Math.round(calcTotal / 9)) : '')
        const numericPcsPerSet = typeof pcsPerSetVal === 'number' ? pcsPerSetVal : 9

        if (typeof numericSets === 'number') chTotalSets += numericSets
        if (typeof calcTotal === 'number') chTotalPcs += calcTotal

        if (artNo) {
          const upperArt = artNo.toUpperCase()
          uniqueArtNos.add(upperArt)
          globalMasterStyles.add(upperArt)
        }
        if (colorPattern) uniqueColors.add(colorPattern.toUpperCase())
        if (linemanName) uniqueLinemen.add(linemanName)
        if (qcName) uniqueQc.add(qcName)
        if (mendingName) uniqueMending.add(mendingName)

        articleLines.push({
          art_no: artNo || '',
          sub_art_no: subArtNo,
          pattern_no: product,
          category: category,
          product: product,
          description: category && product ? `${category} - ${product}` : (category || product || (artNo ? `${artNo} Style` : '')),
          color_pattern: colorPattern || '',
          size_range: sizeRange || '',
          order_qty: orderQtyVal !== '' ? orderQtyVal : (calcTotal || ''),
          sets: numericSets,
          pcs_per_set: numericPcsPerSet,
          total_pcs: calcTotal !== '' ? calcTotal : 0,
          assigned_lineman_id: '',
          lineman_name: linemanName || undefined,
          qc_name: qcName || undefined,
          mending_name: mendingName || undefined,
          vendor_name: vendorName || undefined,
          stage_status: stageStatus || undefined,
          status: rowStatus || 'RUNNING',
          stitching_rate: typeof rateVal === 'number' && rateVal > 0 ? rateVal : undefined
        })
      }

      // BOM Material Item
      const bomMatName = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.bom_name)).trim()
      const bomLotNo = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.bom_lot)).trim()
      const bomQtyVal = parseNumeric(getNormalizedField(rowMap, COLUMN_SYNONYMS.bom_qty))
      const bomUnit = String(getNormalizedField(rowMap, COLUMN_SYNONYMS.bom_unit)).trim()

      if (bomMatName || bomLotNo || bomQtyVal !== '') {
        bomItems.push({
          material_type: 'FABRIC',
          item_name: bomMatName || (fabricType ? `${fabricType} Fabric Lot` : 'Fabric Lot'),
          lot_no: bomLotNo,
          required_qty: bomQtyVal !== '' ? bomQtyVal : '',
          unit: bomUnit || 'kg',
          status: 'PENDING'
        })
      }
    }

    if (articleLines.length > 0) {
      resultChallans.push({
        challan_no: chNo,
        challan_date: challanDate || todayIso,
        brand: brand || '',
        vendor_name: vendorName || undefined,
        fabric_type: fabricType || '',
        delivery_date: deliveryDate,
        sample_given: sampleGiven,
        notes: notes,
        total_sets: chTotalSets || articleLines.length,
        total_pcs: chTotalPcs,
        articles_summary: Array.from(uniqueArtNos),
        colors_summary: Array.from(uniqueColors),
        linemen_summary: Array.from(uniqueLinemen),
        qc_summary: Array.from(uniqueQc),
        mending_summary: Array.from(uniqueMending),
        articleLines,
        bomItems
      })

      totalGrandPcs += chTotalPcs
      totalGrandLines += articleLines.length
      totalGrandSets += chTotalSets
    }
  }

  return {
    isMultiChallan: resultChallans.length > 1,
    challans: resultChallans,
    totalChallans: resultChallans.length,
    grandTotalPcs: totalGrandPcs,
    grandTotalLines: totalGrandLines,
    grandTotalSets: totalGrandSets,
    uniqueStylesCount: globalMasterStyles.size
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

