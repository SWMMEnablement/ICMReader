import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const prnFiles = pgTable("prn_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalSize: integer("original_size").notNull(),
  processedAt: timestamp("processed_at").defaultNow(),
  fileContent: text("file_content").notNull(),
  parseData: jsonb("parse_data"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPrnFileSchema = createInsertSchema(prnFiles).omit({
  id: true,
  processedAt: true,
});

export const conversionSettingsSchema = z.object({
  flowUnits: z.enum(["si-to-us", "us-to-si", "no-conversion"]).default("si-to-us"),
  lengthUnits: z.enum(["m-to-ft", "ft-to-m", "no-conversion"]).default("m-to-ft"),
  precision: z.number().min(0).max(6).default(2),
});

export const nodeDataSchema = z.object({
  nodeId: z.string(),
  maxDepth: z.number(),
  maxWaterLevel: z.number(),
  flooding: z.number(),
  status: z.enum(["normal", "flooding", "critical"]),
});

export const linkDataSchema = z.object({
  linkId: z.string(),
  maxFlow: z.number(),
  maxVelocity: z.number(),
  capacity: z.number(),
  status: z.enum(["normal", "near-capacity", "critical"]),
});

export const massBalanceSchema = z.object({
  totalRainfall: z.number(),
  dryWeatherFlow: z.number(),
  externalInflow: z.number(),
  totalInflow: z.number(),
  systemOutflow: z.number(),
  flooding: z.number(),
  losses: z.number(),
  totalOutflow: z.number(),
  continuityError: z.number(),
  volumeError: z.number(),
  status: z.enum(["acceptable", "warning", "error"]),
});

export const prnDataSchema = z.object({
  fileInfo: z.object({
    filename: z.string(),
    fileSize: z.string(),
    formatVersion: z.string(),
    simulationDate: z.string(),
  }),
  summary: z.object({
    nodeCount: z.number(),
    linkCount: z.number(),
    simulationDuration: z.string(),
    timeStep: z.string(),
  }),
  nodeData: z.array(nodeDataSchema),
  linkData: z.array(linkDataSchema),
  massBalance: massBalanceSchema,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPrnFile = z.infer<typeof insertPrnFileSchema>;
export type PrnFile = typeof prnFiles.$inferSelect;
export type ConversionSettings = z.infer<typeof conversionSettingsSchema>;
export type NodeData = z.infer<typeof nodeDataSchema>;
export type LinkData = z.infer<typeof linkDataSchema>;
export type MassBalance = z.infer<typeof massBalanceSchema>;
export type PrnData = z.infer<typeof prnDataSchema>;
