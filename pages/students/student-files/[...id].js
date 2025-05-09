import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import Login from "@/pages/Login";
import Link from "next/link";
import LoadingSpinner from "@/components/Loading";
import toast, { Toaster } from "react-hot-toast";

export default function StudentFiles() {
  const router = useRouter();
  const { id } = router.query;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const studentId = Array.isArray(id) ? id[0] : id;

  const fetchStudent = useCallback(() => {
    if (!studentId) return;

    fetch(`/api/students?id=${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch student data.");
        return res.json();
      })
      .then((data) => setStudent(data))
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId, fetchStudent]);

  const handleDelete = async (index) => {
    if (!student?._studentId || index === undefined) return;
    const confirmDelete = confirm("Are you sure you want to delete this file?");
    if (!confirmDelete) return;

    setActionLoading((prev) => ({ ...prev, [index]: true }));

    try {
      const res = await fetch(`/api/upload?studentId=${student._studentId}&index=${index}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete file.");
      } else {
        toast.success("File deleted successfully.");
        fetchStudent(); // Refresh list
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Something went wrong while deleting the file.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  return (
    <Login>
      <Toaster position="top-right" />
      <div className="p-6">
        {loading ? (
          <LoadingSpinner />
        ) : student ? (
          <>
            <h1 className="text-2xl dark:text-white font-bold mb-4">
              Files for {student._studentId} - {student.fname} {student.lname}
            </h1>

            {student.files && student.files.length > 0 ? (
              <div className="space-y-3">
                {student.files.map((file, index) => {
                  const isBusy = actionLoading[index];
                  const viewUrl = `/api/upload?studentId=${student._studentId}&index=${index}&inline=true`;
                  const downloadUrl = `/api/upload?studentId=${student._studentId}&index=${index}`;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{file.filename}</p>
                        <p className="text-xs text-gray-500">{file.mimeType}</p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <a
                          href={viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm ${
                            isBusy ? "opacity-50 pointer-events-none" : ""
                          }`}
                        >
                          {isBusy ? "Opening..." : "View"}
                        </a>
                        <a
                          href={downloadUrl}
                          download={file.filename}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleDelete(index)}
                          disabled={isBusy}
                          className={`px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm ${
                            isBusy ? "opacity-50" : ""
                          }`}
                        >
                          {isBusy ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No uploaded files found.</p>
            )}

            <div className="mt-6">
              <Link href="/lists">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                  ← Back to Lists
                </button>
              </Link>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Student not found.</p>
        )}
      </div>
    </Login>
  );
}
