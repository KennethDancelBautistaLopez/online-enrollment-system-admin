// /pages/api/payments/failure.js
import {connectToDB} from "@/lib/mongoose";
import Payment from "@/models/Payment";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { studentId, examPeriod } = req.body;

  await connectToDB();

  try {
    const payment = await Payment.findOneAndUpdate(
      { studentId, examPeriod },
      { status: "failed" },
      { new: true }
    );

    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
