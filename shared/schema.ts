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
  paddockIds: jsonb("paddock_ids").notNull().$type<string[]>(),
  operatorName: text("operator_name").notNull(),
  farmName: text("farm_name").notNull(),
  tankMixName: text("tank_mix_name").notNull(),
  waterRate: real("water_rate").notNull(),
  chemicals: jsonb("chemicals").notNull().$type<Array<{ chemicalName: string; rate: number; unit: string }>>(),
  weatherData: jsonb("weather_data").notNull().$type<{ windSpeed: number; windDirection: number; temperature: number; humidity: number; timestamp: string }>(),
  gpsData: jsonb("gps_data").notNull().$type<{ latitude?: number; longitude?: number; accuracy?: number }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
