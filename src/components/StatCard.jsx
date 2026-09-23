export default function StatCard({ icon: Icon, label, value, hint, color = '#2f8fd6', bg = '#eff8ff' }) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ color, backgroundColor: bg }}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
        {hint && <p className="text-xs text-emerald-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}
