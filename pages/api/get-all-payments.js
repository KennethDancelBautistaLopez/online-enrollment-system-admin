import { connectToDB } from "@/lib/mongoose";
import Payment from "@/models/Payment";

export default async function handler(req, res) {
  if (req.method === "GET") {
    await handleGetRequest(req, res);
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

 await connectToDB();

async function handleGetRequest(req, res) {
  try {
    const { id, studentId } = req.query;
    
    // GET /api/payments?id=PAY123 - Get a specific payment
    if (id) {
      const payment = await Payment.findOne({ paymentId: id })
        .populate("studentRef", "fname mname lname _studentId course education yearLevel schoolYear semester");

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      return res.status(200).json({
        paymentId: payment.paymentId,
        amount: payment.amount,
        referenceNumber: payment.referenceNumber,
        description: payment.description,
        billingDetails: payment.billingDetails,
        fullName: `${payment.studentRef?.fname || ""} ${payment.studentRef?.mname || ""} ${payment.studentRef?.lname || ""}`.trim(),
        studentId: payment.studentRef?._studentId || "N/A",
        course: payment.studentRef?.course || "N/A",
        education: payment.studentRef?.education || "N/A",
        yearLevel: payment.studentRef?.yearLevel || "N/A",
        schoolYear: payment.studentRef?.schoolYear || "N/A",
        semester: payment.studentRef?.semester || "N/A",
        examPeriod: payment.examPeriod,
        receipt: payment.receipt || "N/A",
        status: payment.status,
      });
    }

    // GET /api/payments?studentId=ST1234 - Get all payments for 1 student
    if (studentId) {
      const payments = await Payment.find({ "studentRef._studentId": studentId, status: { $nin: ["failed", "pending"] } })
        .populate("studentRef", "fname mname lname _studentId course education yearLevel schoolYear semester");

      return res.status(200).json({
        success: true,
        data: payments.map(payment => ({
          paymentId: payment.paymentId,
          amount: payment.amount,
          referenceNumber: payment.referenceNumber,
          description: payment.description,
          billingDetails: payment.billingDetails,
          fullName: `${payment.studentRef?.fname || ""} ${payment.studentRef?.mname || ""} ${payment.studentRef?.lname || ""}`.trim(),
          studentId: payment.studentRef?._studentId || "N/A",
          course: payment.studentRef?.course || "N/A",
          education: payment.studentRef?.education || "N/A",
          yearLevel: payment.studentRef?.yearLevel || "N/A",
          schoolYear: payment.studentRef?.schoolYear || "N/A",
          semester: payment.studentRef?.semester || "N/A",
          examPeriod: payment.examPeriod,
          receipt: payment.receipt || "N/A",
          status: payment.status,
        })),
      });
    }

    // Default: Group by studentId for AllPayments.jsx
    const allPayments = await Payment.find({ status: { $nin: ["failed", "pending"] } })
      .populate("studentRef", "fname mname lname _studentId course education yearLevel schoolYear semester");

    const grouped = {};

    allPayments.forEach(payment => {
      const student = payment.studentRef;
      const sid = student?._studentId || "N/A";

      if (!grouped[sid]) {
        grouped[sid] = {
          studentId: sid,
          fullName: `${student?.fname || ""} ${student?.mname || ""} ${student?.lname || ""}`.trim(),
          course: student?.course || "N/A",
          education: student?.education || "N/A",
          yearLevel: student?.yearLevel || "N/A",
          schoolYear: student?.schoolYear || "N/A",
          semester: student?.semester || "N/A",
          payments: [],
        };
      }

      grouped[sid].payments.push({
        paymentId: payment.paymentId,
        amount: payment.amount,
        referenceNumber: payment.referenceNumber,
        description: payment.description,
        billingDetails: payment.billingDetails,
        examPeriod: payment.examPeriod,
        receipt: payment.receipt || "N/A",
        status: payment.status,
      });
    });

    return res.status(200).json({
      success: true,
      data: Object.values(grouped),
    });

  } catch (error) {
    console.error("❌ Error fetching payments:", error.message);
    return res.status(500).json({ error: "Failed to fetch payment details" });
  }
}
