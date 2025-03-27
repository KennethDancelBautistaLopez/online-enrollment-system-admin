import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";

export default function Login({ children }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Prevent auto-redirect
        callbackUrl: "/", // Redirect manually after success
      });
  
      if (result.error) {
        throw new Error("Invalid email or password.");
      }
  
      router.push(result.url || "/"); // Redirect on success
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-bgGray w-screen h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center w-80">
          <Logo />
          <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
          
          {error && <p className="text-red-500 mb-2">{error}</p>}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-100 p-2 px-4 rounded-lg mb-2 w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-100 p-2 px-4 rounded-lg mb-2 w-full"
          />
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-600 text-white p-2 px-4 rounded-lg w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bgGray min-h-screen">
      <div className="block md:hidden flex items-center p-4">
        <button onClick={() => setShowNav(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="flex grow justify-center mr-6">
          <Logo />
        </div>
      </div>
      <div className="flex">
        <Nav show={showNav} />
        <div className="flex-grow p-4">{children}</div>
      </div>
    </div>
  );
}
