import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon path issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ location, setLocation }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      setLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], map.getZoom());
    }
  }, [location, map]);

  return location === null ? null : (
    <Marker position={[location.latitude, location.longitude]} />
  );
}

export default function LocationPickerMap({ location, setLocation }) {
  // Default center: Delhi
  const defaultCenter = [28.6139, 77.2090];
  const center = location ? [location.latitude, location.longitude] : defaultCenter;

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker location={location} setLocation={setLocation} />
      </MapContainer>
    </div>
  );
}
