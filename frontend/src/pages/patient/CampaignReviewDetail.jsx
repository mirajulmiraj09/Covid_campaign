import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function CampaignReviewDetail() {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [formData, setFormData] = useState({ rating: 5, comment: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [campRes, revRes] = await Promise.all([
          api.get(`campaigns/${campaignId}/`),
          api.get(`campaigns/${campaignId}/reviews/`),
        ])
        setCampaign(campRes.data.data || campRes.data)
        setReviews(revRes.data.data || revRes.data || [])
        setAvgRating(revRes.data.average_rating || 0)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [campaignId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.post('reviews/', {
        campaign: campaignId,
        rating: formData.rating,
        comment: formData.comment,
      })
      setSuccess('Review submitted successfully!')
      setFormData({ rating: 5, comment: '' })
      // Refresh reviews
      const revRes = await api.get(`campaigns/${campaignId}/reviews/`)
      setReviews(revRes.data.data || revRes.data || [])
      setAvgRating(revRes.data.average_rating || 0)
    } catch (err) {
      const data = err.response?.data
      setError(data?.detail || data?.errors?.campaign?.[0] || data?.message || JSON.stringify(data))
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating) => (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </span>
  )

  const renderClickableStars = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, rating: i }))}
          className={`text-3xl transition-colors ${
            i <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
        >
          ★
        </button>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 text-lg">Loading campaign...</div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-8 py-10 text-center">
          <p className="text-gray-500 text-lg">Campaign not found.</p>
          <button onClick={() => navigate('/patient/reviews')} className="mt-4 text-blue-600 hover:underline">
            ← Back to Campaigns
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Back link */}
        <button
          onClick={() => navigate('/patient/reviews')}
          className="text-blue-600 hover:underline text-sm mb-6 inline-block"
        >
          ← Back to All Campaigns
        </button>

        {/* Campaign Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className={`h-2 ${campaign.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{campaign.title}</h2>
                {campaign.description && (
                  <p className="text-gray-500 mt-2">{campaign.description}</p>
                )}
              </div>
              <span
                className={`shrink-0 ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                  campaign.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {campaign.is_active ? 'Active' : 'Ended'}
              </span>
            </div>

            {/* Campaign Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{campaign.vaccines?.length || 0}</div>
                <div className="text-xs text-gray-500 mt-1">Vaccines</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {campaign.assigned_doctors_list?.length || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Doctors</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Avg Rating</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{reviews.length}</div>
                <div className="text-xs text-gray-500 mt-1">Reviews</div>
              </div>
            </div>

            {/* Dates */}
            <div className="mt-4 text-sm text-gray-400">
              📅 {campaign.start_date} — {campaign.end_date}
            </div>

            {/* Vaccine list */}
            {campaign.vaccines && campaign.vaccines.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Vaccines</h4>
                <div className="flex flex-wrap gap-2">
                  {campaign.vaccines.map((v) => (
                    <span
                      key={v.vaccine_id}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {v.name} — {v.available_doses} doses
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Write Review */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Write a Review</h3>

          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              {renderClickableStars()}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea
                value={formData.comment}
                rows={4}
                onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your vaccination experience..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            All Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.review_id} className="border border-gray-100 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                        {(review.patient_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">{review.patient_name}</span>
                        <p className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-600 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
