import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { generateReceiptPDF } from "@/components/generateReceiptPDF";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import LoadingSpinner from "@/components/Loading";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // For search functionality
  const [initialized, setInitialized] = useState(false); // Prevent duplicate toasts

  const router = useRouter();
  const [pdfLinks, setPdfLinks] = useState({});

  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      return;
    }

    // Check if user is not superAdmin, then redirect to home or other page
    if (session.user.role !== "superAdmin" && session.user.role !== "admin") {
      router.push("/"); // Redirect to home if not superAdmin
      toast.error("You do not have access to this page.");
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
      }finally {
        setLoading(false);
      }
    };
    

    fetchPayments(); // Call fetch function to load payments data
  }, [ session,initialized, router]); // Trigger the effect only when initialized changes

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete all payments? This action is irreversible.")) {
      return;
    }
  
    try {
      const response = await axios.delete("/api/payments?deleteAll=true");
      if (response.data.success) {
        toast.success("All payments deleted successfully.");
        setPayments([]); // Clear payments from the UI
      }
    } catch (error) {
      console.error("Error deleting all payments:", error);
      toast.error("Failed to delete payments.");
    }
  };
  
  useEffect(() => {
    if (!session) {
      toast.error("You are not logged in.");
    }
  }, [session]); // Trigger error toast only when session is null

  if (!session || session.user.role !== "superAdmin" && session.user.role !== "admin") {
    return <Login />; // Or redirect to login if not logged in or not superAdmin
  }

  const filteredPayments = payments.filter((payment) =>
    `${payment.referenceNumber} ${payment.fullName} ${payment.course} ${payment.education} ${payment.yearLevel} ${payment.schoolYear} ${payment.semester} ${payment.examPeriod} ${payment.studentId} ${payment.status} ${payment.amount}`
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
        
      {loading ? (
            <LoadingSpinner/>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between items-center gap-2 mb-4">
              <h1 className="text-2xl font-bold mb-3 md:mb-0 text-gray-800 dark:text-white">Payments List</h1>
              {session?.user.role === "superAdmin" && (
                <button
                  onClick={handleDeleteAll}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg border border-red-600 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-red-700 dark:hover:bg-red-600 dark:border-red-500 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 -960 960 960"
                    fill="currentColor"
                  >
                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                  </svg>
                  Delete All Payments
                </button>
              )}
            </div>
      
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search by Reference No., Name, Student ID, Amount"
              className="w-full p-3 mb-6 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
      
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg dark:bg-gray-900 dark:text-white">
              <table className="min-w-full text-left table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border p-2 text-gray-900 dark:text-white">ID</th>
                    <th className="border p-4 text-gray-900 dark:text-white">Student ID</th>
                    <th className="border p-2 text-gray-900 dark:text-white">Reference No.</th>
                    <th className="border p-1 text-gray-900 dark:text-white">Amount</th>
                    <th className="border p-2 text-gray-900 dark:text-white">Payment</th>
                    <th className="border p-2 text-gray-900 dark:text-white">Full Name</th>
                    <th className="border p-2 text-gray-900 dark:text-white">Education</th>
                    <th className="border p-1 text-gray-900 dark:text-white">Course</th>
                    <th className="border p-2 text-gray-900 dark:text-white">Semester</th>  
                    <th className="border p-1 items-center text-gray-900 dark:text-white">Year Level</th>
                    <th className="border p-1 text-gray-900 dark:text-white">School Year</th>
                    <th className="border p-7 text-gray-900 dark:text-white">Status</th>
                    <th className="border p-2 text-gray-900 dark:text-white">Receipt</th>
                    {session?.user.role === "superAdmin" && (
                      <th className="border p-2 text-gray-900 dark:text-white">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="text-center p-4 text-gray-500 dark:text-gray-400">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment, index) => (
                      <tr key={payment.paymentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                        <td className="border p-2">{payment.status || "N/A"}</td>
                        <td className="border p-1">
                          <button
                            className="btn-primary-filled bg-blue-500 text-white rounded-lg border border-blue-600 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 dark:border-blue-500"
                            onClick={() => handleGeneratePDF(payment, payment.studentId)}
                          >
                            Generate PDF
                          </button>
                        </td>
                        {session?.user.role === "superAdmin" && (
                          <td className="border p-2">
                            <div className="flex items-center justify-center space-x-4">
                              <Link
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition"
                                href={`/payments/delete/${payment.paymentId}`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4"
                                  viewBox="0 -960 960 960"
                                  fill="currentColor"
                                >
                                  <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                                </svg>
                                Delete
                              </Link>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
          )}
        
      </div>
    </Login>
  );
}
