'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Cpu,
  Search,
  Plus,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react'

export interface CuttingOrder {
  id: string
  order_number: string
  buyer_po: string
  buyer_name: string
  style_number: string
  style_name: string
  colorway: string
  total_pieces: number
  plies_planned: number
  fabric_meters_allocated: number
  table_assigned: string
  status: 'QUEUED' | 'SPREADING' | 'CUTTING' | 'INSPECTED' | 'BUNDLED'
  priority: 'NORMAL' | 'HIGH' | 'URGENT'
  scheduled_start: string
  operator_lead: string
}

const INITIAL_ORDERS: CuttingOrder[] = [
  {
    id: 'co-101',
    order_number: 'CO-2026-088',
    buyer_po: 'PO-ZARA-9921',
    buyer_name: 'Zara Men International',
    style_number: 'STY-CREW-8801',
    style_name: 'Classic Heavyweight Crewneck',
    colorway: 'Obsidian Black',
    total_pieces: 2400,
    plies_planned: 80,
    fabric_meters_allocated: 480,
    table_assigned: 'Table 01 - Gerber Paragon HX',
    status: 'CUTTING',
    priority: 'URGENT',
    scheduled_start: 'Today, 08:30 AM',
    operator_lead: 'K. Rajan / P. Murugan'
  },
  {
    id: 'co-102',
    order_number: 'CO-2026-089',
    buyer_po: 'PO-HM-4102',
    buyer_name: 'H&M Basic Essentials',
    style_number: 'STY-HD-9022',
    style_name: 'French Terry Relaxed Hoodie',
    colorway: 'Oatmeal Heather Melange',
    total_pieces: 1800,
    plies_planned: 60,
    fabric_meters_allocated: 620,
    table_assigned: 'Table 02 - Lectra Vector iX6',
    status: 'SPREADING',
    priority: 'HIGH',
    scheduled_start: 'Today, 11:00 AM',
    operator_lead: 'S. Kumar / A. Velu'
  },
  {
    id: 'co-103',
    order_number: 'CO-2026-090',
    buyer_po: 'PO-COS-1190',
    buyer_name: 'COS Modern Silhouettes',
    style_number: 'STY-OVS-4410',
    style_name: 'Drop Shoulder Boxy Tee',
    colorway: 'Deep Forest Pine',
    total_pieces: 3200,
    plies_planned: 100,
    fabric_meters_allocated: 540,
    table_assigned: 'Table 01 - Gerber Paragon HX',
    status: 'QUEUED',
    priority: 'NORMAL',
    scheduled_start: 'Tomorrow, 09:00 AM',
    operator_lead: 'Unassigned (Queue)'
  },
  {
    id: 'co-104',
    order_number: 'CO-2026-091',
    buyer_po: 'PO-ASOS-3004',
    buyer_name: 'ASOS Streetwear Line',
    style_number: 'STY-PNT-3301',
    style_name: 'Cargo Sweatpant Bottoms',
    colorway: 'Washed Charcoal Grey',
    total_pieces: 1500,
    plies_planned: 50,
    fabric_meters_allocated: 590,
    table_assigned: 'Table 03 - Eastman Straight Blade Manual',
    status: 'INSPECTED',
    priority: 'NORMAL',
    scheduled_start: 'Yesterday, 02:00 PM',
    operator_lead: 'M. Anand / R. Siva'
  }
]

