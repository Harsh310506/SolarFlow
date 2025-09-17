import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, integer, decimal, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { drizzle } from "drizzle-orm/neon-http";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'agent']);
export const projectStatusEnum = pgEnum('project_status', ['lead', 'in-progress', 'completed']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'completed', 'overdue']);
export const stockRequestStatusEnum = pgEnum('stock_request_status', ['pending', 'approved', 'denied']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['paid', 'partial', 'pending']);
export const approvalStepEnum = pgEnum('approval_step', ['application', 'verification', 'inspection', 'noc', 'clearance']);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('agent'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Clients table
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  assignedAgentId: uuid("assigned_agent_id").references(() => users.id),
  projectStatus: projectStatusEnum("project_status").default('lead').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Approvals table
export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  step: approvalStepEnum("step").notNull(),
  status: approvalStatusEnum("status").default('pending').notNull(),
  remarks: text("remarks"),
  documentUrl: text("document_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  assignedAgentId: uuid("assigned_agent_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: taskStatusEnum("status").default('pending').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  itemName: text("item_name").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(0),
  threshold: integer("threshold").notNull().default(10),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stock requests table
export const stockRequests = pgTable("stock_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: uuid("agent_id").references(() => users.id).notNull(),
  itemId: uuid("item_id").references(() => inventory.id).notNull(),
  quantityRequested: integer("quantity_requested").notNull(),
  status: stockRequestStatusEnum("status").default('pending').notNull(),
  reason: text("reason"),
  approvedBy: uuid("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).default('0').notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: invoiceStatusEnum("status").default('pending').notNull(),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Invoice items table
export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  itemId: uuid("item_id").references(() => inventory.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertApprovalSchema = createInsertSchema(approvals).omit({ id: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, updatedAt: true });
export const insertStockRequestSchema = createInsertSchema(stockRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Approval = typeof approvals.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertStockRequest = z.infer<typeof insertStockRequestSchema>;
export type StockRequest = typeof stockRequests.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Extended types for API responses
export type ClientWithAgent = Client & {
  assignedAgent?: User;
  approvals?: Approval[];
  tasks?: Task[];
};

export type TaskWithClient = Task & {
  client: Client;
  assignedAgent: User;
};

export type StockRequestWithDetails = StockRequest & {
  agent: User;
  item: Inventory;
  approvedByUser?: User;
};

export type InvoiceWithItems = Invoice & {
  client: Client;
  items: (InvoiceItem & { item: Inventory })[];
};

// Dashboard metrics type
export type DashboardMetrics = {
  totalClients: number;
  activeProjects: number;
  pendingApprovals: number;
  monthlyRevenue: string;
  approvalPipeline: {
    step: string;
    count: number;
    percentage: number;
  }[];
  lowStockItems: (Inventory & { isLow: boolean })[];
  recentClients: ClientWithAgent[];
  pendingTasks: TaskWithClient[];
};

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Schema object for drizzle
export const schema = {
  users,
  clients,
  approvals,
  tasks,
  inventory,
  stockRequests,
  invoices,
  invoiceItems,
};
