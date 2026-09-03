import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Home, FileText, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms and Conditions | Zigza',
  description: 'Terms of Service and commercial SaaS agreement for apparel manufacturing units subscribing to Zigza.',
  alternates: {
    canonical: 'https://zigza.in/terms',
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

export default function TermsPage() {
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
            <FileText className="w-3.5 h-3.5" />
            <span>COMMERCIAL SAAS AGREEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            Terms & Conditions
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Last Modified: <strong>{lastUpdated}</strong> · Governed under the Information Technology Act, 2000 & Laws of India.
          </p>
        </div>

        {/* Content Card with Slim Black Outline */}
        <div className="bg-white border border-black rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">1</span>
              <span>Scope of Service & Factory Licensing</span>
            </h2>
            <p>
              These Terms and Conditions govern the subscription and use of the <strong>Zigza Manufacturing Execution System (Zigza MES)</strong>, providing synchronized production intelligence for apparel manufacturing units, including fabric store inventory, cutting lot management, bundle allotting, lineman piece-rate wage calculation, quality audits, and carton dispatch.
            </p>
            <p>
              Subscribing factories are granted a non-exclusive, non-transferable, commercial right to deploy Zigza web consoles and Android floor apps across their designated operating manufacturing facilities.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">2</span>
              <span>Floor Uptime & Service Level Agreement (SLA)</span>
            </h2>
            <p>
              We understand that garment factories operate on strict buyer shipment departure dates and penalties:
            </p>
            <div className="p-4 bg-[#FAF7F0] border border-black/10 rounded-2xl text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-[#3A3564]" />
                <span>99.9% Target Cloud Availability</span>
              </div>
              <p className="text-slate-600">
                The core database and API services maintain an operational uptime target of 99.9%. Scheduled maintenance is conducted exclusively during non-shift night windows with 48-hour prior notice.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">3</span>
              <span>Offline Companion App Operations</span>
            </h2>
            <p>
              Zigza floor tablets and mobile apps operate with local offline data caching. In the event of factory Wi-Fi or broadband downtime, floor supervisors can continue logging bundle scans, QC rejections, and lineman piecework.
            </p>
            <p>
              Upon connection restoration, the app automatically reconciles and commits changes. In the rare event of contradictory allotment scans across two disconnected devices, the server's cryptographic timestamp ledger governs final allocation.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">4</span>
              <span>Subscriber Responsibilities & Floor Hardware</span>
            </h2>
            <p>
              Subscribers are responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Supplying standard Android smartphones/tablets (Android 10+ recommended) and barcode/QR scanners.</li>
              <li>Maintaining administrative confidentiality of plant head, cutting master, and accounts login credentials.</li>
              <li>Ensuring accurate input of article rates, lineman piece-work multipliers, and buyer purchase orders.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">5</span>
              <span>Commercial Terms, Invoicing & GST</span>
            </h2>
            <p>
              SaaS subscription fees are billed monthly or annually as per your signed deployment order. All fees are exclusive of applicable Goods and Services Tax (GST 18%), which will be charged and invoiced with standard B2B tax credits.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] flex items-center justify-center">6</span>
              <span>Governing Law & Dispute Resolution</span>
            </h2>
            <p>
              This agreement is governed and construed in accordance with the laws of the Republic of India. Any disputes arising from the use of Zigza MES shall be subject to the exclusive jurisdiction of the competent courts of Kolkata, India.
            </p>
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
            <Link href="/terms" className="text-slate-900 font-bold">Terms of Service</Link>
            <Link href="/security" className="hover:text-slate-900 transition-colors">Security Standards</Link>
          </div>
          <p>© {new Date().getFullYear()} Zigza. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
