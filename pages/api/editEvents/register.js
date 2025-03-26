import { connectToDB } from "@/lib/mongoose";
import Event from "@/models/Event";
import Student from "@/models/Student";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "PUT") {
    try {
      const { eventId, studentId } = req.body;

      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ error: "Event not found" });

      const student = await Student.findById(studentId);
      if (!student) return res.status(404).json({ error: "Student not found" });

      if (!event.attendees.includes(studentId)) {
        event.attendees.push(studentId);
        await event.save();
      }

      return res.status(200).json({ message: "Registered successfully", event });
    } catch (error) {
      return res.status(500).json({ error: "Failed to register", details: error.message });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
