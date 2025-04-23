import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Login from "@/pages/Login";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { generatePDFfile } from "@/components/generatePDFfile";
import LoadingSpinner from "@/components/Loading";
import Link from "next/link";

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
  const [loading, setLoading] = useState(true);
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
    }).finally(() => setLoading(false));
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
    }finally{
      setLoading(false);
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
  
    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      console.log("Base64 String:", base64String); 
    };
    reader.readAsDataURL(selectedFile);
  
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
      setLoading(false);
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
  `${student.fname} ${student.lname} ${student.email} ${student.status} ${student._studentId}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Login>
      <div className="container mx-auto p-6">
        {loading ? (
          <LoadingSpinner/>
        ) : ( 
        <>
        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            List of Students
          </h1>
        </div>
  
        <input
          type="text"
          placeholder="Search by Name, Email or Student Number"
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
                <th className="border p-2 dark:border-gray-700">Name</th>
                <th className="border p-2 dark:border-gray-700">Email</th>
                <th className="border p-2 dark:border-gray-700">Files</th>
                <th className="border p-2 dark:border-gray-700">Upload Files</th>
                <th className="border p-2 dark:border-gray-700">Status</th>
                <th className="border p-2 dark:border-gray-700">Download</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student._studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="border p-2 text-center dark:border-gray-700">{index + 1}</td>
                    <td className="border p-2 dark:border-gray-700">{student._studentId || "N/A"}</td>
                    <td className="border p-2 dark:border-gray-700">{student.fname} {student.mname} {student.lname}</td>
                    <td className="border p-2 dark:border-gray-700">{student.email || "N/A"}</td>
                    <td className="border p-4 text-center dark:border-gray-700 text-gray-100">
                    <Link href={`/students/student-files/${student._id}`}>
                      <button className="btn-primary text-sm px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        View
                      </button>
                    </Link>
                    </td>
                    <td className="border p-4 text-center dark:border-gray-700 text-gray-100">
                      <button
                        onClick={() => {
                          setSelectedStudentId(student._studentId);
                          triggerFileSelection();
                        }}
                        className="btn-primary text-sm px-3 py-2 bg-green-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Upload
                      </button>
                      {selectedStudentId === student._studentId && file && (
                        <div className="mt-2">
                          <span className=" text-gray-800 dark:text-gray-400"> Selected File: {file.name}</span>
                          <button
                            onClick={() => handleUpload(student._studentId)}
                            disabled={uploading}
                            className="btn-primary text-sm px-3 py-2 mt-2 bg-yellow-500 text-white rounded-md hover:bg-blue-600"
                          >
                            {uploading ? "Uploading..." : "Upload File"}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="border p-4 text-center dark:border-gray-700">
                    <select
                      value={student.status}
                      onChange={(e) => updateStudentStatus(student._studentId, e.target.value)}
                      className="bg-white text-gray-900 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-400">

                        <option value="">Select Status</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="graduated">Graduated</option>
                        <option value="dropped">Dropped</option>
                        <option value="missing files">Missing Files</option>
                      </select>
                    </td>
                    <td className="border p-4 text-center dark:border-gray-700">
                      {pdfLinks[student._studentId] ? (
                        <a
                          href={pdfLinks[student._studentId]}
                          download={`${student.fname}_${student.lname}_info.pdf`}
                          className="btn-primary text-sm px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Download
                        </a>
                      ) : (
                        <button
                          onClick={() => handleGeneratePDF(student)}
                          className="btn-primary text-sm px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-blue-600"
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
        </div>
  
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        </>
        )}
      </div>
    </Login>
  );
  
}