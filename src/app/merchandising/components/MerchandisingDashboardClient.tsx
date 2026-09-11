'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Briefcase, 
  TrendingUp, 
  PackageCheck, 
  Ship, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ChevronRight,
  Calculator,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react'
import { MerchandisingOrder, OrderStatus } from '../types/merchandising'
import { getOrders, MERCHANDISING_UPDATE_EVENT } from '../utils/merchandisingStorage'

export function MerchandisingDashboardClient() {
  const [orders, setOrders] = useState<MerchandisingOrder[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setOrders(getOrders())

    const handleUpdate = () => {
      setOrders(getOrders())
    }
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredOrders = orders.filter(ord => {
    const matchesFilter = activeFilter === 'ALL' || ord.status === activeFilter
    const matchesSearch = 
      ord.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.style_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.style_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalBookedPcs = orders.reduce((acc, curr) => acc + curr.total_quantity, 0)
  const activeOrdersCount = orders.filter(o => o.status !== 'CLOSED' && o.status !== 'DISPATCHED').length

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#09090b]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#FAF7F0]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#3A3564]/10 text-[#3A3564]">
                Division 02 • Commercial Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">Incoterms 2020 • FOB / CIF</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
              Merchandising & Sourcing Desk
            </h1>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/merchandising/orders"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Book New PO
            </Link>
            <Link
              href="/merchandising/sourcing"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-black/10 hover:border-black/20 rounded-xl transition-all shadow-sm"
            >
              <Layers className="w-4 h-4 text-[#3A3564]" />
              Sourcing PR
            </Link>
            <Link
              href="/merchandising/shipments"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-black/10 hover:border-black/20 rounded-xl transition-all shadow-sm"
            >
              <Ship className="w-4 h-4 text-[#3A3564]" />
              Container Manifest
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* 4 Metric KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Buyer POs</span>
              <span className="p-2 rounded-xl bg-[#3A3564]/5 text-[#3A3564]">
                <Briefcase className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-[#09090b]">
                {orders.length} Orders
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total Booked: <strong className="text-slate-800 font-semibold">{totalBookedPcs.toLocaleString()} Pcs</strong>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-medium text-emerald-700">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {activeOrdersCount} on factory floor
              </span>
              <Link href="/merchandising/orders" className="text-[#3A3564] hover:underline inline-flex items-center">
                Directory <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">BOM Cost Realization</span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-[#09090b]">
                98.2%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Variance within target <strong className="text-emerald-700">±1.8%</strong>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-medium text-slate-600">
              <span>Fabric yield locked</span>
              <Link href="/merchandising/costing" className="text-[#3A3564] hover:underline inline-flex items-center">
                BOM Sheets <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trim In-House Status</span>
              <span className="p-2 rounded-xl bg-indigo-500/10 text-[#3A3564]">
                <PackageCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-[#09090b]">
                100% In-Stock
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Zero floor line-stoppage risk
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-medium text-emerald-700">
              <span>Thread & Zippers allocated</span>
              <Link href="/merchandising/sourcing" className="text-[#3A3564] hover:underline inline-flex items-center">
                Sourcing PR <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">On-Time Delivery (OTD)</span>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-700">
                <Ship className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-[#09090b]">
                97.8%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                3 export containers departing this week
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-medium text-amber-800">
              <span>Port cut-off on schedule</span>
              <Link href="/merchandising/shipments" className="text-[#3A3564] hover:underline inline-flex items-center">
                Shipments <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Critical Path Health Monitor (5 Core Industry Milestones) */}
        <section className="p-6 rounded-2xl bg-white border border-black/10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Critical Path Milestone Health Monitor
              </h2>
              <p className="text-xs text-slate-500">
                Live cross-factory velocity mapping across confirmed buyer purchase orders
              </p>
            </div>
            <Link
              href="/merchandising/tna-calendar"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3A3564] hover:underline"
            >
              Open Full T&A Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Milestone 1 */}
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>1. Fabric Inward</span>
                <span className="text-emerald-700 font-bold">92%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: '92%' }} />
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">18,240 kg cleared lab test</span>
            </div>

            {/* Milestone 2 */}
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>2. Cutting</span>
                <span className="text-emerald-700 font-bold">78%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-[#3A3564] h-full rounded-full transition-all" style={{ width: '78%' }} />
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">Lay planning ratio verified</span>
            </div>

            {/* Milestone 3 */}
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>3. Sewing Floor</span>
                <span className="text-indigo-700 font-bold">64%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: '64%' }} />
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">Lines 1–4 running at 88% efficiency</span>
            </div>

            {/* Milestone 4 */}
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>4. Washing/Finishing</span>
                <span className="text-amber-700 font-bold">42%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full transition-all" style={{ width: '42%' }} />
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">Enzyme silicone wash batch in drum</span>
            </div>

            {/* Milestone 5 */}
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>5. Carton Pack</span>
                <span className="text-slate-700 font-bold">30%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-slate-700 h-full rounded-full transition-all" style={{ width: '30%' }} />
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">Final AQL 2.5 cartons prepped</span>
            </div>
          </div>
        </section>

        {/* Primary Orders Directory & Status Tabs */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Active Commercial Orders Pipeline
              </h2>
              <p className="text-xs text-slate-500">
                Live buyer contracts with BOM variance and production floor handshake status
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search PO, Brand, Style..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-black/5 text-xs font-semibold">
            {['ALL', 'BOOKED', 'IN_FABRIC', 'IN_PRODUCTION', 'PACKED', 'DISPATCHED'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeFilter === tab
                    ? 'bg-[#3A3564] text-white'
                    : 'text-slate-600 hover:bg-black/5'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">PO Number</th>
                    <th className="px-5 py-3.5">Brand / Buyer</th>
                    <th className="px-5 py-3.5">Style Description</th>
                    <th className="px-5 py-3.5 text-right">Total Pcs</th>
                    <th className="px-5 py-3.5 text-right">Unit FOB</th>
                    <th className="px-5 py-3.5 text-right">Order Value</th>
                    <th className="px-5 py-3.5">Ex-Factory Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                        No orders matching the active query or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-[#3A3564]">
                          {order.po_number}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          {order.brand_name}
                        </td>
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-semibold text-slate-900">{order.style_ref}</div>
                          <div className="text-[11px] text-slate-500 truncate">{order.style_name}</div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                          {order.total_quantity.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                          {order.currency === 'USD' && '$'}
                          {order.currency === 'INR' && '₹'}
                          {order.currency === 'EUR' && '€'}
                          {order.unit_fob_price.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                          {order.currency === 'USD' && '$'}
                          {order.currency === 'INR' && '₹'}
                          {order.currency === 'EUR' && '€'}
                          {order.total_contract_value.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 font-medium">
                          {order.ex_factory_date}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              order.status === 'IN_PRODUCTION'
                                ? 'bg-indigo-100 text-[#3A3564]'
                                : order.status === 'IN_FABRIC'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'PACKED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'DISPATCHED'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href="/merchandising/costing"
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              BOM Cost
                            </Link>
                            <Link
                              href="/merchandising/tna-calendar"
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-lg transition-colors"
                            >
                              T&A
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
