import { AdminShell } from '@/components/layout/AdminShell'

export default function GenericDashboardLoading() {
  return (
    <AdminShell>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5 animate-pulse">
        <div className="flex gap-2">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-4 w-36 bg-slate-100 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-8 w-56 bg-slate-200 rounded-xl" />
          <div className="h-11 w-40 bg-slate-100 rounded-xl border border-slate-200" />
        </div>
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-6 space-y-4">
          <div className="h-12 bg-slate-50 rounded-xl border border-slate-100" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl border border-slate-100" />
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
