'use client'

import React from 'react'

export function SkeletonHeader({
  hasAction = true,
  actionCount = 1,
}: {
  hasAction?: boolean
  actionCount?: number
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 pb-5 animate-pulse">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-28 bg-slate-200 rounded" />
          <div className="h-3 w-3 bg-slate-200 rounded-full" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
        </div>
        <div className="h-8 w-64 sm:w-80 bg-slate-200 rounded-lg" />
        <div className="h-4 w-72 sm:w-96 bg-slate-100 rounded" />
      </div>

      {hasAction && (
        <div className="flex items-center gap-2.5 shrink-0">
          {Array.from({ length: actionCount }).map((_, i) => (
            <div key={i} className="h-9 w-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      )}
    </div>
  )
}

export function SkeletonMetricCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-xl bg-white border border-black/10 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-black/10 shrink-0" />
          </div>
          <div className="h-7 w-28 bg-slate-200 rounded-lg" />
          <div className="pt-2 border-t border-slate-100">
            <div className="h-3 w-36 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({
  rows = 5,
  columns = 6,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden animate-pulse">
      {/* Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="h-8 w-20 bg-slate-200 rounded-lg" />
          <div className="h-8 w-24 bg-slate-100 rounded-lg" />
          <div className="h-8 w-24 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-9 w-full sm:w-72 bg-slate-100 rounded-xl" />
      </div>

      {/* Table Header & Rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-[#FAF7F0]">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-3.5 px-4">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx}>
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="py-4 px-4">
                    <div
                      className="h-4 bg-slate-200 rounded"
                      style={{
                        width: `${Math.max(40, 95 - (cIdx * 12 + (rIdx % 3) * 15))}%`,
                      }}
                    />
                    {cIdx === 0 && (
                      <div className="h-3 w-32 bg-slate-100 rounded mt-1.5" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-black/10 shadow-xs p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] border border-black/10 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-5 w-44 bg-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-full bg-slate-100 rounded" />
            <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 bg-slate-100 rounded-md" />
            <div className="h-6 w-24 bg-slate-100 rounded-md" />
          </div>
          <div className="pt-3 border-t border-black/5 flex items-center justify-between">
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTelemetry() {
  return (
    <div className="space-y-6 animate-pulse">
      <SkeletonHeader actionCount={2} />
      <SkeletonMetricCards count={4} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-4">
          <div className="h-5 w-40 bg-slate-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-4">
          <div className="h-5 w-40 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#FAF7F0] border border-black/5 space-y-1.5">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-6 w-12 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonProvisioning() {
  return (
    <div className="space-y-6 animate-pulse">
      <SkeletonHeader hasAction={false} />

      {/* Plan selection skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-3"
            >
              <div className="h-5 w-28 bg-slate-200 rounded-lg" />
              <div className="h-7 w-20 bg-slate-200 rounded-lg" />
              <div className="h-3.5 w-40 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Form fields skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-5">
        <div className="h-5 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-28 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Division selection skeleton */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="h-4 w-44 bg-slate-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <div className="h-10 w-44 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6 animate-pulse">
      <SkeletonHeader hasAction={false} />

      <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF7F0] border border-black/10" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded-lg" />
            <div className="h-3.5 w-36 bg-slate-100 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#FAF7F0] border border-black/5 space-y-1.5">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-5 w-40 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PlatformAdminPageSkeleton({
  variant = 'dashboard',
}: {
  variant?: 'dashboard' | 'table' | 'provisioning' | 'cards' | 'telemetry' | 'profile' | 'modules'
}) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {variant === 'dashboard' && (
        <>
          <SkeletonHeader actionCount={2} />
          <SkeletonMetricCards count={4} />
          <SkeletonTable rows={5} columns={6} />
        </>
      )}

      {variant === 'table' && (
        <>
          <SkeletonHeader actionCount={1} />
          <SkeletonMetricCards count={4} />
          <SkeletonTable rows={6} columns={6} />
        </>
      )}

      {variant === 'cards' && (
        <>
          <SkeletonHeader actionCount={1} />
          <SkeletonMetricCards count={4} />
          <SkeletonCardGrid count={6} />
        </>
      )}

      {variant === 'modules' && (
        <>
          <SkeletonHeader actionCount={2} />
          <SkeletonMetricCards count={4} />
          <SkeletonCardGrid count={6} />
        </>
      )}

      {variant === 'telemetry' && <SkeletonTelemetry />}

      {variant === 'provisioning' && <SkeletonProvisioning />}

      {variant === 'profile' && <SkeletonProfile />}
    </div>
  )
}
