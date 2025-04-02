import '@/styles/globals.css';
import { SessionProvider } from "next-auth/react";
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set the client-side flag after the component mounts
  }, []);

  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <Component {...pageProps} />
      {isClient && (
        <Toaster position="top-center" reverseOrder={false} />
      )}
    </SessionProvider>
  );
}
