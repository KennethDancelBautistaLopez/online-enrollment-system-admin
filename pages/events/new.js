import EventForm from "@/components/EventForm";
import Login from "@/pages/Login";

export default function NewStudent() {
  return (
    <Login>
      <h1 className="text-2xl font-bold mb-4">New Student</h1>
      <EventForm />
    </Login>
  );
}