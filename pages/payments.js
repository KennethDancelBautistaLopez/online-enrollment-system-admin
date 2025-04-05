import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {

    if (!session) {
      toast.error("You are not logged in.");
      return;
    }

    // Check if the user is admin and show appropriate toast message
    if (session.user.role === "admin") {
      toast.error("Admins cannot access this page. Redirecting...");
      // Redirect to a different page (e.g., dashboard) for admin
      window.location.href = "/"; // Change to your admin page URL
      return;
    }

    fetchPayments();
    const interval = setInterval(fetchPayments, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval); // Cleanup on unmount
  }, [session]); // Only run this effect when the session changes

  const fetchPayments = async () => {
    console.log("Fetching payments...");

    try {
      const response = await axios.get("/api/payments");
      console.log("Full API Response:", response.data);
      const paymentsData = response.data?.data || response.data;

      if (Array.isArray(paymentsData)) {
        // Compare previous and new payments to avoid unnecessary updates
        if (JSON.stringify(payments) !== JSON.stringify(paymentsData)) {
          setPayments(paymentsData);
          setError(null);

          // Show toast only if the user is logged in and the toast hasn't been shown yet
          if (!initialized && session) {
            toast.success("Payments loaded successfully! ✅");
            setInitialized(true); // Prevent repeated success toasts
          }
        }
      } else {
        console.error("Unexpected response structure:", response.data);
        setError("Invalid data format received.");
        toast.error("Invalid data format received. ❌");
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
      setError("Failed to load payments.");
      toast.error("Failed to fetch payments. Please try again. 🚨");
    }
  };

  if (!session) {
    return <Login />;
  }

  return (
    <Login> 
    <div>
      <Link className="btn-primary" href="/payments/new">
        Add new payment
      </Link>

      {error && <p className="text-center mt-4 text-red-500">{error}</p>}

      {!error && (
        <table className="basic mt-2 w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">#</th>
              <th className="border border-gray-300 p-2">Reference Number</th>
              <th className="border border-gray-300 p-2">Amount</th>
              <th className="border border-gray-300 p-2">Billing Name</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{payment.referenceNumber || "N/A"}</td>
                  <td className="border border-gray-300 p-2">₱{payment.amount.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2">{payment.billingDetails?.name || "N/A"}</td>
                  <td className="border border-gray-300 p-2 flex gap-2">
                    <Link className="btn-default" href={`/payments/edit/${payment._id}`}>
                      Edit
                    </Link>
                    <Link className="btn-red" href={`/payments/delete/${payment._id}`}>
                      Delete
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center border p-4">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
    </Login>
  );
}
