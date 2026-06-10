import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { headApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const priorityColors = {
  high: { bg: '#f8d7da', color: '#dc3545' },
  medium: { bg: '#fff3cd', color: '#ffc107' },
  low: { bg: '#d4edda', color: '#28a745' }
}

const HeadAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('medium')
  const [department, setDepartment] = useState('all')
  const [formMsg, setFormMsg] = useState('')
  const [formErr, setFormErr] = useState('')

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const data = await headApi.getAnnouncements()
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
      const res = await headApi.createAnnouncement({
        title,
        message,
        priority,
        department
      })

      if (res.message === 'Announcement posted successfully!') {
        setFormMsg('Announcement posted successfully! ✅')
        setTitle('')
        setMessage('')
        setPriority('medium')
        setDepartment('all')
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
      await headApi.deleteAnnouncement(id)
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
            placeholder='e.g. Important Placement Update'
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

        <div className='form-row'>
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
          <div className='form-group'>
            <label>Target Department</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
            >
              <option value='all'>All Departments</option>
              <option value='CSE'>CSE</option>
              <option value='AIML'>AIML</option>
              <option value='ECE'>ECE</option>
              <option value='EEE'>EEE</option>
              <option value='MECH'>MECH</option>
              <option value='CIVIL'>CIVIL</option>
            </select>
          </div>
        </div>

        <button className='btn-primary' onClick={handlePost}>
          📢 Post Announcement
        </button>
      </div>

      {/* List */}
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
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '8px',
                    alignItems: 'center'
                  }}>
                    <h4 style={{ color: '#2c3e50', margin: 0 }}>
                      {ann.title}
                    </h4>
                    <span style={{
                      background: '#f0f0f0',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      color: '#555'
                    }}>
                      {ann.department === 'all' ?
                        'All Departments' : ann.department}
                    </span>
                  </div>
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

export default HeadAnnouncements