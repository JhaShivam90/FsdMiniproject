/**
 * components/ComplaintsMap.jsx — Leaflet map showing complaint locations
 * Each pin is colored by status: red=open, yellow=assigned, green=resolved
 */

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import StatusBadge from './StatusBadge';

// Fix Leaflet default icon path issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored circle markers for each status
const createIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width: 16px; height: 16px;
    background: ${color};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 8px ${color}80;
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const statusColors = {
  open: '#ef4444',
  assigned: '#f59e0b',
  resolved: '#22c55e',
};

export default function ComplaintsMap({ complaints }) {
  // Default center: India
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // Center on first complaint if available
  const center = complaints.length > 0
    ? [complaints[0].location.latitude, complaints[0].location.longitude]
    : defaultCenter;

  const zoom = complaints.length > 0 ? 13 : defaultZoom;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '450px', width: '100%' }}
      className="rounded-2xl"
    >
      {/* OpenStreetMap tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Plot each complaint as a colored marker */}
      {complaints.map((c) => (
        <Marker
          key={c._id}
          position={[c.location.latitude, c.location.longitude]}
          icon={createIcon(statusColors[c.status] || '#ef4444')}
        >
          <Popup>
            <div className="min-w-[200px]">
              <img
                src={c.imageUrl}
                alt="Garbage"
                style={{ width: '100%', borderRadius: '6px', marginBottom: '8px' }}
              />
              <div style={{ marginBottom: '4px' }}>
                <strong>{c.userName || 'User'}</strong>
              </div>
              {c.location.address && (
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  📍 {c.location.address}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#888' }}>
                {new Date(c.createdAt).toLocaleDateString()}
              </div>
              <div style={{ marginTop: '6px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: statusColors[c.status] + '20',
                  color: statusColors[c.status],
                  border: `1px solid ${statusColors[c.status]}40`
                }}>
                  {c.status.toUpperCase()}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
