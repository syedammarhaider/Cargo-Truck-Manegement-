import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Download, Calendar, Filter } from 'lucide-react'
import { Select, Input } from '../components/UI'
import api from '../api/client'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [reportType, setReportType] = useState('revenue')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports', {
        params: { range: dateRange, type: reportType }
      })
      setData(res.data)
    } catch {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [dateRange, reportType])

  const exportReport = async () => {
    try {
      const res = await api.get('/reports/export', {
        params: { range: dateRange, type: reportType },
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${reportType}-${dateRange}days.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report exported successfully')
    } catch {
      toast.error('Failed to export report')
    }
  }

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
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">Analytics and business insights</p>
        </div>
        <button onClick={exportReport} className="btn-primary flex items-center gap-2">
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Controls */}
      <div className="bg-surface-800 rounded-xl border border-slate-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={reportType} onChange={e => setReportType(e.target.value)}>
            <option value="revenue">Revenue Analysis</option>
            <option value="shipments">Shipment Analytics</option>
            <option value="customers">Customer Reports</option>
            <option value="fleet">Fleet Performance</option>
          </Select>
          <Select value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </Select>
          <Input type="date" className="w-full" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-white">${data?.summary?.total_revenue?.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-1">+{data?.summary?.revenue_growth}% from last period</p>
        </div>
        <div className="bg-surface-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Shipments</p>
          <p className="text-2xl font-bold text-white">{data?.summary?.total_shipments?.toLocaleString()}</p>
          <p className="text-xs text-blue-400 mt-1">+{data?.summary?.shipments_growth}% from last period</p>
        </div>
        <div className="bg-surface-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Active Customers</p>
          <p className="text-2xl font-bold text-white">{data?.summary?.active_customers?.toLocaleString()}</p>
          <p className="text-xs text-purple-400 mt-1">{data?.summary?.customer_retention}% retention rate</p>
        </div>
        <div className="bg-surface-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Fleet Utilization</p>
          <p className="text-2xl font-bold text-white">{data?.summary?.fleet_utilization}%</p>
          <p className="text-xs text-amber-400 mt-1">{data?.summary?.idle_trucks} trucks idle</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-surface-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-sm font-semibold text-white mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.revenue_trend || []}>
              <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Shipment Status Breakdown */}
        <div className="bg-surface-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-sm font-semibold text-white mb-4">Shipment Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.shipment_breakdown || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="count"
                nameKey="status"
              >
                {(data?.shipment_breakdown || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Routes */}
      <div className="bg-surface-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-sm font-semibold text-white mb-4">Top Routes by Volume</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.top_routes || []}>
            <XAxis dataKey="route" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Bar dataKey="shipments" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
