import mongoose from 'mongoose'

const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  client: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  paid: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema)
