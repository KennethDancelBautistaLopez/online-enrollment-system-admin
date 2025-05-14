// pages/_app.js
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import InactivityHandler from "@/components/InactivityHandler";

export default function App({ Component, pageProps: { session, ...pageProps } }) {

  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
   <InactivityHandler timeout={2 * 60 * 60 * 1000} />
      <Component {...pageProps} />
      <Toaster
  position="top-right"
  reverseOrder={false}
  toastOptions={{
    // Default styles
    style: {
      background: "#fff",
      color: "#333",
    },
    // Dark mode overrides
    className: "dark:bg-gray-800 dark:text-white dark:border dark:border-gray-600",
    success: {
      iconTheme: {
        primary: "#22c55e", // Green
        secondary: "#f0fdf4",
      },
    },
    error: {
      iconTheme: {
        primary: "#ef4444", // Red
        secondary: "#fef2f2",
      },
    },
  }}
/>
    </SessionProvider>
  );
}
