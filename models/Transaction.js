import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  studentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  transactionType: { type: String, enum: ["enrollment", "payment"], required: true },
  studentInfoSnapshot: {
    studentId: String,
    fullName: String,
    course: String,
    yearLevel: String,
    schoolYear: String,
  },
  paymentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
