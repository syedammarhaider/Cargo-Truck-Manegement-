import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'

// Lazy-loaded pages for better performance
const Login       = lazy(() => import('./pages/Login'))
const Dashboard   = lazy(() => import('./pages/Dashboard'))
const Trucks      = lazy(() => import('./pages/Trucks'))
const Shipments   = lazy(() => import('./pages/Shipments'))
const Tracking    = lazy(() => import('./pages/Tracking'))
const Customers   = lazy(() => import('./pages/Customers'))
const Invoices    = lazy(() => import('./pages/Invoices'))
const Reports     = lazy(() => import('./pages/Reports'))
const Settings    = lazy(() => import('./pages/Settings'))
const Drivers     = lazy(() => import('./pages/Drivers'))

// Full-screen spinner while lazy chunks load
const Spinner = () => (
  <div className="min-h-screen bg-[#060d1a] flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

// Guard: redirect unauthenticated users to /login
function Protected({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  // Role-based access — if roles specified, check user role
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}

export default function MainApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0f1e35', color: '#e2e8f0', border: '1px solid #1e3a5f' },
            duration: 3500,
          }}
        />
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Admin + Manager routes */}
            <Route path="/"           element={<Protected><Dashboard /></Protected>} />
            <Route path="/trucks"     element={<Protected roles={['admin','manager']}><Trucks /></Protected>} />
            <Route path="/shipments"  element={<Protected><Shipments /></Protected>} />
            <Route path="/tracking"   element={<Protected><Tracking /></Protected>} />
            <Route path="/customers"  element={<Protected roles={['admin','manager']}><Customers /></Protected>} />
            <Route path="/invoices"   element={<Protected><Invoices /></Protected>} />
            <Route path="/reports"    element={<Protected roles={['admin','manager']}><Reports /></Protected>} />
            <Route path="/drivers"    element={<Protected roles={['admin','manager']}><Drivers /></Protected>} />
            <Route path="/settings"   element={<Protected><Settings /></Protected>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
