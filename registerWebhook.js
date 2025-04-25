const axios = require('axios');

const API_KEY = 'sk_test_nPaSVmwZsUFWdFjqfxXeMYG6';
const webhookURL = 'https://online-enrollment-admin.vercel.app/api/webhooks/paymongo'; 

async function registerWebhook() {
  try {
    const response = await axios.post(
      'https://api.paymongo.com/v1/webhooks',
      {
        data: {
          attributes: {
            events: ['payment.failed', 'link.payment.paid'],
            url: webhookURL,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString('base64')}`,
        },
      }
    );
    console.log('✅ Webhook created:', response.data);
  } catch (error) {
    console.error('❌ Error registering webhook:', error.response?.data || error.message);
  }
}

registerWebhook();
