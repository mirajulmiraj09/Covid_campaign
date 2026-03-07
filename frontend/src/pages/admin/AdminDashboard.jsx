import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ campaigns: 0, doctors: 0, bookings: 0 })
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) navigate('/login')
  }, [isAdmin, navigate])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [campRes, docRes] = await Promise.all([
        api.get('campaigns/'),
        api.get('doctors/'),
      ])
      const campaignList = campRes.data.data || []
      const doctorList = docRes.data.data || docRes.data || []
      setCampaigns(campaignList.slice(0, 5))
      setStats({
        campaigns: campaignList.length,
        doctors: doctorList.length,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
        <p className="text-gray-500 mb-8">Welcome back, {user?.email}</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div
            onClick={() => navigate('/admin/campaigns')}
            className="bg-white rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="text-4xl font-bold text-blue-600">{stats.campaigns}</div>
            <div className="text-gray-500 mt-1">Total Campaigns</div>
          </div>
          <div
            onClick={() => navigate('/admin/doctors')}
            className="bg-white rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="text-4xl font-bold text-green-600">{stats.doctors}</div>
            <div className="text-gray-500 mt-1">Registered Doctors</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-4xl font-bold text-purple-600">
              {campaigns.filter((c) => c.is_active).length}
            </div>
            <div className="text-gray-500 mt-1">Active Campaigns</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <button
            onClick={() => navigate('/admin/campaigns')}
            className="bg-blue-600 text-white rounded-xl p-4 text-center font-semibold hover:bg-blue-700 transition-colors"
          >
            ➕ Create Campaign
          </button>
          <button
            onClick={() => navigate('/admin/doctors')}
            className="bg-green-600 text-white rounded-xl p-4 text-center font-semibold hover:bg-green-700 transition-colors"
          >
            👨‍⚕️ Register Doctor
          </button>
          <button
            onClick={() => navigate('/admin/campaigns')}
            className="bg-purple-600 text-white rounded-xl p-4 text-center font-semibold hover:bg-purple-700 transition-colors"
          >
            📋 Manage Campaigns
          </button>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Recent Campaigns</h3>
            <button
              onClick={() => navigate('/admin/campaigns')}
              className="text-blue-600 text-sm hover:underline"
            >
              View All →
            </button>
          </div>

          {campaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No campaigns yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b text-sm">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Vaccines</th>
                  <th className="pb-3">Doctors</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.campaign_id}
                    onClick={() => navigate(`/admin/campaigns/${c.campaign_id}`)}
                    className="border-b last:border-0 cursor-pointer hover:bg-gray-50"
                  >
                    <td className="py-3 font-medium">{c.title}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {c.start_date} — {c.end_date}
                    </td>
                    <td className="py-3">{c.vaccine_count}</td>
                    <td className="py-3">{c.assigned_doctor_count || 0}</td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          c.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
