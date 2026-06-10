const API_URL = 'http://localhost:5000/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

export const coordinatorApi = {
  getStats: async () => {
    const res = await fetch(`${API_URL}/coordinator/stats`, {
      headers: getHeaders()
    })
    return res.json()
  },

  getStudents: async () => {
    const res = await fetch(`${API_URL}/coordinator/students`, {
      headers: getHeaders()
    })
    return res.json()
  },

  getCompanies: async () => {
    const res = await fetch(`${API_URL}/coordinator/companies`, {
      headers: getHeaders()
    })
    return res.json()
  },

  addCompany: async (data) => {
    const res = await fetch(`${API_URL}/coordinator/companies`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  },

  updateCompany: async (companyId, data) => {
    const res = await fetch(
      `${API_URL}/coordinator/companies/${companyId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }
    )
    return res.json()
  },

  deleteCompany: async (companyId) => {
    const res = await fetch(
      `${API_URL}/coordinator/companies/${companyId}`,
      {
        method: 'DELETE',
        headers: getHeaders()
      }
    )
    return res.json()
  },

  getCompanyReport: async (companyId) => {
    const res = await fetch(
      `${API_URL}/coordinator/company-report/${companyId}`,
      { headers: getHeaders() }
    )
    return res.json()
  },

  updateApplicationStatus: async (applicationId, status) => {
    const res = await fetch(
      `${API_URL}/coordinator/applications/${applicationId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      }
    )
    return res.json()
  },

  getAnnouncements: async () => {
  const res = await fetch(`${API_URL}/announcements/coordinator`, {
    headers: getHeaders()
  })
  return res.json()
},

createAnnouncement: async (data) => {
  const res = await fetch(`${API_URL}/announcements`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return res.json()
},

deleteAnnouncement: async (id) => {
  const res = await fetch(`${API_URL}/announcements/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  return res.json()
}
}