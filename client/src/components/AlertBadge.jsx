function AlertBadge({ type }) {
  const config = {
    EMERGENCY: { label: 'Emergency', bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
    HIGH_TEMPERATURE: { label: 'High Temp', bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    GAS_LEAK: { label: 'Gas Leak', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    POOR_AIR_QUALITY: { label: 'Poor Air', bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
    HELMET_NOT_WORN: { label: 'No Helmet', bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
    HELMET_NOT_WORN_PROPERLY: { label: 'Helmet Loose', bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/40' },
  };

  const c = config[type] || { label: type, bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/40' };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text} ${c.border} animate-pulse-alert`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}

export default AlertBadge;
