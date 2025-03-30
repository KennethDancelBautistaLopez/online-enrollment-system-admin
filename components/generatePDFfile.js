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
    doc.text(value ? value : "______________________", 80, y);
    y += 8;
  };

  addDetail("Student Number", student._studentId || "______________________");
  addDetail("Full Name", `${student.fname || "_____"} ${student.mname || ""} ${student.lname || "_____"} `);
  addDetail("Email", student.email || "______________________");
  addDetail("Mobile Number", student.mobile || "______________________");
  addDetail("Landline", student.landline || "______________________");
  addDetail("Facebook", student.facebook || "______________________");
  addDetail("Date of Birth", student.birthdate || "______________________");
  addDetail("Nationality", student.nationality || "______________________");
  addDetail("Place of Birth", student.birthplace || "______________________");
  addDetail("Religion", student.religion || "______________________");
  addDetail("Sex", student.sex || "______________________");
  addDetail("Education Level", student.education || "______________________");

  // Show or hide Course and Strand based on Education Level
  if (student.education === "College") {
    addDetail("Course", student.course || "______________________");
  } else if (student.education === "Senior High School") {
    addDetail("Strand", student.strand || "______________________");
  }

  addDetail("Year Level", student.yearLevel || "______________________");
  addDetail("School Year", student.schoolYear || "______________________");
  addDetail("LRN", student.lrn || "______________________");

  // Parent/Guardian Details
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Parent/Guardian Details:", 20, y);
  y += 8;
  addDetail("Father", student.father || "______________________");
  addDetail("Mother", student.mother || "______________________");
  addDetail("Guardian", student.guardian || "______________________");
  addDetail("Guardian's Occupation", student.guardianOccupation || "______________________");

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
  doc.text("Student Signature: __________________", 20, y);
  doc.text("Parent/Guardian Signature: __________________", 100, y);
  y += 10;
  doc.text("Registrar's Signature:  __________________", 60, y);

  doc.save(`${student.fname || "Student"}_${student.lname || "Name"}_Enrollment_Form.pdf`);
}
