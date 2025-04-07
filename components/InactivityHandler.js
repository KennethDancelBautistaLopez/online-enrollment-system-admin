// components/InactivityHandler.js
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";

const InactivityHandler = ({ timeout = 10 * 60 * 1000 }) => {
  useEffect(() => {
    let timer;

    const handleLogout = () => {
      toast("Logged out due to inactivity", { icon: "⏳" });
      signOut(); // This will redirect to your login page
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(handleLogout, timeout);
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer(); // Start the timer on mount

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [timeout]);

  return null;
};

export default InactivityHandler;
