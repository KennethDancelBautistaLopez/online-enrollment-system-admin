import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchPayments = () => {
    axios
    .get("/api/payments")
    .then((response) => {
      console.log("Full API Response:", response.data); // Check full response
      console.log("Payments Data:", response.data?.data); // Check if `data` key exists
  
      if (response.data && Array.isArray(response.data)) { // Remove `.data` if not needed
        setPayments(response.data);
      } else {
        console.error("Unexpected response structure:", response.data);
        setError("Invalid data format received.");
      }
    })
    .catch((error) => {
      console.error("Failed to load payments:", error);
      setError("Failed to load payments.");
    })
    .finally(() => setLoading(false));
  };

  return (
    <Login>
      <Link className="btn-primary" href="/payments/new">
        Add new payment
      </Link>

      {loading && <p className="text-center mt-4">Loading payments...</p>}
      {error && <p className="text-center mt-4 text-red-500">{error}</p>}

      {!loading && !error && (
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
                <td colSpan="6" className="text-center border p-4">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </Login>
  );
}
