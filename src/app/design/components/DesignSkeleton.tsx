'use client'

import React from 'react'

export function SkeletonHeader({
  hasAction = true,
  actionCount = 2,
}: {
  hasAction?: boolean
  actionCount?: number
}) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] border border-black/10 shrink-0" />
        <div className="space-y-2">
          <div className="h-7 w-60 sm:w-72 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 sm:w-96 bg-slate-100 rounded" />
        </div>
      </div>

      {hasAction && (
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {Array.from({ length: actionCount }).map((_, i) => (
            <div key={i} className="h-10 w-32 bg-slate-200 rounded-xl" />
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
          className="p-5 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-28 bg-slate-200 rounded" />
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-black/10 shrink-0" />
          </div>
          <div className="h-8 w-28 bg-slate-200 rounded-lg" />
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
  columns = 7,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden animate-pulse">
      {/* Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="h-8 w-24 bg-slate-200 rounded-lg" />
          <div className="h-8 w-24 bg-slate-100 rounded-lg" />
          <div className="h-8 w-24 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-9 w-full sm:w-64 bg-slate-100 rounded-xl" />
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
                        width: `${Math.max(40, 95 - (cIdx * 10 + (rIdx % 3) * 12))}%`,
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

export function SkeletonGallery({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-black/10 shadow-xs p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-5 w-20 bg-slate-100 rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 rounded-lg" />
            <div className="h-3.5 w-full bg-slate-100 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            <div className="h-8 bg-slate-100 rounded-lg" />
            <div className="h-8 bg-slate-100 rounded-lg" />
            <div className="h-8 bg-slate-100 rounded-lg" />
          </div>
          <div className="pt-2 flex items-center justify-between">
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonPipelineCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-32 bg-slate-200 rounded" />
            <div className="h-5 w-20 bg-slate-100 rounded-md" />
          </div>
          <div className="h-5 w-44 bg-slate-200 rounded-lg" />
          <div className="h-3.5 w-full bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  )
}

export function DesignPageSkeleton({
  variant = 'dashboard',
}: {
  variant?: 'dashboard' | 'tech-packs' | 'approvals' | 'grading' | 'materials'
}) {
  return (
    <div className="space-y-6">
      <SkeletonHeader actionCount={2} />

      {variant === 'dashboard' && (
        <>
          <SkeletonMetricCards count={4} />
          <SkeletonTable rows={5} columns={7} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-black/10" />
                <div className="h-4 w-36 bg-slate-200 rounded" />
                <div className="h-3 w-48 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </>
      )}

      {variant === 'tech-packs' && (
        <>
          <div className="flex items-center justify-between animate-pulse">
            <div className="h-8 w-44 bg-slate-200 rounded-lg" />
            <div className="h-8 w-28 bg-slate-200 rounded-lg" />
          </div>
          <SkeletonGallery count={6} />
        </>
      )}

      {variant === 'approvals' && (
        <>
          <SkeletonPipelineCards />
          <SkeletonTable rows={6} columns={7} />
        </>
      )}

      {variant === 'grading' && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-36 bg-slate-200 rounded-xl" />
            ))}
          </div>
          <SkeletonTable rows={6} columns={8} />
        </>
      )}

      {variant === 'materials' && (
        <>
          <SkeletonMetricCards count={4} />
          <SkeletonGallery count={6} />
        </>
      )}
    </div>
  )
}
