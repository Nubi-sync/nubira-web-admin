import React from 'react'

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-black/5 animate-pulse rounded-xl ${className}`} />
  )
}

export function SkeletonKpiCard() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-24 rounded-md" />
        <SkeletonBlock className="h-8 w-8 rounded-lg" />
      </div>
      <SkeletonBlock className="h-8 w-28 rounded-lg" />
      <div className="pt-3 border-t border-slate-100">
        <SkeletonBlock className="h-3.5 w-36 rounded-md" />
      </div>
    </div>
  )
}

export function SkeletonHeader({ hasButton = true }: { hasButton?: boolean }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <SkeletonBlock className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0" />
        <div className="space-y-2 w-full sm:w-72">
          <SkeletonBlock className="h-6 sm:h-7 w-3/4 rounded-lg" />
          <SkeletonBlock className="h-4 w-full rounded-md" />
        </div>
      </div>
      {hasButton && <SkeletonBlock className="h-10 w-36 rounded-xl shrink-0" />}
    </div>
  )
}

export function SkeletonFilterBar() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
        {[1, 2, 3, 4].map(i => (
          <SkeletonBlock key={i} className="h-9 w-24 rounded-xl shrink-0" />
        ))}
      </div>
      <SkeletonBlock className="h-9 w-full sm:w-72 rounded-xl shrink-0" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-black/10 bg-[#FAF7F0]/60 flex items-center justify-between">
        <SkeletonBlock className="h-4 w-48 rounded-md" />
        <SkeletonBlock className="h-4 w-24 rounded-md" />
      </div>
      <div className="divide-y divide-black/5 p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4 py-2.5">
            <SkeletonBlock className="h-4 w-1/4 rounded-md" />
            <SkeletonBlock className="h-4 w-1/6 rounded-md" />
            <SkeletonBlock className="h-4 w-1/6 rounded-md" />
            <SkeletonBlock className="h-4 w-1/6 rounded-md" />
            <SkeletonBlock className="h-6 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-5 w-24 rounded-md" />
            <SkeletonBlock className="h-5 w-16 rounded-md" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-3/4 rounded-md" />
            <SkeletonBlock className="h-4 w-1/2 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <SkeletonBlock className="h-14 rounded-xl" />
            <SkeletonBlock className="h-14 rounded-xl" />
          </div>
          <div className="pt-3 border-t border-black/5 flex items-center justify-between">
            <SkeletonBlock className="h-4 w-24 rounded-md" />
            <SkeletonBlock className="h-4 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MerchandisingPageSkeleton({
  variant = 'dashboard'
}: {
  variant?: 'dashboard' | 'orders' | 'costing' | 'tna' | 'sourcing' | 'shipments'
}) {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <SkeletonHeader />

      {variant === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
          </div>
          <SkeletonFilterBar />
          <SkeletonTable rows={5} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonBlock className="h-28 rounded-2xl" />
            <SkeletonBlock className="h-28 rounded-2xl" />
            <SkeletonBlock className="h-28 rounded-2xl" />
          </div>
        </>
      )}

      {variant === 'orders' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
          </div>
          <SkeletonFilterBar />
          <SkeletonTable rows={6} />
        </>
      )}

      {variant === 'costing' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
          </div>
          <SkeletonFilterBar />
          <SkeletonTable rows={6} />
        </>
      )}

      {variant === 'tna' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
          </div>
          <SkeletonFilterBar />
          <SkeletonCardGrid count={6} />
        </>
      )}

      {variant === 'sourcing' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
          </div>
          <SkeletonFilterBar />
          <SkeletonTable rows={5} />
        </>
      )}

      {variant === 'shipments' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
          </div>
          <SkeletonFilterBar />
          <SkeletonCardGrid count={4} />
        </>
      )}
    </div>
  )
}
