// pages/lists.js
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
  const [showEmail, setShowEmail] = useState(false);
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

  const handleGeneratePDF = async (student) => {
    const pdfBlob = await generatePDFfile(student); // Make sure this returns a Blob
    const pdfURL = URL.createObjectURL(pdfBlob);
  
    setPdfLinks((prev) => ({
      ...prev,
      [student._studentId]: pdfURL,
    }));
  
    toast.success(`PDF generated for ${student.fname} ${student.lname}!`);
  };
  const updateStudentInfo = async (studentId, updatedFields) => {
    try {
      const res = await fetch(`/api/students?id=${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
  
      setStudents((prev) =>
        prev.map((student) =>
          student._studentId === studentId ? { ...student, ...updatedFields } : student
        )
      );
      toast.success("Student info updated!");
    } catch (err) {
      toast.error("Failed to update student info.");
      console.error(err);
    } finally {
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
                <th className="border p-1 dark:border-gray-700"><div className="flex items-center justify-center">Student Number </div></th>
                <th className="border p-2 dark:border-gray-700"><div className="flex items-center justify-center">Name</div></th>
                <th className="border p-2 dark:border-gray-700"><div className="flex items-center justify-center">Email </div></th>
                <th className="border p-2 dark:border-gray-700"> <div className="flex items-center justify-center">Year Level </div></th>
                <th className="border p-2 dark:border-gray-700"><div className="flex items-center justify-center">School Year</div></th>
                <th className="border p-2 dark:border-gray-700"><div className="flex items-center justify-center">Semester</div></th>
                <th className="border p-2 dark:border-gray-700"><div className="flex items-center justify-center">Files</div></th>
                <th className="border p-2 dark:border-gray-700"><div className="flex items-center justify-center">Upload Files </div></th>
                <th className="border p-2 dark:border-gray-700"><div className="flex items-center justify-center">Status </div></th>
                <th className="border p-2 dark:border-gray-700"><div className="flex items-center justify-center">Download</div></th>
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
                    <td className="border p- dark:border-gray-700 text-center"
                      onClick={() => setShowEmail(!showEmail)}
                      title="Click to show email"
                    >
                      {showEmail ? student.email : "Click to show email"}
                      </td>
                    <td className="border p-2 text-center dark:border-gray-700">
                      <select className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={student.yearLevel}
                        onChange={(e) => updateStudentInfo(student._studentId, { yearLevel: e.target.value })}
                        >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </td>
                    <td className="border p-2 text-center dark:border-gray-700 text-gray-100">
                      <select className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={student.schoolYear}
                      onChange={(e) => updateStudentInfo(student._studentId, { schoolYear: e.target.value })}>
                        <option value="2023-2024">2023-2024</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027</option>
                        <option value="2027-2028">2027-2028</option>
                        <option value="2028-2029">2028-2029</option>
                        <option value="2029-2030">2029-2030</option>
                      </select>
                    </td>
                    <td className="border p-2 text-center dark:border-gray-700 text-gray-100">
                      <select className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={student.semester}
                      onChange={(e) => updateStudentInfo(student._studentId, { semester: e.target.value })}>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                      </select>
                    </td>
                    <td className="border p-4 text-center dark:border-gray-700 text-gray-100">
                    <Link href={`/students/student-files/${student._id}`}>
                      <button className="flex items-center gap-2 text-sm px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          aria-label="View Student Subjects">
                      <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                            <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160H160Zm84-80h516l72-240H316l-72 240Z"/>
                          </svg>
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
                        className="flex items-center justify-center gap-2 text-sm px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        aria-label="Select file to upload"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                          <path d="M440-200h80v-167l64 64 56-57-160-160-160 160 57 56 63-63v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520Z"/>
                        </svg>
                        Upload
                      </button>

                      {selectedStudentId === student._studentId && file && (
                        <div className="mt-3 space-y-2">
                          <p className="text-gray-800 dark:text-gray-400 text-sm">
                            Selected File: <span className="font-medium">{file.name}</span>
                          </p>

                          <div className="flex flex-col sm:flex-row sm:justify-center gap-2">
                            <button
                              onClick={() => handleUpload(student._studentId)}
                              disabled={uploading}
                              className="flex items-center justify-center gap-2 text-sm px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                                <path d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z"/>
                              </svg>
                              {uploading ? "Uploading..." : "Upload File"}
                            </button>

                            <button
                              onClick={() => {
                                setFile(null);
                                setSelectedStudentId(null);
                              }}
                              className="flex items-center justify-center gap-2 text-sm px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                                <path d="M480-416 313-250q-11 11-26 11t-26-11q-11-11-11-26t11-26l166-166-166-166q-11-11-11-26t11-26q11-11 26-11t26 11l166 166 166-166q11-11 26-11t26 11q11 11 11 26t-11 26L533-480l166 166q11 11 11 26t-11 26q-11 11-26 11t-26-11L480-416Z"/>
                              </svg>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="border p-4 text-center dark:border-gray-700">
                    <select
                      value={student.status}
                      onChange={(e) => updateStudentInfo(student._studentId, { status: e.target.value })}
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
                          className="inline-flex items-center gap-2 text-sm px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                            <path d="M382-320 155-547l57-57 170 170 366-366 57 57-423 423ZM200-160v-80h560v80H200Z"/>
                          </svg>
                          Downloaded
                        </a>
                      ) : (
                        <button
                          onClick={() => handleGeneratePDF(student)}
                          className="inline-flex items-center gap-2 text-sm px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                            <path d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"/>
                          </svg>
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