import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getThresholds, updateThresholds } from '../services/api';
import { FiSettings, FiSave, FiCheckCircle, FiThermometer, FiWind, FiShield } from 'react-icons/fi';

const defaultThresholds = {
  temperature: 45,
  mq2: 400,
  mq135: 400,
  fsrMin: 300,
};

function Settings() {
  const [thresholds, setThresholds] = useState(defaultThresholds);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getThresholds()
      .then((res) => {
        if (res.data && typeof res.data === 'object') {
          setThresholds({ ...defaultThresholds, ...res.data });
        }
      })
      .catch(() => {
        // Use defaults if API fails
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setThresholds((prev) => ({ ...prev, [key]: Number(value) || 0 }));
    setSaved(false);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await updateThresholds(thresholds);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save thresholds.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      key: 'temperature',
      label: 'Temperature Threshold',
      unit: '°C',
      desc: 'Alert when ambient temperature exceeds this value.',
      icon: <FiThermometer size={18} />,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      min: 20,
      max: 80,
    },
    {
      key: 'mq2',
      label: 'MQ2 Gas/Smoke Threshold',
      unit: 'ppm',
      desc: 'Alert when MQ2 gas sensor reading exceeds this value.',
      icon: <FiWind size={18} />,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      min: 100,
      max: 1000,
    },
    {
      key: 'mq135',
      label: 'MQ135 Air Quality Threshold',
      unit: 'ppm',
      desc: 'Alert when MQ135 air quality reading exceeds this value.',
      icon: <FiWind size={18} />,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      min: 100,
      max: 1000,
    },
    {
      key: 'fsrMin',
      label: 'Minimum FSR Pressure',
      unit: '',
      desc: 'Helmet is considered "not properly worn" below this strap pressure.',
      icon: <FiShield size={18} />,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      min: 50,
      max: 800,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FiSettings size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Alert Thresholds</h1>
              <p className="text-sm text-slate-400">Configure when safety alerts are triggered for all helmets.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-16 text-center">
            <p className="text-slate-500">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {fields.map((field) => (
              <div
                key={field.key}
                className="rounded-2xl border border-slate-800/50 bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-slate-700/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border ${field.color}`}>
                      {field.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{field.label}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{field.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={thresholds[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      min={field.min}
                      max={field.max}
                      className="w-24 rounded-xl border border-slate-700/60 bg-slate-950/80 px-3 py-2.5 text-right text-sm font-bold text-white outline-none transition-all focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
                    />
                    {field.unit && (
                      <span className="text-sm text-slate-500">{field.unit}</span>
                    )}
                  </div>
                </div>
                {/* Range slider */}
                <div className="mt-4 px-1">
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    value={thresholds[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full cursor-pointer accent-sky-500"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-600">
                    <span>{field.min}</span>
                    <span>{field.max}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Save button */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {error && (
                  <p className="text-sm text-rose-400 animate-fade-in">{error}</p>
                )}
                {saved && (
                  <p className="flex items-center gap-1.5 text-sm text-emerald-400 animate-fade-in">
                    <FiCheckCircle size={14} />
                    Thresholds saved successfully!
                  </p>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:shadow-sky-500/40 hover:brightness-110 disabled:opacity-50"
              >
                <FiSave size={16} />
                {saving ? 'Saving...' : 'Save Thresholds'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Settings;
