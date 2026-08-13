import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp_ms" }).notNull(),
});
export const scans = sqliteTable("scans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  targetUrl: text("targetUrl").notNull(),
  status: text("status", { enum: ["completed", "failed"] }).notNull().default("completed"),
  mode: text("mode", { enum: ["quick", "baseline"] }).notNull().default("baseline"),
  criticalCount: integer("criticalCount").notNull().default(0),
  highCount: integer("highCount").notNull().default(0),
  mediumCount: integer("mediumCount").notNull().default(0),
  lowCount: integer("lowCount").notNull().default(0),
  infoCount: integer("infoCount").notNull().default(0),
  summary: text("summary"),
  durationMs: integer("durationMs").notNull().default(0),
  riskScore: integer("riskScore").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
});
export const findings = sqliteTable("findings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scanId: integer("scanId").notNull(),
  category: text("category").notNull(),
  severity: text("severity", { enum: ["Critical", "High", "Medium", "Low", "Info"] }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  remediation: text("remediation").notNull(),
  evidence: text("evidence"),
  owasp: text("owasp"),
  location: text("location"),
  endpoint: text("endpoint"),
  parameter: text("parameter"),
  method: text("method"),
  priority: text("priority", { enum: ["P0", "P1", "P2", "P3"] }),
  verification: text("verification"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Scan = typeof scans.$inferSelect;
export type Finding = typeof findings.$inferSelect;
