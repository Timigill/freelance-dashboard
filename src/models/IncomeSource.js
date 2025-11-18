  import mongoose from "mongoose";

  const IncomeSourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    frequency: {
      type: String,
      enum: ["One-time", "Weekly", "Monthly", "Yearly"],
      default: "Monthly",
    },
    description: String,
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    clientName: String,
    type: {
      type: String,
      enum: ["Fixed Salary", "Task-Based Salary", "Freelance"],
    },
    isActive: { type: Boolean, default: true },
    payments: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        status: {
          type: String,
          enum: ["Pending", "Paid", "Overdue"],
          default: "Pending",
        },
        notes: String,
      },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  IncomeSourceSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
  });

  export default mongoose.models.IncomeSource ||
    mongoose.model("IncomeSource", IncomeSourceSchema);
