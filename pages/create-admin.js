import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import Login from "./Login";

export default function CreateAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "superAdmin") {
      router.push("/");
      toast.error("You don't have permission to access this page.");
    } else {
      fetchAdmins(); // Only fetch admins if session is valid
    }
  }, [session, status, router]);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/all");
      const data = await res.json();
      if (res.ok) {
        setAdminUsers(data.admins); // Adjust based on API response structure
      } else {
        toast.error(data.message || "Failed to load admins.");
      }
    } catch (error) {
      toast.error("Error fetching admin users.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.status === 201) {
        toast.success(data.message);
        localStorage.setItem("token", data.token);
        setEmail("");
        setPassword("");
        setRole("admin");
        fetchAdmins(); // Refresh admin list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to create admin.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="p-4">Loading...</div>;

  return (
    <Login>
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-12 w-full max-w-6xl p-6 bg-white shadow-lg rounded-lg">
          {/* Left container */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-left text-gray-800 mb-6">Create New Admin</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="superAdmin">Super Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full p-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin w-5 h-5 border-4 border-white border-t-transparent rounded-full mx-auto" />
                ) : (
                  "Create Admin"
                )}
              </button>
            </form>
          </div>

          {/* Right container */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Users</h2>
            {adminUsers.length === 0 ? (
              <p className="text-gray-500">No admin users found.</p>
            ) : (
              <ul className="divide-y divide-gray-200 rounded-lg border">
                {adminUsers
                  .filter((admin) => admin.role === "admin" || admin.role === "superAdmin")
                  .map((admin) => (
                    <li key={admin._id} className="p-4 flex justify-between items-center hover:bg-gray-100 transition-all">
                      <span>{admin.email}</span>
                      <span className="text-sm text-gray-500">{admin.role}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Login>
  );
}
