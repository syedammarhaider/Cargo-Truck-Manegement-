import { useState, useEffect } from 'react'
import { User, Plus, Search, Edit2, Trash2, Phone, Mail } from 'lucide-react'
import { Modal, Input, ConfirmModal, Select } from '../components/UI'
import StatusBadge from '../components/StatusBadge'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    truck_id: '',
    status: 'active'
  })

  const load = async () => {
    try {
      const [driversRes, trucksRes] = await Promise.all([
        api.get('/drivers'),
        api.get('/trucks')
      ])
      setDrivers(driversRes.data.data || [])
      setTrucks(trucksRes.data.data || [])
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/drivers/${editing.id}`, form)
        toast.success('Driver updated')
      } else {
        await api.post('/drivers', form)
        toast.success('Driver created')
      }
      setShowForm(false)
      setEditing(null)
      setForm({
        name: '',
        email: '',
        phone: '',
        license_number: '',
        license_expiry: '',
        truck_id: '',
        status: 'active'
      })
      load()
    } catch {
      toast.error('Failed to save driver')
    }
  }

  const edit = (driver) => {
    setEditing(driver)
    setForm({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      license_number: driver.license_number,
      license_expiry: driver.license_expiry,
      truck_id: driver.truck_id || '',
      status: driver.status
    })
    setShowForm(true)
  }

  const remove = async (id) => {
    try {
      await api.delete(`/drivers/${id}`)
      toast.success('Driver deleted')
      load()
    } catch {
      toast.error('Failed to delete driver')
    }
  }

  const filtered = drivers.filter(driver => 
    driver.name.toLowerCase().includes(search.toLowerCase()) ||
    driver.email.toLowerCase().includes(search.toLowerCase()) ||
    driver.phone?.includes(search) ||
    driver.truck?.plate_number?.toLowerCase().includes(search.toLowerCase())
  )

  const availableTrucks = trucks.filter(truck => !truck.driver_id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Drivers</h1>
          <p className="text-slate-400 mt-1">Manage driver information and assignments</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Driver
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="Search drivers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Drivers List */}
      <div className="bg-surface-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-700 border-b border-slate-600">
              <tr>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Driver</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">License</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Assigned Truck</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-slate-300 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filtered.map(driver => (
                <tr key={driver.id} className="hover:bg-surface-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                        <User size={16} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{driver.name}</p>
                        <p className="text-xs text-slate-400">ID: {driver.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Mail size={12} className="text-slate-500" />
                        {driver.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Phone size={12} className="text-slate-500" />
                        {driver.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-slate-300">{driver.license_number}</p>
                      <p className="text-xs text-slate-400">Expires: {driver.license_expiry}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {driver.truck ? (
                      <div>
                        <p className="text-sm font-medium text-white">{driver.truck.plate_number}</p>
                        <p className="text-xs text-slate-400">{driver.truck.make} {driver.truck.model}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Unassigned</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={driver.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => edit(driver)} className="p-1.5 text-slate-400 hover:text-white hover:bg-surface-600 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(driver)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-surface-600 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="text-center py-12 text-slate-500">
            <User size={40} className="mx-auto mb-3 opacity-30" />
            <p>No drivers found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null) }} title={editing ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={submit}>
          <div className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <Input label="License Number" value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} required />
            <Input label="License Expiry" type="date" value={form.license_expiry} onChange={e => setForm({ ...form, license_expiry: e.target.value })} required />
            <Select label="Assign Truck" value={form.truck_id} onChange={e => setForm({ ...form, truck_id: e.target.value })}>
              <option value="">Select a truck</option>
              {availableTrucks.map(truck => (
                <option key={truck.id} value={truck.id}>
                  {truck.plate_number} - {truck.make} {truck.model}
                </option>
              ))}
            </Select>
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </Select>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-ghost">Cancel</button>
            <button type="submit" className="flex-1 btn-primary">
              {editing ? 'Update' : 'Create'} Driver
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => remove(deleteConfirm.id)}
        message={`Are you sure you want to delete ${deleteConfirm?.name}?`}
        danger
      />
    </div>
  )
}
