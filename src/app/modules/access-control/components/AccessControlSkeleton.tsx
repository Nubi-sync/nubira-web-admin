import React from 'react'

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200/70 rounded-xl ${className}`} />
  )
}

export function SkeletonHeader() {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
          <SkeletonBlock className="w-6 h-6 rounded-lg bg-[#3A3564]/20" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-64 sm:w-80" />
          <SkeletonBlock className="h-4 w-48 sm:w-96" />
        </div>
      </div>
      <div className="shrink-0">
        <SkeletonBlock className="h-10 w-44 rounded-xl bg-[#3A3564]/30" />
      </div>
    </div>
  )
}

export function SkeletonKpiCard() {
  return (
    <div className="bg-white p-4 rounded-xl border border-black/10 shadow-2xs flex items-center justify-between">
      <div className="space-y-1.5 flex-1 pr-3">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-7 w-36" />
      </div>
      <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center shrink-0">
        <SkeletonBlock className="w-5 h-5 rounded-md bg-[#3A3564]/20" />
      </div>
    </div>
  )
}

export function SkeletonFilterBar() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-black/10 shadow-2xs">
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
        <SkeletonBlock className="h-8 w-28 rounded-lg bg-white" />
        <SkeletonBlock className="h-8 w-24 rounded-lg bg-slate-200/60" />
        <SkeletonBlock className="h-8 w-24 rounded-lg bg-slate-200/60" />
      </div>
      <SkeletonBlock className="h-9 w-full sm:w-80 rounded-xl" />
    </div>
  )
}

export function SkeletonHeadCard() {
  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center shrink-0">
              <SkeletonBlock className="w-6 h-6 rounded-md bg-[#3A3564]/20" />
            </div>
            <div className="space-y-1.5">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-3 w-24 bg-[#3A3564]/20" />
            </div>
          </div>
          <SkeletonBlock className="h-5 w-16 rounded-full" />
        </div>

        <div className="p-3 bg-[#FAF7F0]/60 border border-black/10 rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
          <div className="flex justify-between items-center">
            <SkeletonBlock className="h-3 w-14" />
            <SkeletonBlock className="h-3 w-28" />
          </div>
        </div>

        <div className="space-y-2">
          <SkeletonBlock className="h-2.5 w-36" />
          <div className="flex flex-wrap gap-1.5">
            <SkeletonBlock className="h-6 w-28 rounded-lg bg-[#FAF7F0]" />
            <SkeletonBlock className="h-6 w-24 rounded-lg bg-[#FAF7F0]" />
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <SkeletonBlock className="h-4 w-24" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-7 w-7 rounded-lg" />
          <SkeletonBlock className="h-7 w-7 rounded-lg" />
          <SkeletonBlock className="h-7 w-7 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonHeadCard key={i} />
      ))}
    </div>
  )
}

export function AccessControlPageSkeleton() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-4" />
          <SkeletonBlock className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-5 w-28 rounded-full" />
          <SkeletonBlock className="h-5 w-28 rounded-full" />
        </div>
      </div>

      {/* Header */}
      <SkeletonHeader />

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <SkeletonKpiCard />
        <SkeletonKpiCard />
        <SkeletonKpiCard />
      </div>

      {/* Filter Bar */}
      <SkeletonFilterBar />

      {/* Grid of Head Cards */}
      <SkeletonCardGrid count={6} />
    </div>
  )
}
