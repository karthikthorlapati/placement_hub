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
  eligibility: {
    type: String,
    default: ''
  },
  minimumCgpa: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  lastDate: {
    type: Date,
    required: true
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