import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
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
import CampaignReviews from './pages/patient/CampaignReviews'
import CampaignReviewDetail from './pages/patient/CampaignReviewDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageDoctors from './pages/admin/ManageDoctors'
import AdminCampaigns from './pages/admin/AdminCampaigns'
import CampaignDetail from './pages/admin/CampaignDetail'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><ManageDoctors /></ProtectedRoute>} />
      <Route path="/admin/campaigns" element={<ProtectedRoute allowedRoles={['admin']}><AdminCampaigns /></ProtectedRoute>} />
      <Route path="/admin/campaigns/:campaignId" element={<ProtectedRoute allowedRoles={['admin']}><CampaignDetail /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><ProfilePage /></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/campaigns" element={<ProtectedRoute allowedRoles={['doctor']}><ManageCampaigns /></ProtectedRoute>} />
      <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><ProfilePage /></ProtectedRoute>} />
      <Route path="/doctor/campaigns/:campaignId/vaccines" element={<ProtectedRoute allowedRoles={['doctor']}><ManageVaccines /></ProtectedRoute>} />
      <Route path="/doctor/vaccinate/:bookingId" element={<ProtectedRoute allowedRoles={['doctor']}><VaccinatePage /></ProtectedRoute>} />

      {/* Patient */}
      <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/book" element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} />
      <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><ProfilePage /></ProtectedRoute>} />
      <Route path="/patient/reviews" element={<ProtectedRoute allowedRoles={['patient']}><CampaignReviews /></ProtectedRoute>} />
      <Route path="/patient/reviews/:campaignId" element={<ProtectedRoute allowedRoles={['patient']}><CampaignReviewDetail /></ProtectedRoute>} />
    </Routes>
  )
}