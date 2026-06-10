const API_URL = 'http://localhost:5000/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

export const headApi = {
  getStats: async () => {
    const res = await fetch(`${API_URL}/head/stats`, {
      headers: getHeaders()
    })
    return res.json()
  },

  getDepartments: async () => {
    const res = await fetch(`${API_URL}/head/departments`, {
      headers: getHeaders()
    })
    return res.json()
  },

  getStudents: async (department = 'all') => {
    const url = department === 'all'
      ? `${API_URL}/head/students`
      : `${API_URL}/head/students?department=${department}`
    const res = await fetch(url, { headers: getHeaders() })
    return res.json()
  },

  getCompanies: async () => {
    const res = await fetch(`${API_URL}/head/companies`, {
      headers: getHeaders()
    })
    return res.json()
  },

  getApplications: async () => {
    const res = await fetch(`${API_URL}/head/applications`, {
      headers: getHeaders()
    })
    return res.json()
  },

  getCompanyReport: async (companyId) => {
    const res = await fetch(
      `${API_URL}/head/company-report/${companyId}`,
      { headers: getHeaders() }
    )
    return res.json()
  },

  notifyShortlisted: async (companyId, csvFile) => {
    const formData = new FormData()
    formData.append('csvFile', csvFile)

    const res = await fetch(
      `${API_URL}/head/notify-shortlisted/${companyId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      }
    )
    return res.json()
  },

getAnnouncements: async () => {
  const res = await fetch(`${API_URL}/announcements/all`, {
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