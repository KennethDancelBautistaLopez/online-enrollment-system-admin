import Login from "@/pages/Login";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();

  // Show a toast when the session is successfully loaded
  useEffect(() => {
    if (status === "authenticated") {
      toast.success(`Welcome, ${session.user.email}! 🎉`);
    }
  }, [status, session]); // Depend on session and status to re-run the effect

  return (
    <Login>
      <div className="text-blue-900 flex justify-between">
        <h2>
          Hello, <b>{session?.user?.email}</b> {/* Displaying the email */}
        </h2>
        <div className="flex bg-gray-300 gap-1 text-black rounded-lg overflow-hidden">
          <span className="px-2">
            {session?.user?.email} {/* Displaying the email */}
          </span>
        </div>
      </div>
    </Login>
  );
}
