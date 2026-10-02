'use client'

import React from 'react'
import { AlertTriangle, Trash2, CheckCircle2, ShieldAlert, X } from 'lucide-react'

export type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary' | 'success'
  isLoading?: boolean
  onConfirm: () => void
  onClose: () => void
  children?: React.ReactNode
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
  children
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
      Icon: Trash2
    },
    warning: {
      iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
      Icon: AlertTriangle
    },
    success: {
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
      Icon: CheckCircle2
    },
    primary: {
      iconBg: 'bg-[#F0FDFA] border border-[#14C8B4]/30 text-[#1D4ED8]',
      btnBg: 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-sm shadow-blue-500/20',
      Icon: ShieldAlert
    }
  }

  const { iconBg, btnBg, Icon } = variantStyles[variant] || variantStyles.danger

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#14C8B4]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Action Confirmation
            </span>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-4 shadow-2xs ${iconBg}`}>
            <Icon className="w-7 h-7" />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
            {title}
          </h3>

          {description && (
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
              {description}
            </p>
          )}

          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 bg-white transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer font-[family-name:var(--font-heading)] disabled:opacity-50 active:scale-[0.98] ${btnBg}`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
