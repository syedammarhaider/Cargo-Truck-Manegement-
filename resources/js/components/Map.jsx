import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useWebSocket } from '../hooks/useWebSocket'

// Custom truck icon (blue marker)
const truckIcon = L.divIcon({
  html: `<div style="
    background:#0ea5e9;
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.4)
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],  // Anchor at bottom point of marker
  className: '',          // Prevent default Leaflet styles
})

// Main real-time tracking map component
export default function Map({ trucks = [], showHistory = false }) {
  // Store truck positions in a ref (mutable without re-render)
  const markersRef = useRef({})

  // Subscribe to WebSocket — update marker when GPS ping arrives
  useWebSocket((event) => {
    // event = { truck_id, lat, lng, speed, updated_at }
    if (markersRef.current[event.truck_id]) {
      // Move existing marker to new GPS position
      markersRef.current[event.truck_id].setLatLng([event.lat, event.lng])
    }
  })

  return (
    <MapContainer
      center={[30.3753, 69.3451]} // Center of Pakistan
      zoom={6}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    >
      {/* OpenStreetMap tiles — 100% free, no API key, permanent */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
        maxZoom={19}
      />

      {/* Render a marker for each truck that has a GPS position */}
      {trucks.map((location) => (
        location.latitude && (
          <Marker
            key={location.truck_id}
            position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
            icon={truckIcon}
            ref={(marker) => {
              if (marker) markersRef.current[location.truck_id] = marker // Save ref for real-time updates
            }}
          >
            {/* Popup shows truck details on click */}
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{location.truck?.plate_number}</p>
                <p className="text-gray-600">{location.truck?.model}</p>
                <p className="text-blue-600">Speed: {location.speed_kmh} km/h</p>
                <p className="text-gray-500 text-xs">Driver: {location.truck?.driver_name}</p>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  )
}
