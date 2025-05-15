import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { generateReceiptPDF } from "@/components/generateReceiptPDF";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import LoadingSpinner from "@/components/Loading";
import { CSVLink } from "react-csv";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [showReference, setShowReference] = useState(false);
  // const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const router = useRouter();
  const [pdfLinks, setPdfLinks] = useState({});

  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.user.role !== "superAdmin" && session.user.role !== "accountant") {
      router.push("/");
      return;
    }

    // Fetch payments data only once after component mounts
    const fetchPayments = async () => {
      try {

        const response = await axios.get("/api/payments");
        
        if (response.data.data.length === 0) {
          toast("No payments returned from backend. 😕");
          return;
        }
        setPayments(response.data.data);
        if (!initialized && response.data.data.length > 0) {
          setInitialized(true);
        }
      } catch (error) {
        if(error.response&&error.response.data&&error.response.data.message){
          toast.error( "Failed to load payments: " + error.response.data.message);
        } else {
          toast.error("Failed to load payments." + error);
        }
      }finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [ session,initialized, router]);
  useEffect(() => {
    if (!session) {
      toast.error("You are not logged in.");
    }
  }, [session]); // Trigger error toast only when session is null

  if (!session || session.user.role !== "superAdmin" && session.user.role !== "accountant") {
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


  const headers = [
  { label: "ID", key: "id" },
  { label: "Student ID", key: "studentId" },
  { label: "Reference No.", key: "referenceNumber" },
  { label: "Full Name", key: "fullName" },
  { label: "Amount", key: "amount" },
  { label: "Payment Method", key: "method" },
  { label: "Exam Period", key: "examPeriod" },
  { label: "Semester", key: "semester" },
  { label: "Year Level", key: "yearLevel" },
  { label: "School Year", key: "schoolYear" },
  { label: "Status", key: "status" },
  { label: "Created At", key: "createdAt" },
];

// Format your payments data
const csvData = filteredPayments.map((payment, index) => ({
  id: index + 1,
  studentId: payment.studentId || "N/A",
  referenceNumber: payment.referenceNumber || "N/A",
  fullName: payment.fullName || "N/A",
  amount: payment.amount?.toFixed(2) || "0.00",
  method: payment.paymentMethod || "N/A",
  examPeriod: payment.examPeriod || "N/A", 
  semester: payment.semester || "N/A",
  yearLevel: payment.yearLevel || "N/A",
  schoolYear: payment.schoolYear || "N/A",
  status: payment.status,
  createdAt: new Date(payment.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }),
}));



  return (
    <Login>
      <div className="container mx-auto p-4">
        
      {loading ? (
            <LoadingSpinner/>
          ) : (
            <>
            {/* {showDeleteAllModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center w-96">
                <h1 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Are you sure you want to delete <b>all payments</b>?<br />
                  This action is <span className="text-red-600 font-bold">irreversible</span>.
                </h1>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowDeleteAllModal(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await axios.delete("/api/payments", { params: { deleteAll: true } });
                        
                        if (response.data.success) {
                          toast.success("All payments deleted successfully.");
                          setPayments([]);
                        }
                      } catch (error) {
                          console.error("Error deleting all payments:", error);
                          const errorMessage =
                            error.response?.status === 404
                              ? "No payments to delete."
                              : error.response?.data?.error || "Failed to delete payments.";
                          toast.error(errorMessage);
                        } finally {
                        setShowDeleteAllModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )} */}
              <div className="flex flex-col md:flex-row md:items-center justify-between items-center gap-2 mb-4">
              <h1 className="text-2xl font-bold mb-3 md:mb-0 text-gray-800 dark:text-white">Payments List</h1>

            {(session?.user.role === "superAdmin" || session?.user.role === "accountant") && (
              <CSVLink
                data={csvData}
                headers={headers}
                filename="ALL_PAYMENTS_DATA.csv"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow"
              >
                Download CSV
              </CSVLink>
            )}
              
              {/* {session?.user.role === "superAdmin" && (
                <button
                  onClick={() => setShowDeleteAllModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-200 hover:bg-red-400 text-red-600 rounded-md text-md font-medium transition-all duration-200 dark:text-red-700 dark:hover:bg-red-600 dark:hover:text-white"
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

              )} */}
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
                    <th className="border p-1 text-gray-900 dark:text-white">Semester</th>  
                    <th className="border p-1 items-center text-gray-900 dark:text-white">Year Level</th>
                    <th className="border p-1 text-gray-900 dark:text-white"><div className="flex items-center justify-center">Date</div></th>
                    <th className="border p-1 text-gray-900 dark:text-white">Status</th>
                    <th className="border p-1 text-gray-900 dark:text-white">Receipt</th>
                    {/* {session?.user.role === "superAdmin" && (
                      <th className="border p-2 text-gray-900 dark:text-white">Actions</th>
                    )} */}
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
                        <td className="border p-2"
                          onClick={() => setShowReference(!showReference)}
                          title="Click to show reference number"
                        >
                          {showReference ? payment.referenceNumber : "Ref. No."}
                          </td>
                        <td className="border p-2">₱{payment.amount?.toFixed(2)}</td>
                        <td className="border p-2">{payment.examPeriod}</td>
                        <td className="border p-2">{payment.fullName || "N/A"}</td>
                        <td className="border p-2">{payment.semester || "N/A"}</td>
                        <td className="border p-2">
                          <div className="flex items-center justify-center space-x-4">
                          {payment.yearLevel || "N/A"}
                          </div>
                          </td>
                        <td className="border p-2">{payment.createdAt 
                            ? new Date(payment.createdAt).toLocaleString("en-US", {
                                dateStyle: "medium",timeStyle: "short", }) : "N/A"}</td>
                        <td className="border p-2">{payment.status || "N/A"}</td>
                        <td className="border p-1">
                          <button
                            className=" flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 text-blue-600 rounded-md text-sm font-medium transition-all duration-200"
                            onClick={() => handleGeneratePDF(payment, payment.studentId)}
                          >
                            Generate PDF
                          </button>
                        </td>
                        {/* {session?.user.role === "superAdmin" && (
                          <td className="border p-2">
                            <div className="flex items-center justify-center space-x-4">
                              <Link
                                className="flex items-center gap-2 px-4 py-2 bg-red-200 hover:bg-red-400 text-red-600 rounded-md text-sm font-medium transition-all duration-200 dark:text-red-700 dark:hover:bg-red-600 dark:hover:text-white"
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
                        )} */}
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
