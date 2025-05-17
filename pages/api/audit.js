import { connectToDB } from "@/lib/mongoose";
import Audit from "@/models/Audit";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "GET") {
    const { collectionName } = req.query;
    try {
      const filter = {};
      if (collectionName) {
        filter.collectionName = collectionName;
      }
      const auditLogs = await Audit.find(filter);
      return res.status(200).json({ auditLogs });
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
}
