'use client'

import React from 'react'
import {
  X,
  Scissors,
  Boxes,
  Layers,
  Building2,
  CheckCircle2,
  ArrowRight,
  MapPin,
  FileSpreadsheet,
  Package
} from 'lucide-react'
import { FabricAllocationItem, TrimAllocationItem } from '../actions'
import { getStoreAvatarInitials } from '../utils/storeUtils'

export type SelectedStoreDetail =
  | { type: 'FABRIC'; data: FabricAllocationItem }
  | { type: 'TRIM'; data: TrimAllocationItem }

interface StoreItemDetailModalProps {
  detail: SelectedStoreDetail | null
  isOpen: boolean
  onClose: () => void
  onOpenAssignModal?: (fabric: FabricAllocationItem) => void
  companyName: string
}

export function StoreItemDetailModal({
  detail,
  isOpen,
  onClose,
  onOpenAssignModal,
  companyName
}: StoreItemDetailModalProps) {
  if (!isOpen || !detail) return null

  const isFabric = detail.type === 'FABRIC'
  const fabric = isFabric ? (detail.data as FabricAllocationItem) : null
  const trim = !isFabric ? (detail.data as TrimAllocationItem) : null

  const itemName = isFabric ? fabric!.fabricType : trim!.itemName
  const categoryOrColor = isFabric ? fabric!.color : trim!.category
  const unit = isFabric ? 'meters' : trim!.unit
  const totalStock = isFabric ? fabric!.totalMeters : trim!.totalInStore
  const assignedQty = isFabric ? fabric!.bookedMeters : trim!.assignedQuantity
  const freeQty = isFabric ? fabric!.availableMeters : trim!.freeQuantity
  const allocPercent = isFabric ? fabric!.allocationPercentage : trim!.allocationPercentage
  const assignedArticle = isFabric ? fabric!.bookedForArticle : trim!.assignedArticle
  const isAssigned = Boolean(assignedArticle) && assignedQty > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] text-[#0B1220] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0 font-bold font-mono text-sm tracking-wide">
              {getStoreAvatarInitials(itemName)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-[#0B1220] truncate">
                  {itemName}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  {categoryOrColor}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isFabric ? 'Godown Fabric Stock & Allocation' : 'Required BOM Trim Details'} • {companyName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Top 3 Metric Tiles */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total in Store
              </span>
              <div className="text-base sm:text-lg font-extrabold font-mono text-[#0B1220]">
                {totalStock.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-slate-500">{unit}</span>
              </div>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 text-center space-y-0.5">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                Assigned
              </span>
              <div className="text-base sm:text-lg font-extrabold font-mono text-[#1D4ED8]">
                {assignedQty.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-blue-600">{unit}</span>
              </div>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-center space-y-0.5">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Free Left
              </span>
              <div className="text-base sm:text-lg font-extrabold font-mono text-emerald-800">
                {freeQty.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-emerald-600">{unit}</span>
              </div>
            </div>
          </div>

          {/* Article Allocation Progress Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#14C8B4] shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">
                  Target Article:
                </span>
                {isAssigned ? (
                  <span className="font-mono font-bold text-[#0B1220] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-xs">
                    {assignedArticle}
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">Free Godown Stock</span>
                )}
              </div>
              <span className="text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-full shadow-2xs text-[#0B1220] bg-[#F0FDFA] border border-[#14C8B4]/40">
                {allocPercent}% Allocated
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                <span>{assignedQty.toLocaleString('en-IN')} {unit} assigned</span>
                <span>{freeQty.toLocaleString('en-IN')} {unit} free</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1D4ED8] h-full rounded-full transition-all duration-500"
                  style={{ width: `${allocPercent}%` }}
                />
              </div>
            </div>

            {isFabric && fabric?.articlePo && (
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
                <span>Purchase Order (PO):</span>
                <span className="font-mono font-bold text-[#0B1220]">{fabric.articlePo}</span>
              </div>
            )}
          </div>

          {/* Warehouse & Inventory Specifications */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
              Warehouse &amp; Supply Details
            </span>

            {isFabric ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 block">Godown Rack Location</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {fabric?.rackLocation || 'General Store'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Rolls Count</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {fabric?.totalRolls || 1} rolls
                  </span>
                </div>
                {fabric?.supplierName && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Supplier / Mill</span>
                    <span className="font-semibold text-slate-800">{fabric.supplierName}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Category</span>
                    <span className="font-semibold text-slate-800">{trim?.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Counting Unit</span>
                    <span className="font-mono font-bold text-slate-800">{trim?.unit}</span>
                  </div>
                </div>
                {trim?.notes && (
                  <div>
                    <span className="text-slate-500 block">BOM Notes &amp; Placement</span>
                    <span className="font-medium text-slate-700">{trim.notes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>

          {isFabric && onOpenAssignModal && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenAssignModal(fabric!)
              }}
              className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <span>Assign / Edit Allocation</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
