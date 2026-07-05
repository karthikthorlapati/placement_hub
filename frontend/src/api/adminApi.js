const API_URL = 'http://localhost:5000/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

export const adminApi = {
  getStats: async () => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders()
    })
    return res.json()
  },

  getUsers: async () => {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: getHeaders()
    })
    return res.json()
  },

  deleteUser: async (userId) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return res.json()
  },

  getCompanies: async () => {
    const res = await fetch(`${API_URL}/admin/companies`, {
      headers: getHeaders()
    })
    return res.json()
  },

  deleteCompany: async (companyId) => {
    const res = await fetch(`${API_URL}/admin/companies/${companyId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return res.json()
  },

  getApplications: async () => {
    const res = await fetch(`${API_URL}/admin/applications`, {
      headers: getHeaders()
    })
    return res.json()
  },

  getUniversities: async () => {
    const res = await fetch(`${API_URL}/admin/universities`, {
      headers: getHeaders()
    })
    return res.json()
  },

  toggleUniversity: async (id, isActive) => {
    const res = await fetch(`${API_URL}/admin/universities/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isActive })
    })
    return res.json()
  }
}

