import { useState, useEffect } from 'react'
import { FileText, Download, Search, Filter, DollarSign } from 'lucide-react'
import { Modal, Input, Select } from '../components/UI'
import StatusBadge from '../components/StatusBadge'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const load = async () => {
    try {
      const res = await api.get('/invoices')
      setInvoices(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch {
      toast.error('Failed to load invoices')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const download = async (id) => {
    try {
      const res = await api.get(`/invoices/${id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Invoice downloaded')
    } catch {
      toast.error('Failed to download invoice')
    }
  }

  const filtered = Array.isArray(invoices) ? invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer?.name?.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) : []

  const total = Array.isArray(filtered) ? filtered.reduce((sum, inv) => sum + (inv.total || 0), 0) : 0

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
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-slate-400 mt-1">Manage billing and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Amount</p>
            <p className="text-lg font-semibold text-white">${total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters ? 'bg-sky-500/10 border-sky-500 text-sky-400' : 'border-slate-600 text-slate-400 hover:border-slate-500'
          }`}
        >
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-surface-800 rounded-xl border border-slate-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </Select>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-surface-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-700 border-b border-slate-600">
              <tr>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Invoice #</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Shipment</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Due Date</th>
                <th className="text-left text-xs font-medium text-slate-300 px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-slate-300 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {Array.isArray(filtered) ? filtered.map(invoice => (
                <tr key={invoice.id} className="hover:bg-surface-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      <span className="text-sm font-mono text-white">{invoice.invoice_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-300">{invoice.customer?.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono text-slate-300">{invoice.shipment?.tracking_number}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-white">${invoice.total?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-300">{invoice.due_date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => download(invoice.id)}
                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-surface-600 rounded-lg transition-colors"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : null}
            </tbody>
          </table>
        </div>
        {(!Array.isArray(filtered) || filtered.length === 0) && (
          <div className="text-center py-12 text-slate-500">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>No invoices found</p>
          </div>
        )}
      </div>
    </div>
  )
}
