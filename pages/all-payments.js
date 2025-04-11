import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function AllPayments() {
  const [groupedPayments, setGroupedPayments] = useState([]);
  const { data: session } = useSession();
  const [initialized, setInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!session) return;

    const fetchPayments = async () => {
      try {
        const response = await axios.get("/api/get-all-payments");
        setGroupedPayments(response.data.data); // This is now the grouped structure

        if (!initialized && response.data.data.length > 0) {
          toast.success("Payments loaded successfully! ✅");
          setInitialized(true);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error("Failed to load payments.");
      }
    };

    fetchPayments();
  }, [session, initialized]);

  useEffect(() => {
    if (!session) {
      toast.error("You are not logged in.");
    }
  }, [session]);

  if (!session) return <Login />;

  const examPeriods = [
    "downpayment",
    "1st Periodic",
    "Prelim",
    "2nd Periodic",
    "Midterm",
    "3rd Periodic",
    "Pre-final",
    "4th Periodic",
    "Finals",
  ];

  const filteredPayments = groupedPayments
    .flatMap(student => student.payments) // Flatten the payments array from the grouped structure
    .filter((payment) =>
      `${payment.studentId} ${payment.fullName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <Login>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">All Payments</h1>
          <Link className="btn-primary px-6 py-3 bg-blue-500 text-white rounded-lg border border-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400" href="/payments/new">
            Add new payment
          </Link>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by Name or Student ID"
          className="w-full p-3 mb-6 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Payments Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">#</th>
                <th className="border p-2">Student</th>
                {examPeriods.map((period, index) => (
                  <th key={index} className="border p-2">{period}</th>
                ))}
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? filteredPayments.map((payment, index) => (
                <tr key={payment.paymentId} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{payment.fullName}</td>
                  {examPeriods.map((period, idx) => {
                    const paid = payment.examPeriod === period;
                    return (
                      <td key={idx} className="border p-2 text-center">
                        {paid ? "Paid" : "Not Paid"}
                      </td>
                    );
                  })}
                  <td className="border p-2 flex justify-center space-x-2">
                    <Link className="btn-default hover:bg-blue-600" href={`/students/${payment.studentId}/payments`}>
                      View
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={examPeriods.length + 3} className="text-center p-4">No payments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Login>
  );
}
