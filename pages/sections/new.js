import Login from "@/pages/Login";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import {useEffect} from "react";
import SectionForm from "@/components/SectionForm";

export default function NewStudent() {
  const { data: session } = useSession();
  
  useEffect(() => {
    if (!session) {
      toast.error("You don't have permission to access this page.");
    }
  }, [session]);

  return (
    <Login>
      <h1 className="text-3xl font-bold mb-4 dark:text-white text-gray-700">New Section</h1>
      <SectionForm />
    </Login>
  );  
}