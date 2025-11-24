import PDFDocument from "pdfkit";
import { type Application, type Paddock } from "@shared/schema";

export function generateAuditPDF(
  application: Application,
  paddock: Paddock | null
): Buffer {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const buffers: Buffer[] = [];
  doc.on("data", buffers.push.bind(buffers));

  // Header
  doc.fontSize(24).font("Helvetica-Bold").text("Spray Application Audit Report", {
    align: "center",
  });
  doc.fontSize(10).fillColor("#666").text(`Report ID: ${application.id}`, {
    align: "center",
  });
  doc.fontSize(10).fillColor("#666").text(
    `Generated: ${new Date().toLocaleDateString("en-AU")} ${new Date().toLocaleTimeString("en-AU")}`,
    { align: "center" }
  );

  doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).stroke();

  // Application Details Section
  doc.fontSize(14).fillColor("#000").font("Helvetica-Bold").text("Application Details", {
    underline: true,
  });
  doc.fontSize(11).font("Helvetica").fillColor("#333");

  const details = [
    { label: "Farm Name:", value: application.farm },
    { label: "Operator:", value: application.operator },
    { label: "Application Date:", value: new Date(application.applicationDate).toLocaleString("en-AU") },
    { label: "Paddock:", value: paddock?.name || "N/A" },
    { label: "Area Treated:", value: `${application.area} hectares` },
  ];

  details.forEach(({ label, value }) => {
    doc.font("Helvetica-Bold").text(label, { width: 150, continued: true });
    doc.font("Helvetica").text(value);
  });

  // Tank Mix Section
  doc.fontSize(14).fillColor("#000").font("Helvetica-Bold").text("Tank Mix Details", {
    underline: true,
    marginTop: 15,
  });

  if (application.chemicals && application.chemicals.length > 0) {
    doc.fontSize(11).font("Helvetica");
    application.chemicals.forEach((chemical: any) => {
      const chemicalText = `• ${chemical.name} - ${chemical.rate} ${chemical.unit}`;
      doc.text(chemicalText);
    });
  } else {
    doc.fontSize(11).font("Helvetica").fillColor("#999").text("No chemicals recorded");
  }

  doc.fontSize(11).font("Helvetica").fillColor("#333");
  doc.text(`Water Rate: ${application.waterRate} L/ha`, { marginTop: 10 });

  // Weather Conditions Section
  if (
    application.windSpeed !== null ||
    application.temperature !== null ||
    application.humidity !== null
  ) {
    doc.fontSize(14).fillColor("#000").font("Helvetica-Bold").text("Weather Conditions", {
      underline: true,
      marginTop: 15,
    });

    doc.fontSize(11).font("Helvetica").fillColor("#333");
    if (application.windSpeed !== null) {
      const windDir = application.windDirection
        ? ` (${getWindDirection(application.windDirection)})`
        : "";
      doc.text(`Wind Speed: ${application.windSpeed} km/h${windDir}`);
    }
    if (application.temperature !== null) {
      doc.text(`Temperature: ${application.temperature}°C`);
    }
    if (application.humidity !== null) {
      doc.text(`Humidity: ${application.humidity}%`);
    }
  }

  // GPS Location Section
  if (application.latitude !== null || application.longitude !== null) {
    doc.fontSize(14).fillColor("#000").font("Helvetica-Bold").text("GPS Location", {
      underline: true,
      marginTop: 15,
    });

    doc.fontSize(11).font("Helvetica").fillColor("#333");
    if (application.latitude !== null) {
      doc.text(`Latitude: ${application.latitude.toFixed(6)}`);
    }
    if (application.longitude !== null) {
      doc.text(`Longitude: ${application.longitude.toFixed(6)}`);
    }
  }

  // Footer with compliance note
  doc.moveTo(50, doc.page.height - 100).lineTo(550, doc.page.height - 100).stroke();
  doc.fontSize(9)
    .fillColor("#666")
    .text("This report is generated for audit compliance purposes.", {
      align: "center",
      marginTop: 15,
    });
  doc.fontSize(9)
    .fillColor("#666")
    .text("All data is retained in compliance with agricultural regulations.", {
      align: "center",
    });

  doc.end();

  return Buffer.concat(buffers);
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}
