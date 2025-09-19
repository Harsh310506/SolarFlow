import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userRole = req.headers['user-role'] as string;
  const userId = req.headers['user-id'] as string;

  if (req.method === 'GET') {
    try {
      const agentId = userRole === 'agent' ? userId : undefined;
      const clients = await storage.getClients(agentId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch clients' });
    }
  } else if (req.method === 'POST') {
    try {
      const clientData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: 'Invalid client data' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
