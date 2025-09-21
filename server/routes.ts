
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertClientSchema, insertApprovalSchema, insertTaskSchema, insertInventorySchema, insertStockRequestSchema, insertInvoiceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("🔐 Login attempt from origin:", req.headers.origin);
      console.log("🔐 Login attempt with body:", req.body);
      console.log("🔐 Request headers:", {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
        'origin': req.headers['origin']
      });
      
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        console.log("❌ Invalid credentials for email:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd use proper session management
      const { password: _, ...userWithoutPassword } = user;
      console.log("✅ Login successful for user:", email);
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const userId = req.headers['user-id'] as string;
      const userRole = req.headers['user-role'] as string;
      
      if (!userId || !userRole) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const metrics = await storage.getDashboardMetrics(userId, userRole);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const userRole = req.headers['user-role'] as string;
      const userId = req.headers['user-id'] as string;
      
      const agentId = userRole === 'agent' ? userId : undefined;
      const clients = await storage.getClients(agentId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const updates = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, updates);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  // Approval routes
  app.get("/api/approvals", async (req, res) => {
    try {
      const clientId = req.query.clientId as string;
      const approvals = await storage.getApprovals(clientId);
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch approvals" });
    }
  });

  app.post("/api/approvals", async (req, res) => {
    try {
      const approvalData = insertApprovalSchema.parse(req.body);
      const approval = await storage.createApproval(approvalData);
      res.status(201).json(approval);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid approval data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create approval" });
    }
  });

  app.put("/api/approvals/:id", async (req, res) => {
    try {
      const updates = insertApprovalSchema.partial().parse(req.body);
      const approval = await storage.updateApproval(req.params.id, updates);
      
      if (!approval) {
        return res.status(404).json({ message: "Approval not found" });
      }
      
      res.json(approval);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid approval data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update approval" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const userRole = req.headers['user-role'] as string;
      const userId = req.headers['user-id'] as string;
      const clientId = req.query.clientId as string;
      
      const agentId = userRole === 'agent' ? userId : undefined;
      const tasks = await storage.getTasks(agentId, clientId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const updates = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, updates);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const itemData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const updates = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(req.params.id, updates);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  // Stock request routes
  app.get("/api/stock-requests", async (req, res) => {
    try {
      const userRole = req.headers['user-role'] as string;
      const userId = req.headers['user-id'] as string;
      
      const agentId = userRole === 'agent' ? userId : undefined;
      const requests = await storage.getStockRequests(agentId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock requests" });
    }
  });

  app.post("/api/stock-requests", async (req, res) => {
    try {
      const requestData = insertStockRequestSchema.parse(req.body);
      const request = await storage.createStockRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stock request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create stock request" });
    }
  });

  app.put("/api/stock-requests/:id", async (req, res) => {
    try {
      const updates = insertStockRequestSchema.partial().parse(req.body);
      const request = await storage.updateStockRequest(req.params.id, updates);
      
      if (!request) {
        return res.status(404).json({ message: "Stock request not found" });
      }
      
      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stock request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update stock request" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const clientId = req.query.clientId as string;
      const invoices = await storage.getInvoices(clientId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Users route (for agent selection)
  app.get("/api/users", async (req, res) => {
    try {
      const userRole = req.headers['user-role'] as string;
      
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Return all agents for admin to assign to clients
      const users = [
        await storage.getUserByEmail("priya@solarflow.com"),
        await storage.getUserByEmail("rohit@solarflow.com"),
      ].filter(Boolean);
      
      res.json(users.map(user => ({
        id: user!.id,
        name: user!.name,
        email: user!.email,
        role: user!.role,
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
