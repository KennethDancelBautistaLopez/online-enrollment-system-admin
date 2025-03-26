import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function EventForm({ _id, title: existingTitle, description: existingDescription, date: existingDate, location: existingLocation, eventType: existingEventType, organizer: existingOrganizer }) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [date, setDate] = useState(existingDate || "");
  const [location, setLocation] = useState(existingLocation || "");
  const [eventType, setEventType] = useState(existingEventType || "");
  const [organizer, setOrganizer] = useState(existingOrganizer || "");
  const router = useRouter();

  useEffect(() => {
    console.log("Editing event:", { _id, existingTitle, existingDescription, existingDate, existingLocation, existingEventType, existingOrganizer });
  }, []);

  async function saveEvent(ev) {
    ev.preventDefault();
    const data = { title, description, date, location, eventType, organizer };

    try {
      if (_id) {
        await axios.put("/api/events", { ...data, _id });
      } else {
        await axios.post("/api/events", data);
      }
      router.push("/events");
    } catch (error) {
      console.error("Error saving event:", error);
    }
  }

  return (
    <form onSubmit={saveEvent} className="space-y-4">
      <label>Event Title</label>
      <input type="text" placeholder="Enter event title" value={title} onChange={(ev) => setTitle(ev.target.value)} required />

      <label>Description</label>
      <textarea placeholder="Enter event description" value={description} onChange={(ev) => setDescription(ev.target.value)} required />

      <label>Date</label>
      <input type="date" value={date} onChange={(ev) => setDate(ev.target.value)} required />

      <label>Location</label>
      <input type="text" placeholder="Enter location" value={location} onChange={(ev) => setLocation(ev.target.value)} required />

      <label>Event Type</label>
      <select value={eventType} onChange={(ev) => setEventType(ev.target.value)} required>
        <option value="">Select Type</option>
        <option value="Seminar">Seminar</option>
        <option value="Workshop">Workshop</option>
        <option value="Competition">Competition</option>
      </select>

      <label>Organizer</label>
      <input type="text" placeholder="Organizer name" value={organizer} onChange={(ev) => setOrganizer(ev.target.value)} required />

      <button type="submit" className="btn-primary">Save Event</button>
    </form>
  );
}