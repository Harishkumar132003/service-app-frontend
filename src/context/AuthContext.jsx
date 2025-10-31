import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { verifyToken, loginRequest } from '../api/auth.js'

const AuthContext = createContext(undefined)

const TOKEN_KEY = 'serviceapp_token'
const ROLE_KEY = 'serviceapp_role'

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
	const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		async function run() {
			if (!token) return
			setLoading(true)
			const res = await verifyToken(token)
			if (!res.valid) {
				localStorage.removeItem(TOKEN_KEY)
				localStorage.removeItem(ROLE_KEY)
				setToken(null)
				setRole(null)
			}
			setLoading(false)
		}
		run()
	}, [])

	async function login(identifier, password) {
		setLoading(true)
		const { ok, token: t, role: r, error } = await loginRequest(identifier, password)
		if (ok && t && r) {
			localStorage.setItem(TOKEN_KEY, t)
			localStorage.setItem(ROLE_KEY, r)
			setToken(t)
			setRole(r)
		}
		setLoading(false)
		return { ok, error }
	}

	function logout() {
		localStorage.removeItem(TOKEN_KEY)
		localStorage.removeItem(ROLE_KEY)
		setToken(null)
		setRole(null)
	}

	const value = useMemo(() => ({ token, role, login, logout, loading }), [token, role, loading])
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}
