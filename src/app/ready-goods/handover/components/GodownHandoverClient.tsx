'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Warehouse,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  Plus,
  Truck,
  Boxes,
  Eye,
  FileCheck2,
  ArrowRight
} from 'lucide-react'
import { getHandoverPallets, READY_GOODS_UPDATE_EVENT } from '../../utils/readyGoodsStorage'
import { GodownHandoverPallet } from '../../types/readyGoods'
import { CreatePalletModal } from './CreatePalletModal'

interface GodownHandoverClientProps {
  userEmail?: string
}

export function GodownHandoverClient({ userEmail }: GodownHandoverClientProps) {
  const [pallets, setPallets] = useState<GodownHandoverPallet[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPallet, setSelectedPallet] = useState<GodownHandoverPallet | null>(null)

  function loadPallets() {
    setPallets(getHandoverPallets())
  }

  useEffect(() => {
    loadPallets()
    const handleUpdate = () => loadPallets()
    window.addEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredPallets = pallets.filter(pallet => {
    return (
      pallet.palletCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pallet.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pallet.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pallet.targetBay.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pallet.supervisorSignoff.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const totalPalletCartons = pallets.reduce((acc, p) => acc + p.totalCartons, 0)
  const totalPalletPieces = pallets.reduce((acc, p) => acc + p.totalPieces, 0)
  const totalWeight = pallets.reduce((acc, p) => acc + p.totalGrossWeightKg, 0).toFixed(1)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/ready-goods"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Ready Goods Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          Central Godown Handover • Bay 3–5 Stacking
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Central Godown Handover
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                Container Dock Handshake
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Transfer AQL-cleared sealed export cartons into Central Store Godown Bay 3–5 and generate gate passes for container stuffing
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Pallet Gate Pass</span>
        </button>
      </div>

      {/* 4 Handover Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Pallets Staged
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {pallets.length} Pallets
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">{totalPalletCartons} Cartons Bound</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Garments Transferred
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            {totalPalletPieces.toLocaleString()} pcs
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">100% AQL Cleared</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Staged Gross Weight
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {totalWeight} kg
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Weighbridge Verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Next Portal Destination
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            Central Store
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Division 11 Ready</p>
        </div>
      </div>

      {/* Main Table: Pallet Manifests */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Pallet Manifest & Dispatch Challans
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                {filteredPallets.length} Pallets Recorded
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized pallet transfers into Central Godown Bay 3–5 with verified carton counts
            </p>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Pallet #, PO, Buyer, Bay..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Pallet Barcode</th>
                <th className="py-3 px-4">Order PO & Buyer</th>
                <th className="py-3 px-4">Cartons Contained</th>
                <th className="py-3 px-4">Total Garments</th>
                <th className="py-3 px-4">Gross Wt & CBM</th>
                <th className="py-3 px-4">Godown Bay</th>
                <th className="py-3 px-4">Dock Gate</th>
                <th className="py-3 px-4">Gate Pass Status</th>
                <th className="py-3 px-4">Supervisor</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredPallets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No pallet handovers recorded matching your search.
                  </td>
                </tr>
              ) : (
                filteredPallets.map(pallet => (
                  <tr
                    key={pallet.id}
                    className="hover:bg-[#FAF7F0]/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedPallet(pallet)}
                  >
                    <td className="py-3 px-4 font-mono font-black text-[#3A3564] flex items-center gap-2">
                      <QrCode className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pallet.palletCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">{pallet.orderNumber}</span>
                      <div className="text-[11px] text-slate-500">{pallet.buyer}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {pallet.cartonNumbers.map(cN => (
                          <span
                            key={cN}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold"
                          >
                            {cN}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {pallet.totalPieces} pcs
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900">{pallet.totalGrossWeightKg.toFixed(2)} kg</div>
                      <div className="text-[10px] text-slate-400">{pallet.totalCbm.toFixed(3)} m³</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                      {pallet.targetBay}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {pallet.dockGate}
                    </td>
                    <td className="py-3 px-4">
                      {pallet.gatePassStatus === 'READY_FOR_STUFFING' ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          READY FOR STUFFING
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold border border-sky-200">
                          {pallet.gatePassStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {pallet.supervisorSignoff}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                      {pallet.handoverDate}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pallet Detail Modal */}
      {selectedPallet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setSelectedPallet(null)}
        >
          <div
            className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-[#3A3564]" />
                <h3 className="text-lg font-black text-slate-900">
                  Pallet {selectedPallet.palletCode}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPallet(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-mono">Purchase Order:</span>
                <div className="font-mono font-bold text-slate-900">{selectedPallet.orderNumber}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Buyer:</span>
                <div className="font-bold text-slate-900">{selectedPallet.buyer}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Total Cartons:</span>
                <div className="font-mono font-bold text-slate-900">{selectedPallet.totalCartons} Cartons</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Total Garments:</span>
                <div className="font-mono font-bold text-slate-900">{selectedPallet.totalPieces} pcs</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Gross Weight:</span>
                <div className="font-mono font-bold text-slate-900">{selectedPallet.totalGrossWeightKg} kg</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Volume (CBM):</span>
                <div className="font-mono font-bold text-slate-900">{selectedPallet.totalCbm} m³</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Assigned Godown Bay:</span>
                <div className="font-mono font-bold text-[#3A3564]">{selectedPallet.targetBay}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Dock Gate:</span>
                <div className="font-mono font-bold text-slate-900">{selectedPallet.dockGate}</div>
              </div>
            </div>

            <div className="border-t border-black/10 pt-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Cartons in Pallet Staging
              </span>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {selectedPallet.cartonNumbers.map(cN => (
                  <span
                    key={cN}
                    className="px-2.5 py-1 rounded bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564]"
                  >
                    {cN}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-black/10 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Signoff: {selectedPallet.supervisorSignoff}</span>
              <span>{selectedPallet.handoverDate}</span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPallet(null)}
                className="px-4 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e]"
              >
                Close Gate Pass
              </button>
            </div>
          </div>
        </div>
      )}

      <CreatePalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadPallets}
      />
    </div>
  )
}
