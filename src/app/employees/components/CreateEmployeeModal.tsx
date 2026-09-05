import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createEmployee } from '../actions';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEmployeeModal({ isOpen, onClose, onSuccess }: CreateEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'LINEMAN',
    line_no: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fData = new FormData();
      fData.append('username', formData.username);
      fData.append('password', formData.password);
      fData.append('role', formData.role);

      const res = await createEmployee(fData);
      if (res.error) {
        setError(res.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-black/10">
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">Add New Employee</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs sm:text-sm font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">Full Name</label>
            <input
              required
              type="text"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all text-sm font-semibold text-slate-900 bg-slate-50/70 focus:bg-white shadow-2xs"
              placeholder="e.g. Rahul Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">Username (Login ID)</label>
            <input
              required
              type="text"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all text-sm font-semibold text-slate-900 bg-slate-50/70 focus:bg-white shadow-2xs"
              placeholder="e.g. rahul_k"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">Password</label>
            <input
              required
              type="password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all text-sm font-semibold text-slate-900 bg-slate-50/70 focus:bg-white shadow-2xs"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">Role</label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all bg-slate-50/70 focus:bg-white text-sm font-semibold text-slate-900 shadow-2xs cursor-pointer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="PRODUCTION_MANAGER">Production Manager (Live Floor & Pipeline Dashboard)</option>
              <option value="QC">QC Inspector / Supervisor (Quality Inspection & Packing)</option>
              <option value="MENDING">Mending (Piece Counting & Matrix Reconciliation)</option>
              <option value="LINEMAN">Lineman (Stitching & Floor Allotment)</option>
              <option value="STORE">Store Manager (Godown & Raw Trims)</option>
              <option value="DISPATCH">Dispatch Manager (Packing & Delivery Challans)</option>
              <option value="ADMIN">Admin (Executive Full Access)</option>
            </select>
          </div>

          {formData.role === 'LINEMAN' && (
            <div className="animate-in slide-in-from-top-2">
              <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">Line Number (Optional)</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all text-sm font-semibold text-slate-900 bg-slate-50/70 focus:bg-white shadow-2xs"
                placeholder="e.g. L-12"
                value={formData.line_no}
                onChange={(e) => setFormData({ ...formData, line_no: e.target.value })}
              />
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-700 font-semibold hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 shadow-2xs cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#3A3564] text-white font-bold rounded-xl hover:bg-[#2A2649] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xs cursor-pointer active:scale-[0.98] text-sm"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{loading ? 'Creating...' : 'Create Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
