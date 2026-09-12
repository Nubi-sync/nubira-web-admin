'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  Globe
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'

interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  action: string
  category: 'AUTH' | 'PROVISIONING' | 'SECURITY_ALERT' | 'CONFIG_CHANGE'
  details: string
  ipAddress: string
  location: string
  status: 'SUCCESS' | 'WARNING' | 'FAILED'
}

const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'LOG-8801',
    timestamp: '2026-09-12 15:45:10',
    actor: 'admin@zigza.in',
    action: 'Root SuperAdmin Sign-In',
    category: 'AUTH',
    details: 'Authenticated via Platform Master Portal credential challenge',
    ipAddress: '103.24.12.89',
    location: 'Burhanpur, MP, India',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-8802',
    timestamp: '2026-09-12 15:20:44',
    actor: 'admin@zigza.in',
    action: 'Tenant Provisioning Completed',
    category: 'PROVISIONING',
    details: 'Generated credentials and allotted 11 divisions for Shahi Exports Unit 9',
    ipAddress: '103.24.12.89',
    location: 'Burhanpur, MP, India',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-8803',
    timestamp: '2026-09-12 14:02:18',
    actor: 'system_bot',
    action: 'Demo Lead Ingestion',
    category: 'CONFIG_CHANGE',
    details: 'New inquiry registered: Arvind Fashions (Deepak Sharma, Bengaluru)',
    ipAddress: '49.207.211.34',
    location: 'Bengaluru, KA, India',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-8804',
    timestamp: '2026-09-12 12:45:00',
    actor: 'unknown@external',
    action: 'Repeated Invalid Sign-In Attempt',
    category: 'SECURITY_ALERT',
    details: '3 consecutive failed attempts on /login; IP rate-limited for 15 minutes',
    ipAddress: '185.220.101.5',
    location: 'Frankfurt, Germany',
    status: 'WARNING'
  },
  {
    id: 'LOG-8805',
    timestamp: '2026-09-12 11:15:32',
    actor: 'admin@zigza.in',
    action: 'API Key Re-Issue',
    category: 'PROVISIONING',
    details: 'Rotated Supabase Service Role client keys for Raymon Mills Plant',
    ipAddress: '103.24.12.89',
    location: 'Burhanpur, MP, India',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-8806',
    timestamp: '2026-09-11 18:30:12',
    actor: 'admin@zigza.in',
    action: 'Division Module Entitlement Added',
    category: 'CONFIG_CHANGE',
    details: 'Enabled Washing & Garment Finishing unit for Eastman Exports',
    ipAddress: '103.24.12.89',
    location: 'Burhanpur, MP, India',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-8807',
    timestamp: '2026-09-11 14:12:05',
    actor: 'system_backup',
    action: 'PostgreSQL Snapshot Sync',
    category: 'AUTH',
    details: 'Encrypted AES-256 cloud snapshot created for multi-tenant partitions',
    ipAddress: '10.0.4.12',
    location: 'AWS ap-south-1 Mumbai',
    status: 'SUCCESS'
  }
]

export default function SecurityAuditLogsPage() {
  const [logs, setLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | AuditEvent['category']>('ALL')

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (categoryFilter === 'ALL') return true
    return log.category === categoryFilter
  })

  const exportCSV = () => {
    const headers = 'ID,Timestamp,Actor,Action,Category,Details,IP,Location,Status\n'
    const rows = filteredLogs
      .map(
        l =>
          `"${l.id}","${l.timestamp}","${l.actor}","${l.action}","${l.category}","${l.details}","${l.ipAddress}","${l.location}","${l.status}"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `zigza_platform_audit_logs_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <PlatformAdminShell userEmail="admin@zigza.in">
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
        
        {/* Layer 1: Breadcrumb Hierarchy Trail */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/platform-admin" className="hover:text-[#3A3564] transition-colors">
            Platform Root
          </Link>
          <span>/</span>
          <span>Security & Compliance</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Security & Audit Logs</span>
        </div>

        {/* Layer 2: Encapsulated Top Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  Security & Audit Logs
                </h1>
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs tracking-wider">
                  SOC-2 Compliant Trail
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
                Real-time tracking of Root Super Admin sessions, tenant provisioning events, and cloud access security
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>
        </div>

        {/* Layer 4 & 5: Unified Toolbar & Data Table Container */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          
          {/* Layer 4: Toolbar Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1 sm:pb-0">
              {(['ALL', 'AUTH', 'PROVISIONING', 'SECURITY_ALERT', 'CONFIG_CHANGE'] as const).map(cat => {
                const label = cat === 'ALL' ? 'All Events' : cat.replace(/_/g, ' ')
                const active = categoryFilter === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                        : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, IP, actor, location..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
              />
            </div>
          </div>

          {/* Layer 5: Primary Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Origin IP & Location</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 font-mono text-xs">
                      No security audit events found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {l.id}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {l.timestamp}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[#3A3564]">
                        {l.actor}
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-slate-900 font-[family-name:var(--font-heading)]">{l.action}</div>
                        <div className="text-[11px] text-slate-500 font-medium font-[family-name:var(--font-public-sans)] truncate mt-0.5">
                          {l.details}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-black/10 text-[10px] font-bold text-slate-700">
                          {l.category.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">{l.ipAddress}</div>
                        <div className="text-slate-500 flex items-center gap-1 text-[10px] mt-0.5">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{l.location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {l.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold uppercase border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Success
                          </span>
                        ) : l.status === 'WARNING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-mono font-bold uppercase border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-mono font-bold uppercase border border-rose-200">
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PlatformAdminShell>
  )
}
