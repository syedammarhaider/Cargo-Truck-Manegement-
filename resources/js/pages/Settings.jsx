import { useState, useEffect } from 'react'
import { User, Bell, Shield, Database, Save, Eye, EyeOff } from 'lucide-react'
import { Input, Modal } from '../components/UI'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })

  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: false,
    dark_mode: true,
    auto_refresh: true
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const res = await api.get('/me')
      setUser(res.data)
      setProfile({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone || ''
      })
    } catch {
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      await api.put('/profile', profile)
      toast.success('Profile updated successfully')
      loadUser()
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    
    setSaving(true)
    try {
      await api.put('/password', passwordForm)
      toast.success('Password changed successfully')
      setShowPasswordModal(false)
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await api.put('/settings', settings)
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <div className="bg-surface-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <User size={20} className="text-slate-400" />
              <h2 className="text-lg font-semibold text-white">Profile Information</h2>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={saveProfile} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="btn-ghost"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div>
          <div className="bg-surface-800 rounded-xl border border-slate-700 p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'admin' ? 'bg-purple-900/60 text-purple-300' : 'bg-blue-900/60 text-blue-300'
                }`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="mt-6">
        <div className="bg-surface-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="text-xs text-slate-400">Receive email updates about your shipments</p>
              </div>
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={e => setSettings({ ...settings, email_notifications: e.target.checked })}
                className="w-4 h-4 text-sky-500 bg-surface-700 border-slate-600 rounded focus:ring-sky-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Push Notifications</p>
                <p className="text-xs text-slate-400">Receive browser push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.push_notifications}
                onChange={e => setSettings({ ...settings, push_notifications: e.target.checked })}
                className="w-4 h-4 text-sky-500 bg-surface-700 border-slate-600 rounded focus:ring-sky-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Auto Refresh</p>
                <p className="text-xs text-slate-400">Automatically refresh dashboard data</p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_refresh}
                onChange={e => setSettings({ ...settings, auto_refresh: e.target.checked })}
                className="w-4 h-4 text-sky-500 bg-surface-700 border-slate-600 rounded focus:ring-sky-500"
              />
            </label>
          </div>

          <button onClick={saveSettings} disabled={saving} className="btn-primary mt-6">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <form onSubmit={changePassword}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Current Password</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">New Password</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.new_password_confirmation}
              onChange={e => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
