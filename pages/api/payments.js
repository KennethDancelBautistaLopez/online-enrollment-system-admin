import axios from "axios";
import { connectToDB } from "@/lib/mongoose"; // Ensure correct path
import Payment from "@/models/Payment"; // Ensure correct path
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectToDB();

  switch (req.method) {
    case "POST":
      return handlePostRequest(req, res);
    case "GET":
      return handleGetRequest(req, res);
    case "DELETE":
      return handleDeleteRequest(req, res);
    case "PUT":
      return handlePutRequest(req, res);
    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}

async function handlePostRequest(req, res) {
  try {
    const { amount, description, method, name, email, phone } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ error: "Amount and description are required" });
    }

    const API_KEY = process.env.PAY_MONGO;
    if (!API_KEY) {
      console.error("❌ Missing PayMongo API Key");
      return res.status(500).json({ error: "Server error: PayMongo API Key missing" });
    }

    const encodedKey = Buffer.from(`${API_KEY}:`).toString("base64");

    const response = await axios.post(
      "https://api.paymongo.com/v1/links",
      {
        data: {
          attributes: {
            amount: amount * 100, // PayMongo expects amount in cents
            description,
            redirect: {
              success: "http://localhost:3000/payments",
              failure: "http://localhost:3000/payments",
            },
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

    if (!response.data || !response.data.data) {
      return res.status(500).json({ error: "Invalid response from PayMongo" });
    }

    // Save the pending payment to the database
    const payment = await Payment.create({
      paymentId: response.data.data.id,
      amount,
      status: "pending",
      referenceNumber: response.data.data.attributes.reference_number,
      description,
      method,
      billingDetails: { name, email, phone },
    });

    console.log("Created Payment:", payment); // Log to verify creation

    res.status(201).json({
      success: true,
      data: payment,
      checkoutUrl: response.data.data.attributes.checkout_url,
    });
  } catch (error) {
    console.error("❌ PayMongo API Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || "Payment creation failed" });
  }
}

async function handleGetRequest(req, res) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    if (req.query.id) {
      if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
        return res.status(400).json({ error: "Invalid payment ID format" });
      }

      const payment = await Payment.findOne({ _id: req.query.id });

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      // Return only relevant payment fields
      return res.status(200).json({
        paymentId: payment.paymentId,
        amount: payment.amount,
        referenceNumber: payment.referenceNumber,
        description: payment.description,
        billingDetails: payment.billingDetails,
      });
    } else {
      const payments = await Payment.find();
      return res.status(200).json(payments);
    }
  } catch (error) {
    console.error("🔥 ERROR in GET /payments:", error);
    res.status(500).json({ error: "Internal server error" });
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
    const { id } = req.query; // Get the ID from the query string

    if (!id) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

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
