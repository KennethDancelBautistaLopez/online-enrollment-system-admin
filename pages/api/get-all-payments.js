// /pages/api/get-all-payments.js
import { connectToDB } from "@/lib/mongoose";
import Payment from "@/models/Payment";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { id, studentId, semester } = req.query;

    // 📌 Get a specific payment by paymentId
    if (id) {
      const payment = await Payment.findOne({ paymentId: id });

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      return res.status(200).json({
        paymentId: payment.paymentId,
        amount: payment.amount,
        referenceNumber: payment.referenceNumber,
        description: payment.description,
        billingDetails: payment.billingDetails,
        fullName: `${payment.fname || ""} ${payment.mname || ""} ${payment.lname || ""}`.trim() || "Unknown",
        studentId: payment.studentId || "N/A",
        course: payment.course || "N/A",
        education: payment.education || "N/A",
        yearLevel: payment.yearLevel || "N/A",
        schoolYear: payment.schoolYear || "N/A",
        semester: payment.semester || "N/A",
        examPeriod: payment.examPeriod,
        receipt: payment.receipt || "N/A",
      });
    }

    // 📌 Get all payments for a specific studentId
    if (studentId) {
      const payments = await Payment.find({ studentId });

      if (payments.length === 0) {
        return res.status(404).json({ error: "No payments found for this student" });
      }

      const student = payments[0];

      return res.status(200).json({
        success: true,
        student: {
          fullName: `${student.fname || ""} ${student.mname || ""} ${student.lname || ""}`.trim() || "Unknown",
          studentId: student.studentId,
          course: student.course || "N/A",
          education: student.education || "N/A",
          yearLevel: student.yearLevel || "N/A",
          schoolYear: student.schoolYear || "N/A",
          semester: student.semester || "N/A",
        },
        payments: payments.map(p => ({
          examPeriod: p.examPeriod,
          referenceNumber: p.referenceNumber,
          status: p.status,
        })),
      });
    }

    // 📌 Get all payments without grouping
const allPayments = await Payment.find();

const payments = allPayments
  .filter(p => !semester || p.semester === semester)
  .map(payment => ({
    paymentId: payment.paymentId,
    studentId: payment.studentId,
    fullName: `${payment.fname || ""} ${payment.mname || ""} ${payment.lname || ""}`.trim() || "Unknown",
    amount: payment.amount,
    referenceNumber: payment.referenceNumber,
    description: payment.description,
    billingDetails: payment.billingDetails,
    education: payment.education || "N/A",
    course: payment.course || "N/A",
    semester: payment.semester || "N/A",
    yearLevel: payment.yearLevel || "N/A",
    schoolYear: payment.schoolYear || "N/A",
    examPeriod: payment.examPeriod,
    receipt: payment.receipt || "N/A",
    status: payment.status,
  }));

return res.status(200).json({
  success: true,
  data: payments,
});
  } catch (error) {
    console.error("❌ Error fetching payments:", error.message);
    return res.status(500).json({ error: "Failed to fetch payment details" });
  }
}
