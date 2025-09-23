import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const faultReportStatusEnum = z.enum([
  "pending",
  "approved", 
  "assigned",
  "rejected"
]);

export type FaultReportStatus = z.infer<typeof faultReportStatusEnum>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const faultReports = pgTable("fault_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).notNull(),
  department: text("department"),
  location: text("location"),
  reportedBy: text("reported_by"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  attachments: text("attachments").array().default([]),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertFaultReportSchema = createInsertSchema(faultReports).omit({
  id: true,
  status: true,
  attachments: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFaultReport = z.infer<typeof insertFaultReportSchema>;
export type FaultReport = typeof faultReports.$inferSelect;

export const updateFaultReportStatusSchema = z.object({
  status: faultReportStatusEnum
});

export const updateFaultReportSchema = insertFaultReportSchema.partial();

export type UpdateFaultReportStatus = z.infer<typeof updateFaultReportStatusSchema>;
export type UpdateFaultReport = z.infer<typeof updateFaultReportSchema>;
