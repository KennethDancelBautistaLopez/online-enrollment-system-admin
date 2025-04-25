// pages/api/webhooks/paymongo.js
import { buffer } from 'micro';
import crypto from 'crypto';
import Payment from '@/models/Payment';
import { connectToDB } from '@/lib/mongoose';

export const config = {
  api: {
    bodyParser: false,  // Disable Next.js body parser to handle raw body
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  await connectToDB();  // Connect to MongoDB

  const rawBody = await buffer(req);
  const signatureHeader = req.headers['paymongo-signature'];
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  const [timestamp, signature] = signatureHeader?.split(',')?.map(s => s.split('=')[1]) || [];
  
  if (!timestamp || !signature) {
    return res.status(400).send('Missing signature or timestamp');
  }

  // Calculate the expected signature using HMAC
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(`${timestamp}.${rawBody}`);
  const expectedSignature = hmac.digest('hex');

  // Verify the signature
  if (signature !== expectedSignature) {
    console.warn('❌ Invalid signature. Possible spoofed request.');
    return res.status(400).send('Invalid signature');
  }

  try {
    const { data } = JSON.parse(rawBody.toString());  // Parse the raw body to get the event data
    const eventType = data?.type;
    const paymentId = data?.attributes?.id;
    const status = data?.attributes?.status;
    const referenceNumber = data?.attributes?.reference_number;

    console.log('📥 Webhook received:', eventType, paymentId, status);

    if (
      (eventType === 'link.payment.paid' || eventType === 'link.payment.failed') &&
      paymentId && referenceNumber
    ) {
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

    res.status(200).send('Webhook handled successfully');
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).send('Webhook handler error');
  }
}
