import { connectToDB } from "@/lib/mongoose";
import Payment from "@/models/Payment";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ error: "Missing studentId in query" });
    }

    // Fetch all payments made by the student
    const payments = await Payment.find({ studentId })
      .populate("studentRef", "fname mname lname _studentId course education yearLevel schoolYear semester");

    // Map and return structured response
    return res.status(200).json({
      success: true,
      data: payments.map((payment) => ({
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
        createdAt: payment.createdAt,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching student payments:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
