import mongoose from 'mongoose'

const IncomeSourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Fixed', 'Task-Based', 'Freelance'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  frequency: {
    type: String,
    enum: ['One-time', 'Weekly', 'Monthly', 'Yearly'],
    default: 'Monthly',
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  payments: [{
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Overdue'],
      default: 'Pending',
    },
    notes: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update timestamps on save
IncomeSourceSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.IncomeSource || mongoose.model('IncomeSource', IncomeSourceSchema)