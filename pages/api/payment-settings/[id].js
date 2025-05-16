import { connectToDB } from "@/lib/mongoose";
import PaymentSettings from "@/models/Payment-Settings";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "GET") {
    const { id } = req.query;
    try {
      const setting = await PaymentSettings.findById(id); // <- this gets all documents
      return res.status(200).json({ setting });
    } catch (error) {
      console.error("Failed to fetch payment settings:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
