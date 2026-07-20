// utils/pc_compatibility.ts

export interface ParsedSpecs {
  rawTitle: string
  socket?: string
  ramType?: 'DDR4' | 'DDR5'
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX'
}

export function extractSpecsFromTitle(title: string): ParsedSpecs {
  if (!title) return { rawTitle: '' }

  const clean = title.trim()
  const upper = clean.toUpperCase()

  let socket: string | undefined
  let ramType: 'DDR4' | 'DDR5' | undefined
  let formFactor: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX' | undefined

  // =========================================================
  // 1. SOCKET EXTRACTION
  // =========================================================

  // A. Direct Socket Mention
  const directMatch = upper.match(
    /\b(AM4|AM5|LGA\s?1700|LGA\s?1851|LGA\s?1200|LGA\s?1151|TR4|sTRX4)\b/i,
  )
  if (directMatch) {
    socket = directMatch[1].replace(/\s+/g, '')
  }

  // B. AMD CPU Model Matching (Optional spaces between Ryzen and number, e.g., "Ryzen7 9700X")
  if (!socket) {
    if (
      /\bRyzen\s*[3579]?\s*(7\d{3}|8\d{3}|9\d{3})/i.test(clean) ||
      /\b(7800X3D|7950X3D|9800X3D|9700X|9600X|7700X|7600X)\b/i.test(clean)
    ) {
      socket = 'AM5'
    } else if (
      /\bRyzen\s*[3579]?\s*([1-5]\d{3})/i.test(clean) ||
      /\b(5800X3D|5700X|5600X|5600|5500|3600)\b/i.test(clean) ||
      /\bAthlon\s*(3000G|\d{3})/i.test(clean)
    ) {
      socket = 'AM4'
    }
  }

  // C. Intel CPU Model Matching (Handles missing "i5/i7" prefixes like "Intel 12100f" & 8th/9th gen LGA1151)
  if (!socket) {
    // 12th/13th/14th Gen -> LGA1700
    if (
      /\b(i[3579][-\s]?)?(12|13|14)\d{3}[A-Z]*\b/i.test(clean) ||
      /\b(12900K|13900K|14900K|13600K|12600K|12400F|12100F|13400F|14400F|14700K)\b/i.test(clean)
    ) {
      socket = 'LGA1700'
    }
    // Core Ultra (Series 2 / 200S) -> LGA1851
    else if (/\bCore\s+Ultra\s+[579]?[-\s]?2\d{2}/i.test(clean)) {
      socket = 'LGA1851'
    }
    // 10th/11th Gen -> LGA1200
    else if (/\b(i[3579][-\s]?)?(10|11)\d{3}[A-Z]*\b/i.test(clean)) {
      socket = 'LGA1200'
    }
    // 8th/9th Gen -> LGA1151
    else if (/\b(i[3579][-\s]?)?[89]\d{3}[A-Z]*\b/i.test(clean) || /\b9400F\b/i.test(clean)) {
      socket = 'LGA1151'
    }
  }

  // D. Motherboard Chipsets (AMD)
  if (!socket) {
    if (/\b(B650|X670|X870|A620|B840|B850)[M-]?\b/i.test(clean)) {
      socket = 'AM5'
    } else if (/\b(B450|B550|X470|X570|A320|A520)[M-]?\b/i.test(clean)) {
      socket = 'AM4'
    }
  }

  // E. Motherboard Chipsets (Intel)
  if (!socket) {
    if (/\b(Z690|Z790|B660|B760|H610|H670|H770)[M-]?\b/i.test(clean)) {
      socket = 'LGA1700'
    } else if (/\b(Z890|B860)[M-]?\b/i.test(clean)) {
      socket = 'LGA1851'
    } else if (/\b(Z490|Z590|B460|B560|H410|H510)[M-]?\b/i.test(clean)) {
      socket = 'LGA1200'
    } else if (/\b(Z370|Z390|B360|B365|H310|H370)[M-]?\b/i.test(clean)) {
      socket = 'LGA1151'
    }
  }

  // =========================================================
  // 2. RAM TYPE EXTRACTION
  // =========================================================
  if (/\bDDR5\b|\bD5\b/i.test(clean)) {
    ramType = 'DDR5'
  } else if (/\bDDR4\b|\bD4\b/i.test(clean)) {
    ramType = 'DDR4'
  } else if (socket === 'AM5' || socket === 'LGA1851') {
    ramType = 'DDR5'
  } else if (socket === 'AM4' || socket === 'LGA1200' || socket === 'LGA1151') {
    ramType = 'DDR4'
  }

  // =========================================================
  // 3. FORM FACTOR EXTRACTION
  // =========================================================
  if (/\b(MICRO[- ]?ATX|M-ATX|MATX)\b/i.test(clean) || /[ABX]\d{3}M\b/i.test(clean)) {
    formFactor = 'Micro-ATX'
  } else if (/\b(MINI[- ]?ITX|ITX)\b/i.test(clean)) {
    formFactor = 'Mini-ITX'
  } else if (/\bE-ATX\b/i.test(clean)) {
    formFactor = 'E-ATX'
  } else if (/\bATX\b/i.test(clean)) {
    formFactor = 'ATX'
  }

  return { rawTitle: clean, socket, ramType, formFactor }
}

