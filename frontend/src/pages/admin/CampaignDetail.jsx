import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function CampaignDetail() {
  const { campaignId } = useParams()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState(null)
  const [patients, setPatients] = useState([])
  const [patientCounts, setPatientCounts] = useState({ today: 0, previous: 0, upcoming: 0, vaccinated: 0 })
  const [patientCategory, setPatientCategory] = useState('all')
  const [allDoctors, setAllDoctors] = useState([])
  const [selectedDoctors, setSelectedDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAdmin) navigate('/login')
  }, [isAdmin, navigate])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const campRes = await api.get(`campaigns/${campaignId}/`)
        const campData = campRes.data.data
        setCampaign(campData)
        const assignedIds = (campData.assigned_doctors_list || []).map((d) => d.id)
        setSelectedDoctors(assignedIds)
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
      try {
        const docRes = await api.get('doctors/')
        setAllDoctors(docRes.data.data || docRes.data || [])
      } catch (err) {
        console.error('Doctors fetch error:', err)
      }
      setLoading(false)
    }
    fetchAll()
  }, [campaignId])

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

  const toggleDoctor = (docId) => {
    setSelectedDoctors((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    )
  }

  const handleAssign = async () => {
    setAssigning(true)
    setError('')
    setSuccess('')
    try {
      await api.post(`campaigns/${campaignId}/assign-doctors/`, {
        doctor_ids: selectedDoctors,
      })
      setSuccess('Doctors assigned successfully!')
      // Refresh campaign data
      try {
        const campRes = await api.get(`campaigns/${campaignId}/`)
        const campData = campRes.data.data
        setCampaign(campData)
        const assignedIds = (campData.assigned_doctors_list || []).map((d) => d.id)
        setSelectedDoctors(assignedIds)
      } catch { /* ignore */ }
      try {
        const patientsRes = await api.get(`campaigns/${campaignId}/patients/`)
        setPatients(patientsRes.data.data || [])
        setPatientCounts({
          today: patientsRes.data.today_count || 0,
          previous: patientsRes.data.previous_count || 0,
          upcoming: patientsRes.data.upcoming_count || 0,
          vaccinated: patientsRes.data.vaccinated_count || 0,
        })
      } catch { /* ignore */ }
      try {
        const docRes = await api.get('doctors/')
        setAllDoctors(docRes.data.data || docRes.data || [])
      } catch { /* ignore */ }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign doctors.')
    } finally {
      setAssigning(false)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-700'
    if (status === 'Cancelled') return 'bg-red-100 text-red-700'
    if (status === 'Approved') return 'bg-blue-100 text-blue-700'
    if (status === 'Rejected') return 'bg-red-100 text-red-600'
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
          onClick={() => navigate('/admin/campaigns')}
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
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                campaign.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {campaign.is_active ? 'Active' : 'Inactive'}
            </span>
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
          {/* Assign Doctors */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Assign Doctors</h3>
              <p className="text-gray-500 text-sm mb-4">
                Select doctors to assign to this campaign.
              </p>

              {allDoctors.length === 0 ? (
                <p className="text-gray-500 text-sm">No doctors available.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {allDoctors.map((doc) => {
                    const docId = doc.user_id
                    return (
                      <label
                        key={docId}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedDoctors.includes(docId)
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDoctors.includes(docId)}
                          onChange={() => toggleDoctor(docId)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <div className="text-sm font-medium">
                            Dr. {doc.first_name} {doc.last_name}
                          </div>
                          <div className="text-xs text-gray-500">{doc.email}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}

              <button
                onClick={handleAssign}
                disabled={assigning}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {assigning ? 'Saving...' : 'Save Assignments'}
              </button>
            </div>

            {/* Vaccines */}
            {campaign.vaccines && campaign.vaccines.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
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
          </div>

          {/* Patients/Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Patient Bookings ({patients.length})
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
                <p className="text-gray-500 text-center py-6">No bookings for this campaign yet.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 border-b text-sm">
                      <th className="pb-3">Patient</th>
                      <th className="pb-3">Vaccine</th>
                      <th className="pb-3">Dose</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Status</th>
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
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              b.status
                            )}`}
                          >
                            {b.status}
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
      </div>
    </div>
  )
}
