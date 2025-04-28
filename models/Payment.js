// models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },  // Amount paid for the grading period
  referenceNumber: { type: String, unique: true },
  description: { type: String },
  method: { type: String },

  billingDetails: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },

  // Linked Student
  studentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },

  // Extra Student Info
  studentId: { type: String },
  fname: { type: String },
  mname: { type: String },
  lname: { type: String },
  course: { type: String },
  semester: { type: String },
  education: { type: String },
  yearLevel: { type: String },
  schoolYear: { type: String },

  // Exam Period (e.g., Prelim, Midterm, Finals)
  examPeriod: {
    type: String,
    enum: [
      "downpayment",
      "1st Periodic",
      "Prelim",
      "2nd Periodic",
      "Midterm",
      "3rd Periodic",
      "Pre-final",
      "4th Periodic",
      "Finals"
    ],
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "paid", "failed" , "refund"],
    default: "pending"
  },
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
