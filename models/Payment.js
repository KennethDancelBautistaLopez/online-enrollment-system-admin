

import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true }, // PayMongo payment ID
  amount: { type: Number, required: true },
  referenceNumber: { type: String, unique: true }, // PayMongo reference
  description: { type: String },
  billingDetails: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  createdAt: { type: Date, default: Date.now }, // Auto timestamp
});

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);