import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Package, Download, Filter, Eye, FileText } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import api from '../api/client'
import toast from 'react-hot-toast'

const STATUS_FLOW = { pending: 'dispatched', dispatched: 'in_transit', in_transit: 'delivered' }
const STATUS_LABELS = { pending: 'Dispatch', dispatched: 'Mark In Transit', in_transit: 'Mark Delivered' }
const STATUS_COLORS = {
  pending:    'bg-slate-700/60 text-slate-300 hover:bg-slate-700',
  dispatched: 'bg-purple-900/40 text-purple-400 hover:bg-purple-900/70',
  in_transit: 'bg-green-900/40 text-green-400 hover:bg-green-900/70',
}

export default function Shipments() {
  const [shipments, setShipments] = useState([])
  const [trucks,    setTrucks]    = useState([])
  const [customers, setCustomers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [selected,  setSelected]  = useState(null)   // Detail view
  const [search,    setSearch]    = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})
  const [form, setForm] = useState({
    truck_id: '', user_id: '', origin: '', destination: '',
    weight_kg: '', volume_m3: '', price: '', notes: '', priority: 'standard'
  })

  const loadAll = useCallback(async () => {
    try {
      const [sRes, tRes, cRes] = await Promise.all([
        api.get('/shipments', { params: { search, status: statusFilter, page } }),
        api.get('/trucks'),
        api.get('/customers'),
      ])
      const sData = sRes.data
      setShipments(sData.data || sData)
      setMeta(sData.meta || {})
      setTrucks((tRes.data.data || tRes.data).filter(t => t.status === 'idle'))
      setCustomers(cRes.data.data || cRes.data)
    } catch {
      toast.error('Failed to load shipments')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => { loadAll() }, [loadAll])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/shipments', form)
      toast.success('Shipment booked! Confirmation email sent.')
      setShowForm(false)
      setForm({ truck_id: '', user_id: '', origin: '', destination: '', weight_kg: '', volume_m3: '', price: '', notes: '', priority: 'standard' })
      loadAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/shipments/${id}/status`, { status })
      toast.success(`Status updated to ${status.replace('_', ' ')}`)
      loadAll()
    } catch {
      toast.error('Status update failed')
    }
  }

  const cancelShipment = async (id) => {
    if (!confirm('Cancel this shipment?')) return
    try {
      await api.patch(`/shipments/${id}/status`, { status: 'cancelled' })
      toast.success('Shipment cancelled')
      loadAll()
    } catch {
      toast.error('Failed to cancel')
    }
  }

  const exportCSV = () => {
    if (!Array.isArray(shipments)) return
    const headers = ['Tracking', 'Customer', 'Origin', 'Destination', 'Weight (kg)', 'Price (PKR)', 'Status']
    const rows = shipments.map(s => [
      s.tracking_number, s.customer?.name, s.origin, s.destination,
      s.weight_kg, s.price, s.status
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = `shipments-${Date.now()}.csv`
    a.click()
    toast.success('Exported to CSV')
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
          <h1 className="text-2xl font-bold text-white">Shipments</h1>
          <p className="text-slate-400 mt-1">{meta?.total || shipments.length} total orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 px-3 py-2 rounded-lg text-sm transition-colors">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> New Shipment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search tracking number..."
            className="w-full bg-surface-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="bg-surface-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
        >
          <option value="">All Status</option>
          {['pending','dispatched','in_transit','delivered','cancelled'].map(s => (
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Pending',    count: Array.isArray(shipments) ? shipments.filter(s=>s.status==='pending').length : 0,    color: 'text-slate-400' },
          { label: 'Dispatched', count: Array.isArray(shipments) ? shipments.filter(s=>s.status==='dispatched').length : 0, color: 'text-purple-400' },
          { label: 'In Transit', count: Array.isArray(shipments) ? shipments.filter(s=>s.status==='in_transit').length : 0, color: 'text-blue-400' },
          { label: 'Delivered',  count: Array.isArray(shipments) ? shipments.filter(s=>s.status==='delivered').length : 0,  color: 'text-green-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-surface-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className={`font-semibold ${color}`}>{count}</span>
            <span className="text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {['Tracking #', 'Customer', 'Route', 'Weight', 'Price', 'Priority', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {Array.isArray(shipments) ? shipments.map(s => (
              <tr key={s.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-mono text-sm text-brand-400">{s.tracking_number}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.truck?.plate_number}</p>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-300">{s.customer?.name}</td>
                <td className="px-5 py-3.5">
                  <p className="text-sm text-white">{s.origin}</p>
                  <p className="text-xs text-slate-400">→ {s.destination}</p>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-300">{Number(s.weight_kg).toLocaleString()} kg</td>
                <td className="px-5 py-3.5 text-sm text-white font-medium">PKR {Number(s.price).toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${s.priority === 'urgent' ? 'bg-red-900/40 text-red-400' : s.priority === 'express' ? 'bg-orange-900/40 text-orange-400' : 'bg-slate-700/60 text-slate-400'}`}>
                    {s.priority || 'standard'}
                  </span>
                </td>
                <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    {STATUS_FLOW[s.status] && (
                      <button
                        onClick={() => updateStatus(s.id, STATUS_FLOW[s.status])}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${STATUS_COLORS[s.status]}`}
                      >
                        {STATUS_LABELS[s.status]}
                      </button>
                    )}
                    <button onClick={() => setSelected(s)} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                      <Eye size={14} />
                    </button>
                    {s.status === 'delivered' && (
                      <button className="p-1.5 text-slate-500 hover:text-brand-400 transition-colors" title="Invoice">
                        <FileText size={14} />
                      </button>
                    )}
                    {['pending','dispatched'].includes(s.status) && (
                      <button onClick={() => cancelShipment(s.id)} className="text-xs px-2 py-1 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : null}
          </tbody>
        </table>
        {(!Array.isArray(shipments) || shipments.length === 0) && (
          <div className="text-center py-16 text-slate-500">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No shipments found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta?.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Page {meta.current_page} of {meta.last_page}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-surface-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:border-slate-500 transition-colors">Prev</button>
            <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-surface-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:border-slate-500 transition-colors">Next</button>
          </div>
        </div>
      )}

      {/* Detail side panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-96 bg-surface-800 border-l border-slate-700 z-50 p-6 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white">Shipment Details</h2>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
          </div>
          <div className="space-y-4 text-sm">
            <div><p className="text-slate-400 text-xs mb-1">Tracking Number</p><p className="font-mono text-brand-400">{selected.tracking_number}</p></div>
            <div><p className="text-slate-400 text-xs mb-1">Route</p><p className="text-white">{selected.origin} → {selected.destination}</p></div>
            <div><p className="text-slate-400 text-xs mb-1">Customer</p><p className="text-white">{selected.customer?.name}</p></div>
            <div><p className="text-slate-400 text-xs mb-1">Truck</p><p className="text-white">{selected.truck?.plate_number} — {selected.truck?.model}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-slate-400 text-xs mb-1">Weight</p><p className="text-white">{Number(selected.weight_kg).toLocaleString()} kg</p></div>
              <div><p className="text-slate-400 text-xs mb-1">Volume</p><p className="text-white">{selected.volume_m3 || '—'} m³</p></div>
            </div>
            <div><p className="text-slate-400 text-xs mb-1">Price</p><p className="text-white font-medium">PKR {Number(selected.price).toLocaleString()}</p></div>
            <div><p className="text-slate-400 text-xs mb-1">Status</p><StatusBadge status={selected.status} /></div>
            <div><p className="text-slate-400 text-xs mb-1">Est. Delivery</p><p className="text-white">{selected.estimated_delivery ? new Date(selected.estimated_delivery).toLocaleDateString() : '—'}</p></div>
            {selected.notes && <div><p className="text-slate-400 text-xs mb-1">Notes</p><p className="text-slate-300">{selected.notes}</p></div>}
          </div>
        </div>
      )}

      {/* Book shipment modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-800 rounded-2xl p-7 w-full max-w-lg border border-slate-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-white mb-5">Book New Shipment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'origin',      label: 'Origin City',       placeholder: 'Lahore' },
                  { key: 'destination', label: 'Destination City',  placeholder: 'Karachi' },
                  { key: 'weight_kg',   label: 'Weight (kg)',        placeholder: '5000', type: 'number' },
                  { key: 'volume_m3',   label: 'Volume (m³)',        placeholder: '12', type: 'number' },
                  { key: 'price',       label: 'Price (PKR)',         placeholder: '85000', type: 'number' },
                ].map(({ key, label, placeholder, type = 'text' }) => (
                  <div key={key}>
                    <label className="block text-xs text-slate-400 mb-1">{label}</label>
                    <input
                      type={type} value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-surface-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      placeholder={placeholder} required={key !== 'volume_m3'}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-surface-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500">
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Available Truck</label>
                <select value={form.truck_id} onChange={e => setForm({ ...form, truck_id: e.target.value })}
                  className="w-full bg-surface-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500" required>
                  <option value="">Select a truck...</option>
                  {trucks.map(t => <option key={t.id} value={t.id}>{t.plate_number} — {t.model} ({t.capacity_tons}t)</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Customer</label>
                <select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })}
                  className="w-full bg-surface-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500" required>
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-surface-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                  rows={2} placeholder="Special handling instructions..." />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-sm">Book Shipment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}