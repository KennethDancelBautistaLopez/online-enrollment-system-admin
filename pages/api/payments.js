import axios from "axios";
import { connectToDB } from "@/lib/mongoose";
import Payment from "@/models/Payment";
import Student from "@/models/Student";
export default async function handler(req, res) {
  await connectToDB();

  switch (req.method) {
    case "GET":
      return handleGetRequest(req, res);
      case "PUT":
        return handlePutRequest(req, res);
      case "DELETE":
        if (req.query.id) {
          return handleDeleteRequest(req, res); // Single delete
        } else if (req.query.deleteAll) {
          return handleDeleteAllRequest(req, res); // Delete all
        }
        break;
      default:
        return res.status(405).json({ error: "Method Not Allowed" });
    }
  }

async function handlePutRequest(req, res) {
  const { paymentId, status } = req.body;

  if (!paymentId || !["paid", "failed", "refund"].includes(status)) {
    return res.status(400).json({ error: "Invalid paymentId or status" });
  }

  const updated = await Payment.findOneAndUpdate(
    { paymentId },
    { status },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ error: "Payment not found" });
  }

  return res.status(200).json({ success: true, data: updated });
}

async function handleGetRequest(req, res) {
  try {
    const { id, type, studentId } = req.query;

    if (studentId) {
      const payments = await Payment.find({ studentRef: studentId })
        .populate("studentRef")
        .exec();

      const formatted = payments.map((payment) => {
        const student = payment.studentRef || {};
        const fullName = `${payment.fname || ""} ${payment.mname || ""} ${payment.lname || ""}`.trim();

        return {
          paymentId: payment.paymentId,
          amount: payment.amount,
          referenceNumber: payment.referenceNumber,
          description: payment.description,
          billingDetails: payment.billingDetails,
          fullName,
          studentId: payment.studentId || "N/A",
          course: payment.course || "N/A",
          education: payment.education || "N/A",
          yearLevel: payment.yearLevel || "N/A",
          schoolYear: payment.schoolYear || "N/A",
          semester: payment.semester || "N/A",
          examPeriod: payment.examPeriod,
          receipt: payment.receipt || "N/A",
          status: payment.status,
        };
      });

      return res.status(200).json({ success: true, data: formatted });
    }

    if (id) {
      const payment = await Payment.findOne({ paymentId: id })
        .populate("studentRef")
        .exec();

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      const fullName = `${payment.fname || ""} ${payment.mname || ""} ${payment.lname || ""}`.trim();

      if (type === "minimal") {
        return res.status(200).json({
          success: true,
          data: {
            amount: payment.amount,
            referenceNumber: payment.referenceNumber,
            fname: payment.fname || "N/A",
            lname: payment.lname || "N/A",
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          paymentId: payment.paymentId,
          amount: payment.amount,
          referenceNumber: payment.referenceNumber,
          description: payment.description,
          billingDetails: payment.billingDetails,
          fullName,
          studentId: payment.studentId || "N/A",
          course: payment.course || "N/A",
          education: payment.education || "N/A",
          yearLevel: payment.yearLevel || "N/A",
          schoolYear: payment.schoolYear || "N/A",
          semester: payment.semester || "N/A",
          examPeriod: payment.examPeriod,
          receipt: payment.receipt || "N/A",
          status: payment.status,
        },
      });
    }

    // Get all payments
    const allPayments = await Payment.find().populate("studentRef").exec();

    const formattedPayments = allPayments.map((payment) => {
      const fullName = `${payment.fname || ""} ${payment.mname || ""} ${payment.lname || ""}`.trim();

      return {
        paymentId: payment.paymentId,
        amount: payment.amount,
        referenceNumber: payment.referenceNumber,
        description: payment.description,
        billingDetails: payment.billingDetails,
        fullName,
        studentId: payment.studentId || "N/A",
        course: payment.course || "N/A",
        education: payment.education || "N/A",
        yearLevel: payment.yearLevel || "N/A",
        schoolYear: payment.schoolYear || "N/A",
        semester: payment.semester || "N/A",
        examPeriod: payment.examPeriod,
        receipt: payment.receipt || "N/A",
        status: payment.status,
      };
    });

    return res.status(200).json({ success: true, data: formattedPayments });
  } catch (error) {
    console.error("❌ Error fetching payment(s):", error.message);
    return res.status(500).json({ error: "Failed to fetch payment data" });
  }
}

async function handleDeleteRequest(req, res) {
  const { id } = req.query;

  try {
    if (!id) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    const payment = await Payment.findOne({ paymentId: id }).exec();
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const student = await Student.findById(payment.studentRef);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Safe filter in case student.payments is undefined
    student.payments = (student.payments || []).filter(
      (paymentId) => paymentId.toString() !== payment._id.toString()
    );

    student.totalPaid -= payment.amount;
    student.balance = student.tuitionFee - student.totalPaid;

    await student.save();
    await payment.deleteOne();

    return res.status(200).json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return res.status(500).json({ error: "Failed to delete payment" });
  }
}

async function handleDeleteAllRequest(req, res) {
  try {
    const payments = await Payment.find(); 
    if (payments.length === 0) {
      return res.status(404).json({ error: "No payments found" });
    }

    // Delete all payments and update students
    for (let payment of payments) {
      const student = await Student.findById(payment.studentRef);
      if (student) {
        student.payments = student.payments.filter(
          (paymentId) => paymentId.toString() !== payment._id.toString()
        );
        student.totalPaid -= payment.amount;
        student.balance = student.tuitionFee - student.totalPaid;
        await student.save();
      }

      // Delete the payment itself
      await payment.deleteOne();
    }

    return res.status(200).json({ success: true, message: "All payments deleted successfully" });
  } catch (error) {
    console.error("Error deleting all payments:", error);
    return res.status(500).json({ error: "Failed to delete payments" });
  }
}