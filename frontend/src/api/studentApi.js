const API_URL = 'http://localhost:5000/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

export const studentApi = {
  getCompanies: async () => {
    const res = await fetch(`${API_URL}/student/companies`, {
      headers: getHeaders()
    })
    return res.json()
  },

  applyCompany: async (companyId) => {
    const res = await fetch(`${API_URL}/student/apply/${companyId}`, {
      method: 'POST',
      headers: getHeaders()
    })
    return res.json()
  },

  checkApplication: async (companyId) => {
    const res = await fetch(
      `${API_URL}/student/check-application/${companyId}`,
      { headers: getHeaders() }
    )
    return res.json()
  },

  getMyApplications: async () => {
    const res = await fetch(`${API_URL}/student/my-applications`, {
      headers: getHeaders()
    })
    return res.json()
  },

  getProfile: async () => {
    const res = await fetch(`${API_URL}/student/profile`, {
      headers: getHeaders()
    })
    return res.json()
  },

  getProfileCompletion: async () => {
    const res = await fetch(
      `${API_URL}/student/profile-completion`,
      { headers: getHeaders() }
    )
    return res.json()
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_URL}/student/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  },

  changePassword: async (data) => {
    const res = await fetch(`${API_URL}/student/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  },

 getAnnouncements: async () => {
  const res = await fetch(`${API_URL}/announcements/student`, {
    headers: getHeaders()
  })
  return res.json()
},

  getNotifications: async () => {
    const res = await fetch(`${API_URL}/notifications`, {
      headers: getHeaders()
    })
    return res.json()
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_URL}/notifications/${id}`, {
      method: 'PUT',
      headers: getHeaders()
    })
    return res.json()
  },

  markAllRead: async () => {
    const res = await fetch(`${API_URL}/notifications/mark-all/read`, {
      method: 'PUT',
      headers: getHeaders()
    })
    return res.json()
  }
}