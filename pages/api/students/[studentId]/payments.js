import Payment from "@/models/Payment";
import { connectToDB } from "@/lib/mongoose";
import { create } from "sortablejs";

export default async function handler(req, res) {
  const {
    query: { studentId },
    method,
  } = req;

  await connectToDB();

  if (method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    // Log the query to confirm the studentId
    console.log("Searching for student with ID:", studentId);

    // Fetch the student's payments from the Payment model
    const payments = await Payment.find({ studentId: studentId }).lean();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ success: false, message: "No payments found for this student" });
    }

    // Optionally, you can also get student details if needed
    const student = payments[0];  // Assuming all payments are for the same student, so we can grab the student info from the first payment.

    return res.status(200).json({
      success: true,
      fullName: `${student.fname} ${student.lname}`,
      studentId: studentId,
      course: student.course,
      education: student.education,
      yearLevel: student.yearLevel,
      schoolYear: student.schoolYear,
      semester: student.semester,
      payments: payments.map(payment => ({
        referenceNumber: payment.referenceNumber,
        amount: payment.amount,
        examPeriod: payment.examPeriod,
        date: payment.createdAt, 
        status: payment.status,
        method: payment.method,
        createdAt: payment.createdAt
      })),
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
