import EventForm from "@/components/EventForm";
import Login from "@/pages/Login";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import {useEffect} from "react";

export default function NewEvent() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      toast.error("You are not logged in.");
    }
  }, [session]);
  return (
    <Login>
      <h1 className="text-2xl font-bold mb-4">New Student</h1>
      <EventForm />
    </Login>
  );
}