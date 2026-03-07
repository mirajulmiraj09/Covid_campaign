import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin, isDoctor, isPatient } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = (path) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      location.pathname.startsWith(path)
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <h1
        onClick={() => navigate('/')}
        className="text-2xl font-bold text-blue-600 cursor-pointer"
      >
        💉 VacciCare
      </h1>

      {user && (
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button onClick={() => navigate('/admin/dashboard')} className={linkClass('/admin/dashboard')}>
                Dashboard
              </button>
              <button onClick={() => navigate('/admin/campaigns')} className={linkClass('/admin/campaigns')}>
                Campaigns
              </button>
              <button onClick={() => navigate('/admin/doctors')} className={linkClass('/admin/doctors')}>
                Doctors
              </button>
            </>
          )}

          {isDoctor && !isAdmin && (
            <>
              <button onClick={() => navigate('/doctor/dashboard')} className={linkClass('/doctor/dashboard')}>
                Dashboard
              </button>
              <button onClick={() => navigate('/doctor/campaigns')} className={linkClass('/doctor/campaigns')}>
                Campaigns
              </button>
            </>
          )}

          {isPatient && !isAdmin && (
            <>
              <button onClick={() => navigate('/patient/dashboard')} className={linkClass('/patient/dashboard')}>
                Dashboard
              </button>
              <button onClick={() => navigate('/patient/book')} className={linkClass('/patient/book')}>
                Book Vaccine
              </button>
              <button onClick={() => navigate('/patient/reviews')} className={linkClass('/patient/reviews')}>
                Reviews
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (isAdmin) navigate('/admin/profile')
              else if (isDoctor) navigate('/doctor/profile')
              else navigate('/patient/profile')
            }}
            className={linkClass('/profile')}
          >
            Profile
          </button>

          <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {isAdmin ? '🛡️ Admin' : isDoctor ? '👨‍⚕️ Doctor' : '👤 Patient'}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-red-500 border border-red-300 rounded-lg text-sm hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Register
          </button>
        </div>
      )}
    </nav>
  )
}
