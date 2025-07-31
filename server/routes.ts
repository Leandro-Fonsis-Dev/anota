import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertNoteSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    next();
  };

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Set session
      req.session.userId = user.id;

      res.json({ 
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      // Set session
      req.session.userId = user.id;

      res.json({ 
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get notes
  app.get("/api/notes", requireAuth, async (req, res) => {
    try {
      const notes = await storage.getNotesByUserId(req.session.userId!);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar anotações" });
    }
  });

  // Create note
  app.post("/api/notes", requireAuth, async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote({
        ...validatedData,
        userId: req.session.userId!
      });
      res.json(note);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Erro ao criar anotação" });
    }
  });

  // Update note
  app.put("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const validatedData = insertNoteSchema.partial().parse(req.body);
      
      const updatedNote = await storage.updateNote(noteId, req.session.userId!, validatedData);
      if (!updatedNote) {
        return res.status(404).json({ message: "Anotação não encontrada" });
      }
      
      res.json(updatedNote);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Erro ao atualizar anotação" });
    }
  });

  // Delete note
  app.delete("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const deleted = await storage.deleteNote(noteId, req.session.userId!);
      
      if (!deleted) {
        return res.status(404).json({ message: "Anotação não encontrada" });
      }
      
      res.json({ message: "Anotação excluída com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir anotação" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
