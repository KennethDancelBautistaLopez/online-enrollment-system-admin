import Login from "@/pages/Login";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/Loading";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [showDescription, setShowDescription] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
  
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
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
        const errorMessage = error.response?.data?.message || error.message || "Failed to load events. Please try again.";
        toast.error(`Error: ${errorMessage} 🚨`);
      }).finally(() => {
        setLoading(false);
      })
  }, [session]);

  useEffect(() => {

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

        {loading ? (<LoadingSpinner />) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-2">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
              List of Events
            </h1>
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg border border-blue-700 shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 fill-current text-white"
                viewBox="0 -960 960 960"
              >
                <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
              </svg>
              Add New Event
            </Link>
          </div>
    
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search events by title, description, etc."
            className="w-full p-3 mb-6 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
    
          <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <table className="min-w-full text-left table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border p-2 dark:border-gray-700 dark:text-gray-300">ID</th>
                  <th className="border p-2 dark:border-gray-700 dark:text-gray-300">Title</th>
                  <th className="border p-2 dark:border-gray-700 dark:text-gray-300">Description</th>
                  <th className="border p-2 dark:border-gray-700 dark:text-gray-300">Date</th>
                  <th className="border p-2 dark:border-gray-700 dark:text-gray-300">Location</th>
                  <th className="border p-2 dark:border-gray-700 dark:text-gray-300">Event Type</th>
                  <th className="border p-2 dark:border-gray-700 dark:text-gray-300">Organizer</th>
                  <th className="border p-2 dark:border-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4 dark:text-gray-300">
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
                      <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="border p-2 dark:border-gray-700 dark:text-gray-200">{index + 1}</td>
                        <td className="border p-2 dark:border-gray-700 dark:text-gray-200">{event.title}</td>
                        <td
                          className="border p-2 dark:border-gray-700 dark:text-gray-200"
                          onClick={() => {
                            if (isMobile) setShowDescription(!showDescription);
                          }}
                          title={isMobile ? "Tap to toggle description" : ""}
                        >
                          {isMobile ? (
                            showDescription ? (
                              <div className="overflow-x-auto whitespace-nowrap md:overflow-visible md:whitespace-normal">
                                {event.description}
                              </div>
                            ) : (
                              "Tap to show description"
                            )
                          ) : (
                            event.description
                          )}
                        </td>
                        <td className="border p-2 dark:border-gray-700 dark:text-gray-200">{formattedDate}</td>
                        <td className="border p-2 dark:border-gray-700 dark:text-gray-200">{event.location}</td>
                        <td className="border p-2 dark:border-gray-700 dark:text-gray-200">{event.eventType}</td>
                        <td className="border p-2 dark:border-gray-700 dark:text-gray-200">
                          <div className="flex justify-center gap-2">
                          {event.organizer}
                          </div></td>
                        <td className="border p-2 text-center align-middle dark:border-gray-700">
                          <div className="flex justify-center gap-2">
                        <Link
                          href={`/events/edit/${event._id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-200 hover:bg-yellow-400 text-yellow-700 rounded-md text-sm font-medium transition-all duration-200 dark:text-yellow-700 dark:hover:bg-yellow-600 dark:hover:text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 -960 960 960"
                            fill="currentColor"
                          >
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                          </svg>
                          Edit
                        </Link>
                        <Link
                          href={`/events/delete/${event._id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-red-200 hover:bg-red-400 text-red-600 rounded-md text-sm font-medium transition-all duration-200 dark:text-red-700 dark:hover:bg-red-600 dark:hover:text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 -960 960 960"
                            fill="currentColor"
                          >
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                          </svg>
                          Delete
                        </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </Login>
  );
  
}
