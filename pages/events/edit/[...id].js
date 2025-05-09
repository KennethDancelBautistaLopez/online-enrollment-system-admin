import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import EventForm from "@/components/EventForm"; // Create this component
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/Loading";

export default function EditEventPage() {
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
  
    const eventId = Array.isArray(id) ? id[0] : id;
    
    axios.get(`/api/events?id=${eventId}`).then((response) => {
      if (Array.isArray(response.data)) {
        setEventInfo(response.data[0]);
        toast.success("Event details loaded successfully! 🎉");
      } else {
        setEventInfo(response.data);
        toast.success("Event details loaded successfully! 🎉");
      }
    }).catch((error) => {
      console.error('Error fetching event data:', error.message);
      setError('Failed to fetch event data');
      toast.error("Failed to fetch event data. Please try again. 🚨");
    }).finally(() => {
      setLoading(false);
    })
  }, [id]);

  return (
    <Login>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4 dark:text-white text-gray-700">Edit Event</h1>
          {eventInfo && <EventForm {...eventInfo} />}
        </>
      )}
    </Login>
  );
}
