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

    const existingPaymentForPeriod = await Payment.findOne({
      studentId: _studentId,
      examPeriod,
      status: { $ne: "failed" }, // only block if it's not failed
    });

    if (existingPaymentForPeriod) {
      let errorMessage = "";

      if (examPeriod === "downpayment") {
        errorMessage = "Downpayment has already been made by this student.";
      } else {
        errorMessage = `${examPeriod} payment has already been made by this student.`;
      }
      return res.status(400).json({ error: errorMessage });
    }

    // Set default tuitionFee if not set or zero
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

    // Create PayMongo link
    const response = await axios.post(
      "https://api.paymongo.com/v1/links",
      {
        data: {
          attributes: {
            amount: amount * 100, // cents
            description,
            redirect: {
              success: "http://localhost:3000/payments/success",
              failure: "http://localhost:3000/payments/failure",
            },
            billing: billingDetails,
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

    const linkData = response.data.data;

    // Save payment
    const payment = await Payment.create({
      paymentId: linkData.id,
      amount,
      referenceNumber: linkData.attributes.reference_number,
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
      status: "pending",
      examPeriod,
      createdAt: new Date(),
    });

    // 💰 Update student payment fields
    student.payments.push(payment._id);
    student.totalPaid += amount;
    student.balance = student.tuitionFee - student.totalPaid;
    await student.save();

    return res.status(201).json({
      success: true,
      data: payment,
      checkoutUrl: linkData.attributes.checkout_url,
    });
  } catch (error) {
    console.error("❌ PayMongo Error:", error.response?.data || error.message);
    return res.status(500).json({ error: error.message || "Payment creation failed" });
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


async function handlePutRequest(req, res) {
  try {
    const { id, amount, description, fname, mname, lname , studentId, lrn, education, course, yearLevel, schoolYear, semester,  } = req.body;

    if (!id || !amount || !description || !fname || !lname || !studentId || !lrn || !education || !yearLevel || !schoolYear || !semester) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      {
        amount,
        description,
        fname,
        mname,
        lname,
        studentId,
        lrn,
        education,
        course,
        yearLevel,
        schoolYear,
        semester
      },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function handleDeleteRequest(req, res) {
  const { id } = req.query; // Get the dynamic 'id' from the URL

  try {
    if (!id) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    // Find the payment based on the 'id'
    const payment = await Payment.findOne({ paymentId: id }).exec();
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Find the student related to this payment
    const student = await Student.findById(payment.studentRef);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Remove the payment reference from the student's payments array
    student.payments = student.payments.filter(
      (paymentId) => paymentId.toString() !== payment._id.toString()
    );

    // Update the student's totalPaid and balance
    student.totalPaid -= payment.amount;
    student.balance = student.tuitionFee - student.totalPaid;

    // Save the student data
    await student.save();

    // Delete the payment record
    await payment.deleteOne();

    return res.status(200).json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return res.status(500).json({ error: "Failed to delete payment" });
  }
}