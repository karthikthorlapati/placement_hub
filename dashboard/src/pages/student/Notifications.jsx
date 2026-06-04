import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { studentApi } from '../../api'
import { formatDateTime } from '../../utils/helpers'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await studentApi.getNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id) => {
    try {
      await studentApi.markNotificationRead(id)
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ))
    } catch (error) {
      console.log('Error:', error)
    }
  }

  const markAllRead = async () => {
    try {
      await studentApi.markAllRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.log('Error:', error)
    }
  }

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 className='page-title' style={{ margin: 0 }}>
          🔔 Notifications
        </h2>
        {notifications.length > 0 && (
          <button className='btn-primary' onClick={markAllRead}>
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className='empty-state'>
          <h3>No Notifications Yet!</h3>
          <p>You will receive notifications when
            your application status changes.</p>
        </div>
      ) : (
        notifications.map(notification => (
          <div
            key={notification._id}
            onClick={() => !notification.isRead && markRead(notification._id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px 20px',
              borderRadius: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              background: notification.isRead ? 'white' : '#eaf4ff',
              border: notification.isRead ?
                '1px solid #ddd' : '1px solid #3498db',
              position: 'relative'
            }}
          >
            <span style={{ fontSize: '25px' }}>
              {notification.type === 'application' ? '📋' : '🔔'}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#2c3e50', marginBottom: '4px' }}>
                {notification.message}
              </p>
              <span style={{ color: '#7f8c8d', fontSize: '12px' }}>
                {formatDateTime(notification.createdAt)}
              </span>
            </div>
            {!notification.isRead && (
              <div style={{
                width: '10px',
                height: '10px',
                background: '#3498db',
                borderRadius: '50%'
              }} />
            )}
          </div>
        ))
      )}
    </Layout>
  )
}

export default Notifications