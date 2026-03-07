import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function BookAppointment() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [vaccines, setVaccines] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [formData, setFormData] = useState({ vaccine_id: '', scheduled_date: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedCampaignData, setSelectedCampaignData] = useState(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('campaigns/')
      setCampaigns(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchVaccines = async (campaignId) => {
    try {
      const res = await api.get(`campaigns/${campaignId}/vaccines/`)
      setVaccines(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  

const handleCampaignChange = (e) => {
  const id = e.target.value
  setSelectedCampaign(id)
  setVaccines([])
  setFormData(prev => ({ ...prev, vaccine_id: '' }))
  if (id) {
    fetchVaccines(id)
    const campaign = campaigns.find(c => c.campaign_id === parseInt(id))
    setSelectedCampaignData(campaign)
  }
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.post('bookings/', formData)
      setSuccess('Appointment booked successfully!')
      setTimeout(() => navigate('/patient/dashboard'), 2000)
    } catch (err) {
      setError(JSON.stringify(err.response?.data))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Book Appointment</h2>
        <p className="text-gray-500 mb-8">Select a campaign and vaccine to book your appointment</p>

        {error && (
          <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">{success}</div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {/* Campaign */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Campaign</label>
            <select onChange={handleCampaignChange} value={selectedCampaign}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select a Campaign --</option>
              {campaigns.map(c => (
                <option key={c.campaign_id} value={c.campaign_id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Vaccine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Vaccine</label>
            <select value={formData.vaccine_id}
              onChange={(e) => setFormData(prev => ({ ...prev, vaccine_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedCampaign}>
              <option value="">-- Select a Vaccine --</option>
              {vaccines.map(v => (
                <option key={v.vaccine_id} value={v.vaccine_id}>
                  {v.name} — Stock: {v.stock_quantity}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
            <input 
              type="date"
              min={selectedCampaignData?.start_date}
              max={selectedCampaignData?.end_date}
              value={formData.scheduled_date}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </div>
    </div>
  )
}