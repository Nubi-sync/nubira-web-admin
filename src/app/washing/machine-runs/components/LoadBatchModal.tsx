'use client'

import { useState, useEffect } from 'react'
import { X, Check, Cpu, Droplets, Thermometer, Clock } from 'lucide-react'
import { WashBatch, WasherMachine, WashRecipe } from '../../types/washing'
import {
  saveWashBatch,
  getWasherMachines,
  getWashRecipes,
  saveWasherMachine,
} from '../../utils/washingStorage'

interface LoadBatchModalProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_CHALLANS = [
  { id: 'CH-2026-905', article: 'Heavyweight Pullover Hoodie 420 GSM', color: 'Vintage Black', pcs: 950, defaultDryWeight: 475 },
  { id: 'CH-2026-906', article: 'Drop-Shoulder Oversized Tee', color: 'Washed Sage', pcs: 1600, defaultDryWeight: 380 },
  { id: 'CH-2026-907', article: 'Relaxed Cargo Jogger Pants', color: 'Desert Khaki', pcs: 1100, defaultDryWeight: 510 },
  { id: 'CH-2026-908', article: 'Waffle Knit Thermal Long Sleeve', color: 'Off-White', pcs: 1300, defaultDryWeight: 420 },
]

const OPERATORS = [
  'Ramesh Mondal (Laundry Master)',
  'Bikash Roy (Wet Process Spec)',
  'Sunil Das (Floor In-Charge)',
  'Tarun Bera (Chemical Dosing Tech)',
]

