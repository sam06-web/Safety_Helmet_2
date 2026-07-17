import { Link } from 'react-router-dom';
import { FiShield, FiThermometer, FiWind, FiMapPin, FiAlertTriangle, FiZap, FiRadio } from 'react-icons/fi';

const features = [
  { icon: <FiThermometer size={24} />, title: 'Temperature Monitoring', desc: 'Real-time temperature and humidity tracking with configurable alert thresholds.', color: 'from-sky-500 to-cyan-500' },
  { icon: <FiWind size={24} />, title: 'Gas Detection', desc: 'MQ2 smoke/gas and MQ135 air quality sensors with instant hazard warnings.', color: 'from-amber-500 to-orange-500' },
  { icon: <FiShield size={24} />, title: 'PPE Compliance', desc: 'FSR-based strap pressure sensing verifies helmet is properly worn at all times.', color: 'from-violet-500 to-purple-500' },
  { icon: <FiAlertTriangle size={24} />, title: 'Emergency Alerts', desc: 'Panic button triggers instant emergency notifications to the control room.', color: 'from-rose-500 to-pink-500' },
  { icon: <FiMapPin size={24} />, title: 'GPS Tracking', desc: 'Live location tracking of workers across the industrial site.', color: 'from-emerald-500 to-teal-500' },
  { icon: <FiRadio size={24} />, title: 'Long-Range Link', desc: 'LoRa wireless module provides reliable coverage within 500m range.', color: 'from-indigo-500 to-blue-500' },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Gradient orbs background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-6 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/25">
              <FiShield size={20} />
            </div>
            <span className="text-xl font-bold text-white">SafeGuard</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:text-white">
              Log in
            </Link>
            <Link to="/signup" className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 hover:shadow-sky-500/40">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-[1200px] px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1.5 text-sm font-medium text-sky-400">
              <FiZap size={14} />
              Industrial Safety Reimagined
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Smart Helmet
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent"> Safety Platform</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Real-time PPE monitoring, gas detection, temperature tracking, and emergency alerts — all from a single dashboard. Keep every worker safe on the industrial floor.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup" className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-500/25 transition-all hover:shadow-sky-500/40 hover:brightness-110">
                Start Monitoring
              </Link>
              <Link to="/login" className="rounded-2xl border border-slate-700 bg-slate-900/50 px-8 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800/80">
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-6">
            {[{ val: '500m', label: 'Wireless Range' }, { val: '<2s', label: 'Alert Latency' }, { val: '24/7', label: 'Monitoring' }].map((s, i) => (
              <div key={i} className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 text-center backdrop-blur-sm">
                <p className="text-3xl font-bold text-white">{s.val}</p>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">Everything You Need for Worker Safety</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={i} className="group rounded-2xl border border-slate-800/50 bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-slate-700/60 hover:bg-slate-900/60">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 py-8 text-center text-sm text-slate-600">
          © 2026 SafeGuard — Smart Industrial Safety Helmet Platform
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
