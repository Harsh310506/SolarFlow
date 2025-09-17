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
  type DashboardMetrics
} from "@shared/schema";
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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private clients: Map<string, Client> = new Map();
  private approvals: Map<string, Approval> = new Map();
  private tasks: Map<string, Task> = new Map();
  private inventory: Map<string, Inventory> = new Map();
  private stockRequests: Map<string, StockRequest> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private invoiceItems: Map<string, InvoiceItem> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      name: "John Smith",
      email: "admin@solarflow.com",
      password: "password123",
      role: "admin",
      createdAt: new Date(),
    });

    // Create sample agents
    const agent1Id = randomUUID();
    const agent2Id = randomUUID();
    
    this.users.set(agent1Id, {
      id: agent1Id,
      name: "Priya Singh",
      email: "priya@solarflow.com",
      password: "password123",
      role: "agent",
      createdAt: new Date(),
    });

    this.users.set(agent2Id, {
      id: agent2Id,
      name: "Rohit Sharma",
      email: "rohit@solarflow.com",
      password: "password123",
      role: "agent",
      createdAt: new Date(),
    });

    // Initialize sample inventory
    const solarPanelId = randomUUID();
    const inverterId = randomUUID();
    const batteryId = randomUUID();

    this.inventory.set(solarPanelId, {
      id: solarPanelId,
      itemName: "Solar Panel (320W)",
      description: "High efficiency monocrystalline solar panel",
      quantity: 25,
      threshold: 50,
      unitPrice: "15000.00",
      updatedAt: new Date(),
    });

    this.inventory.set(inverterId, {
      id: inverterId,
      itemName: "Inverter (5KW)",
      description: "Grid-tie solar inverter",
      quantity: 8,
      threshold: 15,
      unitPrice: "45000.00",
      updatedAt: new Date(),
    });

    this.inventory.set(batteryId, {
      id: batteryId,
      itemName: "Lithium Battery (100Ah)",
      description: "Deep cycle lithium ion battery",
      quantity: 12,
      threshold: 20,
      unitPrice: "25000.00",
      updatedAt: new Date(),
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getClients(agentId?: string): Promise<ClientWithAgent[]> {
    let clientList = Array.from(this.clients.values());
    
    if (agentId) {
      clientList = clientList.filter(client => client.assignedAgentId === agentId);
    }

    return clientList.map(client => ({
      ...client,
      assignedAgent: client.assignedAgentId ? this.users.get(client.assignedAgentId) : undefined,
      approvals: Array.from(this.approvals.values()).filter(approval => approval.clientId === client.id),
      tasks: Array.from(this.tasks.values()).filter(task => task.clientId === client.id),
    }));
  }

  async getClient(id: string): Promise<ClientWithAgent | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    return {
      ...client,
      assignedAgent: client.assignedAgentId ? this.users.get(client.assignedAgentId) : undefined,
      approvals: Array.from(this.approvals.values()).filter(approval => approval.clientId === client.id),
      tasks: Array.from(this.tasks.values()).filter(task => task.clientId === client.id),
    };
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = randomUUID();
    const newClient: Client = { 
      ...client, 
      id, 
      createdAt: new Date() 
    };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...updates };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async getApprovals(clientId?: string): Promise<Approval[]> {
    let approvalList = Array.from(this.approvals.values());
    
    if (clientId) {
      approvalList = approvalList.filter(approval => approval.clientId === clientId);
    }

    return approvalList;
  }

  async getApproval(id: string): Promise<Approval | undefined> {
    return this.approvals.get(id);
  }

  async createApproval(approval: InsertApproval): Promise<Approval> {
    const id = randomUUID();
    const newApproval: Approval = { 
      ...approval, 
      id, 
      updatedAt: new Date() 
    };
    this.approvals.set(id, newApproval);
    return newApproval;
  }

  async updateApproval(id: string, updates: Partial<InsertApproval>): Promise<Approval | undefined> {
    const approval = this.approvals.get(id);
    if (!approval) return undefined;
    
    const updatedApproval = { ...approval, ...updates, updatedAt: new Date() };
    this.approvals.set(id, updatedApproval);
    return updatedApproval;
  }

  async getTasks(agentId?: string, clientId?: string): Promise<TaskWithClient[]> {
    let taskList = Array.from(this.tasks.values());
    
    if (agentId) {
      taskList = taskList.filter(task => task.assignedAgentId === agentId);
    }
    
    if (clientId) {
      taskList = taskList.filter(task => task.clientId === clientId);
    }

    return taskList.map(task => {
      const client = this.clients.get(task.clientId);
      const agent = this.users.get(task.assignedAgentId);
      
      return {
        ...task,
        client: client!,
        assignedAgent: agent!,
      };
    }).filter(task => task.client && task.assignedAgent);
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = randomUUID();
    const newTask: Task = { 
      ...task, 
      id, 
      createdAt: new Date() 
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async getInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const id = randomUUID();
    const newItem: Inventory = { 
      ...item, 
      id, 
      updatedAt: new Date() 
    };
    this.inventory.set(id, newItem);
    return newItem;
  }

  async updateInventoryItem(id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const item = this.inventory.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates, updatedAt: new Date() };
    this.inventory.set(id, updatedItem);
    return updatedItem;
  }

  async getStockRequests(agentId?: string): Promise<StockRequestWithDetails[]> {
    let requestList = Array.from(this.stockRequests.values());
    
    if (agentId) {
      requestList = requestList.filter(request => request.agentId === agentId);
    }

    return requestList.map(request => {
      const agent = this.users.get(request.agentId);
      const item = this.inventory.get(request.itemId);
      const approvedByUser = request.approvedBy ? this.users.get(request.approvedBy) : undefined;
      
      return {
        ...request,
        agent: agent!,
        item: item!,
        approvedByUser,
      };
    }).filter(request => request.agent && request.item);
  }

  async getStockRequest(id: string): Promise<StockRequest | undefined> {
    return this.stockRequests.get(id);
  }

  async createStockRequest(request: InsertStockRequest): Promise<StockRequest> {
    const id = randomUUID();
    const newRequest: StockRequest = { 
      ...request, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.stockRequests.set(id, newRequest);
    return newRequest;
  }

  async updateStockRequest(id: string, updates: Partial<InsertStockRequest>): Promise<StockRequest | undefined> {
    const request = this.stockRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates, updatedAt: new Date() };
    this.stockRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getInvoices(clientId?: string): Promise<InvoiceWithItems[]> {
    let invoiceList = Array.from(this.invoices.values());
    
    if (clientId) {
      invoiceList = invoiceList.filter(invoice => invoice.clientId === clientId);
    }

    return invoiceList.map(invoice => {
      const client = this.clients.get(invoice.clientId);
      const items = Array.from(this.invoiceItems.values())
        .filter(item => item.invoiceId === invoice.id)
        .map(item => ({
          ...item,
          item: this.inventory.get(item.itemId)!,
        }))
        .filter(item => item.item);
      
      return {
        ...invoice,
        client: client!,
        items,
      };
    }).filter(invoice => invoice.client);
  }

  async getInvoice(id: string): Promise<InvoiceWithItems | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const client = this.clients.get(invoice.clientId);
    if (!client) return undefined;

    const items = Array.from(this.invoiceItems.values())
      .filter(item => item.invoiceId === invoice.id)
      .map(item => ({
        ...item,
        item: this.inventory.get(item.itemId)!,
      }))
      .filter(item => item.item);

    return {
      ...invoice,
      client,
      items,
    };
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const newInvoice: Invoice = { 
      ...invoice, 
      id, 
      createdAt: new Date() 
    };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = randomUUID();
    const newItem: InvoiceItem = { ...item, id };
    this.invoiceItems.set(id, newItem);
    return newItem;
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

export const storage = new MemStorage();
