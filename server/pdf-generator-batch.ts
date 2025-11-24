import PDFDocument from "pdfkit";
import { type Application } from "@shared/schema";

export function generateBatchAuditPDF(applications: Application[]): Buffer {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const buffers: Buffer[] = [];
  doc.on("data", buffers.push.bind(buffers));

  // Header
  doc.fontSize(24).font("Helvetica-Bold").text("Spray Application Batch Report", {
    align: "center",
  });
  doc.fontSize(10).fillColor("#666").text(
    `Generated: ${new Date().toLocaleDateString("en-AU")} ${new Date().toLocaleTimeString("en-AU")}`,
    { align: "center" }
  );
  doc.fontSize(10).fillColor("#666").text(`Total Records: ${applications.length}`, {
    align: "center",
  });

  doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).stroke();

  // Summary Table
  doc.fontSize(12).font("Helvetica-Bold").text("Summary", { marginTop: 15 });
  doc.fontSize(10).font("Helvetica").fillColor("#333");

  const summary = {
    "Total Area Treated": `${applications.reduce((sum, app) => sum + app.area, 0).toFixed(1)} hectares`,
    "Average Water Rate": `${(applications.reduce((sum, app) => sum + app.waterRate, 0) / applications.length).toFixed(1)} L/ha`,
    "Unique Operators": `${new Set(applications.map(app => app.operator)).size}`,
    "Unique Farms": `${new Set(applications.map(app => app.farm)).size}`,
  };

  Object.entries(summary).forEach(([label, value]) => {
    doc.font("Helvetica-Bold").text(label, { width: 200, continued: true });
    doc.font("Helvetica").text(value);
  });

  // Detailed Records
  doc.addPage();
  doc.fontSize(14).font("Helvetica-Bold").fillColor("#000").text("Detailed Records", {
    underline: true,
  });
  doc.fontSize(10).font("Helvetica").fillColor("#333");

  applications.forEach((app, index) => {
    if (index > 0) doc.text("");
    doc.font("Helvetica-Bold").text(`${index + 1}. ${app.farm} - ${app.paddock}`);
    doc.font("Helvetica").fillColor("#666");
    doc.text(`Date: ${new Date(app.applicationDate).toLocaleDateString("en-AU")}`);
    doc.text(`Operator: ${app.operator}`);
    doc.text(`Area: ${app.area} hectares`);
    doc.text(`Water Rate: ${app.waterRate} L/ha`);
    
    if (app.chemicals && app.chemicals.length > 0) {
      doc.text("Chemicals: " + (Array.isArray(app.chemicals) && typeof app.chemicals[0] === 'string' 
        ? app.chemicals.join(", ")
        : (app.chemicals as any).map((c: any) => `${c.name} ${c.rate}${c.unit}`).join(", ")));
    }
    
    if (app.latitude && app.longitude) {
      doc.text(`GPS: ${app.latitude.toFixed(6)}, ${app.longitude.toFixed(6)}`);
    }
    doc.fillColor("#333");
  });

  // Footer
  doc.moveTo(50, doc.page.height - 100).lineTo(550, doc.page.height - 100).stroke();
  doc.fontSize(9)
    .fillColor("#666")
    .text("This report is generated for audit compliance purposes.", {
      align: "center",
      marginTop: 15,
    });

  doc.end();

  return Buffer.concat(buffers);
}
