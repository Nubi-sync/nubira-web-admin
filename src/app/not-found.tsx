import Link from 'next/link'
import { ArrowLeft, Home, FileQuestion } from 'lucide-react'

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

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col justify-between selection:bg-[#3A3564] selection:text-white">
      {/* Minimal Top Header */}
      <header className="px-6 py-5 sm:px-10 flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <img 
            src="/z i g z a (2).png" 
            alt="zigza." 
            className="h-7 w-auto object-contain rounded-md transition-opacity group-hover:opacity-85"
          />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main 404 Canvas */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-md sm:max-w-lg w-full bg-white border border-black rounded-3xl p-8 sm:p-12 shadow-sm text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FAF7F0] border border-black/15 text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A3564] mb-6">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>ERROR 404 · NOT FOUND</span>
          </div>

          {/* Minimal 404 Numeral */}
          <div className="text-7xl sm:text-8xl font-black tracking-tight text-[#3A3564] font-mono mb-3 leading-none">
            404
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            This Floor Checkpoint Doesn't Exist
          </h1>

          {/* Minimal Description */}
          <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-8">
            The page, lot record, or link you followed may have been archived, moved, or misrouted.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FAF7F0] hover:bg-slate-100 border border-black/15 text-slate-900 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              <span>Staff Portal Sign In</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 px-6 text-center border-t border-slate-200/80 bg-white/50">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="text-proudly-india-black">
              Proudly Made in
            </span>
            <IndiaFlag className="w-5 h-3.5 rounded-xs shrink-0" />
            <span className="text-proudly-india-black">
              India
            </span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-slate-900 transition-colors">Security</Link>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <p>© {new Date().getFullYear()} Zigza. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
