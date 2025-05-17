import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/Loading";

export default function DeleteStudentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentPayments, setStudentPayments] = useState([]);

  useEffect(() => {
    if (!id) return;

    // Fetch student info
    axios
      .get(`/api/students?id=${id}`)
      .then((response) => setStudentInfo(response.data))
      .catch((error) => {
        console.error("Error fetching student:", error);
        toast.error("Failed to load student details. 🚨");
      });

    // Fetch related payments
    axios
      .get(`/api/payments?studentId=${id}`)
      .then((response) => setStudentPayments(response.data.data || []))
      .catch((error) => {
        console.error("Error fetching student payments:", error);
        toast.error("Failed to load student payments. 💸");
      })
      .finally(() => setLoading(false));
  }, [id]);

  function goBack() {
    router.push("/students");
  }

  async function deleteStudent() {
    try {
      await axios.delete(`/api/students?id=${id}`);
      toast.success("Student Archived successfully! ✅");
      goBack();
    } catch (error) {
      console.error("Error Archiving student:", error);
      toast.error("Failed to Archive student. Please try again. ❌");
    }
  }

  return (
    <Login>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center w-96">
              <h1 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Do you really want to Archive{" "}
                <b>
                  {studentInfo?.fname} {studentInfo?.lname}
                </b>
                ?
              </h1>

              {studentPayments.length > 0 && (
                <div className="text-sm text-red-600 dark:text-red-400 mb-4">
                  ⚠️ This student has {studentPayments.length} recorded
                  payment(s).
                </div>
              )}

              <div className="flex justify-center gap-4">
                <button
                  onClick={deleteStudent}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Yes
                </button>
                <button
                  onClick={goBack}
                  className="bg-gray-300 dark:bg-gray-600 dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  No
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Login>
  );
}
