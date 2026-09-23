import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowUpDown } from 'lucide-react';
import { api } from '../lib/api.js';
import RegisterPatientModal from '../components/RegisterPatientModal.jsx';

export default function PatientDirectory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('last_activity');
  const [dir, setDir] = useState('desc');
  const [showRegister, setShowRegister] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .getPatients({ search, sort, dir })
      .then(({ patients }) => setPatients(patients))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, sort, dir]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSort = (col) => {
    if (sort === col) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(col);
      setDir('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Patients Directory</h1>
          <p className="text-sm text-slate-400">Displaying {patients.length} patient records</p>
        </div>
        <button className="btn-primary" onClick={() => setShowRegister(true)}>+ Register Patient</button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input-field pl-9"
          placeholder="Search by name, ID, allergies..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSearchParams(e.target.value ? { search: e.target.value } : {});
          }}
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs text-slate-500 border-b border-slate-200">
              <Th label="Patient" col="name" sort={sort} dir={dir} onClick={toggleSort} />
              <th className="px-4 py-3 font-medium">ID</th>
              <Th label="Age/Gender" col="age" sort={sort} dir={dir} onClick={toggleSort} />
              <Th label="Last Activity" col="last_activity" sort={sort} dir={dir} onClick={toggleSort} />
              <th className="px-4 py-3 font-medium">Allergies</th>
              <th className="px-4 py-3 font-medium">Blood Group</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/patients/${p.id}`)}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-4 py-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
                    {p.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className="font-medium text-slate-700">{p.full_name}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.patient_code}</td>
                <td className="px-4 py-3 text-slate-500">{p.age}, {p.sex}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(p.updated_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {p.allergies ? (
                    <span className="text-red-500 text-xs font-medium">{p.allergies}</span>
                  ) : (
                    <span className="text-slate-400 text-xs">None</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                    {p.blood_group || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && patients.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No patients found.</p>
        )}
        {loading && <p className="text-sm text-slate-400 text-center py-8">Loading...</p>}
        {error && <p className="text-sm text-red-500 text-center py-8">{error}</p>}
      </div>

      {showRegister && (
        <RegisterPatientModal
          onClose={() => setShowRegister(false)}
          onCreated={(patient) => {
            setShowRegister(false);
            navigate(`/patients/${patient.id}`);
          }}
        />
      )}
    </div>
  );
}

function Th({ label, col, sort, dir, onClick }) {
  const active = sort === col;
  return (
    <th
      className="px-4 py-3 font-medium cursor-pointer select-none"
      onClick={() => onClick(col)}
    >
      <span className={`inline-flex items-center gap-1 ${active ? 'text-brand-600' : ''}`}>
        {label}
        <ArrowUpDown size={12} className={active && dir === 'desc' ? 'rotate-180' : ''} />
      </span>
    </th>
  );
}
