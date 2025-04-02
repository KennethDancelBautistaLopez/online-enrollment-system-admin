import Login from "@/pages/Login";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
 
  const { data: session } = useSession();
  useEffect(() => {
    if (!session) {
      return;
    }
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
        toast.error("You are not logged in.");
      }
    }, [session]);
  
    if (!session) {
      return <Login />;
    }

  return (
    <Login>
      <h1 className="text-2xl font-bold mb-4">List of Events</h1>
      <Link className="btn-primary" href={"/events/new"}>
        Add New Event
      </Link>
      <table className="basic mt-4 w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Title</th>
            <th className="border border-gray-300 p-2">Description</th>
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Location</th>
            <th className="border border-gray-300 p-2">Event Type</th>
            <th className="border border-gray-300 p-2">Organizer</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event._id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2">{event.title}</td>
              <td className="border border-gray-300 p-2">{event.description}</td> 
              <td className="border border-gray-300 p-2">{new Date(event.date).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2">{event.location}</td>
              <td className="border border-gray-300 p-2">{event.eventType}</td>
              <td className="border border-gray-300 p-2">{event.organizer}</td>
              <td className="border border-gray-300 p-2 flex gap-2">
                <Link className="btn-default" href={`/events/edit/${event._id}`}>
                  Edit
                </Link>
                <Link className="btn-red" href={`/events/delete/${event._id}`}>
                delete
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Login>
  );
}
