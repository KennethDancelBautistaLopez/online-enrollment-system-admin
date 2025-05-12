import { useEffect, useState } from "react";
import Login from "@/pages/Login";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/Loading";

const STATUS_COLORS = {
  "enrolled": "#4ade80",       // green-400
  "graduated": "#f87171",      // red-400
  "dropped": "#facc15",        // yellow-300
  "missing files": "#60a5fa",  // blue-400
  "unknown": "#9ca3af",        // gray-400 fallback
};

const STUDENT_TYPE_COLORS = {
  "new": "#34d399",         // green-400
  "old": "#60a5fa",         // blue-400
  "irregular": "#fbbf24",   // yellow-400
  "unknown": "#9ca3af",     // gray-400 fallback
};

export default function StudentStatusPieChart() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [studentTypeChartData, setStudentTypeChartData] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    axios
      .get("/api/students")
      .then((response) => {
        const students = response.data;

        if (!Array.isArray(students) || students.length === 0) {
          console.warn("⚠️ No students found or invalid format.");
          setChartData([]);
          setStudentTypeChartData([]);
          setTotalStudents(0);
          toast.error("No students found. ❌");
          return;
        }

        setTotalStudents(students.length);

        const statusCounts = students.reduce((acc, student) => {
          const rawStatus = student.status || "Unknown";
          const status = rawStatus.toLowerCase().trim();
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        const studentTypeCounts = students.reduce((acc, student) => {
          const rawType = student.studentType || "Unknown";
          const type = rawType.toLowerCase().trim();
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        const formattedStatusData = Object.entries(statusCounts).map(
          ([status, count]) => ({
            name: status,
            value: count,
            color: STATUS_COLORS[status] || "#9ca3af",
          })
        );

        const formattedTypeData = Object.entries(studentTypeCounts).map(
          ([type, count]) => ({
            name: type,
            value: count,
            color: STUDENT_TYPE_COLORS[type] || "#9ca3af",
          })
        );

        setChartData(formattedStatusData);
        setStudentTypeChartData(formattedTypeData);

        if (!initialized) {
          toast.success("Students loaded successfully! ✅");
          setInitialized(true);
        }
      })
      .catch((error) => {
        console.error("❌ Failed to fetch students:", error);
        toast.error("Failed to fetch students. 🚨");
      })
      .finally(() => setLoading(false));
  }, [session, initialized]);

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
    <div className="space-y-8 px-4 sm:px-6 md:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 text-center">
        📊 Student Status & Type Distribution
      </h1>

      <h2 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-blue-400 text-center">
        Total Students:{" "}
        <span className="text-gray-900 dark:text-white">{totalStudents}</span>
      </h2>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Student Status Chart */}
          <div className="bg-white border border-gray-200 dark:bg-gray-900 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-600 dark:text-blue-400 text-center">
              Student Status Distribution
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    color: "#1f2937",
                    border: "1px solid #d1d5db",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
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

          {/* Student Type Chart */}
          <div className="bg-white border border-gray-200 dark:bg-gray-900 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-600 dark:text-blue-400 text-center">
              Student Type Distribution
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentTypeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {studentTypeChartData.map((entry, index) => (
                    <Cell key={`type-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    color: "#1f2937",
                    border: "1px solid #d1d5db",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
              {studentTypeChartData.map((item, index) => (
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
      )}
    </div>
  </Login>
  );
};