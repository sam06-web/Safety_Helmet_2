import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AlertBadge from '../components/AlertBadge';
import { getActiveAlerts, getAlertHistory } from '../services/api';
import socket from '../services/socket';
import { FiAlertTriangle, FiClock, FiCheckCircle, FiBell } from 'react-icons/fi';

function Alerts() {
  const [tab, setTab] = useState('active');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  // Listen for real-time alert updates
  useEffect(() => {
    function onUpdate(data) {
      if (data.alerts && data.alerts.length > 0) {
        const newAlerts = data.alerts.map((type) => ({
          _id: Date.now() + Math.random(),
          helmetId: data.helmetId,
          type,
          timestamp: data.timestamp || new Date().toISOString(),
          resolved: false,
        }));
        setActiveAlerts((prev) => [...newAlerts, ...prev]);
      }
    }

    socket.on('helmet-update', onUpdate);
    return () => socket.off('helmet-update', onUpdate);
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        getActiveAlerts().catch(() => ({ data: [] })),
        getAlertHistory().catch(() => ({ data: [] })),
      ]);
      setActiveAlerts(activeRes.data);
      setAlertHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentAlerts = tab === 'active' ? activeAlerts : alertHistory;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Safety Alerts</h1>
            <p className="mt-1 text-sm text-slate-400">Monitor active and historical alerts across all helmets.</p>
          </div>
          <div className="flex rounded-xl border border-slate-700/50 bg-slate-900/60 p-1">
            <button
              onClick={() => setTab('active')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === 'active'
                  ? 'bg-rose-500/15 text-rose-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiBell size={14} />
              Active
              {activeAlerts.length > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500/20 px-1.5 text-xs font-bold text-rose-400">
                  {activeAlerts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('history')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === 'history'
                  ? 'bg-slate-700/40 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiClock size={14} />
              History
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-16 text-center">
            <p className="text-slate-500">Loading alerts...</p>
          </div>
        ) : currentAlerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-16 text-center animate-fade-in">
            {tab === 'active' ? (
              <>
                <FiCheckCircle className="mx-auto mb-3 text-emerald-500" size={40} />
                <p className="text-lg font-medium text-white">All Clear</p>
                <p className="mt-1 text-sm text-slate-500">No active alerts. All workers are safe.</p>
              </>
            ) : (
              <>
                <FiClock className="mx-auto mb-3 text-slate-600" size={40} />
                <p className="text-lg font-medium text-white">No History</p>
                <p className="mt-1 text-sm text-slate-500">Alert history will appear here once alerts are triggered.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {currentAlerts.map((alert, i) => {
              const isEmergency = alert.type === 'EMERGENCY';
              const borderColor = isEmergency
                ? 'border-rose-500/40'
                : alert.resolved
                ? 'border-slate-700/40'
                : 'border-amber-500/30';

              return (
                <div
                  key={alert._id || i}
                  className={`rounded-2xl border ${borderColor} bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/80 ${
                    isEmergency && !alert.resolved ? 'animate-pulse-alert' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isEmergency ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        <FiAlertTriangle size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{alert.helmetId}</span>
                          <AlertBadge type={alert.type} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          <FiClock className="mr-1 inline" size={10} />
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {alert.resolved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        <FiCheckCircle size={12} />
                        Resolved
                      </span>
                    )}
                  </div>
                  {alert.message && (
                    <p className="mt-3 rounded-xl bg-slate-950/50 px-3 py-2 text-sm text-slate-400">{alert.message}</p>
                  )}
                  {alert.sensorSnapshot && (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {alert.sensorSnapshot.temperature != null && (
                        <div className="rounded-lg bg-slate-950/50 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">Temp</p>
                          <p className="text-sm font-bold text-white">{alert.sensorSnapshot.temperature}°C</p>
                        </div>
                      )}
                      {alert.sensorSnapshot.mq2 != null && (
                        <div className="rounded-lg bg-slate-950/50 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">MQ2</p>
                          <p className="text-sm font-bold text-white">{alert.sensorSnapshot.mq2}</p>
                        </div>
                      )}
                      {alert.sensorSnapshot.mq135 != null && (
                        <div className="rounded-lg bg-slate-950/50 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">MQ135</p>
                          <p className="text-sm font-bold text-white">{alert.sensorSnapshot.mq135}</p>
                        </div>
                      )}
                      {alert.sensorSnapshot.humidity != null && (
                        <div className="rounded-lg bg-slate-950/50 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">Humidity</p>
                          <p className="text-sm font-bold text-white">{alert.sensorSnapshot.humidity}%</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Alerts;
