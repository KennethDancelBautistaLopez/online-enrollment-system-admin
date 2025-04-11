import { connectToDB } from "@/lib/mongoose";
import Payment from "@/models/Payment";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { id, studentId } = req.query;

    // 📌 Get a specific payment by paymentId
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

    // 📌 Get all payments for a specific studentId
    if (studentId) {
      const payments = await Payment.find({ status: { $nin: ["failed", "pending"] } })
        .populate({
          path: "studentRef",
          match: { _studentId: studentId },
          select: "fname mname lname _studentId course education yearLevel schoolYear semester",
        });

      const studentPayments = payments.filter(p => p.studentRef !== null);

      if (studentPayments.length === 0) {
        return res.status(404).json({ error: "No payments found for this student" });
      }

      const student = studentPayments[0].studentRef;

      return res.status(200).json({
        success: true,
        student: {
          fullName: `${student.fname} ${student.mname} ${student.lname}`.trim(),
          studentId: student._studentId,
          course: student.course,
          education: student.education,
          yearLevel: student.yearLevel,
          schoolYear: student.schoolYear,
          semester: student.semester,
        },
        payments: studentPayments.map(p => ({
          examPeriod: p.examPeriod,
          referenceNumber: p.referenceNumber,
        })),
      });
    }

    console.log("Fetching payments...");
    const allPayments = await Payment.find()
      .populate("studentRef", "fname mname lname _studentId course education yearLevel schoolYear semester");
    
    console.log("Payments fetched:", allPayments);

    const grouped = {};

    for (const payment of allPayments) {
      const student = payment.studentRef;

      if (!student || !student._studentId) continue;

      const sid = student._studentId;

      if (!grouped[sid]) {
        grouped[sid] = {
          studentId: sid,
          fullName: `${student.fname} ${student.mname} ${student.lname}`.trim(),
          course: student.course || "N/A",
          education: student.education || "N/A",
          yearLevel: student.yearLevel || "N/A",
          schoolYear: student.schoolYear || "N/A",
          semester: student.semester || "N/A",
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
    }

    return res.status(200).json({
      success: true,
      data: Object.values(grouped),
    });

  } catch (error) {
    console.error("❌ Error fetching payments:", error.message);
    return res.status(500).json({ error: "Failed to fetch payment details" });
  }
}
