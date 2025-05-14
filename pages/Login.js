import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import { toast } from "react-hot-toast"; // Import toast
import BackgroundWrapper from "@/components/background";
import LoginSpinner from "@/components/loginSpinner";

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
      if (result.error.includes("Invalid")) {
        throw new Error("Invalid email or password.");
      } else if (result.error.includes("Network")) {
        toast.error("Network error. Please check your connection.");
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(result.error);
      }
    }

      toast.success("Login successful! ✅"); // Success toast   
      router.push(result.url || "/"); // Redirect on success
    } catch (err) {
    console.error("Login failed:", err.message);
    setError(err.message);
    toast.error(`Login failed: ${err.message} 🚨`);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <BackgroundWrapper>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-white bg-opacity-100 p-6 rounded-lg shadow-md text-center w-80">
        <div className="flex justify-center text-black mb-2"> <Logo /></div>
          <h2 className="text-xl text-black font-bold mb-2">Admin Login</h2>
          {error && <p className="text-red-500 rounded-lg bg-white text-l mb-2">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`bg-gray-100 focus:bg-gray-200 hover:bg-gray-200 p-2 px-4 rounded-lg mb-2 w-full ${error ? 'border-3 border-red-500' : ''}`}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`bg-gray-100 focus:bg-gray-200 hover:bg-gray-200 p-2 px-4 rounded-lg mb-2 w-full ${error ? 'border-3 border-red-500' : ''}`}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 px-4 rounded-lg w-full flex justify-center items-center" 
          >
            {loading ? <LoginSpinner size="w-6 h-6" color="border-blue-200" /> : "Login"}
          </button>
          
          <footer className="text-black text-xs text-center mt-6 opacity-80">
            <b>
            Developed by the BSCS College Student In 4-D • For administrative use only.</b>
          </footer>
        </div>
      </div>
        
      </BackgroundWrapper>
    );
  }

  return (
    <div className="bg-bgGray dark:bg-gray-900 w-screen h-screen">
      {/* Mobile Menu Button */}
      <div className="block md:hidden flex items-center p-4">
        <button
          onClick={() => setShowNav(true)}
          className="text-gray-800 dark:text-gray-200"
        >
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
  
      {/* Main Layout */}
      <div className="flex bg-bgGray dark:bg-gray-900 h-full">
        {/* Sidebar / Navigation */}
        <Nav show={showNav} onClose={() => setShowNav(false)}/>
  
        {/* Content Area */}
        {!showNav && (
        <div className="flex-grow p-4 overflow-auto text-gray-900 dark:text-gray-100">
          {children}
        </div>
      )}
      </div>
    </div>
  );
}
