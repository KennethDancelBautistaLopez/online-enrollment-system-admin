import { connectToDB } from "@/lib/mongoose";
import Event from "@/models/Event";

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "GET") {
    try {
      const events = await Event.find();
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch events", details: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { title, description, date, location, eventType, organizer } = req.body;

      if (!title || !date || !location || !eventType || !organizer) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const newEvent = new Event({ title, description, date, location, eventType, organizer });
      await newEvent.save();
      return res.status(201).json(newEvent);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create event", details: error.message });
    }
  }

  if (req.method === "GET") {
    const { id } = req.query; // Get the id from query params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
  
    try {
      const event = await Event.findById(id); // Use findById to fetch a single event
  
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
  
      return res.status(200).json(event); // Return a single event object, not an array
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch event", details: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { _id } = req.body;
      await Event.findByIdAndDelete(_id);
      return res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete event", details: error.message });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
