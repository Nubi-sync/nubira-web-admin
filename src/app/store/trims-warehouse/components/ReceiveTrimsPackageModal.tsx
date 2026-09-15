'use client'

import React, { useState, useEffect } from 'react'
import { X, Tag, Package, CheckCircle2, Sparkles, Zap, Boxes } from 'lucide-react'
import { TrimsInventoryItem, TrimCategory } from '../../types/store'
import { saveTrimsItem } from '../../utils/storeStorage'
import { getOrders } from '@/app/merchandising/utils/merchandisingStorage'

interface ReceiveTrimsPackageModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ReceiveTrimsPackageModal({ isOpen, onClose, onSuccess }: ReceiveTrimsPackageModalProps) {
  const [activePo, setActivePo] = useState('PO-2026-9901')
  const [itemCode, setItemCode] = useState('TRM-DRW-2026-01')
  const [itemName, setItemName] = useState('15mm Cotton Flat Drawcord with Gunmetal Aglets')
  const [category, setCategory] = useState<TrimCategory>('ELASTIC_TAPE')
  const [binLocation, setBinLocation] = useState('Rack T-12')
  const [currentStock, setCurrentStock] = useState<number>(1000)
  const [reorderLevel, setReorderLevel] = useState<number>(200)
  const [unit, setUnit] = useState('pcs')
  const [supplierName, setSupplierName] = useState('Vardhman Trim Div')
  const [leadTimeDays, setLeadTimeDays] = useState<number>(5)
  const [color, setColor] = useState('Black / Aglets')
  const [unitCostInr, setUnitCostInr] = useState<number>(12.5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return
    const orders = getOrders()
    const latestPo = orders.find(o => o.po_number === 'PO-2026-9901') || orders[0]
    if (latestPo) {
      setActivePo(latestPo.po_number)
      setCurrentStock(latestPo.total_quantity || 1000)
      setReorderLevel(Math.round((latestPo.total_quantity || 1000) * 0.2))
    }
  }, [isOpen])

  const applyPreset = (preset: 'DRAWCORD' | 'LABEL' | 'THREAD' | 'POLYBAG') => {
    if (preset === 'DRAWCORD') {
      setItemCode('TRM-DRW-2026-01')
      setItemName('15mm Cotton Flat Drawcord with Gunmetal Aglets')
      setCategory('ELASTIC_TAPE')
      setBinLocation('Rack T-12')
      setCurrentStock(1000)
      setReorderLevel(200)
      setUnit('pcs')
      setSupplierName('Vardhman Trim Div')
      setColor('Gunmetal / Black')
      setUnitCostInr(12.5)
    } else if (preset === 'LABEL') {
      setItemCode('TRM-LBL-2026-02')
      setItemName('HD Damask Woven Main Brand & Size Labels')
      setCategory('LABELS')
      setBinLocation('Bin L-04')
      setCurrentStock(1000)
      setReorderLevel(250)
      setUnit('pcs')
      setSupplierName('Avery Dennison')
      setColor('Black / White')
      setUnitCostInr(4.2)
    } else if (preset === 'THREAD') {
      setItemCode('TRM-THD-2026-03')
      setItemName('Epic 120 Spun Poly Sewing Thread Cones')
      setCategory('SEWING_THREAD')
      setBinLocation('Bin S-02')
      setCurrentStock(50)
      setReorderLevel(10)
      setUnit('cones')
      setSupplierName('Coats India')
      setColor('Orange / Green')
      setUnitCostInr(180)
    } else if (preset === 'POLYBAG') {
      setItemCode('TRM-PKG-2026-04')
      setItemName('Self-Adhesive Warning Printed Polybags (14x18)')
      setCategory('PACKAGING')
      setBinLocation('Rack P-01')
      setCurrentStock(1000)
      setReorderLevel(200)
      setUnit('pcs')
      setSupplierName('Shree Packaging Ltd')
      setColor('Transparent')
      setUnitCostInr(3.8)
    }
  }

  const handleReceiveAllStandardTrims = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const allTrims: TrimsInventoryItem[] = [
        {
          id: `trm-drw-${Date.now()}`,
          itemCode: 'TRM-DRW-2026-01',
          itemName: '15mm Cotton Flat Drawcord with Gunmetal Aglets',
          category: 'ELASTIC_TAPE',
          binLocation: 'Rack T-12',
          currentStock: 1000,
          reorderLevel: 200,
          unit: 'pcs',
          supplierName: 'Vardhman Trim Div',
          leadTimeDays: 5,
          lastReplenishedAt: new Date().toISOString().split('T')[0],
          color: 'Gunmetal / Black',
          unitCostInr: 12.5
        },
        {
          id: `trm-lbl-${Date.now() + 1}`,
          itemCode: 'TRM-LBL-2026-02',
          itemName: 'HD Damask Woven Main Brand & Size Labels',
          category: 'LABELS',
          binLocation: 'Bin L-04',
          currentStock: 1000,
          reorderLevel: 250,
          unit: 'pcs',
          supplierName: 'Avery Dennison',
          leadTimeDays: 7,
          lastReplenishedAt: new Date().toISOString().split('T')[0],
          color: 'Black / White',
          unitCostInr: 4.2
        },
        {
          id: `trm-thd-${Date.now() + 2}`,
          itemCode: 'TRM-THD-2026-03',
          itemName: 'Epic 120 Spun Poly Sewing Thread Cones',
          category: 'SEWING_THREAD',
          binLocation: 'Bin S-02',
          currentStock: 50,
          reorderLevel: 10,
          unit: 'cones',
          supplierName: 'Coats India',
          leadTimeDays: 3,
          lastReplenishedAt: new Date().toISOString().split('T')[0],
          color: 'Orange / Green',
          unitCostInr: 180
        },
        {
          id: `trm-pkg-${Date.now() + 3}`,
          itemCode: 'TRM-PKG-2026-04',
          itemName: 'Self-Adhesive Warning Printed Polybags (14x18)',
          category: 'PACKAGING',
          binLocation: 'Rack P-01',
          currentStock: 1000,
          reorderLevel: 200,
          unit: 'pcs',
          supplierName: 'Shree Packaging Ltd',
          leadTimeDays: 4,
          lastReplenishedAt: new Date().toISOString().split('T')[0],
          color: 'Transparent',
          unitCostInr: 3.8
        }
      ]

      for (const t of allTrims) {
        saveTrimsItem(t)
      }

      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to receive all trims:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newItem: TrimsInventoryItem = {
        id: `trim-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        itemCode: itemCode.trim() || `TRM-${Date.now().toString().slice(-6)}`,
        itemName: itemName.trim(),
        category,
        binLocation: binLocation.trim() || 'Bin General',
        currentStock: Number(currentStock) || 100,
        reorderLevel: Number(reorderLevel) || 20,
        unit: unit.trim() || 'pcs',
        supplierName: supplierName.trim() || 'Vendor',
        leadTimeDays: Number(leadTimeDays) || 5,
        lastReplenishedAt: new Date().toISOString().split('T')[0],
        color: color.trim() || undefined,
        unitCostInr: Number(unitCostInr) || undefined
      }

      saveTrimsItem(newItem)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to inward trim item:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-bold shadow-2xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-[family-name:var(--font-heading)]">
                Receive Trims Package &amp; Inward Stock
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Linked Order: <span className="font-bold text-[#3A3564]">{activePo}</span> • Central Trims Warehouse
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-black/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3A3564]" />
              Quick Fill BOM Trims for {activePo}:
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              Step 3.2 Presets
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => applyPreset('DRAWCORD')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all shadow-2xs cursor-pointer ${
                itemCode === 'TRM-DRW-2026-01'
                  ? 'bg-[#3A3564] text-white border-[#3A3564]'
                  : 'bg-white text-slate-800 border-black/10 hover:bg-[#FAF7F0]'
              }`}
            >
              15mm Drawcords (1,000 pcs)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('LABEL')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all shadow-2xs cursor-pointer ${
                itemCode === 'TRM-LBL-2026-02'
                  ? 'bg-[#3A3564] text-white border-[#3A3564]'
                  : 'bg-white text-slate-800 border-black/10 hover:bg-[#FAF7F0]'
              }`}
            >
              Woven Labels (1,000 pcs)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('THREAD')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all shadow-2xs cursor-pointer ${
                itemCode === 'TRM-THD-2026-03'
                  ? 'bg-[#3A3564] text-white border-[#3A3564]'
                  : 'bg-white text-slate-800 border-black/10 hover:bg-[#FAF7F0]'
              }`}
            >
              Sewing Thread (50 Cones)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('POLYBAG')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all shadow-2xs cursor-pointer ${
                itemCode === 'TRM-PKG-2026-04'
                  ? 'bg-[#3A3564] text-white border-[#3A3564]'
                  : 'bg-white text-slate-800 border-black/10 hover:bg-[#FAF7F0]'
              }`}
            >
              Polybags (1,000 pcs)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Item Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trim Item Description / Specification
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
                placeholder="e.g. 15mm Cotton Flat Drawcord with Gunmetal Aglets"
              />
            </div>

            {/* Item Code */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Item Code / SKU #
              </label>
              <input
                type="text"
                required
                value={itemCode}
                onChange={e => setItemCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
                placeholder="e.g. TRM-DRW-2026-01"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trim Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TrimCategory)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
              >
                <option value="ELASTIC_TAPE">Elastic Tape &amp; Drawcords</option>
                <option value="LABELS">Woven &amp; Printed Labels</option>
                <option value="SEWING_THREAD">Sewing Threads</option>
                <option value="ZIPPERS">Zippers &amp; Fasteners</option>
                <option value="BUTTONS">Buttons &amp; Rivets</option>
                <option value="PACKAGING">Polybags &amp; Cartons</option>
                <option value="INTERLINING">Interlining / Fusing</option>
              </select>
            </div>

            {/* Inward Qty & Unit */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Inward Stock Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                value={currentStock}
                onChange={e => setCurrentStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit of Measure (UOM)
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="cones">Cones (thread)</option>
                <option value="meters">Meters (m)</option>
                <option value="gross">Gross (144 pcs)</option>
                <option value="sets">BOM Sets</option>
              </select>
            </div>

            {/* Warehouse Bin Location */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Warehouse Bin / Rack Location
              </label>
              <input
                type="text"
                required
                value={binLocation}
                onChange={e => setBinLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
                placeholder="e.g. Rack T-12"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trim Mill Supplier
              </label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
                placeholder="e.g. Vardhman Trim Div"
              />
            </div>

            {/* ROL Threshold */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Re-Order Level (ROL Alert Threshold)
              </label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={e => setReorderLevel(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Color / Finish (Optional)
              </label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
                placeholder="e.g. Gunmetal / Black"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-black/10">
            <button
              type="button"
              onClick={handleReceiveAllStandardTrims}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-mono font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] rounded-xl border border-black/10 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-[#3A3564]" />
              <span>Receive All BOM Trims Package (1-Click)</span>
            </button>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 bg-[#FAF7F0] hover:bg-[#F2ECE1] rounded-xl border border-black/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-mono font-bold text-white bg-[#3A3564] hover:bg-[#2c284e] rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Trims Batch into {binLocation || 'Warehouse'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
