import Login from "@/pages/Login";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState(""); // For search functionality

  useEffect(() => {
    if (!session) return;

    axios
      .get("/api/events")
      .then((response) => {
        setEvents(response.data);
        toast.success("Events loaded successfully! ✅");
      })
      .catch((error) => {
        console.error("❌ Error fetching events:", error);
        toast.error("Failed to load events. Please try again. 🚨");
      });
  }, [session]);

  useEffect(() => {
    if (!session) {
      toast.error("You don't have permission to access this page.");
    }
  }, [session]);

  if (!session) {
    return <Login />;
  }

  const filteredEvents = events.filter((event) =>
    `${event.title} ${event.description} ${event.date} ${event.location} ${event.eventType} ${event.organizer}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Login>
      <div className="container mx-auto p-4">
        {/* Title and Add New Event Button */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">List of Events</h1>
          <Link className="btn-primary px-6 py-3 bg-blue-500 text-white rounded-lg border border-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400" href="/students/new">
            Add new student
          </Link>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search events by title, description, etc."
          className="w-full p-3 mb-6 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">ID</th>
                <th className="border p-2">Title</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Location</th>
                <th className="border p-2">Event Type</th>
                <th className="border p-2">Organizer</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4">
                    No events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, index) => {
                  const eventDate = new Date(event.date);
                  const formattedDate = eventDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });

                  return (
                    <tr key={event._id } className="hover:bg-gray-50">
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{event.title}</td>
                      <td className="border p-2">{event.description}</td>
                      <td className="border p-2">{formattedDate}</td>
                      <td className="border p-2">{event.location}</td>
                      <td className="border p-2">{event.eventType}</td>
                      <td className="border p-2">{event.organizer}</td>
                      <td className="border p-2 flex justify-center space-x-2">
                        <Link
                          className="btn-default hover:bg-blue-600"
                          href={`/events/edit/${event._id}`}
                        >
                          Edit
                        </Link>
                        <Link
                          className="btn-default hover:bg-red-600"
                          href={`/events/delete/${event._id}`}
                        >
                          Delete
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Login>
  );
}
