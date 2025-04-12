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
  
      {/* Event Title */}
      <div className="space-y-2">
        <label
          htmlFor="eventTitle"
          className="text-gray-700 dark:text-gray-200"
        >
          Event Title
        </label>
        <input
          id="eventTitle"
          type="text"
          placeholder="Enter event title"
          value={titleState}
          onChange={(ev) => setTitle(ev.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400
                     dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500"
        />
      </div>
  
      {/* Description */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-gray-700 dark:text-gray-200"
        >
          Description
        </label>
        <textarea
          id="description"
          placeholder="Enter event description"
          value={descriptionState}
          onChange={(ev) => setDescription(ev.target.value)}
          required
          className="w-full p-3 border rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400
                     dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500"
        />
      </div>
  
      {/* Date */}
      <div className="space-y-2">
        <label
          htmlFor="eventDate"
          className="text-gray-700 dark:text-gray-200"
        >
          Date
        </label>
        <input
          id="eventDate"
          type="date"
          min="2024-01-01"
          value={dateState}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400
                     dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500"
        />
      </div>
  
      {/* Location */}
      <div className="space-y-2">
        <label
          htmlFor="location"
          className="text-gray-700 dark:text-gray-200"
        >
          Location
        </label>
        <input
          id="location"
          type="text"
          placeholder="Enter location"
          value={locationState}
          onChange={(ev) => setLocation(ev.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400
                     dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500"
        />
      </div>
  
      {/* Event Type */}
      <div className="space-y-2">
        <label
          htmlFor="eventType"
          className="text-gray-700 dark:text-gray-200"
        >
          Event Type
        </label>
        <select
          id="eventType"
          value={eventTypeState}
          onChange={(ev) => setEventType(ev.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400
                     dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
        >
          <option value="">Select Type</option>
          <option value="Seminar">Seminar</option>
          <option value="Workshop">Workshop</option>
          <option value="Competition">Competition</option>
        </select>
      </div>
  
      {/* Organizer */}
      <div className="space-y-2">
        <label
          htmlFor="organizer"
          className="text-gray-700 dark:text-gray-200"
        >
          Organizer
        </label>
        <input
          id="organizer"
          type="text"
          placeholder="Organizer name"
          value={organizerState}
          onChange={(ev) => setOrganizer(ev.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400
                     dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500"
        />
      </div>
  
      {/* Submit */}
      <div>
        <button
          type="submit"
          className="w-full p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors
                     dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Save Event
        </button>
      </div>
    </form>
  );
}
