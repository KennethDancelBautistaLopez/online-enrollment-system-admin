import axios from "axios";
import { connectToDB } from "@/lib/mongoose";
import Payment from "@/models/Payment";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";

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
    const { _studentId, amount, description } = req.body;

    if (!amount || !description || !_studentId) {
      return res.status(400).json({ error: "Amount, description, and student ID are required" });
    }

    const API_KEY = process.env.PAY_MONGO;
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing PayMongo API Key" });
    }

    const encodedKey = Buffer.from(`${API_KEY}:`).toString("base64");

    // Find student by _studentId
    const student = await Student.findOne({ _studentId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Prepare billing details and metadata
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
    
    };

    // Create PayMongo payment link
    const response = await axios.post(
      "https://api.paymongo.com/v1/links",
      {
        data: {
          attributes: {
            amount: amount * 100, // Convert to cents
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

    // Create payment record in the database
    const payment = await Payment.create({
      paymentId: linkData.id, // PayMongo payment ID
      amount,
      referenceNumber: linkData.attributes.reference_number,
      description,
      billingDetails,
      studentRef: student._id, // Reference to student document
      studentId: student._studentId, // Student ID
      fullName: billingDetails.name, // Full Name of the student
      course: student.course, // Student's course
      education: student.education, // Student's education level
      yearLevel: student.yearLevel, // Student's year level
      schoolYear: student.schoolYear, // Student's school year
      status: "pending", // Payment status
      createdAt: new Date(), // Timestamp
    });

    return res.status(201).json({
      success: true,
      data: payment,
      checkoutUrl: linkData.attributes.checkout_url, // PayMongo checkout URL
    });
  } catch (error) {
    console.error("❌ PayMongo Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment creation failed" });
  }
}

async function handleGetRequest(req, res) {
  try {
    const payments = await Payment.find()
  .populate("studentRef", "fname mname lname _studentId course education yearLevel schoolYear")
  .exec();

    // Check if there are any payments
    if (payments.length === 0) {
      return res.status(404).json({ error: "No payments found" });
    }

    // Respond with all payment details and related student information
    return res.status(200).json({
      success: true,
      data: payments.map(payment => ({
        paymentId: payment.paymentId,
        amount: payment.amount,
        referenceNumber: payment.referenceNumber,
        description: payment.description,
        billingDetails: payment.billingDetails,
        fullName: `${payment.studentRef?.fname || ""} ${payment.studentRef?.mname || ""} ${payment.studentRef?.lname || ""} `,
        studentId: payment.studentRef?._studentId || "N/A",
        course: payment.studentRef?.course || "N/A",
        education: payment.studentRef?.education || "N/A",
        yearLevel: payment.studentRef?.yearLevel || "N/A",
        schoolYear: payment.studentRef?.schoolYear || "N/A",
        receipt: payment.receipt || "N/A",
        status: payment.status,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching payments:", error.message);
    // Return server error in case of failure
    return res.status(500).json({ error: "Failed to fetch payment details" });
  }
}


async function handlePutRequest(req, res) {
  try {
    const { id, amount, description, name, email, phone } = req.body;

    if (!id || !amount || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      {
        amount,
        description,
        billingDetails: { name, email, phone },
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
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Payment ID is required" });

    const deletedPayment = await Payment.findByIdAndDelete(id);
    if (!deletedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json({ success: true, message: "Payment deleted" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ error: "Failed to delete payment" });
  }
}
