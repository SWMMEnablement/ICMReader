import { type User, type InsertUser, type PrnFile, type InsertPrnFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // PRN file operations
  createPrnFile(file: InsertPrnFile): Promise<PrnFile>;
  getPrnFile(id: string): Promise<PrnFile | undefined>;
  listPrnFiles(): Promise<PrnFile[]>;
  deletePrnFile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private prnFiles: Map<string, PrnFile>;

  constructor() {
    this.users = new Map();
    this.prnFiles = new Map();
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

  async createPrnFile(insertFile: InsertPrnFile): Promise<PrnFile> {
    const id = randomUUID();
    const file: PrnFile = { 
      ...insertFile, 
      id,
      processedAt: new Date(),
      parseData: insertFile.parseData || null
    };
    this.prnFiles.set(id, file);
    return file;
  }

  async getPrnFile(id: string): Promise<PrnFile | undefined> {
    return this.prnFiles.get(id);
  }

  async listPrnFiles(): Promise<PrnFile[]> {
    return Array.from(this.prnFiles.values()).sort(
      (a, b) => (b.processedAt?.getTime() || 0) - (a.processedAt?.getTime() || 0)
    );
  }

  async deletePrnFile(id: string): Promise<boolean> {
    return this.prnFiles.delete(id);
  }
}

export const storage = new MemStorage();
