'use client'

import {
  PrintingProductionRun,
  PrintingScreen,
  StrikeOffTest,
  InkRecipe,
  CuringOvenLog
} from '../types/printing'
import {
  INITIAL_PRINTING_RUNS,
  INITIAL_SCREENS,
  INITIAL_STRIKE_OFFS,
  INITIAL_INK_RECIPES,
  INITIAL_CURING_LOGS
} from '../data/initialData'

const RUNS_KEY = 'zigza_printing_runs_v1'
const SCREENS_KEY = 'zigza_printing_screens_v1'
const STRIKE_OFFS_KEY = 'zigza_printing_strike_offs_v1'
const INK_RECIPES_KEY = 'zigza_printing_ink_recipes_v1'
const CURING_LOGS_KEY = 'zigza_printing_curing_logs_v1'

export const PRINTING_UPDATE_EVENT = 'zigza:printing_updated'

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PRINTING_UPDATE_EVENT))
  }
}

// 1. Production Runs
export function getProductionRuns(): PrintingProductionRun[] {
  if (typeof window === 'undefined') return INITIAL_PRINTING_RUNS
  try {
    const stored = localStorage.getItem(RUNS_KEY)
    if (!stored) {
      localStorage.setItem(RUNS_KEY, JSON.stringify(INITIAL_PRINTING_RUNS))
      return INITIAL_PRINTING_RUNS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_PRINTING_RUNS
  } catch {
    return INITIAL_PRINTING_RUNS
  }
}

export function saveProductionRun(run: PrintingProductionRun): PrintingProductionRun[] {
  const current = getProductionRuns()
  const index = current.findIndex(item => item.id === run.id)
  let updated: PrintingProductionRun[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = run
  } else {
    updated = [run, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(RUNS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 2. Screen & Stencil Library
export function getScreens(): PrintingScreen[] {
  if (typeof window === 'undefined') return INITIAL_SCREENS
  try {
    const stored = localStorage.getItem(SCREENS_KEY)
    if (!stored) {
      localStorage.setItem(SCREENS_KEY, JSON.stringify(INITIAL_SCREENS))
      return INITIAL_SCREENS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_SCREENS
  } catch {
    return INITIAL_SCREENS
  }
}

export function saveScreen(screen: PrintingScreen): PrintingScreen[] {
  const current = getScreens()
  const index = current.findIndex(item => item.id === screen.id)
  let updated: PrintingScreen[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = screen
  } else {
    updated = [screen, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(SCREENS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 3. Strike-Off Lab Approvals
export function getStrikeOffs(): StrikeOffTest[] {
  if (typeof window === 'undefined') return INITIAL_STRIKE_OFFS
  try {
    const stored = localStorage.getItem(STRIKE_OFFS_KEY)
    if (!stored) {
      localStorage.setItem(STRIKE_OFFS_KEY, JSON.stringify(INITIAL_STRIKE_OFFS))
      return INITIAL_STRIKE_OFFS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_STRIKE_OFFS
  } catch {
    return INITIAL_STRIKE_OFFS
  }
}

export function saveStrikeOff(test: StrikeOffTest): StrikeOffTest[] {
  const current = getStrikeOffs()
  const index = current.findIndex(item => item.id === test.id)
  let updated: StrikeOffTest[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = test
  } else {
    updated = [test, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STRIKE_OFFS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 4. Ink Kitchen & Recipes
export function getInkRecipes(): InkRecipe[] {
  if (typeof window === 'undefined') return INITIAL_INK_RECIPES
  try {
    const stored = localStorage.getItem(INK_RECIPES_KEY)
    if (!stored) {
      localStorage.setItem(INK_RECIPES_KEY, JSON.stringify(INITIAL_INK_RECIPES))
      return INITIAL_INK_RECIPES
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_INK_RECIPES
  } catch {
    return INITIAL_INK_RECIPES
  }
}

export function saveInkRecipe(recipe: InkRecipe): InkRecipe[] {
  const current = getInkRecipes()
  const index = current.findIndex(item => item.id === recipe.id)
  let updated: InkRecipe[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = recipe
  } else {
    updated = [recipe, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(INK_RECIPES_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 5. Curing Oven & Fastness QC
export function getCuringLogs(): CuringOvenLog[] {
  if (typeof window === 'undefined') return INITIAL_CURING_LOGS
  try {
    const stored = localStorage.getItem(CURING_LOGS_KEY)
    if (!stored) {
      localStorage.setItem(CURING_LOGS_KEY, JSON.stringify(INITIAL_CURING_LOGS))
      return INITIAL_CURING_LOGS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_CURING_LOGS
  } catch {
    return INITIAL_CURING_LOGS
  }
}

export function saveCuringLog(log: CuringOvenLog): CuringOvenLog[] {
  const current = getCuringLogs()
  const index = current.findIndex(item => item.id === log.id)
  let updated: CuringOvenLog[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = log
  } else {
    updated = [log, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURING_LOGS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}
