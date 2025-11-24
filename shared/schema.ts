import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const paddocks = pgTable("paddocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  farm: text("farm").notNull(),
  area: real("area").notNull(),
  boundaryCoordinates: jsonb("boundary_coordinates").notNull().$type<Array<{ latitude: number; longitude: number }>>(),
  centerLatitude: real("center_latitude").notNull(),
  centerLongitude: real("center_longitude").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaddockSchema = createInsertSchema(paddocks).omit({
  id: true,
  createdAt: true,
});

export type InsertPaddock = z.infer<typeof insertPaddockSchema>;
export type Paddock = typeof paddocks.$inferSelect;

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paddockId: text("paddock_id").notNull(),
  operator: text("operator").notNull(),
  farm: text("farm").notNull(),
  applicationDate: timestamp("application_date").notNull(),
  waterRate: real("water_rate").notNull(),
  area: real("area").notNull(),
  chemicals: jsonb("chemicals").notNull().$type<Array<{ name: string; rate: number; unit: string }>>(),
  windSpeed: real("wind_speed"),
  windDirection: real("wind_direction"),
  temperature: real("temperature"),
  humidity: real("humidity"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: text("application_id").notNull(),
  agronomer: text("agronomer").notNull(),
  recommendation: text("recommendation").notNull(),
  priority: varchar("priority", { enum: ["low", "medium", "high"] }).notNull().default("medium"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
