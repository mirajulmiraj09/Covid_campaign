import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function AdminCampaigns() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
  })

  useEffect(() => {
    if (!isAdmin) navigate('/login')
  }, [isAdmin, navigate])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const campRes = await api.get('campaigns/')
      setCampaigns(campRes.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await api.post('campaigns/', form)
      setSuccess('Campaign created successfully!')
      setForm({ title: '', description: '', start_date: '', end_date: '', is_active: true })
      setShowForm(false)
      fetchData()
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        const msgs = Object.values(data.errors).flat().join(', ')
        setError(msgs)
      } else if (data?.message) {
        setError(data.message)
      } else {
        setError('Failed to create campaign.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Manage Campaigns</h2>
            <p className="text-gray-500 mt-1">{campaigns.length} campaigns</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setError('')
              setSuccess('')
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {showForm ? '✕ Cancel' : '+ New Campaign'}
          </button>
        </div>

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Create Campaign Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Campaign</h3>

            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Campaign'}
              </button>
            </form>
          </div>
        )}

        {/* Campaigns List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">All Campaigns</h3>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : campaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No campaigns yet.</p>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <div
                  key={c.campaign_id}
                  onClick={() => navigate(`/admin/campaigns/${c.campaign_id}`)}
                  className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{c.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">{c.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>📅 {c.start_date} — {c.end_date}</span>
                        <span>💊 {c.vaccine_count} vaccines</span>
                        <span>👨‍⚕️ {c.assigned_doctor_count || 0} doctors</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        c.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