export function checkCompatibilityByTitle(
  candidateProduct: { title: string },
  activeSlotKey: string,
  selections: Record<string, { title: string }>,
): { isCompatible: boolean; reason?: string } {
  if (!selections || Object.keys(selections).length === 0) {
    return { isCompatible: true }
  }

  const slot = activeSlotKey.toLowerCase()
  const candidateSpecs = extractSpecsFromTitle(candidateProduct?.title || '')

  const selectedCpu = selections['cpu'] || selections['processor']
  const selectedMb = selections['motherboard'] || selections['mb']
  const selectedCase = selections['case'] || selections['chassis']

  // --- 1. Candidate CPU vs Selected Motherboard ---
  if ((slot === 'cpu' || slot === 'processor') && selectedMb?.title) {
    const mbSpecs = extractSpecsFromTitle(selectedMb.title)

    if (candidateSpecs.socket && mbSpecs.socket && candidateSpecs.socket !== mbSpecs.socket) {
      return {
        isCompatible: false,
        reason: `Socket mismatch (${candidateSpecs.socket}). Selected motherboard requires ${mbSpecs.socket}.`,
      }
    }
  }

  // --- 2. Candidate Motherboard vs Selected CPU ---
  if ((slot === 'motherboard' || slot === 'mb') && selectedCpu?.title) {
    const cpuSpecs = extractSpecsFromTitle(selectedCpu.title)

    if (candidateSpecs.socket && cpuSpecs.socket && candidateSpecs.socket !== cpuSpecs.socket) {
      return {
        isCompatible: false,
        reason: `Socket mismatch (${candidateSpecs.socket}). Selected CPU requires ${cpuSpecs.socket}.`,
      }
    }
  }

  // --- 3. Candidate RAM vs Selected Motherboard ---
  if (['ram', 'memory'].includes(slot) && selectedMb?.title) {
    const mbSpecs = extractSpecsFromTitle(selectedMb.title)

    if (candidateSpecs.ramType && mbSpecs.ramType && candidateSpecs.ramType !== mbSpecs.ramType) {
      return {
        isCompatible: false,
        reason: `Requires ${mbSpecs.ramType} memory.`,
      }
    }
  }

  // --- 4. Candidate Motherboard vs Selected Case ---
  if ((slot === 'motherboard' || slot === 'mb') && selectedCase?.title) {
    const caseSpecs = extractSpecsFromTitle(selectedCase.title)

    if (
      caseSpecs.formFactor === 'Mini-ITX' &&
      candidateSpecs.formFactor &&
      candidateSpecs.formFactor !== 'Mini-ITX'
    ) {
      return {
        isCompatible: false,
        reason: `Case only supports Mini-ITX motherboards.`,
      }
    }
  }

  return { isCompatible: true }
}

export { checkCompatibilityByTitle as checkCompatibility }
