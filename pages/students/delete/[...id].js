import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import {toast} from "react-hot-toast";
 
export default function DeleteStudentPage() {
  const router = useRouter();
  const { id } = router.query; // Get student ID from URL
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    axios.get(`/api/students?id=${id}`)
      .then(response => setStudentInfo(response.data))
      .catch(error => {
        console.error("Error fetching student:", error);
        toast.error("Failed to load student details. 🚨");
      });
  }, [id]);

  function goBack() {
    router.push('/students'); // Redirect back to students list
  }

  async function deleteStudent() {
    try {
      await axios.delete(`/api/students?id=${id}`);
      toast.success("Student deleted successfully! ✅");
      goBack();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student. Please try again. ❌");
    }
  }

  return (
    <Login>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
          <h1 className="text-lg font-semibold mb-4">
            Do you really want to delete <b>{studentInfo?.fname} {studentInfo?.lname}</b>?
          </h1>
          <div className="flex justify-center gap-4">
            <button onClick={deleteStudent} className="bg-red-500 text-white px-4 py-2 rounded">
              Yes
            </button>
            <button onClick={goBack} className="bg-gray-300 px-4 py-2 rounded">
              No
            </button>
          </div>
        </div>
      </div>
    </Login>
  );
}
