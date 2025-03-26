import { jsPDF } from "jspdf";

export function generateEventPDF(event) {
  const doc = new jsPDF();

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ST. CLARE COLLEGE OF CALOOCAN", 105, 20, null, null, "center");
  doc.setFontSize(16);
  doc.text("Zabarte Rd., Camarin Caloocan City", 105, 30, null, null, "center");
  doc.setFontSize(18);
  doc.text("EVENT REGISTRATION", 105, 40, null, null, "center");

  let y = 50;
  const lineSpacing = 10;

  const addDetail = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "N/A", 80, y);
    y += lineSpacing;
  };

  // Event Details
  addDetail("Event Title:", event.title);
  addDetail("Date:", new Date(event.date).toLocaleDateString());
  addDetail("Location:", event.location);
  addDetail("Type:", event.eventType);
  addDetail("Organizer:", event.organizer?.name || "N/A");

  // Attendee List Header
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Registered Students", 20, y);
  y += lineSpacing;
  doc.text("Name", 20, y);
  doc.text("Email", 80, y);
  y += lineSpacing;

  // List of registered students
  const attendees = event.attendees || [];
  attendees.forEach((student) => {
    doc.setFont("helvetica", "normal");
    doc.text(student.name || "N/A", 20, y);
    doc.text(student.email || "N/A", 80, y);
    y += lineSpacing;
  });

  // Footer
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.text("End of Report", 105, y, null, null, "center");

  return new Blob([doc.output("blob")], { type: "application/pdf" });
}
