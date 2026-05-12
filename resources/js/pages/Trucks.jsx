import { useState, useEffect } from 'react'
import { Plus, Truck, Fuel, User, MapPin, Download, MoreVertical, Wrench, CheckCircle } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function Trucks() {
  const [trucks,    setTrucks]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [editTruck, setEditTruck] = useState(null)
  const [search,    setSearch]    = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState({
    plate_number: '', model: '', capacity_tons: '', driver_name: '', year: '', depot: ''
  })

  const loadTrucks = async () => {
    try {
      const res = await api.get('/trucks')
      setTrucks(res.data.data || res.data)
    } catch {
      toast.error('Failed to load trucks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTrucks() }, [])

  const openAdd = () => {
    setEditTruck(null)
    setForm({ plate_number: '', model: '', capacity_tons: '', driver_name: '', year: '', depot: '' })
    setShowForm(true)
  }

  const openEdit = (truck) => {
    setEditTruck(truck)
    setForm({
      plate_number: truck.plate_number,
      model: truck.model,
      capacity_tons: truck.capacity_tons,
      driver_name: truck.driver_name || '',
      year: truck.year || '',
      depot: truck.depot || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editTruck) {
        await api.put(`/trucks/${editTruck.id}`, form)
        toast.success('Truck updated successfully')
      } else {
        await api.post('/trucks', form)
        toast.success('Truck registered! Added to fleet.')
      }
      setShowForm(false)
      loadTrucks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/trucks/${id}`, { status })
      toast.success(`Truck marked as ${status.replace('_', ' ')}`)
      loadTrucks()
    } catch {
      toast.error('Update failed')
    }
  }

  const updateFuel = async (id, fuel_level) => {
    try {
      await api.put(`/trucks/${id}`, { fuel_level })
      toast.success('Fuel level updated')
      loadTrucks()
    } catch {
      toast.error('Update failed')
    }
  }

  const deleteTruck = async (id) => {
    if (!confirm('Remove this truck from fleet?')) return
    try {
      await api.delete(`/trucks/${id}`)
      toast.success('Truck removed from fleet')
      loadTrucks()
    } catch {
      toast.error('Delete failed')
    }
  }

  const exportCSV = () => {
    const headers = ['Plate', 'Model', 'Capacity', 'Driver', 'Status', 'Fuel %']
    const rows = trucks.map(t => [t.plate_number, t.model, t.capacity_tons, t.driver_name || '', t.status, t.fuel_level])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = `fleet-${Date.now()}.csv`
    a.click()
    toast.success('Fleet exported')
  }

  const filtered = Array.isArray(trucks) ? trucks.filter(t => {
    const mQ = !search || t.plate_number?.toLowerCase().includes(search.toLowerCase()) || t.model?.toLowerCase().includes(search.toLowerCase()) || (t.driver_name || '').toLowerCase().includes(search.toLowerCase())
    const mS = !statusFilter || t.status === statusFilter
    return mQ && mS
  }) : []

  const stats = {
    total:       Array.isArray(trucks) ? trucks.length : 0,
    idle:        Array.isArray(trucks) ? trucks.filter(t => t.status === 'idle').length : 0,
    in_transit:  Array.isArray(trucks) ? trucks.filter(t => t.status === 'in_transit').length : 0,
    maintenance: Array.isArray(trucks) ? trucks.filter(t => t.status === 'maintenance').length : 0,
    capacity:    Array.isArray(trucks) ? trucks.reduce((s, t) => s + Number(t.capacity_tons || 0), 0) : 0,
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fleet Management</h1>
          <p className="text-slate-400 mt-1">{trucks.length} trucks registered</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors">
            <Download size={15} /> Export
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Add Truck
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Fleet',  value: stats.total,       color: 'text-white' },
          { label: 'Idle',         value: stats.idle,         color: 'text-slate-400' },
          { label: 'In Transit',   value: stats.in_transit,   color: 'text-blue-400' },
          { label: 'Maintenance',  value: stats.maintenance,  color: 'text-yellow-400' },
          { label: 'Total Cap.',   value: `${stats.capacity}t`, color: 'text-purple-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-800 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search plate, model, driver..."
            className="w-full bg-surface-800 border border-slate-700 rounded-lg pl-4 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-surface-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500">
          <option value="">All Status</option>
          <option value="idle">Idle</option>
          <option value="in_transit">In Transit</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Truck grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(truck => (
          <div key={truck.id} className="bg-surface-800 rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-blue-900/60 rounded-xl flex items-center justify-center">
                <Truck size={18} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={truck.status} />
                <button onClick={() => openEdit(truck)} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-white text-base">{truck.plate_number}</h3>
            <p className="text-slate-400 text-sm">{truck.model}{truck.year ? ` · ${truck.year}` : ''}</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Fuel size={13} className="text-slate-500" />
                <span>{truck.capacity_tons} tons capacity</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <User size={13} className="text-slate-500" />
                <span>{truck.driver_name || 'No driver assigned'}</span>
              </div>
              {truck.depot && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <MapPin size={13} className="text-slate-500" />
                  <span>{truck.depot}</span>
                </div>
              )}
            </div>

            {/* Fuel level */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Fuel Level</span>
                <span>{truck.fuel_level}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${truck.fuel_level > 50 ? 'bg-green-500' : truck.fuel_level > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${truck.fuel_level}%` }}
                />
              </div>
              {truck.fuel_level <= 20 && (
                <p className="text-xs text-red-400 mt-1">⚠ Low fuel — schedule refuel</p>
              )}
            </div>

            {/* Quick fuel update */}
            <div className="mt-3 flex gap-2">
              {[25, 50, 75, 100].map(level => (
                <button key={level} onClick={() => updateFuel(truck.id, level)}
                  className="flex-1 text-xs py-1 bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white rounded transition-colors">
                  {level}%
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              {truck.status !== 'maintenance' && (
                <button onClick={() => updateStatus(truck.id, 'maintenance')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/60 rounded-lg transition-colors">
                  <Wrench size={12} /> Maintenance
                </button>
              )}
              {truck.status === 'maintenance' && (
                <button onClick={() => updateStatus(truck.id, 'idle')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs bg-green-900/30 text-green-400 hover:bg-green-900/60 rounded-lg transition-colors">
                  <CheckCircle size={12} /> Set Available
                </button>
              )}
              <button onClick={() => deleteTruck(truck.id)}
                className="px-3 py-1.5 text-xs text-red-400 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors">
                Remove
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-500">
            <Truck size={40} className="mx-auto mb-3 opacity-30" />
            <p>No trucks found</p>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-800 rounded-2xl p-7 w-full max-w-md border border-slate-600">
            <h2 className="text-base font-bold text-white mb-5">{editTruck ? 'Edit Truck' : 'Register New Truck'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'plate_number',  label: 'Plate Number',    placeholder: 'LEA-2024-01', required: !editTruck },
                  { key: 'model',         label: 'Model',           placeholder: 'Volvo FH16' },
                  { key: 'capacity_tons', label: 'Capacity (tons)', placeholder: '25', type: 'number' },
                  { key: 'year',          label: 'Year',            placeholder: '2023', type: 'number' },
                  { key: 'driver_name',   label: 'Driver Name',     placeholder: 'Muhammad Ali' },
                  { key: 'depot',         label: 'Home Depot',      placeholder: 'Lahore' },
                ].map(({ key, label, placeholder, type = 'text', required = true }) => (
                  <div key={key}>
                    <label className="block text-xs text-slate-400 mb-1">{label}</label>
                    <input
                      type={type} value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-surface-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      placeholder={placeholder}
                      required={required && key !== 'driver_name' && key !== 'year' && key !== 'depot'}
                      step={type === 'number' ? '0.1' : undefined}
                      readOnly={editTruck && key === 'plate_number'}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-sm">
                  {editTruck ? 'Save Changes' : 'Register Truck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}