import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function DoctorDashboard() {
  const { user, isDoctor } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isDoctor) navigate('/login')
  }, [isDoctor])

  useEffect(() => {
    fetchAppointments()
    fetchCampaigns()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await api.get('doctor/appointments/')
      setAppointments(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('campaigns/')
      setCampaigns(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-700'
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
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-blue-600">{appointments.length}</div>
            <div className="text-gray-500 mt-1">Total Appointments</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'Completed').length}
            </div>
            <div className="text-gray-500 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-purple-600">{campaigns.length}</div>
            <div className="text-gray-500 mt-1">Active Campaigns</div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Today's Appointments</h3>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No appointments today!</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b">
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
                    <td className="py-3">{apt.patient_email}</td>
                    <td className="py-3">{apt.vaccine_name}</td>
                    <td className="py-3">Dose {apt.dose_number}</td>
                    <td className="py-3">{apt.scheduled_date}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {apt.status === 'Pending' && (
                        <button
                          onClick={() => navigate(`/doctor/vaccinate/${apt.booking_id}`)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
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
                <div key={c.campaign_id} className="border border-gray-200 rounded-xl p-4">
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