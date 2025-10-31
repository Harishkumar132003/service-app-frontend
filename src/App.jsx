import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

function Admin() { return <div style={{ padding: 16 }}>Admin Dashboard</div> }
function User() { return <div style={{ padding: 16 }}>User Dashboard</div> }
function ServiceProvider() { return <div style={{ padding: 16 }}>Service Provider Dashboard</div> }
function Accountant() { return <div style={{ padding: 16 }}>Accountant Dashboard</div> }

function RoleRedirect() {
	const { role } = useAuth()
	switch (role) {
		case 'admin': return <Navigate to="/admin" replace />
		case 'user': return <Navigate to="/user" replace />
		case 'serviceprovider': return <Navigate to="/serviceprovider" replace />
		case 'accountant': return <Navigate to="/accountant" replace />
		default: return <Navigate to="/login" replace />
	}
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/" element={<RoleRedirect />} />
			<Route element={<ProtectedRoute allowedRoles={["admin"]} />}> 
				<Route path="/admin" element={<Admin />} />
			</Route>
			<Route element={<ProtectedRoute allowedRoles={["user"]} />}> 
				<Route path="/user" element={<User />} />
			</Route>
			<Route element={<ProtectedRoute allowedRoles={["serviceprovider"]} />}> 
				<Route path="/serviceprovider" element={<ServiceProvider />} />
			</Route>
			<Route element={<ProtectedRoute allowedRoles={["accountant"]} />}> 
				<Route path="/accountant" element={<Accountant />} />
			</Route>
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	)
}

export default function App() {
	return (
		<AuthProvider>
			<AppRoutes />
		</AuthProvider>
	)
}
