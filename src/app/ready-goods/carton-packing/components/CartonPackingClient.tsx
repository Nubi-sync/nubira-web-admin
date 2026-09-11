'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PackageCheck,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  Plus,
  Boxes,
  Scale,
  Warehouse,
  Eye,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react'
import { getReadyGoodsCartons, READY_GOODS_UPDATE_EVENT } from '../../utils/readyGoodsStorage'
import { ReadyGoodsCarton } from '../../types/readyGoods'
import { SealCartonModal } from './SealCartonModal'

interface CartonPackingClientProps {
  userEmail?: string
}

export function CartonPackingClient({ userEmail }: CartonPackingClientProps) {
  const [cartons, setCartons] = useState<ReadyGoodsCarton[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [bayFilter, setBayFilter] = useState('ALL')
  const [selectedCarton, setSelectedCarton] = useState<ReadyGoodsCarton | null>(null)

  function loadCartons() {
    setCartons(getReadyGoodsCartons())
  }

  useEffect(() => {
    loadCartons()
    const handleUpdate = () => loadCartons()
    window.addEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredCartons = cartons.filter(carton => {
    const matchesBay =
      bayFilter === 'ALL' ||
      carton.godownBay === bayFilter ||
      (bayFilter === 'AQL_PASSED' && carton.status === 'AQL_AUDIT_PASSED') ||
      (bayFilter === 'QUARANTINED' && carton.status === 'QUARANTINED_AQL_FAILED')

    const matchesSearch =
      carton.cartonNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      carton.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      carton.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      carton.styleName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesBay && matchesSearch
  })

  const totalPcs = cartons.reduce((acc, c) => acc + c.totalPieces, 0)
  const totalCbm = cartons.reduce((acc, c) => acc + (c.cbmVolume || 0.08), 0).toFixed(2)

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
          Conveyor Lines • Master Export Carton Manifest
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Carton Packing Manifest
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                GS1-128 & Barcode Sealing
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Zero Ghost Piece bundle-to-carton bindings, ratio assortment distributions, and digital weighbridge integration
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Seal & Register Carton (Form 2)</span>
        </button>
      </div>

      {/* 4 Carton Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total Sealed Cartons
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {cartons.length} Master Cartons
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">{totalPcs.toLocaleString()} Garments Packed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Export CBM Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {totalCbm} m³
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Ready for Container Stuffing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Weighbridge Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            97.8% OK
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Within ±0.15 kg BOM Target</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Godown Bay Stacking
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            Bays 3, 4, 5
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">High-Rack Storage Active</p>
        </div>
      </div>

      {/* Main Table: Carton Packing Manifest */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Live Conveyor Carton Packing Manifest
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                {filteredCartons.length} Cartons Shown
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Physical carton packing records linked with scanned cutting bundles and digital weighbridge variance
            </p>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search CTN #, PO, Buyer, Style..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] font-mono"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-black/5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Bays' },
            { id: 'BAY_3', label: 'Bay 3 (Hoodies)' },
            { id: 'BAY_4', label: 'Bay 4 (Tees)' },
            { id: 'BAY_5', label: 'Bay 5 (Bottoms)' },
            { id: 'AQL_PASSED', label: 'AQL Cleared' },
            { id: 'QUARANTINED', label: 'Quarantined' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setBayFilter(tab.id)}
              className={`px-3 py-2 text-xs font-mono font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                bayFilter === tab.id
                  ? 'border-[#3A3564] text-[#3A3564] bg-[#FAF7F0]/60'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Manifest Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Carton Barcode</th>
                <th className="py-3 px-4">Order PO & Buyer</th>
                <th className="py-3 px-4">Garment & Color</th>
                <th className="py-3 px-4">Pieces & Ratio</th>
                <th className="py-3 px-4">Bundle Linkages</th>
                <th className="py-3 px-4">Measured vs BOM Wt</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Bay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredCartons.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No export cartons match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCartons.map(carton => {
                  const isVarianceOk = Math.abs(carton.weightVarianceKg) <= 0.15
                  return (
                    <tr
                      key={carton.id}
                      className="hover:bg-[#FAF7F0]/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedCarton(carton)}
                    >
                      <td className="py-3 px-4 font-mono font-black text-[#3A3564] flex items-center gap-2">
                        <QrCode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{carton.cartonNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900">{carton.orderNumber}</span>
                        <div className="text-[11px] text-slate-500">{carton.buyer}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{carton.styleName}</div>
                        <div className="text-[11px] text-slate-500">{carton.color}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{carton.totalPieces} pcs</div>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {Object.entries(carton.sizeBreakdown).map(([sz, qty]) => (
                            <span
                              key={sz}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {sz}:{qty}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {carton.packedBundleIds.map(bId => (
                            <span
                              key={bId}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-bold"
                            >
                              {bId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900">{carton.measuredGrossWeightKg.toFixed(2)} kg</div>
                        <div className="text-[10px] text-slate-400">BOM: {carton.expectedGrossWeightKg.toFixed(2)} kg</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            isVarianceOk
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {carton.weightVarianceKg >= 0 ? '+' : ''}
                          {carton.weightVarianceKg.toFixed(2)} kg
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                        {carton.godownBay}
                      </td>
                      <td className="py-3 px-4">
                        {carton.status === 'AQL_AUDIT_PASSED' && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            AQL PASSED
                          </span>
                        )}
                        {carton.status === 'QUARANTINED_AQL_FAILED' && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                            QUARANTINED
                          </span>
                        )}
                        {carton.status === 'PACKED' && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                            PACKED
                          </span>
                        )}
                        {carton.status === 'SHIPPED' && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold border border-sky-200">
                            SHIPPED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedCarton(carton)
                          }}
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-black/10 text-slate-700 text-xs font-mono font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carton Detail Modal */}
      {selectedCarton && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setSelectedCarton(null)}
        >
          <div
            className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-[#3A3564]" />
                <h3 className="text-lg font-black text-slate-900">
                  Carton {selectedCarton.cartonNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCarton(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-mono">PO & Buyer:</span>
                <div className="font-mono font-bold text-slate-900">
                  {selectedCarton.orderNumber} • {selectedCarton.buyer}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Style:</span>
                <div className="font-bold text-slate-900">{selectedCarton.styleName}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Total Garments:</span>
                <div className="font-mono font-bold text-slate-900">{selectedCarton.totalPieces} pcs</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Gross Weight:</span>
                <div className="font-mono font-bold text-slate-900">
                  {selectedCarton.measuredGrossWeightKg} kg (BOM: {selectedCarton.expectedGrossWeightKg} kg)
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Assigned Bay:</span>
                <div className="font-mono font-bold text-[#3A3564]">{selectedCarton.godownBay}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Status:</span>
                <div className="font-mono font-bold text-emerald-700">{selectedCarton.status}</div>
              </div>
            </div>

            <div className="border-t border-black/10 pt-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Ratio Assortment Breakdown
              </span>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {Object.entries(selectedCarton.sizeBreakdown).map(([sz, qty]) => (
                  <span
                    key={sz}
                    className="px-2.5 py-1 rounded bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564]"
                  >
                    Size {sz}: {qty} pcs
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-black/10 pt-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Zero Ghost Piece Linked Cutting Bundles
              </span>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {selectedCarton.packedBundleIds.map(bId => (
                  <span
                    key={bId}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-mono font-bold"
                  >
                    {bId}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-black/10 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Sealed by: {selectedCarton.sealedBy}</span>
              <span>{selectedCarton.createdAt}</span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Link
                href="/ready-goods/aql-inspection"
                className="px-3 py-1.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e]"
              >
                Perform AQL Audit
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Form 2 Modal */}
      <SealCartonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadCartons}
      />
    </div>
  )
}
