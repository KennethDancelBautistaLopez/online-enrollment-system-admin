import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Login from "@/pages/Login";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { generatePDFfile } from "@/components/generatePDFfile";

export async function getServerSideProps() {
  try {
    const res = await fetch('http://localhost:3000/api/students');
    const data = await res.json();

    return {
      props: {
        initialStudents: data || [],
      },
    };
  } catch (error) {
    console.error("Error fetching students:", error);
    return {
      props: {
        initialStudents: [],
      },
    };
  }
}

export default function Students({ initialStudents }) {
  const [students, setStudents] = useState(initialStudents || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfLinks, setPdfLinks] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const { data: session } = useSession();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!session) return;
    axios.get("/api/students").then((response) => {
      setStudents(response.data);
      toast.success("Students loaded successfully! ✅");
    }).catch((error) => {
      toast.error("Failed to load students.");
      console.error(error);
    });
  }, [session]);

  useEffect(() => {
    if (!session) toast.error("You don't have permission to access this page.");
  }, [session]);

  if (!session) return <Login />;

  const handleGeneratePDF = (student) => {
    const pdfLink = generatePDFfile(student);
    setPdfLinks((prev) => ({
      ...prev,
      [student._studentId]: pdfLink,
    }));
    toast.success(`PDF generated for ${student.fname} ${student.lname}!`);
  };

  const updateStudentStatus = async (studentId, status) => {
    try {
      const res = await fetch(`/api/students?id=${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setStudents((prev) =>
        prev.map((student) =>
          student._studentId === studentId ? { ...student, status } : student
        )
      );
      toast.success("Student status updated!");
    } catch (err) {
      toast.error("Failed to update status.");
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024;

    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      toast.error("Only JPEG and PDF are allowed.");
      e.target.value = '';
      return;
    }

    if (selectedFile && selectedFile.size > maxSize) {
      toast.error("File too large. Max 10MB.");
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (studentId) => {
    if (!file) {
      toast.error("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', studentId);

    try {
      setUploading(true);
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { filePath } = res.data;
      setStudents((prev) =>
        prev.map((s) => s._studentId === studentId ? { ...s, filePath } : s)
      );
      toast.success("File uploaded!");
    } catch (err) {
      toast.error("Upload failed.");
      console.error(err);
    } finally {
      setUploading(false);
      setFile(null);
      setSelectedStudentId(null);
    }
  };

  const triggerFileSelection = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // 🔍 Filter students based on search
  const filteredStudents = students.filter((student) =>
    `${student.fname} ${student.lname} ${student.email} ${student._studentId}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Login>
      <div>
        <h1 className="text-2xl font-bold mb-4">List of Students</h1>

        {/* 🔍 Search Bar */}
        <input
          type="text"
          placeholder="Search by Name, Email or Student Number"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <table className="basic mt-4 w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Student Number</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Files</th>
              <th className="border p-2">Upload Files</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Download</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-4">No students found</td></tr>
            ) : (
              filteredStudents.map((student, index) => (
                <tr key={student._studentId} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{student._studentId}</td>
                  <td className="border p-2">{student.fname} {student.mname} {student.lname}</td>
                  <td className="border p-2">{student.email}</td>
                  <td className="border p-2 text-center">
                    {student.filePath && (
                      <a href={`/uploads/${student._studentId}-download.jpg`} target="_blank" className="btn-primary text-sm px-3 py-1">View</a>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => {
                        setSelectedStudentId(student._studentId);
                        triggerFileSelection();
                      }}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Upload
                    </button>
                    {selectedStudentId === student._studentId && file && (
                      <div className="mt-2">
                        <span>{file.name}</span>
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
                  <td className="border p-2">
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
                  <td className="border p-2 text-center">
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
