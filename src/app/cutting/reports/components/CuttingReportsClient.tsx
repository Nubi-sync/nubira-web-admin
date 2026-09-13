'use client'

import { useState } from 'react'
import {
  FileBarChart2,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Scissors,
  Cpu,
  Sparkles,
  PieChart
} from 'lucide-react'

export function CuttingReportsClient() {
  const [dateRange, setDateRange] = useState('THIS_MONTH')
  const [selectedShift, setSelectedShift] = useState('ALL')

  const styleYields: Array<{ style: string; cadTarget: number; actualYield: number; variance: string; status: string }> = []

  const tableThroughputs = [
    { table: 'Table 01 - Automatic Spreading Table', operator: 'Lead Cutter A', cutPieces: 0, efficiency: '0.0%', bladeHours: 0 },
    { table: 'Table 02 - CNC Precision Cutter', operator: 'Lead Cutter B', cutPieces: 0, efficiency: '0.0%', bladeHours: 0 },
    { table: 'Table 03 - Manual Straight Knife', operator: 'Lead Cutter C', cutPieces: 0, efficiency: '0.0%', bladeHours: 0 },
    { table: 'Table 04 - Bandknife Precision Notcher', operator: 'Lead Cutter D', cutPieces: 0, efficiency: '0.0%', bladeHours: 0 }
  ]

  const defectPareto: Array<{ category: string; count: number; share: string }> = []

  const handleExportCSV = () => {
    const csvContent = [
      ['Table', 'Operator', 'Cut Pieces', 'Efficiency', 'Blade Hours'].join(','),
      ...tableThroughputs.map(t => [t.table, `"${t.operator}"`, t.cutPieces, t.efficiency, t.bladeHours].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `cutting_throughput_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <FileBarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Cutting Floor Reports & Efficiency
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                Telemetry & Analytics
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              End-loss analytics, CAD nesting marker yield benchmarks, table machine throughput, and scrap variance
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF7F0] hover:bg-slate-100 text-slate-800 border border-black/10 rounded-xl text-xs font-bold transition-all shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* 2. Controls & Date Filtering */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Report Horizon & Shifts</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
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
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">0 pcs</div>
          <p className="text-xs font-semibold text-slate-400 mt-1">Awaiting active lays</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Floor Fabric Yield</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">0.0%</div>
          <p className="text-xs font-semibold text-slate-400 mt-1">Pending CAD nesting</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">CNC Cutter Uptime</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">0.0%</div>
          <p className="text-xs font-semibold text-slate-400 mt-1">0 active operating hours</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">End-Loss Scrap Rate</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">0.0%</div>
          <p className="text-xs font-semibold text-slate-400 mt-1">Target allowance is &lt;2.5%</p>
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
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3">
            {styleYields.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400">
                No style cutting yield data recorded for this period yet.
              </div>
            ) : (
              styleYields.map(s => (
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
              ))
            )}
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
            {defectPareto.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400">
                No defect or non-conformance incidents logged.
              </div>
            ) : (
              defectPareto.map(d => (
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
              ))
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-black/5 text-slate-600 text-xs">
            <strong>Tolerance Standard:</strong> Automated CNC spreaders maintain variance within +/- 1.0mm per ASTM standards.
          </div>
        </div>
      </div>

      {/* 5. Cutting Table Throughput Logs */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div>
            <h3 className="font-bold text-base text-slate-900">Cutting Table Throughput & Machine Capacity</h3>
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
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                    {t.efficiency}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {t.bladeHours} hrs
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      IDLE
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
