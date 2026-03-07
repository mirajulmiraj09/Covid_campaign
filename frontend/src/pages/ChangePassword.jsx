import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function ChangePassword() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.post('auth/change-password/', formData)
      setSuccess('Password changed successfully!')
      setFormData({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setError(JSON.stringify(err.response?.data))
    } finally {
      setLoading(false)
    }
  }

  const isDoctor = user?.role === 'Doctor'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">💉 VacciCare</h1>
        <button onClick={() => navigate(isDoctor ? '/doctor/dashboard' : '/patient/dashboard')}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-md mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Change Password</h2>
        <p className="text-gray-500 mb-8">Update your account password</p>

        {error && <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6">{success}</div>}

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" value={formData.old_password}
              onChange={(e) => setFormData(prev => ({ ...prev, old_password: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={formData.new_password}
              onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" value={formData.confirm_password}
              onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••" />
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  )
}