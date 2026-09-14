import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
  variant?: 'seamless' | 'card'
  compact?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  variant = 'seamless',
  compact = false
}: EmptyStateProps) {
  const containerClasses = variant === 'card'
    ? `bg-white rounded-2xl border border-black/10 p-8 sm:p-12 text-center shadow-2xs flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-6 ${className}`
    : `text-center flex flex-col items-center justify-center ${compact ? 'py-6 px-3 space-y-2' : 'py-10 sm:py-14 px-4 space-y-3'} w-full ${className}`

  const iconBoxClasses = compact
    ? "w-9 h-9 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs shrink-0"
    : "w-11 h-11 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs shrink-0"

  const iconClasses = compact ? "w-4 h-4" : "w-5 h-5"

  return (
    <div className={containerClasses}>
      {Icon && (
        <div className={iconBoxClasses}>
          <Icon className={iconClasses} />
        </div>
      )}
      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className={`${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-bold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]`}>
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-500 leading-normal">
            {description}
          </p>
        )}
      </div>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-700 border border-black/10 text-xs font-medium hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              {secondaryActionLabel}
            </button>
          )}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#3A3564] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
