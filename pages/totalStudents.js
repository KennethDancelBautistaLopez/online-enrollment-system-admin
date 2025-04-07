import { useEffect, useState } from "react";
import Login from "@/pages/Login";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

const STATUS_COLORS = {
  Enrolled: "#34D399", // Emerald
  Dropped: "#EF4444", // Red
  "Missing Files": "#FBBF24", // Amber
  Graduated: "#3B82F6", // Blue
  Unknown: "#9CA3AF", // Gray (for any undefined status)
};

export default function StudentStatusPieChart() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    axios
      .get("/api/students") // Adjust API route if needed
      .then((response) => {
        const students = response.data;

        if (!Array.isArray(students) || students.length === 0) {
          console.warn("⚠️ No students found or invalid format.");
          setChartData([]);
          setTotalStudents(0);
          toast.error("No students found. ❌");
          return;
        }

        setTotalStudents(students.length);

        // Count students per status
        const statusCounts = students.reduce((acc, student) => {
          const status = student.status || "Unknown";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        // Convert to array for recharts
        const formattedData = Object.entries(statusCounts).map(([status, count]) => ({
          name: status,
          value: count,
          color: STATUS_COLORS[status] || STATUS_COLORS.Unknown, // Default to gray if undefined
        }));

        setChartData(formattedData);

        if (!initialized) {
          toast.success("Students loaded successfully! ✅");
          setInitialized(true);
        }
      })
      .catch((error) => {
        console.error("❌ Failed to fetch students:", error);
        toast.error("Failed to fetch students. 🚨");
      });
  }, [session]);

  useEffect(() => {
    if (!session) {
      toast.error("You don't have permission to access this page.");
    }
  }, [session]);

  if (!session) {
    return <Login />;
  }

  return (
    <Login>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center">📊 Student Status Distribution</h1>

        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-blue-600 text-center">
            Total Students: <span className="text-gray-900">{totalStudents}</span>
          </h2>

          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Status Legend */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span
                    className="inline-block w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Login>
  );
}
