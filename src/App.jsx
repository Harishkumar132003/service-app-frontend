import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import MemberDashboard from './pages/member/MemberDashboard.jsx'
import MemberProfile from './pages/member/MemberProfile.jsx'
import MemberLayout from './components/member/MemberLayout.jsx'
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx'
import ProviderDashboard from './pages/provider/ProviderDashboard.jsx'
import ProviderProfile from './pages/provider/ProviderProfile.jsx'
import ProviderLayout from './components/provider/ProviderLayout.jsx'
import ProviderHistory from './pages/provider/ProviderHistory.jsx'
import AccountantDashboard from './pages/accountant/AccountantDashboard.jsx'
import ViewAdminHistory from './pages/admin/viewAdminHistory.jsx'
import AccountantHistory from './pages/accountant/accountantHistory.jsx'
import CompanyManagement from './pages/admin/CompanyManagement.jsx'
import Configuration from './pages/admin/Configuration.jsx'
import './style/common.scss'

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
				<Route path="/admin/configuration" element={<Configuration />} />
				<Route path="/admin/history" element={<ViewAdminHistory />} />
			</Route>
			<Route element={<ProtectedRoute allowedRoles={["user"]} />}> 
				<Route path="/user" element={<MemberLayout />}>
					<Route index element={<MemberDashboard />} />
					<Route path="profile" element={<MemberProfile />} />
				</Route>
			</Route>
			<Route element={<ProtectedRoute allowedRoles={["serviceprovider"]} />}> 
				<Route path="/serviceprovider" element={<ProviderLayout />}>
					<Route index element={<ProviderDashboard />} />
					<Route path="history" element={<ProviderHistory />} />
					<Route path="profile" element={<ProviderProfile />} />
				</Route>
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
