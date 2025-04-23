import { buffer } from "micro";
import crypto from "crypto";
import Payment from "@/models/Payment";
import { connectToDB } from "@/lib/mongoose";

export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  await connectToDB();

  const rawBody = await buffer(req);
  const signatureHeader = req.headers["paymongo-signature"];
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  const [timestamp, signature] = signatureHeader?.split(",")?.map(s => s.split("=")[1]) || [];
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(`${timestamp}.${rawBody}`);
  const expectedSignature = hmac.digest("hex");

  if (signature !== expectedSignature) {
    console.warn("❌ Invalid signature. Possible spoofed request.");
    res.status(400).end("Invalid signature");
    return;
  }

  try {
    const { data } = JSON.parse(rawBody.toString());
    const eventType = data?.type;
    const paymentId = data?.attributes?.id;
    const status = data?.attributes?.status;
    const referenceNumber = data?.attributes?.reference_number;

    console.log("📥 Webhook received:", eventType, paymentId, status);

    if ((eventType === "payment.paid" || eventType === "payment.failed") && paymentId && referenceNumber) {
      const updated = await Payment.findOneAndUpdate(
        { paymentId, referenceNumber },
        { status },
        { new: true }
      );

      if (updated) {
        console.log(`✅ Payment ${status} for`, referenceNumber);
      } else {
        console.warn(`⚠️ Webhook received but payment not found: ${paymentId}`);
      }
    }

    res.status(200).end("Webhook handled");
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).end("Webhook handler error");
  }
}