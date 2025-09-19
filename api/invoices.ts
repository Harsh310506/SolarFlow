import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const clientId = req.query.clientId as string;
      const invoices = await storage.getInvoices(clientId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch invoices' });
    }
  } else if (req.method === 'POST') {
    try {
      const invoiceData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(400).json({ message: 'Invalid invoice data' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
