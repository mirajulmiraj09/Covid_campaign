import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

export default function CampaignReviews() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('campaigns/')
      const list = res.data.data || res.data || []

      // Fetch review stats for each campaign in parallel
      const enriched = await Promise.all(
        list.map(async (c) => {
          try {
            const revRes = await api.get(`campaigns/${c.campaign_id}/reviews/`)
            return {
              ...c,
              review_count: revRes.data.count || 0,
              average_rating: revRes.data.average_rating || 0,
            }
          } catch {
            return { ...c, review_count: 0, average_rating: 0 }
          }
        })
      )
      setCampaigns(enriched)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (avg) => {
    const full = Math.round(avg)
    return (
      <span className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= full ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        ))}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 text-lg">Loading campaigns...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Campaign Reviews</h2>
        <p className="text-gray-500 mb-8">Browse campaigns and share your vaccination experience</p>

        {campaigns.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No campaigns available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <div
                key={c.campaign_id}
                onClick={() => navigate(`/patient/reviews/${c.campaign_id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              >
                {/* Color banner */}
                <div className={`h-2 ${c.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">{c.title}</h3>
                    <span
                      className={`shrink-0 ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Ended'}
                    </span>
                  </div>

                  {c.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{c.description}</p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(c.average_rating)}
                    <span className="text-sm text-gray-500">
                      {c.average_rating > 0 ? c.average_rating.toFixed(1) : 'No ratings'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{c.review_count} {c.review_count === 1 ? 'review' : 'reviews'}</span>
                    <span>{c.start_date} — {c.end_date}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>💉 {c.vaccine_count} vaccines</span>
                      {c.assigned_doctor_count > 0 && (
                        <span>👨‍⚕️ {c.assigned_doctor_count} doctors</span>
                      )}
                    </div>
                    <span className="text-blue-600 text-sm font-medium">View Details →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}