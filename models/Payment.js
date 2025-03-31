// import mongoose from "mongoose";

// const PaymentSchema = new mongoose.Schema({
//   paymentId: { type: String, required: true, unique: true },
//   amount: { type: Number, required: true },
//   status: { type: String, required: true, enum: ["pending", "paid", "failed"] },
//   description: { type: String },
//   datePaid: { type: Date },
//   settlementStatus: { type: String },
//   method: { type: String }, // GCash, Paymaya, etc.
//   billingDetails: {
//     name: { type: String },
//     email: { type: String },
//     phone: { type: String },
//   },
// });

// export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true }, // PayMongo ID
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ["pending", "paid", "failed", "refunded"], 
    default: "pending" 
  }, // Default status is "pending"
  referenceNumber: { type: String, required: true, unique: true }, // Required for tracking
  description: { type: String },
  datePaid: { type: Date }, // Timestamp when payment was completed
  settlementStatus: { type: String, default: "Pending" }, // Default settlement status
  method: { type: String }, // Payment method (e.g., GCash, PayMaya, Card)
  billingDetails: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  createdAt: { type: Date, default: Date.now }, // Auto timestamp
});

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
