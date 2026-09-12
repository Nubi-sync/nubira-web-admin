'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Layers,
  ShieldCheck,
  Database,
  Server,
  CheckCircle2,
  Lock,
  Cpu,
  Scissors,
  Palette,
  Briefcase,
  Printer,
  Sparkles,
  Waves,
  Flame,
  Boxes,
  Wrench,
  Store,
  Search,
  ArrowRight,
  Code2,
  HardDrive,
  Key,
  ChevronRight,
  X,
  ExternalLink,
  Zap,
  Activity,
  Plus
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { fetchTenantFactoriesAction } from '../actions'
import { TenantFactory } from '../types/platform'

interface ModuleArchitectureItem {
  id: string
  unitNumber: string
  code: string
  title: string
  category: 'Pre-Production & CAD' | 'Core Manufacturing' | 'Surface & Thread Art' | 'Wet & Finishing Ops' | 'Materials & Logistics'
  tenantRoute: string
  summary: string
  workflows: string[]
  databaseTables: string[]
  clientRoles: string[]
  hardwareProfile: string
  rlsPolicy: string
  telemetryHook: string
  tierAvailability: string
  icon: React.ComponentType<{ className?: string }>
}

const ENTERPRISE_MODULES: ModuleArchitectureItem[] = [
  {
    id: 'design',
    unitNumber: 'UNIT 01',
    code: 'DSN-01',
    title: 'Design & Tech-Pack Studio',
    category: 'Pre-Production & CAD',
    tenantRoute: '/design',
    summary: 'CAD sketches, tech-pack spec sheets, sample iterations, fabric grading approvals, and buyer sample submission ledger.',
    workflows: [
      'Tech-Pack Spec Sheets & Measurement Tolerances',
      'CAD Sampling Approvals & Colorway Variants',
      'Size & Fit Grading Matrix with DXF Pattern Sync'
    ],
    databaseTables: ['tech_packs', 'design_styles', 'measurement_specs', 'cad_files'],
    clientRoles: ['DESIGNER', 'CAD_MASTER', 'SAMPLING_INCHARGE', 'SUPERADMIN'],
    hardwareProfile: 'Gerber/Lectra CAD Workstations, Digital Colorimeters, High-Res Digitizer Tablets',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('DESIGNER', 'CAD_MASTER', 'SUPERADMIN')",
    telemetryHook: 'realtime:styles_updated, storage:cad_dxf_blobs',
    tierAvailability: 'Standard Core & Full Plant AI',
    icon: Palette,
  },
  {
    id: 'merchandising',
    unitNumber: 'UNIT 02',
    code: 'MER-02',
    title: 'Merchandising & Sourcing',
    category: 'Pre-Production & CAD',
    tenantRoute: '/merchandising',
    summary: 'Buyer purchase orders, bill-of-materials (BOM) costing, trim procurement, critical path Gantt charts, and export shipping milestones.',
    workflows: [
      'Buyer PO Allocation & Dynamic BOM Costing Ledger',
      'Trim & Fabric Procurement Requisitions',
      'Production Milestone Critical Path Gantt & Delay Alerts'
    ],
    databaseTables: ['buyer_pos', 'bom_line_items', 'vendor_orders', 'critical_path_milestones'],
    clientRoles: ['MERCHANDISER', 'SOURCING_HEAD', 'COMMERCIAL_GM', 'SUPERADMIN'],
    hardwareProfile: 'EDI Buyer Ports, Automated Excel/CSV Matrix Parsers, Live Currency Hooks',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('MERCHANDISER', 'SOURCING_HEAD', 'SUPERADMIN')",
    telemetryHook: 'realtime:po_allotments, webhook:buyer_edi_sync',
    tierAvailability: 'Commercial Tier & Full Plant AI',
    icon: Briefcase,
  },
  {
    id: 'cutting',
    unitNumber: 'UNIT 03',
    code: 'CUT-03',
    title: 'Cutting & Lay Floor',
    category: 'Core Manufacturing',
    tenantRoute: '/cutting',
    summary: 'Fabric roll relaxation staging, CAD marker nesting optimization, auto-cutter queue, cut panel QC audits, and bundle QR ticketing.',
    workflows: [
      'Lay Sheet Planning & Automated Marker Ratio Nesting',
      'Fabric Roll Barcode Inward & Length Consumption',
      'Bundle QR Ticket Generation for Piece-Rate Tracking'
    ],
    databaseTables: ['lay_sheets', 'fabric_rolls', 'cutting_markers', 'bundle_tickets', 'panel_qc_logs'],
    clientRoles: ['CUTTING_MASTER', 'SPREADER_OPERATOR', 'CAD_NESTING_ENGINEER', 'SUPERADMIN'],
    hardwareProfile: 'Industrial Zebra ZD421 Thermal Printers, CNC Auto-Cutters, Roll Scanners',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('CUTTING_MASTER', 'SPREADER_OPERATOR', 'SUPERADMIN')",
    telemetryHook: 'realtime:lay_completion, event:bundle_tickets_generated',
    tierAvailability: 'Core Manufacturing & Full Plant AI',
    icon: Scissors,
  },
  {
    id: 'printing',
    unitNumber: 'UNIT 04',
    code: 'PRN-04',
    title: 'Screen & Digital Printing',
    category: 'Surface & Thread Art',
    tenantRoute: '/printing',
    summary: 'Screen print tables, stencil exposure library, direct-to-garment (DTG) runs, strike-off lab approvals, ink kitchen recipes, and curing oven QC.',
    workflows: [
      'Screen Table Batch Queue & Continuous Runs',
      'Strike-Off Lab Approvals & Pantone Color Swatches',
      'DTG & Sublimation Flow with Ink Kitchen Formulations'
    ],
    databaseTables: ['print_orders', 'screen_stencils', 'strike_offs', 'ink_recipes', 'curing_qc_logs'],
    clientRoles: ['PRINT_MASTER', 'COLORIST', 'DTG_OPERATOR', 'SCREEN_PREP_TECH', 'SUPERADMIN'],
    hardwareProfile: 'Spectrophotometers, Industrial Tunnel Oven Dataloggers, Ink Dispenser Scales',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('PRINT_MASTER', 'COLORIST', 'SUPERADMIN')",
    telemetryHook: 'realtime:curing_temp_telemetry, event:strike_off_decision',
    tierAvailability: 'Specialized Surface Art & Full Plant AI',
    icon: Printer,
  },
  {
    id: 'embroidery',
    unitNumber: 'UNIT 05',
    code: 'EMB-05',
    title: 'Multi-Head Embroidery',
    category: 'Surface & Thread Art',
    tenantRoute: '/embroidery',
    summary: 'Multi-head computerized embroidery machines, DST punch file digitizing library, thread cone inventory, stitch count piece billing, and break QC.',
    workflows: [
      'Multi-Head Machine Runs & Frame Hooping Schedules',
      'DST/PES Punch File Digitizing Library & Stitch Counter',
      'Thread Break QC Logs & Operator Piece-Rate Billing'
    ],
    databaseTables: ['punch_files', 'embroidery_runs', 'stitch_billing', 'thread_store', 'thread_qc_logs'],
    clientRoles: ['EMBROIDERY_SUPERVISOR', 'PUNCH_DIGITIZER', 'MACHINE_OPERATOR', 'SUPERADMIN'],
    hardwareProfile: 'Tajima/Barudan LAN Machine Integrations, DST Parsers, Thread Tension Sensors',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('EMBROIDERY_SUPERVISOR', 'PUNCH_DIGITIZER', 'SUPERADMIN')",
    telemetryHook: 'realtime:machine_rpm_stream, event:stitch_billing_settled',
    tierAvailability: 'Specialized Surface Art & Full Plant AI',
    icon: Sparkles,
  },
  {
    id: 'stitching-sewing',
    unitNumber: 'UNIT 06',
    code: 'SEW-06',
    title: 'Stitching & Sewing Floor',
    category: 'Core Manufacturing',
    tenantRoute: '/stitching-sewing',
    summary: 'Real-time sewing lines, lineman bundle allocations, live cutting challan issues, operator piece-rate tariffs, 3-stage inline QC, and defect logs.',
    workflows: [
      'Live Cutting Challans & Batch Lineman Dispatches',
      'Operator Piece-Rate Bundle Allotments & Tariffs',
      '3-Stage Inline Sewing QC (Cut-Panel, Assembly, Final Seam)'
    ],
    databaseTables: ['challans', 'allotments', 'daily_production_logs', 'operator_tariffs', 'sewing_qc_inspections'],
    clientRoles: ['SEWING_SUPERVISOR', 'FLOOR_LINEMAN', 'QUALITY_CHECKER', 'TAILOR_OPERATOR', 'SUPERADMIN'],
    hardwareProfile: 'Line-End Android Rugged Tablets, Bluetooth 2D Ring Scanners, Overhead Floor Dashboards',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('SEWING_SUPERVISOR', 'FLOOR_LINEMAN', 'SUPERADMIN')",
    telemetryHook: 'realtime:challan_status_change, realtime:allotments_issued',
    tierAvailability: 'Core Manufacturing & Full Plant AI',
    icon: Layers,
  },
  {
    id: 'washing',
    unitNumber: 'UNIT 07',
    code: 'WSH-07',
    title: 'Industrial Washing',
    category: 'Wet & Finishing Ops',
    tenantRoute: '/washing',
    summary: 'Enzyme washes, acid washes, silicon softeners, liquor ratio batch dosing, hydro-extractor logs, drying tumblers, and fabric shrinkage audits.',
    workflows: [
      'Enzyme & Silicon Softener Automated Wash Recipes',
      'Batch Liquor Ratio & Chemical Dosing Calculator',
      'Hydro-Extractor & Drying Tumbler Temperature Logs'
    ],
    databaseTables: ['wash_recipes', 'liquor_batches', 'hydro_extractors', 'shrinkage_qc_logs'],
    clientRoles: ['WASH_CHEMIST', 'HYDRO_OPERATOR', 'WASH_SUPERVISOR', 'SUPERADMIN'],
    hardwareProfile: 'Automated Chemical Dosing Pumps, Digital Flowmeters, Moisture Balance Scales',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('WASH_CHEMIST', 'WASH_SUPERVISOR', 'SUPERADMIN')",
    telemetryHook: 'realtime:wash_cycle_telemetry, event:shrinkage_audit_logged',
    tierAvailability: 'Wet Processing & Full Plant AI',
    icon: Waves,
  },
  {
    id: 'iron',
    unitNumber: 'UNIT 08',
    code: 'IRN-08',
    title: 'Ironing & Steam Pressing',
    category: 'Wet & Finishing Ops',
    tenantRoute: '/iron',
    summary: 'Industrial steam vacuum ironing tables, form finishers, boiler steam pressure gauges, inline finish inspections, and piece-rate finishing logs.',
    workflows: [
      'Steam Vacuum Table Allotments & Temperature Checks',
      'Inline Finish Inspection & Sheen Prevention QC',
      'Ironing Piece-Rate Output & Tariff Payroll Logs'
    ],
    databaseTables: ['ironing_batches', 'steam_stations', 'finish_qc_logs', 'ironing_tariffs'],
    clientRoles: ['PRESSING_SUPERVISOR', 'IRONING_OPERATOR', 'BOILER_TECH', 'SUPERADMIN'],
    hardwareProfile: 'Steam Boiler Pressure Sensors, Vacuum Table Foot Switches, Scan Kiosks',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('PRESSING_SUPERVISOR', 'SUPERADMIN')",
    telemetryHook: 'realtime:steam_pressure_alerts, event:ironing_batch_cleared',
    tierAvailability: 'Garment Finishing & Full Plant AI',
    icon: Flame,
  },
  {
    id: 'ready-goods',
    unitNumber: 'UNIT 09',
    code: 'PKG-09',
    title: 'Ready Goods & Packing',
    category: 'Wet & Finishing Ops',
    tenantRoute: '/ready-goods',
    summary: 'AQL 2.5 final buyer audits, price hangtag ticketing, polybag heat sealing, master carton packing manifests, barcode labeling, and dispatch gate passes.',
    workflows: [
      'AQL 2.5 Critical & Major Defect Final Sampling Audits',
      'Barcode Hangtag & Polybag Scan-Verification',
      'Master Carton Packing Manifests & Buyer EDI Exporters'
    ],
    databaseTables: ['carton_manifests', 'aql_audits', 'polybag_scan_logs', 'dispatch_challans', 'gate_passes'],
    clientRoles: ['AQL_AUDITOR', 'PACKING_SUPERVISOR', 'DISPATCH_CLERK', 'SUPERADMIN'],
    hardwareProfile: 'Zebra Industrial Label Engines, Electronic Floor Scales, Handheld RF Scanners',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('AQL_AUDITOR', 'PACKING_SUPERVISOR', 'SUPERADMIN')",
    telemetryHook: 'realtime:aql_audit_result, event:master_carton_sealed',
    tierAvailability: 'Garment Finishing & Full Plant AI',
    icon: Boxes,
  },
  {
    id: 'alter',
    unitNumber: 'UNIT 10',
    code: 'ALT-10',
    title: 'Alteration & Rework Clinic',
    category: 'Wet & Finishing Ops',
    tenantRoute: '/alter',
    summary: 'Defect categorization (oil spot, stitch skip, needle mark, shading), line-wise rework queues, alteration tailor assignments, and post-repair re-audit clearance.',
    workflows: [
      'Defect Root-Cause Categorization & Machine Line Tagging',
      'Line-Wise Rework Queue & Tailor Repair Allotments',
      'Post-Repair Quality Re-Inspection & AQL Clearance'
    ],
    databaseTables: ['defect_logs', 'rework_items', 'repair_allotments', 'qa_reinspection_records'],
    clientRoles: ['REWORK_SUPERVISOR', 'ALTERATION_TAILOR', 'LEAD_QA', 'SUPERADMIN'],
    hardwareProfile: 'Defect Thermal Tag Printers, Inspection Light Tables, Spotting Chemical Guns',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('REWORK_SUPERVISOR', 'LEAD_QA', 'SUPERADMIN')",
    telemetryHook: 'realtime:rework_queue_count, event:defect_cleared',
    tierAvailability: 'Quality Recovery & Full Plant AI',
    icon: Wrench,
  },
  {
    id: 'store',
    unitNumber: 'UNIT 11',
    code: 'STR-11',
    title: 'Central Store & Godown',
    category: 'Materials & Logistics',
    tenantRoute: '/store',
    summary: 'Fabric roll inwards with QR, trims & accessories inventory bin cards, cutting lot issuance, gate pass verification, and finished goods warehouse stock ledger.',
    workflows: [
      'Raw Fabric Roll QR Inward & Bin Card Allocation',
      'Trim & Button Stock Ledger with Auto Reorder Levels',
      'Cutting Challan Issues & Finished Carton Dispatch Gate Passes'
    ],
    databaseTables: ['store_transactions', 'inventory_items', 'truck_inwards', 'fabric_rolls', 'trim_stock_cards'],
    clientRoles: ['GODOWN_MANAGER', 'STORE_SUPERVISOR', 'INWARD_CLERK', 'SUPERADMIN'],
    hardwareProfile: 'Fabric Roll Measuring Bars, Bin RFID Readers, Weighbridge Gate Terminals',
    rlsPolicy: "tenant_id = auth.jwt()->>'tenant_id' AND role IN ('STORE', 'STORE_SUPERVISOR', 'GODOWN', 'SUPERADMIN')",
    telemetryHook: 'realtime:store_transactions, event:roll_inward_verified',
    tierAvailability: 'Core Materials & Full Plant AI',
    icon: Store,
  },
]

