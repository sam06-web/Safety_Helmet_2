import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShield, FiGrid, FiClock, FiAlertTriangle, FiSettings, FiLogOut, FiMenu, FiX, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiGrid size={16} /> },
    { to: '/location', label: 'Location Map', icon: <FiMapPin size={16} /> },
    { to: '/history', label: 'History', icon: <FiClock size={16} /> },
    { to: '/alerts', label: 'Alerts', icon: <FiAlertTriangle size={16} /> },
    { to: '/settings', label: 'Settings', icon: <FiSettings size={16} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/20">
            <FiShield size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">HELMSECURE</h1>
            <p className="-mt-0.5 text-[10px] font-medium uppercase tracking-widest text-slate-500">Helmet Monitor</p>
          </div>
        </Link>

        {/* Desktop nav */}
        {user && (
          <div className="hidden items-center gap-1.5 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-sky-500/15 text-sky-400 shadow-sm shadow-sky-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-300">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700/50 px-3 py-2 text-sm text-slate-400 transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
              >
                <FiLogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white">
                Log in
              </Link>
              <Link to="/signup" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400">
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          {user && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 md:hidden"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && mobileOpen && (
        <div className="border-t border-slate-800/50 bg-slate-950/95 px-4 py-3 backdrop-blur-xl md:hidden animate-fade-in">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive(link.to) ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
