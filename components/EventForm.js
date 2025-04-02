import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function EventForm({ _id, title, description, date, location, eventType, organizer }) {
  const [titleState, setTitle] = useState(title || "");
  const [descriptionState, setDescription] = useState(description || "");
  const [dateState, setDate] = useState(date || "");
  const [locationState, setLocation] = useState(location || "");
  const [eventTypeState, setEventType] = useState(eventType || "");
  const [organizerState, setOrganizer] = useState(organizer || "");
  const router = useRouter();

  useEffect(() => {
    console.log("Editing event:", { _id, title, description, date, location, eventType, organizer });
  }, [ _id, title, description, date, location, eventType, organizer ]);

  async function saveEvent(ev) {
    ev.preventDefault();
    const data = { titleState, descriptionState, dateState, locationState, eventTypeState, organizerState };

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
      <input type="text" placeholder="Enter event title" value={titleState} onChange={(ev) => setTitle(ev.target.value)} required />

      <label>Description</label>
      <textarea placeholder="Enter event description" value={descriptionState} onChange={(ev) => setDescription(ev.target.value)} required />

      <label>Date</label>
      <input type="date" value={dateState} onChange={(ev) => setDate(ev.target.value)} required />

      <label>Location</label>
      <input type="text" placeholder="Enter location" value={locationState} onChange={(ev) => setLocation(ev.target.value)} required />

      <label>Event Type</label>
      <select value={eventTypeState} onChange={(ev) => setEventType(ev.target.value)} required>
        <option value="">Select Type</option>
        <option value="Seminar">Seminar</option>
        <option value="Workshop">Workshop</option>
        <option value="Competition">Competition</option>
      </select>

      <label>Organizer</label>
      <input type="text" placeholder="Organizer name" value={organizerState} onChange={(ev) => setOrganizer(ev.target.value)} required />

      <button type="submit" className="btn-primary">Save Event</button>
    </form>
  );
}
