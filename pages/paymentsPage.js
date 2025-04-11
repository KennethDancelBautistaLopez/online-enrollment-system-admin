import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { generateReceiptPDF } from "@/components/generateReceiptPDF";
import { useSession } from "next-auth/react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // For search functionality
  const [initialized, setInitialized] = useState(false); // Prevent duplicate toasts
  const [pdfLinks, setPdfLinks] = useState({});

  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      return;
    }


    // Fetch payments data only once after component mounts
    const fetchPayments = async () => {
      try {

        const response = await axios.get("/api/payments");
            setPayments(response.data.data);
        
        // Show success toast only once after payments are loaded
        if (!initialized && response.data.data.length > 0) {
          toast.success("Payments loaded successfully! ✅");
          setInitialized(true); // Prevent the toast from showing again
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error("Failed to load payments.");
      }
    };

    fetchPayments(); // Call fetch function to load payments data
  }, [ session,initialized]); // Trigger the effect only when initialized changes

    useEffect(() => {
      if (!session) {
        toast.error("You are not logged in.");
      }
    }, [session]); // Trigger error toast only when session is null
  
    if (!session) {
      return <Login />;
    }

  const filteredPayments = payments.filter((payment) =>
    `${payment.referenceNumber} ${payment.fullName} ${payment.studentId} ${payment.amount}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleGeneratePDF = (payment, student) => {
    const pdfLink = generateReceiptPDF(payment, student);
    setPdfLinks((prev) => ({
      ...prev,
      [payment.paymentId]: pdfLink,
    }));
    toast.success(`PDF generated for ${payment.fullName}!`);
  };



  return (
    <Login>
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 md:mb-0">Payments List</h1>
        <Link
          className="btn-primary px-6 py-3 bg-blue-500 text-white rounded-lg border border-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          href="/payments/new"
        >
          Add new payment
        </Link>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Reference No., Name, Student ID, Amount"
        className="w-full p-3 mb-6 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full text-left table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Student ID</th>
              <th className="border p-2">Reference No.</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Payment</th>
              <th className="border p-2 ">Full Name</th>
              <th className="border p-2">Education</th>
              <th className="border p-2">Course</th>
              <th className="border p-2">Semester</th>  
              <th className="border p-2">Year Level</th>
              <th className="border p-2">School Year</th>
              <th className="border p-2">Receipt</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="13" className="text-center p-4">
                  No payments found
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment, index) => (
                <tr key={payment.paymentId} className="hover:bg-gray-50">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{payment.studentId || "N/A"}</td>
                  <td className="border p-2">{payment.referenceNumber}</td>
                  <td className="border p-2">₱{payment.amount?.toFixed(2)}</td>
                  <td className="border p-2">{payment.examPeriod || "N/A"}</td>
                  <td className="border p-2">{payment.fullName || "N/A"}</td>
                  <td className="border p-2">{payment.education}</td>
                  <td className="border p-2">{payment.course}</td>
                  <td className="border p-2">{payment.semester || "N/A"}</td>
                  <td className="border p-2">{payment.yearLevel || "N/A"}</td>
                  <td className="border p-2">{payment.schoolYear || "N/A"}</td>
                  <td className="border p-2">
                  <button
                      className="btn-primary text-sm px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-green-600"
                      onClick={() => handleGeneratePDF(payment, payment.studentId)}
                    >
                      Generate PDF
                    </button>
                  </td>
                  <td className="border p-2 flex justify-center space-x-2">
                      <Link
                        className="btn-default hover:bg-blue-600"
                        href={`/payments/edit/${payment.paymentId}`}
                      >
                        Edit
                      </Link>
                      <Link
                        className="btn-default hover:bg-red-600"
                        href={`/payments/delete/${payment.paymentId}`}
                      >
                        Delete
                      </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </Login>
  );
}
