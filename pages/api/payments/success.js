// /pages/api/payments/success.js
import { connectToDB } from "@/lib/mongoose";
import Payment from "@/models/Payment";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { studentId, examPeriod } = req.body;

  await connectToDB();

  try {
    console.log('Looking for payment:', studentId, examPeriod);
    const payment = await Payment.findOne({ studentId, examPeriod });
    console.log('Found payment:', payment);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // If the payment is not marked as paid, mark it as paid
    if (payment.status !== "paid") {
      payment.status = "paid";
      await payment.save();
      console.log(`Payment for ${studentId} ${examPeriod} marked as paid.`);
    }

    return res.status(200).json({ success: true, message: "Payment confirmed" });
  } catch (error) {
    console.error("Error processing payment confirmation:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
