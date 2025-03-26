import Login from "@/pages/Login";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import StudentForm from "@/components/StudentForm"; // Ensure this component exists

export default function EditStudentPage() {
  const [studentInfo, setStudentInfo] = useState(null);
  const router = useRouter();
  const { _studentId } = router.query;

  useEffect(() => {
    if (!_studentId) {
      return;
    }
    axios.get('/api/students?id=' + _studentId).then(response => {
      setStudentInfo(response.data);
    });
  }, [_studentId]);

  return (
    <Login>
      <h1>Edit Student</h1>
      {studentInfo && <StudentForm {...studentInfo} />}
    </Login>
  );
}
