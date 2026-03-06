import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Landing Page</div>} />
      <Route path="/login" element= {<LoginPage />} />
      <Route path="/register" element= {<RegisterPage/>} />
      <Route path="/patient/dashboard" element={<div>Patient Dashboard</div>} />
      <Route path="/doctor/dashboard" element={<div>Doctor Dashboard</div>} />
    </Routes>
  )
}