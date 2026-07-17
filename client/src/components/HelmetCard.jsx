import { FiShield, FiWifi, FiWifiOff, FiThermometer, FiDroplet, FiWind, FiAlertTriangle } from 'react-icons/fi';
import AlertBadge from './AlertBadge';

function HelmetCard({ data, isOnline, isSelected, onClick }) {
  const hasAlerts = data.alerts && data.alerts.length > 0;
  const isEmergency = data.alerts?.includes('EMERGENCY');

  let borderColor = 'border-slate-700/50';
  let glowClass = '';
  if (isEmergency) {
    borderColor = 'border-rose-500/60';
    glowClass = 'shadow-lg shadow-rose-500/20';
  } else if (hasAlerts) {
    borderColor = 'border-amber-500/50';
    glowClass = 'shadow-lg shadow-amber-500/10';
  } else if (isOnline) {
    borderColor = 'border-emerald-500/30';
  }

  if (isSelected) {
    borderColor = 'border-sky-500/60';
    glowClass = 'shadow-lg shadow-sky-500/20';
  }

  const avgFsr = data.fsr1 != null ? Math.round((data.fsr1 + data.fsr2 + data.fsr3) / 3) : null;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border ${borderColor} bg-slate-900/70 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/90 ${glowClass} animate-fade-in`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${data.helmetWorn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
            <FiShield size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{data.helmetId}</h3>
            <p className="text-xs text-slate-500">{data.helmetWorn ? 'Helmet Worn' : 'Helmet Off'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-status-pulse" />
              <span className="text-xs text-emerald-400">Online</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-slate-600" />
              <span className="text-xs text-slate-500">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Sensor values */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-950/60 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FiThermometer size={12} />
            <span>Temp</span>
          </div>
          <p className={`mt-0.5 text-lg font-bold ${data.temperature > 45 ? 'text-rose-400' : 'text-white'}`}>
            {data.temperature != null ? `${data.temperature}°C` : '--'}
          </p>
        </div>
        <div className="rounded-xl bg-slate-950/60 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FiDroplet size={12} />
            <span>Humidity</span>
          </div>
          <p className="mt-0.5 text-lg font-bold text-white">
            {data.humidity != null ? `${data.humidity}%` : '--'}
          </p>
        </div>
        <div className="rounded-xl bg-slate-950/60 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FiWind size={12} />
            <span>MQ2</span>
          </div>
          <p className={`mt-0.5 text-lg font-bold ${data.mq2 > 400 ? 'text-amber-400' : 'text-white'}`}>
            {data.mq2 != null ? data.mq2 : '--'}
          </p>
        </div>
        <div className="rounded-xl bg-slate-950/60 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FiWind size={12} />
            <span>MQ135</span>
          </div>
          <p className={`mt-0.5 text-lg font-bold ${data.mq135 > 400 ? 'text-amber-400' : 'text-white'}`}>
            {data.mq135 != null ? data.mq135 : '--'}
          </p>
        </div>
      </div>

      {/* FSR */}
      {avgFsr != null && (
        <div className="mt-3 rounded-xl bg-slate-950/60 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Strap Pressure (avg)</span>
            <span className={`text-sm font-bold ${avgFsr < 300 ? 'text-violet-400' : 'text-white'}`}>{avgFsr}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${avgFsr < 300 ? 'bg-violet-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min((avgFsr / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Alerts */}
      {hasAlerts && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.alerts.map((a, i) => (
            <AlertBadge key={i} type={a} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HelmetCard;
