'use client'

import { useState } from 'react'
import { X, Check, Truck, ArrowRight, ArrowLeft, Scale, ShieldCheck, FileText } from 'lucide-react'
import { TruckInwardGateRecord, GateItemCategory } from '../../types/store'
import { saveTruckInwardRecord } from '../../utils/storeStorage'

interface RecordTruckInwardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RecordTruckInwardModal({ isOpen, onClose }: RecordTruckInwardModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  
  // Step 1: Security & Transport
  const [grnNumber, setGrnNumber] = useState(`GRN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`)
  const [vehicleNumber, setVehicleNumber] = useState('PB-10-CZ-8820')
  const [supplierName, setSupplierName] = useState('Vardhman Textiles Ltd.')
  const [poReference, setPoReference] = useState('PO-2026-0890')
  const [driverName, setDriverName] = useState('Baldev Singh')
  const [driverPhone, setDriverPhone] = useState('+91 98765 00123')

  // Step 2: Consignment & Weighbridge
  const [itemCategory, setItemCategory] = useState<GateItemCategory>('RAW_FABRIC_ROLL')
  const [totalPackages, setTotalPackages] = useState<number>(180)
  const [grossWeightKg, setGrossWeightKg] = useState<number>(15200)
  const [tareWeightKg, setTareWeightKg] = useState<number>(9400)
  const [receiverInspector, setReceiverInspector] = useState('Kishan Chand (Store In-Charge)')
  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const netWeightKg = Math.max(0, grossWeightKg - tareWeightKg)

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    try {
      const record: TruckInwardGateRecord = {
        id: `grn-${Date.now()}`,
        grnNumber,
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        supplierName,
        poReference,
        driverName,
        driverPhone,
        arrivalTimestamp: new Date().toISOString(),
        grossWeightKg,
        tareWeightKg,
        netWeightKg,
        itemCategory,
        totalPackages,
        gateSecurityStatus: 'UNLOADED_VERIFIED',
        receiverInspector,
        remarks: remarks.trim() || 'Electronic GRN issued at Weighbridge Station 01.'
      }

      saveTruckInwardRecord(record)
      onClose()
      setStep(1)
    } catch (err) {
      console.error('Failed to create GRN:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564]/10 text-[#3A3564] flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Truck Inward & Weighbridge GRN
              </h2>
              <p className="text-xs font-mono text-slate-500">
                2-Step Security Gatehouse Inward Stepper
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-black/10 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2.5 rounded-xl border text-center transition-all ${
            step === 1 
              ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-xs' 
              : 'bg-[#FAF7F0] text-slate-600 border-black/10'
          }`}>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider block">
              Step 1
            </span>
            <span className="text-xs font-bold font-mono">
              Gate Security & Vehicle
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border text-center transition-all ${
            step === 2 
              ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-xs' 
              : 'bg-[#FAF7F0] text-slate-600 border-black/10'
          }`}>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider block">
              Step 2
            </span>
            <span className="text-xs font-bold font-mono">
              Consignment & Weighbridge
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleNext} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                    System GRN Slip No
                  </label>
                  <input
                    type="text"
                    value={grnNumber}
                    onChange={(e) => setGrnNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                    Truck / Vehicle Reg No
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. DL-01-AB-1234"
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                    Supplier / Mill Name
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                    Purchase Order (PO) Reference
                  </label>
                  <input
                    type="text"
                    value={poReference}
                    onChange={(e) => setPoReference(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                    Driver Full Name
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                    Driver Phone Contact
                  </label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                    Consignment Category
                  </label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as GateItemCategory)}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564] cursor-pointer"
                  >
                    <option value="RAW_FABRIC_ROLL">Raw Fabric Rolls</option>
                    <option value="TRIMS">Trims & Accessories</option>
                    <option value="PACKAGING">Cartons & Packaging</option>
                    <option value="CHEMICAL">Laundry & Spotting Chemicals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                    Total Packages / Rolls
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalPackages}
                    onChange={(e) => setTotalPackages(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    required
                  />
                </div>
              </div>

              {/* Weighbridge Calculation Card */}
              <div className="bg-[#FAF7F0] p-4 rounded-xl border border-black/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black uppercase text-[#3A3564] tracking-wider">
                    Weighbridge Scale Slip
                  </span>
                  <Scale className="w-4 h-4 text-slate-400" />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-white p-2.5 rounded-lg border border-black/5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 block">
                      Gross Wt (kg)
                    </span>
                    <input
                      type="number"
                      value={grossWeightKg}
                      onChange={(e) => setGrossWeightKg(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-black text-slate-900 mt-1 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-black/5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 block">
                      Tare Wt (kg)
                    </span>
                    <input
                      type="number"
                      value={tareWeightKg}
                      onChange={(e) => setTareWeightKg(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-black text-slate-900 mt-1 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 block">
                      Net Wt (kg)
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-950 block mt-1">
                      {netWeightKg.toLocaleString()} kg
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                    Receiving Store Inspector
                  </label>
                  <input
                    type="text"
                    value={receiverInspector}
                    onChange={(e) => setReceiverInspector(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                    Lorry Receipt / Security Notes
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. LR #9920 matched with PO delivery slip"
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-black/10">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 1</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-mono font-bold hover:bg-[#2e2a52] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {step === 1 ? (
                <>
                  <span>Proceed to Weighbridge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Generating GRN...' : 'Issue Electronic GRN'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
