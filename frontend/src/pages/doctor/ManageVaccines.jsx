import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'

export default function ManageVaccines() {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const [vaccines, setVaccines] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    campaign: campaignId,
    name: '',
    dose_interval: 0,
    total_doses: 1,
    stock_quantity: 0,
    manufacturer: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchVaccines()
  }, [])

  const fetchVaccines = async () => {
    try {
      const res = await api.get(`campaigns/${campaignId}/vaccines/`)
      setVaccines(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('vaccines/', formData)
      setSuccess('Vaccine added successfully!')
      setShowForm(false)
      fetchVaccines()
    } catch (err) {
      setError(JSON.stringify(err.response?.data))
    }
  }

  const handleDelete = async (vaccineId) => {
    if (!window.confirm('Delete this vaccine?')) return
    try {
      await api.delete(`vaccines/${vaccineId}/`)
      fetchVaccines()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">💉 VacciCare</h1>
        <button onClick={() => navigate('/doctor/campaigns')}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
          ← Back to Campaigns
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Manage Vaccines</h2>
            <p className="text-gray-500 mt-1">Add and manage vaccines for this campaign</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {showForm ? 'Cancel' : '+ Add Vaccine'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6">{success}</div>}

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Add New Vaccine</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name</label>
                <input value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Pfizer-BioNTech" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dose Interval (days)</label>
                <input type="number" value={formData.dose_interval}
                  onChange={(e) => setFormData(prev => ({ ...prev, dose_interval: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Doses</label>
                <input type="number" value={formData.total_doses}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_doses: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input type="number" value={formData.stock_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input value={formData.manufacturer}
                  onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Pfizer" />
              </div>
            </div>
            <button onClick={handleSubmit}
              className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Vaccine
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Vaccines in this Campaign</h3>
          {vaccines.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No vaccines yet. Add your first one!</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Doses</th>
                  <th className="pb-3">Interval</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Manufacturer</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {vaccines.map(v => (
                  <tr key={v.vaccine_id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{v.name}</td>
                    <td className="py-3">{v.total_doses}</td>
                    <td className="py-3">{v.dose_interval} days</td>
                    <td className="py-3">{v.stock_quantity}</td>
                    <td className="py-3">{v.manufacturer || '-'}</td>
                    <td className="py-3">
                      <button onClick={() => handleDelete(v.vaccine_id)}
                        className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-sm hover:bg-red-100">
                        Delete
                      </button>
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