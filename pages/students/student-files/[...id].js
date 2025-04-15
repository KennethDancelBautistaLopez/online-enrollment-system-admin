import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Login from "@/pages/Login";
import Link from "next/link";
import LoadingSpinner from "@/components/Loading";

export default function StudentFiles() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { id } = router.query;

  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/students?id=${id}`)
        .then(res => res.json())
        .then(data => setStudent(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <Login>
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
                {student.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                  >
                    <div>
                      <p className="text-sm font-medium">{file.filename}</p>
                      <p className="text-xs text-gray-500">{file.mimeType}</p>
                    </div>
                    <a
                      href={file.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
                    >
                      View File
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No uploaded files found.</p>
            )}
  
            <div className="mt-6 ">
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
