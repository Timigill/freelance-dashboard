import mongoose from 'mongoose'

const ClientSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

export default mongoose.models.Client || mongoose.model('Client', ClientSchema)
