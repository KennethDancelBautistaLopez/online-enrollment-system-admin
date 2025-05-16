import { connectToDB } from "@/lib/mongoose";
import PaymentSettings from "@/models/Payment-Settings";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "GET") {
    try {
      const paymentSettings = await PaymentSettings.find({}); // <- this gets all documents
      return res.status(200).json({ paymentSettings });
    } catch (error) {
      console.error("Failed to fetch payment settings:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  if (req.method === "PATCH") {
    try {
      const { id, amount, email, password } = req.body;
      if (!id || !amount || !email || !password) {
        return res.status(400).json({ message: "Fields cannot be empty" });
      }

      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(401).json({ message: "Wrong Credentials" });
      }

      const passwordValidation = await bcrypt.compare(password, user.password);
      if (!passwordValidation) {
        return res.status(401).json({ message: "Wrong Credentials" });
      }

      const paymentSettings = await PaymentSettings.findByIdAndUpdate(id, {
        $set: { amount: amount },
      });
      return res.status(200).json({ message: "Exam Period Updated" });
    } catch (error) {
      console.error(error);
      res.status(500);
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
