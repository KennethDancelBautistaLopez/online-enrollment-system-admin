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

  if (status === "loading") return <div>Loading...</div>;

  return (
    <Login>
      <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-4">Create New Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="admin">Admin</option>
              <option value="superAdmin">Super Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded-md"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>

        {/* Admin user list */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">All Admin Users</h2>
          {adminUsers.length === 0 ? (
            <p>No admin users found.</p>
          ) : (
            <ul className="divide-y divide-gray-200 border rounded-md">
              {adminUsers.map((admin) => (
                <li key={admin._id} className="p-3">
                  <div className="flex justify-between">
                    <span>{admin.email}</span>
                    <span className="text-sm text-gray-500">{admin.role}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Login>
  );
}
