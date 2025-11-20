import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  clientId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Client",
},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dueDate: {
    type: Date,
    required: true,
  },
  completedDate: Date,
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Paid"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["Unpaid", "Partially Paid", "Paid"],
    default: "Unpaid",
  },
  payments: [
    {
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      notes: String,
    },
  ],
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  tags: [String],
  attachments: [
    {
      name: String,
      url: String,
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps on save
TaskSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual field for remaining amount
TaskSchema.virtual("remainingAmount").get(function () {
  const paidAmount = this.payments.reduce(
    (total, payment) => total + payment.amount,
    0
  );
  return this.amount - paidAmount;
});

// Ensure virtuals are included in JSON output
TaskSchema.set("toJSON", { virtuals: true });
TaskSchema.set("toObject", { virtuals: true });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
