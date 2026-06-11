const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postedByRole: {
    type: String,
    enum: ['coordinator', 'head', 'admin'],
    required: true
  },
  department: {
    type: String,
    default: 'all',
    set: (val) => val && val !== 'all' ? val.toUpperCase().trim() : 'all'
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

// Auto filter expired announcements
announcementSchema.pre('find', function() {
  this.where({
    expiryDate: { $gt: new Date() },
    isActive: true
  })
})

module.exports = mongoose.model('Announcement', announcementSchema)