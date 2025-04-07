import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-hot-toast";
import axios from "axios";
import Login from "@/pages/Login";
import { useSession } from "next-auth/react";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [initialized, setInitialized] = useState(false);
  const { query } = router;

  useEffect(() => {
    if (!session) {
      toast.error("You are not logged in.");
      return;
    }
    if (session.user.role === "admin") {
      toast.error("You don't have permission to access this page.");
      // Redirect to a different page (e.g., dashboard) for admin
      window.location.href = "/"; // Change to your admin page URL
      return;
    }

    // If logged in and superadmin, proceed to fetch payments
    if (query.amount) {
      toast.success(`Payment of ₱${query.amount} for ${query.fname} ${query.lname} added successfully! ✅`);
    }

    fetchPayments();
    const interval = setInterval(fetchPayments, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [session, query]);

  // Fetch Payments
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not logged in.");
        toast.error("You are not logged in. Please log in to view payments. 🚨");
        return;
      }

      const response = await axios.get("/api/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const paymentsData = response.data.data;

      if (Array.isArray(paymentsData)) {
        setPayments(paymentsData);
        setError(null);
        toast.success("Payments loaded successfully! ✅");
        if (!initialized && session) {
          toast.success("Payments loaded successfully! ✅");
          setInitialized(true); // Prevent repeated success toasts
        }
      } else {
        setError("Invalid data format received.");
        toast.error("Invalid data format received. Please try again. 🚨");
      }
    } catch (error) {
      setError("Failed to load payments.");
      toast.error("Failed to fetch payments. Please try again. 🚨");
      console.error("Error fetching payments:", error);
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
                <th className="border border-gray-300 p-2">Reference No.</th>
                <th className="border border-gray-300 p-2">Amount</th>
                <th className="border border-gray-300 p-2">Full Name</th>
                <th className="border border-gray-300 p-2">Student ID</th>
                <th className="border border-gray-300 p-2">Course</th>
                <th className="border border-gray-300 p-2">Year Level</th>
                <th className="border border-gray-300 p-2">Education</th>
                <th className="border border-gray-300 p-2">School Year</th>
                <th className="border border-gray-300 p-2">Receipt</th>
                <th className="border border-gray-300 p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <tr key={payment.paymentId} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">{index + 1}</td>
                    <td className="border border-gray-300 p-2">{payment.referenceNumber || "N/A"}</td>
                    <td className="border border-gray-300 p-2">₱{payment.amount?.toFixed(2) || "0.00"}</td>
                    <td className="border border-gray-300 p-2">{payment.fullName || "N/A"}</td>
                    <td className="border border-gray-300 p-2">{payment.studentId || "N/A"}</td>
                    <td className="border border-gray-300 p-2">{payment.course || "N/A"}</td>
                    <td className="border border-gray-300 p-2">{payment.yearLevel || "N/A"}</td>
                    <td className="border border-gray-300 p-2">{payment.education || "N/A"}</td>
                    <td className="border border-gray-300 p-2">{payment.schoolYear || "N/A"}</td>
                    <td className="border border-gray-300 p-2">{payment.receipt || "N/A"}</td>
                    <td className="border border-gray-300 p-2 flex gap-2">
                      <Link className="btn-default" href={`/payments/edit/${payment.paymentId}`}>
                        Edit
                      </Link>
                      <Link className="btn-red" href={`/payments/delete/${payment.paymentId}`}>
                        Delete
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center border p-4">
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
