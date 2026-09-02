import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Home, ShieldCheck, Lock, Key, Server, RefreshCw, Cpu, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security Standards & Factory Data Protection | Zigza MES',
  description: 'Learn how Zigza MES safeguards proprietary buyer CAD specs, cutting table matrices, lineman wage records, and fabric inventories.',
  alternates: {
    canonical: 'https://zigza.in/security',
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

export default function SecurityStandardsPage() {
  const lastAudited = "September 2026"

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-[#3A3564] selection:text-white flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 px-6 py-4 sm:px-10 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <img 
            src="/z i g z a (1) copy.png" 
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ENTERPRISE INFRASTRUCTURE & TRUST</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            Security Standards
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Audit Baseline: <strong>{lastAudited}</strong> · Multi-Tier Cryptographic Architecture for Apparel Floor Intelligence.
          </p>
        </div>

        {/* Content Card with Slim Black Outline */}
        <div className="bg-white border border-black rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">1</span>
              <span>End-to-End Encryption Architecture</span>
            </h2>
            <p>
              In garment manufacturing, confidentiality of pre-season buyer designs and cutting ratios is paramount. Zigza enforces robust cryptographic safeguards across every layer of the system:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-[#FAF7F0] border border-black/10 rounded-2xl">
                <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#3A3564]" />
                  <span>Data at Rest: AES-256</span>
                </div>
                <p className="text-xs text-slate-600">All database tables, buyer tech packs, and Lineman rate tables are encrypted using industry-standard AES-256 with automated key rotation.</p>
              </div>
              <div className="p-4 bg-[#FAF7F0] border border-black/10 rounded-2xl">
                <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#3A3564]" />
                  <span>Data in Transit: TLS 1.3</span>
                </div>
                <p className="text-xs text-slate-600">All transmissions between factory PCs, Android floor tablets, barcode scanners, and cloud servers are encrypted via TLS 1.3 with Perfect Forward Secrecy.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">2</span>
              <span>Granular Role-Based Access Control (RBAC)</span>
            </h2>
            <p>
              Floor staff and line supervisors only see what is necessary to perform their immediate tasks:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
              <li><strong>Cutting Masters:</strong> Can view fabric roll consumption and lot allotment tables; zero access to financial gross margins.</li>
              <li><strong>Linemen & Tailors:</strong> Can scan bundles and view their personal piece-work credits; strictly isolated from buyer pricing or other workers' ledger entries.</li>
              <li><strong>QC Stations:</strong> Restricted to logging Pass/Defect/Rework stamps with immutable audit tags.</li>
              <li><strong>Plant Heads & MDs:</strong> Unrestricted visibility into executive metrics, factory throughput, and complete audit histories.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">3</span>
              <span>15-Minute Point-in-Time Automated Backups</span>
            </h2>
            <p>
              Zigza performs continuous point-in-time recovery (PITR) backups every 15 minutes, with geographic replication across distinct Indian availability zones. In the event of catastrophic local power or hardware loss, your factory's production ledger can be restored with zero data loss.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">4</span>
              <span>Zero Ghost Piece Guarantee & Ledger Immutability</span>
            </h2>
            <p>
              Every bundle scanned at the cutting table is assigned a cryptographically unique sequence. Zigza prevents double-scanning or fraudulent piece crediting: a bundle cannot be paid out twice, and rejected pieces cannot bypass the QC gate to carton dispatch.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">5</span>
              <span>Vulnerability Management & Responsible Disclosure</span>
            </h2>
            <p>
              We run automated dependency vulnerability scanning and periodic penetration tests. If you discover a security vulnerability in the Zigza platform, report it to our security response team at:
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono space-y-1">
              <div><strong>Security Team:</strong> security@zigza.in / shawsumit6286@gmail.com</div>
              <div><strong>Response SLA:</strong> Within 12 business hours</div>
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
          <div className="flex items-center gap-2">
            <IndiaFlag className="w-5 h-3.5 rounded-xs" />
            <span className="text-proudly-india-black">
              Proudly Made in India
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link href="/security" className="text-slate-900 font-bold">Security Standards</Link>
          </div>
          <p>© {new Date().getFullYear()} Zigza. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
