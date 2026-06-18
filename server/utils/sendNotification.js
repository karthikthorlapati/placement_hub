const Notification = require('../models/Notification')

const sendNotification = async (userId, message, type = 'general') => {
  try {
    const notification = new Notification({
      user: userId,
      message,
      type
    })

    await notification.save()
    return notification
  } catch (error) {
    console.log('Notification error:', error)
    throw error
  }
}

module.exports = sendNotification