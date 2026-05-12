import { useState, useEffect } from 'react'
import { Users, Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { Modal, Input, ConfirmModal } from '../components/UI'
import StatusBadge from '../components/StatusBadge'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: ''
  })

  const load = async () => {
    try {
      const res = await api.get('/customers')
      setCustomers(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch {
      toast.error('Failed to load customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, form)
        toast.success('Customer updated')
      } else {
        await api.post('/customers', form)
        toast.success('Customer created')
      }
      setShowForm(false)
      setEditing(null)
      setForm({ name: '', email: '', phone: '', address: '', company: '' })
      load()
    } catch {
      toast.error('Failed to save customer')
    }
  }

  const edit = (customer) => {
    setEditing(customer)
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      company: customer.company
    })
    setShowForm(true)
  }

  const remove = async (id) => {
    try {
      await api.delete(`/customers/${id}`)
      toast.success('Customer deleted')
      load()
    } catch {
      toast.error('Failed to delete customer')
    }
  }

  const filtered = Array.isArray(customers)
    ? customers.filter(c => 
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase())
      )
    : []

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
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 mt-1">Manage customer information</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers list */}
      <div className="bg-surface-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-700 border-b border-slate-600">
              <tr>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Company</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-slate-300 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filtered.map(customer => (
                <tr key={customer.id} className="hover:bg-surface-700 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">{customer.name}</p>
                      <p className="text-xs text-slate-400">{customer.address}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-slate-300">{customer.email}</p>
                      <p className="text-xs text-slate-400">{customer.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-300">{customer.company || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={customer.status || 'active'} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => edit(customer)} className="p-1.5 text-slate-400 hover:text-white hover:bg-surface-600 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(customer)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-surface-600 rounded-lg transition-colors">
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
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No customers found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null) }} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={submit}>
          <div className="space-y-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <Input label="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-ghost">Cancel</button>
            <button type="submit" className="flex-1 btn-primary">
              {editing ? 'Update' : 'Create'} Customer
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
