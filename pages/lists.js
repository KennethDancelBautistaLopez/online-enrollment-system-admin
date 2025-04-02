import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";
import { generatePDFfile } from "@/components/generatePDFfile";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [pdfLinks, setPdfLinks] = useState({});

  const { data: session } = useSession();


  useEffect(() => {
    if (!session) {
      return;
    }
    axios.get("/api/students").then((response) => {
      setStudents(response.data);
      toast.success("Students loaded successfully! ✅");
    });
  }, [session]);

  // Handle PDF generation for a specific student
  function handleGeneratePDF(student) {
    const pdfLink = generatePDFfile(student);
    setPdfLinks((prevPdfLinks) => ({
      ...prevPdfLinks,
      [student._studentId]: pdfLink, // Add the new PDF link for this student
    }));

    toast.success(`PDF generated for ${student.fname} ${student.lname}!`, {
      duration: 3000, // Duration in milliseconds
    });
  }

  // view files for a specific student


  // upload files



  const updateStudentStatus = async (studentId, status) => {
    try {
      const response = await fetch(`/api/students?id=${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update student status');
      }

      // Update the student status in the local state
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._studentId === studentId
            ? { ...student, status }  // Update the status for the selected student
            : student
        )
      );

      console.log('Updated student:', data);
    } catch (error) {
      console.error(error);
    }
  };
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
      <h1 className="text-2xl font-bold mb-4">List of Students</h1>
      <table className="basic mt-4 w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">#</th>
            <th className="border border-gray-300 p-2">Student Number</th>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Files</th>
            <th className="border border-gray-300 p-2">Upload Files</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Download</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student._studentId} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
              <td className="border border-gray-300 p-2">{student._studentId}</td>
              <td className="border border-gray-300 p-2">{student.fname} {student.mname} {student.lname}</td>
              <td className="border border-gray-300 p-2">{student.email}</td>

              <td className="border border-gray-300 p-2 text-center">
                <a
                  href={`/files/${student._studentId}`}
                  className="btn-primary text-sm px-3 py-1"
                >
                  View
                </a>
              </td>

              <td className="border border-gray-300 p-2 text-center">
                <a
                  href={`/upload/${student._studentId}`}
                  className="btn-primary text-sm px-3 py-1"
                >
                  Upload
                </a>
              </td>

              <td className="border border-gray-300 p-2">
                <select
                  value={student.status}
                  onChange={(e) => updateStudentStatus(student._studentId, e.target.value)}
                  className="bg-white border border-gray-300 p-2"
                >
                  <option value="">Select Status</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="graduated">Graduated</option>
                  <option value="dropped">Dropped</option>
                  <option value="missing files">Missing Files</option>
                </select>
              </td>

              <td className="border border-gray-300 p-2 text-center">
                {pdfLinks[student._studentId] ? (
                  <a
                    href={pdfLinks[student._studentId]}
                    download={`${student.fname}_${student.lname}_info.pdf`}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Download
                  </a>
                ) : (
                  <button
                    onClick={() => handleGeneratePDF(student)} // Pass the student to the function
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Generate PDF
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Login>
  );
}
