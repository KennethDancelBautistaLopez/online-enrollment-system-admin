import Login from "@/pages/Login";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

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
