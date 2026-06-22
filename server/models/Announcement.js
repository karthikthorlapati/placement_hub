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
  // ✅ NEW — links announcement to university
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    default: null
  },
  department: {
    type: String,
    default: 'all',
    set: (val) => val && val.toLowerCase() !== 'all' ?
      val.toUpperCase().trim() : 'all'
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

module.exports = mongoose.model('Announcement', announcementSchema)