import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function ManageCampaigns() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('campaigns/')
      const all = res.data.data || []
      // Show only campaigns where this doctor is assigned
      const assigned = all.filter(c =>
        (c.assigned_doctors_list || []).some(d => d.id === user?.user_id)
      )
      setCampaigns(assigned)
    } catch (err) {
      console.error('Campaigns error:', err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Campaigns</h2>
          <p className="text-gray-500 mt-1">Campaigns you are assigned to</p>
        </div>

        {/* Campaigns List */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <p className="text-gray-500">You are not assigned to any campaigns yet.</p>
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
                <p className="text-gray-400 text-sm">📅 {c.start_date} → {c.end_date}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>💊 {c.vaccine_count} vaccines</span>
                  <span>👨‍⚕️ {c.assigned_doctor_count || 0} doctors</span>
                </div>
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