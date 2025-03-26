import axios from "axios";
import { connectToDB } from "@/lib/mongoose";
import Payment from "@/models/Payment";

export default async function handler(req, res) {
  await connectToDB();

  switch (req.method) {
    case "POST":
      return handlePostRequest(req, res);
    case "GET":
      return handleGetRequest(res);
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

    const payment = await Payment.create({
      paymentId: response.data.data.id,
      amount,
      status: "pending",
      referenceNumber: response.data.data.attributes.reference_number,
      description,
      method,
      billingDetails: { name, email, phone },
    });

    res.status(201).json({ 
      success: true, 
      data: payment, 
      checkoutUrl: response.data.data.attributes.checkout_url 
    });

  } catch (error) {
    console.error("❌ PayMongo API Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || "Payment creation failed" });
  }
}

async function handleGetRequest(res) {
  try {
    const payments = await Payment.find({});
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
}

async function handlePutRequest(req, res) {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Missing ID or status" });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json({ success: true, data: updatedPayment });
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
