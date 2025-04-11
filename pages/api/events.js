import { connectToDB } from "@/lib/mongoose";
import Event from "@/models/Event";
import mongoose from "mongoose"; // Ensure mongoose is imported for ID validation

export default async function handler(req, res) {
  await connectToDB();

  if (req.method === "GET") {
    const { id } = req.query; // Get the event ID from the query params
    if (id) {
      // If an ID is passed, return a single event
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      try {
        const event = await Event.findById(id); // Fetch the event by ID
        if (!event) {
          return res.status(404).json({ error: "Event not found" });
        }
        return res.status(200).json(event); // Return the event data
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch event", details: error.message });
      }
    } else {
      // If no ID is passed, return all events
      try {
        const events = await Event.find();
        return res.status(200).json(events);
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch events", details: error.message });
      }
    }
  }

  if (req.method === "POST") {
    try {
      const { title, description, date, location, eventType, organizer } = req.body;

      if (!title || !date || !location || !eventType || !organizer || !description) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const newEvent = new Event({ title, description, date, location, eventType, organizer });
      await newEvent.save();
      return res.status(201).json(newEvent);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create event", details: error.message });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query; // Get the ID from the query parameters

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    try {
      const event = await Event.findByIdAndDelete(id); // Use ID from query to delete event
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      return res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete event", details: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const { _id, title, description, date, location, eventType, organizer } = req.body;

      if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: "Invalid or missing event ID" });
      }

      // Ensure the date is valid
      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        _id,
        { title, description, date: eventDate, location, eventType, organizer },
        { new: true }
      );

      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }

      return res.status(200).json(updatedEvent);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update event", details: error.message });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
