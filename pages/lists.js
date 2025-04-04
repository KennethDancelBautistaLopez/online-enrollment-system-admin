import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Login from "@/pages/Login";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { generatePDFfile } from "@/components/generatePDFfile";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [pdfLinks, setPdfLinks] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const { data: session } = useSession();
  const fileInputRef = useRef(null);  // Reference to the file input

  useEffect(() => {
    if (!session) {
      return;
    }
    axios.get("/api/students").then((response) => {
      setStudents(response.data);
      toast.success("Students loaded successfully! ✅");
    }).catch((error) => {
      toast.error("Failed to load students.");
      console.error(error);
    });
  }, [session]);

  function handleGeneratePDF(student) {
    const pdfLink = generatePDFfile(student);
    setPdfLinks((prevPdfLinks) => ({
      ...prevPdfLinks,
      [student._studentId]: pdfLink,
    }));

    toast.success(`PDF generated for ${student.fname} ${student.lname}!`, {
      duration: 3000,
    });
  }

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

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._studentId === studentId
            ? { ...student, status }
            : student
        )
      );
      toast.success("Student status updated! ✅");
    } catch (error) {
      toast.error("Failed to update student status.");
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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'application/pdf']; // Example: restrict to image and PDF files
    const maxSize = 10 * 1024 * 1024; // Max size 10MB
  
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Only JPEG and PDF are allowed.");
      return;
    }
  
    if (selectedFile && selectedFile.size > maxSize) {
      toast.error("File size exceeds the maximum limit of 10MB.");
      return;
    }
  
    setFile(selectedFile);
  };

  const handleUpload = async (studentId) => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", studentId);

    try {
      setUploading(true);
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Assuming the server responds with the file path
      const { filePath } = response.data;

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._studentId === studentId
            ? { ...student, filePath } // Store file path in student data
            : student
        )
      );

      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload the file");
      console.error(error);
    } finally {
      setUploading(false);
      setSelectedStudentId(null); // Reset the selected student after upload
    }
  };

  // Trigger file selection dialog
  const triggerFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();  // Open the file input dialog
    }
  };

  return (
    <Login>
      <div>
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
            {students.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">No students found</td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr key={student._studentId} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{student._studentId}</td>
                  <td className="border border-gray-300 p-2">{student.fname} {student.mname} {student.lname}</td>
                  <td className="border border-gray-300 p-2">{student.email}</td>

                  <td className="border border-gray-300 p-2 text-center">
                    {student.filePath && (
                      <a
                      href={`/api/files/${student._studentId}`}
                      download={`${student.fname}_${student.lname}_info.pdf`}
                      className="btn-primary text-sm px-3 py-1"
                      >
                        View
                      </a>
                    )}
                  </td>

                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() => {
                        setSelectedStudentId(student._studentId);
                        triggerFileSelection(); // Open file dialog
                      }}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Upload
                    </button>
                    {selectedStudentId === student._studentId && file && (
                      <div className="mt-2">
                        <span>{file.name}</span> {/* Show selected file name */}
                        <button
                          onClick={() => handleUpload(student._studentId)}
                          disabled={uploading}
                          className="btn-primary text-sm px-3 py-1 mt-2"
                        >
                          {uploading ? "Uploading..." : "Upload File"}
                        </button>
                      </div>
                    )}
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
                        onClick={() => handleGeneratePDF(student)}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        Generate PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </Login>
  );
}
