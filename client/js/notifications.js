// Check if user is logged in
const user = getUser()
const token = getToken()

if (!user || !token) {
  window.location.href = '../login.html'
}

// Show student name
document.getElementById('studentName').innerText = `Hello, ${user.name}!`

// Load notifications
async function loadNotifications() {
  try {
    const res = await fetch(`${API_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const notifications = await res.json()
    displayNotifications(notifications)

  } catch (error) {
    document.getElementById('notificationsList').innerHTML =
      '<p>Error loading notifications!</p>'
  }
}

// Display notifications
function displayNotifications(notifications) {
  const notificationsList = document.getElementById('notificationsList')

  if (notifications.length === 0) {
    notificationsList.innerHTML = `
      <div class="empty-state">
        <h3>No Notifications Yet!</h3>
        <p>You will receive notifications when your application status changes.</p>
      </div>
    `
    return
  }

  notificationsList.innerHTML = notifications.map(notification => `
    <div class="notification-card ${notification.isRead ? 'read' : 'unread'}"
      onclick="markRead('${notification._id}', this)"
    >
      <div class="notification-icon">
        ${notification.type === 'application' ? '📋' : '🔔'}
      </div>
      <div class="notification-content">
        <p>${notification.message}</p>
        <span class="notification-time">
          ${new Date(notification.createdAt).toLocaleDateString()}
          ${new Date(notification.createdAt).toLocaleTimeString()}
        </span>
      </div>
      ${!notification.isRead ? '<span class="unread-dot"></span>' : ''}
    </div>
  `).join('')
}

// Mark single notification as read
async function markRead(notificationId, element) {
  try {
    await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    element.classList.remove('unread')
    element.classList.add('read')
    const dot = element.querySelector('.unread-dot')
    if (dot) dot.remove()

  } catch (error) {
    console.log('Error marking as read:', error)
  }
}

// Mark all as read
async function markAllRead() {
  try {
    const res = await fetch(`${API_URL}/notifications/mark-all/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (res.ok) {
      alert('All notifications marked as read! ✅')
      loadNotifications()
    }

  } catch (error) {
    alert('Something went wrong!')
  }
}

// Load notifications on page load
loadNotifications()