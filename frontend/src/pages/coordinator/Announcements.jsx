import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { coordinatorApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const expiryColors = (expiryDate) => {
  const today = new Date()
  const expiry = new Date(expiryDate)

  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil(
    (expiry - today) / (1000 * 60 * 60 * 24)
  )

  if (diffDays <= 0) {
    return {
      color: '#dc3545',
      label: 'Expires Today!'
    }
  }

  if (diffDays <= 3) {
    return {
      color: '#e67e22',
      label: `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`
    }
  }

  return {
    color: '#28a745',
    label: `Expires on ${formatDate(expiryDate)}`
  }
}

const CoordinatorAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [formMsg, setFormMsg] = useState('')
  const [formErr, setFormErr] = useState('')

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const data = await coordinatorApi.getAnnouncements()
      setAnnouncements(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async () => {
    setFormMsg('')
    setFormErr('')

    if (!title || !message || !expiryDate) {
      setFormErr('Please fill all fields including expiry date!')
      return
    }

    try {
      const res = await coordinatorApi.createAnnouncement({
        title,
        message,
        expiryDate
      })

      if (res.message === 'Announcement posted successfully!') {
        setFormMsg('Announcement posted successfully! ✅')
        setTitle('')
        setMessage('')
        setExpiryDate('')
        loadAnnouncements()
      } else {
        setFormErr(res.message)
      }
    } catch (error) {
      setFormErr('Something went wrong!')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return

    try {
      await coordinatorApi.deleteAnnouncement(id)
      loadAnnouncements()
    } catch (error) {
      console.log('Error:', error)
    }
  }

  return (
    <Layout>
      <h2 className='page-title'>📢 Announcements</h2>

      {/* Post Form */}
      <div className='section'>
        <h3>➕ Post New Announcement</h3>

        {formMsg && <div className='success-msg'>{formMsg}</div>}
        {formErr && <div className='error-msg'>{formErr}</div>}

        <div className='form-group'>
          <label>Title *</label>
          <input
            type='text'
            placeholder='e.g. TCS Drive Tomorrow!'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className='form-group'>
          <label>Message *</label>
          <textarea
            placeholder='Write your announcement here...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ height: '100px' }}
          />
        </div>

        <div className='form-group'>
          <label>
            Expiry Date * (Announcement auto deletes after this date)
          </label>
          <input
            type='date'
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <button className='btn-primary' onClick={handlePost}>
          📢 Post Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className='section'>
        <h3>Active Announcements ({announcements.length})</h3>

        {loading ? (
          <div className='loading'>Loading...</div>
        ) : announcements.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>
            No active announcements!
          </p>
        ) : (
          announcements.map((ann) => {
            const expiry = expiryColors(ann.expiryDate)

            return (
              <div
                key={ann._id}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderLeft: `4px solid ${expiry.color}`,
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        color: '#2c3e50',
                        marginBottom: '8px'
                      }}
                    >
                      {ann.title}
                    </h4>

                    <p
                      style={{
                        color: '#555',
                        fontSize: '14px',
                        marginBottom: '8px'
                      }}
                    >
                      {ann.message}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: '15px',
                        fontSize: '12px'
                      }}
                    >
                      <span style={{ color: '#7f8c8d' }}>
                        Posted: {formatDate(ann.createdAt)}
                      </span>

                      <span
                        style={{
                          color: expiry.color,
                          fontWeight: 'bold'
                        }}
                      >
                        ⏰ {expiry.label}
                      </span>
                    </div>
                  </div>

                  <button
                    className='btn-danger'
                    onClick={() => handleDelete(ann._id)}
                    style={{ marginLeft: '15px' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Layout>
  )
}

export default CoordinatorAnnouncements