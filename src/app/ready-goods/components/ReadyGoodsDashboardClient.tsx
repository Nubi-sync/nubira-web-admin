'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Boxes,
  ChevronLeft,
  PackageCheck,
  CheckCircle2,
  Tag,
  ArrowRight,
  Warehouse,
  Truck,
  AlertTriangle,
  Search,
  Scale,
  ShieldCheck,
  Layers,
  Sparkles,
  QrCode,
  Check,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react'
import {
  getReadyGoodsCartons,
  getAqlAudits,
  getReadyGoodsMetrics,
  READY_GOODS_UPDATE_EVENT
} from '../utils/readyGoodsStorage'
import { ReadyGoodsCarton, AqlAudit, CartonStatus } from '../types/readyGoods'

interface ReadyGoodsDashboardClientProps {
  userEmail?: string
}

export function ReadyGoodsDashboardClient({ userEmail }: ReadyGoodsDashboardClientProps) {
  const [cartons, setCartons] = useState<ReadyGoodsCarton[]>([])
  const [aqlAudits, setAqlAudits] = useState<AqlAudit[]>([])
  const [metrics, setMetrics] = useState(getReadyGoodsMetrics())
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCarton, setSelectedCarton] = useState<ReadyGoodsCarton | null>(null)

  function loadData() {
    setCartons(getReadyGoodsCartons())
    setAqlAudits(getAqlAudits())
    setMetrics(getReadyGoodsMetrics())
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredCartons = cartons.filter(carton => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PACKED' && carton.status === 'PACKED') ||
      (statusFilter === 'AQL_AUDIT_PASSED' && carton.status === 'AQL_AUDIT_PASSED') ||
      (statusFilter === 'QUARANTINED_AQL_FAILED' && carton.status === 'QUARANTINED_AQL_FAILED') ||
      (statusFilter === 'SHIPPED' && carton.status === 'SHIPPED')

    const matchesSearch =
      carton.cartonNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      carton.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      carton.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      carton.styleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      carton.godownBay.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Workspace Hub</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Division 09 • Ready Goods & Packing
          </span>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            ISO 2859-1 (AQL 2.5)
          </span>
        </div>
      </div>

      {/* Module Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Ready Goods & Export Carton Packing
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                Final Defense QA
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              AQL 2.5 Normal Level II statistical inspection, barcode hangtag scan matching, moisture-barrier polybag sealing, and master carton manifests
            </p>
          </div>
        </div>

        {/* Quick Hub Links */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/ready-goods/aql-inspection"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>AQL 2.5 Station</span>
          </Link>
          <Link
            href="/ready-goods/carton-packing"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-bold text-slate-700 hover:bg-[#FAF7F0] hover:text-[#3A3564] transition-all shadow-2xs"
          >
            <PackageCheck className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Pack Carton</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Packed Cartons Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {metrics.totalPackedCartonsToday} Cartons
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {metrics.totalGarmentsPackedToday.toLocaleString()} Finished Export Garments
          </p>
          <div className="mt-3 text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-flex items-center gap-1">
            <Check className="w-3 h-3" /> 100% Solid & Ratio Validated
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              AQL 2.5 Audit Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            PASS (0.4%)
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Critical Defect: 0 • Major Defects: 2 (Limit ≤ 10)
          </p>
          <div className="mt-3 text-[11px] font-mono text-slate-600 font-semibold bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10 inline-flex items-center gap-1">
            <span>Threshold: 2.5% Max Allowable</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Hangtag Barcode Match
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            100% Verified
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Zero EAN-13 or SKU mismatch errors detected
          </p>
          <div className="mt-3 text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-flex items-center gap-1">
            <Check className="w-3 h-3" /> Micro-Tach & Silica Inserted
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Ready in Central Godown
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {metrics.readyInGodownPcs.toLocaleString()} pcs
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Stored in Central Godown Bay 3–5
          </p>
          <div className="mt-3 text-[11px] font-mono text-sky-800 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-flex items-center gap-1">
            <Truck className="w-3 h-3" /> Dock Gate 01–03 Ready
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-600 uppercase">
            Operational Quick Routes:
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/ready-goods/aql-inspection"
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#eadecc] text-[#3A3564] text-xs font-bold border border-black/10 transition-colors inline-flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>02. AQL 2.5 Sampling</span>
          </Link>
          <Link
            href="/ready-goods/tagging-polybag"
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#eadecc] text-[#3A3564] text-xs font-bold border border-black/10 transition-colors inline-flex items-center gap-1"
          >
            <Tag className="w-3.5 h-3.5 text-sky-600" />
            <span>03. Hangtag & Polybag</span>
          </Link>
          <Link
            href="/ready-goods/carton-packing"
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#eadecc] text-[#3A3564] text-xs font-bold border border-black/10 transition-colors inline-flex items-center gap-1"
          >
            <PackageCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>04. Carton Packing Manifest</span>
          </Link>
          <Link
            href="/ready-goods/carton-weight"
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#eadecc] text-[#3A3564] text-xs font-bold border border-black/10 transition-colors inline-flex items-center gap-1"
          >
            <Scale className="w-3.5 h-3.5 text-purple-600" />
            <span>05. Scale Weight & Audit</span>
          </Link>
          <Link
            href="/ready-goods/handover"
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#eadecc] text-[#3A3564] text-xs font-bold border border-black/10 transition-colors inline-flex items-center gap-1"
          >
            <Warehouse className="w-3.5 h-3.5 text-indigo-600" />
            <span>06. Central Godown Handover</span>
          </Link>
        </div>
      </div>

      {/* Main Table: Live Export Carton Packing Manifest */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Live Master Export Carton Manifest
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                {filteredCartons.length} Cartons Loaded
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual master cartons registered with physical gross scale weight, bundle bindings, and AQL status
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search CTN #, PO, Buyer, Bay..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] font-mono"
              />
            </div>
            <Link
              href="/ready-goods/carton-packing"
              className="px-3 py-1.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shrink-0 inline-flex items-center gap-1"
            >
              <span>Manage Manifest</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-black/5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Cartons' },
            { id: 'PACKED', label: 'Open / Packed' },
            { id: 'AQL_AUDIT_PASSED', label: 'AQL Passed' },
            { id: 'QUARANTINED_AQL_FAILED', label: 'Quarantined Defect' },
            { id: 'SHIPPED', label: 'Shipped / Godown' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 text-xs font-mono font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                statusFilter === tab.id
                  ? 'border-[#3A3564] text-[#3A3564] bg-[#FAF7F0]/60'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cartons Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Carton Barcode</th>
                <th className="py-3 px-4">Order & Buyer</th>
                <th className="py-3 px-4">Style & Color</th>
                <th className="py-3 px-4">Pieces & Ratio</th>
                <th className="py-3 px-4">Gross Wt (kg)</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Godown Bay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredCartons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No cartons match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCartons.map(carton => {
                  const variancePassed = Math.abs(carton.weightVarianceKg) <= 0.15
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
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {carton.measuredGrossWeightKg.toFixed(2)} kg
                        <div className="text-[10px] text-slate-400">Exp: {carton.expectedGrossWeightKg.toFixed(2)}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            variancePassed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {carton.weightVarianceKg >= 0 ? '+' : ''}
                          {carton.weightVarianceKg.toFixed(2)} kg
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                          {carton.godownBay}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {carton.status === 'AQL_AUDIT_PASSED' && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            AQL PASSED
                          </span>
                        )}
                        {carton.status === 'QUARANTINED_AQL_FAILED' && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> QUARANTINED
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

      {/* Two Auxiliary Panels: Recent AQL Audits & Godown Bay Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Recent AQL 2.5 Quality Audits */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3A3564]" />
              <h3 className="text-sm font-black text-slate-900">Recent AQL 2.5 Sampling Audits</h3>
            </div>
            <Link
              href="/ready-goods/aql-inspection"
              className="text-xs font-bold text-[#3A3564] hover:underline inline-flex items-center gap-1"
            >
              <span>View Full QA Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {aqlAudits.slice(0, 3).map(audit => (
              <div
                key={audit.id}
                className="p-3.5 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#3A3564]">
                      {audit.auditNumber}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      • Carton {audit.cartonNumber}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                      audit.auditDecision === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}
                  >
                    {audit.auditDecision}
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  Auditor: <span className="font-semibold">{audit.inspectorName}</span> • Sample Size: {audit.sampleSizeAudited} pcs
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-rose-700 font-bold">Crit: {audit.criticalDefects}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-amber-700 font-bold">Maj: {audit.majorDefects}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600">Min: {audit.minorDefects}</span>
                  <span className="ml-auto text-slate-400 text-[10px]">{audit.auditDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Central Godown Bay Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-[#3A3564]" />
              <h3 className="text-sm font-black text-slate-900">Central Godown Stacking & Scale Telemetry</h3>
            </div>
            <Link
              href="/ready-goods/carton-weight"
              className="text-xs font-bold text-[#3A3564] hover:underline inline-flex items-center gap-1"
            >
              <span>Scale Logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-black/10 bg-[#FAF7F0]/40 text-center">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Bay 3 (Hoodies)</span>
              <div className="text-lg font-black font-mono text-slate-900 mt-1">16,200 pcs</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Weighbridge 1 OK</div>
            </div>
            <div className="p-3 rounded-xl border border-black/10 bg-[#FAF7F0]/40 text-center">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Bay 4 (Tees)</span>
              <div className="text-lg font-black font-mono text-slate-900 mt-1">14,800 pcs</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Weighbridge 2 OK</div>
            </div>
            <div className="p-3 rounded-xl border border-black/10 bg-[#FAF7F0]/40 text-center">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Bay 5 (Bottoms)</span>
              <div className="text-lg font-black font-mono text-slate-900 mt-1">11,500 pcs</div>
              <div className="text-[10px] text-amber-700 font-bold mt-0.5">Quarantine Area Active</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-slate-700">Digital Scale Tolerance Standard</span>
              <span className="text-purple-700 font-bold">±0.15 kg BOM Target</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Discrepancies &gt; 0.15 kg trigger automated carton lockouts to prevent accidental shipment of empty or extra garments (Zero Ghost Piece compliance).
            </p>
          </div>
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
                <Boxes className="w-5 h-5 text-[#3A3564]" />
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
                <span className="text-slate-400 font-mono">Purchase Order:</span>
                <div className="font-mono font-bold text-slate-900">{selectedCarton.orderNumber}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Buyer:</span>
                <div className="font-bold text-slate-900">{selectedCarton.buyer}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Style:</span>
                <div className="font-bold text-slate-900">{selectedCarton.styleName}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Color:</span>
                <div className="font-bold text-slate-900">{selectedCarton.color}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Total Garments:</span>
                <div className="font-mono font-bold text-slate-900">{selectedCarton.totalPieces} pcs</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Gross Weight:</span>
                <div className="font-mono font-bold text-slate-900">
                  {selectedCarton.measuredGrossWeightKg} kg (Exp: {selectedCarton.expectedGrossWeightKg} kg)
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
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">Size Breakdown</span>
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
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">Linked Cutting Bundles</span>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {selectedCarton.packedBundleIds.map(bId => (
                  <span
                    key={bId}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-mono"
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
                className="px-3 py-1.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all"
              >
                Perform AQL Audit on Carton
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
