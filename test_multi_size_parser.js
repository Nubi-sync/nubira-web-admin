/**
 * Test runner for multiSizeParser logic
 */

const KNOWN_ALPHA_ORDER = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL']

function expandRange(start, end) {
  const numStart = parseInt(start, 10)
  const numEnd = parseInt(end, 10)

  if (!isNaN(numStart) && !isNaN(numEnd) && numStart < numEnd) {
    const diff = numEnd - numStart
    const step = diff % 2 === 0 ? 2 : 1
    const result = []
    for (let n = numStart; n <= numEnd; n += step) {
      result.push(n.toString())
    }
    return result
  }

  const alphaStartIdx = KNOWN_ALPHA_ORDER.indexOf(start.toUpperCase())
  const alphaEndIdx = KNOWN_ALPHA_ORDER.indexOf(end.toUpperCase())

  if (alphaStartIdx !== -1 && alphaEndIdx !== -1 && alphaStartIdx < alphaEndIdx) {
    return KNOWN_ALPHA_ORDER.slice(alphaStartIdx, alphaEndIdx + 1)
  }

  return null
}

function extractTokens(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const rangeMatch = trimmed.match(/^([A-Za-z0-9]+)\s*-\s*([A-Za-z0-9]+)$/)
  if (rangeMatch) {
    const expanded = expandRange(rangeMatch[1], rangeMatch[2])
    if (expanded && expanded.length > 1) return expanded
    return [rangeMatch[1].toUpperCase(), rangeMatch[2].toUpperCase()]
  }

  return trimmed
    .split(/[,/\s]+/)
    .map(t => t.trim().toUpperCase())
    .filter(t => t.length > 0)
}

function isValidSizeTokenList(tokens) {
  if (tokens.length < 2) return false

  const allNumeric = tokens.every(t => /^\d{2}$/.test(t))
  if (allNumeric) {
    const nums = tokens.map(t => parseInt(t, 10))
    return nums.every(n => n >= 14 && n <= 50)
  }

  const allAlpha = tokens.every(t => KNOWN_ALPHA_ORDER.includes(t))
  if (allAlpha) return true

  return tokens.every(t => KNOWN_ALPHA_ORDER.includes(t) || /^\d{2}$/.test(t))
}

function parseMultiSizeTokens(itemName, sizeLabel) {
  const rawItem = (itemName || '').trim()
  const rawSize = (sizeLabel || '').trim()

  if (rawSize) {
    const tokensFromSize = extractTokens(rawSize)
    if (isValidSizeTokenList(tokensFromSize)) {
      return {
        isMultiSize: true,
        cleanName: rawItem,
        sizes: tokensFromSize,
        detectedPattern: rawSize
      }
    }
  }

  const parenMatch = rawItem.match(/\(([^)]+)\)$/) || rawItem.match(/\(([^)]+)\)/)
  if (parenMatch) {
    const inside = parenMatch[1]
    const tokens = extractTokens(inside)
    if (isValidSizeTokenList(tokens)) {
      const clean = rawItem.replace(parenMatch[0], '').trim()
      return {
        isMultiSize: true,
        cleanName: clean,
        sizes: tokens,
        detectedPattern: inside
      }
    }
  }

  const endListMatch = rawItem.match(/(?:[\s\-_:])([A-Za-z0-9]+(?:[,/][A-Za-z0-9]+)+)$/)
  if (endListMatch) {
    const candidate = endListMatch[1]
    const tokens = extractTokens(candidate)
    if (isValidSizeTokenList(tokens)) {
      const clean = rawItem.slice(0, endListMatch.index).trim()
      return {
        isMultiSize: true,
        cleanName: clean || rawItem,
        sizes: tokens,
        detectedPattern: candidate
      }
    }
  }

  return {
    isMultiSize: false,
    cleanName: rawItem,
    sizes: rawSize ? [rawSize.toUpperCase()] : []
  }
}

