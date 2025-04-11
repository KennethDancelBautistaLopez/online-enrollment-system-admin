import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Login from "@/pages/Login";

export default function StudentPaymentsView() {
  const router = useRouter();
  const { studentId } = router.query;
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentPayments = async () => {
      try {
        const response = await axios.get(`/api/students/${studentId}/payments`);
        setStudentData(response.data);
        toast.success("Student payment data loaded! ✅");
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Failed to load student data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentPayments();
  }, [studentId]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!studentData) return <p className="p-4 text-red-500">Student not found.</p>;

  return (
    <Login>
      <div className="container mx-auto p-6 bg-white rounded-xl shadow-lg my-10">
        <Link href="/all-payments">
          <span className="text-blue-600 hover:underline mb-4 block">← Back to All Payments</span>
        </Link>

        <h2 className="text-3xl font-semibold text-gray-800 mb-4">{studentData.fullName}</h2>
        <p className="text-gray-500 text-lg mb-6">Student ID: {studentId}</p>

        <div className="overflow-x-auto bg-gray-50 rounded-lg shadow-md">
          <table className="min-w-full table-auto text-sm text-gray-600">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Reference Number</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Exam Period</th>
              </tr>
            </thead>
            <tbody>
              {studentData.payments.length > 0 ? (
                studentData.payments.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-200 transition-colors">
                    <td className="border-t px-4 py-3">{payment.referenceNumber}</td>
                    <td className="border-t px-4 py-3">
                      ₱{typeof payment.amount === 'number' ? payment.amount.toFixed(2) : 'N/A'}
                    </td>
                    <td className="border-t px-4 py-3">{payment.examPeriod}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-gray-500">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Login>
  );
}
