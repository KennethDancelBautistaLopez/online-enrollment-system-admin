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
  const [showEvents, setShowEvents] = useState(false);
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
        console.error("❌ Error fetching events:", err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to load events.";
        toast.error(`Error: ${errorMessage} 🚨`);
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
          initialized.current = true;
        }
      })
      .catch((error) => {
        console.error("❌ Failed to fetch payments:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch payments.";
        toast.error(`Error: ${errorMessage} 🚨`);
      })
      .finally(() => {
        setPaymentLoading(false);
      });
  }, [session, initialized]);

  if (!session && status !== "loading") {
    return <Login />;
  }

const formatRole = (role) => {
  switch(role) {
    case 'superAdmin':
      return 'Super Admin';
    case 'admin':
      return 'Administrator';
    case 'user':
      return 'Student';
    case 'registrar':
      return 'Registrar';
    case 'accountant':
      return 'Accountant';
    default:
      return 'Unknown Role';
  }
};

  return (
    <Login>
      <div className="p-4 sm:p-8 dark:bg-gray-900 dark:text-white">
        {/* Welcome Section */}
        <div className="text-blue-900 flex justify-between items-center mb-8 dark:text-blue-200">
          <h2 className="text-xl font-semibold">
            Hello, <span className="text-black dark:text-white">{session?.user?.email}</span>
          </h2>
          <div className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow dark:bg-gray-700 dark:text-blue-200">
            <span className="mr-2">{formatRole(session?.user?.role)}:</span>
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
                <div className="mb-2 ">
                <p className="text-gray-700 p-2 dark:border-gray-600  border-2 rounded-md border-blue-900  cursor-pointer dark:text-gray-300 dark:text-gray-400"
                onClick={() => setShowEvents(!showEvents)} 
                title="Click to show details"
                >
                  {showEvents ? event.description : "Click to show details"}
                  </p>
                  </div>
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

            {(session?.user?.role === "superAdmin" || session?.user?.role === "admin") && (
              <div className="col-span-full mt-4">
                <button
                  onClick={() => window.location.href = "/events"}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white"
                >
                  Go to Events
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 -960 960 960"
                    fill="currentColor"
                  >
                    <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <totalStudents />

      {session?.user?.role === "superAdmin"  && (
            <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 dark:bg-gray-800 dark:text-white">
          <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-300">
            Total Payments: ₱{totalIncome}
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
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white"
                >
                  Go to Overall Payments
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 -960 960 960"
                    fill="currentColor"
                  >
                    <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      )}
  

      </div>
    </Login>
  );
  
}
