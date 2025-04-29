import axios from "axios";
import { connectToDB } from "@/lib/mongoose";
import Payment from "@/models/Payment";
import Student from "@/models/Student";
export default async function handler(req, res) {
  await connectToDB();

  switch (req.method) {
    case "POST":
      return handlePostRequest(req, res);
    case "GET":
      return handleGetRequest(req, res);
    case "PUT":
      return handlePutRequest(req, res);
    case "DELETE":
      return handleDeleteRequest(req, res);
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

async function handlePostRequest(req, res) {
  try {
    const { _studentId, amount, description, examPeriod } = req.body;

    if (!amount || !description || !_studentId || !examPeriod) {
      return res.status(400).json({ error: "Amount, description, student ID, and exam period are required" });
    }

    const API_KEY = process.env.PAY_MONGO;
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing PayMongo API Key" });
    }

    const encodedKey = Buffer.from(`${API_KEY}:`).toString("base64");

    // Find student
    const student = await Student.findOne({ _studentId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check existing payment for the same exam period
    const existingPayment = await Payment.findOne({ studentId: _studentId, examPeriod });
    if (existingPayment) {
      const errorMessage = examPeriod === "downpayment"
        ? "Downpayment has already been made by this student."
        : `${examPeriod} payment has already been made by this student.`;
      return res.status(400).json({ error: errorMessage });
    }

    // Set default tuitionFee if missing
    if (!student.tuitionFee || student.tuitionFee === 0) {
      student.tuitionFee = 14000;
    }

    const billingDetails = {
      name: `${student.fname} ${student.mname || ""} ${student.lname}`,
      email: student.email,
      phone: student.mobile,
    };

    const metadata = {
      studentId: student._studentId,
      email: student.email,
      course: student.course || "",
      education: student.education || "",
      yearLevel: student.yearLevel || "",
      schoolYear: student.schoolYear || "",
      semester: student.semester || "",
    };

    // Create Checkout Session via PayMongo
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            billing: {
              name: billingDetails.name,
              email: billingDetails.email,
              phone: billingDetails.phone,
              address: {
                line1: "N/A",
                line2: "",
                city: "N/A",
                state: "N/A",
                postal_code: "0000",
                country: "PH",
              },
            },
            description,
            line_items: [
              {
                amount: amount * 100,
                currency: "PHP",
                name: examPeriod,
                quantity: 1,
              }
            ],
            payment_method_types: ["card", "gcash", "paymaya"], // ✅ FIXED: Required field
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            reference_number: `ref-${student._studentId}-${Date.now()}`,
            success_url: `https://online-enrollment-system-admin.vercel.app/successPage?studentId=${student._studentId}&examPeriod=${examPeriod}`,
            expiry_url: "https://online-enrollment-system-admin.vercel.app/expiryPage",
            cancel_url: "https://online-enrollment-system-admin.vercel.app/failurePage",
            metadata,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedKey}`,
        },
      }
    );

    const session = response.data.data;

    // Save payment info
    const payment = await Payment.create({
      paymentId: session.id,
      amount,
      referenceNumber: session.attributes.reference_number,
      description,
      billingDetails,
      studentRef: student._id,
      studentId: student._studentId,
      fname: student.fname,
      mname: student.mname,
      lname: student.lname,
      course: student.course,
      education: student.education,
      yearLevel: student.yearLevel,
      schoolYear: student.schoolYear,
      semester: student.semester,
      examPeriod,
      status: "pending",
      createdAt: new Date(),
    });

    // Update student's payment records
    student.payments.push(payment._id);
    student.totalPaid += amount;
    student.balance = student.tuitionFee - student.totalPaid;
    await student.save();

    return res.status(201).json({
      success: true,
      data: payment,
      checkoutUrl: session.attributes.checkout_url,
    });

  } catch (error) {
    console.error("❌ PayMongo Checkout Error:", error.response?.data || error.message);
    return res.status(500).json({ error: error.message || "Checkout session creation failed" });
  }
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
        const fullName = `${student.fname || ""} ${student.mname || ""} ${student.lname || ""}`.trim();
    
        return {
          paymentId: payment.paymentId,
          amount: payment.amount,
          referenceNumber: payment.referenceNumber,
          description: payment.description,
          billingDetails: payment.billingDetails,
          fullName,
          studentId: student._studentId || "N/A",
          course: student.course || "N/A",
          education: student.education || "N/A",
          yearLevel: student.yearLevel || "N/A",
          schoolYear: student.schoolYear || "N/A",
          semester: student.semester || "N/A",
          examPeriod: payment.examPeriod,
          receipt: payment.receipt || "N/A",
          status: payment.status,
        };
      });
    
      return res.status(200).json({ success: true, data: formatted });
    }

    // Fetch single payment by id
    if (id) {
      const payment = await Payment.findOne({ paymentId: id })
        .populate("studentRef")
        .exec();

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      const student = payment.studentRef || {};
      const fullName = `${student.fname || ""} ${student.mname || ""} ${student.lname || ""}`.trim();

      // Minimal version
      if (type === "minimal") {
        return res.status(200).json({
          success: true,
          data: {
            amount: payment.amount,
            referenceNumber: payment.referenceNumber,
            fname: student.fname || "N/A",
            lname: student.lname || "N/A",
          },
        });
      }

      // Full version
      return res.status(200).json({
        success: true,
        data: {
          paymentId: payment.paymentId,
          amount: payment.amount,
          referenceNumber: payment.referenceNumber,
          description: payment.description,
          billingDetails: payment.billingDetails,
          fullName: fullName,
          studentId: student._studentId || "N/A",
          course: student.course || "N/A",
          education: student.education || "N/A",
          yearLevel: student.yearLevel || "N/A",
          schoolYear: student.schoolYear || "N/A",
          semester: student.semester || "N/A",
          examPeriod: payment.examPeriod,
          receipt: payment.receipt || "N/A",
          status: payment.status,
        },
      });
    }

    // Fetch all payments
    const allPayments = await Payment.find().populate("studentRef").exec();

    const formattedPayments = allPayments.map((payment) => {
      const student = payment.studentRef || {};
      const fullName = `${student.fname || ""} ${student.mname || ""} ${student.lname || ""}`.trim();

      return {
        paymentId: payment.paymentId,
        amount: payment.amount,
        referenceNumber: payment.referenceNumber,
        description: payment.description,
        billingDetails: payment.billingDetails,
        fullName: fullName,
        studentId: student._studentId || "N/A",
        course: student.course || "N/A",
        education: student.education || "N/A",
        yearLevel: student.yearLevel || "N/A",
        schoolYear: student.schoolYear || "N/A",
        semester: student.semester || "N/A",
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