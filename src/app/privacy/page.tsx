import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Home, Shield, Lock, Eye, Database, Server, RefreshCw, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Zigza',
  description: 'Learn how Zigza collects, stores, and protects proprietary factory data, BOM specifications, cutting lots, and floor telemetry.',
  alternates: {
    canonical: 'https://zigza.in/privacy',
  },
}

function IndiaFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 225 150" 
      className={`${className} inline-block rounded-xs shadow-xs shrink-0 align-middle`}
      aria-label="Flag of India"
    >
      <rect width="225" height="50" fill="#FF9933" />
      <rect y="50" width="225" height="50" fill="#FFFFFF" />
      <rect y="100" width="225" height="50" fill="#138808" />
      <circle cx="112.5" cy="75" r="20" fill="none" stroke="#000080" strokeWidth="2.5" />
      <circle cx="112.5" cy="75" r="3.5" fill="#000080" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="112.5"
          y1="75"
          x2="112.5"
          y2="55"
          stroke="#000080"
          strokeWidth="1.2"
          transform={`rotate(${i * 15} 112.5 75)`}
        />
      ))}
    </svg>
  )
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 2, 2026"

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-[#3A3564] selection:text-white flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 px-6 py-4 sm:px-10 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <img 
            src="/z i g z a (2).png" 
            alt="zigza." 
            className="h-7 sm:h-8 w-auto object-contain rounded-md transition-opacity group-hover:opacity-85"
          />
        </Link>
        <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-950 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-1.5 bg-[#3A3564] text-white rounded-lg hover:bg-[#2A2649] transition-colors"
          >
            Staff Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Title Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-black/15 text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564] mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>DATA PROTECTION & PRIVACY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Effective Date: <strong>{lastUpdated}</strong> · Governed by the Digital Personal Data Protection Act (DPDPA), India.
          </p>
        </div>

        {/* Content Card with Slim Black Outline */}
        <div className="bg-white border border-black rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">1</span>
              <span>100% Factory Data Ownership</span>
            </h2>
            <p>
              At Zigza MES, we operate on a fundamental principle: <strong>Your factory data belongs strictly to you.</strong>
            </p>
            <p>
              All Bill of Materials (BOM), garment style sheets, cutting table markers, piece ratios, lineman wage ledgers, and buyer shipment schedules uploaded or created in Zigza remain the exclusive intellectual and commercial property of the subscriber factory. Zigza does not sell, monetize, rent, or cross-reference your production data to any third party, buyer, or competing factory.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">2</span>
              <span>Information We Collect & Process</span>
            </h2>
            <p>
              To provide synchronized floor intelligence across cutting, bundle allotting, and QC, Zigza collects:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Factory Account Information:</strong> Factory / Brand legal entity name, operating plant addresses, GSTIN / IEC registrations, and designated admin contact details.</li>
              <li><strong>Floor Operator & Staff Profiles:</strong> Employee names, operator IDs, assigned lines, and biometric/attendance timestamps required for piece-rate wage calculation.</li>
              <li><strong>Production Telemetry:</strong> Cutting lot identifiers, fabric roll consumption logs, QC defect tags, bundle barcode scans, and dispatch cartons.</li>
              <li><strong>Device & Floor Metadata:</strong> Android companion app hardware IDs, IP addresses, and sync timestamps used strictly for security auditing and offline conflict resolution.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">3</span>
              <span>Buyer Confidentiality & Multi-Brand Isolation</span>
            </h2>
            <p>
              Garment factories frequently manufacture for multiple competing buyer brands (e.g., Ollypop, Lazy Bones, First Smile, or private labels). Zigza provides strict multi-brand cryptographic tenant isolation:
            </p>
            <div className="p-4 bg-[#FAF7F0] border border-black/10 rounded-2xl text-xs sm:text-sm space-y-1.5">
              <p className="font-bold text-slate-900">Tenant Isolation Architecture:</p>
              <p>Cutting masters only see cutting orders assigned to their designated table. Linemen cannot view buyer pricing or gross margins. Fabric inventories earmarked for one client order cannot be cross-allotted without explicit admin authorization.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">4</span>
              <span>Data Storage & Indian Data Residency</span>
            </h2>
            <p>
              All primary databases and backups are hosted in enterprise-grade data centers located strictly within the Republic of India (Mumbai / Hyderabad regions). This guarantees full compliance with the Digital Personal Data Protection Act (DPDPA), 2023, and Indian textile industry regulatory standards.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">5</span>
              <span>Zero Vendor Lock-In: Data Portability</span>
            </h2>
            <p>
              You maintain uninhibited access to your historical production records. Factory administrators can export complete master data, cutting logs, lineman wage slips, and dispatch challans in standard Excel (.xlsx) and CSV formats at any time with a single click.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">6</span>
              <span>Privacy Officer & Grievance Contact</span>
            </h2>
            <p>
              For data access requests, deletion requests, or questions regarding this Privacy Policy, contact our designated Data Protection Officer:
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono space-y-1">
              <div><strong>Officer:</strong> Sumit Shaw (Data Protection Lead)</div>
              <div><strong>Email:</strong> shawsumit6286@gmail.com / privacy@zigza.in</div>
              <div><strong>Platform:</strong> Zigza MES, India</div>
            </div>
          </section>

        </div>

        {/* Return Button */}
        <div className="mt-8 text-center sm:text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Zigza Overview</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-slate-200 bg-white/60 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="text-proudly-india-black">
              Proudly Made in
            </span>
            <IndiaFlag className="w-5 h-3.5 rounded-xs shrink-0" />
            <span className="text-proudly-india-black">
              India
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-slate-900 font-bold">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link href="/security" className="hover:text-slate-900 transition-colors">Security Standards</Link>
          </div>
          <p>© {new Date().getFullYear()} Zigza. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
