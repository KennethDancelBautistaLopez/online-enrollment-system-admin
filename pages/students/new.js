import StudentForm from "@/components/StudentForm";
import Login from "@/pages/Login";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import {useEffect} from "react";

export default function NewStudent() {
  const { data: session } = useSession();
  
  useEffect(() => {
    if (!session) {
      toast.error("You don't have permission to access this page.");
    }
  }, [session]);

  return (
    <Login>
      <h1 className="text-2xl font-bold mb-4">New Student</h1>
      <StudentForm />
    </Login>
  );  
}