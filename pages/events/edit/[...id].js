import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import EventForm from "@/components/EventForm"; // Create this component

export default function EditEventPage() {
  const [eventInfo, setEventInfo] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return; // Don't call API if id is not available
  
    const eventId = Array.isArray(id) ? id[0] : id; // If id is an array, get the first element
    
    axios.get(`/api/events?id=${eventId}`).then((response) => {
      console.log('Fetched event data:', response.data); // Log the response data to verify
      if (Array.isArray(response.data)) {
        setEventInfo(response.data[0]); // Handle case if the response is an array
      } else {
        setEventInfo(response.data); // Handle if it's a single event object
      }
    }).catch((error) => {
      console.error('Error fetching event data:', error.message);
      setError("Failed to load event data");
    });
  }, [id]);

  return (
    <Login>
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      {eventInfo && <EventForm {...eventInfo} />}
    </Login>
  );
}
