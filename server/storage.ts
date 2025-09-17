import { 
  type User, 
  type InsertUser, 
  type Client,
  type InsertClient,
  type ClientWithAgent,
  type Approval,
  type InsertApproval,
  type Task,
  type InsertTask,
  type TaskWithClient,
  type Inventory,
  type InsertInventory,
  type StockRequest,
  type InsertStockRequest,
  type StockRequestWithDetails,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type InvoiceWithItems,
  type DashboardMetrics,
  users,
  clients,
  approvals,
  tasks,
  inventory,
  stockRequests,
  invoices,
  invoiceItems
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Client management
  getClients(agentId?: string): Promise<ClientWithAgent[]>;
  getClient(id: string): Promise<ClientWithAgent | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined>;

  // Approvals
  getApprovals(clientId?: string): Promise<Approval[]>;
  getApproval(id: string): Promise<Approval | undefined>;
  createApproval(approval: InsertApproval): Promise<Approval>;
  updateApproval(id: string, updates: Partial<InsertApproval>): Promise<Approval | undefined>;

  // Tasks
  getTasks(agentId?: string, clientId?: string): Promise<TaskWithClient[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;

  // Inventory
  getInventory(): Promise<Inventory[]>;
  getInventoryItem(id: string): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined>;

  // Stock requests
  getStockRequests(agentId?: string): Promise<StockRequestWithDetails[]>;
  getStockRequest(id: string): Promise<StockRequest | undefined>;
  createStockRequest(request: InsertStockRequest): Promise<StockRequest>;
  updateStockRequest(id: string, updates: Partial<InsertStockRequest>): Promise<StockRequest | undefined>;

  // Invoices
  getInvoices(clientId?: string): Promise<InvoiceWithItems[]>;
  getInvoice(id: string): Promise<InvoiceWithItems | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;

  // Dashboard
  getDashboardMetrics(userId: string, userRole: string): Promise<DashboardMetrics>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if admin user exists
      const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@solarflow.com")).limit(1);
      
      if (existingAdmin.length === 0) {
        // Create admin user
        await db.insert(users).values({
          name: "John Smith",
          email: "admin@solarflow.com",
          password: "password123",
          role: "admin",
        });

        // Create sample agents
        await db.insert(users).values([
          {
            name: "Priya Singh",
            email: "priya@solarflow.com",
            password: "password123",
            role: "agent",
          },
          {
            name: "Rohit Sharma",
            email: "rohit@solarflow.com",
            password: "password123",
            role: "agent",
          },
        ]);

        // Initialize sample inventory
        await db.insert(inventory).values([
          {
            itemName: "Solar Panel (320W)",
            description: "High efficiency monocrystalline solar panel",
            quantity: 25,
            threshold: 50,
            unitPrice: "15000.00",
          },
          {
            itemName: "Inverter (5KW)",
            description: "Grid-tie solar inverter",
            quantity: 8,
            threshold: 15,
            unitPrice: "45000.00",
          },
          {
            itemName: "Lithium Battery (100Ah)",
            description: "Deep cycle lithium ion battery",
            quantity: 12,
            threshold: 20,
            unitPrice: "25000.00",
          },
        ]);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getClients(agentId?: string): Promise<ClientWithAgent[]> {
    const baseClients = agentId 
      ? await db.select().from(clients).where(eq(clients.assignedAgentId, agentId))
      : await db.select().from(clients);

    const results = await Promise.all(
      baseClients.map(async (client) => {
        // Get assigned agent if exists
        let assignedAgent = undefined;
        if (client.assignedAgentId) {
          const agentResult = await db.select().from(users).where(eq(users.id, client.assignedAgentId)).limit(1);
          if (agentResult.length > 0) {
            assignedAgent = agentResult[0];
          }
        }
        
        return {
          ...client,
          assignedAgent,
        };
      })
    );
    
    // Get approvals and tasks for each client
    const clientsWithDetails = await Promise.all(results.map(async (client) => {
      const clientApprovals = await db.select().from(approvals).where(eq(approvals.clientId, client.id));
      const clientTasks = await db.select().from(tasks).where(eq(tasks.clientId, client.id));
      
      return {
        ...client,
        approvals: clientApprovals,
        tasks: clientTasks,
      };
    }));
    
    return clientsWithDetails;
  }

  async getClient(id: string): Promise<ClientWithAgent | undefined> {
    const clientResult = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    
    if (clientResult.length === 0) return undefined;
    
    const client = clientResult[0];
    
    // Get assigned agent if exists
    let assignedAgent = undefined;
    if (client.assignedAgentId) {
      const agentResult = await db.select().from(users).where(eq(users.id, client.assignedAgentId)).limit(1);
      if (agentResult.length > 0) {
        assignedAgent = agentResult[0];
      }
    }
    
    const clientApprovals = await db.select().from(approvals).where(eq(approvals.clientId, client.id));
    const clientTasks = await db.select().from(tasks).where(eq(tasks.clientId, client.id));
    
    return {
      ...client,
      assignedAgent,
      approvals: clientApprovals,
      tasks: clientTasks,
    };
  }

  async createClient(client: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(client).returning();
    return result[0];
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const result = await db.update(clients).set(updates).where(eq(clients.id, id)).returning();
    return result[0];
  }

  async getApprovals(clientId?: string): Promise<Approval[]> {
    if (clientId) {
      return await db.select().from(approvals).where(eq(approvals.clientId, clientId));
    }
    return await db.select().from(approvals);
  }

  async getApproval(id: string): Promise<Approval | undefined> {
    const result = await db.select().from(approvals).where(eq(approvals.id, id)).limit(1);
    return result[0];
  }

  async createApproval(approval: InsertApproval): Promise<Approval> {
    const result = await db.insert(approvals).values(approval).returning();
    return result[0];
  }

  async updateApproval(id: string, updates: Partial<InsertApproval>): Promise<Approval | undefined> {
    const result = await db.update(approvals).set({ ...updates, updatedAt: new Date() }).where(eq(approvals.id, id)).returning();
    return result[0];
  }

  async getTasks(agentId?: string, clientId?: string): Promise<TaskWithClient[]> {
    // Build filter conditions
    const conditions = [];
    if (agentId) {
      conditions.push(eq(tasks.assignedAgentId, agentId));
    }
    if (clientId) {
      conditions.push(eq(tasks.clientId, clientId));
    }
    
    // Get base tasks
    const baseTasks = conditions.length > 0
      ? await db.select().from(tasks).where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : await db.select().from(tasks);
    
    // Populate related data
    const tasksWithDetails = await Promise.all(
      baseTasks.map(async (task) => {
        const [clientResult, agentResult] = await Promise.all([
          db.select().from(clients).where(eq(clients.id, task.clientId)).limit(1),
          db.select().from(users).where(eq(users.id, task.assignedAgentId)).limit(1),
        ]);
        
        if (clientResult.length === 0 || agentResult.length === 0) {
          return null;
        }
        
        return {
          ...task,
          client: clientResult[0],
          assignedAgent: agentResult[0],
        };
      })
    );
    
    return tasksWithDetails.filter(Boolean) as TaskWithClient[];
  }

  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async getInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    const result = await db.select().from(inventory).where(eq(inventory.id, id)).limit(1);
    return result[0];
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const result = await db.insert(inventory).values(item).returning();
    return result[0];
  }

  async updateInventoryItem(id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const result = await db.update(inventory).set({ ...updates, updatedAt: new Date() }).where(eq(inventory.id, id)).returning();
    return result[0];
  }

  async getStockRequests(agentId?: string): Promise<StockRequestWithDetails[]> {
    // Get base stock requests
    const baseRequests = agentId 
      ? await db.select().from(stockRequests).where(eq(stockRequests.agentId, agentId))
      : await db.select().from(stockRequests);
    
    // Populate related data
    const requestsWithDetails = await Promise.all(
      baseRequests.map(async (request) => {
        const [agentResult, itemResult] = await Promise.all([
          db.select().from(users).where(eq(users.id, request.agentId)).limit(1),
          db.select().from(inventory).where(eq(inventory.id, request.itemId)).limit(1),
        ]);
        
        if (agentResult.length === 0 || itemResult.length === 0) {
          return null;
        }
        
        let approvedByUser = undefined;
        if (request.approvedBy) {
          const approvedByResult = await db.select().from(users).where(eq(users.id, request.approvedBy)).limit(1);
          approvedByUser = approvedByResult[0];
        }
        
        return {
          ...request,
          agent: agentResult[0],
          item: itemResult[0],
          approvedByUser,
        };
      })
    );
    
    return requestsWithDetails.filter(Boolean) as StockRequestWithDetails[];
  }

  async getStockRequest(id: string): Promise<StockRequest | undefined> {
    const result = await db.select().from(stockRequests).where(eq(stockRequests.id, id)).limit(1);
    return result[0];
  }

  async createStockRequest(request: InsertStockRequest): Promise<StockRequest> {
    const result = await db.insert(stockRequests).values(request).returning();
    return result[0];
  }

  async updateStockRequest(id: string, updates: Partial<InsertStockRequest>): Promise<StockRequest | undefined> {
    const result = await db.update(stockRequests).set({ ...updates, updatedAt: new Date() }).where(eq(stockRequests.id, id)).returning();
    return result[0];
  }

  async getInvoices(clientId?: string): Promise<InvoiceWithItems[]> {
    const invoiceResults = clientId 
      ? await db.select().from(invoices).where(eq(invoices.clientId, clientId))
      : await db.select().from(invoices);
    
    return await Promise.all(invoiceResults.map(async (invoice) => {
      const clientResult = await db.select().from(clients).where(eq(clients.id, invoice.clientId)).limit(1);
      const itemsResults = await db
        .select({
          id: invoiceItems.id,
          invoiceId: invoiceItems.invoiceId,
          itemId: invoiceItems.itemId,
          quantity: invoiceItems.quantity,
          unitPrice: invoiceItems.unitPrice,
          totalPrice: invoiceItems.totalPrice,
          item: {
            id: inventory.id,
            itemName: inventory.itemName,
            description: inventory.description,
            quantity: inventory.quantity,
            threshold: inventory.threshold,
            unitPrice: inventory.unitPrice,
            updatedAt: inventory.updatedAt,
          },
        })
        .from(invoiceItems)
        .leftJoin(inventory, eq(invoiceItems.itemId, inventory.id))
        .where(eq(invoiceItems.invoiceId, invoice.id));
      
      return {
        ...invoice,
        client: clientResult[0],
        items: itemsResults.map(item => ({
          id: item.id,
          invoiceId: item.invoiceId,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          item: item.item && item.item.id ? {
            id: item.item.id,
            itemName: item.item.itemName!,
            description: item.item.description,
            quantity: item.item.quantity!,
            threshold: item.item.threshold!,
            unitPrice: item.item.unitPrice,
            updatedAt: item.item.updatedAt!,
          } : undefined!,
        })),
      };
    }));
  }

  async getInvoice(id: string): Promise<InvoiceWithItems | undefined> {
    const invoiceResult = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (invoiceResult.length === 0) return undefined;
    
    const invoice = invoiceResult[0];
    const clientResult = await db.select().from(clients).where(eq(clients.id, invoice.clientId)).limit(1);
    if (clientResult.length === 0) return undefined;
    
    const itemsResults = await db
      .select({
        id: invoiceItems.id,
        invoiceId: invoiceItems.invoiceId,
        itemId: invoiceItems.itemId,
        quantity: invoiceItems.quantity,
        unitPrice: invoiceItems.unitPrice,
        totalPrice: invoiceItems.totalPrice,
        item: {
          id: inventory.id,
          itemName: inventory.itemName,
          description: inventory.description,
          quantity: inventory.quantity,
          threshold: inventory.threshold,
          unitPrice: inventory.unitPrice,
          updatedAt: inventory.updatedAt,
        },
      })
      .from(invoiceItems)
      .leftJoin(inventory, eq(invoiceItems.itemId, inventory.id))
      .where(eq(invoiceItems.invoiceId, invoice.id));

    return {
      ...invoice,
      client: clientResult[0],
      items: itemsResults.map(item => ({
        id: item.id,
        invoiceId: item.invoiceId,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        item: item.item && item.item.id ? {
          id: item.item.id,
          itemName: item.item.itemName!,
          description: item.item.description,
          quantity: item.item.quantity!,
          threshold: item.item.threshold!,
          unitPrice: item.item.unitPrice,
          updatedAt: item.item.updatedAt!,
        } : undefined!,
      })),
    };
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const result = await db.insert(invoices).values(invoice).returning();
    return result[0];
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const result = await db.insert(invoiceItems).values(item).returning();
    return result[0];
  }

  async getDashboardMetrics(userId: string, userRole: string): Promise<DashboardMetrics> {
    const clients = await this.getClients(userRole === 'agent' ? userId : undefined);
    const tasks = await this.getTasks(userRole === 'agent' ? userId : undefined);
    const approvals = await this.getApprovals();
    const inventory = await this.getInventory();
    const invoices = await this.getInvoices();

    // Calculate metrics
    const totalClients = clients.length;
    const activeProjects = clients.filter(c => c.projectStatus === 'in-progress').length;
    const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
    
    const currentMonth = new Date().getMonth();
    const monthlyRevenue = invoices
      .filter(i => i.createdAt.getMonth() === currentMonth && i.status === 'paid')
      .reduce((sum, i) => sum + parseFloat(i.totalAmount), 0);

    // Approval pipeline stats
    const approvalSteps = ['application', 'verification', 'inspection', 'noc', 'clearance'];
    const approvalPipeline = approvalSteps.map(step => {
      const count = approvals.filter(a => a.step === step).length;
      return {
        step,
        count,
        percentage: totalClients > 0 ? Math.round((count / totalClients) * 100) : 0,
      };
    });

    // Low stock items
    const lowStockItems = inventory
      .filter(item => item.quantity <= item.threshold)
      .map(item => ({ ...item, isLow: true }));

    // Recent clients (last 5)
    const recentClients = clients
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // Pending tasks
    const pendingTasks = tasks
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        if (!a.dueDate || !b.dueDate) return 0;
        return a.dueDate.getTime() - b.dueDate.getTime();
      })
      .slice(0, 10);

    return {
      totalClients,
      activeProjects,
      pendingApprovals,
      monthlyRevenue: `₹${(monthlyRevenue / 100000).toFixed(1)}L`,
      approvalPipeline,
      lowStockItems,
      recentClients,
      pendingTasks,
    };
  }
}

export const storage = new DatabaseStorage();
