import { useEffect, useState } from "react";
import Login from "@/pages/Login";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { format } from "date-fns"; // Install if necessary: npm install date-fns
import { useRouter } from "next/router"; // Import useRouter for navigation
import LoadingSpinner from "@/components/Loading";

export default function Payments() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const { data: session } = useSession();
  const router = useRouter(); // Initialize router

  useEffect(() => {
    // 1. If the user is not logged in
    if (!session && session.user.role !== "superAdmin") {
      toast.error("You don't have permission to access this page.");
      return;
    }

    // 3. If the user is logged in as a non-admin, fetch payments
    axios
      .get("/api/payments")
      .then((response) => {
        const payments = response.data.data; // ✅ FIXED: access actual payments array
      
        if (!Array.isArray(payments) || payments.length === 0) {
          console.warn("⚠️ No payments found or invalid format.");
          setChartData([]);
          setTotalIncome(0);
          toast.error("No payments found. ❌");
          return;
        }
      
        setTotalIncome(
          payments.reduce((total, payment) => total + (payment.amount || 0), 0)
        );
      
        // Prepare chart data
        setChartData(
          payments.map((payment) => ({
            date: payment.createdAt
              ? `${format(new Date(payment.createdAt), "MMM dd, yyyy")} (${payment.studentId || "No ID"})`
              : payment.studentId || "No ID",
            amount: payment.amount || 0,
          }))
        );
      
        if (!initialized) {
          toast.success("Payments loaded successfully! ✅");
          setInitialized(true);
        }
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error("Failed to load payments: " + error.response.data.message);
        } else {
          toast.error("Failed to load payments.");
        }
      }).finally(() => setLoading(false))
  }, [session, initialized, router]);

  if (!session) {
    return <Login />;
  }

  return (
    <Login>
      <div className="space-y-8">
        {loading ? (
                  <LoadingSpinner />
                ) :
                ( 
                  <>
      <h1 className="text-3xl font-bold pt-4 mb-2 md:mb-0 text-gray-800 dark:text-white">Overall Income</h1>
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 dark:bg-gray-800 dark:text-white">
            <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-300">
              Total Payments: ₱{totalIncome}
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-700 dark:text-white">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Income Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    animationDuration={1000} // Animation duration (in ms)
                    animationBegin={0} // Animation start time
                    animationEasing="ease-in-out" // Animation easing
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          </>
                )}
        </div>
    </Login>
  );
}
