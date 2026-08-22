'use client'

import { useState } from 'react'
import { updateAllotmentStatus } from '../actions'
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  PackageCheck,
  Sparkles
} from 'lucide-react'

export type VariantItem = {
  id: string
  allotment_id: string
  color: string
  size: string
  quantity: number
  completed_qty?: number
}

export type MaterialItem = {
  id: string
  allotment_id: string
  item_name: string
  required_qty: string
  admin_issued: boolean
  lineman_received: boolean
  lineman_received_at?: string | null
}

export type Allotment = {
  id: string
  lineman_id: string
  article_id: string
  target_qty: number
  achieved_qty?: number
  allotment_date: string
  status: string
  profiles: { username: string }
  articles: { art_no: string; description?: string }
  variants?: VariantItem[]
  materials?: MaterialItem[]
}

export function AllotmentList({ allotments }: { allotments: Allotment[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handleStatusChange(id: string, newStatus: string) {
    if (confirm(`Are you sure you want to mark this target as ${newStatus}?`)) {
      await updateAllotmentStatus(id, newStatus)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Active Allotments & Handover Status</h3>
          <p className="text-xs text-slate-500 mt-0.5">Tracking size ratios & raw materials issued to lines</p>
        </div>
        <div className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
          {allotments.length} Allotments
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
              <th className="px-6 py-4">Date & Lineman</th>
              <th className="px-6 py-4">Article</th>
              <th className="px-6 py-4">Size & Color Ratio</th>
              <th className="px-6 py-4">Material Handover</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {allotments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No targets assigned yet. Create one using the form above.
                </td>
              </tr>
            ) : (
              allotments.map((al) => {
                const isExpanded = expandedId === al.id
                const variants = al.variants || []
                const materials = al.materials || []
                const allMaterialsReceived = materials.length > 0 && materials.every(m => m.lineman_received)

                // Group variants by color
                const colorGroups: Record<string, VariantItem[]> = {}
                variants.forEach(v => {
                  if (!colorGroups[v.color]) colorGroups[v.color] = []
                  colorGroups[v.color].push(v)
                })

                return (
                  <tr key={al.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Date & Lineman */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{al.profiles?.username || 'Lineman'}</div>
                      <div className="text-xs text-slate-400 font-medium">{al.allotment_date}</div>
                    </td>

                    {/* Article */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-extrabold text-purple-700 text-base">{al.articles?.art_no || '-'}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[150px]">{al.articles?.description || ''}</div>
                    </td>

                    {/* Size & Color Summary */}
                    <td className="px-6 py-4">
                      {variants.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Standard (No ratio)</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(colorGroups).slice(0, 2).map(([color, items]) => (
                              <span 
                                key={color}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100"
                              >
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                {color}: {items.map(i => `${i.size}:${i.quantity}`).join(', ')}
                              </span>
                            ))}
                            {Object.keys(colorGroups).length > 2 && (
                              <span className="text-xs text-slate-400 font-medium">+{Object.keys(colorGroups).length - 2} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Material Handover Checklist Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {materials.length === 0 ? (
                        <span className="text-xs text-slate-400">No checklist</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {allMaterialsReceived ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Received ({materials.length})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="h-3.5 w-3.5" />
                              Issued ({materials.length}) • Pending
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Progress */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 w-36">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-800">{al.achieved_qty || 0} pcs</span>
                          <span className="text-slate-400">/ {al.target_qty}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              ((al.achieved_qty || 0) >= al.target_qty) ? 'bg-emerald-500' : 'bg-purple-600'
                            }`} 
                            style={{ width: `${Math.min(((al.achieved_qty || 0) / al.target_qty) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        al.status === 'IN_PROGRESS' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : al.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {al.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {al.status === 'IN_PROGRESS' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(al.id, 'COMPLETED')}
                              className="text-xs font-bold px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                            >
                              Done
                            </button>
                            <button
                              onClick={() => handleStatusChange(al.id, 'CANCELLED')}
                              className="text-xs font-bold px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}