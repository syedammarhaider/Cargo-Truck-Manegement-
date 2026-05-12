import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060d1a] flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/25">
            <Truck size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TCMS Pro</h1>
          <p className="text-slate-400 text-sm mt-1">Transport & Fleet Management</p>
        </div>

        {/* Card */}
        <div className="bg-[#0d1e35] rounded-2xl border border-slate-700/60 p-7 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#060d1a] border border-slate-600/60 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="admin@tcms.com" required autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#060d1a] border border-slate-600/60 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-5 border-t border-slate-700/60">
            <p className="text-xs text-slate-500 text-center mb-3">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin', email: 'admin@tcms.com', pw: 'password' },
                { label: 'Manager', email: 'manager@tcms.com', pw: 'password' },
              ].map(({ label, email, pw }) => (
                <button key={label}
                  onClick={() => setForm({ email, password: pw })}
                  className="text-xs py-2 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-5">© 2025 TCMS Pro · All rights reserved</p>
      </div>
    </div>
  )
}