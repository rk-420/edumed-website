import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api.js';

export default function RegisterPatientModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ full_name: '', age: '', sex: 'Female' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim() || !form.age) {
      setError('Full name and age are required');
      return;
    }
    setLoading(true);
    try {
      const { patient } = await api.createPatient({
        full_name: form.full_name.trim(),
        age: parseInt(form.age, 10),
        sex: form.sex
      });
      onCreated(patient);
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
          <h2 className="font-semibold text-slate-800">Register New Patient</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input-field"
              placeholder="e.g. John Doe"
              value={form.full_name}
              onChange={update('full_name')}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Age</label>
              <input
                type="number"
                min="0"
                max="130"
                className="input-field"
                placeholder="e.g. 35"
                value={form.age}
                onChange={update('age')}
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input-field" value={form.sex} onChange={update('sex')}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
