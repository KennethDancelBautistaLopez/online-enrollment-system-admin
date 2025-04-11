import { jsPDF } from "jspdf";

// Convert logo to base64
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

export function generateReceiptPDF(payment) {
  const doc = new jsPDF();

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US");
  };

  const loadLogoAndGeneratePDF = async () => {
    const logoBase64 = await convertImageToBase64("/logo.png");

    // Header
    doc.addImage(logoBase64, "PNG", 10, 5, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("ST. CLARE COLLEGE OF CALOOCAN", 105, 15, null, null, "center");
    doc.setFontSize(16);
    doc.text("OFFICIAL PAYMENT RECEIPT", 105, 25, null, null, "center");

    let y = 40;

    const addField = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(value || "N/A", 55, y);
      y += 8;
    };

    addField("Receipt Number", payment.receipt || "N/A");
    addField("Date", formatDate(payment.createdAt || new Date()));
    addField("Payment ID", payment.paymentId || "N/A");
    addField("Reference Number", payment.referenceNumber || "N/A");
    addField("Description", payment.description || "N/A");
    addField("Amount Paid", `₱${payment.amount?.toFixed(2) || "0.00"}`);
    addField("Payment Status", payment.status || "N/A");

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Student Information", 15, y);
    y += 8;

    addField("Full Name", payment.fullName);
    addField("Student ID", payment.studentId);
    addField("Course", payment.course);
    addField("Education Level", payment.education);
    addField("Year Level", payment.yearLevel);
    addField("School Year", payment.schoolYear);
    addField("Semester", payment.semester);
    addField("Exam Period", payment.examPeriod);

    y += 15;
    doc.setFont("helvetica", "italic");
    doc.text(
      "This is a system-generated receipt. Please keep this for your records.",
      15,
      y
    );

    doc.save(`Receipt_${payment.fullName.replace(/\s+/g, "_")}.pdf`);
  };

  loadLogoAndGeneratePDF();
}
