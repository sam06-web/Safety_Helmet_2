import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].location.lat, points[0].location.lng], 15);
      return;
    }
    const bounds = points.map((p) => [p.location.lat, p.location.lng]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, points]);

  return null;
}

function HelmetMap({ helmets }) {
  const points = Object.values(helmets).filter((h) => h?.location);

  const center = points.length
    ? [points[0].location.lat, points[0].location.lng]
    : [12.9716, 77.5946];

  return (
    <div className="h-[420px] overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {points.map((helmet) => (
          <CircleMarker
            key={helmet.helmetId}
            center={[helmet.location.lat, helmet.location.lng]}
            radius={12}
            pathOptions={{
              color: helmet.alerts?.length ? '#f43f5e' : '#38bdf8',
              fillColor: helmet.alerts?.length ? '#fb7185' : '#7dd3fc',
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm text-slate-800">
                <div className="font-semibold">{helmet.helmetId}</div>
                <div>Temp: {helmet.temperature ?? '--'}°C</div>
                <div>Humidity: {helmet.humidity ?? '--'}%</div>
                <div>Alerts: {helmet.alerts?.length ? helmet.alerts.join(', ') : 'None'}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default HelmetMap;
