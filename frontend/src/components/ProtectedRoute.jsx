import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAdmin, isDoctor, isPatient } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  // allowedRoles is an array like ['admin', 'doctor', 'patient']
  const roleMap = { admin: isAdmin, doctor: isDoctor, patient: isPatient }
  const hasAccess = allowedRoles.some((r) => roleMap[r])

  if (!hasAccess) return <Navigate to="/login" replace />

  return children
}
