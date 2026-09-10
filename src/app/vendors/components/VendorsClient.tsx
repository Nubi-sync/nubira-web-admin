'use client'

import React, { useState, useMemo, useTransition } from 'react'
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Tag,
  Briefcase,
  Archive,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  Download
} from 'lucide-react'
import { BrandRecord, VendorRecord, createVendor, updateVendor, toggleVendorStatus, createBrand, deleteVendor } from '../actions'
import { SubtleDialog, SubtleDialogProps } from '@/components/ui/SubtleDialog'

interface VendorsClientProps {
  brands: BrandRecord[]
  vendors: VendorRecord[]
}

const VENDOR_TYPES = [
  { value: 'STITCHING_JOB_WORK', label: 'Stitching Contractor (Job Work)', badge: 'Stitching' },
  { value: 'FABRIC_SUPPLIER', label: 'Fabric Mill / Supplier', badge: 'Fabric' },
  { value: 'TRIMS_ACCESSORIES', label: 'Trims & Accessories Supplier', badge: 'Trims' },
  { value: 'PRINTING_EMBROIDERY', label: 'Printing & Embroidery Unit', badge: 'Print/Emb' },
  { value: 'WASHING_FINISHING', label: 'Washing & Finishing Unit', badge: 'Finishing' },
]

