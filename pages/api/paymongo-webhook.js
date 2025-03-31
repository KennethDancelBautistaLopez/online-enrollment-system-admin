import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
const API_KEY = process.env.PAY_MONGO;

const encodedKey = Buffer.from(`${API_KEY}:`).toString("base64");

const options = {
  method: "POST",
  url: "https://api.paymongo.com/v1/webhooks",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    authorization: `Basic ${encodedKey}`,
  },
  data: {
    data: {
      attributes: {
        url: webhookUrl,
        events: ["source.chargeable", "payment.paid", "payment.failed"],
      },
    },
  },
};

axios
  .request(options)
  .then((res) => console.log("Webhook registered:", res.data))
  .catch((err) => console.error("Error registering webhook:", err.response?.data || err.message));
