// models/Invoice.js
import mongoose from 'mongoose'

const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true }, // remove `unique: true`
  client: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Partially Paid'],
    default: 'Pending'
  },
  paid: { type: String },
  remaining: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema)
