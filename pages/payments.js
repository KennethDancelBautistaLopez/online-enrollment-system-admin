// import Link from "next/link";
// import Login from "@/pages/Login";
// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function Payments() {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     axios
//       .get("/api/payments")
//       .then((response) => {
//         console.log("API Response:", response.data); // Debugging

//         if (response.data && Array.isArray(response.data.data)) {
//           const formattedPayments = response.data.data.map(payment => ({
//             ...payment,
//             referenceNumber: payment.reference_number || "N/A" // Ensure fallback value
//           }));
//           setPayments(formattedPayments);
//         } else {
//           console.error("Unexpected API response format:", response.data);
//           setError("Invalid data format received.");
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching payments:", error);
//         setError("Failed to load payments.");
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   const markAsPaid = async (id) => {
//     try {
//       const response = await axios.put("/api/payments", { id, status: "paid" });

//       if (response.data.success) {
//         setPayments((prevPayments) =>
//           prevPayments.map((payment) =>
//             payment._id === id ? { ...payment, status: "paid" } : payment
//           )
//         );
//       }
//     } catch (error) {
//       console.error("Error updating payment:", error);
//       alert("Failed to update payment status.");
//     }
//   };

//   return (
//     <Login>
//       <Link className="btn-primary" href="/payments/new">
//         Add new payment
//       </Link>

//       {loading && <p className="text-center mt-4">Loading payments...</p>}
//       {error && <p className="text-center mt-4 text-red-500">{error}</p>}

//       {!loading && !error && (
//         <table className="basic mt-2 w-full border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border border-gray-300 p-2">#</th>
//               <th className="border border-gray-300 p-2">Reference Number</th>
//               <th className="border border-gray-300 p-2">Payment ID</th>
//               <th className="border border-gray-300 p-2">Amount</th>
//               <th className="border border-gray-300 p-2">Status</th>
//               <th className="border border-gray-300 p-2">Description</th>
//               <th className="border border-gray-300 p-2">Date Paid</th>
//               <th className="border border-gray-300 p-2">Settlement Status</th>
//               <th className="border border-gray-300 p-2">Method</th>
//               <th className="border border-gray-300 p-2">Billing Name</th>
//               <th className="border border-gray-300 p-2">Billing Email</th>
//               <th className="border border-gray-300 p-2">Billing Phone</th>
//               <th className="border border-gray-300 p-2">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {payments.length > 0 ? (
//               payments.map((payment, index) => (
//                 <tr key={payment._id || index} className="hover:bg-gray-50">
//                   <td className="border border-gray-300 p-2">{index + 1}</td>
//                   <td className="border border-gray-300 p-2">{payment.referenceNumber}</td>
//                   <td className="border border-gray-300 p-2">{payment.paymentId}</td>
//                   <td className="border border-gray-300 p-2">{payment.amount}</td>
//                   <td className="border border-gray-300 p-2">{payment.status}</td>
//                   <td className="border border-gray-300 p-2">{payment.description}</td>
//                   <td className="border border-gray-300 p-2">{payment.datePaid}</td>
//                   <td className="border border-gray-300 p-2">{payment.settlementStatus}</td>
//                   <td className="border border-gray-300 p-2">{payment.method}</td>
//                   <td className="border border-gray-300 p-2">{payment.billingDetails?.name || "N/A"}</td>
//                   <td className="border border-gray-300 p-2">{payment.billingDetails?.email || "N/A"}</td>
//                   <td className="border border-gray-300 p-2">{payment.billingDetails?.phone || "N/A"}</td>
//                   <td className="border border-gray-300 p-2 flex gap-2">
//                     {payment.status === "pending" && (
//                       <button
//                         className="btn-green"
//                         onClick={() => markAsPaid(payment._id)}
//                       >
//                         Mark as Paid
//                       </button>
//                     )}
//                     <Link className="btn-default" href={`/payments/edit/${payment._id}`}>
//                       Edit
//                     </Link>
//                     <Link className="btn-red" href={`/payments/delete/${payment._id}`}>
//                       Delete
//                     </Link>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="13" className="text-center border p-4">
//                   No payments found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       )}
//     </Login>
//   );
// } 

import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch payments
  const fetchPayments = () => {
    axios
      .get("/api/payments")
      .then((response) => {
        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data.data)) {
          const formattedPayments = response.data.data.map((payment) => ({
            ...payment,
            referenceNumber: payment.referenceNumber || "N/A",
          }));
          setPayments(formattedPayments);
        } else {
          console.error("Unexpected API response format:", response.data);
          setError("Invalid data format received.");
        }
      })
      .catch((error) => {
        console.error("Error fetching payments:", error);
        setError("Failed to load payments.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const markAsPaid = async (id) => {
    try {
      const response = await axios.put("/api/payments", { id, status: "paid" });

      if (response.data.success) {
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment._id === id ? { ...payment, status: "paid" } : payment
          )
        );
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment status.");
    }
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
              <th className="border border-gray-300 p-2">Payment ID</th>
              <th className="border border-gray-300 p-2">Amount</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Description</th>
              <th className="border border-gray-300 p-2">Date Paid</th>
              <th className="border border-gray-300 p-2">Settlement Status</th>
              <th className="border border-gray-300 p-2">Method</th>
              <th className="border border-gray-300 p-2">Billing Name</th>
              <th className="border border-gray-300 p-2">Billing Email</th>
              <th className="border border-gray-300 p-2">Billing Phone</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr key={payment._id || index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{payment.referenceNumber}</td>
                  <td className="border border-gray-300 p-2">{payment.paymentId}</td>
                  <td className="border border-gray-300 p-2">₱{(payment.amount / 100).toFixed(2)}</td>
                  <td className="border border-gray-300 p-2">{payment.status}</td>
                  <td className="border border-gray-300 p-2">{payment.description}</td>
                  <td className="border border-gray-300 p-2">
                    {payment.datePaid ? new Date(payment.datePaid).toLocaleString() : "Pending"}
                  </td>
                  <td className="border border-gray-300 p-2">{payment.settlementStatus || "N/A"}</td>
                  <td className="border border-gray-300 p-2">{payment.method || "N/A"}</td>
                  <td className="border border-gray-300 p-2">{payment.billingDetails?.name || "N/A"}</td>
                  <td className="border border-gray-300 p-2">{payment.billingDetails?.email || "N/A"}</td>
                  <td className="border border-gray-300 p-2">{payment.billingDetails?.phone || "N/A"}</td>
                  <td className="border border-gray-300 p-2 flex gap-2">
                    {payment.status === "pending" && (
                      <button
                        className="btn-green"
                        onClick={() => markAsPaid(payment._id)}
                      >
                        Mark as Paid
                      </button>
                    )}
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
                <td colSpan="13" className="text-center border p-4">
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
