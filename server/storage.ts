import { users, notes, type User, type InsertUser, type Note, type InsertNote } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getNotesByUserId(userId: number): Promise<Note[]>;
  createNote(note: InsertNote & { userId: number }): Promise<Note>;
  updateNote(id: number, userId: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number, userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getNotesByUserId(userId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.userId, userId));
  }

  async createNote(note: InsertNote & { userId: number }): Promise<Note> {
    const [newNote] = await db
      .insert(notes)
      .values(note)
      .returning();
    return newNote;
  }

  async updateNote(id: number, userId: number, noteUpdate: Partial<InsertNote>): Promise<Note | undefined> {
    const [updatedNote] = await db
      .update(notes)
      .set(noteUpdate)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();
    return updatedNote || undefined;
  }

  async deleteNote(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
