import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const { data: session } = useSession();
  const [initialized, setInitialized] = useState(false); // Prevent duplicate toasts

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
          setInitialized(true); // Prevent the toast from showing again
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

  return (
    <Login>
      <Link className="btn-primary" href="/students/new">
        Add new student
      </Link>

      <table className="basic mt-2 w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">#</th>
            <th className="border border-gray-300 p-2">Student Number</th>
            <th className="border border-gray-300 p-2">First Name</th>
            <th className="border border-gray-300 p-2">Middle Name</th>
            <th className="border border-gray-300 p-2">Last Name</th>
            <th className="border border-gray-300 p-2">Mobile Number</th>
            <th className="border border-gray-300 p-2">Education</th>
            {students.some((s) => s.education === "college") && (
              <th className="border border-gray-300 p-2">Course</th>
            )}
            {students.some((s) => s.education === "senior-high") && (
              <th className="border border-gray-300 p-2">Strand</th>
            )}
            <th className="border border-gray-300 p-2">Registration Date</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Password</th>
            <th className="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student._id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2">{index + 1}</td>
              <td className="border border-gray-300 p-2">{student._studentId}</td>
              <td className="border border-gray-300 p-2">{student.fname}</td>
              <td className="border border-gray-300 p-2">{student.mname}</td>
              <td className="border border-gray-300 p-2">{student.lname}</td>
              <td className="border border-gray-300 p-2">{student.mobile}</td>
              <td className="border border-gray-300 p-2">{student.education}</td>
              {student.education === "college" && (
                <td className="border border-gray-300 p-2">{student.course}</td>
              )}
              {student.education === "senior-high" && (
                <td className="border border-gray-300 p-2">{student.strand}</td>
              )}
            <td className="border border-gray-300 p-2">
              {new Date(student.registrationDate).toLocaleDateString("en-US")}
            </td>
              <td className="border border-gray-300 p-2">{student.email}</td>
              <td className="border border-gray-300 p-2">{student.password}</td >
              <td className="border border-gray-300 p-2 flex text-center ">
                <Link className="btn-default" href={`/students/edit/${student._id}`}>
                  Edit
                </Link>
                <Link className="btn-red" href={`/students/delete/${student._id}`}>
                  Delete
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Login>
  );
}
