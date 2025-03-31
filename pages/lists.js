import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";
import { generatePDFfile } from "@/components/generatePDFfile"; 

export default function Students() {
  const [students, setStudents] = useState([]);
  const [pdfLinks, setPdfLinks] = useState({});

  useEffect(() => {
    axios.get("/api/students").then((response) => {
      setStudents(response.data);
    });
  }, []);
  function handleGeneratePDF() {
    students.forEach((student) => {
      const pdfLink = generatePDFfile(student);
      setPdfLinks((prevPdfLinks) => ({
        ...prevPdfLinks,
        [student.id]: pdfLink,
      }));
    });
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
            <th className="border border-gray-300 p-2">Education</th>

            {students.some((s) => s.education === "college") && (
              <th className="border border-gray-300 p-2">Course</th>
            )}
            {students.some((s) => s.education === "senior-high") && (
              <th className="border border-gray-300 p-2">Strand</th>
            )}

            <th className="border border-gray-300 p-2">Year Level</th>
            <th className="border border-gray-300 p-2">Download</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student._id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
              <td className="border border-gray-300 p-2">{student._studentId}</td>
              <td className="border border-gray-300 p-2">{student.fname} {student.mname} {student.lname}</td>
              <td className="border border-gray-300 p-2">{student.email}</td>
              <td className="border border-gray-300 p-2">{student.education}</td>

              {student.education === "college" && (
                <td className="border border-gray-300 p-2">{student.course}</td>
              )}
              {student.education === "senior-high" && (
                <td className="border border-gray-300 p-2">{student.strand}</td>
              )}

              <td className="border border-gray-300 p-2">{student.yearLevel}</td>
              <td className="border border-gray-300 p-2 text-center">
                {pdfLinks[student._id] ? (
                  <a
                    href={pdfLinks[student._id]}
                    download={`${student.fname}_${student.lname}_info.pdf`}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Download
                  </a>
                ) : (
                  <button
                    onClick={() => handleGeneratePDF(student)}
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
