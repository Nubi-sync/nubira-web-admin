'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  QrCode,
  Search,
  Plus,
  X,
  Printer,
  Sparkles,
  Shirt,
  CheckCircle2,
  Tag,
  ArrowRight,
  Layers
} from 'lucide-react'
import { CutBundle, BundleStatus, HandoverDestination, LaySheet } from '../../types/cutting'
import { getCutBundles, saveCutBundle, bulkAddCutBundles, getLaySheets } from '../../utils/cuttingStorage'

interface BundlesClientProps {
  initialBundles?: CutBundle[]
}

export function BundlesClient({ initialBundles }: BundlesClientProps = {}) {
  const [bundles, setBundles] = useState<CutBundle[]>(() => {
    if (initialBundles && initialBundles.length > 0) return initialBundles
    return []
  })
  const [lays, setLays] = useState<LaySheet[]>([])
  const [search, setSearch] = useState('')
  const [destFilter, setDestFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedBundle, setSelectedBundle] = useState<CutBundle | null>(null)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)

  // Generator form
  const [genLayId, setGenLayId] = useState('')
  const [genColor, setGenColor] = useState('Jet Black')
  const [genSize, setGenSize] = useState('M')
  const [genPiecesPerBundle, setGenPiecesPerBundle] = useState(25)
  const [genTotalPieces, setGenTotalPieces] = useState(100)
  const [genDestination, setGenDestination] = useState<HandoverDestination>('06_SEWING')

  useEffect(() => {
    if (initialBundles && initialBundles.length > 0) {
      setBundles(initialBundles)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_cutting_bundles_v2', JSON.stringify(initialBundles))
      }
    } else {
      setBundles(getCutBundles())
    }
    const loadedLays = getLaySheets()
    setLays(loadedLays)
    if (loadedLays.length > 0) {
      setGenLayId(loadedLays[0].id)
    }
  }, [initialBundles])

  const filteredBundles = bundles.filter(b => {
    const matchSearch =
      b.bundle_number.toLowerCase().includes(search.toLowerCase()) ||
      b.po_number.toLowerCase().includes(search.toLowerCase()) ||
      b.style_ref.toLowerCase().includes(search.toLowerCase()) ||
      b.style_name.toLowerCase().includes(search.toLowerCase()) ||
      b.qr_code.toLowerCase().includes(search.toLowerCase())
    const matchDest = destFilter === 'ALL' || b.destination === destFilter
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter
    return matchSearch && matchDest && matchStatus
  })

  const handleAdvanceStatus = (bundle: CutBundle) => {
    let next: BundleStatus = bundle.status
    if (bundle.status === 'GENERATED') next = 'BANDED'
    else if (bundle.status === 'BANDED') next = 'IN_TRANSIT'
    else if (bundle.status === 'IN_TRANSIT') next = 'HANDOVER_CONFIRMED'

    const updated = saveCutBundle({ ...bundle, status: next })
    setBundles(updated)
    if (selectedBundle?.id === bundle.id) {
      setSelectedBundle({ ...bundle, status: next })
    }
  }

  const handleGenerateBundlesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const lay = lays.find(l => l.id === genLayId)
    if (!lay) return

    const bundleCount = Math.ceil(genTotalPieces / genPiecesPerBundle)
    const newBundles: CutBundle[] = []

    for (let i = 0; i < bundleCount; i++) {
      const plyStart = i * genPiecesPerBundle + 1
      const plyEnd = Math.min((i + 1) * genPiecesPerBundle, genTotalPieces)
      const count = plyEnd - plyStart + 1
      const bundleNum = `BND-${lay.lay_number.replace('LAY-2026-', '')}-${genSize}-${String(i + 1).padStart(2, '0')}`

      newBundles.push({
        id: `bnd-${Date.now()}-${i}`,
        bundle_number: bundleNum,
        lay_sheet_id: lay.id,
        lay_number: lay.lay_number,
        po_number: lay.po_number,
        style_ref: lay.style_ref,
        style_name: lay.style_name,
        color: genColor,
        size: genSize,
        ply_range_start: plyStart,
        ply_range_end: plyEnd,
        pieces_count: count,
        qr_code: `ZIGZA-${bundleNum}-P${plyStart}-${plyEnd}`,
        destination: genDestination,
        status: 'GENERATED',
        created_at: new Date().toISOString()
      })
    }

    const updated = bulkAddCutBundles(newBundles)
    setBundles(updated)
    setIsGenerateModalOpen(false)
  }

  // Summary Metrics
  const totalBundles = bundles.length
  const inTransitCount = bundles.filter(b => b.status === 'IN_TRANSIT' || b.status === 'BANDED').length
  const confirmedCount = bundles.filter(b => b.status === 'HANDOVER_CONFIRMED').length
  const totalDispatchedPieces = bundles
    .filter(b => b.status === 'HANDOVER_CONFIRMED')
    .reduce((acc, b) => acc + b.pieces_count, 0)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* 1. Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/cutting"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor Dashboard</span>
          </Link>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono font-bold text-slate-900">Bundle QR Generation</span>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Batch Generate QR Bundles</span>
        </button>
      </div>

      {/* 2. Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Cut Panel Bundle QR Generation
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Serial Barcode Tracking
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Ply banding tags, thermal sticker QR generation, and automated handover routing to Printing, Embroidery & Sewing
            </p>
          </div>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Active Bundles</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{totalBundles} tags</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">100% serialized with QR</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Banded / In Transit</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 mt-2">{inTransitCount} bundles</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">En route to factory units</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Handover Confirmed</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 mt-2">{confirmedCount} bundles</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Received by target lines</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Dispatched Cut Pieces</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{totalDispatchedPieces.toLocaleString()} pcs</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Confirmed received</p>
        </div>
      </div>

      {/* 4. Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bundle #, PO, style, QR..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            {/* Destination Filters */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono text-slate-400 mr-1">DEST:</span>
              {(['ALL', '04_PRINTING', '05_EMBROIDERY', '06_SEWING'] as const).map(dst => {
                let label = 'ALL'
                if (dst === '04_PRINTING') label = 'PRINT'
                if (dst === '05_EMBROIDERY') label = 'EMB'
                if (dst === '06_SEWING') label = 'SEWING'
                return (
                  <button
                    key={dst}
                    onClick={() => setDestFilter(dst)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      destFilter === dst
                        ? 'bg-[#3A3564] text-white'
                        : 'bg-[#FAF7F0] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="h-4 w-px bg-black/10 hidden lg:block" />

            {/* Status Filters */}
            <div className="flex items-center gap-1">
              {(['ALL', 'GENERATED', 'BANDED', 'IN_TRANSIT', 'HANDOVER_CONFIRMED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-[#FAF7F0] text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st === 'HANDOVER_CONFIRMED' ? 'CONFIRMED' : st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bundles Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] text-[#3A3564] font-mono uppercase text-[10px] tracking-wider border-b border-black/10">
              <tr>
                <th className="py-3 px-4 font-bold">Bundle Serial</th>
                <th className="py-3 px-4 font-bold">Style & Color</th>
                <th className="py-3 px-4 font-bold">Size & Pieces</th>
                <th className="py-3 px-4 font-bold">Ply Sequence</th>
                <th className="py-3 px-4 font-bold">Destination</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium">
              {filteredBundles.map(bundle => {
                let badge = 'bg-slate-100 text-slate-700'
                if (bundle.status === 'GENERATED') badge = 'bg-slate-100 text-slate-800'
                if (bundle.status === 'BANDED') badge = 'bg-purple-100 text-purple-800'
                if (bundle.status === 'IN_TRANSIT') badge = 'bg-amber-100 text-amber-800'
                if (bundle.status === 'HANDOVER_CONFIRMED') badge = 'bg-emerald-100 text-emerald-800'

                let destIcon = <Shirt className="w-3.5 h-3.5" />
                let destName = 'Sewing Floor'
                if (bundle.destination === '04_PRINTING') {
                  destIcon = <Printer className="w-3.5 h-3.5" />
                  destName = 'Screen Print'
                } else if (bundle.destination === '05_EMBROIDERY') {
                  destIcon = <Sparkles className="w-3.5 h-3.5" />
                  destName = 'Embroidery'
                }

                return (
                  <tr key={bundle.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{bundle.bundle_number}</div>
                      <div className="text-[10px] text-slate-500">{bundle.lay_number}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{bundle.qr_code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{bundle.style_name}</div>
                      <div className="text-[11px] text-slate-600">{bundle.color}</div>
                      <div className="text-[10px] font-mono text-slate-400">{bundle.po_number}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-black text-slate-900 text-sm">Size {bundle.size}</span>
                      <div className="text-[11px] text-slate-600 font-bold">{bundle.pieces_count} pieces</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-[#FAF7F0] border border-black/10 font-bold">
                        Plies {bundle.ply_range_start} - {bundle.ply_range_end}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-black/10 font-mono text-xs font-bold text-[#3A3564]">
                        {destIcon}
                        <span>{destName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${badge}`}>
                        {bundle.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {bundle.status !== 'HANDOVER_CONFIRMED' && (
                          <button
                            onClick={() => handleAdvanceStatus(bundle)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold"
                          >
                            Advance →
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBundle(bundle)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF7F0] border border-black/10 font-mono text-[11px] text-[#3A3564] font-bold shadow-2xs inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>QR Tag</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Generator Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-bold text-base text-slate-900">Batch Generate Serial QR Bundles</h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateBundlesSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-mono font-bold text-slate-700 uppercase">Select Cut Lay Run</label>
                <select
                  value={genLayId}
                  onChange={e => setGenLayId(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                >
                  {lays.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.lay_number} • {l.style_name} ({l.total_cut_pieces} pcs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Garment Colorway</label>
                  <input
                    type="text"
                    required
                    value={genColor}
                    onChange={e => setGenColor(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Size Designation</label>
                  <select
                    value={genSize}
                    onChange={e => setGenSize(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="2XL">2XL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Pieces Per Bundle</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={genPiecesPerBundle}
                    onChange={e => setGenPiecesPerBundle(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Total Batch Pieces</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={genTotalPieces}
                    onChange={e => setGenTotalPieces(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-700 uppercase">Handover Destination Route</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { key: '04_PRINTING' as HandoverDestination, label: '04 Printing', icon: Printer },
                    { key: '05_EMBROIDERY' as HandoverDestination, label: '05 Embroidery', icon: Sparkles },
                    { key: '06_SEWING' as HandoverDestination, label: '06 Sewing Line', icon: Shirt }
                  ].map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setGenDestination(item.key)}
                      className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                        genDestination === item.key
                          ? 'bg-[#3A3564] text-white border-[#3A3564]'
                          : 'bg-[#FAF7F0] text-slate-700 border-black/10 hover:bg-white'
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono text-slate-700 text-xs">
                Calculated Bundles: <strong>{Math.ceil(genTotalPieces / genPiecesPerBundle)} bundles</strong> ({genPiecesPerBundle} pcs/bundle)
              </div>

              <div className="pt-3 border-t border-black/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold"
                >
                  Generate {Math.ceil(genTotalPieces / genPiecesPerBundle)} Bundles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Thermal QR Tag Modal */}
      {selectedBundle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Thermal Sticker Tag</span>
              <button onClick={() => setSelectedBundle(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Industrial Sticker Layout */}
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-900 bg-white space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-[#3A3564]">ZIGZA GARMENTS</span>
                  <div className="text-[9px] text-slate-600">CUT PANEL BUNDLE TICKET</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-900">{selectedBundle.destination.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* QR Mockup */}
              <div className="flex items-center justify-center py-2">
                <div className="p-3 bg-slate-900 rounded-xl text-white">
                  <QrCode className="w-20 h-20" />
                </div>
              </div>

              <div className="text-center font-bold text-xs text-slate-900 tracking-wider">
                {selectedBundle.bundle_number}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-900">
                <div>
                  <span className="text-[9px] text-slate-500 block">STYLE REF:</span>
                  <strong>{selectedBundle.style_ref}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">PO NUMBER:</span>
                  <strong>{selectedBundle.po_number}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">SIZE / COLOR:</span>
                  <strong>{selectedBundle.size} • {selectedBundle.color}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">QUANTITY:</span>
                  <strong>{selectedBundle.pieces_count} PCS</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-500 block">PLY INTERVAL:</span>
                  <strong>Plies #{selectedBundle.ply_range_start} through #{selectedBundle.ply_range_end}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[9px] text-slate-500">
                <span>QC STAMP: [ PASSED ]</span>
                <span>LAY: {selectedBundle.lay_number}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2e2a50] flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tag</span>
              </button>
              <button
                onClick={() => setSelectedBundle(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
