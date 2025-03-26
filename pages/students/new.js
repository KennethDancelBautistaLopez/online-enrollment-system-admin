import StudentForm from "@/components/StudentForm";
import Login from "@/pages/Login";

export default function NewStudent() {
  return (
    <Login>
      <h1>New Student</h1>
      <StudentForm />
    </Login>
  );  
}