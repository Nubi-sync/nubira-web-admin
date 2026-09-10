import { AdminShell } from '@/components/layout/AdminShell'

export default function ModulesLoading() {
  return (
    <AdminShell>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-7 w-64 bg-slate-200 rounded-xl" />
              <div className="h-5 w-20 bg-[#FAF7F0] border border-black/10 rounded-full" />
            </div>
            <div className="h-3.5 w-80 bg-slate-200/80 rounded-md" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-28 bg-slate-100 rounded-xl border border-slate-200" />
          </div>
        </div>

        {/* 6 Module Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-black/10 p-6 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200" />
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-40 bg-slate-200 rounded-lg" />
                <div className="h-3 w-full bg-slate-100 rounded-md" />
                <div className="h-3 w-3/4 bg-slate-100 rounded-md" />
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="h-2.5 w-1/2 bg-slate-100 rounded-md" />
                <div className="h-2.5 w-2/3 bg-slate-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
