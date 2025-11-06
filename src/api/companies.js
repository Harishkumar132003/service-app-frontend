import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function authHeader() {
	const t = localStorage.getItem('serviceapp_token')
	return t ? { Authorization: `Bearer ${t}` } : {}
}

// Company CRUD operations
export async function createCompany(data) {
  const res = await axios.post(`${API_BASE}/companies`, data, {
    headers: { ...authHeader() },
  });
  return res.data;
}

export async function listCompanies() {
  const res = await axios.get(`${API_BASE}/companies`, {
    headers: { ...authHeader() },
  });
  return res.data;
}

export async function getCompany(companyId) {
  const res = await axios.get(`${API_BASE}/companies/${companyId}`, {
    headers: { ...authHeader() },
  });
  return res.data;
}

export async function updateCompany(companyId, data) {
  const res = await axios.patch(`${API_BASE}/companies/${companyId}`, data, {
    headers: { ...authHeader() },
  });
  return res.data;
}

export async function deleteCompany(companyId) {
  const res = await axios.delete(`${API_BASE}/companies/${companyId}`, {
    headers: { ...authHeader() },
  });
  return res.data;
}

// Company User operations
export async function addUserToCompany(companyId, userData) {
  const res = await axios.post(
    `${API_BASE}/companies/${companyId}/users`,
    userData,
    {
      headers: { ...authHeader() },
    }
  );
  return res.data;
}

export async function getCompanyUsers(companyId) {
  const res = await axios.get(`${API_BASE}/companies/${companyId}/users`, {
    headers: { ...authHeader() },
  });
  return res.data;
}

export async function updateCompanyUser(companyId, userId, data) {
  const res = await axios.patch(
    `${API_BASE}/companies/${companyId}/users/${userId}`,
    data,
    {
      headers: { ...authHeader() },
    }
  );
  return res.data;
}

export async function removeUserFromCompany(companyId, userId) {
  const res = await axios.delete(
    `${API_BASE}/companies/${companyId}/users/${userId}`,
    {
      headers: { ...authHeader() },
    }
  );
  return res.data;
}
