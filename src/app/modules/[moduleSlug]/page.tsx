import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Factory,
  Briefcase,
  Waves,
  Printer,
  Sparkles,
  Scissors,
  Palette,
  Flame,
  Boxes,
  Wrench,
  Store,
  ArrowRight,
  ChevronLeft,
  Activity,
  ShieldCheck,
  Layers,
  Cpu,
  CheckCircle2,
  Users,
  Building2,
  Clock
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ModuleInfo {
  slug: string
  title: string
  categoryBadge: string
  subtitle: string
  operationalRoute: string
  icon: React.ComponentType<{ className?: string }>
  stats: { label: string; value: string; hint: string }[]
  keyCapabilities: string[]
  supervisorTitle: string
  shiftInfo: string
  capacity: string
}

const MODULE_DATA: Record<string, ModuleInfo> = {
  design: {
    slug: 'design',
    title: 'Design & Tech-Pack Studio',
    categoryBadge: 'CREATIVE STUDIO',
    subtitle: 'CAD sketches, measurement tech-packs, sample iteration grading, and fabric consumption approvals.',
    operationalRoute: '/design',
    icon: Palette,
    stats: [
      { label: 'Active Tech-Packs', value: '28 Specs', hint: '12 approved for bulk' },
      { label: 'Sample Approvals', value: '8 Pending', hint: 'Avg cycle: 3.2 days' },
      { label: 'Grading Matrix', value: '6 Sizes', hint: 'XS to XXL standard' },
      { label: 'PPS Readiness', value: '96.4%', hint: 'Pre-production speed' },
    ],
    keyCapabilities: [
      'CAD sketch & digital spec sheet library',
      'Size grading measurement tables & tolerances',
      'Sample fit iteration & PPS approval tracker',
      'Fabric blend & GSM specification matrix'
    ],
    supervisorTitle: 'Chief Creative Lead',
    shiftInfo: 'General Shift (09:00 AM - 06:00 PM)',
    capacity: 'Full CAD & Sample Development Suite'
  },
  merchandising: {
    slug: 'merchandising',
    title: 'Merchandising & Sourcing',
    categoryBadge: 'COMMERCIAL OPS',
    subtitle: 'Buyer PO allocation, BOM costing ledgers, trim procurement schedules, and export delivery timetables.',
    operationalRoute: '/merchandising',
    icon: Briefcase,
    stats: [
      { label: 'Active Buyer POs', value: '14 Orders', hint: '185k total pcs' },
      { label: 'BOM Costing', value: '98.2%', hint: 'Variance within ±1.8%' },
      { label: 'Trim Sourcing', value: '100%', hint: 'Trims in-house' },
      { label: 'On-Time Delivery', value: '97.8%', hint: '3 shipments this week' },
    ],
    keyCapabilities: [
      'Direct buyer style matrix & tech-pack tracking',
      'Purchase order ledger & milestone billing',
      'BOM costing & trim procurement ledger',
      'Shipment dispatch pipeline & delivery challans'
    ],
    supervisorTitle: 'Head of Merchandising',
    shiftInfo: 'General Shift (09:00 AM - 06:30 PM)',
    capacity: '14 Active Global Buyer Portfolios'
  },
  cutting: {
    slug: 'cutting',
    title: 'Cutting & Lay Floor',
    categoryBadge: 'CUTTING DIVISION',
    subtitle: 'Fabric roll lay planning, marker efficiency, computerized auto-cutters, and bundle QR ticket creation.',
    operationalRoute: '/cutting',
    icon: Scissors,
    stats: [
      { label: 'Daily Cut Volume', value: '8,240 Pcs', hint: '4 active lay tables' },
      { label: 'Marker Efficiency', value: '88.4%', hint: 'Target: > 86.0%' },
      { label: 'Bundles Issued', value: '328 Bundles', hint: '100% QR tagged' },
      { label: 'Fabric Meterage', value: '4,120 m', hint: 'Scrap: 1.4%' },
    ],
    keyCapabilities: [
      'Fabric roll spread planning & layer optimization',
      'Marker ratio generation & end-bit waste minimize',
      'Computerized auto-cutter file streaming',
      'Lineman bundle QR ticket numbering & issue'
    ],
    supervisorTitle: 'Cutting Floor Master',
    shiftInfo: 'Shift A (07:30 AM - 05:00 PM)',
    capacity: '4 Spreading Tables & 2 Auto-Cutters'
  },
  printing: {
    slug: 'printing',
    title: 'Screen & Digital Printing',
    categoryBadge: 'SURFACE ART',
    subtitle: 'High-speed rotary screen tables, Direct-to-Garment (DTG) printing lines, strike-off color approvals, and curing ovens.',
    operationalRoute: '/printing',
    icon: Printer,
    stats: [
      { label: 'Screen Tables', value: '8 Tables', hint: '60m continuous tables' },
      { label: 'DTG Print Units', value: '4 Machines', hint: 'High-res industrial' },
      { label: 'Strike-Offs', value: '100% OK', hint: 'Zero color bleed' },
      { label: 'Oven Curing', value: '160°C Verified', hint: 'Thermal fix rate' },
    ],
    keyCapabilities: [
      'Screen exposure & stencil library management',
      'Strike-off lab dip approvals & Pantone shade matching',
      'Multi-color pigment, plastisol, and discharge printing',
      'Digital print queue & sublimation transfer ovens'
    ],
    supervisorTitle: 'Printing Floor Master',
    shiftInfo: 'Shift A (08:00 AM - 05:30 PM)',
    capacity: '8 Screen Tables & 4 Digital Stations'
  },
  embroidery: {
    slug: 'embroidery',
    title: 'Multi-Head Embroidery Floor',
    categoryBadge: 'THREAD ART',
    subtitle: 'Computerized multi-head embroidery lines, punch digitizing file management, frame stitch counts, and jobwork billing.',
    operationalRoute: '/embroidery',
    icon: Sparkles,
    stats: [
      { label: 'Embroidery Lines', value: '10 Units', hint: '20-head automated' },
      { label: 'Daily Stitches', value: '1.8M Stitches', hint: 'Cumulative running' },
      { label: 'Thread Break Rate', value: '0.02%', hint: 'High efficiency' },
      { label: 'Punch Library', value: '450+ DST', hint: 'Ready-to-run designs' },
    ],
    keyCapabilities: [
      'DST/DSB computerized punch file digitizing',
      'Automatic multi-color thread trimming & tensioning',
      'Piece-rate stitch counter & jobwork invoice generator',
      'Direct garment frame hoop loading & inline checks'
    ],
    supervisorTitle: 'Embroidery Master Digitizer',
    shiftInfo: 'Shift A & B (08:00 AM - 10:00 PM)',
    capacity: '10 Multi-Head Lines (200 Total Heads)'
  },
  'stitching-sewing': {
    slug: 'stitching-sewing',
    title: 'Stitching & Sewing Floor',
    categoryBadge: 'CORE SEWING FLOOR',
    subtitle: 'High-throughput garment manufacturing floor managing cutting lots, lineman bundle allocations, 3-stage QC, and godown store sync.',
    operationalRoute: '/stitching-sewing/dashboard',
    icon: Layers,
    stats: [
      { label: 'Sewing Lines', value: '8 Active Lines', hint: 'Lineman assigned' },
      { label: 'Bundles in Flow', value: '1,420 Bundles', hint: 'Cutting to finishing' },
      { label: 'First Pass Yield', value: '97.8%', hint: 'QC audit verified' },
      { label: 'Store Sync', value: 'REALTIME', hint: 'GRN & outward connected' },
    ],
    keyCapabilities: [
      'Barcode bundle allotment & lineman piece-rate wage calculation',
      'Cutting room matrix & layer consumption tracking',
      '3-Stage QC inspection (Cutting, Inline, Finishing Audits)',
      'Store inventory ledger & delivery challan dispatch'
    ],
    supervisorTitle: 'Floor Operations Head',
    shiftInfo: 'Shift A (08:00 AM - 05:30 PM)',
    capacity: '8 High-Speed Progressive Sewing Lines'
  },
  washing: {
    slug: 'washing',
    title: 'Industrial Washing Division',
    categoryBadge: 'WET PROCESSING',
    subtitle: 'Precision wet processing line managing garment enzyme washes, silicon softeners, acid wash recipes, and liquor ratios.',
    operationalRoute: '/washing',
    icon: Waves,
    stats: [
      { label: 'Wash Tumblers', value: '6 / 6', hint: 'Running at capacity' },
      { label: 'Batch Volume', value: '3,200 Pcs', hint: 'Daily wet load' },
      { label: 'Liquor Ratio', value: '1:5.2', hint: 'Standard eco-ratio' },
      { label: 'Shrinkage Rate', value: '< 1.5%', hint: 'Strict quality spec' },
    ],
    keyCapabilities: [
      'Automated batch recipe & chemical liquor monitoring',
      'Enzyme, bio-polish, and softening cycle tracking',
      'Hydro-extractor load timing & high-temp drying logs',
      'Colorfastness & shade matching quality approvals'
    ],
    supervisorTitle: 'Washing & Wet Processing Master',
    shiftInfo: 'Shift A (07:30 AM - 05:00 PM)',
    capacity: '6 Industrial Washers (600kg/batch)'
  },
  iron: {
    slug: 'iron',
    title: 'Ironing & Steam Pressing',
    categoryBadge: 'FINISHING UNIT',
    subtitle: 'Industrial boiler steam pressing, vacuum buck tables, inline finish inspections, and operator piece-rate tracking.',
    operationalRoute: '/iron',
    icon: Flame,
    stats: [
      { label: 'Daily Pressed', value: '6,180 Pcs', hint: 'Target: 7,500 pcs' },
      { label: 'Steam Pressure', value: '4.5 Bar', hint: 'Optimal 4.2–4.8 Bar' },
      { label: 'Pressing Tables', value: '12 Tables', hint: 'Vacuum active' },
      { label: 'Finishing Pass', value: '99.1%', hint: 'Zero glaze defects' },
    ],
    keyCapabilities: [
      'High-pressure boiler steam vacuum pressing',
      'Teflon shoe temperature regulation & crease set',
      'Operator piece-rate finishing wage log',
      'Inline finish audit & handover to carton packing'
    ],
    supervisorTitle: 'Finishing Floor Master',
    shiftInfo: 'Shift A (08:00 AM - 05:30 PM)',
    capacity: '12 Boiler Steam Vacuum Tables'
  },
  'ready-goods': {
    slug: 'ready-goods',
    title: 'Ready Goods & Packing',
    categoryBadge: 'FINAL PACKING',
    subtitle: 'AQL 2.5 final inspection, barcode hangtag affixing, polybag packing, and master export carton manifest.',
    operationalRoute: '/ready-goods',
    icon: Boxes,
    stats: [
      { label: 'Packed Cartons', value: '142 Cartons', hint: '5,680 finished garments' },
      { label: 'AQL 2.5 Score', value: 'PASS (0.4%)', hint: 'Strict inspection met' },
      { label: 'Hangtag Match', value: '100% OK', hint: 'EAN-13 barcode synced' },
      { label: 'Godown Stock', value: '42,500 Pcs', hint: 'Central storage' },
    ],
    keyCapabilities: [
      'AQL 2.5 statistical sample audit & defect scoring',
      'Barcode hangtag verification & polybag sealing',
      'Ratio assortment carton packing list manifest',
      'Direct warehouse transfer & container load'
    ],
    supervisorTitle: 'Packing & QA Lead',
    shiftInfo: 'Shift A (08:00 AM - 06:00 PM)',
    capacity: '4 Packing Lines (200 Cartons/Day)'
  },
  alter: {
    slug: 'alter',
    title: 'Alteration & Quality Rework',
    categoryBadge: 'QUALITY RECOVERY',
    subtitle: 'Defect categorization, seam rework, stitch alterations, and post-repair secondary AQL inspections.',
    operationalRoute: '/alter',
    icon: Wrench,
    stats: [
      { label: 'In-Queue', value: '42 Pcs', hint: 'Floor defect rate: 0.8%' },
      { label: 'Repaired & Clear', value: '38 Pcs', hint: 'Passed back to line' },
      { label: 'Top Defect', value: 'Skip Stitch', hint: 'Tension adjusted' },
      { label: 'Recovery Rate', value: '95.2%', hint: 'Scrap minimal: 0.04%' },
    ],
    keyCapabilities: [
      'Defect root-cause categorization & Pareto logging',
      'Seam rework, collar reset, and stitch mending',
      'Operator alteration piece-rate tracking',
      'Secondary AQL clearance back to production'
    ],
    supervisorTitle: 'Quality Recovery Master',
    shiftInfo: 'Shift A (08:00 AM - 05:30 PM)',
    capacity: '6 Dedicated Mending & Rework Stations'
  },
  store: {
    slug: 'store',
    title: 'Central Store & Godown',
    categoryBadge: 'CENTRAL GODOWN',
    subtitle: 'Raw fabric rolls, trims godown, cutting challan issues, and finished export carton storage.',
    operationalRoute: '/store',
    icon: Store,
    stats: [
      { label: 'Fabric Rolls', value: '1,240 Rolls', hint: '32.5 tons in stock' },
      { label: 'Finished Stock', value: '42,500 Pcs', hint: 'Central Godown Bay 3-5' },
      { label: 'Challans Issued', value: '18 Today', hint: 'Cutting & floor dispatch' },
      { label: 'Ledger Accuracy', value: '99.9%', hint: 'Barcode verified' },
    ],
    keyCapabilities: [
      'Raw material fabric roll inwarding & GSM verification',
      'Trims, thread, and accessory godown ledger',
      'Cutting challan issue & roll consumption sync',
      'Finished carton storage & dispatch gate passes'
    ],
    supervisorTitle: 'Chief Storekeeper',
    shiftInfo: 'Shift A (07:30 AM - 06:00 PM)',
    capacity: '50,000 Pcs Ready Godown & Central Yard'
  },
  factory: {
    slug: 'factory',
    title: 'Factory Control Center',
    categoryBadge: 'PLANT OPERATIONS',
    subtitle: 'Central command for master plant telemetry, machinery health, overall equipment efficiency (OEE), and line throughput.',
    operationalRoute: '/factory',
    icon: Factory,
    stats: [
      { label: 'Active Lines', value: '12 / 12', hint: '100% floor uptime' },
      { label: 'Plant OEE', value: '88.4%', hint: 'Target: 85.0%' },
      { label: 'Shift Output', value: '4,850 Pcs', hint: 'Today cumulative' },
      { label: 'Floor Status', value: 'OPTIMAL', hint: 'Zero critical alarms' },
    ],
    keyCapabilities: [
      'Real-time automated line telemetry streaming',
      'Central shift coordination & supervisor broadcast',
      'Machine maintenance logs & preventative warnings',
      'Department-wide energy & throughput auditing'
    ],
    supervisorTitle: 'Plant Operations Head',
    shiftInfo: 'Shift A & B (24/7 Monitored)',
    capacity: '12 Automated Production Lines'
  },
  brands: {
    slug: 'brands',
    title: 'Brands & Buyer Portfolios',
    categoryBadge: 'BUYER CRM',
    subtitle: 'Comprehensive portfolio management for global buyer accounts, export purchase orders, style specs, and delivery schedules.',
    operationalRoute: '/brands',
    icon: Briefcase,
    stats: [
      { label: 'Active Buyers', value: '18 Global', hint: 'Contract accounts' },
      { label: 'Open PO Orders', value: '42 Orders', hint: 'In manufacturing flow' },
      { label: 'Export Value', value: '₹1.84 Cr', hint: 'Current cycle' },
      { label: 'On-Time Delivery', value: '99.2%', hint: 'SLA target met' },
    ],
    keyCapabilities: [
      'Direct buyer style matrix & tech-pack tracking',
      'Purchase order ledger & milestone billing',
      'Buyer compliance & quality certificate hub',
      'Shipment dispatch pipeline & delivery challans'
    ],
    supervisorTitle: 'Merchandising & Brand Lead',
    shiftInfo: 'General Shift (09:00 AM - 06:30 PM)',
    capacity: '18 Active Buyer Portfolios'
  }
}

