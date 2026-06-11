const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'coordinator', 'head', 'admin'],
    required: true
  },
  department: {
  type: String,
  default: '',
  set: (val) => val ? val.toUpperCase().trim() : ''
},
  rollNumber: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  cgpa: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)