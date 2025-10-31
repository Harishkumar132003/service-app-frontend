import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ allowedRoles }) {
	const { token, role } = useAuth()
	const location = useLocation()

	if (!token || !role) {
		return <Navigate to="/login" replace state={{ from: location }} />
	}

	if (!allowedRoles.includes(role)) {
		return <Navigate to="/" replace />
	}

	return <Outlet />
}
