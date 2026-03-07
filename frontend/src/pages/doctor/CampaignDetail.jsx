import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function DoctorCampaignDetail() {
  const { campaignId } = useParams()
  const { isDoctor } = useAuth()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState(null)
  const [patients, setPatients] = useState([])
  const [patientCounts, setPatientCounts] = useState({ today: 0, previous: 0, upcoming: 0, vaccinated: 0 })
  const [patientCategory, setPatientCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isDoctor) navigate('/login')
  }, [isDoctor, navigate])

  useEffect(() => {
    fetchData()
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const campRes = await api.get(`campaigns/${campaignId}/`)
      setCampaign(campRes.data.data)
    } catch (err) {
      console.error('Campaign fetch error:', err)
    }
    try {
      const patientsRes = await api.get(`campaigns/${campaignId}/patients/`)
      setPatients(patientsRes.data.data || [])
      setPatientCounts({
        today: patientsRes.data.today_count || 0,
        previous: patientsRes.data.previous_count || 0,
        upcoming: patientsRes.data.upcoming_count || 0,
        vaccinated: patientsRes.data.vaccinated_count || 0,
      })
    } catch (err) {
      console.error('Patients fetch error:', err)
    }
    setLoading(false)
  }

  const fetchPatients = async (category) => {
    try {
      const url = category === 'all'
        ? `campaigns/${campaignId}/patients/`
        : `campaigns/${campaignId}/patients/?category=${category}`
      const res = await api.get(url)
      setPatients(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleCategoryChange = (cat) => {
    setPatientCategory(cat)
    fetchPatients(cat)
  }

  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId)
    setError('')
    setSuccess('')
    try {
      await api.post(`bookings/${bookingId}/approve/`)
      setSuccess('Booking approved successfully.')
      fetchPatients(patientCategory)
      // Refresh counts
      const res = await api.get(`campaigns/${campaignId}/patients/`)
      setPatientCounts({
        today: res.data.today_count || 0,
        previous: res.data.previous_count || 0,
        upcoming: res.data.upcoming_count || 0,
        vaccinated: res.data.vaccinated_count || 0,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve booking.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (bookingId) => {
    if (!confirm('Are you sure you want to reject this booking?')) return
    setActionLoading(bookingId)
    setError('')
    setSuccess('')
    try {
      await api.post(`bookings/${bookingId}/reject/`)
      setSuccess('Booking rejected.')
      fetchPatients(patientCategory)
      const res = await api.get(`campaigns/${campaignId}/patients/`)
      setPatientCounts({
        today: res.data.today_count || 0,
        previous: res.data.previous_count || 0,
        upcoming: res.data.upcoming_count || 0,
        vaccinated: res.data.vaccinated_count || 0,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject booking.')
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

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-10">
          <p className="text-gray-500">Campaign not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Back Link */}
        <button
          onClick={() => navigate('/doctor/campaigns')}
          className="text-blue-600 text-sm hover:underline mb-4 inline-block"
        >
          ← Back to Campaigns
        </button>

        {/* Campaign Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{campaign.title}</h2>
              <p className="text-gray-500 mt-2">{campaign.description}</p>
              <div className="flex gap-6 mt-4 text-sm text-gray-500">
                <span>📅 {campaign.start_date} — {campaign.end_date}</span>
                <span>💊 {campaign.vaccines?.length || 0} vaccines</span>
                <span>👨‍⚕️ {campaign.assigned_doctors_list?.length || 0} doctors</span>
              </div>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  campaign.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {campaign.is_active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => navigate(`/doctor/campaigns/${campaignId}/vaccines`)}
                className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100"
              >
                Manage Vaccines →
              </button>
            </div>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vaccines Sidebar */}
          <div className="lg:col-span-1">
            {campaign.vaccines && campaign.vaccines.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vaccines</h3>
                <div className="space-y-3">
                  {campaign.vaccines.map((v) => (
                    <div key={v.vaccine_id} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-sm">{v.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {v.manufacturer || 'N/A'} · {v.total_doses} dose(s) · Stock: {v.stock_quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Today</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {patientCounts.today}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Previous</span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {patientCounts.previous}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Upcoming</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {patientCounts.upcoming}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Vaccinated</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {patientCounts.vaccinated}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Doctors */}
            {campaign.assigned_doctors_list && campaign.assigned_doctors_list.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Assigned Doctors</h3>
                <div className="space-y-2">
                  {campaign.assigned_doctors_list.map((d) => (
                    <div key={d.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-sm">{d.name}</div>
                      <div className="text-xs text-gray-500">{d.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Patients/Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Patient Records ({patients.length})
              </h3>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'today', label: `Today (${patientCounts.today})` },
                  { key: 'previous', label: `Previous (${patientCounts.previous})` },
                  { key: 'upcoming', label: `Upcoming (${patientCounts.upcoming})` },
                  { key: 'vaccinated', label: `Vaccinated (${patientCounts.vaccinated})` },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => handleCategoryChange(tab.key)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      patientCategory === tab.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {patients.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No bookings found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 border-b text-sm">
                        <th className="pb-3">Patient</th>
                        <th className="pb-3">Vaccine</th>
                        <th className="pb-3">Dose</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((b) => (
                        <tr key={b.booking_id} className="border-b last:border-0">
                          <td className="py-3 font-medium">{b.patient_name}</td>
                          <td className="py-3 text-gray-600">{b.vaccine_name}</td>
                          <td className="py-3 text-gray-600">Dose {b.dose_number}</td>
                          <td className="py-3 text-gray-600">{b.scheduled_date}</td>
                          <td className="py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3">
                            {b.status === 'Pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(b.booking_id)}
                                  disabled={actionLoading === b.booking_id}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(b.booking_id)}
                                  disabled={actionLoading === b.booking_id}
                                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {b.status === 'Approved' && (
                              <button
                                onClick={() => navigate(`/doctor/vaccinate/${b.booking_id}`)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
                              >
                                Vaccinate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
