import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertFaultReportSchema, updateFaultReportStatusSchema, updateFaultReportSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: fileStorage,
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed!'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // Get all fault reports
  app.get("/api/fault-reports", async (req, res) => {
    try {
      const reports = await storage.getFaultReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching fault reports:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get a specific fault report
  app.get("/api/fault-reports/:id", async (req, res) => {
    try {
      const report = await storage.getFaultReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Fault report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching fault report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create a new fault report
  app.post("/api/fault-reports", upload.array('attachments', 5), async (req, res) => {
    try {
      // Parse form data
      const reportData = {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        department: req.body.department,
        location: req.body.location,
        reportedBy: req.body.reportedBy,
        status: req.body.status || "pending",
        attachments: []
      };

      // Validate the data
      const validatedData = insertFaultReportSchema.parse(reportData);

      // Add file names if any files were uploaded
      if (req.files && Array.isArray(req.files)) {
        validatedData.attachments = req.files.map(file => file.filename);
      }

      const newReport = await storage.createFaultReport(validatedData);
      res.status(201).json(newReport);
    } catch (error) {
      console.error("Error creating fault report:", error);
      
      // Clean up uploaded files if report creation failed
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        });
      }

      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update fault report status
  app.patch("/api/fault-reports/:id/status", async (req, res) => {
    try {
      const validatedData = updateFaultReportStatusSchema.parse(req.body);
      const updatedReport = await storage.updateFaultReportStatus(req.params.id, validatedData.status);
      
      if (!updatedReport) {
        return res.status(404).json({ error: "Fault report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating fault report status:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update fault report
  app.patch("/api/fault-reports/:id", async (req, res) => {
    try {
      const validatedData = updateFaultReportSchema.parse(req.body);
      const updatedReport = await storage.updateFaultReport(req.params.id, validatedData);
      
      if (!updatedReport) {
        return res.status(404).json({ error: "Fault report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating fault report:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete fault report
  app.delete("/api/fault-reports/:id", async (req, res) => {
    try {
      const report = await storage.getFaultReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Fault report not found" });
      }

      // Delete associated files
      if (report.attachments && report.attachments.length > 0) {
        report.attachments.forEach(filename => {
          const filePath = path.join(uploadDir, filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        });
      }

      const deleted = await storage.deleteFaultReport(req.params.id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Fault report not found" });
      }
    } catch (error) {
      console.error("Error deleting fault report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Issue job card endpoint
  app.post("/api/fault-reports/:id/issue-job-card", async (req, res) => {
    try {
      const report = await storage.getFaultReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Fault report not found" });
      }

      // Update status to approved (job card issued)
      const updatedReport = await storage.updateFaultReportStatus(req.params.id, "approved");
      
      res.json({
        message: "Job card issued to workshop planner",
        report: updatedReport
      });
    } catch (error) {
      console.error("Error issuing job card:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Submit procurement request endpoint
  app.post("/api/fault-reports/:id/procurement-request", async (req, res) => {
    try {
      const { priority } = req.body;
      
      if (!priority || !['24hrs', '72hrs', 'miscellaneous'].includes(priority)) {
        return res.status(400).json({ error: "Invalid priority. Must be '24hrs', '72hrs', or 'miscellaneous'" });
      }

      const report = await storage.getFaultReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Fault report not found" });
      }

      // Update status to assigned (assigned to PM)
      const updatedReport = await storage.updateFaultReportStatus(req.params.id, "assigned");
      
      res.json({
        message: "The task is assigned to PM",
        priority,
        report: updatedReport
      });
    } catch (error) {
      console.error("Error processing procurement request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Download file endpoint
  app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    res.download(filePath);
  });

  const httpServer = createServer(app);
  return httpServer;
}