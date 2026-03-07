import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function CampaignReviews() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [reviews, setReviews] = useState([])
  const [myReviews, setMyReviews] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [formData, setFormData] = useState({ campaign: '', rating: 5, comment: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCampaigns()
    fetchMyReviews()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('campaigns/')
      setCampaigns(res.data.data || res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMyReviews = async () => {
    try {
      const res = await api.get('reviews/my-reviews/')
      setMyReviews(res.data.data || res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCampaignReviews = async (campaignId) => {
    try {
      const res = await api.get(`campaigns/${campaignId}/reviews/`)
      setReviews(res.data.data || res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleCampaignChange = (e) => {
    const id = e.target.value
    setSelectedCampaign(id)
    setFormData(prev => ({ ...prev, campaign: id }))
    if (id) fetchCampaignReviews(id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('reviews/', formData)
      setSuccess('Review submitted successfully!')
      fetchMyReviews()
      if (selectedCampaign) fetchCampaignReviews(selectedCampaign)
      setFormData(prev => ({ ...prev, comment: '', rating: 5 }))
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data))
    }
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(rating)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">💉 VacciCare</h1>
        <button onClick={() => navigate('/patient/dashboard')}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Campaign Reviews</h2>
        <p className="text-gray-500 mb-8">Share your experience with vaccination campaigns</p>

        {error && <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6">{success}</div>}

        {/* Write Review */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Write a Review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Campaign</label>
              <select onChange={handleCampaignChange} value={selectedCampaign}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Select Campaign --</option>
                {campaigns.map(c => (
                  <option key={c.campaign_id} value={c.campaign_id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={5}>⭐⭐⭐⭐⭐ — Excellent</option>
                <option value={4}>⭐⭐⭐⭐ — Good</option>
                <option value={3}>⭐⭐⭐ — Average</option>
                <option value={2}>⭐⭐ — Poor</option>
                <option value={1}>⭐ — Very Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea value={formData.comment} rows={4}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your experience..." />
            </div>
            <button onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
              Submit Review
            </button>
          </div>
        </div>

        {/* Campaign Reviews */}
        {selectedCampaign && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Reviews for this Campaign</h3>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet for this campaign!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.review_id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{review.patient_email}</span>
                      <span>{renderStars(review.rating)}</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                    <p className="text-gray-400 text-sm mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Reviews */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">My Reviews</h3>
          {myReviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">You haven't written any reviews yet!</p>
          ) : (
            <div className="space-y-4">
              {myReviews.map(review => (
                <div key={review.review_id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{review.campaign_title}</span>
                    <span>{renderStars(review.rating)}</span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                  <p className="text-gray-400 text-sm mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}