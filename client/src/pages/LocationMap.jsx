import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HelmetMap from '../components/HelmetMap';
import { getLatestReadings, getLatestLocations } from '../services/api';
import socket from '../services/socket';
import { FiMapPin, FiWifi, FiActivity } from 'react-icons/fi';

function LocationMapPage() {
  const [helmets, setHelmets] = useState({});
  const [onlineSet, setOnlineSet] = useState(new Set());

  useEffect(() => {
    Promise.all([getLatestReadings(), getLatestLocations()])
      .then(([readingsRes, locationsRes]) => {
        const map = {};
        readingsRes.data.forEach((r) => {
          map[r.helmetId] = r;
        });

        locationsRes.data.forEach((loc) => {
          map[loc.helmetId] = {
            ...(map[loc.helmetId] || {}),
            helmetId: loc.helmetId,
            location: { lat: loc.lat, lng: loc.lng },
            locationStale: loc.locationStale,
          };
        });

        setHelmets(map);
        setOnlineSet(new Set(Object.keys(map)));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    function onUpdate(data) {
      setHelmets((prev) => ({ ...prev, [data.helmetId]: data }));
      setOnlineSet((prev) => new Set([...prev, data.helmetId]));
    }

    function onLocation(data) {
      setHelmets((prev) => ({
        ...prev,
        [data.helmetId]: {
          ...(prev[data.helmetId] || {}),
          helmetId: data.helmetId,
          location: { lat: data.lat, lng: data.lng },
          locationStale: data.locationStale,
        },
      }));
    }

    function onOffline(data) {
      setOnlineSet((prev) => {
        const next = new Set(prev);
        next.delete(data.helmetId);
        return next;
      });
    }

    socket.on('helmet-update', onUpdate);
    socket.on('location-update', onLocation);
    socket.on('helmet-offline', onOffline);

    return () => {
      socket.off('helmet-update', onUpdate);
      socket.off('location-update', onLocation);
      socket.off('helmet-offline', onOffline);
    };
  }, []);

  const helmetList = Object.values(helmets);
  const locatedHelmets = helmetList.filter((h) => h.location);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Helmet Location Map</h1>
            <p className="mt-1 text-sm text-slate-400">Live helmet positions shown as circular map markers.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
            <FiMapPin className="text-sky-400" />
            <span>{locatedHelmets.length} located helmets</span>
            <span className="mx-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{onlineSet.size} online</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-3 backdrop-blur-sm">
            <HelmetMap helmets={helmets} />
          </div>

          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-300">
              <FiWifi className="text-emerald-400" />
              <h2 className="text-lg font-semibold">Helmet Status</h2>
            </div>
            {helmetList.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/60 text-center text-slate-500">
                <FiActivity className="mb-2" size={24} />
                <p>No helmet data yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {helmetList.map((helmet) => (
                  <div key={helmet.helmetId} className="rounded-xl border border-slate-800/50 bg-slate-950/60 px-3 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{helmet.helmetId}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${onlineSet.has(helmet.helmetId) ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700/60 text-slate-400'}`}>
                        {onlineSet.has(helmet.helmetId) ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      {helmet.location ? `Lat: ${helmet.location.lat.toFixed(5)} · Lng: ${helmet.location.lng.toFixed(5)}` : 'No location yet'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default LocationMapPage;
