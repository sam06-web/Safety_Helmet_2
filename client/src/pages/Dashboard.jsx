import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HelmetCard from '../components/HelmetCard';
import StatCard from '../components/StatCard';
import AlertBadge from '../components/AlertBadge';
import { getLatestReadings } from '../services/api';
import socket from '../services/socket';
import { FiHardDrive, FiWifi, FiAlertTriangle, FiThermometer, FiClock, FiMapPin, FiActivity } from 'react-icons/fi';

function Dashboard() {
  const [helmets, setHelmets] = useState({});
  const [onlineSet, setOnlineSet] = useState(new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [alertFeed, setAlertFeed] = useState([]);

  // Load initial data from REST
  useEffect(() => {
    getLatestReadings()
      .then((res) => {
        const map = {};
        res.data.forEach((r) => {
          map[r.helmetId] = r;
        });
        setHelmets(map);
        setOnlineSet(new Set(Object.keys(map)));
      })
      .catch(console.error);
  }, []);

  // Socket.io listeners
  useEffect(() => {
    function onUpdate(data) {
      setHelmets((prev) => ({ ...prev, [data.helmetId]: data }));
      setOnlineSet((prev) => new Set([...prev, data.helmetId]));

      if (data.alerts && data.alerts.length > 0) {
        setAlertFeed((prev) => [
          { helmetId: data.helmetId, alerts: data.alerts, timestamp: data.timestamp, id: Date.now() + Math.random() },
          ...prev
        ].slice(0, 50));
      }
    }

    function onOffline(data) {
      setOnlineSet((prev) => {
        const next = new Set(prev);
        next.delete(data.helmetId);
        return next;
      });
    }

    socket.on('helmet-update', onUpdate);
    socket.on('helmet-offline', onOffline);

    return () => {
      socket.off('helmet-update', onUpdate);
      socket.off('helmet-offline', onOffline);
    };
  }, []);

  const helmetList = Object.values(helmets);
  const onlineCount = onlineSet.size;
  const alertCount = helmetList.filter((h) => h.alerts?.length > 0).length;
  const avgTemp = helmetList.length
    ? (helmetList.reduce((sum, h) => sum + (h.temperature || 0), 0) / helmetList.length).toFixed(1)
    : '--';

  const selected = selectedId ? helmets[selectedId] : null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {/* Overview Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<FiHardDrive size={18} />} label="Total Helmets" value={helmetList.length} color="sky" />
          <StatCard icon={<FiWifi size={18} />} label="Online" value={onlineCount} color="emerald" subtitle="Connected now" />
          <StatCard icon={<FiAlertTriangle size={18} />} label="Active Alerts" value={alertCount} color={alertCount > 0 ? 'rose' : 'amber'} />
          <StatCard icon={<FiThermometer size={18} />} label="Avg Temperature" value={`${avgTemp}°C`} color="sky" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          {/* Left: Helmet Grid */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Worker Helmets</h2>
            {helmetList.length === 0 ? (
              <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-12 text-center">
                <FiActivity className="mx-auto mb-3 text-slate-600" size={40} />
                <p className="text-slate-400">No helmet data received yet.</p>
                <p className="mt-1 text-sm text-slate-600">Start the simulator or connect hardware to see live data.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {helmetList.map((h) => (
                  <HelmetCard
                    key={h.helmetId}
                    data={h}
                    isOnline={onlineSet.has(h.helmetId)}
                    isSelected={selectedId === h.helmetId}
                    onClick={() => setSelectedId(selectedId === h.helmetId ? null : h.helmetId)}
                  />
                ))}
              </div>
            )}

            {/* Selected detail panel */}
            {selected && (
              <div className="mt-6 rounded-2xl border border-sky-500/30 bg-slate-900/60 p-6 backdrop-blur-sm animate-slide-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Details — {selected.helmetId}</h3>
                  <button onClick={() => setSelectedId(null)} className="text-sm text-slate-500 hover:text-slate-300 transition">Close</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500 mb-1">Temperature</p>
                    <p className="text-2xl font-bold text-white">{selected.temperature ?? '--'}°C</p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500 mb-1">Humidity</p>
                    <p className="text-2xl font-bold text-white">{selected.humidity ?? '--'}%</p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500 mb-1">MQ2 (Gas/Smoke)</p>
                    <p className={`text-2xl font-bold ${(selected.mq2 || 0) > 400 ? 'text-amber-400' : 'text-white'}`}>{selected.mq2 ?? '--'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500 mb-1">MQ135 (Air Quality)</p>
                    <p className={`text-2xl font-bold ${(selected.mq135 || 0) > 400 ? 'text-amber-400' : 'text-white'}`}>{selected.mq135 ?? '--'}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  <div className="rounded-xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500 mb-1">FSR1</p>
                    <p className="text-xl font-bold text-white">{selected.fsr1 ?? '--'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500 mb-1">FSR2</p>
                    <p className="text-xl font-bold text-white">{selected.fsr2 ?? '--'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500 mb-1">FSR3</p>
                    <p className="text-xl font-bold text-white">{selected.fsr3 ?? '--'}</p>
                  </div>
                </div>
                {selected.location && (
                  <div className="mt-4 rounded-xl bg-slate-950/60 p-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <FiMapPin size={14} />
                      <span className="text-xs">GPS Location</span>
                      {selected.locationStale && <span className="text-xs text-amber-500">(stale)</span>}
                    </div>
                    <p className="mt-1 text-sm font-mono text-white">
                      {selected.location.lat?.toFixed(6)}, {selected.location.lng?.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Alert Feed */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Live Alert Feed</h2>
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-4 backdrop-blur-sm">
              {alertFeed.length === 0 ? (
                <div className="py-8 text-center">
                  <FiAlertTriangle className="mx-auto mb-2 text-slate-700" size={28} />
                  <p className="text-sm text-slate-500">No alerts yet</p>
                </div>
              ) : (
                <div className="max-h-[600px] space-y-2.5 overflow-y-auto pr-1">
                  {alertFeed.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-800/50 bg-slate-950/60 px-3.5 py-3 animate-slide-in">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-300">{item.helmetId}</span>
                        <span className="text-[10px] text-slate-600">
                          <FiClock className="inline mr-1" size={10} />
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.alerts.map((a, i) => (
                          <AlertBadge key={i} type={a} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
