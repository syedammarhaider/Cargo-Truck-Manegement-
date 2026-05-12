import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Truck, Package, Map, LayoutDashboard, LogOut, Users,
  FileText, BarChart2, Settings, ChevronRight, Bell,
  UserCheck, X, Menu, ChevronDown, Search
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useWebSocket'
import api from '../api/client'

const NAV = [
  { section: 'Operations' },
  { path: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/shipments', label: 'Shipments',  icon: Package },
  { path: '/tracking',  label: 'Live Map',   icon: Map },
  { section: 'Fleet' },
  { path: '/trucks',    label: 'Trucks',     icon: Truck, adminOnly: true },
  { path: '/drivers',   label: 'Drivers',    icon: UserCheck, adminOnly: true },
  { section: 'Business' },
  { path: '/customers', label: 'Customers',  icon: Users, adminOnly: true },
  { path: '/invoices',  label: 'Invoices',   icon: FileText },
  { path: '/reports',   label: 'Reports',    icon: BarChart2, adminOnly: true },
]

export default function Layout({ children }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const [notifications,  setNotifications]  = useState([])
  const [showNotif,      setShowNotif]      = useState(false)
  const [unread,         setUnread]         = useState(0)
  const notifRef = useRef(null)

  // Listen for real-time notifications via WebSocket
  useNotifications(user?.id, (n) => {
    setNotifications(prev => [{ ...n, id: Date.now(), read: false }, ...prev.slice(0, 19)])
    setUnread(u => u + 1)
  })

  // Load notifications on mount
  useEffect(() => {
    api.get('/notifications').then(res => {
      setNotifications(res.data || [])
      setUnread((res.data || []).filter(n => !n.read).length)
    }).catch(() => {})
  }, [])

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await api.post('/notifications/read-all').catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  const handleLogout = async () => { await logout(); navigate('/login') }

  const isAdmin = ['admin', 'manager'].includes(user?.role)

  return (
    <div className="flex h-screen bg-[#060d1a] text-white overflow-hidden">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-[#0a1628] border-r border-slate-800/60 flex flex-col flex-shrink-0 transition-all duration-300`}>

        {/* Logo */}
        <div className="p-4 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Truck size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-sm tracking-tight text-white">TCMS Pro</p>
              <p className="text-slate-500 text-[10px]">Fleet Operations</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(v => !v)} className="ml-auto text-slate-500 hover:text-white transition-colors">
            <Menu size={14} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto space-y-0.5">
          {NAV.map((item, i) => {
            if (item.section) return sidebarOpen
              ? <p key={i} className="text-[9px] text-slate-600 uppercase tracking-widest font-semibold px-2 py-2 mt-2">{item.section}</p>
              : <div key={i} className="my-1 border-t border-slate-800/60" />

            if (item.adminOnly && !isAdmin) return null
            const active = location.pathname === item.path

            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all group ${
                  active ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <item.icon size={15} className="flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User profile */}
        <div className="p-2 border-t border-slate-800/60 space-y-1">
          {sidebarOpen && (
            <Link to="/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
              <Settings size={15} /> Settings
            </Link>
          )}
          <div className={`flex items-center gap-2.5 px-2.5 py-2 ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-white">{user?.name || 'Admin'}</p>
                  <p className="text-slate-500 text-[10px] capitalize">{user?.role || 'admin'}</p>
                </div>
                <button onClick={handleLogout} className="p-1 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                  <LogOut size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col">

        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#060d1a]/80 backdrop-blur-md border-b border-slate-800/60 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-slate-400">TCMS</span>
            <ChevronRight size={11} />
            <span className="text-white capitalize">{location.pathname.replace('/', '') || 'Dashboard'}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotif(v => !v); if (unread > 0) markAllRead() }}
                className="relative p-1.5 text-slate-400 hover:text-white transition-colors">
                <Bell size={16} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d1e35] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-white"><X size={14} /></button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0
                      ? <p className="text-slate-500 text-sm text-center py-8">No notifications</p>
                      : notifications.map((n, i) => (
                        <div key={n.id || i} className={`px-4 py-3 border-b border-slate-800/60 last:border-0 ${!n.read ? 'bg-sky-500/5' : ''}`}>
                          <p className="text-sm text-white">{n.message || n.data?.message || 'New notification'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleTimeString() : 'Just now'}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}