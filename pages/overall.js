import { useEffect, useState } from "react";
import Login from "@/pages/Login";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { format } from "date-fns"; // Install if necessary: npm install date-fns
import { useRouter } from "next/router"; // Import useRouter for navigation

export default function Payments() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const { data: session } = useSession();
  const router = useRouter(); // Initialize router

  useEffect(() => {
    // 1. If the user is not logged in
    if (!session) {
      toast.error("You don't have permission to access this page.");
      return;
    }

    // 2. If the user is logged in as an admin
    if (session.user.role === "admin") {
      toast.error("You don't have permission to access this page.");
      router.push("/"); // Redirect to admin dashboard (or another page you prefer)
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
        console.error("❌ Failed to fetch payments:", error);
        toast.error("Failed to fetch payments. 🚨");
      });
  }, [session, initialized, router]);

  if (!session) {
    return <Login />;
  }

  return (
    <Login>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold mb-4">Tuition Payments</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            Total Income: ₱{totalIncome}
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Income Trends</h3>
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
                  animationDuration={1000}        // Animation duration (in ms)
                  animationBegin={0}               // Animation start time
                  animationEasing="ease-in-out"    // Animation easing
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Login>
  );
}
