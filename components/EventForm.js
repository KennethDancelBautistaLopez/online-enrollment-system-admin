import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

export default function EventForm({ _id, title, description, date, location, eventType, organizer }) {
  const [titleState, setTitle] = useState(title || "");
  const [descriptionState, setDescription] = useState(description || "");
  const [dateState, setDate] = useState(date || "");
  const [locationState, setLocation] = useState(location || "");
  const [eventTypeState, setEventType] = useState(eventType || "");
  const [organizerState, setOrganizer] = useState(organizer || "");
  const router = useRouter();

  useEffect(() => {
    console.log("Editing event:", { _id, title, description,  date, location, eventType, organizer });
  }, [ _id, title, description, date, location, eventType, organizer ]);

  async function saveEvent(ev) {
    ev.preventDefault();
    
    // Format the date to 'YYYY-MM-DD' string
    const eventDate = new Date(dateState).toISOString().split("T")[0];  // Converts to "YYYY-MM-DD"
    
    // Log the data to inspect the payload
    console.log("Event Data:", { titleState, descriptionState, date: eventDate, locationState, eventTypeState, organizerState });
  
    const data = {
      title: titleState,
      description: descriptionState,
      date: eventDate,
      location: locationState,
      eventType: eventTypeState,
      organizer: organizerState
    };
  
    try {
      if (_id) {
        await axios.put("/api/events", { ...data, _id });
        toast.success("Event updated successfully!");
      } else {
        await axios.post("/api/events", data);
        toast.success("Event created successfully!");
      }
      router.push("/events");
    } catch (error) {
      console.error("Error saving event:", error.response ? error.response.data : error.message);
      toast.error("Failed to save event. Please try again.");
    }
  }
  return (
    <form onSubmit={saveEvent} className="space-y-4">
      <label>Event Title</label>
      <input type="text" placeholder="Enter event title" value={titleState} onChange={(ev) => setTitle(ev.target.value)} required />

      <label>Description</label>
      <textarea placeholder="Enter event description" value={descriptionState} onChange={(ev) => setDescription(ev.target.value)} required />

      <input
        type="date"
        min="2024-01-01"
        value={dateState} // Use dateState here
        onChange={(e) => setDate(e.target.value)} // Update state correctly
      />

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
