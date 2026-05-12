import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import { 
  Activity, Navigation, Clock, Fuel, MapPin, TrendingUp, 
  Package, User, Phone, ArrowRight, Target, Radio 
} from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'
import api from '../api/client'
import toast from 'react-hot-toast'

// Modern truck icon with status-based styling
const makeTruckIcon = (status, heading = 0) => L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 44px;
      height: 44px;
      transform: rotate(${heading}deg);
    ">
      <div style="
        position: absolute;
        inset: 0;
        background: ${status === 'in_transit' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                     status === 'maintenance' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 
                     'linear-gradient(135deg, #64748b 0%, #475569 100%)'};
        border-radius: 50%;
        border: 3px solid #0f172a;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.1);
      "></div>
      <div style="
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M1 3h15v13H1zm15 4h3l3 3v6h-6V7zM5 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
        </svg>
      </div>
      ${status === 'in_transit' ? `
        <div style="
          position: absolute;
          top: -4px;
          right: -4px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border: 2px solid #0f172a;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        "></div>
      ` : ''}
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  className: '',
})

// Origin marker icon
const originIcon = L.divIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border: 3px solid #0f172a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: '',
})

// Destination marker icon
const destinationIcon = L.divIcon({
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
      border: 3px solid #0f172a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: '',
})

