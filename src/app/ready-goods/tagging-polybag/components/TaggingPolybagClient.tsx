'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Tag,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  Plus,
  ShieldCheck,
  Check,
  Package,
  Layers
} from 'lucide-react'
import { getHangtagScans, READY_GOODS_UPDATE_EVENT } from '../../utils/readyGoodsStorage'
import { HangtagVerification } from '../../types/readyGoods'
import { ScanHangtagModal } from './ScanHangtagModal'

interface TaggingPolybagClientProps {
  userEmail?: string
}

export function TaggingPolybagClient({ userEmail }: TaggingPolybagClientProps) {
  const [scans, setScans] = useState<HangtagVerification[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function loadScans() {
    setScans(getHangtagScans())
  }

  useEffect(() => {
    loadScans()
    const handleUpdate = () => loadScans()
    window.addEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredScans = scans.filter(scan => {
    return (
      scan.scanCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.operatorName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

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
          Packaging Station • EAN-13 / UPC Barcoding & Polybagging
        </span>
      </div>

      {/* Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Hangtag & Polybag Station
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                100% Barcode Match SLA
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Laser verification of buyer EAN-13/UPC barcodes, Kimble micro-tach fasteners, silica gel desiccant insertion, and polybag folding
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Scan Garment Hangtag</span>
        </button>
      </div>

      {/* 4 Packaging Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Garments Tagged Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            5,680 pcs
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">4 Packaging Lines Active</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              EAN Scan Match Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            100.0%
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Zero Tag-to-Garment Mismatches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Silica Desiccant Pouches
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            5,680 Pouches
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Moisture Protection Verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Micro-Tach Fasteners
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            0 Pull-Outs
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">100% Secure Hangtag Binding</p>
        </div>
      </div>

      {/* Main Scans Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Live Hangtag Scan & Verification Manifest
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                {filteredScans.length} Scans Logged
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified individual garment barcode scans matched with buyer SKU specifications
            </p>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search EAN, SKU, PO, Operator..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">EAN-13 / UPC Barcode</th>
                <th className="py-3 px-4">Order PO</th>
                <th className="py-3 px-4">Buyer SKU</th>
                <th className="py-3 px-4">Style & Size</th>
                <th className="py-3 px-4">Color</th>
                <th className="py-3 px-4">Physical Checks</th>
                <th className="py-3 px-4">Scan Match Status</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No hangtag scans recorded matching the search.
                  </td>
                </tr>
              ) : (
                filteredScans.map(scan => (
                  <tr key={scan.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-[#3A3564] flex items-center gap-2">
                      <QrCode className="w-3.5 h-3.5 text-slate-400" />
                      <span>{scan.scanCode}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {scan.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {scan.sku}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{scan.styleName}</span>
                      <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">
                        {scan.size}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {scan.color}
                    </td>
                    <td className="py-3 px-4 text-[10px] font-mono space-y-0.5">
                      <div className="flex items-center gap-1 text-emerald-700">
                        <Check className="w-2.5 h-2.5" /> Kimble Tag Gun Attached
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700">
                        <Check className="w-2.5 h-2.5" /> Silica Gel Desiccant Inside
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700">
                        <Check className="w-2.5 h-2.5" /> Polybag Heat Sealed
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {scan.scanStatus === 'VERIFIED_OK' ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          VERIFIED OK
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                          MISMATCH ERROR
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {scan.operatorName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                      {scan.scannedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ScanHangtagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadScans}
      />
    </div>
  )
}
