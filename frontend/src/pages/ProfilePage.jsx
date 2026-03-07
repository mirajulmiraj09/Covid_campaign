import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('profiles/me/')
      setProfile(res.data.data)
      setFormData(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.patch('profiles/me/', formData)
      setSuccess('Profile updated successfully!')
      setEditing(false)
      fetchProfile()
    } catch (err) {
      setError(JSON.stringify(err.response?.data))
    }
  }

  const isDoctor = user?.role === 'Doctor'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
            <p className="text-gray-500 mt-1">{isDoctor ? 'Doctor' : 'Patient'} Account</p>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {success && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6">{success}</div>}
        {error && <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="grid grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                {editing ? (
                  <input value={formData.first_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <p className="text-gray-800 font-medium">{profile?.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                {editing ? (
                  <input value={formData.last_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <p className="text-gray-800 font-medium">{profile?.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-800 font-medium">{profile?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">NID</label>
                <p className="text-gray-800 font-medium">{profile?.nid}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                {editing ? (
                  <input value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <p className="text-gray-800 font-medium">{profile?.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                {editing ? (
                  <select value={formData.gender || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-800 font-medium">{profile?.gender}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                {editing ? (
                  <textarea value={formData.address || ''} rows={2}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <p className="text-gray-800 font-medium">{profile?.address}</p>
                )}
              </div>

              {isDoctor && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Specialization</label>
                  {editing ? (
                    <input value={formData.specialization || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-800 font-medium">{profile?.specialization || 'Not set'}</p>
                  )}
                </div>
              )}

              {!isDoctor && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Medical History</label>
                  {editing ? (
                    <textarea value={formData.medical_history || ''} rows={3}
                      onChange={(e) => setFormData(prev => ({ ...prev, medical_history: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-800 font-medium">{profile?.medical_history || 'None'}</p>
                  )}
                </div>
              )}

            </div>

            {editing && (
              <button onClick={handleUpdate}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                Save Changes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}