function calculateSizeBreakdown(totalQty, sizes, targetQty) {
  const qty = Math.max(0, Number(totalQty) || 0)
  if (!sizes || sizes.length === 0) {
    return { sizeBreakdown: [], baseQty: qty, bufferQty: 0 }
  }

  const count = sizes.length
  let baseQuota = qty
  let buffer = 0

  if (targetQty && targetQty > 0 && qty > targetQty) {
    baseQuota = targetQty
    buffer = qty - targetQty
  } else {
    const remainder = qty % count
    if (remainder > 0) {
      baseQuota = qty - remainder
      buffer = remainder
    } else {
      baseQuota = qty
      buffer = 0
    }
  }

  const perSize = Math.floor(baseQuota / count)
  const breakdown = sizes.map(size => ({ size, qty: perSize }))

  return { sizeBreakdown: breakdown, baseQty: baseQuota, bufferQty: buffer }
}

// ---------------------- RUN TESTS ----------------------
console.log('🧪 Running Multi-Size & Safety Buffer Unit Tests...\n')

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`)
    passed++
  } else {
    console.error(`  ❌ FAIL: ${message}`)
    failed++
  }
}

// Test 1: Parentheses Alpha Sizes
{
  const res = parseMultiSizeTokens('BODY- OLLYPOP COLLECTION LABLE(M,L,XL,XXL)')
  assert(res.isMultiSize === true, 'Detects multi-size in parentheses')
  assert(JSON.stringify(res.sizes) === JSON.stringify(['M', 'L', 'XL', 'XXL']), 'Extracts M, L, XL, XXL sizes')
  assert(res.cleanName === 'BODY- OLLYPOP COLLECTION LABLE', 'Strips parentheses from clean name')
}

// Test 2: Parentheses Two-Size Alpha
{
  const res = parseMultiSizeTokens('BODY- OLLYPOP COLLECTION LABLE(XS,S)')
  assert(res.isMultiSize === true, 'Detects XS,S')
  assert(JSON.stringify(res.sizes) === JSON.stringify(['XS', 'S']), 'Extracts XS, S')
}

// Test 3: Comma separated numeric sizes at end
{
  const res = parseMultiSizeTokens('BODY- OLLYOP COLLECTION LABLE 22,24,26')
  assert(res.isMultiSize === true, 'Detects numeric sizes 22,24,26')
  assert(JSON.stringify(res.sizes) === JSON.stringify(['22', '24', '26']), 'Extracts 22, 24, 26')
  assert(res.cleanName === 'BODY- OLLYOP COLLECTION LABLE', 'Cleans item name')
}

// Test 4: Numeric range expansion
{
  const res = parseMultiSizeTokens('PANT ELASTIC (28-34)')
  assert(res.isMultiSize === true, 'Detects range 28-34')
  assert(JSON.stringify(res.sizes) === JSON.stringify(['28', '30', '32', '34']), 'Expands 28, 30, 32, 34 with step 2')
}

// Test 5: Target Qty vs Buffer Calculation (Enterprise MES Scenario)
{
  // 2,350 pcs received for 4 sizes, target is 2,232 pcs (558 pcs each), buffer is 118 pcs
  const sizes = ['S', 'M', 'L', 'XL']
  const calc = calculateSizeBreakdown(2350, sizes, 2232)
  assert(calc.baseQty === 2232, 'Base quota correctly capped at targetQty (2,232 pcs)')
  assert(calc.bufferQty === 118, 'Safety buffer correctly holds excess (118 pcs)')
  assert(calc.sizeBreakdown[0].qty === 558, 'Each size gets exactly 558 pcs (2,232 / 4)')
  assert(calc.sizeBreakdown.length === 4, 'All 4 sizes present in breakdown')
}

// Test 6: Uneven quantity without targetQty
{
  // 1,003 pcs received for 4 sizes -> 1,000 base (250 each), 3 pcs buffer
  const sizes = ['22', '24', '26', '28']
  const calc = calculateSizeBreakdown(1003, sizes)
  assert(calc.baseQty === 1000, 'Base quota rounded down to multiple of size count')
  assert(calc.bufferQty === 3, 'Remainder stored in safety buffer')
  assert(calc.sizeBreakdown[0].qty === 250, 'Per size qty is 250')
}

// Test 7: Non-multi-size item
{
  const res = parseMultiSizeTokens('NAVY BLUE SEWING THREAD CONE', 'CONE')
  assert(res.isMultiSize === false, 'Identifies regular single-type item as not multi-size')
  assert(res.cleanName === 'NAVY BLUE SEWING THREAD CONE', 'Preserves clean name')
}

console.log(`\n========================================`)
console.log(`📊 Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`)
console.log(`========================================`)
if (failed > 0) process.exit(1)
