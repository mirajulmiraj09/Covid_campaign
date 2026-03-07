import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, isAdmin, isDoctor } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isAdmin) navigate('/admin/dashboard')
      else if (isDoctor) navigate('/doctor/dashboard')
      else navigate('/patient/dashboard')
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-4 py-24">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">Your Health, Our Priority</h2>
        <p className="text-xl text-gray-500 max-w-2xl mb-10">
          Manage your vaccinations easily. Book appointments, track your doses,
          and stay protected with VacciCare.
        </p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/register')}
            className="px-8 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700">
            Get Started
          </button>
          <button onClick={() => navigate('/login')}
            className="px-8 py-3 border border-blue-600 text-blue-600 text-lg rounded-lg hover:bg-blue-50">
            Login
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-16 pb-24">
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Scheduling</h3>
          <p className="text-gray-500">Book your vaccine appointments in just a few clicks.</p>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">💉</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Track Your Doses</h3>
          <p className="text-gray-500">Never miss a dose with automatic scheduling.</p>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Digital Certificate</h3>
          <p className="text-gray-500">Download your vaccination certificate anytime.</p>
        </div>
      </div>

    </div>
  )
}