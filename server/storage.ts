import { type User, type InsertUser, type Paddock, type InsertPaddock, users, paddocks } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Paddock methods
  getAllPaddocks(): Promise<Paddock[]>;
  getPaddock(id: string): Promise<Paddock | undefined>;
  createPaddock(paddock: InsertPaddock): Promise<Paddock>;
  updatePaddock(id: string, paddock: Partial<InsertPaddock>): Promise<Paddock | undefined>;
  deletePaddock(id: string): Promise<boolean>;
  getPaddocksByProximity(latitude: number, longitude: number): Promise<(Paddock & { distance: number })[]>;
}

// Validate and sanitize boundary coordinates
function validateBoundaryCoordinates(coords: unknown): Array<{ latitude: number; longitude: number }> {
  if (!Array.isArray(coords)) {
    throw new Error("Boundary coordinates must be an array");
  }
  
  if (coords.length < 3) {
    throw new Error("Paddock boundary requires at least 3 GPS points");
  }
  
  return coords.map((coord, index) => {
    if (!coord || typeof coord !== 'object') {
      throw new Error(`Boundary point ${index + 1} is invalid`);
    }
    
    const { latitude, longitude } = coord as any;
    const lat = Number(latitude);
    const lng = Number(longitude);
    
    if (!isFinite(lat) || lat < -90 || lat > 90) {
      throw new Error(`Invalid latitude at boundary point ${index + 1}: ${latitude}`);
    }
    
    if (!isFinite(lng) || lng < -180 || lng > 180) {
      throw new Error(`Invalid longitude at boundary point ${index + 1}: ${longitude}`);
    }
    
    return { latitude: lat, longitude: lng };
  });
}

// Helper function to calculate distance between two GPS coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
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

  async getAllPaddocks(): Promise<Paddock[]> {
    return await db.select().from(paddocks);
  }

  async getPaddock(id: string): Promise<Paddock | undefined> {
    const result = await db.select().from(paddocks).where(eq(paddocks.id, id));
    return result[0];
  }

  async createPaddock(insertPaddock: InsertPaddock): Promise<Paddock> {
    // Validate boundary coordinates (minimum 3 points, valid lat/lng)
    const boundaryCoords = validateBoundaryCoordinates(insertPaddock.boundaryCoordinates);
    
    // Validate center coordinates
    if (!isFinite(insertPaddock.centerLatitude) || 
        insertPaddock.centerLatitude < -90 || 
        insertPaddock.centerLatitude > 90) {
      throw new Error("Invalid center latitude");
    }
    if (!isFinite(insertPaddock.centerLongitude) || 
        insertPaddock.centerLongitude < -180 || 
        insertPaddock.centerLongitude > 180) {
      throw new Error("Invalid center longitude");
    }
    
    const result = await db.insert(paddocks).values({
      name: insertPaddock.name,
      farm: insertPaddock.farm,
      area: insertPaddock.area,
      boundaryCoordinates: boundaryCoords as any, // JSONB requires any
      centerLatitude: insertPaddock.centerLatitude,
      centerLongitude: insertPaddock.centerLongitude,
    }).returning();
    return result[0];
  }

  async updatePaddock(id: string, updates: Partial<InsertPaddock>): Promise<Paddock | undefined> {
    // Prevent empty updates
    if (Object.keys(updates).length === 0) {
      return undefined;
    }
    
    // Build update data with proper validation
    const updateData: Record<string, any> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.farm !== undefined) updateData.farm = updates.farm;
    if (updates.area !== undefined) updateData.area = updates.area;
    
    // Validate center coordinates if provided
    if (updates.centerLatitude !== undefined) {
      if (!isFinite(updates.centerLatitude) || 
          updates.centerLatitude < -90 || 
          updates.centerLatitude > 90) {
        throw new Error("Invalid center latitude");
      }
      updateData.centerLatitude = updates.centerLatitude;
    }
    if (updates.centerLongitude !== undefined) {
      if (!isFinite(updates.centerLongitude) || 
          updates.centerLongitude < -180 || 
          updates.centerLongitude > 180) {
        throw new Error("Invalid center longitude");
      }
      updateData.centerLongitude = updates.centerLongitude;
    }
    
    // Validate boundary coordinates if provided (minimum 3 points, valid lat/lng)
    if (updates.boundaryCoordinates !== undefined) {
      const boundaryCoords = validateBoundaryCoordinates(updates.boundaryCoordinates);
      updateData.boundaryCoordinates = boundaryCoords as any; // JSONB requires any
    }
    
    const result = await db
      .update(paddocks)
      .set(updateData)
      .where(eq(paddocks.id, id))
      .returning();
    return result[0];
  }

  async deletePaddock(id: string): Promise<boolean> {
    const result = await db.delete(paddocks).where(eq(paddocks.id, id)).returning();
    return result.length > 0;
  }

  async getPaddocksByProximity(latitude: number, longitude: number): Promise<(Paddock & { distance: number })[]> {
    const allPaddocks = await db.select().from(paddocks);
    const paddocksWithDistance = allPaddocks.map(paddock => ({
      ...paddock,
      distance: calculateDistance(latitude, longitude, paddock.centerLatitude, paddock.centerLongitude),
    }));
    
    // Sort by distance (nearest first)
    return paddocksWithDistance.sort((a, b) => a.distance - b.distance);
  }
}

export const storage = new MemStorage();
