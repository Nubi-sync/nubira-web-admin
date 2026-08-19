'use client'

import { updateAllotmentStatus } from '../actions'

type Allotment = {
  id: string
  lineman_id: string
  article_id: string
  target_qty: number
  achieved_qty?: number
  allotment_date: string
  status: string
  profiles: { username: string }
  articles: { art_no: string }
}

export function AllotmentList({ allotments }: { allotments: Allotment[] }) {
  
  async function handleStatusChange(id: string, newStatus: string) {
    if (confirm(`Are you sure you want to mark this target as ${newStatus}?`)) {
      await updateAllotmentStatus(id, newStatus)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Lineman</th>
              <th className="px-6 py-4 font-semibold">Art No</th>
              <th className="px-6 py-4 font-semibold text-right">Target</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allotments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No targets assigned yet. Add one from the form.
                </td>
              </tr>
            ) : (
              allotments.map((al) => (
                <tr key={al.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {al.allotment_date}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {al.profiles?.username || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-600">
                    {al.articles?.art_no || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 w-40">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600">{al.achieved_qty || 0} achieved</span>
                        <span className="text-slate-400">/ {al.target_qty}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            ((al.achieved_qty || 0) >= al.target_qty) ? 'bg-emerald-500' : 'bg-indigo-500'
                          }`} 
                          style={{ width: `${Math.min(((al.achieved_qty || 0) / al.target_qty) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      al.status === 'IN_PROGRESS' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                      : al.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {al.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {al.status === 'IN_PROGRESS' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStatusChange(al.id, 'COMPLETED')}
                          className="text-xs font-medium px-2 py-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors border border-emerald-200"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusChange(al.id, 'CANCELLED')}
                          className="text-xs font-medium px-2 py-1 text-rose-600 hover:bg-rose-50 rounded transition-colors border border-rose-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
