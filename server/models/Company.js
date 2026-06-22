const mongoose = require('mongoose')

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    required: true
  },
  package: {
    type: String,
    required: true
  },
  minimumCgpa: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  department: {
    type: String,
    default: 'all',
    set: (val) => val && val.toLowerCase() !== 'all' ?
      val.toUpperCase().trim() : 'all'
  },
  // ✅ NEW — links company to university
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    default: null
  },
  lastDate: {
    type: Date,
    required: true
  },
  registrationLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'closed'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

module.exports = mongoose.model('Company', companySchema)