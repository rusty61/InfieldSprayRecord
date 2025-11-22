import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPaddockSchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