export default function Tracking() {
  const [positions, setPositions] = useState([])
  const [histories, setHistories] = useState({})
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [stats, setStats] = useState(null)
  const markersRef = useRef({})
  const mapRef = useRef(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadStats, 30000) // Refresh stats every 30s
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const res = await api.get('/tracking/all')
      setPositions(res.data)
      loadStats()
    } catch {
      toast.error('Failed to load tracking data')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await api.get('/tracking/statistics')
      setStats(res.data)
    } catch {
      console.error('Failed to load statistics')
    }
  }

  // Live GPS updates via WebSocket
  useWebSocket((event) => {
    setPositions(prev => prev.map(p =>
      p.truck_id === event.truck_id
        ? {
            ...p,
            latitude: event.lat,
            longitude: event.lng,
            speed_kmh: event.speed,
            heading: event.heading,
            address: event.address,
            distance_traveled_km: event.distance_traveled,
            distance_remaining_km: event.distance_remaining,
            estimated_arrival: event.eta,
            last_updated: event.updated_at,
          }
        : p
    ))

    // Update marker position and rotation
    if (markersRef.current[event.truck_id]) {
      const marker = markersRef.current[event.truck_id]
      marker.setLatLng([event.lat, event.lng])
      if (event.heading !== undefined) {
        marker.setIcon(makeTruckIcon(
          positions.find(p => p.truck_id === event.truck_id)?.truck?.status,
          event.heading
        ))
      }
    }

    // Append to history path
    setHistories(prev => ({
      ...prev,
      [event.truck_id]: [...(prev[event.truck_id] || []).slice(-99), [event.lat, event.lng]]
    }))
  })

  const loadHistory = async (truckId) => {
    if (histories[truckId]) return
    try {
      const res = await api.get(`/tracking/history/${truckId}`)
      const path = res.data.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)])
      setHistories(prev => ({ ...prev, [truckId]: path }))
    } catch {
      toast.error('Failed to load route history')
    }
  }

  const handleSelectTruck = (pos) => {
    const newSelected = pos.truck_id === selected ? null : pos.truck_id
    setSelected(newSelected)
    
    if (newSelected) {
      loadHistory(newSelected)
      // Center map on selected truck
      if (mapRef.current) {
        mapRef.current.flyTo([parseFloat(pos.latitude), parseFloat(pos.longitude)], 12, {
          duration: 1.5
        })
      }
    }
  }

  const filtered = positions.filter(p =>
    !filter || (p.truck?.plate_number || '').toLowerCase().includes(filter.toLowerCase())
  )

  const selectedPos = positions.find(p => p.truck_id === selected)
  const activeCount = positions.filter(p => p.truck?.status === 'in_transit').length

  const formatETA = (eta) => {
    if (!eta) return 'Calculating...'
    const date = new Date(eta)
    const now = new Date()
    const diffMs = date - now
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: "'DM Sans', system-ui, sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stat-card {
          animation: slide-in 0.4s ease-out backwards;
        }

        .stat-card:nth-child(1) { animation-delay: 0.05s; }
        .stat-card:nth-child(2) { animation-delay: 0.1s; }
        .stat-card:nth-child(3) { animation-delay: 0.15s; }
        .stat-card:nth-child(4) { animation-delay: 0.2s; }

        .truck-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .truck-card:hover {
          transform: translateX(4px);
        }

        .status-dot {
          animation: pulse 2s ease-in-out infinite;
        }

        .leaflet-container {
          background: #0f172a !important;
        }

        .data-value {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/30">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
                Fleet Command Center
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="status-dot w-2 h-2 bg-emerald-400 rounded-full" />
                  <span className="font-medium">System Operational</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  {activeCount} of {positions.length} vehicles in transit
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Radio size={14} />
                  Real-time tracking active
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-sm mb-1">Local Time</div>
              <div className="text-white font-semibold text-lg data-value">
                {new Date().toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                  <Activity className="text-emerald-400" size={20} />
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 text-xs font-medium uppercase tracking-wider">Active Fleet</div>
                  <div className="text-white text-3xl font-bold data-value mt-1">{stats.active_trucks}</div>
                </div>
              </div>
              <div className="text-slate-400 text-sm">
                {stats.idle_trucks} idle • {stats.maintenance_trucks} maintenance
              </div>
            </div>

            <div className="stat-card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                  <TrendingUp className="text-blue-400" size={20} />
                </div>
                <div className="text-right">
                  <div className="text-blue-400 text-xs font-medium uppercase tracking-wider">Avg Speed</div>
                  <div className="text-white text-3xl font-bold data-value mt-1">
                    {stats.average_speed?.toFixed(0) || 0}
                  </div>
                </div>
              </div>
              <div className="text-slate-400 text-sm">kilometers per hour</div>
            </div>

            <div className="stat-card bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-purple-500/10 rounded-xl">
                  <Navigation className="text-purple-400" size={20} />
                </div>
                <div className="text-right">
                  <div className="text-purple-400 text-xs font-medium uppercase tracking-wider">Today's Distance</div>
                  <div className="text-white text-3xl font-bold data-value mt-1">
                    {stats.total_distance_today?.toFixed(0) || 0}
                  </div>
                </div>
              </div>
              <div className="text-slate-400 text-sm">kilometers traveled</div>
            </div>

            <div className="stat-card bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl">
                  <Package className="text-amber-400" size={20} />
                </div>
                <div className="text-right">
                  <div className="text-amber-400 text-xs font-medium uppercase tracking-wider">Total Fleet</div>
                  <div className="text-white text-3xl font-bold data-value mt-1">{stats.total_trucks}</div>
                </div>
              </div>
              <div className="text-slate-400 text-sm">registered vehicles</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Search */}
            <div className="relative">
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Search by plate number..."
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </div>

            {/* Selected Truck Detail */}
            {selectedPos && (
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/30 rounded-2xl p-5 backdrop-blur-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-bold text-lg mb-1">
                      {selectedPos.truck?.plate_number}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {selectedPos.truck?.model}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-slate-400 hover:text-white transition-colors p-1"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                {/* Driver Info */}
                {selectedPos.truck?.driver && (
                  <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl border border-slate-700/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {selectedPos.truck.driver.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">
                        {selectedPos.truck.driver.name}
                      </div>
                      <div className="text-slate-400 text-xs flex items-center gap-1">
                        <Phone size={10} />
                        {selectedPos.truck.driver.phone}
                      </div>
                    </div>
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                      <Activity size={12} />
                      <span className="text-xs font-medium uppercase tracking-wider">Speed</span>
                    </div>
                    <div className="text-white text-xl font-bold data-value">
                      {selectedPos.speed_kmh}
                    </div>
                    <div className="text-slate-500 text-xs">km/h</div>
                  </div>

                  <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
                    <div className="flex items-center gap-2 text-amber-400 mb-1">
                      <Fuel size={12} />
                      <span className="text-xs font-medium uppercase tracking-wider">Fuel</span>
                    </div>
                    <div className="text-white text-xl font-bold data-value">
                      {selectedPos.truck?.fuel_level || 0}
                    </div>
                    <div className="text-slate-500 text-xs">percent</div>
                  </div>
                </div>

                {/* Route Progress */}
                {selectedPos.route && (
                  <div className="space-y-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                    
                    {/* Origin */}
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-1.5 bg-blue-500/20 rounded-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <div className="text-blue-400 text-xs font-medium mb-0.5">Origin</div>
                        <div className="text-slate-300 text-sm leading-tight">
                          {selectedPos.route.origin.address || 'Starting Point'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 pl-2">
                      <div className="flex-1">
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${selectedPos.route.progress_percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">
                            {selectedPos.distance_traveled_km?.toFixed(1)} km traveled
                          </span>
                          <span className="text-xs text-slate-400">
                            {selectedPos.distance_remaining_km?.toFixed(1)} km remaining
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-1.5 bg-pink-500/20 rounded-lg">
                        <Target size={12} className="text-pink-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-pink-400 text-xs font-medium">Destination</span>
                          {selectedPos.estimated_arrival && (
                            <span className="px-2 py-0.5 bg-pink-500/20 rounded text-pink-400 text-xs font-medium data-value">
                              ETA {formatETA(selectedPos.estimated_arrival)}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-300 text-sm leading-tight">
                          {selectedPos.route.destination.address || 'Delivery Point'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Location */}
                <div className="pt-3 border-t border-slate-700/30">
                  <div className="text-slate-400 text-xs mb-2 flex items-center gap-1.5">
                    <MapPin size={12} />
                    Current Location
                  </div>
                  <div className="text-slate-300 text-sm">
                    {selectedPos.address || `${parseFloat(selectedPos.latitude).toFixed(5)}, ${parseFloat(selectedPos.longitude).toFixed(5)}`}
                  </div>
                  <div className="text-slate-500 text-xs mt-2">
                    Last updated: {selectedPos.last_updated ? new Date(selectedPos.last_updated).toLocaleTimeString() : 'Unknown'}
                  </div>
                </div>
              </div>
            )}

            {/* Truck List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {filtered.map(pos => (
                <div
                  key={pos.truck_id}
                  onClick={() => handleSelectTruck(pos)}
                  className={`truck-card rounded-xl p-4 border cursor-pointer backdrop-blur-sm ${
                    selected === pos.truck_id
                      ? 'bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900/40 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-white text-sm">
                      {pos.truck?.plate_number}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      pos.truck?.status === 'in_transit' 
                        ? 'bg-emerald-400 status-dot' 
                        : 'bg-slate-500'
                    }`} />
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-3">
                    {pos.truck?.model}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-400 font-medium data-value">
                      {pos.speed_kmh} km/h
                    </span>
                    {pos.route && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <ArrowRight size={10} />
                        {pos.route.progress_percentage.toFixed(0)}% complete
                      </span>
                    )}
                  </div>

                  {pos.truck?.driver && (
                    <div className="mt-2 pt-2 border-t border-slate-700/30 text-xs text-slate-500 truncate">
                      {pos.truck.driver.name}
                    </div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No trucks found
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm" style={{ height: '800px' }}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-slate-400 text-sm">Initializing map system...</div>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={[30.3753, 69.3451]}
                  zoom={6}
                  className="w-full h-full"
                  ref={mapRef}
                  style={{ background: '#0f172a' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                    maxZoom={19}
                  />
                  
                  {/* Render all truck markers */}
                  {positions.map(pos => pos.latitude && (
                    <Marker
                      key={pos.truck_id}
                      position={[parseFloat(pos.latitude), parseFloat(pos.longitude)]}
                      icon={makeTruckIcon(pos.truck?.status, pos.heading || 0)}
                      ref={m => { if (m) markersRef.current[pos.truck_id] = m }}
                      eventHandlers={{ click: () => handleSelectTruck(pos) }}
                    >
                      <Popup>
                        <div className="font-sans text-sm min-w-[200px]">
                          <div className="font-bold text-base mb-1">{pos.truck?.plate_number}</div>
                          <div className="text-gray-600 text-xs mb-2">{pos.truck?.model}</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Speed:</span>
                              <span className="font-semibold text-blue-600">{pos.speed_kmh} km/h</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Fuel:</span>
                              <span className="font-semibold">{pos.truck?.fuel_level}%</span>
                            </div>
                            {pos.truck?.driver && (
                              <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                                <span className="text-gray-500">Driver:</span>
                                <span className="font-medium">{pos.truck.driver.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Render origin and destination markers for selected truck */}
                  {selectedPos?.route && (
                    <>
                      {/* Origin marker */}
                      <Marker
                        position={[selectedPos.route.origin.lat, selectedPos.route.origin.lng]}
                        icon={originIcon}
                      >
                        <Popup>
                          <div className="font-sans text-sm">
                            <div className="font-bold text-blue-600 mb-1">Origin</div>
                            <div className="text-gray-700">
                              {selectedPos.route.origin.address || 'Starting Point'}
                            </div>
                          </div>
                        </Popup>
                      </Marker>

                      {/* Destination marker */}
                      <Marker
                        position={[selectedPos.route.destination.lat, selectedPos.route.destination.lng]}
                        icon={destinationIcon}
                      >
                        <Popup>
                          <div className="font-sans text-sm">
                            <div className="font-bold text-pink-600 mb-1">Destination</div>
                            <div className="text-gray-700">
                              {selectedPos.route.destination.address || 'Delivery Point'}
                            </div>
                            {selectedPos.estimated_arrival && (
                              <div className="text-xs text-gray-500 mt-2">
                                ETA: {formatETA(selectedPos.estimated_arrival)}
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>

                      {/* Route lines */}
                      {/* Line from origin to current position */}
                      <Polyline
                        positions={[
                          [selectedPos.route.origin.lat, selectedPos.route.origin.lng],
                          [parseFloat(selectedPos.latitude), parseFloat(selectedPos.longitude)]
                        ]}
                        pathOptions={{
                          color: '#10b981',
                          weight: 4,
                          opacity: 0.7,
                          dashArray: '10, 10'
                        }}
                      />

                      {/* Line from current position to destination */}
                      <Polyline
                        positions={[
                          [parseFloat(selectedPos.latitude), parseFloat(selectedPos.longitude)],
                          [selectedPos.route.destination.lat, selectedPos.route.destination.lng]
                        ]}
                        pathOptions={{
                          color: '#ec4899',
                          weight: 4,
                          opacity: 0.5,
                          dashArray: '15, 15'
                        }}
                      />

                      {/* Radius circle around current position */}
                      <Circle
                        center={[parseFloat(selectedPos.latitude), parseFloat(selectedPos.longitude)]}
                        radius={5000}
                        pathOptions={{
                          color: '#3b82f6',
                          fillColor: '#3b82f6',
                          fillOpacity: 0.05,
                          weight: 1,
                          opacity: 0.3
                        }}
                      />
                    </>
                  )}

                  {/* Historical path for selected truck */}
                  {selected && histories[selected] && histories[selected].length > 1 && (
                    <Polyline
                      positions={histories[selected]}
                      pathOptions={{
                        color: '#06b6d4',
                        weight: 2,
                        opacity: 0.4,
                        dashArray: '5, 8'
                      }}
                    />
                  )}
                </MapContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.8);
        }
      `}</style>
    </div>
  )
}