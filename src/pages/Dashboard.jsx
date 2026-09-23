import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ClipboardList, CalendarClock, CheckCircle2, PenLine,
  Bone, Zap, Brain, Heart, Wind, Sun, ChevronRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { BODY_SYSTEMS, observationColor } from '../lib/bodySystems.js';
import StatCard from '../components/StatCard.jsx';

const SYSTEM_ICONS = { Bone, Zap, Brain, Heart, Wind, Sun };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .dashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!stats) return <p className="text-sm text-slate-400">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome back, {user?.name}!</p>
        </div>
        <Link to="/patients" className="btn-primary rounded-full px-5">+ New Patient</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} color="#2f8fd6" bg="#eff8ff" />
        <StatCard icon={ClipboardList} label="Total Annotations" value={stats.totalAnnotations} color="#22c55e" bg="#f0fdf4" />
        <StatCard icon={CalendarClock} label="Today's Appointments" value={stats.todaysAppointments} color="#a855f7" bg="#faf5ff" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-sm text-slate-700">Recent Patients</h2>
            <Link to="/patients" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentPatients.map((p) => (
              <Link
                key={p.id}
                to={`/patients/${p.id}`}
                className="flex items-center justify-between py-2.5 text-sm hover:bg-slate-50 -mx-2 px-2 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
                    {p.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{p.full_name}</p>
                    <p className="text-xs text-slate-400">{p.patient_code} · {p.age}, {p.sex}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(p.updated_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
            {stats.recentPatients.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">No patients yet.</p>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-sm text-slate-700">Body Systems</h2>
            <span className="text-xs text-brand-600 hover:underline cursor-pointer">Browse all</span>
          </div>
          <div className="space-y-1.5">
            {BODY_SYSTEMS.map((s) => {
              const Icon = SYSTEM_ICONS[s.icon];
              return (
                <div
                  key={s.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: s.bg }}
                >
                  <span className="flex items-center gap-2.5 font-medium" style={{ color: s.color }}>
                    <Icon size={16} />
                    {s.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    {s.structures} structures
                    <ChevronRight size={14} className="text-slate-400" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-sm text-slate-700">Recent Annotations</h2>
            <span className="text-xs text-brand-600 hover:underline cursor-pointer">View all</span>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentAnnotations.map((a) => (
              <Link
                key={a.id}
                to={`/patients/${a.patient_id}`}
                className="flex items-center justify-between py-2.5 text-sm hover:bg-slate-50 -mx-2 px-2 rounded-lg"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${observationColor(a.observation_type)}1a`, color: observationColor(a.observation_type) }}
                  >
                    <PenLine size={13} />
                  </span>
                  <div>
                    <p className="font-medium text-slate-700">{a.title}</p>
                    <p className="text-xs text-slate-400">
                      {a.anatomical_region} · {a.patient_name}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-500 shrink-0">
                  <CheckCircle2 size={13} /> Note added
                </span>
              </Link>
            ))}
            {stats.recentAnnotations.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">No annotations yet.</p>
            )}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="font-medium text-sm text-slate-700 mb-3">Activity Overview (This Week)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2f8fd6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
