import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function PatientDashboard() {
  const { user, isPatient } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPatient) navigate('/login')
  }, [isPatient])

  useEffect(() => {
    fetchBookings()
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

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      await api.post(`bookings/${bookingId}/cancel/`)
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.')
    }
  }

  const handleDownloadCertificate = async () => {
    try {
      const profileRes = await api.get('profiles/me/')
      const nid = profileRes.data.data?.nid || profileRes.data?.nid
      if (!nid) {
        alert('NID not found on your profile. Cannot download certificate.')
        return
      }
      const res = await api.get(`certificates/${nid}/`, { responseType: 'blob' })
      const contentType = res.headers['content-type']
      if (contentType && contentType.includes('application/json')) {
        const text = await res.data.text()
        const json = JSON.parse(text)
        alert(json.message || 'Certificate not available yet.')
        return
      }
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `certificate_${nid}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text()
        try {
          const json = JSON.parse(text)
          alert(json.message || 'Certificate not available yet.')
        } catch {
          alert('Certificate not available yet.')
        }
      } else {
        alert(err.response?.data?.message || 'Certificate not available yet.')
      }
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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Patient Dashboard</h2>
        <p className="text-gray-500 mb-8">Welcome back, {user?.email}</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
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
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-purple-600">
              {bookings.filter(b => b.status === 'Cancelled').length}
            </div>
            <div className="text-gray-500 mt-1">Cancelled</div>
          </div>
        </div>

        {/* Certificate Download */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Vaccination Certificate</h3>
            <p className="text-gray-500 text-sm">Download your certificate after completing all doses</p>
          </div>
          <button
            onClick={handleDownloadCertificate}
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
                          className="text-red-500 text-sm hover:underline">
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