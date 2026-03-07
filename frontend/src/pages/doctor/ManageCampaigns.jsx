import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function ManageCampaigns() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', start_date: '', end_date: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCampaigns()
  }, [])

    const fetchCampaigns = async () => {
      try {
        const res = await api.get('campaigns/')
        console.log('Campaigns response:', res.data)
        setCampaigns(res.data.data || [])
      } catch (err) {
        console.error('Campaigns error:', err.response?.data)
      } finally {
        setLoading(false)
      }
    }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('campaigns/', formData)
      setSuccess('Campaign created successfully!')
      setShowForm(false)
      setFormData({ title: '', description: '', start_date: '', end_date: '' })
      fetchCampaigns()
    } catch (err) {
      setError(JSON.stringify(err.response?.data))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Manage Campaigns</h2>
            <p className="text-gray-500 mt-1">Create and manage vaccination campaigns</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {showForm ? 'Cancel' : '+ New Campaign'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6">{success}</div>}

        {/* Create Campaign Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Create New Campaign</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Covid Winter Drive 2026" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} rows={3}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Campaign description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button onClick={handleSubmit}
              className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Campaign
            </button>
          </div>
        )}

        {/* Campaigns List */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <p className="text-gray-500">No campaigns yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {campaigns.map(c => (
              <div key={c.campaign_id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-800 text-lg">{c.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3">{c.description}</p>
                <p className="text-gray-400 text-sm">{c.start_date} → {c.end_date}</p>
                <button
                  onClick={() => navigate(`/doctor/campaigns/${c.campaign_id}/vaccines`)}
                  className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 w-full">
                  Manage Vaccines →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}