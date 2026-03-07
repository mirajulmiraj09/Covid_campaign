import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function PatientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

useEffect(() => {
  if (user?.role !== 'Patient') {
    navigate('/login')
  }
}, [user])

useEffect(() => {
  fetchBookings()
  fetchProfile()
}, [])

const fetchBookings = async () => {
  try {
    const res = await api.get('bookings/my-bookings/')
    setBookings(res.data || [])
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

const fetchProfile = async () => {
  try {
    const res = await api.get('profiles/me/')
    setProfile(res.data.data)
  } catch (err) {
    console.error(err)
  }
}

const handleLogout = () => {
  logout()
  navigate('/login')
}

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-700'
    if (status === 'Cancelled') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const handleCancel = async (bookingId) => {
  if (!window.confirm('Are you sure you want to cancel this appointment?')) return
  try {
    await api.post(`bookings/${bookingId}/cancel/`)
    fetchBookings()
  } catch (err) {
    console.error(err)
  }
}

const handleCertificate = async () => {
  try {
    const res = await api.get(`certificates/${profile?.nid}/`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'vaccination_certificate.pdf')
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    console.error('Certificate error:', err)
    alert('Certificate not available yet. Complete all doses first!')
  }
}

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">💉 VacciCare</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">👤 {user?.email}</span>
          <button onClick={() => navigate('/patient/profile')}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
            Profile
          </button>
          <button onClick={() => navigate('/patient/book')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Book Vaccine
          </button>
        <button onClick={() => navigate('/patient/reviews')}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
          Reviews
        </button>
          <button onClick={() => navigate('/change-password')}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Change Password
            </button>
          <button onClick={handleLogout}
            className="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Welcome */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Patient Dashboard</h2>
        <p className="text-gray-500 mb-8">Welcome back, {user?.email}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-blue-600">{bookings.length}</div>
            <div className="text-gray-500 mt-1">Total Bookings</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'Completed').length}
            </div>
            <div className="text-gray-500 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'Pending').length}
            </div>
            <div className="text-gray-500 mt-1">Pending</div>
          </div>
        </div>

        {/* Certificate Download */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Vaccination Certificate</h3>
            <p className="text-gray-500 text-sm">Download your certificate after completing all doses</p>
          </div>
          <button
            onClick={() => handleCertificate()}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            📄 Download Certificate
          </button>
        </div>
        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">My Bookings</h3>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No bookings yet!</p>
              <button onClick={() => navigate('/patient/book')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Book Your First Vaccine
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Vaccine</th>
                  <th className="pb-3">Dose</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.booking_id} className="border-b last:border-0">
                    <td className="py-3">{booking.vaccine_name}</td>
                    <td className="py-3">Dose {booking.dose_number}</td>
                    <td className="py-3">{booking.scheduled_date}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3">
  {booking.status === 'Pending' && (
    <button
      onClick={() => handleCancel(booking.booking_id)}
      className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-sm hover:bg-red-100">
      Cancel
    </button>
  )}
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