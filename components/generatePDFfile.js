import { jsPDF } from "jspdf";

// Function to convert image file to Base64 string
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

export function generatePDFfile(student) {
  const doc = new jsPDF();

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US'); // Change 'en-US' to another locale if needed
  };
  
  const loadLogoAndGeneratePDF = async () => {
    // Convert logo image to base64
    const logoBase64 = await convertImageToBase64('/logo.png');

    // Header with Logo and Title
    doc.addImage(logoBase64, "PNG", 10, 5, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ST. CLARE COLLEGE OF CALOOCAN", 105, 15, null, null, "center");
    doc.setFontSize(16);
    doc.text("ENROLLMENT FORM", 105, 23, null, null, "center");

    let y = 35; // Space after the title

    y += 10; // Move to the next line
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Full Name:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${student.fname || "N/A"} ${student.mname || "N/A"} ${student.lname || "N/A"}`, 37, y);
    doc.setFont("helvetica", "bold");
    doc.text("Student Number:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student._studentId || "N/A", 135, y);

    y += 8; 
    doc.setFont("helvetica", "bold");
    doc.text("Email:", 15, y);  // Label: Email
    doc.setFont("helvetica", "normal");
    doc.text(student.email || "N/A", 30, y);  // Value: student.email
    
    doc.setFont("helvetica", "bold");
    doc.text("Mobile Number:", 100, y);  // Label: Mobile Number
    doc.setFont("helvetica", "normal");
    doc.text(student.mobile || "N/A",135, y);  // Value: student.mobile
   

    y += 8; // Move to the next line

    // Add Date of Birth and Landline
    doc.setFont("helvetica", "bold");
    doc.text("Date of Birth:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(student.birthdate) || "N/A", 44, y);
    doc.setFont("helvetica", "bold");
    doc.text("Landline:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.landline || "N/A", 120, y);

    y += 8; // Move to the next line

    // Add Place of Birth and Facebook
    doc.setFont("helvetica", "bold");
    doc.text("Place of Birth:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.birthplace || "N/A", 44, y);
    doc.setFont("helvetica", "bold");
    doc.text("Facebook:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.facebook || "N/A", 123, y);

    y += 8; // Move to the next line

    // Add Nationality and Sex
    doc.setFont("helvetica", "bold");
    doc.text("Nationality:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.nationality || "N/A", 39, y);
    doc.setFont("helvetica", "bold");
    doc.text("Sex:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.sex || "N/A", 110, y);

    y += 8; // Move to the next line

    // Add Religion
    doc.setFont("helvetica", "bold");
    doc.text("Religion:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.religion || "N/A", 35, y);

    y += 15; // Add some space before the next section

    // Parent/Guardian Details Section
    doc.setFont("helvetica", "bold");
    doc.text("Parent/Guardian Details", 15, y);
    y += 8; // Move down to add next fields

    doc.setFont("helvetica", "bold");
    doc.text("Father:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.father || "N/A", 30, y);
    doc.setFont("helvetica", "bold");
    doc.text("Mother:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.mother || "N/A", 117, y);

    y += 8; // Move to the next line

    doc.setFont("helvetica", "bold");
    doc.text("Guardian:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.guardian || "N/A", 36, y);
    doc.setFont("helvetica", "bold");
    doc.text("Guardian's Occupation:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.guardianOccupation || "N/A", 150, y);

    y += 15; // Add space before the next section

    // School Attended Section
    doc.setFont("helvetica", "bold");
    doc.text("School Attended", 15, y);
    y += 8; // Move down to add next fields

    doc.setFont("helvetica", "bold");
    doc.text("Nursery:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.nursery || "N/A", 35, y);
    doc.setFont("helvetica", "bold");
    doc.text("Year:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.nurseryYear || "N/A", 113, y);

    y += 8; // Move to the next line

    doc.setFont("helvetica", "bold");
    doc.text("Elementary:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.elementary || "N/A", 40, y);
    doc.setFont("helvetica", "bold");
    doc.text("Year:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.elementaryYear || "N/A", 113, y);

    y += 8; // Move to the next line

    doc.setFont("helvetica", "bold");
    doc.text("Junior High:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.juniorHigh || "N/A", 42, y);
    doc.setFont("helvetica", "bold");
    doc.text("Year:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.juniorHighYear || "N/A", 113, y);

    y += 8; // Move to the next line

    doc.setFont("helvetica", "bold");
    doc.text("Senior High:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.seniorHigh || "N/A", 42, y);
    doc.setFont("helvetica", "bold");
    doc.text("Year:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.seniorHighYear || "N/A", 113, y);

    y += 15; // Add space before the next section

    // Education Level, Year Level, School Year, LRN
    doc.setFont("helvetica", "bold");
    doc.text("Education Level:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.education || "N/A", 50, y);
    doc.setFont("helvetica", "bold");
    doc.text("Year Level:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.yearLevel || "N/A", 124, y);

    y += 8; // Move to the next line

    doc.setFont("helvetica", "bold");
    doc.text("School Year:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.schoolYear || "N/A", 43, y);
    doc.setFont("helvetica", "bold");
    doc.text("LRN:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.text(student.lrn || "N/A", 113, y);

    y += 15; // Add space before the next section
    const lineSpacing = 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14); // Make the heading bigger
    doc.text("Enrollment Contract", 15, y);
    y += lineSpacing - 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12); 

    y += 4;

    const contractText = `I hereby agree to enroll at St. Clare College of Caloocan for the current academic year, and I promise to pay the required matriculation fees and any other charges that may arise as part of my enrollment. I further commit to abiding by the rules and regulations set forth by the college, including academic, behavioral, and financial policies. I understand that failure to comply with these rules may result in disciplinary action, including but not limited to suspension or dismissal. Additionally, we as the parent/guardian of this student, fully support and endorse this agreement and ensure that the matriculation fees will be settled in a timely manner. This contract is binding upon signature by both the student and the parent/guardian.`;

    const contractLines = doc.splitTextToSize(contractText, 180); // fits well within A4
    doc.text(contractLines, 15, y);
    y += contractLines.length * 4.5;

    // Signatures Section
    y += 10;
    doc.text("Student Signature: __________________", 15, y);
    doc.text("Parent/Guardian Signature: __________________", 100, y);
    y += 10;
    doc.text("Registrar's Signature:  __________________", 55, y);

    doc.save(`${student.fname || "Student"}_${student.lname || "Name"}_Enrollment_Form.pdf`);
  };

  loadLogoAndGeneratePDF();
}
