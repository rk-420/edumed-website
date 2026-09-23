import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api.js';

export default function AddVisitModal({ patientId, onClose, onSaved }) {
  const [form, setForm] = useState({
    visit_date: new Date().toISOString().slice(0, 10),
    reason: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason.trim()) {
      setError('Reason is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { visit } = await api.createVisit({ patient_id: patientId, ...form });
      onSaved(visit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Add Visit</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Visit Date</label>
            <input type="date" className="input-field" value={form.visit_date} onChange={update('visit_date')} />
          </div>
          <div>
            <label className="label">Reason</label>
            <input
              className="input-field"
              placeholder="e.g. Initial Consultation, X-Ray Review"
              value={form.reason}
              onChange={update('reason')}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input-field" rows={3} value={form.notes} onChange={update('notes')} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Add Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
