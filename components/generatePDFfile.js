import jsPDF from "jspdf";

const convertImageToBase64 = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export async function generatePDFfile(student) {
  const doc = new jsPDF();
  const formatDate = (date) => new Date(date).toLocaleDateString("en-US");

  const loadLogoAndGeneratePDF = async () => {
    const logoBase64 = await convertImageToBase64("/logo.png");

    // Header
    doc.addImage(logoBase64, "PNG", 15, 10, 25, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ST. CLARE COLLEGE OF CALOOCAN", 105, 20, null, null, "center");
    doc.setFontSize(13);
    doc.text("ENROLLMENT FORM", 105, 28, null, null, "center");

    let y = 40;

    const sectionTitle = (title) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(title, 15, y);
      y += 3;
      doc.setDrawColor(180);
      doc.line(15, y, 195, y);
      y += 6;
    };

    const addField = (label, value, x1 = 15, x2 = 42) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${label}:`, x1, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || "N/A"), x2, y); 
    };

    sectionTitle("Student Information");
    addField("Full Name", `${student.fname} ${student.mname} ${student.lname}`);
    addField("Student Number", student._studentId, 110, 142);
    y += 7;

    addField("Email", student.email);
    addField("Mobile Number", student.mobile, 110, 140);
    y += 7;

    addField("Date of Birth", formatDate(student.birthdate));
    addField("Landline", student.landline, 110, 130);
    y += 7;

    addField("Place of Birth", student.birthplace);
    addField("Facebook", student.facebook, 110, 132);
    y += 7;

    addField("Nationality", student.nationality);
    addField("Sex", student.sex, 110, 120);
    y += 7;

    addField("Religion", student.religion);
    y += 10;

    sectionTitle("Parent / Guardian Information");
    addField("Father", student.father, 15, 30);
    addField("Mother", student.mother, 110, 127);
    y += 7;

    addField("Guardian", student.guardian ,15 , 35);
    addField("Guardian's Occupation", student.guardianOccupation, 110, 155);
    y += 10;

    sectionTitle("Educational Background");

    addField("Nursery", student.nursery?.schoolName || "");
    addField("Year", student.nursery?.yearAttended || "", 110, 123);
    y += 7;
    
    addField("Elementary", student.elementary?.schoolName || "");
    addField("Year", student.elementary?.yearAttended || "", 110, 123);
    y += 7;
    
    addField("Junior High", student.juniorHigh?.schoolName || "");
    addField("Year", student.juniorHigh?.yearAttended || "", 110, 123);
    y += 7;
    
    addField("Senior High", student.seniorHigh?.schoolName || "");
    addField("Year", student.seniorHigh?.yearAttended || "", 110, 123);
    y += 10;
    

    sectionTitle("Enrollment Details");
    addField("Education Level", student.education, 15, 47);
    addField("Year Level", student.yearLevel, 110, 132);
    y += 7;

    addField("School Year", student.schoolYear);
    addField("LRN", student.lrn, 110, 120);
    y += 7;

    addField("Course", student.course);
    addField("Student No.", student._studentId, 110, 135);
    y += 10;

    sectionTitle("Enrollment Contract");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const contractText = `I hereby agree to enroll at St. Clare College of Caloocan for the current academic year, and I promise to pay the required matriculation fees and any other charges that may arise as part of my enrollment. I further commit to abiding by the rules and regulations set forth by the college, including academic, behavioral, and financial policies. I understand that failure to comply with these rules may result in disciplinary action, including but not limited to suspension or dismissal. Additionally, we as the parent/guardian of this student, fully support and endorse this agreement and ensure that the matriculation fees will be settled in a timely manner. This contract is binding upon signature by both the student and the parent/guardian.`;
    const lines = doc.splitTextToSize(contractText, 180);
    doc.text(lines, 15, y);
    y += lines.length * 5;

    y += 15;
    doc.setFont("helvetica", "normal");
    doc.text("_________________________", 30, y);
    doc.text("_________________________", 120, y);
    y += 5;
    doc.text("Student Signature", 40, y);
    doc.text("Parent/Guardian Signature", 125, y);

    y += 15;
    doc.text("_________________________", 70, y);
    y += 5;
    doc.text("Registrar's Signature", 80, y);

    doc.save(`${student.fname || "Student"}_${student.lname || "Name"}_Enrollment_Form.pdf`);

    return doc.output("blob");
  };

  return await loadLogoAndGeneratePDF();
}
