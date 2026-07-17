function StatCard({ icon, label, value, color = 'sky', subtitle }) {
  const colors = {
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const c = colors[color] || colors.sky;

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50 hover:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${c}`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

export default StatCard;
