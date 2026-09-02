import { AdminShell } from '@/components/layout/AdminShell'

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-3 px-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-14 bg-slate-200 rounded" /></td>
      <td className="py-3 px-4"><div className="h-6 w-24 bg-slate-100 rounded-full" /></td>
    </tr>
  )
}

export default function ProductionOrdersLoading() {
  return (
    <AdminShell>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5 animate-pulse">
        {/* Breadcrumb */}
        <div className="flex gap-2">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-4 w-52 bg-slate-100 rounded" />
        </div>

        {/* Header + actions */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-72 bg-slate-200 rounded-xl" />
          <div className="h-11 w-44 bg-slate-100 rounded-xl border border-slate-200" />
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          <div className="bg-[#FAF7F0] px-4 py-3 border-b border-slate-100">
            <div className="flex gap-4">
              {['w-20','w-32','w-24','w-16','w-24'].map((w, i) => (
                <div key={i} className={`h-3 ${w} bg-slate-200 rounded`} />
              ))}
            </div>
          </div>
          <table className="w-full">
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