export function LoadBatchModal({ isOpen, onClose }: LoadBatchModalProps) {
  const [machines, setMachines] = useState<WasherMachine[]>([])
  const [recipes, setRecipes] = useState<WashRecipe[]>([])

  // Form State
  const [batchNumber, setBatchNumber] = useState(`WB-${Math.floor(40210 + Math.random() * 80)}`)
  const [washerMachineId, setWasherMachineId] = useState('Washer 04')
  const [selectedChallanId, setSelectedChallanId] = useState(SAMPLE_CHALLANS[0].id)
  const [operatorName, setOperatorName] = useState(OPERATORS[0])
  const [dryWeightKg, setDryWeightKg] = useState(SAMPLE_CHALLANS[0].defaultDryWeight)
  const [recipeName, setRecipeName] = useState('')
  const [tumblerTempC, setTumblerTempC] = useState(65)
  const [cycleDurationMinutes, setCycleDurationMinutes] = useState(45)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const loadedMachines = getWasherMachines()
    const loadedRecipes = getWashRecipes()
    setMachines(loadedMachines)
    setRecipes(loadedRecipes)
    if (loadedRecipes.length > 0 && !recipeName) {
      setRecipeName(loadedRecipes[0].recipeName)
    }
    // Find first idle washer
    const idleWasher = loadedMachines.find(m => m.type === 'WASHER' && m.status === 'IDLE')
    if (idleWasher) {
      setWasherMachineId(idleWasher.name)
    }
  }, [isOpen])

  // Auto-calculate Water Volume (1 : 5.0 ratio standard)
  const autoWaterLiters = Math.round(dryWeightKg * 5.0)

  if (!isOpen) return null

  const activeChallan = SAMPLE_CHALLANS.find(c => c.id === selectedChallanId) || SAMPLE_CHALLANS[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate batch_number pattern: ^WB-[0-9]{5}$
    const pattern = /^WB-[0-9]{5}$/
    if (!pattern.test(batchNumber)) {
      alert('Batch Number must follow standard pattern WB-XXXXX (e.g. WB-40215)')
      return
    }

    const newBatch: WashBatch = {
      id: `batch-${Date.now()}`,
      batchNumber,
      challanId: selectedChallanId,
      articleName: activeChallan.article,
      color: activeChallan.color,
      totalPieces: activeChallan.pcs,
      washerMachineId,
      operatorName: operatorName.split(' (')[0],
      recipeName: recipeName || 'Bio-Enzyme Wash 55°C',
      dryWeightKg: Number(dryWeightKg),
      waterVolumeLiters: autoWaterLiters,
      tumblerTempC: Number(tumblerTempC),
      cycleDurationMinutes: Number(cycleDurationMinutes),
      status: 'WASHING',
      stageTimeRemainingMin: Number(cycleDurationMinutes),
      startedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes,
    }

    saveWashBatch(newBatch)

    // Also update machine status to RUNNING
    const targetMachine = machines.find(m => m.name === washerMachineId)
    if (targetMachine) {
      saveWasherMachine({
        ...targetMachine,
        status: 'RUNNING',
        currentBatchNumber: batchNumber,
        currentRecipe: recipeName,
        timeRemainingMin: Number(cycleDurationMinutes),
        tempC: 55,
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden my-8">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Form 1 • Wash Batch Run Logging Form
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Load new garment batch into industrial tumbler drum
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Batch Number */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Batch Number *
              </label>
              <input
                type="text"
                pattern="^WB-[0-9]{5}$"
                placeholder="WB-40215"
                value={batchNumber}
                onChange={e => setBatchNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              />
              <span className="text-[10px] text-slate-400 font-mono">Pattern: WB-XXXXX</span>
            </div>

            {/* Washer Machine ID */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Tumbler Drum Machine *
              </label>
              <select
                value={washerMachineId}
                onChange={e => setWasherMachineId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              >
                {['Washer 01', 'Washer 02', 'Washer 03', 'Washer 04', 'Washer 05', 'Washer 06'].map(w => (
                  <option key={w} value={w}>
                    {w} (600 kg Capacity)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sewing Challan ID */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Inward Sewing Challan Lot *
            </label>
            <select
              value={selectedChallanId}
              onChange={e => {
                setSelectedChallanId(e.target.value)
                const c = SAMPLE_CHALLANS.find(sc => sc.id === e.target.value)
                if (c) setDryWeightKg(c.defaultDryWeight)
              }}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            >
              {SAMPLE_CHALLANS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} • {c.article} ({c.color}) - {c.pcs} pcs
                </option>
              ))}
            </select>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Selected Garment: {activeChallan.article}</span>
              <span className="font-bold text-[#3A3564]">{activeChallan.pcs} pcs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Operator */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Washing Technician / Operator *
              </label>
              <select
                value={operatorName}
                onChange={e => setOperatorName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              >
                {OPERATORS.map(op => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipe Selection */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Approved Wash Recipe *
              </label>
              <select
                value={recipeName}
                onChange={e => setRecipeName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              >
                {recipes.map(r => (
                  <option key={r.id} value={r.recipeName}>
                    {r.recipeCode} - {r.recipeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dry Weight & Auto-Calculated Water Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Dry Weight Loaded (kg) *
              </label>
              <input
                type="number"
                min="50"
                max="650"
                value={dryWeightKg}
                onChange={e => setDryWeightKg(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
              <span className="text-[10px] text-slate-500">Min: 50 kg, Max: 650 kg</span>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>Water Volume (Liters)</span>
                <span className="text-[10px] font-bold text-emerald-700">1:5.0 Auto-calc</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  readOnly
                  value={autoWaterLiters}
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-[#3A3564] rounded-lg border border-black/10 bg-white/70 cursor-not-allowed"
                />
                <Droplets className="w-3.5 h-3.5 text-blue-600 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {dryWeightKg} kg × 5.0 = {autoWaterLiters} L water
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tumbler Temp */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Tumbler Temp (°C)
              </label>
              <input
                type="number"
                min="40"
                max="85"
                value={tumblerTempC}
                onChange={e => setTumblerTempC(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400">Standard: 65°C thermal curve</span>
            </div>

            {/* Cycle Duration */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Wash Cycle (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="120"
                value={cycleDurationMinutes}
                onChange={e => setCycleDurationMinutes(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400">Typical: 30 - 60 min</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Floor Notes & Special Finishes
            </label>
            <input
              type="text"
              placeholder="e.g. Extra enzyme rinse requested by brand QC"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Initiate Wash Run</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