export default function EnterpriseModulesPage() {
  const [tenants, setTenants] = useState<TenantFactory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeBlueprint, setActiveBlueprint] = useState<ModuleArchitectureItem | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchTenantFactoriesAction()
        if (res.data) {
          setTenants(res.data)
        }
      } catch (err) {
        console.warn('Failed to load tenants for module matrix:', err)
      }
    }
    loadData()
  }, [])

  const categories = useMemo(() => [
    'ALL',
    'Pre-Production & CAD',
    'Core Manufacturing',
    'Surface & Thread Art',
    'Wet & Finishing Ops',
    'Materials & Logistics',
  ], [])

  const filteredModules = useMemo(() => {
    return ENTERPRISE_MODULES.filter(mod => {
      const matchesCategory = selectedCategory === 'ALL' || mod.category === selectedCategory
      const matchesSearch =
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.databaseTables.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        mod.workflows.some(w => w.toLowerCase().includes(searchQuery.toLowerCase())) ||
        mod.clientRoles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  return (
    <PlatformAdminShell userEmail="admin@zigza.in">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 pb-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              <span>Platform Root Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#3A3564] font-bold">11 Enterprise Modules</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Enterprise Manufacturing Modules
              </h1>
              <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#3A3564] text-white shadow-2xs">
                11 UNITS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Platform-wide master catalog, tenant boundary guarantees, database schema footprints, and division microservice specifications for all 11 licensed Zigza manufacturing units.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/platform-admin/provisioning"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2d2950] transition-colors shadow-xs cursor-pointer font-[family-name:var(--font-heading)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision Factory</span>
            </Link>
            <Link
              href="/platform-admin/infrastructure"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-[#FAF7F0] border border-black/10 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer font-[family-name:var(--font-heading)]"
            >
              <Activity className="w-3.5 h-3.5 text-[#3A3564]" />
              <span>Telemetry</span>
            </Link>
          </div>
        </div>

        {/* Multi-Tenant Sovereign Isolation Protocol Alert */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#3A3564]/20 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAF7F0] rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  Tenant Data Isolation & Zero Cross-Barging Protocol
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                  POSTGRESQL RLS ENFORCED
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                As the Platform Root Administrator (<code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">admin@zigza.in</code>), operational factory floor modules (<code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">/modules</code>, <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">/stitching-sewing</code>, etc.) are strictly partitioned per client tenant. This console governs the 11-module master architecture, tenant licensing allocations, and microservice definitions without trespassing on private client company data.
              </p>
            </div>
          </div>
        </div>

        {/* Key Architectural Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-white border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">Total Units</span>
              <Layers className="w-4 h-4 text-[#3A3564]" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-2">11</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Fully engineered manufacturing divisions</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">Data Isolation</span>
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-2">100%</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Supabase RLS tenant quarantine</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">Provisioned Plants</span>
              <Server className="w-4 h-4 text-[#3A3564]" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-2">{tenants.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Licensed manufacturing tenants</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">Realtime Sync</span>
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-2">&lt; 15ms</div>
            <div className="text-[11px] text-slate-500 mt-0.5">WebSocket edge telemetry latency</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'bg-white border border-black/10 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'All 11 Units' : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows, roles, tables..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-black/10 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 11 Modules Architecture Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredModules.map((mod) => {
            const Icon = mod.icon
            return (
              <div
                key={mod.id}
                className="rounded-2xl bg-white border border-black/10 shadow-xs hover:shadow-md hover:border-[#3A3564]/40 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top / Header */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                            {mod.unitNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            {mod.code}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight font-[family-name:var(--font-heading)] leading-snug mt-0.5">
                          {mod.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {mod.summary}
                  </p>

                  {/* Category & Tenant Route Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {mod.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-[#FAF7F0] border border-black/10 px-2 py-0.5 rounded-md">
                      Route: {mod.tenantRoute}
                    </span>
                  </div>

                  {/* Key Workflows */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Production Workflows
                    </span>
                    <div className="space-y-1">
                      {mod.workflows.map((wf, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3A3564] shrink-0 mt-0.5" />
                          <span className="leading-tight text-[11px]">{wf}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Database Tables Footprint */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      PostgreSQL Tables Footprint
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {mod.databaseTables.map((tbl) => (
                        <span
                          key={tbl}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-black/5"
                        >
                          {tbl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer / Action */}
                <div className="p-4 border-t border-black/10 bg-[#FAF7F0]/60 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-500">
                      Roles: {mod.clientRoles.slice(0, 2).join(', ')}
                      {mod.clientRoles.length > 2 ? ` +${mod.clientRoles.length - 2}` : ''}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                      RLS Verified Sovereign
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveBlueprint(mod)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#3A3564] bg-white border border-black/10 hover:bg-[#3A3564] hover:text-white transition-all shadow-2xs cursor-pointer font-[family-name:var(--font-heading)]"
                  >
                    <span>Blueprint</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Interactive Architecture Blueprint Modal */}
        {activeBlueprint && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
              className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-black/10 flex items-start justify-between bg-[#FAF7F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <activeBlueprint.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white text-[#3A3564] border border-black/10">
                        {activeBlueprint.unitNumber}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        {activeBlueprint.code}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                        {activeBlueprint.category}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
                      {activeBlueprint.title} Architecture Blueprint
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveBlueprint(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mb-1">
                    Functional Scope
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {activeBlueprint.summary}
                  </p>
                </div>

                {/* Key Workflows */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-black/5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Core Operational Workflows
                  </h4>
                  <div className="space-y-1.5">
                    {activeBlueprint.workflows.map((wf, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                        <span>{wf}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security RLS Policy */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#3A3564] uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#3A3564]" />
                      <span>PostgreSQL Row-Level Security (RLS) Policy</span>
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      TENANT_ID ENFORCED
                    </span>
                  </div>
                  <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed">
                    {activeBlueprint.rlsPolicy}
                  </pre>
                  <p className="text-[11px] text-slate-500 font-sans leading-tight">
                    Ensures users of Company A can never view, mutate, or query manufacturing records belonging to Company B.
                  </p>
                </div>

                {/* Technical Specifications Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-black/10 bg-white">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Hardware & IoT Profile
                    </span>
                    <p className="text-xs text-slate-700 font-sans">
                      {activeBlueprint.hardwareProfile}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-black/10 bg-white">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      WebSocket Telemetry Hooks
                    </span>
                    <p className="text-xs font-mono text-slate-700">
                      {activeBlueprint.telemetryHook}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-black/10 bg-white sm:col-span-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Supported Factory Floor Roles
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {activeBlueprint.clientRoles.map((r) => (
                        <span key={r} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-black/10 bg-slate-50 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-mono">
                  Tenant Path: <strong className="text-slate-800">{activeBlueprint.tenantRoute}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveBlueprint(null)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <Link
                    href={`/platform-admin/provisioning?module=${activeBlueprint.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2d2950] transition-colors shadow-2xs cursor-pointer font-[family-name:var(--font-heading)]"
                  >
                    <span>Allot in Tenant Provisioning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </PlatformAdminShell>
  )
}
