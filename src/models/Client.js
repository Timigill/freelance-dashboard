import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    company: { type: String },
    phone: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, default: "active" },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, 
  },
  { timestamps: true }
);

// ✅ Fix model caching in Next.js (ensures schema updates apply properly)
if (mongoose.models.Client) {
  delete mongoose.models.Client;
}

export default mongoose.model("Client", ClientSchema);
