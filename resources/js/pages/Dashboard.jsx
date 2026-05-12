import { useState, useEffect } from 'react'
import { Truck, Package, DollarSign, Activity, Users, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import StatsCard from '../components/StatsCard'
import StatusBadge from '../components/StatusBadge'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await api.get('/dashboard')
      setStats(res.data)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Auto-refresh every 30s
  useEffect(() => {
    load()
    const interval = setInterval(() => load(true), 30000)
    return () => clearInterval(interval)
  }, [])

  const fmt = (n) => `PKR ${Number(n || 0).toLocaleString()}`
  const fmtShort = (n) => {
    if (n >= 1000000) return `PKR ${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `PKR ${(n / 1000).toFixed(0)}K`
    return fmt(n)
  }

  const PIE_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#eab308', '#ef4444']

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Fleet overview and real-time analytics</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 btn-ghost px-3 py-2 rounded-lg text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-colors"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Maintenance alert */}
      {stats?.trucks_maintenance > 0 && (
        <div className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-800/50 rounded-xl px-4 py-3 text-yellow-400 text-sm">
          <AlertTriangle size={16} />
          <span><strong>{stats.trucks_maintenance} truck{stats.trucks_maintenance > 1 ? 's' : ''}</strong> currently under maintenance — review fleet page</span>
        </div>
      )}

      {/* Primary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Trucks"      value={stats?.total_trucks}                   icon={Truck}      color="blue"   trend="+2 this month" />
        <StatsCard title="Active Deliveries" value={stats?.trucks_in_transit}              icon={Activity}   color="green"  trend="Live" />
        <StatsCard title="Total Shipments"   value={stats?.total_shipments}                icon={Package}    color="purple" trend={`+${stats?.active_deliveries || 0} today`} />
        <StatsCard title="Total Revenue"     value={fmtShort(stats?.total_revenue)}        icon={DollarSign} color="yellow" trend={`This month: ${fmtShort(stats?.revenue_this_month)}`} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Pending Orders"   value={stats?.pending_shipments}  icon={Package}    color="yellow" />
        <StatsCard title="Delivered Today"  value={stats?.delivered_today}    icon={TrendingUp} color="green"  />
        <StatsCard title="Total Customers"  value={stats?.total_customers}    icon={Users}      color="purple" />
        <StatsCard title="Total Drivers"    value={stats?.total_drivers}      icon={Truck}      color="blue"   />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue line chart */}
        <div className="lg:col-span-2 bg-surface-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-sm font-semibold text-white mb-6 flex items-center justify-between">
            Revenue — Last 6 Months
            <span className="text-xs text-slate-400 font-normal">{fmtShort(stats?.total_revenue)} total</span>
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats?.monthly_revenue || []}>
              <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#38bdf8' }}
                formatter={v => [`PKR ${Number(v).toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2.5} dot={{ fill: '#0ea5e9', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Shipment status pie */}
        <div className="bg-surface-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-sm font-semibold text-white mb-4">Shipment Breakdown</h2>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={stats?.shipment_breakdown || []} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="count" nameKey="status">
                {(stats?.shipment_breakdown || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {(stats?.shipment_breakdown || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-slate-400 capitalize">{item.status.replace('_', ' ')}</span>
                </div>
                <span className="text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-surface-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
            Recent Shipments
            <a href="/shipments" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
          </h2>
          <div className="space-y-2">
            {stats?.recent_shipments?.map(s => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b border-slate-700/60 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                    <Package size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-mono text-brand-400">{s.tracking_number}</p>
                    <p className="text-xs text-slate-400">{s.customer?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={s.status} />
                  <p className="text-xs text-slate-500 mt-1">{s.truck?.plate_number}</p>
                </div>
              </div>
            ))}
            {!stats?.recent_shipments?.length && (
              <p className="text-slate-500 text-sm text-center py-6">No shipments yet</p>
            )}
          </div>
        </div>

        {/* Fleet status summary */}
        <div className="bg-surface-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-sm font-semibold text-white mb-4">Fleet Status</h2>
          <div className="space-y-4">
            {[
              { label: 'Idle',        value: stats?.trucks_idle,        color: '#64748b', bg: 'bg-slate-700' },
              { label: 'In Transit',  value: stats?.trucks_in_transit,  color: '#3b82f6', bg: 'bg-blue-900' },
              { label: 'Maintenance', value: stats?.trucks_maintenance, color: '#eab308', bg: 'bg-yellow-900' },
            ].map(({ label, value, color, bg }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>{label}</span>
                  <span className="text-white">{value || 0} / {stats?.total_trucks}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${((value || 0) / (stats?.total_trucks || 1)) * 100}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <hr className="border-slate-700 my-4" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'On-Time Rate',  value: '94%' },
              { label: 'Avg Fuel',      value: '68%' },
              { label: 'Fleet Uptime',  value: '92%' },
              { label: 'Avg Load',      value: '78%' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-lg font-semibold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}