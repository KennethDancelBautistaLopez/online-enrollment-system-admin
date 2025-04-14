import { useEffect, useState, useRef } from "react";
import Login from "@/pages/Login";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { format } from "date-fns"; // Install if necessary: npm install date-fns

import LoadingSpinner from "@/components/Loading";

export default function Home() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [EventsLoading, setEventsLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [chartData, setChartData] = useState([]);
  const initialized = useRef(false);
  const hasShownWelcome = useRef(false); // flag to prevent multiple toasts
  const hasCheckedConflicts = useRef(false);
  const shownConflicts = useRef(new Set());

  useEffect(() => {
    if (status === "authenticated" && !hasShownWelcome.current) {
      toast.success(`Welcome, ${session.user.email}! 🎉`);
      hasShownWelcome.current = true;
    }
  }, [status, session]);

  // Fetching events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load events");
  
        setEvents(data);
  
        if (status !== "authenticated" || hasCheckedConflicts.current) return;
  
        // Check for date conflicts (only for logged in users)
        for (let i = 0; i < data.length; i++) {
          const event1 = new Date(data[i].date);
          const dateKey1 = event1.toDateString();
  
          for (let j = i + 1; j < data.length; j++) {
            const event2 = new Date(data[j].date);
            const dateKey2 = event2.toDateString();
  
            if (dateKey1 === dateKey2) {
              const conflictKey = [data[i].title, data[j].title].sort().join("::") + "::" + dateKey1;
  
              if (!shownConflicts.current.has(conflictKey)) {
                shownConflicts.current.add(conflictKey);
  
                toast(`⚠️ Date conflict between "${data[i].title}" and "${data[j].title}" on ${dateKey1}.`, {
                  icon: "⚠️",
                  style: {
                    background: "#fff3cd",
                    color: "#856404",
                    border: "1px solid #ffeeba",
                  },
                });
              }
            }
          }
        }
  
        hasCheckedConflicts.current = true;
      } catch (err) {
        toast.error(`Error: ${err.message}`);
      } finally {
        setEventsLoading(false);
      }
    };
  
    fetchEvents();
  }, [status]);

  // Fetching payments
  useEffect(() => {
    if (!session) return;

    axios
      .get("/api/payments")
      .then((response) => {
        const payments = response.data.data; // Access actual payments array

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

        setChartData(
          payments.map((payment) => ({
            date: payment.createdAt
              ? `${format(new Date(payment.createdAt), "MMM dd, yyyy")} (${payment.studentId || "No ID"})`
              : payment.studentId || "No ID",
            amount: payment.amount || 0,
          }))
        );

        if (!initialized.current) {
          toast.success("Payments loaded successfully! ✅");
          initialized.current = true;
        }
      })
      .catch((error) => {
        console.error("❌ Failed to fetch payments:", error);
        toast.error("Failed to fetch payments. 🚨");
      })
      .finally(() => {
        setPaymentLoading(false);
      });
  }, [session, initialized]);

  if (!session && status !== "loading") {
    return <Login />;
  }

  return (
    <Login>
      <div className="p-4 sm:p-8 dark:bg-gray-900 dark:text-white">
        {/* Welcome Section */}
        <div className="text-blue-900 flex justify-between items-center mb-8 dark:text-blue-200">
          <h2 className="text-xl font-semibold">
            Hello, <span className="text-black dark:text-white">{session?.user?.email}</span>
          </h2>
          <div className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow dark:bg-gray-700 dark:text-blue-200">
            <span>{session?.user?.email}</span>
          </div>
        </div>
  

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 dark:bg-gray-800 dark:text-white">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">📅 Upcoming Events</h3>
        {EventsLoading ? (
          <LoadingSpinner />  
        ) : events.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => (
              <div
                key={event._id}
                className="bg-blue-100 p-4 rounded-lg shadow-md dark:bg-gray-700 dark:text-white"
              >
                <h4 className="text-lg font-semibold mb-2">{event.title}</h4>
                <p className="text-gray-700 dark:text-gray-400">{event.description}</p>
                <div className="text-sm text-gray-600 space-y-1 dark:text-gray-400">
                  <p>📍 <span className="font-medium">{event.location}</span></p>
                  <p>📅 <span className="font-medium">{new Date(event.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}</span></p>
                  <p>🎫 <span className="italic">{event.eventType}</span></p>
                </div>
              </div>
            ))}

            {/* Show "Go to Events" Button if more than 3 */}
            {events.length > 3 && (
              <div className="col-span-full mt-4">
                <button
                  onClick={() => window.location.href = "/events"}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-blue-500 transition dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white"
                >
                  Go to Events →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

          
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 dark:bg-gray-800 dark:text-white">
          <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-300">
            Total Income: ₱{totalIncome}
          </h2>

          {paymentLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
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
                      animationDuration={1000}
                      animationBegin={0}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-full mt-4">
                <button
                  onClick={() => window.location.href = "/overall"}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Go to Overall Payments →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      </div>
    </Login>
  );
  
}
