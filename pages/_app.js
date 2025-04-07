// pages/_app.js
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import InactivityHandler from "@/components/InactivityHandler";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
   <InactivityHandler timeout={2 * 60 * 60 * 1000} />
      <Component {...pageProps} />
      {isClient && <Toaster position="top-center" reverseOrder={false} />}
    </SessionProvider>
  );
}