export function CuttingOrdersClient() {
  const [orders, setOrders] = useState<CuttingOrder[]>([])
  const [search, setSearch] = useState('')
  const [tableFilter, setTableFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<CuttingOrder | null>(null)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    order_number: '',
    buyer_po: 'PO-UNIQLO-7712',
    buyer_name: 'Uniqlo Casual Basics',
    style_number: 'STY-TEE-1011',
    style_name: 'Supima Cotton Relaxed Tee',
    colorway: 'Navy Blue',
    total_pieces: 2000,
    plies_planned: 70,
    fabric_meters_allocated: 450,
    table_assigned: 'Table 01 - Gerber Paragon HX',
    priority: 'NORMAL' as const,
    scheduled_start: 'Today, 02:00 PM',
    operator_lead: 'K. Rajan / P. Murugan'
  })

  useEffect(() => {
    const saved = localStorage.getItem('cutting_orders_data')
    if (saved) {
      try {
        setOrders(JSON.parse(saved))
      } catch (e) {
        setOrders(INITIAL_ORDERS)
      }
    } else {
      setOrders(INITIAL_ORDERS)
      localStorage.setItem('cutting_orders_data', JSON.stringify(INITIAL_ORDERS))
    }
  }, [])

  const saveOrders = (updated: CuttingOrder[]) => {
    setOrders(updated)
    localStorage.setItem('cutting_orders_data', JSON.stringify(updated))
  }

  const handleAdvanceStatus = (order: CuttingOrder) => {
    let next: CuttingOrder['status'] = order.status
    if (order.status === 'QUEUED') next = 'SPREADING'
    else if (order.status === 'SPREADING') next = 'CUTTING'
    else if (order.status === 'CUTTING') next = 'INSPECTED'
    else if (order.status === 'INSPECTED') next = 'BUNDLED'

    const updated = orders.map(o => (o.id === order.id ? { ...o, status: next } : o))
    saveOrders(updated)
    if (selectedOrder?.id === order.id) {
      setSelectedOrder({ ...order, status: next })
    }
  }

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault()
    const newOrder: CuttingOrder = {
      id: `co-${Date.now()}`,
      order_number: formData.order_number || `CO-2026-${Math.floor(100 + Math.random() * 900)}`,
      buyer_po: formData.buyer_po,
      buyer_name: formData.buyer_name,
      style_number: formData.style_number,
      style_name: formData.style_name,
      colorway: formData.colorway,
      total_pieces: Number(formData.total_pieces) || 1000,
      plies_planned: Number(formData.plies_planned) || 50,
      fabric_meters_allocated: Number(formData.fabric_meters_allocated) || 300,
      table_assigned: formData.table_assigned,
      status: 'QUEUED',
      priority: formData.priority,
      scheduled_start: formData.scheduled_start,
      operator_lead: formData.operator_lead
    }

    const updated = [newOrder, ...orders]
    saveOrders(updated)
    setIsNewModalOpen(false)
  }

  const filteredOrders = orders.filter(o => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_po.toLowerCase().includes(search.toLowerCase()) ||
      o.style_name.toLowerCase().includes(search.toLowerCase()) ||
      o.style_number.toLowerCase().includes(search.toLowerCase()) ||
      o.colorway.toLowerCase().includes(search.toLowerCase())
    const matchTable = tableFilter === 'ALL' || o.table_assigned.includes(tableFilter)
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter
    return matchSearch && matchTable && matchStatus
  })

  // Metric summaries
  const totalOrders = orders.length
  const activeCuts = orders.filter(o => o.status === 'CUTTING' || o.status === 'SPREADING').length
  const totalPiecesInPipe = orders.reduce((acc, o) => acc + o.total_pieces, 0)
  const urgentCount = orders.filter(o => o.priority === 'URGENT').length

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
          <span className="text-xs font-mono font-bold text-slate-900">Cutting Orders & CNC Machine Queue</span>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Dispatch Cut Work Order</span>
        </button>
      </div>

      {/* 2. Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Cutting Orders & Machine Dispatch Queue
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                CNC Table Dispatch
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Production work orders, CNC cutting queue sequencing, ply targets, and table allocation
            </p>
          </div>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active Table Spreads</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#3A3564] mt-2">{activeCuts} active</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Spreading & cutting now</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Pieces in Pipeline</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{totalPiecesInPipe.toLocaleString()} pcs</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Across all planned orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Urgent Fast-Track</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600 mt-2">{urgentCount} orders</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Priority dispatch line</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Work Orders</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 mt-2">{totalOrders} orders</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Full shift scheduling</p>
        </div>
      </div>

      {/* 4. Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search cut order #, PO, style, color..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <select
              value={tableFilter}
              onChange={e => setTableFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono text-xs font-bold text-slate-800"
            >
              <option value="ALL">All Cutting Tables</option>
              <option value="Table 01">Table 01 - Gerber</option>
              <option value="Table 02">Table 02 - Lectra</option>
              <option value="Table 03">Table 03 - Eastman</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono text-xs font-bold text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="QUEUED">QUEUED</option>
              <option value="SPREADING">SPREADING</option>
              <option value="CUTTING">CUTTING</option>
              <option value="INSPECTED">INSPECTED</option>
              <option value="BUNDLED">BUNDLED</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Orders Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] text-[#3A3564] font-mono uppercase text-[10px] tracking-wider border-b border-black/10">
              <tr>
                <th className="py-3 px-4 font-bold">Cut Order / PO</th>
                <th className="py-3 px-4 font-bold">Style & Colorway</th>
                <th className="py-3 px-4 font-bold">Target Plies & Pcs</th>
                <th className="py-3 px-4 font-bold">Assigned Table</th>
                <th className="py-3 px-4 font-bold">Priority</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium">
              {filteredOrders.map(order => {
                let badge = 'bg-slate-100 text-slate-700'
                if (order.status === 'QUEUED') badge = 'bg-slate-100 text-slate-800'
                if (order.status === 'SPREADING') badge = 'bg-amber-100 text-amber-800'
                if (order.status === 'CUTTING') badge = 'bg-indigo-100 text-indigo-800'
                if (order.status === 'INSPECTED') badge = 'bg-emerald-100 text-emerald-800'
                if (order.status === 'BUNDLED') badge = 'bg-purple-100 text-purple-800'

                let prioBadge = 'bg-slate-100 text-slate-700'
                if (order.priority === 'HIGH') prioBadge = 'bg-orange-100 text-orange-800'
                if (order.priority === 'URGENT') prioBadge = 'bg-rose-100 text-rose-800'

                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div>{order.order_number}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{order.buyer_po}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{order.style_name}</div>
                      <div className="text-[11px] text-slate-600">{order.colorway} • <span className="font-mono text-slate-400">{order.style_number}</span></div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{order.total_pieces.toLocaleString()} pcs</div>
                      <div className="text-[10px] text-slate-500">{order.plies_planned} plies • {order.fabric_meters_allocated}m</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 text-[11px]">{order.table_assigned}</div>
                      <div className="text-[10px] text-slate-500">{order.operator_lead}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${prioBadge}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${badge}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status !== 'BUNDLED' && (
                          <button
                            onClick={() => handleAdvanceStatus(order)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono text-[10px] font-bold"
                          >
                            Advance
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-[#FAF7F0] border border-black/10 font-mono text-[11px] text-[#3A3564] font-bold shadow-2xs"
                        >
                          Details
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

      {/* New Cut Order Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-bold text-base text-slate-900">Dispatch New Cutting Work Order</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Work Order #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CO-2026-095"
                    value={formData.order_number}
                    onChange={e => setFormData({ ...formData, order_number: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Buyer PO Number</label>
                  <input
                    type="text"
                    required
                    value={formData.buyer_po}
                    onChange={e => setFormData({ ...formData, buyer_po: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Style Name</label>
                  <input
                    type="text"
                    required
                    value={formData.style_name}
                    onChange={e => setFormData({ ...formData, style_name: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Colorway</label>
                  <input
                    type="text"
                    required
                    value={formData.colorway}
                    onChange={e => setFormData({ ...formData, colorway: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Total Pieces</label>
                  <input
                    type="number"
                    value={formData.total_pieces}
                    onChange={e => setFormData({ ...formData, total_pieces: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Planned Plies</label>
                  <input
                    type="number"
                    value={formData.plies_planned}
                    onChange={e => setFormData({ ...formData, plies_planned: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Fabric (m)</label>
                  <input
                    type="number"
                    value={formData.fabric_meters_allocated}
                    onChange={e => setFormData({ ...formData, fabric_meters_allocated: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Assign Table</label>
                  <select
                    value={formData.table_assigned}
                    onChange={e => setFormData({ ...formData, table_assigned: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  >
                    <option value="Table 01 - Gerber Paragon HX">Table 01 - Gerber Paragon HX</option>
                    <option value="Table 02 - Lectra Vector iX6">Table 02 - Lectra Vector iX6</option>
                    <option value="Table 03 - Eastman Straight Blade Manual">Table 03 - Eastman Straight Blade Manual</option>
                    <option value="Table 04 - Bandknife Precision Notcher">Table 04 - Bandknife Precision Notcher</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  >
                    <option value="NORMAL">NORMAL PRIORITY</option>
                    <option value="HIGH">HIGH PRIORITY</option>
                    <option value="URGENT">URGENT FAST-TRACK</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold"
                >
                  Queue Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Cut Work Order Dossier</span>
                <h3 className="font-black text-lg text-slate-900">{selectedOrder.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Buyer & PO</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.buyer_name}</p>
                <p className="font-mono text-slate-600">{selectedOrder.buyer_po}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Style & Colorway</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.style_name}</p>
                <p className="text-slate-600">Color: {selectedOrder.colorway} • Style: {selectedOrder.style_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Volume</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedOrder.total_pieces.toLocaleString()} pcs</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Plies / Fabric</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedOrder.plies_planned} plies • {selectedOrder.fabric_meters_allocated}m</p>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">CNC Table</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedOrder.table_assigned}</p>
                <p className="text-[11px] text-slate-500">Lead: {selectedOrder.operator_lead}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
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
