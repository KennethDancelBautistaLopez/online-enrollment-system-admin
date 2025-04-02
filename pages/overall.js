import { useEffect, useState } from "react";
import Login from "@/pages/Login";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function Payments() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const { data: session } = useSession();

    
  useEffect(() => {
    if (!session) {
      return;
    }
    axios
      .get("/api/payments")
      .then((response) => {
        const payments = response.data; // Ensure correct response structure

        if (!Array.isArray(payments) || payments.length === 0) {
          console.warn("⚠️ No payments found or invalid format.");
          setChartData([]); // Ensure chart doesn't break
          setTotalIncome(0);
          toast.error("No payments found. ❌");
          return;
        }

        setTotalIncome(
          payments.reduce((total, payment) => total + (payment.amount || 0), 0) // Avoid undefined `amount`
        );

        setChartData(
          payments.map((payment) => ({
            date: payment.createdAt || "Unknown",
            amount: payment.amount || 0,
          }))
        );

        if (!initialized) {
          toast.success("Payments loaded successfully! ✅");
          setInitialized(true); // Prevent repeated success toasts
        }
      })
      .catch((error) => {
        console.error("❌ Failed to fetch payments:", error);
        toast.error("Failed to fetch payments. 🚨");
      });
  }, [session]);

      useEffect(() => {
        if (!session) {
          toast.error("You are not logged in.");
        }
      }, [session]);
    
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
                <Line type="monotone" dataKey="amount" stroke="#4CAF50" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Login>
  );
}
