import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import MemberDashboard from './pages/member/MemberDashboard.jsx'
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx'
import ProviderDashboard from './pages/provider/ProviderDashboard.jsx'
import AccountantDashboard from './pages/accountant/AccountantDashboard.jsx'
import ViewAdminHistory from './pages/admin/viewAdminHistory.jsx'
import AccountantHistory from './pages/accountant/accountantHistory.jsx'
import CompanyManagement from './pages/admin/CompanyManagement.jsx'

function RoleRedirect() {
	const { role } = useAuth()
	switch (role) {
		case 'admin': return <Navigate to="/admin" replace />
		case 'user': return <Navigate to="/user" replace />
		case 'serviceprovider': return <Navigate to="/serviceprovider" replace />
		case 'accountant': return <Navigate to="/accountant" replace />
		case 'manager': return <Navigate to="/manager" replace />
		default: return <Navigate to="/login" replace />
	}
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/" element={<RoleRedirect />} />
			<Route element={<ProtectedRoute allowedRoles={["admin"]} />}> 
				<Route path="/admin" element={<AdminDashboard />} />
				<Route path="/admin/companies" element={<CompanyManagement />} />
				<Route path="/admin/history" element={<ViewAdminHistory />} />
			</Route>
			<Route element={<ProtectedRoute allowedRoles={["user"]} />}> 
				<Route path="/user" element={<MemberDashboard />} />
			</Route>
			<Route element={<ProtectedRoute allowedRoles={["serviceprovider"]} />}> 
				<Route path="/serviceprovider" element={<ProviderDashboard />} />
			</Route>
			<Route element={<ProtectedRoute allowedRoles={["accountant"]} />}> 
				<Route path="/accountant" element={<AccountantDashboard />} />
				<Route path="/accountant/history" element={<AccountantHistory />} />
			</Route>
			<Route element={<ProtectedRoute allowedRoles={["manager"]} />}> 
				<Route path="/manager" element={<ManagerDashboard />} />
				<Route path="/manager/history" element={<ViewAdminHistory />} />

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
