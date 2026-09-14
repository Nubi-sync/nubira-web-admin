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
        <SkeletonBlock className="h-4 w-28 rounded-md" />
        <SkeletonBlock className="h-8 w-8 rounded-lg" />
      </div>
      <SkeletonBlock className="h-8 w-32 rounded-lg" />
      <div className="pt-3 border-t border-slate-100">
        <SkeletonBlock className="h-3.5 w-40 rounded-md" />
      </div>
    </div>
  )
}

export function SkeletonHeader({ hasButton = true }: { hasButton?: boolean }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <SkeletonBlock className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl shrink-0" />
        <div className="space-y-2 w-full sm:w-80">
          <SkeletonBlock className="h-6 sm:h-7 w-3/4 rounded-lg" />
          <SkeletonBlock className="h-4 w-full rounded-md" />
        </div>
      </div>
      {hasButton && <SkeletonBlock className="h-10 w-44 rounded-xl shrink-0" />}
    </div>
  )
}

export function SkeletonFilterBar() {
  return (
    <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
      <SkeletonBlock className="h-9 w-full md:w-80 rounded-xl shrink-0" />
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
        {[1, 2, 3, 4, 5].map(i => (
          <SkeletonBlock key={i} className="h-8 w-24 rounded-lg shrink-0" />
        ))}
      </div>
    </div>
  )
}

export function SkeletonStationGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-5 w-60 rounded-md" />
        <SkeletonBlock className="h-4 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 w-1/2">
                <SkeletonBlock className="h-5 w-28 rounded-md" />
                <SkeletonBlock className="h-3.5 w-36 rounded-md" />
              </div>
              <SkeletonBlock className="h-6 w-20 rounded-md" />
            </div>
            <div className="p-3 bg-white rounded-xl border border-black/5 space-y-1.5">
              <SkeletonBlock className="h-3.5 w-3/4 rounded-md" />
              <SkeletonBlock className="h-3.5 w-2/3 rounded-md" />
              <SkeletonBlock className="h-3.5 w-1/2 rounded-md" />
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center justify-between">
              <SkeletonBlock className="h-3.5 w-24 rounded-md" />
              <SkeletonBlock className="h-3.5 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 6, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-black/10 flex items-center justify-between">
        <div className="space-y-1.5">
          <SkeletonBlock className="h-5 w-48 rounded-md" />
          <SkeletonBlock className="h-3.5 w-64 rounded-md" />
        </div>
        <SkeletonBlock className="h-8 w-28 rounded-xl" />
      </div>
      <div className="p-4 overflow-x-auto">
        <div className="min-w-[760px] space-y-3">
          <div className="grid grid-cols-7 gap-4 pb-3 border-b border-black/10">
            {Array.from({ length: cols }).map((_, i) => (
              <SkeletonBlock key={i} className="h-4 w-20 rounded" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="grid grid-cols-7 gap-4 py-2 border-b border-slate-50 items-center">
              {Array.from({ length: cols }).map((_, c) => (
                <SkeletonBlock key={c} className="h-4 w-full rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-24 rounded-md" />
            <SkeletonBlock className="h-6 w-16 rounded-md" />
          </div>
          <SkeletonBlock className="h-5 w-44 rounded-md" />
          <div className="space-y-1.5 py-1">
            <SkeletonBlock className="h-3.5 w-full rounded" />
            <SkeletonBlock className="h-3.5 w-3/4 rounded" />
          </div>
          <div className="pt-3 border-t border-black/5 flex items-center justify-between">
            <SkeletonBlock className="h-3.5 w-20 rounded" />
            <SkeletonBlock className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AlterPageSkeleton({
  variant = 'dashboard',
}: {
  variant?: 'dashboard' | 'defect-intake' | 'repair-stations' | 'spot-cleaning' | 'secondary-qc' | 'scrap-salvage'
}) {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* Breadcrumb row */}
      <div className="flex items-center justify-between gap-4">
        <SkeletonBlock className="h-7 w-32 rounded-xl" />
        <SkeletonBlock className="h-6 w-44 rounded-full" />
      </div>

      {/* Header banner */}
      <SkeletonHeader />

      {/* 4 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonKpiCard />
        <SkeletonKpiCard />
        <SkeletonKpiCard />
        <SkeletonKpiCard />
      </div>

      {/* Conditional layout based on variant */}
      {variant === 'dashboard' && (
        <div className="space-y-6">
          <SkeletonStationGrid count={4} />
          <SkeletonTable rows={5} cols={7} />
        </div>
      )}

      {variant === 'defect-intake' && (
        <div className="space-y-6">
          <SkeletonFilterBar />
          <SkeletonTable rows={8} cols={7} />
        </div>
      )}

      {variant === 'repair-stations' && (
        <div className="space-y-6">
          <SkeletonFilterBar />
          <SkeletonStationGrid count={6} />
        </div>
      )}

      {variant === 'spot-cleaning' && (
        <div className="space-y-6">
          <SkeletonFilterBar />
          <SkeletonTable rows={7} cols={6} />
        </div>
      )}

      {variant === 'secondary-qc' && (
        <div className="space-y-6">
          <SkeletonFilterBar />
          <SkeletonTable rows={7} cols={7} />
        </div>
      )}

      {variant === 'scrap-salvage' && (
        <div className="space-y-6">
          <SkeletonFilterBar />
          <SkeletonTable rows={6} cols={6} />
        </div>
      )}
    </div>
  )
}
