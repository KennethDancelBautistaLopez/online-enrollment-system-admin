import { jsPDF } from "jspdf";

export function generatePDFfile(student) {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ST. CLARE COLLEGE OF CALOOCAN", 105, 20, null, null, "center");
  doc.setFontSize(16);
  doc.text("ENROLLMENT FORM", 105, 30, null, null, "center");

  let y = 40;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const addDetail = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value) || "N/A", 80, y);
    y += 8;
  };

  addDetail("Student Number", student._studentId);
  addDetail("Full Name", `${student.fname} ${student.mname || ""} ${student.lname}`);
  addDetail("Email", student.email);
  addDetail("Mobile Number", student.mobile);
  addDetail("Landline", student.landline || "N/A");
  addDetail("Facebook", student.facebook || "N/A");
  addDetail("Date of Birth", student.birthdate);
  addDetail("Nationality", student.nationality);
  addDetail("Place of Birth", student.birthplace);
  addDetail("Religion", student.religion || "N/A");
  addDetail("Sex", student.sex);
  addDetail("Education Level", student.education);
  addDetail("Course", student.course || "N/A");
  addDetail("Strand", student.strand || "N/A");
  addDetail("Year Level", student.yearLevel);
  addDetail("School Year", student.schoolYear);
  addDetail("LRN", student.lrn || "N/A");

  // Parent/Guardian Details
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Parent/Guardian Details:", 20, y);
  y += 8;
  addDetail("Father", student.father || "N/A");
  addDetail("Mother", student.mother || "N/A");
  addDetail("Guardian", student.guardian || "N/A");
  addDetail("Guardian's Occupation", student.guardianOccupation || "N/A");

  // Enrollment Contract
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Enrollment Contract", 20, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(
    "I hereby agree to enroll at St. Clare College of Caloocan for the current academic year...",
    20,
    y,
    { maxWidth: 170 }
  );
  y += 20;

  // Signatures
  doc.text("Student Signature: ________________________", 20, y);
  doc.text("Parent/Guardian Signature: ________________________", 100, y);
  y += 10;
  doc.text("Registrar's Signature: ________________________", 60, y);

  doc.save(`${student.fname}_${student.lname}_Enrollment_Form.pdf`);
}
