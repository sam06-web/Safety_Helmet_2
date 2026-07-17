import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AlertBadge from '../components/AlertBadge';
import { getLatestReadings, getHelmetHistory } from '../services/api';
import { FiClock, FiChevronDown } from 'react-icons/fi';

function History() {
  const [helmetIds, setHelmetIds] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLatestReadings()
      .then((res) => {
        const ids = res.data.map((r) => r.helmetId);
        setHelmetIds(ids);
        if (ids.length > 0) setSelectedId(ids[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    getHelmetHistory(selectedId)
      .then((res) => setReadings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Sensor History</h1>
            <p className="mt-1 text-sm text-slate-400">Last 100 readings for the selected helmet.</p>
          </div>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="appearance-none rounded-xl border border-slate-700/60 bg-slate-900/80 py-2.5 pl-4 pr-10 text-sm text-white outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
            >
              {helmetIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/80">
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-400">Time</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-400">Temp °C</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-400">Humidity %</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-400">MQ2</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-400">MQ135</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-400">Helmet</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-400">Alerts</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">Loading history...</td>
                  </tr>
                ) : readings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      <FiClock className="mx-auto mb-2 text-slate-700" size={28} />
                      <p>No history data available.</p>
                    </td>
                  </tr>
                ) : (
                  readings.map((r, i) => (
                    <tr key={i} className="border-b border-slate-800/30 transition-colors hover:bg-slate-800/20">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                        {new Date(r.timestamp).toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 font-medium ${(r.temperature || 0) > 45 ? 'text-rose-400' : 'text-white'}`}>
                        {r.temperature ?? '--'}
                      </td>
                      <td className="px-4 py-3 text-white">{r.humidity ?? '--'}</td>
                      <td className={`px-4 py-3 font-medium ${(r.mq2 || 0) > 400 ? 'text-amber-400' : 'text-white'}`}>
                        {r.mq2 ?? '--'}
                      </td>
                      <td className={`px-4 py-3 font-medium ${(r.mq135 || 0) > 400 ? 'text-amber-400' : 'text-white'}`}>
                        {r.mq135 ?? '--'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.helmetWorn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                          {r.helmetWorn ? 'Worn' : 'Off'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.alerts && r.alerts.length > 0
                            ? r.alerts.map((a, j) => <AlertBadge key={j} type={a} />)
                            : <span className="text-xs text-slate-600">—</span>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default History;
