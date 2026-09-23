import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api.js';

export default function EditPatientModal({ patient, onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name: patient.full_name || '',
    age: patient.age || '',
    sex: patient.sex || 'Female',
    blood_group: patient.blood_group || '',
    phone: patient.phone || '',
    email: patient.email || '',
    allergies: patient.allergies || '',
    medical_history: patient.medical_history || '',
    current_medication: patient.current_medication || '',
    height_cm: patient.height_cm || '',
    weight_kg: patient.weight_kg || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { patient: updated } = await api.updatePatient(patient.id, {
        ...form,
        age: parseInt(form.age, 10),
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card w-full max-w-lg p-5 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Edit Patient Information</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Full Name</label>
              <input className="input-field" value={form.full_name} onChange={update('full_name')} />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" className="input-field" value={form.age} onChange={update('age')} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input-field" value={form.sex} onChange={update('sex')}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input-field" value={form.phone} onChange={update('phone')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input-field" value={form.email} onChange={update('email')} />
            </div>
            <div className="col-span-2">
              <label className="label">Allergies</label>
              <input className="input-field" value={form.allergies} onChange={update('allergies')} />
            </div>
            <div className="col-span-2">
              <label className="label">Medical History</label>
              <input className="input-field" value={form.medical_history} onChange={update('medical_history')} />
            </div>
            <div className="col-span-2">
              <label className="label">Current Medication</label>
              <input className="input-field" value={form.current_medication} onChange={update('current_medication')} />
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" className="input-field" value={form.height_cm} onChange={update('height_cm')} />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" className="input-field" value={form.weight_kg} onChange={update('weight_kg')} />
            </div>
            <div>
              <label className="label">Blood Group</label>
              <input className="input-field" value={form.blood_group} onChange={update('blood_group')} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
