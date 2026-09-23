import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil } from 'lucide-react';
import { api } from '../lib/api.js';
import BodyModel from '../components/BodyModel.jsx';
import BmiCalculator from '../components/BmiCalculator.jsx';
import AnnotationModal from '../components/AnnotationModal.jsx';
import EditPatientModal from '../components/EditPatientModal.jsx';
import AddVisitModal from '../components/AddVisitModal.jsx';
import { observationColor } from '../lib/bodySystems.js';

export default function PatientDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [view, setView] = useState('front');
  const [addMode, setAddMode] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);

  const load = useCallback(() => {
    api.getPatient(id).then(setData).catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!data) return <p className="text-sm text-slate-400">Loading patient...</p>;

  const { patient, annotations, visits } = data;

  const handlePinPick = (x, y) => {
    setPendingPin({ view, x, y });
    setAddMode(false);
  };

  const handleAnnotationSaved = () => {
    setPendingPin(null);
    setEditingAnnotation(null);
    load();
  };

  const handleAnnotationDeleted = () => {
    setEditingAnnotation(null);
    load();
  };

  return (
    <div className="space-y-4">
      <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to Patients
      </Link>

      <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
            {patient.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 flex items-center gap-2">
              {patient.full_name}
              <span className="text-xs text-slate-400 font-normal">Patient ID: {patient.patient_code}</span>
            </h1>
            <div className="flex gap-2 mt-1">
              <Tag>{patient.age} years</Tag>
              <Tag>{patient.sex}</Tag>
              <Tag>Blood Group: {patient.blood_group || '—'}</Tag>
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          <p>{patient.phone || 'No phone on file'}</p>
          <p>{patient.email || 'No email on file'}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAddMode((v) => !v)}
            className={addMode ? 'btn-primary ring-2 ring-brand-300' : 'btn-primary'}
          >
            <Plus size={14} className="inline mr-1" />
            {addMode ? 'Click on body...' : 'New Annotation'}
          </button>
          <button onClick={() => setShowEditPatient(true)} className="btn-secondary">
            <Pencil size={14} className="inline mr-1" /> Edit Patient Info
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4">
        {/* Left: patient info + BMI */}
        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="font-medium text-sm text-slate-700 mb-3">Patient Information</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Age" value={`${patient.age} years`} />
              <Row label="Sex" value={patient.sex} />
              <Row label="Height" value={patient.height_cm ? `${patient.height_cm} cm` : '—'} />
              <Row label="Weight" value={patient.weight_kg ? `${patient.weight_kg} kg` : '—'} />
              <Row label="Blood Group" value={patient.blood_group || '—'} />
              <Row label="Allergies" value={patient.allergies || 'None'} highlight={Boolean(patient.allergies)} />
              <Row label="Medical History" value={patient.medical_history || '—'} />
              <Row label="Current Medication" value={patient.current_medication || '—'} />
            </dl>
          </div>

          <BmiCalculator patient={patient} />

          <div className="card p-4">
            <h2 className="font-medium text-sm text-slate-700 mb-2">Notes</h2>
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
              {patient.notes || 'No notes recorded.'}
            </p>
          </div>
        </div>

        {/* Center: body model */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-sm text-slate-700">Body Overview (2D)</h2>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {['front', 'back'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 text-xs rounded-md capitalize ${
                    view === v ? 'bg-white shadow text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <BodyModel
            annotations={annotations}
            view={view}
            addMode={addMode}
            onPick={handlePinPick}
            onPinClick={setEditingAnnotation}
          />

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
            <Legend color="#ef4444" label="Pain" />
            <Legend color="#f97316" label="Inflammation" />
            <Legend color="#3b82f6" label="Observation" />
          </div>
        </div>

        {/* Right: annotations + visit history */}
        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="font-medium text-sm text-slate-700 mb-3">Recent Annotations</h2>
            <div className="divide-y divide-slate-100">
              {annotations.slice(0, 6).map((a) => (
                <button
                  key={a.id}
                  onClick={() => setEditingAnnotation(a)}
                  className="w-full text-left py-2.5 flex items-start gap-2 hover:bg-slate-50 -mx-2 px-2 rounded-lg"
                >
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: observationColor(a.observation_type) }}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{a.title}</p>
                    <p className="text-xs text-slate-400">
                      {a.anatomical_region} · {a.body_system}
                    </p>
                  </div>
                </button>
              ))}
              {annotations.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">No annotations yet.</p>
              )}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-sm text-slate-700">Visit History</h2>
              <button onClick={() => setShowAddVisit(true)} className="text-xs text-brand-600 hover:underline">
                + Add Visit
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {visits.map((v) => (
                <div key={v.id} className="py-2.5">
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(v.visit_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-400">{v.reason} · {v.doctor_name || 'Unknown'}</p>
                </div>
              ))}
              {visits.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">No visits recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {pendingPin && (
        <AnnotationModal
          patientId={patient.id}
          pending={pendingPin}
          onClose={() => setPendingPin(null)}
          onSaved={handleAnnotationSaved}
        />
      )}

      {editingAnnotation && (
        <AnnotationModal
          patientId={patient.id}
          existing={editingAnnotation}
          onClose={() => setEditingAnnotation(null)}
          onSaved={handleAnnotationSaved}
          onDeleted={handleAnnotationDeleted}
        />
      )}

      {showEditPatient && (
        <EditPatientModal
          patient={patient}
          onClose={() => setShowEditPatient(false)}
          onSaved={() => {
            setShowEditPatient(false);
            load();
          }}
        />
      )}

      {showAddVisit && (
        <AddVisitModal
          patientId={patient.id}
          onClose={() => setShowAddVisit(false)}
          onSaved={() => {
            setShowAddVisit(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className={highlight ? 'font-medium text-red-500' : 'font-medium text-slate-700'}>{value}</dd>
    </div>
  );
}

function Tag({ children }) {
  return <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{children}</span>;
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
