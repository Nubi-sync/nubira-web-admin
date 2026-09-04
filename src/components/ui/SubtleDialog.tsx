'use client'

import React, { useEffect } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

export interface SubtleDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  variant?: 'error' | 'warning' | 'info' | 'success' | 'confirm'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  isLoading?: boolean
}

export function SubtleDialog({
  isOpen,
  onClose,
  title,
  description,
  variant = 'error',
  confirmText = 'Understood',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false
}: SubtleDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isConfirm = variant === 'confirm' || Boolean(onConfirm && cancelText)

  const variantConfigs = {
    error: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/80',
      Icon: AlertCircle,
      primaryBtn: 'bg-[#3A3564] hover:bg-[#2A2649] text-white',
      accentBorder: 'border-black/10'
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/80',
      Icon: AlertTriangle,
      primaryBtn: 'bg-[#3A3564] hover:bg-[#2A2649] text-white',
      accentBorder: 'border-black/10'
    },
    success: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80',
      Icon: CheckCircle2,
      primaryBtn: 'bg-[#3A3564] hover:bg-[#2A2649] text-white',
      accentBorder: 'border-black/10'
    },
    info: {
      iconBg: 'bg-slate-50 text-[#3A3564] border border-black/10',
      Icon: Info,
      primaryBtn: 'bg-[#3A3564] hover:bg-[#2A2649] text-white',
      accentBorder: 'border-black/10'
    },
    confirm: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/80',
      Icon: AlertCircle,
      primaryBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
      accentBorder: 'border-black/10'
    }
  }

  const config = variantConfigs[variant] || variantConfigs.error
  const IconComponent = config.Icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subtle-dialog-title"
        className={`w-full max-w-md bg-white rounded-2xl shadow-2xl border ${config.accentBorder} overflow-hidden animate-in zoom-in-95 duration-150 relative`}
      >
        {/* Top Close Icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Body */}
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${config.iconBg}`}>
              <IconComponent className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h3 id="subtle-dialog-title" className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                {title}
              </h3>
              {description && (
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap font-normal">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-black/5">
            {isConfirm && (
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (onConfirm) {
                  onConfirm()
                } else {
                  onClose()
                }
              }}
              className={`px-4.5 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 ${config.primaryBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
