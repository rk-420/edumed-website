import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

const STATUS_STYLES = {
  Scheduled: 'bg-brand-50 text-brand-600',
  Completed: 'bg-emerald-50 text-emerald-600',
  Cancelled: 'bg-red-50 text-red-500',
  'No-show': 'bg-slate-100 text-slate-500'
};

export default function Schedule() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getAppointments(date)
      .then(({ appointments }) => setAppointments(appointments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Schedule</h1>
          <p className="text-sm text-slate-400">Today's appointment overview</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field w-auto"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-700">{a.appointment_time?.slice(0, 5)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-700">{a.patient_name}</p>
                  <p className="text-xs text-slate-400">{a.patient_code} · {a.age}, {a.sex}</p>
                </td>
                <td className="px-4 py-3 text-slate-500">{a.reason || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[a.status] || ''}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/patients/${a.patient_id}`} className="text-xs text-brand-600 hover:underline">
                    Open Chart
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="text-sm text-slate-400 text-center py-8">Loading...</p>}
        {!loading && appointments.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No appointments scheduled for this date.</p>
        )}
        {error && <p className="text-sm text-red-500 text-center py-8">{error}</p>}
      </div>
    </div>
  );
}
