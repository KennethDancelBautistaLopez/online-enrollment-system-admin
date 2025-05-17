import Link from "next/link";
import Login from "@/pages/Login";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/Loading";
import { CSVLink } from "react-csv";

export default function Students() {
  const [students, setStudents] = useState([]);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const initialized = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchStudents = async () => {
      try {
        const response = await axios.get("/api/students");
        setStudents(response.data);

        if (!initialized.current && response.data.length > 0) {
          initialized.current = true;
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students.");
      } finally {
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
    `${student.fname} ${student.lname} ${student._studentId} ${
      student.course
    } ${student.education} ${student.yearLevel} ${student.semester} ${
      student.schoolYear
    } ${student.registrationDate} ${student.email} ${
      student.verified ? true && "verified" : false || "not"
    }`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const csvData = filteredStudents.map((student, index) => ({
    No: index + 1,
    "Full Name": `${student.lname}, ${student.fname} ${student.mname}` || "N/A",
    LRN: student.lrn || "N/A",
    "Student Number": student._studentId || "N/A",
    Gender: student.sex || "N/A",
    "Date of Birth": student.birthdate
      ? new Date(student.birthdate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A",
    Birthplace: student.birthplace || "N/A",
    Address: student.address || "N/A",
    "Mobile Number": student.mobile || "N/A",
    "Landline Number": student.landline || "N/A",
    Facebook: student.facebook || "N/A",
    Email: student.email || "N/A",
    "School Year": student.schoolYear || "N/A",
    Semester: student.semester || "N/A",
    Course: student.course || "N/A",
    Year: student.yearLevel || "N/A",
    Section: student.section || "N/A",
    "Education Level": student.education,
    "Guardian Info": `${student.guardian} (${student.guardianOccupation})`,
    Father: student.father || "N/A",
    Mother: student.mother || "N/A",
    Nationality: student.nationality || "N/A",
    Religion: student.religion || "N/A",
    "Registration Date": student.registrationDate
      ? new Date(student.registrationDate).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "N/A",
    Verified: student.verified ? "Yes" : "No",
    "Student Type": student.studentType || "N/A",

    // Education Levels
    "Nursery School": student.nursery?.schoolName || "N/A",
    "Nursery Year": student.nursery?.yearAttended || "N/A",

    "Elementary School": student.elementary?.schoolName || "N/A",
    "Elementary Year": student.elementary?.yearAttended || "N/A",

    "Junior High School": student.juniorHigh?.schoolName || "N/A",
    "Junior High Year": student.juniorHigh?.yearAttended || "N/A",

    "Senior High School": student.seniorHigh?.schoolName || "N/A",
    "Senior High Year": student.seniorHigh?.yearAttended || "N/A",

    // Subjects Flattened
    Subjects: student.subjects?.length
      ? student.subjects
          .map((sub) => `${sub.code} - ${sub.description} (${sub.units} units)`)
          .join("; ")
      : "N/A",
  }));

  return (
    <Login>
      <div className="container mx-auto p-4 text-gray-900 dark:text-gray-100">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4 md:mb-0 text-gray-800 dark:text-white">
              Students List
            </h1>

            <div className="flex justify-end items-center pt-0 pb-2 gap-2">
              {(session.user.role === "superAdmin" ||
                session.user.role === "registrar") && (
                <CSVLink
                  data={csvData}
                  filename={"Enrolled_Students_data.csv"}
                  className="btn-primary-filled px-6 py-3 bg-green-600 text-white rounded-lg border border-green-700 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Export to CSV
                </CSVLink>
              )}

              {(session.user.role === "superAdmin" ||
                session.user.role === "registrar") && (
                <Link
                  className="btn-primary-filled px-6 py-3 bg-blue-500 text-white rounded-lg border border-blue-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  href="/students/new"
                >
                  Add new student
                </Link>
              )}
            </div>

            <div className="flex items-center mb-2 gap-2">
              <input
                type="text"
                placeholder="Search by Name, Student Number, Email, verified or not"
                className="flex-1   min-w-[200px] p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
              <table className="min-w-full text-left table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    <th className="border p-2 dark:border-gray-700">#</th>
                    <th className="border p-2 dark:border-gray-700">
                      Student No.
                    </th>
                    <th className="border p-2 dark:border-gray-700">
                      First Name
                    </th>
                    <th className="border p-2 dark:border-gray-700">
                      Middle Name
                    </th>
                    <th className="border p-2 dark:border-gray-700">
                      Last Name
                    </th>
                    <th className="border p-2 dark:border-gray-700">Course</th>
                    <th className="border p-2 dark:border-gray-700">
                      Semester
                    </th>
                    <th className="border p-2 dark:border-gray-700">
                      <div className="flex items-center justify-center text-center">
                        Email
                      </div>
                    </th>
                    <th className="border p-2 dark:border-gray-700">
                      Password
                    </th>
                    {(session?.user?.role === "superAdmin" ||
                      session?.user?.role === "registrar") && (
                      <th className="border p-2 dark:border-gray-700">
                        <div className="flex items-center justify-center text-center">
                          Actions
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center p-4">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="border p-2 text-center dark:border-gray-700">
                          {index + 1}
                        </td>
                        <td className="border p-2 dark:border-gray-700">
                          {student._studentId}
                        </td>
                        <td className="border p-2 dark:border-gray-700">
                          {student.fname || "N/A"}
                        </td>
                        <td className="border p-2 dark:border-gray-700">
                          {student.mname || "N/A"}
                        </td>
                        <td className="border p-2 dark:border-gray-700">
                          {student.lname || "N/A"}
                        </td>
                        <td className="border p-2 dark:border-gray-700">
                          {student.course || "N/A"}
                        </td>
                        <td className="border p-2 dark:border-gray-700">
                          {student.semester || "N/A"}
                        </td>
                        <td
                          className="border p-2 dark:border-gray-700 text-center"
                          onClick={() => setShowEmail(!showEmail)}
                          title="Click to show email"
                        >
                          {showEmail ? (
                            <>
                              <div className="flex items-center justify-center gap-2">
                                {student.verified ? (
                                  <span
                                    className="ml-2 text-green-600 font-semibold text-sm"
                                    title="Verified Email"
                                  >
                                    ✅ Verified
                                  </span>
                                ) : (
                                  <span
                                    className="ml-2 text-red-500 font-semibold text-sm"
                                    title="Not Verified"
                                  >
                                    ❌ Not Verified
                                  </span>
                                )}{" "}
                                {student.email}
                              </div>
                            </>
                          ) : (
                            "Click to show email"
                          )}
                        </td>
                        <td
                          className="border p-2 dark:border-gray-700 cursor-pointer select-none"
                          onClick={() => setShowPassword(!showPassword)}
                          title="Click to toggle visibility"
                        >
                          {showPassword ? student.password : "••••••••"}
                        </td>
                        {(session?.user?.role === "superAdmin" ||
                          session?.user?.role === "registrar") && (
                          <td className="border p-2 dark:border-gray-700">
                            <div className="flex justify-center space-x-2">
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
                                  <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                                </svg>
                                Edit
                              </Link>

                              {session?.user?.role === "superAdmin" && (
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
                                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                                  </svg>
                                  Archive
                                </Link>
                              )}
                            </div>
                          </td>
                        )}
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
