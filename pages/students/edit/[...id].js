import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import StudentForm from "@/components/StudentForm";
import {toast} from "react-hot-toast";
import LoadingSpinner from "@/components/Loading";

export default function EditStudentPage() {
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
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
    if (!studentId) return; 
  
    console.log("🔄 Fetching student data for ID:", studentId);
  
    axios.get(`/api/students`, { params: { id: studentId } })
      .then((response) => {
        console.log("✅ Fetched student data:", response.data);
  
        if (response.data && Object.keys(response.data).length > 0) {
          setStudentInfo(response.data);
          toast.success("Student details loaded successfully! ✅");

        } else {
          toast.error("No student found for the provided ID. ❌");
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching student:", error.response?.data?.error || error.message);
        toast.error("Failed to load student data! 🚨");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [studentId]); 

  return (
    <Login>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4 dark:text-white text-gray-700">Edit Student</h1>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {studentInfo ? (
            <StudentForm {...studentInfo} />
          ) : ( 
            !error && <p>Loading student data...</p>
          )}
        </>
        )}
    </Login>
  );
}