export default async function ModuleHubDetailPage({
  params
}: {
  params: Promise<{ moduleSlug: string }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams.moduleSlug
  const moduleInfo = MODULE_DATA[slug]

  if (!moduleInfo) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', user.id)
    .single()

  const userRole = (profile?.role || '').toUpperCase()
  const Icon = moduleInfo.icon

  return (
    <AdminShell userEmail={user.email} userRole={userRole}>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        
        {/* 1. Breadcrumbs */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            <Link href="/modules" className="hover:text-[#3A3564] transition-colors">
              Workspace Hub
            </Link>
            <span>/</span>
            <span className="text-slate-900">{moduleInfo.title}</span>
          </div>

          <Link
            href="/modules"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>All Modules</span>
          </Link>
        </div>

        {/* 2. Hero Header Card */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-black/10 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Icon className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {moduleInfo.title}
                </h1>
                <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                  {moduleInfo.categoryBadge}
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
                {moduleInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Primary Action Button to Enter Operational Floor */}
          <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto">
            <Link
              href={moduleInfo.operationalRoute}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              <span>Enter Operational Division</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3. 4-Column Live Telemetry Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {moduleInfo.stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between"
            >
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                {stat.label}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono my-1">
                {stat.value}
              </div>
              <div className="text-[11px] font-medium text-emerald-700 font-mono">
                {stat.hint}
              </div>
            </div>
          ))}
        </div>

        {/* 4. Division Capabilities & Supervisor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          
          {/* Key Capabilities Card (2 cols) */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#3A3564]" />
                Division Capabilities & Workflows
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {moduleInfo.keyCapabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F0]/60 border border-black/5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                    {cap}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shift & Supervisor Card (1 col) */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-black/10 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#3A3564]" />
                  Shift Management
                </h2>
                <span className="text-xs font-mono font-bold text-slate-400">UNIT 1</span>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm pt-3">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Supervisor Lead</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{moduleInfo.supervisorTitle}</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Shift Window</div>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">{moduleInfo.shiftInfo}</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Installed Capacity</div>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">{moduleInfo.capacity}</div>
                </div>
              </div>
            </div>

            <Link
              href={moduleInfo.operationalRoute}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/10 font-bold text-xs transition-all shadow-2xs cursor-pointer mt-4"
            >
              <span>Launch Live Floor Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </AdminShell>
  )
}
