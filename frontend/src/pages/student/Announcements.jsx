import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { coordinatorApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const priorityColors = {
  high: { bg: '#f8d7da', color: '#dc3545' },
  medium: { bg: '#fff3cd', color: '#ffc107' },
  low: { bg: '#d4edda', color: '#28a745' }
}

const CoordinatorAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('medium')
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

    if (!title || !message) {
      setFormErr('Please fill title and message!')
      return
    }

    try {
      const res = await coordinatorApi.createAnnouncement({
        title,
        message,
        priority
      })

      if (res.message === 'Announcement posted successfully!') {
        setFormMsg('Announcement posted successfully! ✅')
        setTitle('')
        setMessage('')
        setPriority('medium')
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

      {/* Post Announcement */}
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
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className='form-group'>
          <label>Message *</label>
          <textarea
            placeholder='Write your announcement here...'
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ height: '100px' }}
          />
        </div>

        <div className='form-group'>
          <label>Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value='low'>🟢 Low</option>
            <option value='medium'>🟡 Medium</option>
            <option value='high'>🔴 High</option>
          </select>
        </div>

        <button className='btn-primary' onClick={handlePost}>
          📢 Post Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className='section'>
        <h3>All Announcements ({announcements.length})</h3>
        {loading ? (
          <div className='loading'>Loading...</div>
        ) : announcements.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>No announcements yet!</p>
        ) : (
          announcements.map(ann => (
            <div
              key={ann._id}
              style={{
                background: priorityColors[ann.priority]?.bg || '#f8f9fa',
                border: `1px solid ${priorityColors[ann.priority]?.color}`,
                borderLeft: `4px solid ${priorityColors[ann.priority]?.color}`,
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>
                    {ann.title}
                  </h4>
                  <p style={{
                    color: '#555',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    {ann.message}
                  </p>
                  <p style={{ color: '#7f8c8d', fontSize: '12px' }}>
                    Posted by {ann.postedBy?.name} •
                    {formatDate(ann.createdAt)} •
                    Priority: {ann.priority}
                  </p>
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
          ))
        )}
      </div>

    </Layout>
  )
}

export default CoordinatorAnnouncements