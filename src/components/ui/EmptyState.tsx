import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`bg-white rounded-2xl border border-black/10 p-8 sm:p-12 text-center shadow-2xs flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-6 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
          {description}
        </p>
      </div>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-black/10 text-sm font-medium hover:bg-slate-50 transition-all cursor-pointer"
            >
              {secondaryActionLabel}
            </button>
          )}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-sm font-semibold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
