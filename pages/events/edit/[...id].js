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
    if (!id) return;
    axios.get(`/api/events?id=${id}`).then(response => {
      setEventInfo(response.data);
    });
  }, [id]);

  return (
    <Login>
      <h1>Edit Event</h1>
      {eventInfo && <EventForm {...eventInfo} />}
    </Login>
  );
}
