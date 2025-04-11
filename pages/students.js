import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const { data: session } = useSession();
  const initialized = useRef(false);
  const [searchQuery, setSearchQuery] = useState(""); // For search functionality

  useEffect(() => {
    if (!session) {
      return;
    }

    // Fetch students data only once after session is available
    const fetchStudents = async () => {
      try {
        const response = await axios.get("/api/students");
        setStudents(response.data);

        // Show success toast only once after students are loaded
        if (!initialized && response.data.length > 0) {
          toast.success("Students loaded successfully! ✅");
          initialized.current = true;
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students.");
      }
    };

    fetchStudents(); // Call fetch function to load students data

  }, [session, initialized]); // Only trigger when session changes or initialized state

  useEffect(() => {
    if (!session) {
      toast.error("You are not logged in.");
    }
  }, [session]); // Trigger error toast only when session is null

  if (!session) {
    return <Login />;
  }

  const filteredStudents = students.filter((student) =>
    `${student.fname} ${student.lname} ${student._studentId} ${student.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Login>
      <div className="container mx-auto p-4">
        <div className="flex flex-col  md:flex-row justify-between items-center mb-4">
          <h1 className="text-3xl font-bold mb-2 md:mb-0">Students List</h1>
          <Link className="btn-primary px-6 py-3 bg-blue-500 text-white rounded-lg border border-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400" href="/students/new">
            Add new student
          </Link>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by Name, Student Number or Email"
          className="w-full p-3 mb-6 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">#</th>
                <th className="border p-2">Student Number</th>
                <th className="border p-2">First Name</th>
                <th className="border p-2">Middle Name</th>
                <th className="border p-2">Last Name</th>
                <th className="border p-2">Mobile Number</th>
                <th className="border p-2">Education</th>
                {students.some((s) => s.education === "college") && (
                  <th className="border p-2">Course</th>
                )}
                {students.some((s) => s.education === "senior-high") && (
                  <th className="border p-2">Strand</th>
                )}
                <th classname="border p-2">Semester</th>
                <th className="border p-2">Registration Date</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Password</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center p-4">No students found</td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2">{student._studentId}</td>
                    <td className="border p-2">{student.fname}</td>
                    <td className="border p-2">{student.mname}</td>
                    <td className="border p-2">{student.lname}</td>
                    <td className="border p-2">{student.mobile}</td>
                    <td className="border p-2">{student.education}</td>
                    {student.education === "college" && (
                      <td className="border p-2">{student.course}</td>
                    )}
                    {student.education === "senior-high" && (
                      <td className="border p-2">{student.strand}</td>
                    )}
                    <td className="border p-2">{student.semester}</td>
                    <td className="border p-2">{new Date(student.registrationDate).toLocaleDateString("en-US")}</td>
                    <td className="border p-2">{student.email}</td>
                    <td className="border p-2">{student.password}</td>
                    <td className="border p-2 flex justify-center space-x-2">
                      <Link className="btn-default hover:bg-blue-600 " href={`/students/edit/${student._id}`}>
                        Edit
                      </Link>
                      <Link className="btn-default hover:bg-red-600" href={`/students/delete/${student._id}`}>
                        Delete
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Login>
  );
}
