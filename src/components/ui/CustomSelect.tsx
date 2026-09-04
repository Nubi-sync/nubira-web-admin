'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface CustomSelectOption {
  value: string
  label: string
  dotColor?: string
  badge?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: CustomSelectOption[]
  placeholder?: string
  className?: string
  buttonClassName?: string
  menuClassName?: string
  ariaLabel?: string
  align?: 'left' | 'right'
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  ariaLabel,
  align = 'left'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}
        className={`bg-slate-50 border border-black/10 hover:border-black/25 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between gap-2.5 transition-all shadow-2xs cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#3A3564] ${buttonClassName} ${
          isOpen ? 'ring-2 ring-[#3A3564] border-transparent bg-white shadow-xs' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate text-left">
          {selectedOption?.dotColor && (
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: selectedOption.dotColor }}
            />
          )}
          {selectedOption?.icon && (
            <selectedOption.icon className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 rounded-md">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-700' : ''}`} />
      </button>

      {/* Custom Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1 min-w-[200px] w-max max-w-[90vw] sm:max-w-xs bg-white border border-black/10 rounded-2xl shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            const Icon = opt.icon

            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#FAF7F0] font-bold text-[#3A3564] border border-black/10 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.dotColor && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: opt.dotColor }}
                    />
                  )}
                  {Icon && (
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#3A3564]' : 'text-slate-400'}`} />
                  )}
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white text-slate-700 border border-black/10 rounded-md">
                      {opt.badge}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#3A3564] shrink-0 stroke-[2.5]" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
