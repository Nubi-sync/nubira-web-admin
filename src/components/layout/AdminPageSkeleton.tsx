import { AdminShell } from './AdminShell'

interface AdminPageSkeletonProps {
  title?: string
  subtitle?: string
  cardsCount?: number
  hasTable?: boolean
}

export function AdminPageSkeleton({
  title,
  subtitle,
  cardsCount = 4,
  hasTable = true,
}: AdminPageSkeletonProps) {
  return (
    <AdminShell>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 animate-pulse">
        {/* 1. Breadcrumb placeholder */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-slate-200 rounded-md" />
          <span className="text-slate-300 text-xs">/</span>
          <div className="h-3 w-20 bg-slate-200 rounded-md" />
          <span className="text-slate-300 text-xs">/</span>
          <div className="h-3 w-28 bg-slate-300 rounded-md" />
        </div>

        {/* 2. Page Header Bar placeholder */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {title ? (
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-400">
                  {title}
                </h1>
              ) : (
                <div className="h-7 w-56 bg-slate-200 rounded-xl" />
              )}
              <div className="h-5 w-16 bg-[#FAF7F0] border border-black/10 rounded-full" />
            </div>
            {subtitle ? (
              <p className="text-xs text-slate-400">{subtitle}</p>
            ) : (
              <div className="h-3.5 w-72 bg-slate-200/80 rounded-md" />
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-9 w-24 bg-slate-100 rounded-xl border border-slate-200" />
            <div className="h-9 w-28 bg-[#3A3564]/20 rounded-xl" />
          </div>
        </div>

        {/* 3. Top KPI Metric Cards Grid placeholder */}
        {cardsCount > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: cardsCount }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-20 bg-slate-200 rounded-md" />
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200" />
                </div>
                <div className="h-7 w-28 bg-slate-200 rounded-lg" />
                <div className="h-2.5 w-36 bg-slate-100 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* 4. Main Table / Content Matrix placeholder */}
        {hasTable && (
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
            {/* Table toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="h-9 w-full sm:w-64 bg-slate-100 rounded-xl border border-slate-200" />
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="h-9 w-20 bg-slate-100 rounded-xl border border-slate-200" />
                <div className="h-9 w-24 bg-slate-100 rounded-xl border border-slate-200" />
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 shrink-0" />
                    <div className="space-y-1.5 flex-1 max-w-sm">
                      <div className="h-3.5 w-3/4 bg-slate-200 rounded-md" />
                      <div className="h-2.5 w-1/2 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                  <div className="hidden sm:block h-3.5 w-20 bg-slate-100 rounded-md" />
                  <div className="hidden md:block h-3.5 w-24 bg-slate-100 rounded-md" />
                  <div className="h-6 w-16 bg-slate-100 rounded-full border border-slate-200" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
