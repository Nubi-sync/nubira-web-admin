import { AdminShell } from '../../components/layout/AdminShell'

export default function DashboardLoading() {
  return (
    <AdminShell>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="h-8 w-80 bg-slate-200 rounded-xl" />
            <div className="h-4 w-96 bg-slate-100 rounded-lg mt-2" />
          </div>
          <div className="flex gap-2.5">
            <div className="h-10 w-36 bg-slate-100 rounded-xl border border-slate-200" />
            <div className="h-10 w-28 bg-slate-100 rounded-xl border border-slate-200" />
          </div>
        </div>

        {/* Filter bar skeleton */}
        <div className="h-16 bg-white rounded-2xl border border-black/10 shadow-2xs" />

        {/* KPI cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="w-7 h-7 rounded-lg bg-slate-100" />
              </div>
              <div className="h-3 w-28 bg-slate-100 rounded" />
              <div className="h-8 w-16 bg-slate-200 rounded mt-2" />
              <div className="h-5 w-20 bg-slate-100 rounded-full mt-1" />
            </div>
          ))}
        </div>

        {/* Pipeline stepper skeleton */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-6">
          <div className="h-5 w-72 bg-slate-200 rounded mb-4" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-lg border border-slate-100" />
            ))}
          </div>
        </div>

        {/* Bottom section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-black/10 shadow-2xs p-6 h-64" />
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-6 h-64" />
        </div>
      </div>
    </AdminShell>
  )
}
