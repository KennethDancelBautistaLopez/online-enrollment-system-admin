import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/Loading";

export default function Students() {
  const [students, setStudents] = useState([]);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const initialized = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!session) return;

    const fetchStudents = async () => {
      try {
        const response = await axios.get("/api/students");
        setStudents(response.data);

        if (!initialized.current && response.data.length > 0) {
          toast.success("Students loaded successfully! ✅");
          initialized.current = true;
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students.");
      }finally {
        setLoading(false);
      }

    };

    fetchStudents();
  }, [session]);

  useEffect(() => {
    if (!session) {
      toast.error("You are not logged in.");
    }
  }, [session]);

  if (!session) return <Login />;

  const filteredStudents = students.filter((student) =>
    `${student.fname} ${student.lname} ${student._studentId} ${student.course} ${student.education} ${student.yearLevel} ${student.semester} ${student.schoolYear} ${student.registrationDate} ${student.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Login>
      <div className="container mx-auto p-4 text-gray-900 dark:text-gray-100">
      {loading ? (
        <LoadingSpinner /> 
      ) : (
        <> 
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h1 className="text-3xl font-bold mb-2 md:mb-0 text-gray-800 dark:text-white">Students List</h1>
          <Link
            className="btn-primary-filled px-6 py-3 bg-blue-500 text-white rounded-lg border border-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            href="/students/new"
          >
            Add new student
          </Link>
        </div>

            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search by Name, Student Number or Email"
              className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
              <table className="min-w-full text-left table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    <th className="border p-2 dark:border-gray-700">#</th>
                    <th className="border p-2 dark:border-gray-700">Student Number</th>
                    <th className="border p-2 dark:border-gray-700">First Name</th>
                    <th className="border p-2 dark:border-gray-700">Middle Name</th>
                    <th className="border p-2 dark:border-gray-700">Last Name</th>
                    <th className="border p-2 dark:border-gray-700">Mobile Number</th>
                    <th className="border p-2 dark:border-gray-700">Education</th>
                    {students.some((s) => s.education === "college") && (
                      <th className="border p-2 dark:border-gray-700">Course</th>
                    )}
                    {students.some((s) => s.education === "senior-high") && (
                      <th className="border p-2 dark:border-gray-700">Strand</th>
                    )}
                    <th className="border p-2 dark:border-gray-700">Semester</th>
                    <th className="border p-2 dark:border-gray-700">Registration Date</th>
                    <th className="border p-2 dark:border-gray-700">Email</th>
                    <th className="border p-2 dark:border-gray-700">Password</th>
                    <th className="border p-2 dark:border-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center p-4">No students found</td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="border p-2 text-center dark:border-gray-700">{index + 1}</td>
                        <td className="border p-2 dark:border-gray-700">{student._studentId}</td>
                        <td className="border p-2 dark:border-gray-700">{student.fname || "N/A"}</td>
                        <td className="border p-2 dark:border-gray-700">{student.mname || "N/A"}</td>
                        <td className="border p-2 dark:border-gray-700">{student.lname || "N/A"}</td>
                        <td className="border p-2 dark:border-gray-700">{student.mobile || "N/A"}</td>
                        <td className="border p-2 dark:border-gray-700">{student.education || "N/A"}</td>
                        <td className="border p-2 dark:border-gray-700">{student.course || "N/A"}</td>
                        <td className="border p-2 dark:border-gray-700">{student.semester || "N/A"}</td>
                        <td className="border p-2 dark:border-gray-700">
                          {new Date(student.registrationDate).toLocaleDateString("en-US")}
                        </td>
                        <td className="border p-2 dark:border-gray-700">{student.email || "N/A"}</td>
                        <td
                          className="border p-2 dark:border-gray-700 cursor-pointer select-none"
                          onClick={() => setShowPassword(!showPassword)}
                          title="Click to toggle visibility"
                        >
                          {showPassword ? student.password : "••••••••"}
                        </td>
                        <td className="border p-2 dark:border-gray-700 flex justify-center space-x-2">
                          <Link
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition"
                            href={`/students/edit/${student._id}`}
                          >
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 -960 960 960"
                            fill="currentColor"
                          >
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                          </svg>
                            Edit
                          </Link>
                          <Link
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition"
                            href={`/students/delete/${student._id}`}
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
                        </td>
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
