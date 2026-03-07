import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function DoctorDashboard() {
  const { user, isDoctor } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [pendingBookings, setPendingBookings] = useState([])
  const [pendingCounts, setPendingCounts] = useState({ today: 0, previous: 0, upcoming: 0 })
  const [pendingCategory, setPendingCategory] = useState('all')
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (!isDoctor) navigate('/login')
  }, [isDoctor])

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [aptRes, pendRes, campRes] = await Promise.all([
        api.get('doctor/appointments/'),
        api.get('doctor/pending-bookings/'),
        api.get('campaigns/'),
      ])
      setAppointments(aptRes.data.data || [])
      setPendingBookings(pendRes.data.data || [])
      setPendingCounts({
        today: pendRes.data.today_count || 0,
        previous: pendRes.data.previous_count || 0,
        upcoming: pendRes.data.upcoming_count || 0,
      })
      setCampaigns(campRes.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPending = async (category) => {
    try {
      const url = category === 'all'
        ? 'doctor/pending-bookings/'
        : `doctor/pending-bookings/?category=${category}`
      const res = await api.get(url)
      setPendingBookings(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handlePendingCategory = (cat) => {
    setPendingCategory(cat)
    fetchPending(cat)
  }

  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId)
    try {
      await api.post(`bookings/${bookingId}/approve/`)
      // Refresh both pending and appointments
      const [aptRes, pendRes] = await Promise.all([
        api.get('doctor/appointments/'),
        api.get('doctor/pending-bookings/'),
      ])
      setAppointments(aptRes.data.data || [])
      setPendingBookings(pendRes.data.data || [])
      setPendingCounts({
        today: pendRes.data.today_count || 0,
        previous: pendRes.data.previous_count || 0,
        upcoming: pendRes.data.upcoming_count || 0,
      })
      setPendingCategory('all')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (bookingId) => {
    if (!confirm('Reject this booking?')) return
    setActionLoading(bookingId)
    try {
      await api.post(`bookings/${bookingId}/reject/`)
      const [aptRes, pendRes] = await Promise.all([
        api.get('doctor/appointments/'),
        api.get('doctor/pending-bookings/'),
      ])
      setAppointments(aptRes.data.data || [])
      setPendingBookings(pendRes.data.data || [])
      setPendingCounts({
        today: pendRes.data.today_count || 0,
        previous: pendRes.data.previous_count || 0,
        upcoming: pendRes.data.upcoming_count || 0,
      })
      setPendingCategory('all')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject.')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-700'
    if (status === 'Approved') return 'bg-blue-100 text-blue-700'
    if (status === 'Rejected') return 'bg-red-100 text-red-600'
    if (status === 'Cancelled') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Welcome */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Doctor Dashboard</h2>
        <p className="text-gray-500 mb-8">Welcome, Dr. {user?.email}</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-blue-600">{appointments.length}</div>
            <div className="text-gray-500 mt-1">Today's Approved</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-yellow-600">{pendingCounts.today + pendingCounts.previous + pendingCounts.upcoming}</div>
            <div className="text-gray-500 mt-1">Pending Requests</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-orange-600">{pendingCounts.today}</div>
            <div className="text-gray-500 mt-1">Today's Pending</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-purple-600">{campaigns.length}</div>
            <div className="text-gray-500 mt-1">Active Campaigns</div>
          </div>
        </div>

        {/* Pending Approval Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Patient Applications (Pending Approval)</h3>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: `Today (${pendingCounts.today})` },
              { key: 'previous', label: `Previous (${pendingCounts.previous})` },
              { key: 'upcoming', label: `Upcoming (${pendingCounts.upcoming})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => handlePendingCategory(tab.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  pendingCategory === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {pendingBookings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending applications.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b text-sm">
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Campaign</th>
                  <th className="pb-3">Vaccine</th>
                  <th className="pb-3">Dose</th>
                  <th className="pb-3">Scheduled</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingBookings.map(b => (
                  <tr key={b.booking_id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{b.patient_name}</td>
                    <td className="py-3 text-gray-600">{b.campaign_title}</td>
                    <td className="py-3 text-gray-600">{b.vaccine_name}</td>
                    <td className="py-3 text-gray-600">Dose {b.dose_number}</td>
                    <td className="py-3 text-gray-600">{b.scheduled_date}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(b.booking_id)}
                          disabled={actionLoading === b.booking_id}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === b.booking_id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(b.booking_id)}
                          disabled={actionLoading === b.booking_id}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Today's Approved Appointments */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Today's Approved Appointments</h3>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No approved appointments today.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b text-sm">
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Vaccine</th>
                  <th className="pb-3">Dose</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.booking_id} className="border-b last:border-0">
                    <td className="py-3">{apt.patient_name}</td>
                    <td className="py-3">{apt.vaccine_name}</td>
                    <td className="py-3">Dose {apt.dose_number}</td>
                    <td className="py-3">{apt.scheduled_date}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {apt.status === 'Approved' && (
                        <button
                          onClick={() => navigate(`/doctor/vaccinate/${apt.booking_id}`)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
                          Vaccinate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Campaigns */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Active Campaigns</h3>
            <button onClick={() => navigate('/doctor/campaigns')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Manage Campaigns
            </button>
          </div>
          {campaigns.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No campaigns yet!</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {campaigns.map(c => (
                <div key={c.campaign_id} className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/doctor/campaigns/${c.campaign_id}`)}>
                  <h4 className="font-semibold text-gray-800">{c.title}</h4>
                  <p className="text-gray-500 text-sm mt-1">{c.start_date} → {c.end_date}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}