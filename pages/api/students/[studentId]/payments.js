// pages/api/students/[studentId]/payments.js
import Payment from "@/models/Payment";
import { connectToDB } from "@/lib/mongoose";

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
    console.log("Searching for student with ID:", studentId);

    const payments = await Payment.find({ studentId }).lean();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ success: false, message: "No payments found for this student" });
    }

    const student = payments[0]; // assuming all have same student info

    const mapPayment = (payment) => ({
      referenceNumber: payment.referenceNumber,
      amount: payment.amount,
      examPeriod: payment.examPeriod,
      date: payment.createdAt,
      status: payment.status,
      method: payment.method,
      createdAt: payment.createdAt,
    });

    const firstSemPayments = payments
      .filter(p => p.semester === "1st Semester")
      .map(mapPayment);

    const secondSemPayments = payments
      .filter(p => p.semester === "2nd Semester")
      .map(mapPayment);

    return res.status(200).json({
      success: true,
      fullName: `${student.fname} ${student.mname} ${student.lname}`,
      studentId,
      course: student.course,
      education: student.education,
      yearLevel: student.yearLevel,
      schoolYear: student.schoolYear,
      payments: {
        firstSemester: firstSemPayments,
        secondSemester: secondSemPayments,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
