'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  BarChart3,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Scissors,
  FileSpreadsheet
} from 'lucide-react'

export function CuttingReportsClient() {
  const [timeRange, setTimeRange] = useState('THIS_MONTH')
  const [selectedShift, setSelectedShift] = useState('ALL')

  // Sample static performance dataset
  const styleYields = [
    { style: 'Heavyweight French Terry Hoodie (ART-HD-8821)', cadTarget: 89.6, actualYield: 89.8, variance: '+0.2%', status: 'OPTIMAL' },
    { style: 'French Terry Overhead PPS Sample (ART-HD-8821-S)', cadTarget: 88.0, actualYield: 88.5, variance: '+0.5%', status: 'OPTIMAL' }
  ]

  const tableThroughputs = [
    { table: 'Table 01 - Gerber Paragon HX', operator: 'K. Rajan / P. Murugan', cutPieces: 14200, efficiency: '98.2%', bladeHours: 42.5 },
    { table: 'Table 02 - Lectra Vector iX6', operator: 'S. Kumar / A. Velu', cutPieces: 13150, efficiency: '96.8%', bladeHours: 39.0 },
    { table: 'Table 03 - Eastman Straight Blade Manual', operator: 'M. Anand / R. Siva', cutPieces: 8900, efficiency: '94.1%', bladeHours: 46.2 },
    { table: 'Table 04 - Bandknife Precision Notcher', operator: 'V. Prakash', cutPieces: 6400, efficiency: '99.0%', bladeHours: 28.5 }
  ]

  const defectPareto = [
    { category: 'End-Loss Trim Waste', count: 18, share: '38%' },
    { category: 'Notch Depth / Shift (<1mm)', count: 12, share: '25%' },
    { category: 'Spreading Tension Waves', count: 9, share: '19%' },
    { category: 'Blade Deflection Bottom Ply', count: 5, share: '10%' },
    { category: 'Fabric Selvage Curvature', count: 4, share: '8%' }
  ]

  const handleExportCSV = () => {
    const csvContent = [
      ['Table', 'Operator', 'Cut Pieces', 'Efficiency', 'Blade Hours'].join(','),
      ...tableThroughputs.map(t => [t.table, `"${t.operator}"`, t.cutPieces, t.efficiency, t.bladeHours].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `cutting_floor_report_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
          <span className="text-xs font-mono font-bold text-slate-900">Reports & Floor Analytics</span>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F0] border border-black/10 text-[#3A3564] text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Production CSV</span>
        </button>
      </div>

      {/* 2. Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Cutting Floor Yield & Production Analytics
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Executive Audit
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Fabric yield variance vs CAD benchmarks, cutter table utilization, defect Pareto breakdown, and shift KPI logs
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono text-xs font-bold text-slate-800"
          >
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month (Current)</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="Q1_2026">Q1 2026</option>
          </select>

          <select
            value={selectedShift}
            onChange={e => setSelectedShift(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono text-xs font-bold text-slate-800"
          >
            <option value="ALL">All Shifts</option>
            <option value="SHIFT_A">Shift A (Morning)</option>
            <option value="SHIFT_B">Shift B (Evening)</option>
            <option value="NIGHT">Night Shift</option>
          </select>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Cut Panels MTD</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">42,650 pcs</div>
          <p className="text-xs font-semibold text-emerald-600 mt-1">↑ +8.4% vs monthly target</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Floor Fabric Yield</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 mt-2">88.2%</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">CAD benchmark was 87.8%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">CNC Cutter Uptime</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 mt-2">97.4%</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">156.2 active operating hours</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">End-Loss Scrap Rate</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 mt-2">1.8%</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Target allowance is &lt;2.5%</p>
        </div>
      </div>

      {/* 4. Two Column Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Style Yield vs CAD Benchmarks */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <div>
              <h3 className="font-bold text-base text-slate-900">Fabric Yield vs CAD Benchmarks</h3>
              <p className="text-xs text-slate-500">Comparing actual cut yield with CAD marker nesting targets</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-3">
            {styleYields.map(s => (
              <div key={s.style} className="p-3 rounded-xl bg-[#FAF7F0]/60 border border-black/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{s.style}</span>
                  <span className="font-mono font-black text-emerald-700">{s.variance}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Actual: <strong>{s.actualYield}%</strong></span>
                  <span>CAD Target: {s.cadTarget}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#3A3564] rounded-full"
                    style={{ width: `${s.actualYield}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defect Pareto Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <div>
              <h3 className="font-bold text-base text-slate-900">Defect Pareto Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution of cut floor non-conformances & waste vectors</p>
            </div>
            <Scissors className="w-5 h-5 text-[#3A3564]" />
          </div>

          <div className="space-y-3">
            {defectPareto.map(d => (
              <div key={d.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-800">{d.category}</span>
                  <span className="font-mono font-bold text-slate-900">{d.count} occurrences ({d.share})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#FAF7F0] border border-black/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: d.share }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <strong>Actionable Insight:</strong> End-loss trim waste accounted for 38% of incidents. Directing rolls &gt;1.5m to the pocket lining salvage rack saved 142.4 kg of fabric this month.
          </div>
        </div>
      </div>

      {/* 5. Cutting Table Throughput Logs */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div>
            <h3 className="font-bold text-base text-slate-900">Cutting Table Throughput & Operator Efficiency</h3>
            <p className="text-xs text-slate-500">Machine capacity, blade operational hours, and output piece volumes</p>
          </div>
          <Cpu className="w-5 h-5 text-[#3A3564]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] text-[#3A3564] font-mono uppercase text-[10px] tracking-wider border-b border-black/10">
              <tr>
                <th className="py-3 px-4 font-bold">Cutting Unit</th>
                <th className="py-3 px-4 font-bold">Lead Operators</th>
                <th className="py-3 px-4 font-bold">Units Cut</th>
                <th className="py-3 px-4 font-bold">Uptime Efficiency</th>
                <th className="py-3 px-4 font-bold">Blade Hours</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium">
              {tableThroughputs.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {t.table}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {t.operator}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {t.cutPieces.toLocaleString()} pcs
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                    {t.efficiency}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {t.bladeHours} hrs
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
