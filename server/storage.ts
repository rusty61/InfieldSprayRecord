import { type User, type InsertUser, type Paddock, type InsertPaddock } from "@shared/schema";
import { randomUUID } from "crypto";

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
  private paddocks: Map<string, Paddock>;

  constructor() {
    this.users = new Map();
    this.paddocks = new Map();
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
    return Array.from(this.paddocks.values());
  }

  async getPaddock(id: string): Promise<Paddock | undefined> {
    return this.paddocks.get(id);
  }

  async createPaddock(insertPaddock: InsertPaddock): Promise<Paddock> {
    const id = randomUUID();
    const paddock: Paddock = {
      id,
      name: insertPaddock.name,
      farm: insertPaddock.farm,
      area: insertPaddock.area,
      boundaryCoordinates: insertPaddock.boundaryCoordinates as Array<{ latitude: number; longitude: number }>,
      centerLatitude: insertPaddock.centerLatitude,
      centerLongitude: insertPaddock.centerLongitude,
      createdAt: new Date(),
    };
    this.paddocks.set(id, paddock);
    return paddock;
  }

  async updatePaddock(id: string, updates: Partial<InsertPaddock>): Promise<Paddock | undefined> {
    const existing = this.paddocks.get(id);
    if (!existing) return undefined;
    
    const updated: Paddock = {
      ...existing,
      ...updates,
      boundaryCoordinates: (updates.boundaryCoordinates ?? existing.boundaryCoordinates) as Array<{ latitude: number; longitude: number }>,
    };
    this.paddocks.set(id, updated);
    return updated;
  }

  async deletePaddock(id: string): Promise<boolean> {
    return this.paddocks.delete(id);
  }

  async getPaddocksByProximity(latitude: number, longitude: number): Promise<(Paddock & { distance: number })[]> {
    const paddocks = Array.from(this.paddocks.values());
    const paddocksWithDistance = paddocks.map(paddock => ({
      ...paddock,
      distance: calculateDistance(latitude, longitude, paddock.centerLatitude, paddock.centerLongitude),
    }));
    
    // Sort by distance (nearest first)
    return paddocksWithDistance.sort((a, b) => a.distance - b.distance);
  }
}

export const storage = new MemStorage();
