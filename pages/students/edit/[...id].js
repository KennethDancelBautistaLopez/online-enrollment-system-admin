import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import StudentForm from "@/components/StudentForm";

export default function EditStudentPage() {
  const [studentInfo, setStudentInfo] = useState(null);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && router.query.id) {
      const queryId = Array.isArray(router.query.id)
        ? router.query.id[0] // ✅ Handle array case
        : router.query.id;
  
      setStudentId(queryId);
      console.log("✅ Student ID from query:", queryId);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!studentId) return; // ✅ Prevents running when studentId is undefined
  
    console.log("🔄 Fetching student data for ID:", studentId);
  
    axios.get(`/api/students`, { params: { id: studentId } })
      .then((response) => {
        console.log("✅ Fetched student data:", response.data);
  
        if (response.data && Object.keys(response.data).length > 0) {
          setStudentInfo(response.data); // ✅ Ensure `studentInfo` is updated
        } else {
          setError("Student not found");
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching student:", error.response?.data?.error || error.message);
        setError("Failed to load student data");
      });
  }, [studentId]); 

  return (
    <Login>
      <h1 className="text-2xl font-bold mb-4">Edit Student</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {studentInfo ? (
        <StudentForm {...studentInfo} /> // ✅ Pass fetched data to the form
      ) : (
        !error && <p>Loading student data...</p>
      )}
    </Login>
  );
}
