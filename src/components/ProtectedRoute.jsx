import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSkeleton from './ui/LoadingSkeleton'

const ProtectedRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
