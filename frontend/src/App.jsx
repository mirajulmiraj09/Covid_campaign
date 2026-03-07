import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import LandingPage from './pages/LandingPage'
import PatientDashboard from './pages/patient/PatientDashboard'
import BookAppointment from './pages/patient/BookAppointment'
import DoctorDashboard from './pages/doctor/DoctorDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/book" element={<BookAppointment />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
    </Routes>
  )
}