import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPaddockSchema, insertApplicationSchema } from "@shared/schema";
import sgMail from "@sendgrid/mail";
import { generateAuditPDF } from "./pdf-generator";
import { generateBatchAuditPDF } from "./pdf-generator-batch";

const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Paddock routes
  app.get("/api/paddocks", async (req, res) => {
    try {
      const { lat, lng } = req.query;
      
      if (lat && lng) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const paddocks = await storage.getPaddocksByProximity(latitude, longitude);
        return res.json(paddocks);
      }
      
      const paddocks = await storage.getAllPaddocks();
      res.json(paddocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch paddocks" });
    }
  });

  app.get("/api/paddocks/:id", async (req, res) => {
    try {
      const paddock = await storage.getPaddock(req.params.id);
      if (!paddock) {
        return res.status(404).json({ error: "Paddock not found" });
      }
      res.json(paddock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch paddock" });
    }
  });

  app.post("/api/paddocks", async (req, res) => {
    try {
      const validatedData = insertPaddockSchema.parse(req.body);
      const paddock = await storage.createPaddock(validatedData);
      res.status(201).json(paddock);
    } catch (error) {
      res.status(400).json({ error: "Invalid paddock data" });
    }
  });

  app.patch("/api/paddocks/:id", async (req, res) => {
    try {
      // Reject empty payloads
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Update data cannot be empty" });
      }
      
      // Validate partial update data
      const validatedData = insertPaddockSchema.partial().parse(req.body);
      const paddock = await storage.updatePaddock(req.params.id, validatedData);
      if (!paddock) {
        return res.status(404).json({ error: "Paddock not found or update failed" });
      }
      res.json(paddock);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/paddocks/:id", async (req, res) => {
    try {
      const success = await storage.deletePaddock(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Paddock not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete paddock" });
    }
  });

  // Application routes
  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Application validation error:", error);
      console.error("Request body:", req.body);
      const errorMessage = error instanceof Error ? error.message : "Invalid application data";
      res.status(400).json({ error: errorMessage });
    }
  });

  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.get("/api/applications/:id", async (req, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  // Email audit report endpoint
  app.post("/api/applications/:id/send-email", async (req, res) => {
    try {
      if (!sendgridApiKey) {
        return res.status(400).json({ error: "Email service not configured" });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email address required" });
      }

      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const paddock = await storage.getPaddock(application.paddockId);
      const pdfBuffer = generateAuditPDF(application, paddock || null);

      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@infield-spray.com",
        subject: `Spray Application Audit Report - ${application.farm}`,
        html: `
          <h2>Spray Application Audit Report</h2>
          <p>Dear ${application.operator},</p>
          <p>Please find attached the audit report for your spray application on <strong>${application.farm}</strong>.</p>
          <p><strong>Application Details:</strong></p>
          <ul>
            <li>Date: ${new Date(application.applicationDate).toLocaleDateString("en-AU")}</li>
            <li>Area: ${application.area} hectares</li>
            <li>Water Rate: ${application.waterRate} L/ha</li>
          </ul>
          <p>This report is retained for audit compliance purposes.</p>
          <p>Best regards,<br>Infield Spray Record System</p>
        `,
        attachments: [
          {
            content: pdfBuffer.toString("base64"),
            filename: `spray-audit-${application.id}.pdf`,
            type: "application/pdf",
            disposition: "attachment",
          },
        ],
      });

      res.json({ success: true, message: "Audit report sent successfully" });
    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).json({ error: "Failed to send audit report" });
    }
  });

  // Export batch applications as PDF via email
  app.post("/api/applications/export/send-email", async (req, res) => {
    try {
      if (!sendgridApiKey) {
        return res.status(400).json({ error: "Email service not configured" });
      }

      const { email, applications: appsData } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email address required" });
      }

      if (!appsData || appsData.length === 0) {
        return res.status(400).json({ error: "No applications to export" });
      }

      const pdfBuffer = generateBatchAuditPDF(appsData);

      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@infield-spray.com",
        subject: `Spray Application Batch Export - ${appsData.length} records`,
        html: `
          <h2>Spray Application Batch Export</h2>
          <p>Please find attached your spray application records export.</p>
          <p><strong>Export Summary:</strong></p>
          <ul>
            <li>Total Records: ${appsData.length}</li>
            <li>Total Area: ${appsData.reduce((sum: number, app: any) => sum + app.area, 0).toFixed(1)} hectares</li>
            <li>Generated: ${new Date().toLocaleDateString("en-AU")}</li>
          </ul>
          <p>This export is retained for audit compliance purposes.</p>
          <p>Best regards,<br>Infield Spray Record System</p>
        `,
        attachments: [
          {
            content: pdfBuffer.toString("base64"),
            filename: `spray-records-${new Date().toISOString().split("T")[0]}.pdf`,
            type: "application/pdf",
            disposition: "attachment",
          },
        ],
      });

      res.json({ success: true, message: "Records exported successfully" });
    } catch (error) {
      console.error("Export email error:", error);
      res.status(500).json({ error: "Failed to export records" });
    }
  });

  // Get recommendations for an application
  app.get("/api/applications/:id/recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getRecommendationsByApplicationId(req.params.id);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Create a recommendation
  app.post("/api/applications/:id/recommendations", async (req, res) => {
    try {
      const { agronomer, recommendation, priority } = req.body;
      if (!agronomer || !recommendation) {
        return res.status(400).json({ error: "Agronomer and recommendation text required" });
      }

      const rec = await storage.createRecommendation({
        applicationId: req.params.id,
        agronomer,
        recommendation,
        priority: priority || "medium",
      });
      res.status(201).json(rec);
    } catch (error) {
      res.status(500).json({ error: "Failed to create recommendation" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
