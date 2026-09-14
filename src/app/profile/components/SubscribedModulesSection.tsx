'use client'

import Link from 'next/link'
import {
  Boxes,
  Palette,
  Briefcase,
  Scissors,
  Printer,
  Sparkles,
  Layers,
  Waves,
  Flame,
  Wrench,
  Store,
  Truck,
  ExternalLink,
  User,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react'

export interface SubscribedModuleItem {
  id: string
  code: string
  name: string
  route: string
  defaultDesignation: string
  iconName: string
  description: string
  appointedHead?: {
    name: string
    designation: string
    email?: string
  } | null
  staffCount: number
}

interface SubscribedModulesSectionProps {
  modules: SubscribedModuleItem[]
  companyName: string
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Briefcase,
  Scissors,
  Printer,
  Sparkles,
  Layers,
  Waves,
  Flame,
  Boxes,
  Wrench,
  Store,
  Truck,
}

export function SubscribedModulesSection({ modules, companyName }: SubscribedModulesSectionProps) {
  if (!modules || modules.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <Boxes className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                Active Factory Modules
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs">
                {modules.length} {modules.length === 1 ? 'Division' : 'Divisions'} Subscribed
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Active manufacturing divisions provisioned for {companyName}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs self-start sm:self-center">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5 align-middle" />
          Enterprise Licensed
        </span>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {modules.map((mod) => {
          const Icon = ICON_MAP[mod.iconName] || Boxes
          const hasHead = Boolean(mod.appointedHead?.name)

          return (
            <div
              key={mod.id}
              className="rounded-2xl border border-black/10 bg-slate-50/50 hover:bg-white hover:border-[#3A3564]/30 transition-all p-5 shadow-2xs hover:shadow-md flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-3.5">
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#FAF7F0] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                    Division {mod.code}
                  </span>
                </div>

                {/* Module Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#3A3564] transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Department Head & Staff Count */}
                <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Department Head:</span>
                    {hasHead ? (
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[140px]">{mod.appointedHead?.name}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px] italic">Not Appointed</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Active Staff:</span>
                    <span className="font-mono font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/80 shadow-2xs text-xs">
                      {mod.staffCount} {mod.staffCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2">
                <Link
                  href={mod.route}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <span>Open Floor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`${mod.route}/profile`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 transition-all shadow-2xs cursor-pointer active:scale-[0.98] whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
