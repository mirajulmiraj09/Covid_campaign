import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import LandingPage from './pages/LandingPage'
import PatientDashboard from './pages/patient/PatientDashboard'
import BookAppointment from './pages/patient/BookAppointment'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import ManageCampaigns from './pages/doctor/ManageCampaigns'
import ProfilePage from './pages/ProfilePage'
import ManageVaccines from './pages/doctor/ManageVaccines'
import VaccinatePage from './pages/doctor/VaccinatePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/book" element={<BookAppointment />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="doctor/ManageCampaigns" element={<ManageCampaigns />} />
      <Route path="/patient/profile" element={<ProfilePage />} />
      <Route path="/doctor/profile" element={<ProfilePage />} />
      <Route path="/doctor/campaigns/:campaignId/vaccines" element={<ManageVaccines />} />
      <Route path="/doctor/vaccinate/:bookingId" element={<VaccinatePage />} />
    </Routes>
  )
}