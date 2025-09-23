import { type User, type InsertUser, type FaultReport, type InsertFaultReport, type UpdateFaultReport, type FaultReportStatus } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Fault Reports
  getFaultReports(): Promise<FaultReport[]>;
  getFaultReport(id: string): Promise<FaultReport | undefined>;
  createFaultReport(report: InsertFaultReport): Promise<FaultReport>;
  updateFaultReport(id: string, data: UpdateFaultReport): Promise<FaultReport | undefined>;
  updateFaultReportStatus(id: string, status: FaultReportStatus): Promise<FaultReport | undefined>;
  deleteFaultReport(id: string): Promise<boolean>;
  addAttachmentToReport(reportId: string, filename: string): Promise<FaultReport | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private faultReports: Map<string, FaultReport>;

  constructor() {
    this.users = new Map();
    this.faultReports = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getFaultReports(): Promise<FaultReport[]> {
    return Array.from(this.faultReports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getFaultReport(id: string): Promise<FaultReport | undefined> {
    return this.faultReports.get(id);
  }

  async createFaultReport(insertReport: any): Promise<FaultReport> {
    const id = randomUUID();
    const now = new Date();
    const report: FaultReport = {
      id,
      title: insertReport.title,
      description: insertReport.description,
      priority: insertReport.priority,
      department: insertReport.department || null,
      location: insertReport.location || null,
      reportedBy: insertReport.reportedBy || null,
      status: insertReport.status || "pending",
      attachments: insertReport.attachments || [],
      createdAt: now,
      updatedAt: now
    };
    this.faultReports.set(id, report);
    return report;
  }

  async updateFaultReport(id: string, data: UpdateFaultReport): Promise<FaultReport | undefined> {
    const report = this.faultReports.get(id);
    if (!report) return undefined;
    
    const updatedReport: FaultReport = {
      ...report,
      ...data,
      updatedAt: new Date()
    };
    this.faultReports.set(id, updatedReport);
    return updatedReport;
  }

  async updateFaultReportStatus(id: string, status: FaultReportStatus): Promise<FaultReport | undefined> {
    const report = this.faultReports.get(id);
    if (!report) return undefined;
    
    const updatedReport: FaultReport = {
      ...report,
      status,
      updatedAt: new Date()
    };
    this.faultReports.set(id, updatedReport);
    return updatedReport;
  }

  async deleteFaultReport(id: string): Promise<boolean> {
    return this.faultReports.delete(id);
  }

  async addAttachmentToReport(reportId: string, filename: string): Promise<FaultReport | undefined> {
    const report = this.faultReports.get(reportId);
    if (!report) return undefined;
    
    const updatedReport: FaultReport = {
      ...report,
      attachments: [...(report.attachments || []), filename],
      updatedAt: new Date()
    };
    this.faultReports.set(reportId, updatedReport);
    return updatedReport;
  }
}

export const storage = new MemStorage();
