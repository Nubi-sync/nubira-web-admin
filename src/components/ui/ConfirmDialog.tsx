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
      iconBg: 'bg-[#FAF7F0] border-black/10 text-[#3A3564]',
      btnBg: 'bg-[#3A3564] hover:bg-[#2A2649] text-[#FAF7F0] shadow-xs',
      Icon: ShieldAlert
    }
  }

  const { iconBg, btnBg, Icon } = variantStyles[variant] || variantStyles.danger

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/15 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3A3564]" />
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
        <div className="px-6 py-4 bg-[#FAF7F0]/60 border-t border-black/10 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-black/5 rounded-xl border border-black/10 bg-white transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer font-[family-name:var(--font-heading)] disabled:opacity-50 ${btnBg}`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
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
