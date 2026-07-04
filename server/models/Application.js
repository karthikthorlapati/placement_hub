const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    default: null
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'selected', 'rejected'],
    default: 'applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  timeline: [
    {
      status: {
        type: String,
        enum: ['applied', 'shortlisted', 'selected', 'rejected']
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('Application', applicationSchema)