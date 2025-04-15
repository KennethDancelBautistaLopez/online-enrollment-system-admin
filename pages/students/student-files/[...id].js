import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Login from "@/pages/Login";
import Link from "next/link";
import LoadingSpinner from "@/components/Loading";
import toast, { Toaster } from "react-hot-toast";

export default function StudentFiles() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { id } = router.query;

  const [student, setStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // Track loading by filePath

  const fetchStudent = () => {
    fetch(`/api/students?id=${id}`)
      .then((res) => res.json())
      .then((data) => setStudent(data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch student data.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) fetchStudent();
  }, [id]);

  const handleDelete = async (filePath) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    setActionLoading((prev) => ({ ...prev, [filePath]: true }));

    try {
      const res = await fetch(`/api/upload?studentId=${id}&filePath=${encodeURIComponent(filePath)}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("File deleted successfully.");
        fetchStudent();
      } else {
        console.error(data.error);
        toast.error("Failed to delete file.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong while deleting the file.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [filePath]: false }));
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
                  const isBusy = actionLoading[file.filePath];
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
                          href={file.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm ${
                            isBusy ? "opacity-50 pointer-events-none" : ""
                          }`}
                        >
                          {isBusy ? "Opening..." : "View"}
                        </a>
                        <a
                          href={file.filePath}
                          download
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleDelete(file.filePath)}
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
                  ← Back to Payments
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
