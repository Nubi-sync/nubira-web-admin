'use client'

import { Activity, CheckCircle, Package, AlertTriangle } from 'lucide-react'

export default function DashboardClient({ stats, chartData }: { stats: any, chartData: any[] }) {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity className="w-16 h-16 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Produced</p>
          <h3 className="text-4xl font-bold text-slate-800">{stats.produced}</h3>
          <p className="text-xs font-semibold text-blue-600 mt-2 bg-blue-50 w-max px-2 py-1 rounded-md">Pieces (All Time)</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">QC Passed</p>
          <h3 className="text-4xl font-bold text-slate-800">{stats.passed}</h3>
          <p className="text-xs font-semibold text-emerald-600 mt-2 bg-emerald-50 w-max px-2 py-1 rounded-md">Quality Verified</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-16 h-16 text-rose-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">QC Rejected</p>
          <h3 className="text-4xl font-bold text-slate-800">{stats.rejected}</h3>
          <p className="text-xs font-semibold text-rose-600 mt-2 bg-rose-50 w-max px-2 py-1 rounded-md">Defected</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Package className="w-16 h-16 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Store Inward</p>
          <h3 className="text-4xl font-bold text-slate-800">{stats.inward}</h3>
          <p className="text-xs font-semibold text-purple-600 mt-2 bg-purple-50 w-max px-2 py-1 rounded-md">In Godown</p>
        </div>
      </div>

      {/* Chart Row */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Production vs QC Pass (By Date)</h2>
        <div className="h-80 w-full flex items-end justify-around pb-8 pt-4 relative border-b border-slate-200">
          
          {/* Y-Axis lines (decorative) */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
             <div className="border-t border-slate-100 w-full flex-1"></div>
             <div className="border-t border-slate-100 w-full flex-1"></div>
             <div className="border-t border-slate-100 w-full flex-1"></div>
             <div className="border-t border-slate-100 w-full flex-1"></div>
          </div>

          {chartData.length > 0 ? chartData.map((data, index) => {
             // Find max value across all data to scale bars relative to it
             const maxValue = Math.max(...chartData.map(d => Math.max(d.produced, d.passed)), 1);
             const producedHeight = `${(data.produced / maxValue) * 100}%`;
             const passedHeight = `${(data.passed / maxValue) * 100}%`;

             return (
              <div key={index} className="flex flex-col items-center group relative z-10 h-full justify-end px-4">
                {/* Bars */}
                <div className="flex items-end gap-3 h-full mb-1">
                  <div 
                    className="w-16 bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-all cursor-pointer relative shadow-sm"
                    style={{ height: producedHeight }}
                  >
                     <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shadow-sm">{data.produced}</span>
                  </div>
                  <div 
                    className="w-16 bg-emerald-500 rounded-t-lg hover:bg-emerald-600 transition-all cursor-pointer relative shadow-sm"
                    style={{ height: passedHeight }}
                  >
                     <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shadow-sm">{data.passed}</span>
                  </div>
                </div>
                {/* X-Axis Label */}
                <div className="absolute -bottom-10 text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  {data.date}
                </div>
              </div>
             )
          }) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 z-10">
              No data available to display chart.
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-8">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-slate-600">Produced</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-slate-600">QC Passed</span>
           </div>
        </div>
      </div>
    </div>
  )
}
