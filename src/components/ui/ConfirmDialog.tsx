'use client'

import React from 'react'
import { AlertTriangle, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react'

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
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onClose,
  children
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-50 border-red-100 text-red-600',
      btnBg: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200',
      Icon: Trash2
    },
    warning: {
      iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
      Icon: AlertTriangle
    },
    success: {
      iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
      Icon: CheckCircle2
    },
    primary: {
      iconBg: 'bg-slate-100 border-slate-200 text-slate-700',
      btnBg: 'bg-[var(--steel,#2B4C7E)] hover:opacity-90 text-white shadow-slate-200',
      Icon: ShieldAlert
    }
  }

  const { iconBg, btnBg, Icon } = variantStyles[variant] || variantStyles.primary

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 text-center">
          <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center mx-auto mb-4 shadow-2xs ${iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
            {title}
          </h3>

          {description && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {description}
            </p>
          )}

          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 ${btnBg}`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
