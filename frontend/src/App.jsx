import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import LandingPage from './pages/LandingPage'
import PatientDashboard from './pages/patient/PatientDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/login" element= {<LoginPage />} />
      <Route path="/register" element= {<RegisterPage/>} />
      <Route path="/patient/dashboard" element={<PatientDashboard/>} />
      <Route path="/doctor/dashboard" element={<div>Doctor Dashboard</div>} />
    </Routes>
  )
}