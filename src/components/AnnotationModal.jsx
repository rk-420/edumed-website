import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { ANATOMICAL_REGIONS, OBSERVATION_TYPES } from '../lib/bodySystems.js';

const BODY_SYSTEM_OPTIONS = [
  'Skeletal System', 'Muscular System', 'Nervous System',
  'Circulatory System', 'Respiratory System', 'Digestive System'
];

export default function AnnotationModal({ patientId, pending, existing, onClose, onSaved, onDeleted }) {
  const isEdit = Boolean(existing);
  const [form, setForm] = useState({
    title: existing?.title || '',
    anatomical_region: existing?.anatomical_region || ANATOMICAL_REGIONS[0],
    body_system: existing?.body_system || BODY_SYSTEM_OPTIONS[0],
    observation_type: existing?.observation_type || 'Pain',
    severity: existing?.severity || 'Medium'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Observation title is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        const { annotation } = await api.updateAnnotation(existing.id, form);
        onSaved(annotation);
      } else {
        const { annotation } = await api.createAnnotation({
          patient_id: patientId,
          body_view: pending.view,
          pos_x: pending.x,
          pos_y: pending.y,
          ...form
        });
        onSaved(annotation);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteAnnotation(existing.id);
      onDeleted(existing.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">
            {isEdit ? 'Edit Annotation' : 'Add Medical Pin Annotation'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Observation Title</label>
            <input
              className="input-field"
              placeholder="e.g. Right Shoulder Pain, Joint Swelling"
              value={form.title}
              onChange={update('title')}
              autoFocus
            />
          </div>

          <div>
            <label className="label">Anatomical Region</label>
            <select className="input-field" value={form.anatomical_region} onChange={update('anatomical_region')}>
              {ANATOMICAL_REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Body System</label>
              <select className="input-field" value={form.body_system} onChange={update('body_system')}>
                {BODY_SYSTEM_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Observation Type</label>
              <select className="input-field" value={form.observation_type} onChange={update('observation_type')}>
                {OBSERVATION_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Severity</label>
            <select className="input-field" value={form.severity} onChange={update('severity')}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-between items-center pt-2">
            {isEdit ? (
              <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1">
                <Trash2 size={14} /> Delete
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Pin Annotation'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