export function VendorsClient({ brands: initialBrands, vendors: initialVendors }: VendorsClientProps) {
  const [brands, setBrands] = useState<BrandRecord[]>(initialBrands)
  const [vendors, setVendors] = useState<VendorRecord[]>(initialVendors)
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  // Modal States
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<VendorRecord | null>(null)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)

  // Dialog State
  const [dialog, setDialog] = useState<Omit<SubtleDialogProps, 'onClose'>>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'info',
    confirmText: 'Understood'
  })

  const showSubtleDialog = (title: string, description: string, variant: 'error' | 'warning' | 'info' | 'success' = 'info') => {
    setDialog({
      isOpen: true,
      title,
      description,
      variant,
      confirmText: 'Understood'
    })
  }

  // Active KPI Metrics
  const kpis = useMemo(() => {
    const totalVendors = vendors.length
    const activeVendors = vendors.filter(v => v.is_active).length
    const totalBrands = brands.length
    const stitchingUnits = vendors.filter(v => v.vendor_type === 'STITCHING_JOB_WORK').length
    const avgRate = vendors.length > 0 
      ? Math.round(vendors.reduce((acc, v) => acc + (Number(v.stitching_rate) || 0), 0) / vendors.length) 
      : 20

    return { totalVendors, activeVendors, totalBrands, stitchingUnits, avgRate }
  }, [vendors, brands])

  // Filtered Vendors List
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      // Brand filter
      if (selectedBrand !== 'ALL') {
        if ((v.brand_name || '').toUpperCase() !== selectedBrand.toUpperCase()) return false
      }
      // Type filter
      if (selectedType !== 'ALL') {
        if (v.vendor_type !== selectedType) return false
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = (v.vendor_name || '').toLowerCase().includes(q)
        const matchCode = (v.vendor_code || '').toLowerCase().includes(q)
        const matchContact = (v.contact_person || '').toLowerCase().includes(q)
        const matchCity = (v.city || '').toLowerCase().includes(q)
        const matchBrand = (v.brand_name || '').toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchContact && !matchCity && !matchBrand) return false
      }
      return true
    })
  }, [vendors, selectedBrand, selectedType, searchQuery])

  // Handle Save Vendor (Create or Edit)
  const handleSaveVendor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      try {
        if (editingVendor) {
          const payload: Partial<VendorRecord> = {
            vendor_name: (formData.get('vendor_name') as string)?.trim(),
            brand_name: (formData.get('brand_name') as string)?.trim().toUpperCase(),
            vendor_type: formData.get('vendor_type') as any,
            contact_person: (formData.get('contact_person') as string)?.trim(),
            phone: (formData.get('phone') as string)?.trim(),
            city: (formData.get('city') as string)?.trim(),
            address: (formData.get('address') as string)?.trim(),
            gst_no: (formData.get('gst_no') as string)?.trim(),
            stitching_rate: parseFloat(formData.get('stitching_rate') as string) || 20.00,
          }
          const res = await updateVendor(editingVendor.id, payload)
          if (res.error) {
            showSubtleDialog('Update Error', res.error, 'error')
            return
          }
          setVendors(prev => prev.map(v => v.id === editingVendor.id ? { ...v, ...payload } as VendorRecord : v))
          showSubtleDialog('Vendor Updated', `Unit ${payload.vendor_name} details updated successfully.`, 'success')
        } else {
          const res = await createVendor(formData)
          if (res.error) {
            showSubtleDialog('Creation Error', res.error, 'error')
            return
          }
          if (res.data) {
            setVendors(prev => [res.data as VendorRecord, ...prev])
          }
          showSubtleDialog('Vendor Created', 'New vendor unit has been registered and is now active.', 'success')
        }
        setIsVendorModalOpen(false)
        setEditingVendor(null)
      } catch (err: any) {
        showSubtleDialog('Operation Failed', err.message || 'Unable to save vendor', 'error')
      }
    })
  }

  // Handle Save Brand
  const handleSaveBrand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const brandName = (formData.get('brand_name') as string)?.trim().toUpperCase()
    const brandCode = (formData.get('brand_code') as string)?.trim().toUpperCase()
    const contact = (formData.get('contact_person') as string)?.trim()
    const city = (formData.get('city') as string)?.trim()

    startTransition(async () => {
      try {
        const res = await createBrand(brandName, brandCode, contact, city)
        if (res.error) {
          showSubtleDialog('Brand Error', res.error, 'error')
          return
        }
        if (res.data) {
          setBrands(prev => [...prev, res.data as BrandRecord])
        }
        showSubtleDialog('Brand Registered', `Brand "${brandName}" is now available for vendor association.`, 'success')
        setIsBrandModalOpen(false)
      } catch (err: any) {
        showSubtleDialog('Failed to create brand', err.message, 'error')
      }
    })
  }

  // Handle Toggle Active
  const handleToggleActive = async (vendor: VendorRecord) => {
    startTransition(async () => {
      const res = await toggleVendorStatus(vendor.id, vendor.is_active)
      if (res.error) {
        showSubtleDialog('Status Update Error', res.error, 'error')
        return
      }
      setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, is_active: !v.is_active } : v))
    })
  }

  // Handle Delete Vendor
  const handleDeleteVendor = async (vendor: VendorRecord) => {
    if (!confirm(`Are you sure you want to delete vendor "${vendor.vendor_name}"?`)) return

    startTransition(async () => {
      const res = await deleteVendor(vendor.id)
      if (res.error) {
        showSubtleDialog('Deletion Failed', res.error, 'error')
        return
      }
      setVendors(prev => prev.filter(v => v.id !== vendor.id))
      showSubtleDialog('Vendor Removed', `Vendor "${vendor.vendor_name}" has been deleted.`, 'info')
    })
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header Card (Nubira Standard Palette) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Brands & Vendors Master
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                ERP MASTER
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Manage multi-vendor stitching units, contractor job-workers, and principal buyers across all production operations
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsBrandModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/10 shadow-2xs transition-all cursor-pointer"
          >
            <Tag className="w-4 h-4" />
            <span>Add Brand</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingVendor(null)
              setIsVendorModalOpen(true)
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vendor Unit</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Vendors */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Active Vendors
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 block">
              {kpis.activeVendors} <span className="text-xs font-medium text-slate-500">/ {kpis.totalVendors} total</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        {/* Registered Brands */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Registered Brands
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 block">
              {kpis.totalBrands} <span className="text-xs font-medium text-slate-500">buyers</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            <Tag className="w-4 h-4" />
          </div>
        </div>

        {/* Stitching Units */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Stitching Units
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 block">
              {kpis.stitchingUnits} <span className="text-xs font-medium text-slate-500">job-workers</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Avg Stitching Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Factory Std Rate
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 block">
              ₹{kpis.avgRate}.00 <span className="text-xs font-medium text-slate-500">/ pc</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* 3. Brand Tabs & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        {/* Brand Segmented Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedBrand('ALL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedBrand === 'ALL'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>All Brands</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">
              {vendors.length}
            </span>
          </button>

          {brands.map(b => {
            const count = vendors.filter(v => (v.brand_name || '').toUpperCase() === b.brand_name.toUpperCase()).length
            const isSel = selectedBrand.toUpperCase() === b.brand_name.toUpperCase()
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBrand(b.brand_name)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{b.brand_name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSel ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Vendor Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
            >
              <option value="ALL">All Contractor Types</option>
              {VENDOR_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendor, code, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Vendors Master Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {filteredVendors.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              No vendors found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
              No contractor units match the selected filters. Add your first vendor unit or change your brand filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingVendor(null)
                setIsVendorModalOpen(true)
              }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor Unit</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 font-mono font-bold uppercase tracking-wider text-xs">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Vendor / Unit Name</th>
                  <th className="py-3.5 px-4">Principal Brand</th>
                  <th className="py-3.5 px-4">Vendor Type</th>
                  <th className="py-3.5 px-4">Contact & Location</th>
                  <th className="py-3.5 px-4 text-right">Stitching Rate</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredVendors.map((vendor) => {
                  const typeObj = VENDOR_TYPES.find(t => t.value === vendor.vendor_type)
                  return (
                    <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-[#3A3564]">
                        {vendor.vendor_code}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{vendor.vendor_name}</div>
                        {vendor.gst_no && (
                          <div className="text-[11px] font-mono text-slate-500">GST: {vendor.gst_no}</div>
                        )}
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                          <Tag className="w-3 h-3" />
                          <span>{vendor.brand_name}</span>
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {typeObj?.badge || vendor.vendor_type}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{vendor.contact_person || 'Unit Master'}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          {vendor.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {vendor.phone}
                            </span>
                          )}
                          {vendor.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {vendor.city}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rate */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                        ₹{(Number(vendor.stitching_rate) || 20).toFixed(2)}
                        <span className="text-[10px] text-slate-500 font-normal block">per pc</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(vendor)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono transition-colors cursor-pointer ${
                            vendor.is_active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {vendor.is_active ? 'Active' : 'Archived'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVendor(vendor)
                              setIsVendorModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                            title="Edit Vendor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVendor(vendor)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Vendor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT VENDOR                               */}
      {/* ======================================================== */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex justify-center items-start sm:items-center">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-black/10 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col">
            
            <div className="p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                    {editingVendor ? 'Edit Vendor Unit' : 'Register New Vendor / Job-Worker'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">Contractor stitching factory or supplier</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVendorModalOpen(false)
                  setEditingVendor(null)
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="flex flex-col flex-1">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(88vh-140px)]">
                
                {/* Brand Selection */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Principal Brand Client *
                  </label>
                  <select
                    name="brand_name"
                    required
                    defaultValue={editingVendor?.brand_name || (brands[0]?.brand_name || 'OLLYPOP')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.brand_name}>{b.brand_name} ({b.brand_code})</option>
                    ))}
                  </select>
                </div>

                {/* Vendor Name & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Vendor / Unit Name *
                    </label>
                    <input
                      type="text"
                      name="vendor_name"
                      required
                      placeholder="e.g. Enter Vendor / Unit Name"
                      defaultValue={editingVendor?.vendor_name || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Vendor Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="vendor_code"
                      placeholder="e.g. VND-01"
                      defaultValue={editingVendor?.vendor_code || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                    />
                  </div>
                </div>

                {/* Vendor Type & Stitching Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Contractor Type *
                    </label>
                    <select
                      name="vendor_type"
                      required
                      defaultValue={editingVendor?.vendor_type || 'STITCHING_JOB_WORK'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                    >
                      {VENDOR_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Stitching Rate (₹ / pc)
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      name="stitching_rate"
                      placeholder="20.00"
                      defaultValue={editingVendor?.stitching_rate ?? 20.00}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                    />
                  </div>
                </div>

                {/* Contact Person & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Contact Master / Person
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      placeholder="e.g. Master Shanti"
                      defaultValue={editingVendor?.contact_person || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Phone / Mobile
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="+91 98300 12345"
                      defaultValue={editingVendor?.phone || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                    />
                  </div>
                </div>

                {/* City & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      City / Area
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Kolkata"
                      defaultValue={editingVendor?.city || 'Kolkata'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gst_no"
                      placeholder="e.g. 19AADCO1064C1ZK"
                      defaultValue={editingVendor?.gst_no || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Factory / Unit Address
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    placeholder="Unit location, street, pin code..."
                    defaultValue={editingVendor?.address || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                  />
                </div>

              </div>

              <div className="p-4 sm:p-5 border-t border-black/10 bg-slate-50/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsVendorModalOpen(false)
                    setEditingVendor(null)
                  }}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200/60 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {isPending ? 'Saving...' : editingVendor ? 'Update Vendor' : 'Create Vendor'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD BRAND                                       */}
      {/* ======================================================== */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex justify-center items-start sm:items-center">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-black/10 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col">
            
            <div className="p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                    Add New Brand
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">Principal buyer label</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="flex flex-col flex-1">
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="brand_name"
                    required
                    placeholder="e.g. OLLYPOP, FIRST SMILE"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Brand Code
                    </label>
                    <input
                      type="text"
                      name="brand_code"
                      placeholder="e.g. OP"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      defaultValue="Kolkata"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Buyer Contact / Merchandiser
                  </label>
                  <input
                    type="text"
                    name="contact_person"
                    placeholder="e.g. Merchandising Team"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 border-t border-black/10 bg-slate-50/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200/60 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {isPending ? 'Registering...' : 'Add Brand'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Subtle Dialog for user feedback */}
      <SubtleDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        description={dialog.description}
        variant={dialog.variant}
        confirmText={dialog.confirmText}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  )
}
