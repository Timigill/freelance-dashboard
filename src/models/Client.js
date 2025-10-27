import mongoose from 'mongoose'

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Fixed', 'Salary-Based', 'Freelance', 'Task-Based', 'Uncategorized'],
    default: 'Uncategorized',
  },
  deadline: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Client || mongoose.model('Client', ClientSchema)
