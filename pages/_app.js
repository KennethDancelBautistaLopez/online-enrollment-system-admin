import '@/styles/globals.css';
import { SessionProvider } from "next-auth/react";
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
